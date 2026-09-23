import React from 'react';
import { 
  Award, 
  BrainCircuit, 
  CheckCircle2, 
  Download, 
  Share2, 
  Sparkles, 
  Target, 
  Briefcase, 
  Star, 
  Database,
  Code,
  BookOpen,
  Atom,
  Languages
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

export const LearningPortfolioView: React.FC = () => {
  const skillsList = [
    { name: 'Problem Solving & Math Logic', level: 'Level 4 (Advanced)', score: 88, color: 'bg-blue-500' },
    { name: 'Scientific Inquiry & Optics', level: 'Level 5 (Mastery)', score: 92, color: 'bg-cyan-500' },
    { name: 'English Fluency & Vocabulary', level: 'Level 4 (Advanced)', score: 85, color: 'bg-emerald-500' },
    { name: 'Python Coding & AI Concepts', level: 'Level 4 (Advanced)', score: 89, color: 'bg-pink-500' },
    { name: 'Telugu Reading & Grammar', level: 'Level 5 (Mastery)', score: 96, color: 'bg-amber-500' },
    { name: 'Critical Thinking & Analysis', level: 'Level 3 (Intermediate)', score: 78, color: 'bg-purple-500' },
  ];

  const certificates = [
    { title: 'National Science Day Olympiad - NTR Vijayawada District Rank 4', date: 'Feb 2026', issuer: 'AP SCERT' },
    { title: 'Introductory Python & AI Logic Certificate', date: 'Jan 2026', issuer: 'Vidya AI STEM Portal' },
    { title: 'NMMS Mathematics Scholar Qualifier', date: 'Dec 2025', issuer: 'Ministry of Education India' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Verified Student Learning Portfolio</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Skills Dashboard & Academic Portfolio</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Real-time skill mastery levels, verified digital certificates, and exportable academic profile for Andhra Pradesh AP SSC government school students.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx.playSuccess();
              alert('Exporting Learning Portfolio as official PDF document...');
            }}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer hover:bg-slate-100"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Portfolio PDF</span>
          </button>
        </div>
      </div>

      {/* Skills Mastery Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-500" /> Skill Competency Breakdown
          </h3>
          <span className="text-xs font-bold text-emerald-600">Calculated from 140+ Assessments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillsList.map((skill, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-white">
                <span>{skill.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{skill.level}</span>
              </div>

              {/* Skill Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 text-right font-mono">{skill.score}% Competency Index</div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates & Achievements */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Verified Digital Certificates & Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certificates.map((cert, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <Award className="w-8 h-8 text-amber-500" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">{cert.title}</h4>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1">
                  Issued by {cert.issuer} • {cert.date}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Blockchain Hash
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Portfolio ID: SCERT_TELANGANA_STD_101</span>
        </span>
        <span>Public Shareable Link Enabled</span>
      </div>
    </div>
  );
};
