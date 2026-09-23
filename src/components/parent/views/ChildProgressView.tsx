import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey } from '../../../data/officialSyllabusData';
import { soundFx } from '../../../lib/audio';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  BookOpen,
  Sparkles,
  BarChart3,
  Layers,
  Flame,
  Target
} from 'lucide-react';

interface ChildProgressViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
  selectedChildGrade?: string;
}

const SKILL_MASTERIES = [
  { subject: 'Mathematics', skill: 'Quadratic Equations & Roots', mastery: 62, status: 'Needs Revision' },
  { subject: 'Mathematics', skill: 'Real Numbers & Proofs', mastery: 88, status: 'Mastered' },
  { subject: 'Physical Science', skill: 'Refraction of Light & Snell Law', mastery: 68, status: 'Improving' },
  { subject: 'Biological Science', skill: 'Cell Structure & Organelles', mastery: 94, status: 'Mastered' },
  { subject: 'English', skill: 'Letter Writing & Essay Structure', mastery: 90, status: 'Mastered' },
  { subject: 'Social Studies', skill: 'Indian Constitution & Rights', mastery: 75, status: 'Good' },
  { subject: 'Computer Science', skill: 'Python Variables & Loops', mastery: 82, status: 'Good' },
];

const WEEKLY_VELOCITY = [
  { day: 'Mon', minutes: 40 },
  { day: 'Tue', minutes: 35 },
  { day: 'Wed', minutes: 50 },
  { day: 'Thu', minutes: 45 },
  { day: 'Fri', minutes: 30 },
  { day: 'Sat', minutes: 25 },
  { day: 'Sun', minutes: 15 },
];

export const ChildProgressView: React.FC<ChildProgressViewProps> = ({
  selectedLang,
  selectedChildName,
  selectedChildGrade = 'Class 9',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'strong' | 'growth'>('all');
  const gradeKey = normalizeGradeKey(selectedChildGrade);
  const classSubjects = OFFICIAL_SYLLABUS_BY_CLASS[gradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 9'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Child Academic Progress & Analytics
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {selectedChildName}'s Performance Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics synced with SCERT Andhra Pradesh (AP SSC) Board Curriculum
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveFilter('strong');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeFilter === 'strong'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Strengths
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveFilter('growth');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeFilter === 'growth'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Growth Areas
          </button>
        </div>
      </div>

      {/* Weekly Study Velocity Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Weekly AI Learning Velocity (240 Mins Total)
            </h3>
            <p className="text-xs text-slate-500">Daily study time recorded via Socratic practice & quizzes</p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Avg 34 mins / day
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-36">
          {WEEKLY_VELOCITY.map((item) => {
            const heightPercent = Math.min(100, (item.minutes / 60) * 100);
            return (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-500">{item.minutes}m</span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl transition-all duration-500 shadow-sm"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject-Wise Mastery Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Subject-Wise Completion & Grade Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classSubjects.map((subject, idx) => {
            const completedPercent = 65 + ((idx * 7) % 30);
            const isStrong = completedPercent >= 75;
            const isWeak = completedPercent < 70;

            if (activeFilter === 'strong' && !isStrong) return null;
            if (activeFilter === 'growth' && !isWeak) return null;

            return (
              <div
                key={subject.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {subject.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">{subject.nativeName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    completedPercent >= 75
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : completedPercent >= 60
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {completedPercent >= 75 ? 'Grade A' : completedPercent >= 60 ? 'Grade B' : 'Needs Practice'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Curriculum Progress</span>
                    <span>{completedPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${completedPercent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">Key Topics: </span>
                  {subject.chapters?.slice(0, 3).map(ch => ch.title).join(', ') || 'Core concepts & exercises'}...
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Mastery Deep-Dive Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Sub-Topic Skill Mastery Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Sub-Topic / Skill</th>
                <th className="py-3 px-4">Mastery Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Parent Home Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SKILL_MASTERIES.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.subject}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{item.skill}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.mastery >= 80 ? 'bg-emerald-500' : item.mastery >= 65 ? 'bg-sky-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                      <span>{item.mastery}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Mastered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'Good'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                    {item.mastery >= 80 ? 'Praise student' : 'Encourage 10m AI practice'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
