import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Maximize2,
  Minimize2,
  Bookmark,
  CheckCircle2,
  Flag,
  ArrowLeft,
  ArrowRight,
  Save,
  HelpCircle,
  Brain,
  AlertTriangle,
  Grid,
  Sparkles,
  BookOpen,
  LogOut
} from 'lucide-react';
import {
  MockTestDoc,
  MockQuestion,
  MockAttempt,
  UserAnswerState
} from '../../../types/mockTest';
import { soundFx } from '../../../lib/audio';
import {
  getOrCreateActiveMockSession,
  saveActiveMockSessionState,
  saveCompletedMockTestAttempt
} from '../../../services/mockTestService';
import { calculateMockTestResult, evaluateQuestionAnswer } from '../../../utils/answerEvaluation';
import { MockTestResultModal } from './MockTestResultModal';

interface MockTestSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  test: MockTestDoc;
  questions: MockQuestion[];
  userId?: string;
  userName?: string;
}

export const MockTestSimulator: React.FC<MockTestSimulatorProps> = ({
  isOpen,
  onClose,
  test,
  questions = [],
  userId = 'anonymous_student',
  userName = 'Ananya'
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number | string, UserAnswerState>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((test.durationMinutes || test.duration || 30) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(true);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [savedAttempt, setSavedAttempt] = useState<MockAttempt | null>(null);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'review'>('all');
  const [showHint, setShowHint] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const testDurationMins = test.durationMinutes || test.duration || 30;

  // Initialize or restore active session from Firestore on open
  useEffect(() => {
    if (!isOpen || !test || !questions || questions.length === 0) return;

    let isMounted = true;

    async function initSession() {
      try {
        const session = await getOrCreateActiveMockSession(userId, test);
        if (!isMounted) return;

        // Populate initial answers structure
        const initialAnswers: Record<number | string, UserAnswerState> = {};
        questions.forEach((q) => {
          const qNum = q.questionNumber;
          const restored = session.answers?.[qNum] || session.answers?.[String(qNum)];
          if (restored) {
            initialAnswers[qNum] = {
              userAnswer: restored.userAnswer,
              status: restored.status || 'unanswered',
              bookmarked: Boolean(restored.bookmarked)
            };
          } else {
            initialAnswers[qNum] = {
              userAnswer: null,
              status: 'not_visited',
              bookmarked: false
            };
          }
        });

        // Set current question index & mark as visited
        const restoredIdx = typeof session.currentQuestionIdx === 'number' && session.currentQuestionIdx < questions.length
          ? session.currentQuestionIdx
          : 0;

        const currentQNum = questions[restoredIdx]?.questionNumber;
        if (currentQNum && initialAnswers[currentQNum]?.status === 'not_visited') {
          initialAnswers[currentQNum].status = 'unanswered';
        }

        setUserAnswers(initialAnswers);
        setCurrentIdx(restoredIdx);

        if (session.expired) {
          setTimeLeftSeconds(0);
          setIsTimerRunning(false);
          setSessionInitialized(true);
          handleFinalSubmissionWithAnswers(initialAnswers);
        } else {
          setTimeLeftSeconds(Math.max(1, session.remainingSeconds));
          setIsTimerRunning(true);
          setSessionInitialized(true);
        }
      } catch (err) {
        console.warn('Session restoration error, using defaults:', err);
        if (!isMounted) return;
        setTimeLeftSeconds(testDurationMins * 60);
        setIsTimerRunning(true);
        setSessionInitialized(true);
      }
    }

    setSessionInitialized(false);
    initSession();

    return () => {
      isMounted = false;
    };
  }, [isOpen, test?.id, userId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isOpen || !isTimerRunning || showResultModal || !sessionInitialized) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          handleFinalSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isTimerRunning, showResultModal, sessionInitialized]);

  // Auto-save answers and current question index to Firestore
  useEffect(() => {
    if (!isOpen || !sessionInitialized || showResultModal || !test?.id) return;

    setIsAutoSaved(false);
    const saveTimer = setTimeout(() => {
      saveActiveMockSessionState(userId, test.id, userAnswers, currentIdx)
        .then(() => setIsAutoSaved(true))
        .catch(() => setIsAutoSaved(true));
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [userAnswers, currentIdx, isOpen, sessionInitialized, showResultModal, test?.id, userId]);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIdx] || questions[0];
  const qNum = currentQ.questionNumber;
  const currentAnswerState = userAnswers[qNum] || {
    userAnswer: null,
    status: 'not_visited',
    bookmarked: false
  };

  // Helper for formatting time
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Set user answer for current question
  const handleUpdateAnswer = (answerValue: any) => {
    soundFx.playClick();
    setIsAutoSaved(false);

    const prevStatus = currentAnswerState.status;
    let nextStatus: UserAnswerState['status'] = 'answered';
    if (prevStatus === 'review' || prevStatus === 'answered_review') {
      nextStatus = 'answered_review';
    }

    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        userAnswer: answerValue,
        status: nextStatus
      }
    }));
  };

  // Mark / Unmark for Review
  const handleToggleReview = () => {
    soundFx.playClick();
    const isAns = currentAnswerState.userAnswer !== null && currentAnswerState.userAnswer !== undefined && String(currentAnswerState.userAnswer).trim() !== '';
    const newStatus = currentAnswerState.status === 'review' || currentAnswerState.status === 'answered_review'
      ? (isAns ? 'answered' : 'unanswered')
      : (isAns ? 'answered_review' : 'review');

    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        status: newStatus
      }
    }));
  };

  // Clear answer for current question
  const handleClearAnswer = () => {
    soundFx.playClick();
    setIsAutoSaved(false);
    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        userAnswer: null,
        status: prev[qNum]?.status === 'answered_review' || prev[qNum]?.status === 'review' ? 'review' : 'unanswered'
      }
    }));
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    soundFx.playClick();
    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        bookmarked: !prev[qNum]?.bookmarked
      }
    }));
  };

  // Navigation handlers
  const handleNavigateTo = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    soundFx.playClick();
    setShowHint(false);

    const targetQNum = questions[index].questionNumber;
    setUserAnswers((prev) => {
      const state = prev[targetQNum];
      if (!state || state.status === 'not_visited') {
        return {
          ...prev,
          [targetQNum]: {
            userAnswer: null,
            status: 'unanswered',
            bookmarked: state?.bookmarked || false
          }
        };
      }
      return prev;
    });

    setCurrentIdx(index);
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      handleNavigateTo(currentIdx + 1);
    }
  };

  // Compute question stats
  const answeredCount = Object.values(userAnswers).filter(
    (a: any) => a.status === 'answered' || a.status === 'answered_review'
  ).length;

  const reviewCount = Object.values(userAnswers).filter(
    (a: any) => a.status === 'review' || a.status === 'answered_review'
  ).length;

  const unansweredCount = Object.values(userAnswers).filter(
    (a: any) => a.status === 'unanswered'
  ).length;

  const notVisitedCount = questions.length - (answeredCount + unansweredCount + reviewCount);

  // Final Exam Submission Helper
  const handleFinalSubmission = () => {
    handleFinalSubmissionWithAnswers(userAnswers);
  };

  const handleFinalSubmissionWithAnswers = async (answersToEvaluate: Record<number | string, UserAnswerState>) => {
    try {
      soundFx.playSuccess();
      setIsTimerRunning(false);

      const safeQuestionsList = Array.isArray(questions) ? questions : [];
      
      // Perform authoritative result calculation using comprehensive evaluator
      const result = calculateMockTestResult(
        safeQuestionsList,
        answersToEvaluate,
        testDurationMins,
        timeLeftSeconds,
        test?.totalMarks
      );

      console.log('--- MOCK TEST AUTHORITATIVE EVALUATION ---', {
        testId: test?.id,
        testTitle: test?.title,
        totalQuestions: result.totalQuestions,
        score: result.totalScore,
        totalMarks: result.totalMarks,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        skippedCount: result.skippedCount,
        percentage: result.percentage,
        accuracy: result.accuracy,
        evaluations: result.evaluatedQuestions.map(eq => ({
          qNum: eq.question.questionNumber,
          type: eq.question.type,
          userAnswer: eq.evaluation.displayUserAnswer,
          correctAnswer: eq.evaluation.displayCorrectAnswer,
          isCorrect: eq.evaluation.isCorrect,
          marksAwarded: eq.marksAwarded
        }))
      });

      // Sanitize answers object
      const sanitizedAnswers: Record<number | string, any> = {};
      Object.keys(answersToEvaluate || {}).forEach((k) => {
        const val = answersToEvaluate[k];
        if (val) {
          sanitizedAnswers[k] = {
            userAnswer: val.userAnswer === undefined ? null : val.userAnswer,
            status: val.status || 'unanswered',
            bookmarked: Boolean(val.bookmarked)
          };
        }
      });

      const attemptObj: MockAttempt = {
        id: `att_${userId}_${test?.id || 'mock'}_${Date.now()}`,
        userId: userId,
        studentId: userId,
        userName: userName || 'Student',
        testId: test?.id || 'test_1',
        mockTestId: test?.id || 'test_1',
        class: test?.class || 5,
        testTitle: test?.title || 'Class 5 Grand Mock Test',
        subject: test?.subject || 'Mathematics',
        subjectId: test?.subjectId || 'mathematics',
        testNumber: test?.testNumber || 1,
        score: result.totalScore,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        timeSpentSeconds: result.timeSpentSeconds,
        timeTaken: formatTime(result.timeSpentSeconds),
        answers: sanitizedAnswers,
        correctCount: result.correctCount,
        correctAnswers: result.correctCount,
        wrongCount: result.wrongCount,
        incorrectAnswers: result.wrongCount,
        skippedCount: result.skippedCount,
        unanswered: result.skippedCount,
        accuracy: result.accuracy,
        estimatedRank: 1,
        weakChapters: result.weakChapters.length > 0 ? result.weakChapters : [],
        strongChapters: result.strongChapters.length > 0 ? result.strongChapters : [],
        completedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      try {
        await saveCompletedMockTestAttempt(attemptObj);
      } catch (err) {
        console.warn('Attempt saved locally due to connection:', err);
      }

      setSavedAttempt(attemptObj);
      setShowSubmitConfirmModal(false);
      setShowResultModal(true);
    } catch (err) {
      console.error('Error submitting test attempt:', err);
      setShowSubmitConfirmModal(false);
      setShowResultModal(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden animate-fade-in">
      
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: Timer, Test Title, Fullscreen, AutoSave */}
      {/* ---------------------------------------------------- */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-md">
        
        {/* Left: Subject Tag & Test Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
            {test.subject}
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{test.title}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                {questions.length} Questions
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden md:block">
              Class 5 Official Examination Simulator • {test.totalMarks} Marks
            </p>
          </div>
        </div>

        {/* Center: Live Timer Countdown */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-sm sm:text-base flex items-center gap-2 shadow-inner transition ${
            timeLeftSeconds < 300
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-amber-400'
          }`}>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isAutoSaved ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{isAutoSaved ? 'Auto-Saved to Firestore' : 'Saving...'}</span>
          </div>
        </div>

        {/* Right Actions: Fullscreen & Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            title="Exit Mock Test"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Test</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN BODY: Question Canvas & Palette Sidebar */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT QUESTION CANVAS */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-slate-950 border-r border-slate-800 space-y-5">
          
          {/* Question Header & Section Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block mb-1">
                {currentQ.section || 'General Section'}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                  Question {qNum} of {questions.length}
                </span>
                <span>• {currentQ.chapter}</span>
                <span className="text-amber-400">• [{currentQ.marks || 2} Marks]</span>
              </div>
            </div>

            {/* Quick Actions: Mark for Review & Bookmark */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReview}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentAnswerState.status === 'review' || currentAnswerState.status === 'answered_review'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {currentAnswerState.status === 'review' || currentAnswerState.status === 'answered_review'
                    ? 'Marked for Review'
                    : 'Mark for Review'}
                </span>
              </button>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  currentAnswerState.bookmarked
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Bookmark Question"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Question Statement Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 space-y-4 shadow-md">
            <h2 className="text-base sm:text-lg font-bold leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Robust Universal Answer Area below the question */}
            {(() => {
              const qType = (currentQ.type || '').toLowerCase();
              const hasOptions = Array.isArray(currentQ.options) && currentQ.options.length > 0;
              const isTrueFalse = qType === 'true_false' || qType === 'truefalse' || qType === 'tf' || qType === 'boolean';
              const isBlank = qType === 'fill_in_blank' || qType === 'fill_in_blanks' || qType.includes('blank');
              const isAnswered = currentAnswerState.userAnswer !== null && currentAnswerState.userAnswer !== undefined && String(currentAnswerState.userAnswer).trim() !== '';

              return (
                <div className="pt-2 space-y-3" id={`answer_area_q_${qNum}`}>
                  {/* Header / Sub-label for Answer Area */}
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {hasOptions 
                          ? 'Select your answer:' 
                          : isTrueFalse 
                            ? 'Select True or False:' 
                            : isBlank 
                              ? 'Type your answer in the blank:' 
                              : 'Write your step-by-step solution / answer:'}
                      </span>
                    </span>

                    {isAnswered && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Answer Recorded
                        </span>
                        <button
                          type="button"
                          onClick={handleClearAnswer}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline transition cursor-pointer flex items-center gap-1"
                          title="Clear current selection or text"
                        >
                          <X className="w-3 h-3" /> Clear Answer
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1. Multiple Choice Questions (if options array exists or type is mcq) */}
                  {hasOptions ? (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options!.map((opt, optIdx) => {
                        const isSelected = 
                          Number(currentAnswerState.userAnswer) === optIdx ||
                          String(currentAnswerState.userAnswer) === String(optIdx) ||
                          String(currentAnswerState.userAnswer).trim().toLowerCase() === String(opt).trim().toLowerCase();
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            id={`btn_option_${qNum}_${optIdx}`}
                            onClick={() => handleUpdateAnswer(optIdx)}
                            className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium transition flex items-center justify-between border cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500'
                                : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-indigo-700/60 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border transition ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {optionLetter}
                              </div>
                              <span className="leading-snug">{opt}</span>
                            </div>

                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              isSelected 
                                ? 'border-indigo-400 bg-indigo-600 text-white' 
                                : 'border-slate-700 bg-slate-900 text-transparent'
                            }`}>
                              <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : isTrueFalse ? (
                    /* 2. True / False */
                    <div className="grid grid-cols-2 gap-4">
                      {['True', 'False'].map((tf) => {
                        const isSelected = String(currentAnswerState.userAnswer).trim().toLowerCase() === tf.toLowerCase();
                        return (
                          <button
                            key={tf}
                            type="button"
                            id={`btn_tf_${qNum}_${tf}`}
                            onClick={() => handleUpdateAnswer(tf)}
                            className={`p-5 rounded-2xl text-center font-black text-sm sm:text-base border transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-400'
                                : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <span>{tf}</span>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : isBlank ? (
                    /* 3. Fill in the blanks */
                    <div className="space-y-2">
                      <input
                        type="text"
                        id={`input_blank_${qNum}`}
                        value={currentAnswerState.userAnswer !== null && currentAnswerState.userAnswer !== undefined ? String(currentAnswerState.userAnswer) : ''}
                        onChange={(e) => handleUpdateAnswer(e.target.value)}
                        placeholder="Type your exact response / word / number here..."
                        className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-700 text-sm sm:text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                      />
                      <p className="text-[11px] text-slate-400">Your answer will be automatically checked against the exam marking key.</p>
                    </div>
                  ) : (
                    /* 4. Descriptive / One Mark / Two Mark / Four Mark / Essay / Previous Board / Universal Fallback */
                    <div className="space-y-2">
                      <textarea
                        rows={5}
                        id={`textarea_answer_${qNum}`}
                        value={currentAnswerState.userAnswer !== null && currentAnswerState.userAnswer !== undefined ? String(currentAnswerState.userAnswer) : ''}
                        onChange={(e) => handleUpdateAnswer(e.target.value)}
                        placeholder="Type your step-by-step solution, derivation, or explanation here..."
                        className="w-full p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner leading-relaxed"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Include formula steps, diagrams description, and final units for maximum marks.</span>
                        <span>{String(currentAnswerState.userAnswer || '').length} characters</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Socratic Hint Drawer */}
            <div className="pt-2">
              {showHint ? (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
                  <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-400">Examiner Hint: </span>
                    {currentQ.hint || 'Apply key chapter formula or concept to solve.'}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" /> Need examiner hint?
                </button>
              )}
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigateTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={handleSaveAndNext}
                disabled={currentIdx === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-extrabold text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Save & Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Exit Test
              </button>

              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Test
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT PALETTE SIDEBAR */}
        <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none">
          
          {/* Palette Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-400" />
                <span>Question Palette (1 - {questions.length})</span>
              </h3>
            </div>

            {/* Status Legend Badges */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
              <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 flex items-center justify-between">
                <span>Answered</span>
                <span className="font-black text-white">{answeredCount}</span>
              </div>

              <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/80 text-purple-300 flex items-center justify-between">
                <span>Marked for Review</span>
                <span className="font-black text-white">{reviewCount}</span>
              </div>

              <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 flex items-center justify-between">
                <span>Unanswered</span>
                <span className="font-black text-white">{unansweredCount}</span>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-between">
                <span>Not Visited</span>
                <span className="font-black text-slate-200">{notVisitedCount}</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setPaletteFilter('all')}
              className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                paletteFilter === 'all' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setPaletteFilter('unanswered')}
              className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                paletteFilter === 'unanswered' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400'
              }`}
            >
              Unanswered
            </button>
            <button
              onClick={() => setPaletteFilter('review')}
              className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                paletteFilter === 'review' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400'
              }`}
            >
              Review
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const st = userAnswers[q.questionNumber];
                const isCurrent = idx === currentIdx;
                const status = st?.status || 'not_visited';
                const isBookmarked = st?.bookmarked;

                if (paletteFilter === 'unanswered' && (status === 'answered' || status === 'answered_review')) return null;
                if (paletteFilter === 'review' && status !== 'review' && status !== 'answered_review') return null;

                // Determine box styling
                let bgStyle = 'bg-slate-950 text-slate-400 border-slate-800';
                if (status === 'answered') {
                  bgStyle = 'bg-emerald-600 text-white border-emerald-500 font-black shadow-sm';
                } else if (status === 'answered_review') {
                  bgStyle = 'bg-purple-600 text-white border-emerald-400 ring-2 ring-emerald-400 font-black';
                } else if (status === 'review') {
                  bgStyle = 'bg-purple-700 text-white border-purple-500 font-black';
                } else if (status === 'unanswered') {
                  bgStyle = 'bg-rose-900/80 text-rose-200 border-rose-700 font-bold';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => handleNavigateTo(idx)}
                    className={`relative h-9 rounded-xl border text-xs font-extrabold flex items-center justify-center transition cursor-pointer ${bgStyle} ${
                      isCurrent ? 'ring-2 ring-amber-400 scale-105 z-10' : 'hover:opacity-90'
                    }`}
                  >
                    <span>{q.questionNumber}</span>
                    {isBookmarked && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit CTA */}
          <div className="pt-2">
            <button
              onClick={() => setShowSubmitConfirmModal(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Mock Test</span>
            </button>
          </div>
        </aside>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Submit Mock Test?</h3>
                <p className="text-xs text-slate-400">Review your question attempt summary before submitting.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-emerald-400">Answered:</span>
                <span className="text-white font-black">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-purple-400">Marked for Review:</span>
                <span className="text-white font-black">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-rose-400">Unanswered:</span>
                <span className="text-white font-black">{unansweredCount}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-400">Not Visited:</span>
                <span className="text-white font-black">{notVisitedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition cursor-pointer"
              >
                Resume Test
              </button>
              <button
                onClick={handleFinalSubmission}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs text-white transition cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL POST-SUBMISSION RESULTS MODAL */}
      <MockTestResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          onClose();
        }}
        onRetake={() => {
          setShowResultModal(false);
          const initial: Record<number, UserAnswerState> = {};
          questions.forEach((q) => {
            initial[q.questionNumber] = {
              userAnswer: null,
              status: 'not_visited',
              bookmarked: false
            };
          });
          setUserAnswers(initial);
          setCurrentIdx(0);
          setTimeLeftSeconds(testDurationMins * 60);
          setIsTimerRunning(true);
        }}
        attempt={savedAttempt}
        questions={questions}
      />

    </div>
  );
};

