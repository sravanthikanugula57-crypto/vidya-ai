import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { QuizDoc, QuizAttemptDoc } from '../../../types/quiz';
import { submitQuizAttempt } from '../../../services/quizService';
import { soundFx } from '../../../lib/audio';

interface MockTestPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizDoc;
  student: {
    id: string;
    name: string;
    email: string;
    class: number;
    board: string;
  };
  onAttemptCompleted?: (attempt: QuizAttemptDoc) => void;
}

export const MockTestPlayerModal: React.FC<MockTestPlayerModalProps> = ({
  isOpen,
  onClose,
  quiz,
  student,
  onAttemptCompleted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(((quiz?.durationMinutes) || 45) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttemptDoc | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'answered'>('all');
  
  const startTimeRef = useRef<string>(new Date().toISOString());

  // Reset state when opening
  useEffect(() => {
    if (isOpen && quiz) {
      setCurrentIndex(0);
      setAnswers({});
      setBookmarked({});
      setTimeLeftSeconds((quiz.durationMinutes || 45) * 60);
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
      setCompletedAttempt(null);
      startTimeRef.current = new Date().toISOString();
    }
  }, [isOpen, quiz?.quizId]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !quiz || completedAttempt) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quiz?.quizId, completedAttempt]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim() !== '').length;
  const unansweredCount = totalQuestions - answeredCount;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (option: string) => {
    soundFx.playClick();
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionId]: option
    }));
  };

  const handleClearAnswer = () => {
    soundFx.playClick();
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.questionId];
      return copy;
    });
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting || completedAttempt) return;
    try {
      soundFx.playError();
    } catch (e) {}
    await performSubmit();
  };

  const performSubmit = async () => {
    setIsSubmitting(true);
    try {
      const attempt = await submitQuizAttempt(
        quiz,
        student,
        answers,
        startTimeRef.current
      );
      soundFx.playSuccess();
      setCompletedAttempt(attempt);
      if (onAttemptCompleted) {
        onAttemptCompleted(attempt);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // If test is completed, render authoritative result view with detailed explanations
  if (completedAttempt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase opacity-90">Mock Test Submitted</span>
                <h2 className="text-xl font-black">{quiz.title}</h2>
                <p className="text-xs opacity-80">{student.name} • Class {student.class} • {quiz.subject}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Performance Summary Cards */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-slate-500">Score</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {completedAttempt.score} <span className="text-xs text-slate-400">/ {completedAttempt.totalMarks}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{completedAttempt.percentage}% Accuracy</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-emerald-600">Correct</span>
              <div className="text-2xl font-black text-emerald-600">
                {completedAttempt.correctCount}
              </div>
              <span className="text-xs text-slate-500">+{completedAttempt.correctCount} Marks</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-rose-600">Wrong</span>
              <div className="text-2xl font-black text-rose-600">
                {completedAttempt.wrongCount}
              </div>
              <span className="text-xs text-slate-500">Needs Review</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase text-amber-600">Unanswered</span>
              <div className="text-2xl font-black text-amber-600">
                {completedAttempt.unansweredCount}
              </div>
              <span className="text-xs text-slate-500">Skipped</span>
            </div>
          </div>

          {/* Question-Wise Result & Explanations Review */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Comprehensive Question Solutions & SCERT Explanations ({completedAttempt.questionResults.length} Questions)
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Status: Recorded in Firestore
              </span>
            </div>

            <div className="space-y-4">
              {completedAttempt.questionResults.map((qr, idx) => (
                <div
                  key={qr.questionId}
                  className={`p-4 rounded-2xl border transition text-xs space-y-3 ${
                    qr.isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                      : qr.studentAnswer
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-black text-slate-800 dark:text-slate-200">
                        Q{idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {qr.questionText}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {qr.isCorrect ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{qr.marksAwarded})
                        </span>
                      ) : qr.studentAnswer ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[10px] flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Wrong (0/{qr.maxMarks})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-extrabold text-[10px]">
                          Unanswered (0/{qr.maxMarks})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {qr.options.map((opt, optIdx) => {
                      const isCorrect = opt === qr.correctAnswer;
                      const isSelected = opt === qr.studentAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 font-bold text-emerald-900 dark:text-emerald-100'
                              : isSelected
                              ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-400 font-bold text-rose-900 dark:text-rose-100'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>
                            <span className="font-extrabold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300">
                              Correct Key
                            </span>
                          )}
                          {!isCorrect && isSelected && (
                            <span className="text-[10px] uppercase font-black text-rose-700 dark:text-rose-300">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Examiner Explanation:</span>
                    <span>{qr.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Results synchronized live to MDM & Faculty Dashboard
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition cursor-pointer"
            >
              Done & Return to Mock Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Test In Progress View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-sm shadow">
              10
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                AP SSC Board Examination Simulator
              </span>
              <h1 className="text-base font-black truncate max-w-md">{quiz.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Countdown Timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-black text-sm border shadow-inner ${
              timeLeftSeconds < 300
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              title="Close or Submit"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Question Area (Left) */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {currentQuestion ? (
              <>
                {/* Question Info Bar */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="font-bold text-slate-500">
                      {quiz.subject} • {currentQuestion.marks || 1} Mark
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {answers[currentQuestion.questionId] && (
                      <button
                        onClick={handleClearAnswer}
                        className="text-slate-400 hover:text-rose-600 text-xs font-bold transition"
                      >
                        Clear Response
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="space-y-4">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestion.questionText}
                  </p>

                  {/* 4 Options Grid */}
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = answers[currentQuestion.questionId] === option;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white ring-2 ring-emerald-500/20 shadow-sm'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                            }`}>
                              {letter}
                            </span>
                            <span className="font-semibold text-sm">{option}</span>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      currentIndex === 0
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs font-extrabold text-slate-500">
                    {answeredCount} Answered • {unansweredCount} Remaining
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === totalQuestions - 1}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      currentIndex === totalQuestions - 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">No question selected</div>
            )}
          </div>

          {/* Question Palette Sidebar (Right) */}
          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-850 p-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Question Palette ({totalQuestions})
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((answeredCount / totalQuestions) * 100)}% Complete
                </span>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500">
                  <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-none pr-1">
              <div className="grid grid-cols-5 gap-2">
                {(quiz.questions || []).map((q, idx) => {
                  const isAnswered = Boolean(answers[q.questionId]);
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => {
                        soundFx.playClick();
                        setCurrentIndex(idx);
                      }}
                      className={`h-9 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center relative ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-4 mt-auto">
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center space-x-3 text-emerald-600">
              <ShieldCheck className="w-7 h-7" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Submit Mock Test?</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              You have answered <span className="font-bold text-emerald-600">{answeredCount}</span> of{' '}
              <span className="font-bold">{totalQuestions}</span> questions.
              {unansweredCount > 0 && (
                <span className="text-amber-600 block mt-1 font-bold">
                  ⚠️ {unansweredCount} question{unansweredCount > 1 ? 's are' : ' is'} still unanswered!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Keep Testing
              </button>
              <button
                onClick={performSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
