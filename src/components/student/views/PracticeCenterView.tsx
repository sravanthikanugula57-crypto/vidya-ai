import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  BookOpen,
  FolderTree,
  Award,
  Bookmark,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Check,
  Eye,
  Layers,
  Brain,
  Flag,
  Globe,
  Sliders,
  Play,
  CheckSquare,
  X,
  TrendingUp,
  RefreshCw,
  FileText,
  Flame,
  Target,
  Printer,
  Calendar,
  Star,
  Activity,
  Calculator,
  Grid,
  ChevronDown,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../lib/audio';
import { 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OfficialSubject, 
  OfficialChapter, 
  normalizeGradeKey 
} from '../../../data/officialSyllabusData';
import {
  fetchPublishedPracticeSets,
  subscribeToPublishedPracticeSets,
  savePracticeAttemptToFirestore,
  subscribeToStudentPracticeAttempts,
  isMatchingClass,
  isMatchingBoard,
  isMatchingSubject,
  isMatchingChapter,
  parseNumericClass,
  PracticeSetDoc,
  PracticeAttemptDoc,
  PracticeQuestionItem,
  QuestionResultItem
} from '../../../services/practiceService';
import { 
  subscribeToStudentLessonProgress, 
  LessonProgressDoc 
} from '../../../services/studentProgressService';
import { Class5SubjectExplorerModal } from './Class5SubjectExplorerModal';
import { PracticeHistoryModal } from './PracticeHistoryModal';

interface PracticeCenterViewProps {
  userId?: string;
  studentName?: string;
  studentEmail?: string;
  studentBoard?: string;
  studentClassGrade?: string | number | null;
  onSelectClass?: () => void;
  onLaunchLesson?: (lessonId: string) => void;
}

type PracticeViewScreen = 'home' | 'subject' | 'briefing' | 'runner' | 'results';

