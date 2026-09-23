import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  BrainCircuit, 
  RotateCcw,
  Calendar,
  Play,
  Check,
  AlertCircle,
  Database,
  Sliders,
  Flame,
  Target,
  BookOpen,
  Zap,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Filter,
  Layers,
  Award
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  normalizeGradeKey, 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OfficialClassGrade,
  OfficialSubject 
} from '../../../data/officialSyllabusData';
import { 
  StudyPlanDoc, 
  StudentProfileData,
  HomeworkDoc,
  CalendarEventDoc,
  LessonDoc,
  ChapterProgressRecord,
  subscribeToStudyPlans, 
  toggleStudyPlanItem, 
  addStudyPlanItem, 
  updateStudyPlanItem, 
  deleteStudyPlanItem,
  subscribeToStudentProfile,
  subscribeToHomework,
  subscribeToCalendarEvents,
  subscribeToLessons,
  subscribeToChapterProgress,
  generateAndSaveStudyPlan
} from '../../../services/studentFirestoreService';

interface StudyPlannerViewProps {
  userId?: string;
  studentClassGrade?: string;
  onStartLesson?: (subject: string, chapter: string, lessonId?: string) => void;
  onNavigateTab?: (tab: string) => void;
  onLaunchExam?: () => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  userId = 'std_101',
  studentClassGrade = 'Class 5',
  onStartLesson,
  onNavigateTab,
  onLaunchExam
}) => {
  const activeGradeKey: OfficialClassGrade = normalizeGradeKey(studentClassGrade);
  
  // Real-time Firestore States
  const [tasks, setTasks] = useState<StudyPlanDoc[]>([]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [homeworks, setHomeworks] = useState<HomeworkDoc[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDoc[]>([]);
  const [chapterProgress, setChapterProgress] = useState<Record<string, ChapterProgressRecord>>({});

  // Dynamic official syllabus subjects for this grade
  const officialSubjects: OfficialSubject[] = useMemo(() => {
    return OFFICIAL_SYLLABUS_BY_CLASS[activeGradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'];
  }, [activeGradeKey]);

  const subjectNamesList = useMemo(() => {
    return officialSubjects.map(s => s.name);
  }, [officialSubjects]);

  // Configuration Panel State
  const [examDate, setExamDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [goal, setGoal] = useState<'balanced' | 'weak_focus' | 'exam_revision' | 'homework_first'>('balanced');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'lessons' | 'practice' | 'homework'>('all');

  // Generation / Loading States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reschedule Modal State
  const [rescheduleItem, setRescheduleItem] = useState<StudyPlanDoc | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState<string>('05:30 PM');

  // Manual Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState<string>('');
  const [newTaskChapter, setNewTaskChapter] = useState<string>('');
  const [newTaskLesson, setNewTaskLesson] = useState<string>('Core Concepts');
  const [newTaskTime, setNewTaskTime] = useState('05:00 PM');
  const [newTaskDuration, setNewTaskDuration] = useState(25);
  const [newTaskType, setNewTaskType] = useState<StudyPlanDoc['type']>('Core Concept');

  // Initialize default subjects when official subjects load
  useEffect(() => {
    if (subjectNamesList.length > 0) {
      if (selectedSubjects.length === 0) {
        setSelectedSubjects(subjectNamesList);
      }
      if (!newTaskSubject) {
        setNewTaskSubject(subjectNamesList[0]);
      }
    }
  }, [subjectNamesList]);

  // Set default chapters when selected subject changes for add form
  const availableChaptersForNewTask = useMemo(() => {
    const foundSubj = officialSubjects.find(s => s.name === newTaskSubject);
    return foundSubj ? foundSubj.chapters : [];
  }, [officialSubjects, newTaskSubject]);

  useEffect(() => {
    if (availableChaptersForNewTask.length > 0) {
      setNewTaskChapter(availableChaptersForNewTask[0].title);
    }
  }, [availableChaptersForNewTask]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubPlans = subscribeToStudyPlans(userId, (data) => setTasks(data));
    const unsubProf = subscribeToStudentProfile(userId, (p) => {
      setProfile(p);
      if (p?.boardExamDate) setExamDate(p.boardExamDate);
      if (p?.dailyStudyHours) setDailyHours(p.dailyStudyHours);
      if (p?.weakSubjects) {
        const weaks = p.weakSubjects.split(',').map(s => s.trim()).filter(Boolean);
        if (weaks.length > 0) setWeakSubjects(weaks);
      }
    });
    const unsubHw = subscribeToHomework(userId, (hws) => setHomeworks(hws));
    const unsubCal = subscribeToCalendarEvents(userId, (evts) => setCalendarEvents(evts));
    const unsubProg = subscribeToChapterProgress(userId, (prog) => setChapterProgress(prog));

    return () => {
      unsubPlans();
      unsubProf();
      unsubHw();
      unsubCal();
      unsubProg();
    };
  }, [userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSubjectSelection = (subj: string) => {
    soundFx.playClick();
    const current = selectedSubjects || [];
    if (current.includes(subj)) {
      if (current.length > 1) {
        setSelectedSubjects(current.filter(s => s !== subj));
      }
    } else {
      setSelectedSubjects([...current, subj]);
    }
  };

  const toggleWeakSubjectSelection = (subj: string) => {
    soundFx.playCheck();
    const current = weakSubjects || [];
    if (current.includes(subj)) {
      setWeakSubjects(current.filter(s => s !== subj));
    } else {
      setWeakSubjects([...current, subj]);
    }
  };

  const handleToggleComplete = async (plan: StudyPlanDoc) => {
    soundFx.playCheck();
    const nextCompleted = !plan.completed;
    await toggleStudyPlanItem(userId, plan.id, plan.completed);
    if (nextCompleted) {
      showToast(`+${plan.xpReward || 25} XP Earned! Great progress! 🌟`);
    }
  };

  const handleSkipTask = async (planId: string) => {
    soundFx.playPop();
    await updateStudyPlanItem(userId, planId, { status: 'skipped' });
    showToast('Task moved to skipped.');
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleItem) return;
    soundFx.playClick();
    await updateStudyPlanItem(userId, rescheduleItem.id, { 
      timeSlot: newTimeSlot,
      status: 'rescheduled'
    });
    setRescheduleItem(null);
    showToast(`Rescheduled to ${newTimeSlot}`);
  };

  const handleDelete = async (planId: string) => {
    soundFx.playPop();
    await deleteStudyPlanItem(userId, planId);
    showToast('Task removed from schedule');
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    soundFx.playClick();

    await addStudyPlanItem(userId, {
      title: newTaskTitle,
      subject: newTaskSubject || subjectNamesList[0] || 'Mathematics',
      chapterName: newTaskChapter || 'General Unit',
      lessonName: newTaskLesson || 'Lesson 1',
      timeSlot: newTaskTime || '05:00 PM',
      estMinutes: Number(newTaskDuration) || 25,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      type: newTaskType,
      priority: 'High',
      reasoning: 'Custom schedule task added by student',
      status: 'active',
      classGrade: activeGradeKey,
      actionType: newTaskType === 'Practice Drill' ? 'practice' : newTaskType === 'Homework' ? 'homework' : 'lesson',
      xpReward: 25
    });

    setNewTaskTitle('');
    setShowAddForm(false);
    showToast('Custom task added to your daily plan!');
  };

  // Generate personalized study plan based on real student data
  const handleGeneratePlan = async (customOptions?: { 
    hours?: number; 
    customGoal?: 'balanced' | 'weak_focus' | 'exam_revision' | 'homework_first';
    customWeak?: string[];
  }) => {
    soundFx.playSuccess();
    setIsGenerating(true);
    setGenerationError(null);

    const steps = [
      `Reading official ${activeGradeKey} SCERT curriculum chapters...`,
      'Checking your completed lessons and pending homework in Firestore...',
      'Analyzing practice quiz scores and detecting weak focus areas...',
      'Synthesizing personalized daily timetable with active deep links...',
      'Saving schedule to Firestore and syncing with your dashboard...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise((r) => setTimeout(r, 280));
    }

    try {
      const hoursToUse = customOptions?.hours !== undefined ? customOptions.hours : dailyHours;
      const goalToUse = customOptions?.customGoal || goal;
      const weakToUse = customOptions?.customWeak || weakSubjects;

      await generateAndSaveStudyPlan(userId, {
        examDate,
        dailyHours: hoursToUse,
        selectedSubjects: selectedSubjects.length > 0 ? selectedSubjects : subjectNamesList,
        weakSubjects: weakToUse,
        classGrade: activeGradeKey,
        goal: goalToUse
      });
      setShowConfigPanel(false);
      showToast(`Personalized ${activeGradeKey} plan ready!`);
    } catch (err) {
      console.error(err);
      setGenerationError("Failed to generate plan. Please verify your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Execute deep-linked action
  const handleExecuteTaskAction = (task: StudyPlanDoc) => {
    soundFx.playClick();
    if (task.actionType === 'homework') {
      if (onNavigateTab) {
        onNavigateTab('homework');
      } else {
        showToast(`Opening Homework for ${task.subject}`);
      }
      return;
    }
    if (task.actionType === 'practice') {
      if (onNavigateTab) {
        onNavigateTab('practice');
      } else {
        showToast(`Launching Practice drills for ${task.subject}`);
      }
      return;
    }
    if (task.actionType === 'mock_test') {
      if (onLaunchExam) {
        onLaunchExam();
      } else if (onNavigateTab) {
        onNavigateTab('mock_tests');
      }
      return;
    }
    if (task.actionType === 'library') {
      if (onNavigateTab) {
        onNavigateTab('library');
      }
      return;
    }

    // Default: Lesson action
    if (onStartLesson) {
      onStartLesson(task.subject, task.chapterName || '', task.lessonId);
    } else if (onNavigateTab) {
      onNavigateTab('syllabus');
    } else {
      showToast(`Starting lesson: ${task.title}`);
    }
  };

  // Metrics
  const activeTasks = tasks.filter(t => t.status !== 'skipped');
  const pendingTasks = activeTasks.filter(t => !t.completed);
  const completedTasks = activeTasks.filter(t => t.completed);
  const totalMins = activeTasks.reduce((acc, t) => acc + (t.estMinutes || 25), 0);
  const completedMins = completedTasks.reduce((acc, t) => acc + (t.estMinutes || 25), 0);
  const completionPct = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;
  const totalXpAvailable = activeTasks.reduce((acc, t) => acc + (t.xpReward || 25), 0);
  const earnedXp = completedTasks.reduce((acc, t) => acc + (t.xpReward || 25), 0);

  // Filtered tasks
  const filteredTasks = activeTasks.filter((task) => {
    if (activeFilter === 'pending') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    if (activeFilter === 'lessons') return task.actionType === 'lesson' || task.type === 'Core Concept';
    if (activeFilter === 'practice') return task.actionType === 'practice' || task.actionType === 'mock_test' || task.type === 'Practice Drill' || task.type === 'Mock Test';
    if (activeFilter === 'homework') return task.actionType === 'homework' || task.type === 'Homework';
    return true;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans max-w-7xl mx-auto pb-16">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-950 text-emerald-300 border border-emerald-500/40 shadow-2xl text-xs font-black flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>Real-time Personalized Learning Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{activeGradeKey} Personalized Study Plan</h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            Data-driven schedule generated from the official {activeGradeKey} syllabus, your pending homework assignments, and real quiz mastery levels in Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs backdrop-blur transition flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <Sliders className="w-4 h-4" />
            <span>{showConfigPanel ? 'Hide Plan Settings' : 'Customize Goals'}</span>
          </button>

          <button
            onClick={() => handleGeneratePlan()}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{isGenerating ? 'Analyzing & Building...' : 'Generate New Plan'}</span>
          </button>
        </div>
      </div>

      {/* QUICK FEEDBACK / ONE-CLICK RE-PLANNING BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Plan Tuning:</span>
        </span>
        <button
          onClick={() => handleGeneratePlan({ hours: 1 })}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 font-bold transition whitespace-nowrap cursor-pointer"
        >
          ⚡ 1-Hour Express Plan
        </button>
        <button
          onClick={() => handleGeneratePlan({ customGoal: 'homework_first' })}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 font-bold transition whitespace-nowrap cursor-pointer"
        >
          📝 Prioritize Pending Homework
        </button>
        <button
          onClick={() => handleGeneratePlan({ customGoal: 'weak_focus', customWeak: ['Mathematics'] })}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 font-bold transition whitespace-nowrap cursor-pointer"
        >
          📐 Math Focus Boost
        </button>
        <button
          onClick={() => handleGeneratePlan({ customGoal: 'exam_revision' })}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 font-bold transition whitespace-nowrap cursor-pointer"
        >
          🎯 Mock Assessment Prep
        </button>
      </div>

      {/* DYNAMIC CONFIGURATION & SETUP PANEL */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Personalize Your Study Strategy
                </h3>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
                {activeGradeKey} SCERT Curriculum
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Hours */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Available Daily Study Time:</span>
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Hour / Day (Light & Quick)</option>
                  <option value={2}>2 Hours / Day (Recommended for Class 5)</option>
                  <option value={3}>3 Hours / Day (Comprehensive Prep)</option>
                  <option value={4}>4 Hours / Day (Intensive Revision)</option>
                </select>
              </div>

              {/* Study Goal Style */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>Study Goal & Focus Mode:</span>
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="balanced">Balanced Syllabus Rotation</option>
                  <option value="weak_focus">Strengthen Weak Subject Areas</option>
                  <option value="homework_first">Homework & Worksheets Priority</option>
                  <option value="exam_revision">Unit Assessment & Exam Revision</option>
                </select>
              </div>

              {/* Exam Target Date */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Target Exam / Term Assessment Date:</span>
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Official Subject Multi-Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Selected {activeGradeKey} Subjects to Include:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {officialSubjects.map((subj) => {
                  const isSel = (selectedSubjects || []).includes(subj.name);
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => toggleSubjectSelection(subj.name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{subj.name}</span>
                      {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weak Subjects Focus Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Select Weak Subjects (Will receive 1.5x drill sessions & priority lessons):</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {officialSubjects.map((subj) => {
                  const isWeak = (weakSubjects || []).includes(subj.name);
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => toggleWeakSubjectSelection(subj.name)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-1.5 ${
                        isWeak
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{subj.name}</span>
                      {isWeak && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black">Needs Focus</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleGeneratePlan()}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Strategy & Generate Plan</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI GENERATION STATUS SPINNER */}
      {isGenerating && (
        <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center space-y-3 shadow-inner">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="font-black text-sm text-blue-900 dark:text-blue-200">{generationStep}</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">Matching your exact curriculum & homework state</p>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Today's Study Goal</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{dailyHours} Hours Target</div>
          <p className="text-[11px] text-slate-400 font-medium">Exam Date: {examDate || 'Term End'}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Remaining Work</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingTasks.length} Tasks</div>
          <p className="text-[11px] text-slate-400 font-medium">{totalMins - completedMins} Mins Remaining</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Tasks Finished</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedTasks.length} Done</div>
          <p className="text-[11px] text-slate-400 font-medium">Earned +{earnedXp} / {totalXpAvailable} XP</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-purple-500 tracking-wider">Schedule Completion</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{completionPct}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPct}%` }} 
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS & ADD CUSTOM TASK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Tasks (${activeTasks.length})` },
            { id: 'pending', label: `Pending (${pendingTasks.length})` },
            { id: 'completed', label: `Completed (${completedTasks.length})` },
            { id: 'lessons', label: 'Lessons' },
            { id: 'practice', label: 'Practice & Tests' },
            { id: 'homework', label: 'Homework' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveFilter(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center border border-slate-200 dark:border-slate-700"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Add Form' : 'Add Custom Task'}</span>
        </button>
      </div>

      {/* MANUAL ADD CUSTOM TASK FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddTask}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Add Custom Task to {activeGradeKey} Timetable</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Task Title */}
              <div className="lg:col-span-2">
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Task Description / Topic</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Solve The Fish Tale Exercise 1.2 Q1 to Q5..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Subject</label>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {subjectNamesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Chapter Dropdown (Filtered dynamically) */}
              <div>
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Chapter</label>
                <select
                  value={newTaskChapter}
                  onChange={(e) => setNewTaskChapter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {availableChaptersForNewTask.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                  {availableChaptersForNewTask.length === 0 && <option value="General Chapter">General Chapter</option>}
                </select>
              </div>

              {/* Time Slot */}
              <div>
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Time Slot</label>
                <input
                  type="text"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  placeholder="e.g. 05:30 PM"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Duration</label>
                <select
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={25}>25 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              {/* Task Type */}
              <div className="lg:col-span-2">
                <label className="text-[11px] font-black text-slate-500 mb-1 block">Task Category</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="Core Concept">Core Concept & Lesson Reading</option>
                  <option value="Practice Drill">Practice Drill & Questions</option>
                  <option value="Homework">Homework & Assignment</option>
                  <option value="Mock Test">Mock Test / Assessment</option>
                  <option value="Revision">Revision & Summary Notes</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Plan</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* TODAY'S SCHEDULE TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Today's Study Schedule Tasks</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'} Listed
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                {tasks.length === 0 ? `No study plan created yet for ${activeGradeKey}.` : 'No tasks in this filter view.'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tasks.length === 0 
                  ? 'Click below to generate your personalized study plan. The system will inspect your syllabus, pending homework, and weak areas in Firestore to build a custom daily timetable.'
                  : 'Switch filter tabs above or click Generate New Plan to refresh.'}
              </p>
            </div>
            {tasks.length === 0 && (
              <button
                onClick={() => handleGeneratePlan()}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate My Personalized Study Plan</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isSkipped = task.status === 'skipped';
              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    task.completed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                      : isSkipped
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-400'
                  }`}
                >
                  {/* Left Metadata & Checkbox */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition cursor-pointer mt-1 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-black text-[11px]">
                          {task.timeSlot || '05:00 PM'}
                        </span>
                        
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[10px]">
                          {task.subject}
                        </span>

                        {task.type && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            task.type === 'Homework'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : task.type === 'Mock Test'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : task.type === 'Practice Drill'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {task.type}
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-slate-400">
                          {task.estMinutes || 25} Mins • +{task.xpReward || 25} XP
                        </span>
                      </div>

                      <h4 className={`font-black text-base ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </h4>

                      {task.chapterName && (
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {task.chapterName} {task.lessonName ? `• ${task.lessonName}` : ''}
                        </p>
                      )}

                      {task.reasoning && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{task.reasoning}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Deep Links */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Launch Action */}
                    {!task.completed && (
                      <button
                        onClick={() => handleExecuteTaskAction(task)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {task.actionType === 'homework' ? (
                          <>
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Do Homework</span>
                          </>
                        ) : task.actionType === 'practice' ? (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Practice Set</span>
                          </>
                        ) : task.actionType === 'mock_test' ? (
                          <>
                            <Target className="w-3.5 h-3.5" />
                            <span>Take Test</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Lesson</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Reschedule */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setRescheduleItem(task);
                        setNewTimeSlot(task.timeSlot || '05:30 PM');
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                      title="Reschedule session"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Reschedule</span>
                    </button>

                    {/* Skip */}
                    <button
                      onClick={() => handleSkipTask(task.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition cursor-pointer text-xs font-bold"
                      title="Skip task"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Reschedule Study Session</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{rescheduleItem.title}</p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Select New Time Slot:</label>
              <input
                type="text"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                placeholder="e.g. 06:30 PM or Tomorrow Morning"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRescheduleItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md"
              >
                Save New Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATABASE SYNC INDICATOR */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Firestore Document Path: students/{userId}/studyPlans</span>
        </span>
        <span className="font-bold text-emerald-600 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Live Sync Active</span>
        </span>
      </div>
    </div>
  );
};
