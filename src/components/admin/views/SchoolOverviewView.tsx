import React from 'react';
import {
  AdminStudent,
  AdminTeacher,
  AdminClass,
  SchoolSettingsData,
  AnnouncementItem
} from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Bell,
  Clock,
  Sparkles
} from 'lucide-react';

interface SchoolOverviewViewProps {
  settings: SchoolSettingsData;
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClass[];
  announcements: AnnouncementItem[];
  onNavigateModule: (module: string) => void;
}

export const SchoolOverviewView: React.FC<SchoolOverviewViewProps> = ({
  settings,
  students,
  teachers,
  classes,
  announcements,
  onNavigateModule,
}) => {
  const totalStudents = students.length * 56 + 400; // Scaled total representation
  const activeTeachers = teachers.length;
  const avgAttendance = Math.round(
    classes.reduce((acc, c) => acc + c.attendanceToday, 0) / (classes.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black uppercase tracking-wider border border-yellow-400/30">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Executive Control Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {settings.schoolName}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            School Code: <span className="font-mono font-bold text-yellow-300">{settings.schoolCode}</span> • Affiliation: {settings.affiliationNumber} • Principal: {settings.principalName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateModule('announcements');
            }}
            className="px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Issue Broadcast Notice</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateModule('reports');
            }}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs rounded-2xl border border-white/20 shadow transition flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>DEO Compliance Portal</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500">Total Enrolled</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalStudents}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12 New Admissions</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500">Teaching Staff</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {activeTeachers}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            100% Verified Credentials
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500">Gate Attendance</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgAttendance}%
          </div>
          <div className="text-[11px] font-bold text-emerald-600">
            ✓ Gate Biometrics Operational
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500">Active Classes</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {classes.length}
          </div>
          <div className="text-[11px] font-bold text-purple-600">
            Classes 6 to 10
          </div>
        </div>
      </div>

      {/* Operational Highlights & Active Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Attendance Summary Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Today's Class Attendance & Academic Status
            </h3>
            <button
              onClick={() => onNavigateModule('classes')}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Classes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Class & Sec</th>
                  <th className="py-2.5 px-3">Class Teacher</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Students</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3 text-right">Avg GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                      {cls.name}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {cls.classTeacher}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{cls.roomNumber}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {cls.studentCount} / {cls.capacity}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        cls.attendanceToday >= 95
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {cls.attendanceToday}% Present
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-600">
                      {cls.averageGpa} / 10
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Broadcasts & Quick Alerts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              Active Bulletins & DEO Orders
            </h3>
            <button
              onClick={() => onNavigateModule('announcements')}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
