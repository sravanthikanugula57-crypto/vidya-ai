import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Bookmark, 
  Zap, 
  Target, 
  Download, 
  Flame, 
  ArrowRight, 
  Bot, 
  CheckSquare, 
  Video, 
  Award, 
  Calendar, 
  RotateCcw,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  FolderTree,
  AlertCircle,
  GraduationCap,
  Calculator,
  Globe,
  Cpu,
  Check,
  Compass,
  BarChart2,
  ListFilter,
  Eye
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OfficialSubject, 
  OfficialChapter, 
  OfficialLesson, 
  normalizeGradeKey 
} from '../../../data/officialSyllabusData';
import { 
  subscribeToStudentLessonProgress, 
  setLessonCompletionInFirestore, 
  LessonProgressDoc 
} from '../../../services/studentProgressService';
import { 
  subscribeToStudentPracticeAttempts, 
  PracticeAttemptDoc
} from '../../../services/practiceService';
import { 
  subscribeToStudentMockAttempts, 
  seedClass5MockTestsIfEmpty 
} from '../../../services/mockTestService';
import { MockAttempt } from '../../../types/mockTest';
import { 
  subscribeToHomeworks, 
  Homework 
} from '../../../services/homeworkService';
import { 
  subscribeToStudentProfile, 
  subscribeToHomeworkSubmissions, 
  subscribeToActivityLogs, 
  subscribeToContinueLearning, 
  ActivityDoc, 
  StudentProfileData, 
  HomeworkSubmissionDoc, 
  ContinueLearningDoc 
} from '../../../services/studentFirestoreService';
import { seedClass5SyllabusIfEmpty } from '../../../services/classSyllabusService';
import { Class5LessonViewModal } from './Class5LessonViewModal';
import { Class5SubjectExplorerModal } from './Class5SubjectExplorerModal';

