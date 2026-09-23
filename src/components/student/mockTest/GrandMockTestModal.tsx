import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Send, 
  AlertCircle,
  X,
  Sparkles,
  BarChart3,
  BookOpen,
  Check,
  RotateCcw
} from 'lucide-react';
import { GRAND_MOCK_100_QUESTIONS, MockQuestion } from '../../../data/grandMockTestData';
import { logGrandMockAttempt, GrandMockResult } from '../../../services/studentActivityService';
import { soundFx } from '../../../lib/audio';

interface GrandMockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  studentClass?: string;
  onTestCompleted?: (result: GrandMockResult) => void;
}

type QuestionStatus = 'not_visited' | 'answered' | 'unanswered' | 'marked_for_review' | 'answered_and_marked';

export const GrandMockTestModal: React.FC<GrandMockTestModalProps> = ({
  isOpen,
  onClose,
  studentUid,
  studentName,
  studentEmail,
  studentClass = 'Class 10',
  onTestCompleted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [activeSection, setActiveSection] = useState<'All' | 'Mathematics' | 'Physical Science' | 'Biological Science' | 'Social Studies'>('All');
  
  // Timer: 180 minutes = 10,800 seconds
  const [secondsRemaining, setSecondsRemaining] = useState(180 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [testResult, setTestResult] = useState<GrandMockResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isSubmitted]);

  if (!isOpen) return null;

  const currentQ = GRAND_MOCK_100_QUESTIONS[currentIndex];

  // Helper to format time remaining HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (idx: number): QuestionStatus => {
    const isAns = selectedAnswers[idx] !== undefined;
    const isMarked = !!markedForReview[idx];
    const isVis = !!visited[idx];

    if (isAns && isMarked) return 'answered_and_marked';
    if (isAns) return 'answered';
    if (isMarked) return 'marked_for_review';
    if (isVis) return 'unanswered';
    return 'not_visited';
  };

  const handleSelectAnswer = (optionIndex: number) => {
    soundFx.playClick();
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex
    });
  };

  const handleClearAnswer = () => {
    soundFx.playPop();
    const updated = { ...selectedAnswers };
    delete updated[currentIndex];
    setSelectedAnswers(updated);
  };

  const handleToggleMarkReview = () => {
    soundFx.playClick();
    setMarkedForReview({
      ...markedForReview,
      [currentIndex]: !markedForReview[currentIndex]
    });
  };

  const goToQuestion = (idx: number) => {
    if (idx < 0 || idx >= GRAND_MOCK_100_QUESTIONS.length) return;
    setVisited({ ...visited, [idx]: true });
    setCurrentIndex(idx);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));

    // Calculate score
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    const breakdown = {
      mathematics: { score: 0, max: 25, correct: 0, wrong: 0, unattempted: 0 },
      physicalScience: { score: 0, max: 25, correct: 0, wrong: 0, unattempted: 0 },
      biologicalScience: { score: 0, max: 25, correct: 0, wrong: 0, unattempted: 0 },
      socialStudies: { score: 0, max: 25, correct: 0, wrong: 0, unattempted: 0 }
    };

    GRAND_MOCK_100_QUESTIONS.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = selected === q.correctAnswer;
      const isAns = selected !== undefined;

      let key: keyof typeof breakdown = 'mathematics';
      if (q.subject === 'Physical Science') key = 'physicalScience';
      else if (q.subject === 'Biological Science') key = 'biologicalScience';
      else if (q.subject === 'Social Studies') key = 'socialStudies';

      if (!isAns) {
        unattemptedCount++;
        breakdown[key].unattempted++;
      } else if (isCorrect) {
        correctCount++;
        totalScore += q.marks;
        breakdown[key].correct++;
        breakdown[key].score += q.marks;
      } else {
        wrongCount++;
        breakdown[key].wrong++;
      }
    });

    const result: GrandMockResult = {
      testId: 'ap_ssc_grand_mock_100',
      testTitle: 'AP SSC Class 10 State Board 100-Q Grand Mock Test',
      studentUid,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || '',
      class: studentClass,
      totalScore,
      maxScore: 100,
      percentage: Math.round((totalScore / 100) * 100),
      correctCount,
      wrongCount,
      unattemptedCount,
      timeTakenMinutes: timeSpentMinutes,
      subjectBreakdown: breakdown,
      submittedAt: new Date().toISOString()
    };

    try {
      await logGrandMockAttempt(result);
      setTestResult(result);
      setIsSubmitted(true);
      soundFx.playSuccess();
      if (onTestCompleted) onTestCompleted(result);
    } catch (e) {
      console.error('Submit mock test error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter questions for current section in question grid
  const filteredQuestions = GRAND_MOCK_100_QUESTIONS.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
    if (activeSection === 'All') return true;
    return q.subject === activeSection;
  });

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalMarked = Object.values(markedForReview).filter(Boolean).length;
  const totalUnattempted = 100 - totalAnswered;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[94vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in">
        
        {/* Top Navigation / Status Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md">
              100
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
                AP SSC Class 10 Grand Mock Test (100 Questions)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real State Board Examination Simulator • Student: <strong className="text-blue-600 dark:text-blue-400">{studentName}</strong>
              </p>
            </div>
          </div>

          {!isSubmitted ? (
            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-black text-sm shadow-sm ${
                secondsRemaining < 600 
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 animate-pulse border border-rose-300' 
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
              }`}>
                <Clock className="w-4 h-4 text-rose-500" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Test</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section Tabs */}
        {!isSubmitted && (
          <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(['All', 'Mathematics', 'Physical Science', 'Biological Science', 'Social Studies'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                    activeSection === sec
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sec} {sec === 'All' ? '(100)' : '(25)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {totalAnswered} Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> {totalMarked} Review
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> {totalUnattempted} Left
              </span>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT: Question Interface OR Result View */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
            {!isSubmitted ? (
              <div className="space-y-6 max-w-3xl">
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                      Question {currentQ.questionNumber} of 100
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {currentQ.subject} • {currentQ.chapter}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    +1.0 Mark
                  </span>
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(optIdx)}
                        className={`w-full p-4 rounded-2xl text-left font-medium text-sm transition cursor-pointer flex items-center gap-4 border ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMarkReview}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        markedForReview[currentIndex]
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{markedForReview[currentIndex] ? 'Marked for Review' : 'Mark for Review'}</span>
                    </button>

                    {selectedAnswers[currentIndex] !== undefined && (
                      <button
                        onClick={handleClearAnswer}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => goToQuestion(currentIndex + 1)}
                      disabled={currentIndex === GRAND_MOCK_100_QUESTIONS.length - 1}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 shadow transition cursor-pointer"
                    >
                      <span>Save & Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= RESULTS / ANALYSIS SCREEN ================= */
              <div className="space-y-6 max-w-4xl animate-fade-in">
                {/* Result Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                        Official Exam Evaluation Completed
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-black">
                        Saved in Firestore
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black">
                      Score: {testResult?.totalScore} / 100 ({testResult?.percentage}%)
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100">
                      Great job, {studentName}! Your test attempt has been verified against the official SSC answer key and logged in Teacher CMS.
                    </p>
                  </div>

                  <div className="text-center bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-amber-300">
                      {testResult?.percentage}%
                    </div>
                    <div className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">
                      Aggregate Performance
                    </div>
                  </div>
                </div>

                {/* Subject Breakdown Cards */}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Subject-Wise Breakdown (25 Marks Each)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {testResult && [
                      { title: 'Mathematics', data: testResult.subjectBreakdown.mathematics, color: 'border-blue-500 text-blue-600' },
                      { title: 'Physical Science', data: testResult.subjectBreakdown.physicalScience, color: 'border-emerald-500 text-emerald-600' },
                      { title: 'Biological Science', data: testResult.subjectBreakdown.biologicalScience, color: 'border-purple-500 text-purple-600' },
                      { title: 'Social Studies', data: testResult.subjectBreakdown.socialStudies, color: 'border-amber-500 text-amber-600' }
                    ].map((sb) => (
                      <div key={sb.title} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                        <div className="font-bold text-xs text-slate-700 dark:text-slate-300">{sb.title}</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {sb.data.score} / 25
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="text-emerald-600 font-bold">{sb.data.correct} Correct</span>
                          <span>•</span>
                          <span className="text-rose-600 font-bold">{sb.data.wrong} Wrong</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
                  >
                    Close & Return to Portal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Question Palette (1 to 100) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col justify-between overflow-hidden">
            <div className="overflow-y-auto pr-1">
              <div className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Question Palette ({filteredQuestions.length})</span>
                <span className="text-[10px] font-semibold text-slate-400">{activeSection}</span>
              </div>

              {/* Grid of 100 questions */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {filteredQuestions.map((q) => {
                  const origIdx = q.originalIndex;
                  const status = getQuestionStatus(origIdx);
                  const isCurrent = currentIndex === origIdx;

                  let bgClass = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
                  if (status === 'answered') bgClass = 'bg-emerald-500 text-white font-black shadow-sm';
                  else if (status === 'marked_for_review') bgClass = 'bg-amber-400 text-slate-950 font-black';
                  else if (status === 'answered_and_marked') bgClass = 'bg-purple-600 text-white font-black';
                  else if (status === 'unanswered') bgClass = 'bg-rose-500 text-white font-black';

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(origIdx)}
                      className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${bgClass} ${
                        isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                      title={`Q${q.questionNumber}: ${q.subject}`}
                    >
                      {q.questionNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[10px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400 shrink-0"></span>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500 shrink-0"></span>
                <span>Visited but Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 shrink-0"></span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal before Submit */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Confirm Grand Mock Submission?
                </h3>
                <p className="text-xs text-slate-500">
                  Please review your attempt status before final submission:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Answered Questions:</span>
                  <span className="text-emerald-600">{totalAnswered} / 100</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Marked for Review:</span>
                  <span className="text-amber-600">{totalMarked}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Unanswered Questions:</span>
                  <span className="text-rose-600">{totalUnattempted}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Return to Test
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Grading Test...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
