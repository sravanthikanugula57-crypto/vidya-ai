import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

const gradePassData = [
  { grade: 'Class 6', passPercent: 94, avgScore: 82 },
  { grade: 'Class 7', passPercent: 92, avgScore: 80 },
  { grade: 'Class 8', passPercent: 96, avgScore: 86 },
  { grade: 'Class 9', passPercent: 91, avgScore: 79 },
  { grade: 'Class 10', passPercent: 98, avgScore: 91 },
];

const monthlyAttendanceData = [
  { month: 'Jan', rate: 94 },
  { month: 'Feb', rate: 95 },
  { month: 'Mar', rate: 97 },
  { month: 'Apr', rate: 93 },
  { month: 'May', rate: 96 },
  { month: 'Jun', rate: 98 },
  { month: 'Jul', rate: 97 },
];

const categoryDistributionData = [
  { name: 'OBC', value: 42, color: '#d97706' },
  { name: 'SC', value: 24, color: '#2563eb' },
  { name: 'ST', value: 18, color: '#10b981' },
  { name: 'General', value: 16, color: '#9333ea' },
];

export const AnalyticsManagementView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart2 className="w-3.5 h-3.5" />
          School Analytics & Learning Progression
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Academic Pass Percentages & Socratic AI AI Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time performance distribution across grades, attendance trends, and scholarship demographics
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Rate per Grade */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Class-Wise Pass Percentage (%)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">FA-1 Assessment</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradePassData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="passPercent" fill="#d97706" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Attendance Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Monthly Gate Attendance Trend (%)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Biometric Logs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Social Demographics & Scholarship Coverage (%)
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Tutor Socratic Usage Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-950 text-white shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Socratic AI Learning Engine
            </div>
            <h3 className="text-xl font-black">
              32,400 Doubts Cleared in Local Vernacular
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              Students at ZPHS Medak logged 840 hours of voice-assisted Socratic doubt clearing in Telugu and English.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div>
              <div className="text-2xl font-black text-amber-400">82.4 TB</div>
              <div className="text-[10px] text-slate-300">Data Saved (Offline Mode)</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">94.2%</div>
              <div className="text-[10px] text-slate-300">Doubt Satisfaction Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
