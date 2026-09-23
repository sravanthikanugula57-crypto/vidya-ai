import React from 'react';
import { 
  X, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Sparkles,
  BookOpen,
  TrendingUp,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import { CareerItem } from '../../../types/career';
import { soundFx } from '../../../lib/audio';

interface CareerDetailModalProps {
  career: CareerItem | null;
  isSaved: boolean;
  onToggleSave: (careerId: string) => void;
  onClose: () => void;
}

export const CareerDetailModal: React.FC<CareerDetailModalProps> = ({
  career,
  isSaved,
  onToggleSave,
  onClose
}) => {
  if (!career) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {career.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {career.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Demand: {career.jobDemand}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {career.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleSave(career.id);
              }}
              className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                isSaved
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
              }`}
              title={isSaved ? 'Remove from My Interests' : 'Save to My Interests'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          
          {/* Tagline & Overview */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-sky-50/70 dark:from-slate-800/60 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="text-sm sm:text-base font-extrabold text-indigo-950 dark:text-indigo-200">
              "{career.tagline}"
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
              {career.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Salary Range</span>
              </div>
              <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                {career.salaryRange}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Inter Stream (11/12)</span>
              </div>
              <div className="font-black text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                {career.recommendedStream} Stream
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Market Demand</span>
              </div>
              <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                {career.jobDemand}
              </div>
            </div>
          </div>

          {/* Step-by-Step Educational Pathway */}
          <div className="space-y-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Step-by-Step Educational Roadmap</span>
            </h3>
            <div className="space-y-2.5">
              {career.educationPath.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Skills & Suitable Subjects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Skills to Build in School</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {career.keySkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Best Suited School Subjects</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {career.suitableSubjects.map((sub, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entrance Exams & AP Govt Scholarships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-500" />
                <span>Entrance Examinations</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {career.entranceExams.map((exam, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{exam}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                <span>Govt Scholarships & Fee Aid</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {career.govtScholarships.map((sch, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{sch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* A Day in the Life */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>A Day in the Life</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {career.dayInTheLife}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AP School Education Board Career Framework</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};
