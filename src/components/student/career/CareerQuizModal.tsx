import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Trophy, 
  Award,
  RefreshCw,
  Compass
} from 'lucide-react';
import { CAREER_QUIZ_QUESTIONS, CAREER_DATABASE } from '../../../data/careerData';
import { CareerCategory, CareerItem } from '../../../types/career';
import { soundFx } from '../../../lib/audio';

interface CareerQuizModalProps {
  onClose: () => void;
  onSelectCareer: (career: CareerItem) => void;
  onSaveCareer: (careerId: string) => void;
  savedCareerIds: string[];
}

export const CareerQuizModal: React.FC<CareerQuizModalProps> = ({
  onClose,
  onSelectCareer,
  onSaveCareer,
  savedCareerIds
}) => {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<CareerCategory[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = CAREER_QUIZ_QUESTIONS[currentQIndex];

  const handleSelectOption = (category: CareerCategory) => {
    soundFx.playClick();
    const nextAnswers = [...answers, category];
    setAnswers(nextAnswers);

    if (currentQIndex + 1 < CAREER_QUIZ_QUESTIONS.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      soundFx.playSuccess();
      setIsCompleted(true);
    }
  };

  const calculateTopCategories = (): { category: CareerCategory; score: number }[] => {
    const counts: Record<CareerCategory, number> = {
      science: 0,
      technology: 0,
      creative: 0,
      healthcare: 0,
      environment: 0,
      education: 0,
      governance: 0,
      engineering: 0
    };

    answers.forEach((cat) => {
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return (Object.keys(counts) as CareerCategory[])
      .map((cat) => ({ category: cat, score: counts[cat] }))
      .sort((a, b) => b.score - a.score);
  };

  const topCats = calculateTopCategories();
  const topCategory = topCats[0]?.category || 'technology';
  const matchingCareers = CAREER_DATABASE.filter((c) => c.category === topCategory || c.category === topCats[1]?.category).slice(0, 3);

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentQIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl shrink-0">
              <Compass className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
                Career Activity #2
              </div>
              <h2 className="text-xl font-black">Holistic Career Aptitude Quiz 📝</h2>
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
          {!isCompleted ? (
            <div className="space-y-6">
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Question {currentQIndex + 1} of {CAREER_QUIZ_QUESTIONS.length}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentQ.category}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / CAREER_QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.category)}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl group-hover:scale-110 transition shrink-0">
                        {opt.icon}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        {opt.text}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                  </button>
                ))}
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Quiz Result Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
                  ✨
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Your Primary Match: <span className="text-indigo-600 dark:text-indigo-400 uppercase">{topCategory}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Based on your responses, you exhibit strong problem-solving inclinations towards {topCategory}-oriented fields and real-world impact!
                </p>
              </div>

              {/* Matched Careers */}
              <div className="space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  Recommended Career Pathways for You:
                </h4>
                {matchingCareers.map((c) => {
                  const isSaved = savedCareerIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.emoji}</span>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white">
                            {c.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Stream: {c.recommendedStream} | {c.salaryRange}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSaveCareer(c.id);
                          }}
                          className={`p-2 rounded-xl border transition ${
                            isSaved
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSelectCareer(c);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Roadmap
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleRestart}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
