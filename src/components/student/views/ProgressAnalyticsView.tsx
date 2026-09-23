import React from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  Award, 
  Zap, 
  BarChart2, 
  Target,
  AlertTriangle,
  Database
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProgressAnalyticsView: React.FC = () => {
  const subjectScores = [
    { subject: 'Math', avgScore: 78, accuracy: 82, hours: 14.5 },
    { subject: 'Science', avgScore: 88, accuracy: 90, hours: 12.0 },
    { subject: 'English', avgScore: 92, accuracy: 94, hours: 8.5 },
    { subject: 'Social', avgScore: 74, accuracy: 76, hours: 7.0 },
    { subject: 'Telugu', avgScore: 95, accuracy: 96, hours: 6.0 },
    { subject: 'CS / AI', avgScore: 89, accuracy: 91, hours: 10.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Learning Record Analytics</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Student Performance & Diagnostic Progress</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Real-time analytics generated from quizzes, homework submissions, Vidya AI doubts solved, and timed mock board exams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
            <div className="text-xl font-black text-yellow-300">86%</div>
            <div className="text-[10px] text-sky-100 uppercase font-bold">Overall Mastery</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Total Lessons Finished</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">48 Lessons</div>
          <div className="text-[10px] text-emerald-600 font-bold">↑ +6 this week</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Practice Hours</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">58.0 Hours</div>
          <div className="text-[10px] text-purple-600 font-bold">Avg 2.1 hrs/day</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Quiz Accuracy</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">88.5%</div>
          <div className="text-[10px] text-emerald-600 font-bold">Top 5% in District</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Learning Streak</div>
          <div className="text-2xl font-black text-amber-500">14 Days</div>
          <div className="text-[10px] text-amber-600 font-bold">Consistency Score 98%</div>
        </div>
      </div>

      {/* Recharts Performance Visualizer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" /> Subject Average Score Breakdown (%)
          </h3>
          <span className="text-xs text-slate-400 font-bold">Updated Live</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="avgScore" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strong vs Weak Concepts Diagnostic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Concepts */}
        <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered Concepts (90%+ Accuracy)</span>
          </div>

          <div className="space-y-2">
            {[
              { topic: 'Computer Science - Intro to Python Coding', score: '95% Score' },
              { topic: 'Telugu - సంధులు & సమాసాలు', score: '96% Score' },
              { topic: 'English - Formal & Informal Letter Writing', score: '92% Score' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>{t.topic}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{t.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Concepts AI Priority */}
        <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 space-y-4">
          <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>AI Diagnostic Weakness Focus</span>
          </div>

          <div className="space-y-2">
            {[
              { topic: 'Math - Quadratic Discriminant Roots', score: '62% Score', action: 'Revision Needed' },
              { topic: 'Science - Convex Lens Focal Length', score: '68% Score', action: 'Practice Ray Diagram' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <div>
                  <div>{t.topic}</div>
                  <div className="text-[10px] text-rose-500 font-semibold">{t.action}</div>
                </div>
                <span className="text-rose-600 dark:text-rose-400">{t.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>DB Collection: /student_analytics/std_101/weekly_records</span>
        </span>
        <span>Calculated from 142 assessment logs</span>
      </div>
    </div>
  );
};
