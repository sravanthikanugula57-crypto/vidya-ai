import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  FileCheck2, 
  AlertCircle, 
  Award, 
  Bell, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const events = [
    { date: 'Today, July 30', title: 'Mathematics Chapter 5 Discriminant Homework Due', type: 'Homework', subject: 'Math', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
    { date: 'Tomorrow, July 31', title: 'Physical Science Light Refraction Model Lab Test', type: 'Lab Exam', subject: 'Science', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
    { date: 'August 5, 2026', title: 'Telangana District Mathematics Olympiad Qualifier', type: 'Competition', subject: 'Olympiad', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
    { date: 'August 15, 2026', title: 'Independence Day School Celebration & Science Fair', type: 'School Event', subject: 'General', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
    { date: 'September 15, 2026', title: 'Telangana SSC Class 9 Formative Assessment - 2 (FA-2)', type: 'State Board Exam', subject: 'All Subjects', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>State Board Academic Sync</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Academic Calendar & Board Exam Countdown</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Synced with Telangana Government School Academic Calendar 2026-27. Tracks exams, holidays, assignment deadlines, and parent meetings.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-2xl font-black text-yellow-300">42 Days</div>
          <div className="text-[10px] text-purple-100 uppercase font-bold">Until Formative-2 Exams</div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month View Mock Box */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" /> July - August 2026
            </h3>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Today</span>
              <button className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 pb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 gap-2 text-xs font-bold">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isToday = day === 30;
              const hasEvent = [30, 31, 5, 15, 28].includes(day);
              return (
                <div
                  key={day}
                  className={`p-3 rounded-2xl min-h-[50px] border flex flex-col justify-between transition ${
                    isToday
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {hasEvent && (
                    <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-yellow-300' : 'bg-indigo-500'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Feed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Upcoming Key Milestones
          </h3>

          <div className="space-y-3">
            {events.map((ev, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border space-y-1 ${ev.bg}`}>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>{ev.type}</span>
                  <span>{ev.date}</span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">{ev.title}</h4>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold">{ev.subject}</span>
                  <button className="text-blue-600 font-bold hover:underline">View Syllabus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-purple-500" />
          <span>Sync Source: Telangana Education Dept Calendar API /school_calendar_2026</span>
        </span>
        <span>Auto-synced daily at 06:00 AM IST</span>
      </div>
    </div>
  );
};
