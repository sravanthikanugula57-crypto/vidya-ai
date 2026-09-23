import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Lightbulb, 
  Wrench,
  RotateCcw
} from 'lucide-react';
import { GUESS_THE_CAREER_GAMES } from '../../../data/careerData';
import { soundFx } from '../../../lib/audio';

interface GuessTheCareerModalProps {
  onClose: () => void;
}

export const GuessTheCareerModal: React.FC<GuessTheCareerModalProps> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealedHints, setRevealedHints] = useState<number>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const currentGame = GUESS_THE_CAREER_GAMES[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(opt);
    if (opt === currentGame.careerTitle) {
      soundFx.playSuccess();
      const pointsEarned = 100 - (revealedHints - 1) * 25;
      setScore((prev) => prev + pointsEarned);
    } else {
      soundFx.playError();
    }
  };

  const handleRevealNextHint = () => {
    soundFx.playClick();
    if (revealedHints < currentGame.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentIndex + 1 < GUESS_THE_CAREER_GAMES.length) {
      setCurrentIndex((prev) => prev + 1);
      setRevealedHints(1);
      setSelectedAnswer(null);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setRevealedHints(1);
    setSelectedAnswer(null);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl shrink-0">
              <HelpCircle className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100">
                Career Activity #1
              </div>
              <h2 className="text-xl font-black">Guess the Career! 🔍</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur text-xs font-black">
              Score: {score} XP
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isGameOver ? (
            <div className="space-y-5">
              
              {/* Progress & Mystery Card */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Mystery Career {currentIndex + 1} of {GUESS_THE_CAREER_GAMES.length}</span>
                <span className="text-amber-600 dark:text-amber-400">
                  Category: {currentGame.category.toUpperCase()}
                </span>
              </div>

              {/* Clues Card */}
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Career Clues & Secrets</span>
                  </div>
                  {revealedHints < currentGame.hints.length && selectedAnswer === null && (
                    <button
                      onClick={handleRevealNextHint}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 underline hover:text-amber-900 cursor-pointer"
                    >
                      + Reveal More Clues ({revealedHints}/{currentGame.hints.length})
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {currentGame.hints.slice(0, revealedHints).map((hint, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2.5 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>

                {/* Daily Tools Badge List */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tools used daily in this job:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentGame.tools.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options Grid */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Who am I? Select the correct career:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentGame.options.map((opt) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentGame.careerTitle;
                    let btnStyle = 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400';

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAnswer !== null && (
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
              </div>

              {/* Feedback & Next Button */}
              {selectedAnswer !== null && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentGame.emoji}</span>
                    <div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {selectedAnswer === currentGame.careerTitle ? '🎉 Brilliant deduction!' : '💡 Close try!'} The answer is {currentGame.careerTitle}!
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {currentGame.funFact}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>{currentIndex + 1 < GUESS_THE_CAREER_GAMES.length ? 'Next Mystery Career' : 'View Final Score'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-inner">
                🏆
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Career Detective Master!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You completed all career mystery cases.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 inline-block px-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Total Career XP Earned</div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">{score} Points</div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
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
