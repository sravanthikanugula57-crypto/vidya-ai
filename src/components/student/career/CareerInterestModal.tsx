import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Compass, 
  Heart, 
  RefreshCw,
  Trophy,
  Star
} from 'lucide-react';
import { CAREER_DATABASE } from '../../../data/careerData';
import { CareerCategory, CareerItem } from '../../../types/career';
import { soundFx } from '../../../lib/audio';

interface CareerInterestModalProps {
  onClose: () => void;
  onSaveCareer: (careerId: string) => void;
  onSelectCareer: (career: CareerItem) => void;
  savedCareerIds: string[];
}

const INTEREST_OPTIONS = [
  { id: 'math_puzzles', label: 'Solving Math & Logic Puzzles', category: 'technology' as CareerCategory, icon: '🔢' },
  { id: 'drawing_art', label: 'Drawing, Painting & Designing', category: 'creative' as CareerCategory, icon: '🎨' },
  { id: 'science_lab', label: 'Science Experiments & Chemistry', category: 'science' as CareerCategory, icon: '🧪' },
  { id: 'human_health', label: 'Understanding Human Body & Medicine', category: 'healthcare' as CareerCategory, icon: '🩺' },
  { id: 'plants_farming', label: 'Farming, Plants & Nature', category: 'environment' as CareerCategory, icon: '🌱' },
  { id: 'teaching_helping', label: 'Explaining Lessons to Friends', category: 'education' as CareerCategory, icon: '👩‍🏫' },
  { id: 'coding_games', label: 'Coding, Robots & Video Games', category: 'technology' as CareerCategory, icon: '💻' },
  { id: 'social_rules', label: 'Debating Laws & District Welfare', category: 'governance' as CareerCategory, icon: '🏛️' },
  { id: 'building_machines', label: 'Building Models & Fixing Gadgets', category: 'engineering' as CareerCategory, icon: '🔧' },
];

export const CareerInterestModal: React.FC<CareerInterestModalProps> = ({
  onClose,
  onSaveCareer,
  onSelectCareer,
  savedCareerIds
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['math_puzzles', 'science_lab']);
  const [step, setStep] = useState<'select' | 'results'>('select');

  const toggleInterest = (id: string) => {
    soundFx.playClick();
    setSelectedInterests((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate matched careers based on selected interests
  const getMatchedCareers = (): CareerItem[] => {
    const categoryCounts: Record<CareerCategory, number> = {
      science: 0,
      technology: 0,
      creative: 0,
      healthcare: 0,
      environment: 0,
      education: 0,
      governance: 0,
      engineering: 0
    };

    selectedInterests.forEach((interestId) => {
      const match = INTEREST_OPTIONS.find((opt) => opt.id === interestId);
      if (match) {
        categoryCounts[match.category] = (categoryCounts[match.category] || 0) + 1;
      }
    });

    // Sort categories by score
    const sortedCategories = (Object.keys(categoryCounts) as CareerCategory[])
      .filter((cat) => categoryCounts[cat] > 0)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a]);

    if (sortedCategories.length === 0) {
      return CAREER_DATABASE.slice(0, 3);
    }

    const matched: CareerItem[] = [];
    sortedCategories.forEach((cat) => {
      const inCat = CAREER_DATABASE.filter((c) => c.category === cat);
      matched.push(...inCat);
    });

    return matched.slice(0, 4);
  };

  const matchedCareers = getMatchedCareers();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl shrink-0">
              <Compass className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-pink-200">
                AI Interest Assessment
              </div>
              <h2 className="text-xl font-black">Discover My Interests</h2>
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
          {step === 'select' ? (
            <div className="space-y-5">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  What activities and subjects do you naturally enjoy?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select 2 or more interests below. Our guidance engine will match you with high-potential career pathways.
                </p>
              </div>

              {/* Interest Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INTEREST_OPTIONS.map((opt) => {
                  const isSelected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInterest(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-medium">
                  {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
                </span>

                <button
                  disabled={selectedInterests.length === 0}
                  onClick={() => {
                    soundFx.playSuccess();
                    setStep('results');
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate Career Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                      AI Career Recommendations
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Based on {selectedInterests.length} selected interests
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setStep('select');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>

              {/* Matched Careers Cards */}
              <div className="space-y-3">
                {matchedCareers.map((career, idx) => {
                  const isSaved = savedCareerIds.includes(career.id);
                  return (
                    <div
                      key={career.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                          {career.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {career.title}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              #{idx + 1} Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {career.tagline}
                          </p>
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            Stream: {career.recommendedStream} | {career.salaryRange}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSaveCareer(career.id);
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isSaved
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
                          }`}
                          title={isSaved ? 'Saved to Interests' : 'Save to Interests'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSelectCareer(career);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>View Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition cursor-pointer"
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