interface MyLearningViewProps {
  userId: string;
  onNavigateTab: (tab: string) => void;
  onLaunchTutor?: (subjectName?: string, chapterTitle?: string) => void;
  onLaunchLesson?: (lessonId?: string) => void;
  studentClassGrade?: string;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  userId,
  onNavigateTab,
  onLaunchTutor,
  onLaunchLesson,
  studentClassGrade = 'Class 5'
}) => {
  // ----------------------------------------------------
  // REAL-TIME FIRESTORE DATA STATES
  // ----------------------------------------------------
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressDoc>>({});
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttemptDoc[]>([]);
  const [mockAttempts, setMockAttempts] = useState<MockAttempt[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmissionDoc[]>([]);
  const [activities, setActivities] = useState<ActivityDoc[]>([]);
  const [continueDoc, setContinueDoc] = useState<ContinueLearningDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ----------------------------------------------------
  // UI & FILTER STATES
  // ----------------------------------------------------
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [selectedSubjectForExplorer, setSelectedSubjectForExplorer] = useState<OfficialSubject | null>(null);
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    chapterNumber: number;
    initialLessonId?: string;
  } | null>(null);

  const activeGrade = normalizeGradeKey(studentClassGrade || profile?.grade || (profile as any)?.class || 'Class 5');

  // Official Subjects List for activeGrade
  const class5Subjects: OfficialSubject[] = useMemo(() => {
    return OFFICIAL_SYLLABUS_BY_CLASS[activeGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'] || [];
  }, [activeGrade]);

  // ----------------------------------------------------
  // SEED & SUBSCRIBE TO FIRESTORE DATA
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    // Seed collections if empty
    seedClass5SyllabusIfEmpty().catch(err => console.warn('Class syllabus check:', err));
    seedClass5MockTestsIfEmpty().catch(err => console.warn('Mock tests check:', err));

    // 1. Profile subscription
    const unsubProfile = subscribeToStudentProfile(userId, (p) => {
      if (isMounted) setProfile(p);
    });

    // 2. Lesson Progress subscription
    const unsubProgress = subscribeToStudentLessonProgress(userId, (progMap) => {
      if (isMounted) {
        setLessonProgressMap(progMap || {});
        setLoading(false);
      }
    });

    // 3. Practice Attempts subscription
    const unsubPractice = subscribeToStudentPracticeAttempts(userId, activeGrade, (attempts) => {
      if (isMounted) setPracticeAttempts(attempts || []);
    });

    // 4. Mock Test Attempts subscription
    const unsubMock = subscribeToStudentMockAttempts(userId, activeGrade, (mAttempts) => {
      if (isMounted) setMockAttempts(mAttempts || []);
    });

    // 5. Homework subscription
    const unsubHomework = subscribeToHomeworks(activeGrade, (hws) => {
      if (isMounted) setHomeworkList(hws || []);
    });

    // 6. Homework Submissions subscription
    const unsubSubmissions = subscribeToHomeworkSubmissions(userId, (subs) => {
      if (isMounted) setHomeworkSubmissions(subs || []);
    });

    // 7. Activity Logs subscription
    const unsubActivity = subscribeToActivityLogs(userId, (actList) => {
      if (isMounted) setActivities(actList || []);
    });

    // 8. Continue Learning doc subscription
    const unsubContinue = subscribeToContinueLearning(userId, (cDoc) => {
      if (isMounted) setContinueDoc(cDoc);
    });

    return () => {
      isMounted = false;
      unsubProfile();
      unsubProgress();
      unsubPractice();
      unsubMock();
      unsubHomework();
      unsubSubmissions();
      unsubActivity();
      unsubContinue();
    };
  }, [userId, activeGrade]);

  // ----------------------------------------------------
  // COMPUTED PROGRESS & METRICS (CLASS 5 ONLY)
  // ----------------------------------------------------
  const metrics = useMemo(() => {
    let totalLessonsCount = 0;
    let totalChaptersCount = 0;
    const subjectStats: Record<string, { totalLessons: number; completedLessons: number; totalChapters: number }> = {};

    class5Subjects.forEach((sub) => {
      let subLessons = 0;
      let subCompleted = 0;
      totalChaptersCount += sub.chapters?.length || 0;

      sub.chapters?.forEach((chap) => {
        const lessons = chap.lessons || [];
        subLessons += lessons.length;
        lessons.forEach((les) => {
          if (lessonProgressMap[les.id]?.completed) {
            subCompleted++;
          }
        });
      });

      totalLessonsCount += subLessons;
      subjectStats[sub.id] = {
        totalLessons: subLessons,
        completedLessons: subCompleted,
        totalChapters: sub.chapters?.length || 0
      };
    });

    const totalCompletedLessons = Object.values(subjectStats).reduce((acc, s) => acc + s.completedLessons, 0);
    const overallProgressPercent = totalLessonsCount > 0 
      ? Math.min(100, Math.round((totalCompletedLessons / totalLessonsCount) * 100))
      : 0;

    // Practice average score
    const avgPracticeScore = practiceAttempts.length > 0
      ? Math.round(practiceAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / practiceAttempts.length)
      : 0;

    return {
      totalLessonsCount,
      totalChaptersCount,
      totalCompletedLessons,
      overallProgressPercent,
      subjectStats,
      avgPracticeScore
    };
  }, [class5Subjects, lessonProgressMap, practiceAttempts]);

  // ----------------------------------------------------
  // ACTIVE LESSON (WHERE DID I STOP?)
  // ----------------------------------------------------
  const activeLesson = useMemo(() => {
    // 1. Check continueLearning doc
    if (continueDoc && continueDoc.subject) {
      const matchedSubject = class5Subjects.find(
        s => s.name.toLowerCase() === continueDoc.subject.toLowerCase() || s.id === continueDoc.subject
      );
      if (matchedSubject) {
        const matchedChap = matchedSubject.chapters.find(
          c => c.title.toLowerCase() === continueDoc.chapterName?.toLowerCase()
        ) || matchedSubject.chapters[0];
        
        const matchedLesson = matchedChap?.lessons[0];
        if (matchedChap && matchedLesson) {
          return {
            subject: matchedSubject,
            chapter: matchedChap,
            lesson: matchedLesson,
            isResume: true
          };
        }
      }
    }

    // 2. Find first incomplete lesson in Class 5 sequence
    for (const sub of class5Subjects) {
      for (const chap of sub.chapters || []) {
        for (const les of chap.lessons || []) {
          if (!lessonProgressMap[les.id]?.completed) {
            return {
              subject: sub,
              chapter: chap,
              lesson: les,
              isResume: false
            };
          }
        }
      }
    }

    // Default fallback to first Math chapter
    const firstSub = class5Subjects[0];
    const firstChap = firstSub?.chapters[0];
    const firstLesson = firstChap?.lessons[0];
    return {
      subject: firstSub,
      chapter: firstChap,
      lesson: firstLesson,
      isResume: false
    };
  }, [continueDoc, class5Subjects, lessonProgressMap]);

  // ----------------------------------------------------
  // RECENTLY COMPLETED LESSONS (REAL FIRESTORE DATA)
  // ----------------------------------------------------
  const recentlyCompletedList = useMemo(() => {
    const list: {
      lessonId: string;
      lessonTitle: string;
      chapterTitle: string;
      chapterNumber: number;
      subjectId: string;
      subjectName: string;
      completedAt: string;
    }[] = [];

    class5Subjects.forEach(sub => {
      sub.chapters?.forEach(chap => {
        chap.lessons?.forEach(les => {
          const prog = lessonProgressMap[les.id];
          if (prog?.completed) {
            list.push({
              lessonId: les.id,
              lessonTitle: les.title,
              chapterTitle: chap.title,
              chapterNumber: chap.chapterNumber,
              subjectId: sub.id,
              subjectName: sub.name,
              completedAt: prog.completedAt || new Date().toISOString()
            });
          }
        });
      });
    });

    // Sort newest completed first
    list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return list.slice(0, 6);
  }, [class5Subjects, lessonProgressMap]);

  // ----------------------------------------------------
  // SMART NEXT RECOMMENDATIONS
  // ----------------------------------------------------
  const smartRecommendations = useMemo(() => {
    const recs: {
      id: string;
      title: string;
      subject: string;
      chapter: string;
      reason: string;
      priority: 'High Priority' | 'Recommended' | 'Revision';
      actionType: 'lesson' | 'practice' | 'mock';
      targetId?: string;
    }[] = [];

    // 1. Weak practice performance detection (< 70%)
    const weakAttempt = practiceAttempts.find(a => a.percentage < 70);
    if (weakAttempt) {
      recs.push({
        id: `rec_weak_${weakAttempt.id}`,
        title: `Revise: ${weakAttempt.chapterName || weakAttempt.practiceSetTitle || 'Chapter Practice'}`,
        subject: weakAttempt.subjectName || 'Class 5 Subject',
        chapter: weakAttempt.chapterName || 'Class 5 Chapter',
        reason: `Previous practice accuracy was ${weakAttempt.percentage}%. Re-test to build mastery!`,
        priority: 'High Priority',
        actionType: 'practice',
        targetId: weakAttempt.practiceSetId
      });
    }

    // 2. Completed lesson but unattempted chapter practice
    if (recentlyCompletedList.length > 0) {
      const latest = recentlyCompletedList[0];
      const hasAttemptedPractice = practiceAttempts.some(
        a => a.chapterId === latest.chapterTitle || a.subjectId === latest.subjectId
      );
      if (!hasAttemptedPractice) {
        recs.push({
          id: `rec_pract_${latest.lessonId}`,
          title: `Practice Drill: ${latest.chapterTitle}`,
          subject: latest.subjectName,
          chapter: latest.chapterTitle,
          reason: `You completed lesson on ${latest.lessonTitle}. Take 5 practice questions to lock in concepts!`,
          priority: 'Recommended',
          actionType: 'practice'
        });
      }
    }

    // 3. Next pending lesson recommendation
    if (activeLesson && activeLesson.lesson) {
      recs.push({
        id: `rec_next_${activeLesson.lesson.id}`,
        title: activeLesson.lesson.title,
        subject: activeLesson.subject?.name || 'Mathematics',
        chapter: activeLesson.chapter?.title || 'Chapter 1',
        reason: `Next up in your official Class 5 syllabus path.`,
        priority: 'Recommended',
        actionType: 'lesson',
        targetId: activeLesson.lesson.id
      });
    }

    // 4. Default Class 5 Mock Exam suggestion
    if (mockAttempts.length === 0) {
      recs.push({
        id: 'rec_mock_c5',
        title: 'Class 5 Mathematics Mid-Term Assessment',
        subject: 'Mathematics',
        chapter: 'Chapters 1-4 Comprehensive',
        reason: 'Evaluate your overall exam readiness with timed questions.',
        priority: 'Revision',
        actionType: 'mock'
      });
    }

    return recs.slice(0, 3);
  }, [practiceAttempts, recentlyCompletedList, activeLesson, mockAttempts]);

  // Handle marking lesson completion directly from Learning Path
  const handleToggleLessonCompletion = async (
    subjectId: string,
    chapterId: string,
    lessonId: string,
    currentCompleted: boolean
  ) => {
    soundFx.playSuccess();
    const newStatus = !currentCompleted;
    
    // Optimistic state update
    setLessonProgressMap(prev => ({
      ...prev,
      [lessonId]: {
        studentUid: userId,
        class: 'Class 5',
        subjectId,
        chapterId,
        lessonId,
        completed: newStatus,
        completedAt: new Date().toISOString()
      }
    }));

    try {
      await setLessonCompletionInFirestore(
        userId,
        'Class 5',
        subjectId,
        chapterId,
        lessonId,
        newStatus
      );
    } catch (err) {
      console.warn('Error updating lesson completion in Firestore:', err);
    }
  };

  // Helper to open lesson modal
  const handleOpenLesson = (
    subjectId: string,
    subjectName: string,
    chapterId: string,
    chapterName: string,
    chapterNumber: number,
    lessonId?: string
  ) => {
    soundFx.playClick();
    setSelectedLessonForModal({
      subjectId,
      subjectName,
      chapterId,
      chapterName,
      chapterNumber,
      initialLessonId: lessonId
    });
  };

  // Helper to get subject icon
  const getSubjectIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'calculator':
        return <Calculator className="w-5 h-5" />;
      case 'globe':
        return <Globe className="w-5 h-5" />;
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'bookopen':
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ==================================================== */}
      {/* 1. PERSONALIZED CLASS 5 LEARNING HEADER              */}
      {/* ==================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Class 5 Student Learning Space</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-yellow-300 text-xs font-extrabold border border-slate-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-yellow-400" />
                <span>{profile?.streakDays || 5} Day Study Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              My Class 5 Learning Journey 🎓
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Welcome back, <strong className="text-white">{profile?.name || 'Class 5 Scholar'}</strong>! All syllabus lessons, chapter drills, and performance metrics are updated in real-time.
            </p>

            <div className="text-[11px] text-sky-200 font-semibold flex items-center gap-2 pt-1">
              <span>{profile?.schoolName || 'Government Primary School'}</span>
              <span>•</span>
              <span>{profile?.medium || 'Telugu & English Medium'}</span>
            </div>
          </div>

          {/* Overall Class 5 Syllabus Progress Gauge */}
          <div className="w-full lg:w-auto p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-4 min-w-[280px]">
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-sky-200 uppercase tracking-wide">Class 5 Syllabus Progress</span>
                <span className="text-emerald-400 text-sm font-black">{metrics.overallProgressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950/60 overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.overallProgressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full" 
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                <span>{metrics.totalCompletedLessons} of {metrics.totalLessonsCount} Lessons Done</span>
                <span>{metrics.totalChaptersCount} Total Chapters</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                onClick={() => onNavigateTab('practice')}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice Center</span>
              </button>
              <button
                onClick={() => onNavigateTab('mock_tests')}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Mock Tests</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. CONTINUE LEARNING (WHERE DID I STOP?)             */}
      {/* ==================================================== */}
      <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-indigo-800/40 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-wider">
            <Play className="w-4 h-4 fill-sky-400" />
            <span>Continue Learning • Where You Left Off</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-500/30 uppercase">
            {activeLesson?.isResume ? 'Active In-Progress' : 'Next Recommended Lesson'}
          </span>
        </div>

        {activeLesson && activeLesson.lesson ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wide">
                <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-black">
                  {activeLesson.subject?.name}
                </span>
                <span>•</span>
                <span>Chapter {activeLesson.chapter?.chapterNumber}: {activeLesson.chapter?.title}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {activeLesson.lesson.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {activeLesson.lesson.summary || 'Study fundamental concepts, interactive step-by-step illustrations, and solved practice questions.'}
              </p>

              {activeLesson.lesson.nativeSummary && (
                <p className="text-xs text-sky-200 font-medium italic">
                  {activeLesson.lesson.nativeSummary}
                </p>
              )}

              <div className="pt-2 flex items-center gap-4 text-xs font-extrabold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Est. Time: 15 mins</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Class 5 SCERT Aligned</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-center items-stretch lg:border-l lg:border-slate-800 lg:pl-6">
              <button
                onClick={() => handleOpenLesson(
                  activeLesson.subject?.id || 'c5_math',
                  activeLesson.subject?.name || 'Mathematics',
                  activeLesson.chapter?.id || 'c5_math_ch1',
                  activeLesson.chapter?.title || 'The Fish Tale',
                  activeLesson.chapter?.chapterNumber || 1,
                  activeLesson.lesson.id
                )}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>▶ Resume Lesson Now</span>
              </button>

              <button
                onClick={() => onLaunchTutor?.(activeLesson.subject?.name, activeLesson.chapter?.title)}
                className="py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-sky-300 border border-sky-500/30 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-sky-400" />
                <span>Ask AI Tutor About This Lesson</span>
              </button>

              <button
                onClick={() => onNavigateTab('practice')}
                className="py-2 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Practice Questions on this Chapter</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-300">
            <p className="text-sm font-bold">Select any Class 5 subject below to start learning!</p>
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 3. MY CLASS 5 SUBJECTS PROGRESS GRID                 */}
      {/* ==================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              My Class 5 Subjects ({class5Subjects.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live syllabus progress, chapter completion, and practice readiness per subject
            </p>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveSubjectFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeSubjectFilter === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            {class5Subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectFilter(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                  activeSubjectFilter === sub.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sub.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {class5Subjects
            .filter(sub => activeSubjectFilter === 'all' || activeSubjectFilter === sub.id)
            .map((subject) => {
              const stat = metrics.subjectStats[subject.id] || { totalLessons: 0, completedLessons: 0, totalChapters: 0 };
              const percent = stat.totalLessons > 0 ? Math.round((stat.completedLessons / stat.totalLessons) * 100) : 0;
              const isCompleted = percent === 100;
              const isInProgress = percent > 0 && percent < 100;

              return (
                <div
                  key={subject.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${subject.color} text-white shadow-md`}>
                          {getSubjectIcon(subject.icon)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                            {subject.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {subject.nativeName}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : isInProgress 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {isCompleted ? '✓ Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>{stat.completedLessons} / {stat.totalLessons} Lessons</span>
                        <span className="text-blue-600 dark:text-blue-400">{percent}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-700">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium flex justify-between">
                        <span>{subject.chaptersCount || stat.totalChapters} Chapters</span>
                        <span>SCERT Syllabus</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedSubjectForExplorer(subject);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FolderTree className="w-3.5 h-3.5" />
                      <span>View Chapters</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        const firstChap = subject.chapters?.[0];
                        if (firstChap) {
                          handleOpenLesson(
                            subject.id,
                            subject.name,
                            firstChap.id,
                            firstChap.title,
                            firstChap.chapterNumber,
                            firstChap.lessons?.[0]?.id
                          );
                        }
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Lesson</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. LEARNING PATH & CHAPTER PROGRESSION EXPLORER      */}
      {/* ==================================================== */}
      <section className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Class 5 Learning Path & Lesson Checkpoints
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct lesson completion tracking synced with Firestore database
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Interactive Checkpoints
          </span>
        </div>

        {/* Chapter-by-chapter list of current subject */}
        <div className="space-y-4">
          {class5Subjects.slice(0, 3).map((sub) => (
            <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {sub.name}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {sub.chapters.length} Chapters
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSubjectForExplorer(sub)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore All Chapters</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sub.chapters.slice(0, 3).map((chap) => {
                  const firstLesson = chap.lessons[0];
                  const isLessonDone = firstLesson ? !!lessonProgressMap[firstLesson.id]?.completed : false;

                  return (
                    <div
                      key={chap.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between space-y-2.5 ${
                        isLessonDone
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className="text-slate-400">Chapter {chap.chapterNumber}</span>
                          <button
                            onClick={() => firstLesson && handleToggleLessonCompletion(
                              sub.id,
                              chap.id,
                              firstLesson.id,
                              isLessonDone
                            )}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title={isLessonDone ? "Mark as Incomplete" : "Mark as Completed"}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${isLessonDone ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300'}`} />
                          </button>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 line-clamp-1">
                          {chap.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {firstLesson?.title || 'Core Lesson'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenLesson(
                          sub.id,
                          sub.name,
                          chap.id,
                          chap.title,
                          chap.chapterNumber,
                          firstLesson?.id
                        )}
                        className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Study Lesson</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 5. SMART RECOMMENDATIONS & RECENT ATTEMPTS GRID      */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SMART ADAPTIVE RECOMMENDATIONS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recommended Next for You</h3>
                <p className="text-[11px] text-slate-400 font-medium">Personalized Class 5 recommendations based on real attempts</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
              Adaptive
            </span>
          </div>

          <div className="space-y-3">
            {smartRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/60 dark:border-purple-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    rec.priority === 'High Priority' 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                      : 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                  }`}>
                    {rec.subject} • {rec.priority}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{rec.title}</h4>
                  <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium mt-0.5">
                    💡 {rec.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {rec.actionType === 'practice' && (
                    <button
                      onClick={() => onNavigateTab('practice')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Start Practice</span>
                    </button>
                  )}

                  {rec.actionType === 'mock' && (
                    <button
                      onClick={() => onNavigateTab('mock_tests')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1"
                    >
                      <Target className="w-3 h-3" />
                      <span>Take Mock Exam</span>
                    </button>
                  )}

                  {rec.actionType === 'lesson' && (
                    <button
                      onClick={() => {
                        const firstSub = class5Subjects[0];
                        const firstChap = firstSub?.chapters[0];
                        if (firstChap) {
                          handleOpenLesson(
                            firstSub.id,
                            firstSub.name,
                            firstChap.id,
                            firstChap.title,
                            firstChap.chapterNumber,
                            firstChap.lessons?.[0]?.id
                          );
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] transition cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Study Lesson</span>
                    </button>
                  )}

                  <button
                    onClick={() => onLaunchTutor?.(rec.subject, rec.chapter)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] hover:bg-purple-50 transition cursor-pointer flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3" />
                    <span>Ask Tutor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENTLY COMPLETED LESSONS & ACHIEVEMENTS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recently Completed Lessons</h3>
                <p className="text-[11px] text-slate-400 font-medium">Your verified learning milestones in Firestore</p>
              </div>
            </div>

            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {recentlyCompletedList.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {recentlyCompletedList.length > 0 ? (
              recentlyCompletedList.map((item) => (
                <div
                  key={item.lessonId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {item.subjectName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Chapter {item.chapterNumber}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.lessonTitle}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleOpenLesson(
                      item.subjectId,
                      item.subjectName,
                      `ch_${item.chapterNumber}`,
                      item.chapterTitle,
                      item.chapterNumber,
                      item.lessonId
                    )}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">No lessons marked complete yet.</p>
                <p className="text-xs text-slate-500">Pick any lesson from Mathematics, English, or EVS above to get started!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 6. PRACTICE & MOCK TEST PERFORMANCE (REAL ATTEMPTS)  */}
      {/* ==================================================== */}
      <section className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Recent Class 5 Practice & Test Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified scores, accuracy breakdown, and solutions from Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('practice')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
            >
              Open Practice Center
            </button>
            <button
              onClick={() => onNavigateTab('mock_tests')}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              All Mock Tests
            </button>
          </div>
        </div>

        {practiceAttempts.length > 0 || mockAttempts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceAttempts.slice(0, 6).map((att) => (
              <div
                key={att.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 hover:border-amber-400/50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {att.subjectName || 'Class 5'}
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    att.percentage >= 80 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : att.percentage >= 60 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {att.percentage}% Score
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                    {att.practiceSetTitle || att.chapterName || 'Practice Drill'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Score: {att.score} / {att.totalMarks} Marks • {att.correctAnswers} Correct
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span>{new Date(att.submittedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => onNavigateTab('practice')}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Practice Again →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Zap className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
            <p className="text-xs text-slate-400 font-medium">No practice attempts recorded yet.</p>
            <button
              onClick={() => onNavigateTab('practice')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow transition cursor-pointer"
            >
              Take Your First Class 5 Practice Test
            </button>
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 7. CLASS 5 HOMEWORK & ASSIGNMENTS                    */}
      {/* ==================================================== */}
      <section className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Class 5 Homework & Assigned Worksheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                School homework tasks, teacher deadlines, and submission records
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('homework')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Open Homework Hub →
          </button>
        </div>

        {homeworkList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.slice(0, 4).map((hw) => {
              const submission = homeworkSubmissions.find(s => s.homeworkId === hw.id);
              const isSubmitted = !!submission;

              return (
                <div
                  key={hw.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">
                      {hw.subject}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {hw.title}
                    </h4>
                    <span className="text-[10px] text-rose-500 font-bold block">
                      Due: {hw.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateTab('homework')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                      isSubmitted 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow'
                    }`}
                  >
                    {isSubmitted ? '✓ Submitted' : 'Submit Work'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            No pending Class 5 homework assignments at this time.
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 8. MODALS INTEGRATION                                */}
      {/* ==================================================== */}
      {/* Detailed Lesson Viewer Modal */}
      {selectedLessonForModal && (
        <Class5LessonViewModal
          isOpen={true}
          onClose={() => setSelectedLessonForModal(null)}
          userId={userId}
          studentClassGrade="Class 5"
          subjectId={selectedLessonForModal.subjectId}
          subjectName={selectedLessonForModal.subjectName}
          chapterId={selectedLessonForModal.chapterId}
          chapterName={selectedLessonForModal.chapterName}
          chapterNumber={selectedLessonForModal.chapterNumber}
          initialLessonId={selectedLessonForModal.initialLessonId}
        />
      )}

      {/* Deep Multi-Chapter Subject Explorer Modal */}
      {selectedSubjectForExplorer && (
        <Class5SubjectExplorerModal
          isOpen={true}
          onClose={() => setSelectedSubjectForExplorer(null)}
          userId={userId}
          subjectId={selectedSubjectForExplorer.id}
          subjectName={selectedSubjectForExplorer.name}
          nativeName={selectedSubjectForExplorer.nativeName}
          lessonProgressMap={lessonProgressMap}
        />
      )}
    </div>
  );
};
