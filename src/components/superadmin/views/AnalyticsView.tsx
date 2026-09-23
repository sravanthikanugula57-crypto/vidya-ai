import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Users,
  Building2,
  Brain,
  Globe,
  Award,
  Zap,
  BookOpen,
  PieChart
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            State-Wide Macro Education & AI Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Andhra Pradesh AP SSC School Ecosystem Performance, Vernacular Adoption & Learning Gains.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Schools</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">1,248</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18 Schools Added This Month
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Enrolled Students</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">342,150</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 94.2% Daily Active Rate
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">AI Tutor Queries Today</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">1,842,900</p>
          <p className="text-[11px] text-purple-600 font-bold">
            ⚡ Avg Response: 280ms
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">State SSC Pass Gain</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">+14.2%</p>
          <p className="text-[11px] text-slate-500 font-medium">
            Compared to pre-AI baseline
          </p>
        </div>
      </div>

      {/* Analytics Visual Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vernacular Language Usage */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Vernacular AI Query Language Share
            </h3>
            <span className="text-xs font-bold text-slate-500">AP SSC Multi-Lingual</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Telugu Medium (తెలుగు)</span>
                <span className="text-amber-600">78% (1.43M Queries)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>English Medium</span>
                <span className="text-sky-600">14% (258K Queries)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Urdu Medium (اردو)</span>
                <span className="text-emerald-600">8% (147K Queries)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* District Performance Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Performing Districts (SSC Exam Benchmark)
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { rank: '#1', dist: 'Nizamabad District', pass: '89.1%', rate: '+16.5%' },
              { rank: '#2', dist: 'Medak District', pass: '88.5%', rate: '+15.2%' },
              { rank: '#3', dist: 'Warangal Urban', pass: '87.4%', rate: '+14.1%' },
              { rank: '#4', dist: 'Sangareddy District', pass: '86.2%', rate: '+12.8%' },
              { rank: '#5', dist: 'Karimnagar District', pass: '84.0%', rate: '+11.0%' },
            ].map(item => (
              <div key={item.rank} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="font-black text-amber-600 w-6">{item.rank}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.dist}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 dark:text-white">{item.pass}</span>
                  <span className="text-[10px] text-emerald-600 font-bold ml-2">({item.rate})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
