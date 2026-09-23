import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Eye, 
  Filter, 
  Calendar, 
  BookOpen,
  ChevronRight,
  Check,
  HelpCircle
} from 'lucide-react';
import { PracticeAttemptDoc, PracticeSetDoc } from '../../../services/practiceService';
import { soundFx } from '../../../lib/audio';

interface PracticeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: PracticeAttemptDoc[];
  practiceSets: PracticeSetDoc[];
  onReviewAttempt?: (attempt: PracticeAttemptDoc) => void;
  onRetakeSet?: (practiceSetId: string) => void;
}

export const PracticeHistoryModal: React.FC<PracticeHistoryModalProps> = ({
  isOpen,
  onClose,
  attempts,
  practiceSets,
  onReviewAttempt,
  onRetakeSet
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState<PracticeAttemptDoc | null>(null);

  // Distinct subjects in attempts
  const subjectsList = useMemo(() => {
    const subs = new Set<string>();
    attempts.forEach(a => {
      const s = a.subject || a.subjectName;
      if (s) subs.add(s);
    });
    return Array.from(subs);
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    if (selectedSubject === 'all') return attempts;
    return attempts.filter(a => (a.subject || a.subjectName) === selectedSubject);
  }, [attempts, selectedSubject]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Practice Attempt History</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Review your completed practice sessions and question-wise explanations.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-400">Filter by Subject:</span>
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    selectedSubject === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  All ({attempts.length})
                </button>
                {subjectsList.map(subj => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                      selectedSubject === subj
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-400 font-semibold">
              Showing {filteredAttempts.length} attempt{filteredAttempts.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredAttempts.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Clock className="w-12 h-12 text-slate-600 mx-auto" />
                {/* User-mandated exact empty state string */}
                <h4 className="text-base font-bold text-slate-300">No practice attempts yet.</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete your first practice session to see your detailed results and explanations here!
                </p>
              </div>
            ) : (
              filteredAttempts.map((att) => {
                const dateStr = new Date(att.submittedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = new Date(att.submittedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isPassed = att.percentage >= 60;
                const correctCount = att.correctCount !== undefined ? att.correctCount : (att.correctAnswers || 0);
                const wrongCount = att.wrongCount !== undefined ? att.wrongCount : (att.incorrectAnswers || 0);
                const unanswered = att.unansweredCount !== undefined ? att.unansweredCount : (att.unanswered || 0);

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-800/50">
                          {att.subject || att.subjectName || 'Subject'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {dateStr} at {timeStr}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white">{att.practiceSetTitle || 'Practice Set'}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        Chapter: {att.chapterName || 'Chapter Practice'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xl font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {att.percentage}%
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            ({att.score} / {att.totalMarks} Marks)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {correctCount} Correct • {wrongCount} Wrong • {unanswered} Skipped
                        </div>
                      </div>

                      {/* View Explanations Button */}
                      {att.questionResults && att.questionResults.length > 0 && (
                        <button
                          onClick={() => setSelectedAttemptDetail(att)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-extrabold text-xs transition cursor-pointer flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      )}

                      {onRetakeSet && (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onClose();
                            onRetakeSet(att.practiceSetId);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center space-x-1 shadow-md shadow-blue-500/20"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed Question Review Sub-Modal */}
          {selectedAttemptDetail && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white text-base">{selectedAttemptDetail.practiceSetTitle}</h3>
                    <p className="text-xs text-slate-400">
                      Score: {selectedAttemptDetail.score}/{selectedAttemptDetail.totalMarks} ({selectedAttemptDetail.percentage}%)
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAttemptDetail(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedAttemptDetail.questionResults?.map((qr, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        qr.isCorrect ? 'bg-slate-950 border-emerald-900/60' : 'bg-slate-950 border-rose-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-300">Question {idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          qr.isCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {qr.isCorrect ? 'Correct' : qr.selectedAnswer === null ? 'Skipped' : 'Wrong'}
                        </span>
                      </div>

                      <p className="font-bold text-white text-sm">{qr.questionText}</p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Your Answer:</span>
                          <span className={`font-bold mt-0.5 block ${qr.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {qr.selectedOptionText || 'Not answered'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Correct Answer:</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">
                            {qr.correctOptionText || String(qr.correctAnswer)}
                          </span>
                        </div>
                      </div>

                      {qr.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-amber-400 font-bold block">Explanation:</span>
                          <p className="text-slate-300 mt-0.5">{qr.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedAttemptDetail(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition cursor-pointer"
            >
              Close History
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
