import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  FileText,
  Eye,
  Layers,
  ArrowRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { PreviousPaper, PreviousPaperQuestion } from '../../../types/previousPaper';
import { savePreviousPaperAttempt } from '../../../services/previousPaperService';

interface PreviousPaperPracticeModalProps {
  paper: PreviousPaper;
  userId: string;
  studentName?: string;
  onClose: () => void;
  onAttemptSaved?: () => void;
}

export const PreviousPaperPracticeModal: React.FC<PreviousPaperPracticeModalProps> = ({
  paper,
  userId,
  studentName = 'Student',
  onClose,
  onAttemptSaved
}) => {
  const questions: PreviousPaperQuestion[] = useMemo(() => {
    return paper.questions && paper.questions.length > 0 ? paper.questions : [];
  }, [paper]);

  // Active question index
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  
  // Student answers map: questionId -> answer
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  
  // Marked for review set
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

  // Active Section Filter
  const [activeSectionId, setActiveSectionId] = useState<string>('all');

  // Timer state
  const initialSeconds = (paper.durationMinutes || 120) * 60;
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Modal / Screen state: 'practice' | 'confirm_submit' | 'result'
  const [mode, setMode] = useState<'practice' | 'confirm_submit' | 'result'>('practice');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Result metrics
  const [resultData, setResultData] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    timeSpentSeconds: number;
  } | null>(null);

  // Review filter for result screen: 'all' | 'correct' | 'incorrect' | 'unanswered'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  // Start timer
  useEffect(() => {
    if (mode !== 'practice' || isTimerPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isTimerPaused]);

  // Format time (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  // Filtered question indices based on active section
  const sectionQuestions = useMemo(() => {
    if (activeSectionId === 'all') return questions;
    return questions.filter(q => q.sectionId === activeSectionId);
  }, [questions, activeSectionId]);

  // Handle selecting an MCQ option
  const handleSelectOption = (qId: string, optionIdx: number) => {
    soundFx.playClick();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  // Handle text input (fill in blank / short answer)
  const handleTextAnswerChange = (qId: string, val: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  // Clear current question answer
  const handleClearAnswer = (qId: string) => {
    soundFx.playClick();
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // Toggle mark for review
  const handleToggleReview = (qId: string) => {
    soundFx.playClick();
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Calculate stats
  const stats = useMemo(() => {
    let answered = 0;
    let reviewed = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] !== undefined && userAnswers[q.id] !== '') {
        answered++;
      }
      if (markedForReview[q.id]) {
        reviewed++;
      }
    });
    return {
      total: questions.length,
      answered,
      unanswered: questions.length - answered,
      reviewed
    };
  }, [questions, userAnswers, markedForReview]);

  // Evaluation & submission logic
  const evaluateAndSubmit = async () => {
    setIsSubmitting(true);
    let totalScore = 0;
    let maxMarks = paper.totalMarks || 50;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const uAns = userAnswers[q.id];
      const qMarks = q.marks || 1;

      if (uAns === undefined || uAns === '') {
        unanswered++;
      } else {
        if (q.type === 'mcq') {
          if (Number(uAns) === Number(q.correctAnswer)) {
            correct++;
            totalScore += qMarks;
          } else {
            incorrect++;
          }
        } else {
          // String normalized matching for fill in blank / short answer
          const normalizedUser = String(uAns).trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          const normalizedCorrect = String(q.correctAnswer).trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          
          if (normalizedUser === normalizedCorrect || normalizedCorrect.includes(normalizedUser) && normalizedUser.length > 2) {
            correct++;
            totalScore += qMarks;
          } else {
            // Give partial credit or check keywords
            const keywords = normalizedCorrect.split(/\s+/).filter(k => k.length > 3);
            const matchedCount = keywords.filter(k => normalizedUser.includes(k)).length;
            if (keywords.length > 0 && matchedCount / keywords.length >= 0.5) {
              correct++;
              totalScore += qMarks * 0.8;
            } else {
              incorrect++;
            }
          }
        }
      }
    });

    const roundedScore = Math.round(totalScore * 10) / 10;
    const pct = maxMarks > 0 ? Math.min(100, Math.round((roundedScore / maxMarks) * 100)) : 0;
    const timeSpent = initialSeconds - timeLeft;

    const res = {
      score: roundedScore,
      totalMarks: maxMarks,
      percentage: pct,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      timeSpentSeconds: timeSpent
    };

    setResultData(res);

    try {
      await savePreviousPaperAttempt({
        studentId: userId,
        studentName,
        paperId: paper.id,
        paperTitle: paper.title,
        class: paper.class,
        classGrade: paper.classGrade || `Class ${paper.class}`,
        subjectId: paper.subjectId,
        subject: paper.subject,
        year: paper.year,
        examType: paper.examType,
        score: roundedScore,
        totalMarks: maxMarks,
        percentage: pct,
        correctCount: correct,
        incorrectCount: incorrect,
        unansweredCount: unanswered,
        totalQuestions: questions.length,
        timeSpentSeconds: timeSpent,
        answers: userAnswers
      });
      if (onAttemptSaved) onAttemptSaved();
    } catch (e) {
      console.warn('Could not save paper attempt:', e);
    }

    setIsSubmitting(false);
    setMode('result');
    soundFx.playSuccess();
  };

  const handleAutoSubmit = () => {
    evaluateAndSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: ACTIVE PRACTICE EXAM */}
        {/* ========================================================================= */}
        {mode === 'practice' && (
          <>
            {/* Top Bar Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase">
                      {paper.classGrade || `Class ${paper.class}`} • {paper.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {paper.examType}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md">
                    {paper.title}
                  </h2>
                </div>
              </div>

              {/* Timer & Controls */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono font-black text-sm sm:text-base ${
                  timeLeft < 300 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-cyan-400 border-slate-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>

                <button
                  onClick={() => setMode('confirm_submit')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Paper</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close Exam"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Section Tabs Bar */}
            <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
              <button
                onClick={() => { soundFx.playClick(); setActiveSectionId('all'); }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  activeSectionId === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Questions ({questions.length})
              </button>
              {paper.sections?.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => { soundFx.playClick(); setActiveSectionId(sec.id); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                    activeSectionId === sec.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sec.name} ({sec.questionCount || 0})
                </button>
              ))}
            </div>

            {/* Main Exam Content Layout (2 Columns on large screens) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* LEFT: Active Question & Interactive Input Area */}
              <div className="flex-1 p-5 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
                {currentQ ? (
                  <div className="space-y-6">
                    {/* Question Header & Meta */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center">
                          {currentQ.qNo}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            {currentQ.sectionName || 'Section Question'}
                          </div>
                          {currentQ.chapter && (
                            <div className="text-[11px] text-slate-500">
                              Topic: {currentQ.chapter}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold">
                          {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                        </span>
                        <button
                          onClick={() => handleToggleReview(currentQ.id)}
                          className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            markedForReview[currentQ.id]
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${markedForReview[currentQ.id] ? 'fill-current' : ''}`} />
                          <span className="hidden sm:inline">
                            {markedForReview[currentQ.id] ? 'Marked' : 'Mark for Review'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Question Text (English & Telugu Bilingual) */}
                    <div className="space-y-3">
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                        {currentQ.question}
                      </p>
                      {currentQ.questionTe && (
                        <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 leading-relaxed font-sans">
                          <span className="font-bold text-cyan-600 mr-1.5">తెలుగు:</span>
                          {currentQ.questionTe}
                        </p>
                      )}
                    </div>

                    {/* Universal Responsive Answer Area */}
                    {(() => {
                      const qType = (currentQ.type || '').toLowerCase();
                      const hasOptions = Array.isArray(currentQ.options) && currentQ.options.length > 0;
                      const isTrueFalse = qType === 'true_false' || qType === 'truefalse' || qType === 'tf' || qType === 'boolean';
                      const isBlank = qType === 'fill_in_blank' || qType === 'fill_in_blanks' || qType.includes('blank');

                      if (hasOptions) {
                        return (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                              Select the correct option:
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {currentQ.options!.map((optText, optIdx) => {
                                const isSelected = 
                                  userAnswers[currentQ.id] === optIdx ||
                                  String(userAnswers[currentQ.id]) === String(optIdx) ||
                                  String(userAnswers[currentQ.id]).trim().toLowerCase() === String(optText).trim().toLowerCase();
                                const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                                    className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-950 dark:text-cyan-100 shadow-md ring-2 ring-cyan-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3.5">
                                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-cyan-600 text-white'
                                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                      }`}>
                                        {optionLetters[optIdx] || optIdx + 1}
                                      </span>
                                      <span className="font-bold text-sm sm:text-base">{optText}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      isSelected ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else if (isTrueFalse) {
                        return (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                              Select True or False:
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {['True', 'False'].map((tf) => {
                                const isSelected = String(userAnswers[currentQ.id]).trim().toLowerCase() === tf.toLowerCase();
                                return (
                                  <button
                                    key={tf}
                                    type="button"
                                    onClick={() => handleTextAnswerChange(currentQ.id, tf)}
                                    className={`p-5 rounded-2xl text-center font-black text-sm sm:text-base border transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 ring-2 ring-cyan-400'
                                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-cyan-50/50'
                                    }`}
                                  >
                                    <span>{tf}</span>
                                    {isSelected && <Check className="w-5 h-5 text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else if (isBlank) {
                        return (
                          <div className="space-y-3 pt-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                              Type your answer in the blank:
                            </label>
                            <input
                              type="text"
                              value={userAnswers[currentQ.id] || ''}
                              onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                              placeholder="Type your exact answer or numerical value here..."
                              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className="space-y-3 pt-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                              Type your answer / step-by-step solution:
                            </label>
                            <textarea
                              rows={5}
                              value={userAnswers[currentQ.id] || ''}
                              onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                              placeholder="Type your answer, numerical value, or detailed explanation here..."
                              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed shadow-inner"
                            />
                          </div>
                        );
                      }
                    })()}

                    {/* Clear response action */}
                    {userAnswers[currentQ.id] !== undefined && userAnswers[currentQ.id] !== '' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleClearAnswer(currentQ.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear Answer</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No question selected.
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => { soundFx.playClick(); setCurrentIdx(prev => Math.max(0, prev - 1)); }}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs font-bold text-slate-500">
                    Question {currentIdx + 1} of {questions.length}
                  </div>

                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => { soundFx.playClick(); setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1)); }}
                    className="px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm shadow-md shadow-cyan-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT: Question Palette & Overview Sidebar */}
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/90 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0 space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-500" />
                      <span>Question Palette</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      {stats.answered}/{stats.total} Answered
                    </span>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Answered ({stats.answered})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Unanswered ({stats.unanswered})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Marked ({stats.reviewed})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan-600 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Current Q</span>
                    </div>
                  </div>

                  {/* Number Grid */}
                  <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                    {questions.map((q, idx) => {
                      const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                      const isMarked = markedForReview[q.id];
                      const isCurrent = currentIdx === idx;

                      let btnStyle = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                      if (isAnswered) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-black';
                      }
                      if (isMarked) {
                        btnStyle = 'bg-amber-500 text-white border-amber-400 font-black ring-2 ring-amber-300';
                      }
                      if (isCurrent) {
                        btnStyle = 'bg-cyan-600 text-white border-cyan-400 font-black ring-2 ring-cyan-400';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            soundFx.playClick();
                            setCurrentIdx(idx);
                          }}
                          className={`h-10 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center relative ${btnStyle}`}
                        >
                          {q.qNo}
                          {isMarked && (
                            <span className="w-2 h-2 rounded-full bg-amber-300 absolute top-1 right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Callout Card */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Ready to Finish?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Submit your answers when done to receive instant score and step-by-step solutions.
                  </p>
                  <button
                    onClick={() => setMode('confirm_submit')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                  >
                    Finish & Submit
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: CONFIRM SUBMISSION MODAL */}
        {/* ========================================================================= */}
        {mode === 'confirm_submit' && (
          <div className="flex-1 p-6 sm:p-12 flex items-center justify-center overflow-y-auto">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Submit Examination Paper?
                </h3>
                <p className="text-xs text-slate-500">
                  Review your completion status before final submission:
                </p>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.answered}</div>
                  <div className="text-[10px] uppercase font-black text-slate-500">Answered</div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20">
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.unanswered}</div>
                  <div className="text-[10px] uppercase font-black text-slate-500">Unanswered</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.reviewed}</div>
                  <div className="text-[10px] uppercase font-black text-slate-500">Marked</div>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Time Remaining: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatTime(timeLeft)}</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setMode('practice')}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Return to Paper
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={evaluateAndSubmit}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: RESULT & COMPREHENSIVE QUESTION REVIEW */}
        {/* ========================================================================= */}
        {mode === 'result' && resultData && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Result Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-teal-950 to-cyan-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-b border-cyan-500/30 shrink-0">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Exam Practice Completed</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {paper.title}
                </h2>
                <p className="text-xs text-slate-300">
                  Attempt saved to your Learning Progress. Review each question's detailed step-by-step solution below.
                </p>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {resultData.score} / {resultData.totalMarks}
                  </div>
                  <div className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Score Earned</div>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-cyan-600 text-white text-center shadow-lg shadow-cyan-600/30">
                  <div className="text-2xl sm:text-3xl font-black">{resultData.percentage}%</div>
                  <div className="text-[10px] text-cyan-100 font-extrabold uppercase tracking-wider">Percentage</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
              <div className="flex items-center gap-6">
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct: {resultData.correctCount}</span>
                </span>
                <span className="font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Incorrect: {resultData.incorrectCount}</span>
                </span>
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Time: {Math.round(resultData.timeSpentSeconds / 60)} mins</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setMarkedForReview({});
                    setCurrentIdx(0);
                    setTimeLeft(initialSeconds);
                    setMode('practice');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Paper</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black transition cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>

            {/* Step-by-Step Question Review List */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-500" />
                <span>Complete Question Solutions & Explanations ({questions.length})</span>
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const uAns = userAnswers[q.id];
                  const hasAnswered = uAns !== undefined && uAns !== '';
                  let isCorrect = false;

                  if (hasAnswered) {
                    if (q.type === 'mcq') {
                      isCorrect = Number(uAns) === Number(q.correctAnswer);
                    } else {
                      const nu = String(uAns).trim().toLowerCase();
                      const nc = String(q.correctAnswer).trim().toLowerCase();
                      isCorrect = nu === nc || (nc.includes(nu) && nu.length > 2);
                    }
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-3xl border transition space-y-3 ${
                        !hasAnswered
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                          : isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                            {q.qNo}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {q.sectionName || 'Question'} • {q.marks} Marks
                          </span>
                        </div>

                        <div>
                          {!hasAnswered ? (
                            <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                              Unanswered
                            </span>
                          ) : isCorrect ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black flex items-center gap-1">
                              <Check className="w-3 h-3" /> Correct (+{q.marks})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-black flex items-center gap-1">
                              <X className="w-3 h-3" /> Incorrect (0/{q.marks})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {q.question}
                      </p>
                      {q.questionTe && (
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl">
                          <span className="font-bold text-cyan-600 mr-1">తెలుగు:</span>
                          {q.questionTe}
                        </p>
                      )}

                      {/* Options or text answer comparisons */}
                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isOptCorrect = Number(q.correctAnswer) === oIdx;
                            const isUserSelected = Number(uAns) === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isOptCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                                    : isUserSelected && !isCorrect
                                      ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span>{['A', 'B', 'C', 'D'][oIdx]}. {opt}</span>
                                {isOptCorrect && <span className="text-[10px] uppercase font-black text-emerald-600">Correct Answer</span>}
                                {isUserSelected && !isOptCorrect && <span className="text-[10px] uppercase font-black text-rose-600">Your Choice</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(q.type === 'fill_in_blank' || q.type === 'short_answer' || q.type === 'long_answer') && (
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-slate-500">Your Answer:</div>
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                            {uAns || <span className="text-slate-400 italic">No answer submitted</span>}
                          </div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 pt-1">Model / Correct Answer:</div>
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-semibold">
                            {String(q.correctAnswer)}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <div className="font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Step-by-Step Solution & Concept:</span>
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
