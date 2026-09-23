import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Award, 
  Briefcase,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { SKILL_CHALLENGES } from '../../../data/careerData';
import { soundFx } from '../../../lib/audio';

interface SkillChallengeModalProps {
  onClose: () => void;
}

export const SkillChallengeModal: React.FC<SkillChallengeModalProps> = ({ onClose }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completedList, setCompletedList] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const challenge = SKILL_CHALLENGES[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const isCorrect = idx === challenge.correctAnswer;
    if (isCorrect) {
      soundFx.playSuccess();
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    const nextCompleted = [...completedList, selectedOption === challenge.correctAnswer];
    setCompletedList(nextCompleted);

    if (currentIdx + 1 < SKILL_CHALLENGES.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setCompletedList([]);
    setIsFinished(false);
  };

  const correctCount = completedList.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl shrink-0">
              <Award className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                Career Activity #3
              </div>
              <h2 className="text-xl font-black">Skill Challenge Arena ⚡</h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isFinished ? (
            <div className="space-y-5">
              
              {/* Challenge Header & Skill Badge */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Scenario {currentIdx + 1} of {SKILL_CHALLENGES.length}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px]">
                  Role: {challenge.careerTitle}
                </span>
              </div>

              {/* Real World Scenario Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>Real-World Scenario: {challenge.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{challenge.scenario}"
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {challenge.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {challenge.options?.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === challenge.correctAnswer;
                  let style = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-400';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500';
                    } else if (isSelected) {
                      style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelect(idx)}
                      className={`w-full p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm transition flex items-center justify-between gap-3 cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && (
                        isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        ) : null
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {selectedOption !== null && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                        {selectedOption === challenge.correctAnswer ? '✅ Correct Application!' : '💡 Professional Insight:'}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {challenge.explanation}
                      </p>
                      <div className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Skill Tested: {challenge.skillTested}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>{currentIdx + 1 < SKILL_CHALLENGES.length ? 'Next Skill Scenario' : 'View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-4xl mx-auto shadow-inner">
                🌟
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Skill Challenge Complete!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You tackled real workplace challenges across engineering, coding, agriculture, and governance!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 inline-block px-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Success Rate</div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300 mt-1">
                  {correctCount} / {SKILL_CHALLENGES.length} Correct
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Challenges</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
                >
                  Return to Guidance Hub
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