export const PracticeCenterView: React.FC<PracticeCenterViewProps> = ({
  userId = 'student',
  studentName = 'Student',
  studentEmail = '',
  studentBoard = 'State Board (TG/AP)',
  studentClassGrade,
  onSelectClass,
  onLaunchLesson
}) => {
  // Check if class is assigned (Requirement 3: Never use fallback class 5)
  const hasSelectedClass = Boolean(
    studentClassGrade !== undefined &&
    studentClassGrade !== null &&
    String(studentClassGrade).trim() !== ''
  );

  const parsedClassNum = hasSelectedClass ? parseNumericClass(studentClassGrade) : null;
  const displayClassName = hasSelectedClass
    ? (parsedClassNum ? `Class ${parsedClassNum}` : String(studentClassGrade))
    : '';

  const classKey = hasSelectedClass ? normalizeGradeKey(String(studentClassGrade)) : '';

  // Screen State
  const [currentScreen, setCurrentScreen] = useState<PracticeViewScreen>('home');

  // Firestore Data State (Strictly Real Data, No Dummy/Seeded Data)
  const [practiceSets, setPracticeSets] = useState<PracticeSetDoc[]>([]);
  const [attemptsHistory, setAttemptsHistory] = useState<PracticeAttemptDoc[]>([]);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressDoc>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Active Selections
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Practice Set for Briefing & Runner
  const [activeSet, setActiveSet] = useState<PracticeSetDoc | null>(null);

  // Active Quiz Runner State
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [activeAttemptResult, setActiveAttemptResult] = useState<PracticeAttemptDoc | null>(null);

  // Modal Dialogs
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [reviewLessonModal, setReviewLessonModal] = useState<{
    isOpen: boolean;
    subjectId: string;
    subjectName: string;
    chapterId?: string;
  }>({
    isOpen: false,
    subjectId: '',
    subjectName: ''
  });

  // Timer Ref
  const timerRef = useRef<any>(null);

  // 1. Subscribe to published practice sets for this student's actual class & board
  useEffect(() => {
    if (!hasSelectedClass || !studentClassGrade) {
      setPracticeSets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Use real-time Firestore listener for published practice sets
    const unsub = subscribeToPublishedPracticeSets(
      studentClassGrade,
      studentBoard,
      (sets) => {
        setPracticeSets(sets);
        setLoading(false);
      }
    );

    // Also do an initial explicit fetch to guarantee immediate state
    fetchPublishedPracticeSets(studentClassGrade, studentBoard)
      .then((sets) => {
        setPracticeSets(sets);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Practice sets fetch notice:', err);
        setLoading(false);
      });

    return () => {
      unsub();
    };
  }, [studentClassGrade, studentBoard, hasSelectedClass]);

  // 2. Subscribe to student's practice attempts history
  useEffect(() => {
    if (!userId || !hasSelectedClass) {
      setAttemptsHistory([]);
      return;
    }
    const unsub = subscribeToStudentPracticeAttempts(userId, studentClassGrade, (attempts) => {
      setAttemptsHistory(attempts);
    });
    return () => unsub();
  }, [userId, studentClassGrade, hasSelectedClass]);

  // 3. Subscribe to student lesson progress (for Review Lesson modal)
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToStudentLessonProgress(userId, (map) => {
      setLessonProgressMap(map || {});
    });
    return () => unsub();
  }, [userId]);

  // Syllabus Subjects dynamically mapped for student's class + unique subjects from practice sets
  const subjects: OfficialSubject[] = useMemo(() => {
    if (!hasSelectedClass) return [];
    const syllabusSubs = OFFICIAL_SYLLABUS_BY_CLASS[classKey] || [];
    
    // Check if there are practice sets with subjects not in syllabus
    const syllabusNames = new Set(syllabusSubs.map(s => s.name.toLowerCase()));
    const customSubs: OfficialSubject[] = [];

    practiceSets.forEach(set => {
      const sName = set.subject || set.subjectName || 'General';
      if (!syllabusNames.has(sName.toLowerCase())) {
        syllabusNames.add(sName.toLowerCase());
        customSubs.push({
          id: set.subjectId || sName.toLowerCase().replace(/\s+/g, '_'),
          classId: displayClassName,
          name: sName,
          nativeName: '',
          code: sName.substring(0, 4).toUpperCase(),
          chaptersCount: 1,
          color: 'from-blue-600 to-indigo-600',
          icon: 'BookOpen',
          chapters: [{
            id: set.chapterId,
            subjectId: set.subjectId || sName.toLowerCase(),
            classId: displayClassName,
            chapterNumber: 1,
            title: set.chapterName,
            nativeTitle: '',
            lessonsCount: 1,
            lessons: []
          }]
        });
      }
    });

    return [...syllabusSubs, ...customSubs];
  }, [classKey, hasSelectedClass, practiceSets, displayClassName]);

  // Initialize selected subject once subjects load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
      if (subjects[0].chapters && subjects[0].chapters.length > 0) {
        setSelectedChapterId(subjects[0].chapters[0].id);
      }
    }
  }, [subjects, selectedSubjectId]);

  // Active Subject & Chapters
  const currentSubject = useMemo(() => {
    if (subjects.length === 0) return null;
    return subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  }, [subjects, selectedSubjectId]);

  const subjectChapters = useMemo(() => {
    return currentSubject?.chapters || [];
  }, [currentSubject]);

  const currentChapter = useMemo(() => {
    if (subjectChapters.length === 0) return null;
    if (!selectedChapterId) return subjectChapters[0];
    return subjectChapters.find(c => c.id === selectedChapterId) || subjectChapters[0];
  }, [subjectChapters, selectedChapterId]);

  // Filtered practice sets for chapter-based drilldown
  const filteredSets = useMemo(() => {
    if (!hasSelectedClass) return [];
    const activeChap = currentChapter || subjectChapters[0];
    const activeChapId = selectedChapterId || activeChap?.id;

    return practiceSets.filter(pset => {
      // 1. Class Grade match (Strictly student's class)
      if (!isMatchingClass(pset.class, studentClassGrade)) return false;

      // 2. Board match
      if (studentBoard && !isMatchingBoard(pset.board, studentBoard)) return false;

      // 3. Subject match
      if (selectedSubjectId) {
        if (!isMatchingSubject(pset.subjectId, pset.subjectName || pset.subject, selectedSubjectId)) {
          return false;
        }
      }

      // 4. Chapter match
      if (activeChapId) {
        if (!isMatchingChapter(pset.chapterId, pset.chapterName, activeChapId)) {
          return false;
        }
      }

      // 5. Category match
      if (selectedCategory && selectedCategory !== 'all') {
        if ((pset.category || 'practice') !== selectedCategory) return false;
      }

      // 6. Difficulty match
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        if (pset.difficulty !== selectedDifficulty) return false;
      }

      // 7. Search query within this chapter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${pset.title} ${pset.chapterName || ''} ${pset.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [practiceSets, studentClassGrade, studentBoard, selectedSubjectId, selectedChapterId, selectedCategory, selectedDifficulty, searchQuery, currentChapter, subjectChapters, hasSelectedClass]);

  // Real Aggregate Statistics from student attempts
  const stats = useMemo(() => {
    const totalAttempts = attemptsHistory.length;
    if (totalAttempts === 0) {
      return {
        completedSetsCount: 0,
        averageScore: 0,
        totalQuestionsAnswered: 0,
        highestScore: 0,
        totalTimeSpentMinutes: 0
      };
    }

    const uniqueSets = new Set(attemptsHistory.map(a => a.practiceSetId));
    let totalScorePct = 0;
    let totalQs = 0;
    let maxPct = 0;

    attemptsHistory.forEach(a => {
      totalScorePct += (a.percentage || 0);
      totalQs += (a.correctCount !== undefined ? a.correctCount : (a.correctAnswers || 0)) + 
                 (a.wrongCount !== undefined ? a.wrongCount : (a.incorrectAnswers || 0));
      if ((a.percentage || 0) > maxPct) maxPct = a.percentage;
    });

    return {
      completedSetsCount: uniqueSets.size,
      averageScore: Math.round(totalScorePct / totalAttempts),
      totalQuestionsAnswered: totalQs,
      highestScore: maxPct,
      totalTimeSpentMinutes: Math.round(attemptsHistory.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0) / 60)
    };
  }, [attemptsHistory]);

  // Recommended Practice: Find first unattempted set or lowest score set
  const recommendedNextSet = useMemo(() => {
    if (practiceSets.length === 0) return null;

    const attemptedSetIds = new Set(attemptsHistory.map(a => a.practiceSetId));
    const unattempted = practiceSets.find(s => !attemptedSetIds.has(s.id) && !attemptedSetIds.has(s.practiceSetId));

    if (unattempted) {
      return {
        set: unattempted,
        reason: 'Recommended for you to start practicing this chapter'
      };
    }

    // Otherwise find the one with lowest score to improve
    const setScoreMap: Record<string, number> = {};
    attemptsHistory.forEach(a => {
      const prev = setScoreMap[a.practiceSetId] || 100;
      setScoreMap[a.practiceSetId] = Math.min(prev, a.percentage);
    });

    let lowestPsetId = '';
    let minScore = 101;
    Object.entries(setScoreMap).forEach(([sId, score]) => {
      if (score < minScore) {
        minScore = score;
        lowestPsetId = sId;
      }
    });

    const target = practiceSets.find(s => s.id === lowestPsetId || s.practiceSetId === lowestPsetId) || practiceSets[0];
    return {
      set: target,
      reason: `Boost your mastery from ${minScore < 101 ? `${minScore}%` : 'recent session'}`
    };
  }, [practiceSets, attemptsHistory]);

  // Weak Areas Calculation
  const weakAreas = useMemo(() => {
    const wrongChapterCounts: Record<string, { subjectName: string; chapterName: string; chapterId: string; wrongCount: number; lastPct: number }> = {};

    attemptsHistory.forEach(a => {
      const wrong = a.wrongCount !== undefined ? a.wrongCount : (a.incorrectAnswers || 0);
      if (wrong > 0 || (a.percentage || 0) < 70) {
        const key = a.chapterId || a.chapterName || 'General';
        if (!wrongChapterCounts[key]) {
          wrongChapterCounts[key] = {
            subjectName: a.subject || a.subjectName || 'Subject',
            chapterName: a.chapterName || 'Chapter',
            chapterId: a.chapterId || '',
            wrongCount: wrong || 1,
            lastPct: a.percentage
          };
        } else {
          wrongChapterCounts[key].wrongCount += (wrong || 1);
          wrongChapterCounts[key].lastPct = Math.min(wrongChapterCounts[key].lastPct, a.percentage);
        }
      }
    });

    return Object.values(wrongChapterCounts).slice(0, 3);
  }, [attemptsHistory]);

  // Timer runner for active quiz
  useEffect(() => {
    if (currentScreen === 'runner' && activeSet) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentScreen, activeSet]);

  // Handlers for Navigation & Flow
  const handleOpenSubject = (subjId: string, chapterId?: string) => {
    soundFx.playClick();
    setSelectedSubjectId(subjId);
    const targetSubj = subjects.find(s => s.id === subjId);
    const defaultChapter = chapterId || targetSubj?.chapters?.[0]?.id || '';
    setSelectedChapterId(defaultChapter);
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setCurrentScreen('subject');
  };

  const handleOpenBriefing = (pset: PracticeSetDoc) => {
    soundFx.playClick();
    setActiveSet(pset);
    setCurrentScreen('briefing');
  };

  const handleStartExam = () => {
    if (!activeSet) return;
    soundFx.playClick();
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeSpentSeconds(0);
    setShowPalette(false);
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    setActiveAttemptResult(null);
    setCurrentScreen('runner');
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    soundFx.playCheck();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleClearAnswer = (qId: string) => {
    soundFx.playPop();
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Real Practice Scoring & Firestore Saving (Requirements 6, 7 & 8)
  const handleSubmitExam = async () => {
    if (!activeSet) return;
    soundFx.playSuccess();

    const questions = activeSet.questions || [];
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let earnedMarks = 0;

    const questionResults: QuestionResultItem[] = questions.map((q, idx) => {
      const qId = q.questionId || q.id || `q_${idx + 1}`;
      const qText = q.questionText || q.question || `Question ${idx + 1}`;
      const uAns = userAnswers[qId];
      const isUnanswered = uAns === undefined || uAns === null || uAns === '';

      // Real Answer Comparison (support index or text)
      let isCorrect = false;
      if (!isUnanswered) {
        if (typeof q.correctAnswer === 'number') {
          isCorrect = Number(uAns) === Number(q.correctAnswer);
        } else if (typeof q.correctAnswer === 'string') {
          const ca = q.correctAnswer.trim().toLowerCase();
          const ua = String(uAns).trim().toLowerCase();
          if (typeof uAns === 'number' && q.options && q.options[uAns]) {
            isCorrect = q.options[uAns].trim().toLowerCase() === ca || String.fromCharCode(65 + uAns).toLowerCase() === ca;
          } else {
            isCorrect = ua === ca;
          }
        }
      }

      const qMarks = typeof q.marks === 'number' && q.marks > 0 ? q.marks : (activeSet.marksPerQuestion || 1);

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
        earnedMarks += qMarks;
      } else {
        wrongCount++;
      }

      let selectedOptionText = 'Not answered';
      if (!isUnanswered) {
        if (typeof uAns === 'number' && q.options && q.options[uAns]) {
          selectedOptionText = `Option ${String.fromCharCode(65 + uAns)}: ${q.options[uAns]}`;
        } else {
          selectedOptionText = String(uAns);
        }
      }

      let correctOptionText = '';
      if (typeof q.correctAnswer === 'number' && q.options && q.options[q.correctAnswer]) {
        correctOptionText = `Option ${String.fromCharCode(65 + q.correctAnswer)}: ${q.options[q.correctAnswer]}`;
      } else {
        correctOptionText = String(q.correctAnswer);
      }

      return {
        questionId: qId,
        questionText: qText,
        selectedAnswer: isUnanswered ? null : uAns,
        selectedOptionText,
        correctAnswer: q.correctAnswer,
        correctOptionText,
        isCorrect,
        explanation: q.explanation || 'Step-by-step curriculum explanation for this problem.',
        marks: qMarks
      };
    });

    const marksPerQ = activeSet.marksPerQuestion || 1;
    const totalMarks = activeSet.totalMarks || (questions.length * marksPerQ) || 1;
    const percentage = Math.round((earnedMarks / totalMarks) * 100);
    const now = new Date().toISOString();
    const attemptId = `att_${userId}_${Date.now()}`;

    const attemptDoc: PracticeAttemptDoc = {
      id: attemptId,
      attemptId: attemptId,
      practiceSetId: activeSet.practiceSetId || activeSet.id,
      practiceSetTitle: activeSet.title,
      studentId: userId,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || '',
      class: studentClassGrade || activeSet.class,
      subject: activeSet.subject || activeSet.subjectName || currentSubject?.name || 'General',
      subjectId: activeSet.subjectId || currentSubject?.id,
      subjectName: activeSet.subjectName || activeSet.subject || currentSubject?.name,
      chapterId: activeSet.chapterId,
      chapterName: activeSet.chapterName,
      startedAt: now,
      submittedAt: now,
      answers: userAnswers,
      questionResults,
      correctCount,
      wrongCount,
      unansweredCount,
      score: earnedMarks,
      totalMarks,
      percentage,
      status: 'completed',
      correctAnswers: correctCount,
      incorrectAnswers: wrongCount,
      unanswered: unansweredCount,
      timeSpentSeconds
    };

    // Save to Firestore
    await savePracticeAttemptToFirestore(attemptDoc);

    // Update state & show results immediately
    setActiveAttemptResult(attemptDoc);
    setCurrentScreen('results');

    if (percentage >= 70) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRetakeSet = (psetId?: string) => {
    const targetSet = psetId
      ? practiceSets.find(s => s.id === psetId || s.practiceSetId === psetId)
      : activeSet;
    if (targetSet) {
      setActiveSet(targetSet);
      handleStartExam();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSubjectIcon = (code: string = '') => {
    const c = code.toUpperCase();
    if (c.includes('MATH')) return Calculator;
    if (c.includes('EVS') || c.includes('SCI')) return Globe;
    if (c.includes('ENG')) return BookOpen;
    if (c.includes('CS') || c.includes('TECH')) return Cpu;
    return BookOpen;
  };

  // =========================================================================
  // UNASSIGNED CLASS STATE (Requirement 3: Never fallback to Class 5)
  // =========================================================================
  if (!hasSelectedClass) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-5 shadow-2xl font-sans text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30 shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Select Your Academic Class</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Please select your class to load your curriculum-aligned practice sets, chapter questions, and progress tracking.
          </p>
        </div>

        {onSelectClass && (
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectClass();
            }}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-blue-600/30"
          >
            <span>Choose Class Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: PRACTICE BRIEFING (PRE-START) SCREEN
  // =========================================================================
  if (currentScreen === 'briefing' && activeSet) {
    const qCount = activeSet.questions ? activeSet.questions.length : 0;
    const durationMins = activeSet.duration || activeSet.estimatedTime || 15;
    const marks = activeSet.totalMarks || (qCount * (activeSet.marksPerQuestion || 1));

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-slate-100">
        {/* Top Back Navigation */}
        <button
          onClick={() => {
            soundFx.playClick();
            setCurrentScreen('subject');
          }}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Practice Sets</span>
        </button>

        {/* Briefing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Badge & Subject Info */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 font-extrabold text-[11px] uppercase border border-blue-800">
                {activeSet.subjectName || activeSet.subject || currentSubject?.name}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 font-extrabold text-[11px] uppercase border border-purple-800">
                {displayClassName}
              </span>
              {activeSet.board && (
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-extrabold text-[11px] uppercase border border-emerald-800">
                  {activeSet.board}
                </span>
              )}
              {activeSet.isAiGenerated && (
                <span className="px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 font-extrabold text-[11px] uppercase border border-blue-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>AI-Generated Practice Set</span>
                </span>
              )}
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-400 font-black text-xs border border-slate-800">
              {activeSet.difficulty || 'Medium'}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{activeSet.title}</h2>
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
              {activeSet.chapterName || 'Chapter Practice'}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-medium pt-1">
              {activeSet.description || 'Master key chapter questions and assess your knowledge with verified explanations.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Questions</span>
              <span className="text-base font-black text-white mt-0.5 block">{qCount} Questions</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Marks</span>
              <span className="text-base font-black text-amber-300 mt-0.5 block">{marks} Marks</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Est. Time</span>
              <span className="text-base font-black text-blue-400 mt-0.5 block">{durationMins} Mins</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>Practice Guidelines:</span>
            </h4>
            <ul className="text-xs space-y-2 text-slate-300 font-medium">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>Choose the single best option for every multiple-choice question.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>You can jump between questions and change answers anytime before submitting.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>Instant scorecard with step-by-step verified explanations will be revealed immediately after submit.</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentScreen('subject');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleStartExam}
              disabled={qCount === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Practice Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PRACTICE RUNNER SCREEN
  // =========================================================================
  if (currentScreen === 'runner' && activeSet) {
    const questions = activeSet.questions || [];
    const totalQs = questions.length;
    const currentQ: PracticeQuestionItem | undefined = questions[currentQIndex];
    const answeredCount = Object.keys(userAnswers).length;
    const userSelectedAnswer = currentQ ? userAnswers[currentQ.id || currentQ.questionId] : undefined;

    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-5 font-sans text-slate-100">
        {/* Runner Header Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Exit Practice"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block">
                {activeSet.title}
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {activeSet.chapterName}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Practice Timer */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-black text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTimer(timeSpentSeconds)}</span>
            </div>

            {/* Question Palette Toggle */}
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="px-3.5 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Grid className="w-3.5 h-3.5 text-blue-400" />
              <span>Palette ({answeredCount}/{totalQs})</span>
            </button>
          </div>
        </div>

        {/* Question Palette Dropdown Modal */}
        <AnimatePresence>
          {showPalette && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span>Jump to Question</span>
                <span>{answeredCount} Answered • {totalQs - answeredCount} Remaining</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const qKey = q.id || q.questionId;
                  const isAns = userAnswers[qKey] !== undefined;
                  const isCurr = currentQIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        setCurrentQIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`h-9 rounded-xl font-black text-xs transition cursor-pointer border ${
                        isCurr
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                          : isAns
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Stage Card */}
        {currentQ ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <div className="flex items-center space-x-2 font-black text-slate-400">
                <span>Question {currentQIndex + 1} of {totalQs}</span>
              </div>

              <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 text-blue-300 font-extrabold text-[10px] border border-blue-800">
                +{currentQ.marks || activeSet.marksPerQuestion || 1} Mark
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.questionText || currentQ.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((optText, oIdx) => {
                const isSelected = userSelectedAnswer === oIdx;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(currentQ.id || currentQ.questionId, oIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-600/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{optText}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action Bar (Clear, Prev, Next, Submit) */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                {userSelectedAnswer !== undefined && (
                  <button
                    onClick={() => handleClearAnswer(currentQ.id || currentQ.questionId)}
                    className="text-xs font-bold text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentQIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQIndex < totalQs - 1 ? (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setCurrentQIndex(prev => Math.min(totalQs - 1, prev + 1));
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center space-x-1 shadow-md shadow-blue-500/20"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (answeredCount < totalQs) {
                        setShowSubmitConfirm(true);
                      } else {
                        handleSubmitExam();
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-md shadow-emerald-500/20"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Submit Practice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-xs">No question found in this practice set.</p>
          </div>
        )}

        {/* Exit Confirmation Dialog */}
        <AnimatePresence>
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Exit Practice?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your current progress will not be saved. Are you sure you want to return to the practice menu?
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Stay & Finish
                  </button>
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      setCurrentScreen('subject');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Submit Incomplete Warning Dialog */}
          {showSubmitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Unanswered Questions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You have <strong className="text-amber-300">{totalQs - answeredCount} unanswered</strong> question{(totalQs - answeredCount) > 1 ? 's' : ''}. Do you still want to submit?
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={() => {
                      setShowSubmitConfirm(false);
                      handleSubmitExam();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer"
                  >
                    Submit Now
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PRACTICE RESULTS & SOLUTIONS REVIEW SCREEN (Requirements 6 & 7)
  // =========================================================================
  if (currentScreen === 'results' && activeSet && activeAttemptResult) {
    const questions = activeSet.questions || [];
    const isPassed = activeAttemptResult.percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-slate-100">
        {/* Scorecard Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/50 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                {displayClassName} Practice Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">{activeSet.title}</h2>
              <p className="text-xs text-blue-200 mt-1 font-medium">
                {activeSet.subjectName || activeSet.subject || currentSubject?.name} • {activeSet.chapterName}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[140px]">
              <div className={`text-3xl sm:text-4xl font-black ${isPassed ? 'text-emerald-300' : 'text-amber-300'}`}>
                {activeAttemptResult.percentage}%
              </div>
              <div className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider mt-1">
                Score: {activeAttemptResult.score} / {activeAttemptResult.totalMarks} Marks
              </div>
            </div>
          </div>

          {/* Stats Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Correct</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5">
                {activeAttemptResult.correctCount} / {questions.length}
              </span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Incorrect</span>
              <span className="text-lg font-black text-rose-400 mt-0.5">
                {activeAttemptResult.wrongCount}
              </span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Unanswered</span>
              <span className="text-lg font-black text-slate-300 mt-0.5">
                {activeAttemptResult.unansweredCount}
              </span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Time Taken</span>
              <span className="text-lg font-black text-amber-300 mt-0.5">
                {formatTimer(timeSpentSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRetakeSet(activeSet.id)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                window.print();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Scorecard</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setCurrentScreen('home');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Back to Practice Center
          </button>
        </div>

        {/* Question-by-Question Review with Real Explanations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-base text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span>Detailed Question Review & Verified Explanations</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">{questions.length} Questions</span>
          </div>

          {activeAttemptResult.questionResults && activeAttemptResult.questionResults.length > 0 ? (
            activeAttemptResult.questionResults.map((resItem, idx) => {
              const qObj = questions.find(q => (q.id || q.questionId) === resItem.questionId) || questions[idx];
              const isUnanswered = resItem.selectedAnswer === null || resItem.selectedAnswer === undefined;
              const isCorrect = resItem.isCorrect;

              return (
                <div
                  key={resItem.questionId || idx}
                  className={`p-6 rounded-3xl border space-y-4 transition ${
                    isCorrect
                      ? 'bg-slate-900 border-emerald-900/60'
                      : isUnanswered
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-900 border-rose-900/60'
                  }`}
                >
                  {/* Status Header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-200">
                      Question {idx + 1}
                    </span>

                    <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${
                      isCorrect
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : isUnanswered
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {isCorrect ? `Correct (+${resItem.marks} Mark)` : isUnanswered ? 'Skipped' : 'Incorrect (0 Marks)'}
                    </span>
                  </div>

                  <p className="font-bold text-white text-sm leading-relaxed">{resItem.questionText}</p>

                  {/* Options Overview */}
                  {qObj && qObj.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {qObj.options.map((opt, oIdx) => {
                        const isUserPick = Number(resItem.selectedAnswer) === oIdx;
                        const isRightAnswer = Number(resItem.correctAnswer) === oIdx || (typeof resItem.correctAnswer === 'string' && opt.toLowerCase().includes(resItem.correctAnswer.toLowerCase()));

                        let optBg = 'bg-slate-950 border-slate-800/80 text-slate-400';
                        if (isRightAnswer) {
                          optBg = 'bg-emerald-950/80 border-emerald-700 text-emerald-200 font-bold';
                        } else if (isUserPick && !isRightAnswer) {
                          optBg = 'bg-rose-950/80 border-rose-700 text-rose-200 font-bold';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border flex items-center space-x-2 ${optBg}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isRightAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {isUserPick && !isRightAnswer && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Your Answer vs Correct Answer Summary (Requirement 7) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Your Answer</span>
                      <span className={`font-black mt-0.5 block ${isCorrect ? 'text-emerald-400' : isUnanswered ? 'text-slate-400' : 'text-rose-400'}`}>
                        {resItem.selectedOptionText || 'Not answered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Correct Answer</span>
                      <span className="font-black text-emerald-400 mt-0.5 block">
                        {resItem.correctOptionText || String(resItem.correctAnswer)}
                      </span>
                    </div>
                  </div>

                  {/* Real Explanation from Firestore */}
                  {resItem.explanation && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <strong className="text-amber-400 block font-bold">Curriculum Explanation:</strong>
                      <p className="text-slate-300 leading-relaxed font-medium">{resItem.explanation}</p>
                    </div>
                  )}

                  {/* If wrong or skipped: Lesson Review Option */}
                  {!isCorrect && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 font-medium">
                        Need help with this topic? Review chapter lessons.
                      </span>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setReviewLessonModal({
                            isOpen: true,
                            subjectId: activeSet.subjectId || selectedSubjectId,
                            subjectName: activeSet.subjectName || currentSubject?.name || 'Subject',
                            chapterId: activeSet.chapterId || selectedChapterId
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40 font-bold transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Review Lesson</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800">
              <p className="text-slate-400 text-xs">No detailed questions to review.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: SUBJECT & CHAPTER DRILLDOWN BROWSER
  // =========================================================================
  if (currentScreen === 'subject') {
    const activeSubjObj = currentSubject || subjects[0];
    const activeChapterObj = currentChapter || subjectChapters[0];

    return (
      <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentScreen('home');
              }}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                  {displayClassName} Practice
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs font-bold text-slate-400">{studentBoard}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{activeSubjObj?.name}</h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowHistoryModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Practice History</span>
          </button>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map(s => {
            const isSelected = s.id === selectedSubjectId;
            return (
              <button
                key={s.id}
                onClick={() => handleOpenSubject(s.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{s.name}</span>
                {s.chapters && s.chapters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-semibold">
                    {s.chapters.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Grid: Chapters Sidebar + Practice Sets List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chapter Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Chapters ({subjectChapters.length})
                </span>
                <span className="text-[11px] text-blue-400 font-semibold">{displayClassName}</span>
              </div>

              {subjectChapters.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No chapters found for this subject.</p>
              ) : (
                <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                  {subjectChapters.map((chap, idx) => {
                    const isSelected = (selectedChapterId === chap.id) || (!selectedChapterId && idx === 0);
                    const chapSets = practiceSets.filter(s => isMatchingChapter(s.chapterId, s.chapterName, chap.id));

                    return (
                      <button
                        key={chap.id}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedChapterId(chap.id);
                          setSearchQuery('');
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition cursor-pointer border flex items-center justify-between space-x-2 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500/80 text-white'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-500">
                              Ch {chap.chapterNumber || (idx + 1)}
                            </span>
                            {chapSets.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-950 text-blue-300 text-[9px] font-bold">
                                {chapSets.length} Set{chapSets.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold truncate mt-0.5">{chap.title}</h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chapter Practice Sets Container */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-bold text-slate-300">
                  <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                  {[
                    { key: 'all', label: 'All Sets' },
                    { key: 'quick', label: 'Quick Check' },
                    { key: 'concept', label: 'Concept Mastery' },
                    { key: 'practice', label: 'Standard Practice' }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat.key
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400">
                  <span>Difficulty:</span>
                  {['all', 'Easy', 'Medium', 'Challenge'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer text-[11px] ${
                        selectedDifficulty === diff
                          ? 'bg-slate-700 text-white font-black'
                          : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${activeChapterObj?.title || 'this chapter'} practice sets...`}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Practice Sets List (Requirements 1 & 13: Strictly Real Data & Exact Empty State) */}
            {loading ? (
              <div className="py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Loading Practice Sets...</h4>
              </div>
            ) : filteredSets.length === 0 ? (
              <div className="py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3 p-6">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                {/* Exact user-mandated message */}
                <h4 className="text-base font-bold text-white">No practice sets available yet.</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Practice sets for {activeChapterObj?.title || 'this chapter'} have not been published yet. Teachers can publish new practice sets from the Teacher Portal.
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Show All Sets in this Chapter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSets.map(pset => {
                  const setAttempts = attemptsHistory.filter(a => a.practiceSetId === pset.id || a.practiceSetId === pset.practiceSetId);
                  const attemptCount = setAttempts.length;
                  const bestScore = setAttempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);
                  const latestAttempt = setAttempts[0];
                  const qCount = pset.questions ? pset.questions.length : (pset.totalQuestions || 0);

                  return (
                    <div
                      key={pset.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/70 transition flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                              pset.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              pset.difficulty === 'Challenge' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                              'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {pset.difficulty || 'Medium'}
                            </span>
                            {pset.isAiGenerated && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                <span>AI-Generated</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 font-bold flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{pset.duration || pset.estimatedTime || 15} Mins</span>
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-white leading-snug">{pset.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {pset.description || 'Curriculum aligned practice questions for this chapter.'}
                        </p>

                        {/* Best Score Badge */}
                        <div className="pt-1">
                          {attemptCount > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
                                <Award className="w-3 h-3" />
                                <span>Best: {bestScore}% ({attemptCount} attempt{attemptCount > 1 ? 's' : ''})</span>
                              </span>
                              {latestAttempt && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Latest: {latestAttempt.percentage}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                              Not attempted
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-400">
                          {qCount} Questions • {pset.totalMarks || (qCount * (pset.marksPerQuestion || 1))} Marks
                        </span>

                        <button
                          onClick={() => handleOpenBriefing(pset)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center space-x-1 shadow-md shadow-blue-500/20"
                        >
                          <span>Start Practice</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: PRACTICE CENTER HOMEPAGE (DEFAULT)
  // =========================================================================
  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-slate-100">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-4">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{displayClassName} Student Practice Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Practice Center</h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium mt-1">
              Practice what you learned in your {displayClassName} lessons, master core chapter concepts, and test your understanding with real-time feedback.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onSelectClass && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSelectClass();
                }}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                Change Class ({displayClassName})
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                setShowHistoryModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black transition cursor-pointer flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>View Practice History</span>
            </button>
          </div>
        </div>

        {/* Real Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 relative z-10">
          <div className="bg-slate-950/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-blue-200 uppercase block">Completed Sets</span>
            <span className="text-xl font-black text-white block mt-0.5">{stats.completedSetsCount}</span>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-blue-200 uppercase block">Average Score</span>
            <span className="text-xl font-black text-amber-300 block mt-0.5">
              {stats.completedSetsCount > 0 ? `${stats.averageScore}%` : '—'}
            </span>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-blue-200 uppercase block">Questions Solved</span>
            <span className="text-xl font-black text-emerald-400 block mt-0.5">{stats.totalQuestionsAnswered}</span>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-blue-200 uppercase block">Best Score</span>
            <span className="text-xl font-black text-purple-300 block mt-0.5">
              {stats.completedSetsCount > 0 ? `${stats.highestScore}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* RECOMMENDED PRACTICE & WEAK AREAS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Practice */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-black text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>What should I practice next?</span>
            </div>

            {recommendedNextSet ? (
              <div className="space-y-2">
                <h3 className="text-base font-black text-white">{recommendedNextSet.set.title}</h3>
                <p className="text-xs font-bold text-blue-400">
                  {recommendedNextSet.set.subjectName || recommendedNextSet.set.subject} • {recommendedNextSet.set.chapterName}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {recommendedNextSet.reason}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {practiceSets.length === 0 ? 'No practice sets available yet.' : `Choose any ${displayClassName} subject below to begin your practice.`}
              </p>
            )}
          </div>

          {recommendedNextSet && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {recommendedNextSet.set.questions?.length || 0} Questions • {recommendedNextSet.set.duration || 15} Mins
              </span>

              <button
                onClick={() => handleOpenBriefing(recommendedNextSet.set)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-md shadow-amber-500/20"
              >
                <span>Practice Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Focus & Weak Areas */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Areas Needing Practice</span>
            </div>
          </div>

          {weakAreas.length === 0 ? (
            <div className="py-6 text-center space-y-2 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-slate-300">All clear!</p>
              <p>You do not have recurring mistakes. Practice regularly to keep your skills sharp.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {weakAreas.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">{w.chapterName}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{w.subjectName}</span>
                  </div>

                  <button
                    onClick={() => {
                      const foundSet = practiceSets.find(s => {
                        const sChap = (s.chapterId || '').toLowerCase();
                        const wChap = (w.chapterId || '').toLowerCase();
                        return sChap === wChap || sChap.includes(wChap) || wChap.includes(sChap);
                      });
                      if (foundSet) {
                        handleOpenBriefing(foundSet);
                      } else {
                        const subj = subjects.find(s => s.name.toLowerCase().includes(w.subjectName.toLowerCase()));
                        if (subj) handleOpenSubject(subj.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-extrabold text-[11px] transition cursor-pointer"
                  >
                    Practice Topic
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUBJECT-BASED PRACTICE CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-white">{displayClassName} Subjects Practice</h3>
            <p className="text-xs text-slate-400 font-medium">Select a subject to practice chapter-by-chapter questions.</p>
          </div>
        </div>

        {practiceSets.length === 0 && !loading && (
          <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No practice sets available yet.</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No practice sets have been published for {displayClassName} ({studentBoard}) in Firestore yet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => {
            const IconComp = getSubjectIcon(subj.code);
            const subjSets = practiceSets.filter(s => {
              return isMatchingSubject(s.subjectId, s.subjectName || s.subject, subj.name);
            });

            const subjAttempts = attemptsHistory.filter(a => {
              const aName = (a.subjectName || a.subject || '').toLowerCase();
              const sName = subj.name.toLowerCase();
              return aName.includes(sName) || sName.includes(aName);
            });

            const completedCount = new Set(subjAttempts.map(a => a.practiceSetId)).size;
            const bestSubjScore = subjAttempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);

            return (
              <div
                key={subj.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/80 transition flex flex-col justify-between space-y-5 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 text-[10px] font-bold border border-slate-800">
                      {subj.chaptersCount || subj.chapters?.length || 1} Chapters
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-base text-white">{subj.name}</h4>
                    {subj.nativeName && (
                      <p className="text-xs text-blue-300/90 font-semibold mt-0.5">{subj.nativeName}</p>
                    )}
                  </div>

                  {/* Subject Status Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Practice Sets</span>
                      <span className="font-black text-white mt-0.5 block">{subjSets.length} Sets Available</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Best Score</span>
                      <span className="font-black text-amber-300 mt-0.5 block">
                        {completedCount > 0 ? `${bestSubjScore}%` : 'Not attempted'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenSubject(subj.id)}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20"
                  >
                    <span>Practice {subj.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT PRACTICE ATTEMPTS (Requirement 13: Exact Empty State) */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="font-black text-base text-white">Recent Practice Sessions</h3>
          </div>

          {attemptsHistory.length > 0 && (
            <button
              onClick={() => {
                soundFx.playClick();
                setShowHistoryModal(true);
              }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
            >
              View All ({attemptsHistory.length})
            </button>
          )}
        </div>

        {attemptsHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            {/* User-mandated exact empty state string */}
            <p className="text-slate-300 font-bold">No practice attempts yet.</p>
            <p className="text-slate-500">Pick any {displayClassName} subject above to start your first practice set!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {attemptsHistory.slice(0, 5).map((att) => {
              const dateStr = new Date(att.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              });
              const timeStr = new Date(att.submittedAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-extrabold uppercase">
                        {att.subject || att.subjectName || 'Subject'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {dateStr} at {timeStr}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm">{att.practiceSetTitle || 'Practice Set'}</h4>
                    <p className="text-slate-400 font-medium">
                      {att.chapterName || 'Chapter Practice'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className={`text-lg font-black block ${att.percentage >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {att.percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {att.correctCount !== undefined ? att.correctCount : (att.correctAnswers || 0)} Correct • {att.wrongCount !== undefined ? att.wrongCount : (att.incorrectAnswers || 0)} Wrong
                      </span>
                    </div>

                    <button
                      onClick={() => handleRetakeSet(att.practiceSetId)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Practice History Modal */}
      <PracticeHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        attempts={attemptsHistory}
        practiceSets={practiceSets}
        onRetakeSet={(psetId) => {
          setShowHistoryModal(false);
          handleRetakeSet(psetId);
        }}
      />

      {/* Interactive Subject Explorer Modal (for lesson review) */}
      <Class5SubjectExplorerModal
        isOpen={reviewLessonModal.isOpen}
        onClose={() => setReviewLessonModal(prev => ({ ...prev, isOpen: false }))}
        userId={userId}
        studentClassGrade={displayClassName}
        subjectId={reviewLessonModal.subjectId}
        subjectName={reviewLessonModal.subjectName}
        initialChapterId={reviewLessonModal.chapterId}
        lessonProgressMap={lessonProgressMap}
      />
    </div>
  );
};
