import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Send, 
  Sparkles,
  BookOpen,
  Award,
  FileCheck,
  Save,
  Download,
  ExternalLink,
  Paperclip,
  Calendar
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  RealHomeworkDoc, 
  RealHomeworkSubmissionDoc, 
  recordStudentHomeworkStart,
  saveStudentHomeworkProgress,
  submitStudentHomeworkWithAutoEvaluation
} from '../../../services/realHomeworkService';

interface StudentSolveHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: RealHomeworkDoc;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentClass: string;
  existingSubmission?: RealHomeworkSubmissionDoc | null;
  onSubmitted?: (res: { score: number; maxScore: number; hasSubjectivePending: boolean }) => void;
}

export const StudentSolveHomeworkModal: React.FC<StudentSolveHomeworkModalProps> = ({
  isOpen,
  onClose,
  homework,
  studentId,
  studentName,
  studentEmail,
  studentClass,
  existingSubmission,
  onSubmitted
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);
  const [progressSavedMsg, setProgressSavedMsg] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    maxScore: number;
    hasSubjectivePending: boolean;
  } | null>(null);

  const questions = homework?.questions || [];
  const currentQ = questions[activeQuestionIdx];

  // 1. Record start on mount
  useEffect(() => {
    if (isOpen && homework) {
      recordStudentHomeworkStart({
        homeworkId: homework.id,
        studentId,
        studentName,
        studentEmail,
        studentClass,
        maxScore: homework.totalMarks,
        subject: homework.subject,
        chapterId: homework.chapterId,
        chapterName: homework.chapterName,
        assignmentTitle: homework.title
      }).catch(console.warn);

      // Pre-fill existing answers if resuming
      if (existingSubmission?.answers) {
        const initialAnswers: Record<string, string> = {};
        Object.keys(existingSubmission.answers).forEach((qId) => {
          initialAnswers[qId] = existingSubmission.answers[qId].studentAnswer || '';
        });
        setAnswers(initialAnswers);
      }
    }
  }, [isOpen, homework?.id, studentId]);

  if (!isOpen || !homework) return null;

  const handleSelectAnswer = (qId: string, answerText: string) => {
    soundFx.playClick();
    setAnswers(prev => ({ ...prev, [qId]: answerText }));
  };

  const answeredCount = questions.filter(q => !!(answers[q.id]?.trim())).length;
  const isAllAnswered = answeredCount === questions.length;

  const handleSaveProgress = async () => {
    soundFx.playClick();
    setIsSavingProgress(true);
    try {
      await saveStudentHomeworkProgress({
        homework,
        studentId,
        studentName,
        studentEmail,
        studentClass,
        rawAnswers: answers
      });
      soundFx.playSuccess();
      setProgressSavedMsg('Progress saved to draft!');
      setTimeout(() => setProgressSavedMsg(null), 3000);
    } catch (err) {
      console.error('Save progress error:', err);
      soundFx.playError();
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount === 0) {
      soundFx.playError();
      alert('Please answer at least one question before submitting.');
      return;
    }

    soundFx.playClick();
    setIsSubmitting(true);

    try {
      const result = await submitStudentHomeworkWithAutoEvaluation({
        homework,
        studentId,
        studentName,
        studentEmail,
        studentClass,
        rawAnswers: answers
      });

      soundFx.playSuccess();
      setSubmissionResult(result);
      onSubmitted?.(result);
    } catch (err) {
      console.error('Submission error:', err);
      soundFx.playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold">
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{homework.class}</span>
                <span>•</span>
                <span>{homework.subject}</span>
                <span>•</span>
                <span>{homework.chapterName}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {homework.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If submission successful modal view */}
        {submissionResult ? (
          <div className="p-8 sm:p-12 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Homework Submitted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Your answers have been stored in Firestore and your teacher has been notified.
              </p>
            </div>

            {/* Score & Auto-Evaluation Banner */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 max-w-sm mx-auto space-y-2">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Objective Auto-Evaluated Score
              </span>
              <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                {submissionResult.score} / {submissionResult.maxScore} Marks
              </div>
              {submissionResult.hasSubjectivePending ? (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold block">
                  ⏳ Subjective questions submitted for teacher review & marks.
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  ✓ All objective questions evaluated with stored answer keys.
                </span>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                Back to Homework Center
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions & Metadata Bar */}
            <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 font-medium">
                <span className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Due: {homework.dueDate || 'No due date'}</span>
                </span>
                <span className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-200">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Total: {homework.totalMarks} Marks</span>
                </span>
                {homework.instructions && (
                  <span className="text-slate-500 dark:text-slate-400 italic max-w-md truncate">
                    Note: {homework.instructions}
                  </span>
                )}
              </div>

              {homework.attachmentUrl && (
                <a
                  href={homework.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={homework.attachmentName || 'assignment_attachment'}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-xs font-bold transition shadow-sm"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[160px]">{homework.attachmentName || 'View Attachment'}</span>
                  <Download className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Question Progress Bar */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  Question {activeQuestionIdx + 1} of {questions.length}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">
                  {answeredCount} Answered
                </span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center space-x-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = !!(answers[q.id]?.trim());
                  const isActive = idx === activeQuestionIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-black transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Content Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-900 dark:text-slate-100">
              
              {currentQ ? (
                <div className="space-y-5 animate-in fade-in">
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      currentQ.type === 'objective'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {currentQ.type === 'objective' ? 'Objective Question' : 'Subjective Problem'}
                    </span>

                    <span className="text-xs font-bold text-slate-500">
                      {currentQ.maxMarks} Marks
                    </span>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Objective MCQ Options */}
                  {currentQ.type === 'objective' && currentQ.options && (
                    <div className="space-y-2.5 pt-2">
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = answers[currentQ.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQ.id, opt)}
                            className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                isSelected 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {opt}
                              </span>
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Subjective Textarea */}
                  {currentQ.type === 'subjective' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-500">
                        Type your solution / explanation:
                      </label>
                      <textarea
                        rows={5}
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="Explain your working, write mathematical steps, or formulas used..."
                        className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-inner"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <p>No questions found in this homework.</p>
                </div>
              )}
            </div>

            {/* Footer Navigation & Submit */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingProgress}
                  onClick={handleSaveProgress}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-4 h-4 text-blue-500" />
                  <span>{isSavingProgress ? 'Saving...' : 'Save Progress'}</span>
                </button>

                {progressSavedMsg && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{progressSavedMsg}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {activeQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setActiveQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  disabled={isSubmitting || answeredCount === 0}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Assignment'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
