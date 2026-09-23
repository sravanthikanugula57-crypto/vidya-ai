import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User,
  HelpCircle,
  Sparkles,
  Save
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  RealHomeworkSubmissionDoc, 
  RealHomeworkDoc, 
  teacherReviewHomeworkSubmission 
} from '../../../services/realHomeworkService';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: RealHomeworkSubmissionDoc | null;
  homework: RealHomeworkDoc | null;
  reviewerName?: string;
  onReviewSaved?: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  submission,
  homework,
  reviewerName = 'Faculty Teacher',
  onReviewSaved
}) => {
  const [subjectiveMarks, setSubjectiveMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (submission) {
      const marksMap: Record<string, number> = {};
      const answers = submission.answers || {};
      
      Object.keys(answers).forEach((qId) => {
        const item = answers[qId];
        if (item.type === 'subjective') {
          marksMap[qId] = item.marksAwarded || 0;
        }
      });

      setSubjectiveMarks(marksMap);
      setFeedback(submission.teacherFeedback || (
        submission.status === 'Reviewed' 
          ? 'Reviewed. Good effort!' 
          : 'Good effort on the problems. Please review the step-by-step corrections.'
      ));
    }
  }, [submission]);

  if (!isOpen || !submission || !homework) return null;

  const answers = submission.answers || {};
  const questions = homework?.questions || [];

  // Compute live updated total score
  let currentTotalScore = 0;
  questions.forEach((q) => {
    const ansItem = answers[q.id];
    if (q.type === 'objective') {
      currentTotalScore += (ansItem?.marksAwarded || 0);
    } else {
      currentTotalScore += (subjectiveMarks[q.id] || 0);
    }
  });

  const maxTotalScore = homework.totalMarks || questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 1), 0);

  const handleMarkChange = (qId: string, maxMarks: number, val: number) => {
    const clamped = Math.min(Math.max(0, val), maxMarks);
    setSubjectiveMarks(prev => ({ ...prev, [qId]: clamped }));
  };

  const handleSaveReview = async () => {
    setIsSaving(true);
    soundFx.playClick();

    try {
      await teacherReviewHomeworkSubmission({
        submissionId: submission.id,
        subjectiveMarks,
        teacherFeedback: feedback,
        reviewerName
      });

      soundFx.playSuccess();
      setIsSaving(false);
      onReviewSaved?.();
      onClose();
    } catch (err) {
      console.error('Error saving review:', err);
      soundFx.playError();
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold">
                <span>{homework.class}</span>
                <span>•</span>
                <span>{homework.subject}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Review Submission: {submission.studentName}
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

        {/* Student metadata banner */}
        <div className="px-6 py-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 font-bold">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{submission.studentName} {submission.studentEmail ? `(${submission.studentEmail})` : ''}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Recent'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-bold">Score:</span>
            <span className="text-sm font-black px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
              {currentTotalScore} / {maxTotalScore}
            </span>
          </div>
        </div>

        {/* Scrollable Questions & Answers Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-900 dark:text-slate-100">
          
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Question Evaluation & Student Answers
            </h3>

            {questions.map((q, idx) => {
              const ansItem = answers[q.id];
              const isObj = q.type === 'objective';
              const studentAnswer = ansItem?.studentAnswer || '(No answer provided)';

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {isObj ? 'Objective (Auto-Evaluated)' : 'Subjective (Manual Grading)'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isObj ? (
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                          ansItem?.isCorrect 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {ansItem?.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{ansItem?.marksAwarded || 0} / {q.maxMarks} Marks</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-500">Marks:</span>
                          <input
                            type="number"
                            min={0}
                            max={q.maxMarks}
                            value={subjectiveMarks[q.id] ?? (ansItem?.marksAwarded || 0)}
                            onChange={(e) => handleMarkChange(q.id, q.maxMarks, parseInt(e.target.value, 10) || 0)}
                            className="w-14 px-2 py-1 text-xs font-black text-center rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          />
                          <span className="text-xs font-bold text-slate-400">/ {q.maxMarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {q.question}
                  </p>

                  {/* Student Answer */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Student's Answer:
                    </span>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                      {studentAnswer}
                    </p>
                  </div>

                  {/* Correct Answer / Key */}
                  {isObj && q.correctAnswer && (
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400 font-bold">Stored Answer Key:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {q.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Subjective Rubric */}
                  {!isObj && q.explanation && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">Marking Guide:</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Teacher Overall Feedback */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Teacher Feedback (Visible to Student)</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback, notes on improvement, or encouragement..."
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Status: <span className="font-bold text-slate-700 dark:text-slate-300">{submission.status}</span>
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={isSaving}
              onClick={handleSaveReview}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Mark as Reviewed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
