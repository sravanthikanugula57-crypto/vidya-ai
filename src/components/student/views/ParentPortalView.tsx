import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  Star, 
  Database,
  Sparkles,
  PhoneCall,
  Bell
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

export const ParentPortalView: React.FC = () => {
  const [meetingRequested, setMeetingRequested] = useState(false);

  const handleRequestMeeting = () => {
    soundFx.playSuccess();
    setMeetingRequested(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Parent-Teacher Collaboration Hub</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Parent Portal & Teacher Evaluation Feedback</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Weekly learning summaries, teacher rubrics, attendance tracking, and parent-teacher meeting schedules for Telangana parents.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-lg font-black text-yellow-300">Grade A+</div>
          <div className="text-[10px] text-emerald-100 uppercase font-bold">Overall Progress Rating</div>
        </div>
      </div>

      {/* Weekly Progress Overview Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Attendance Rate</div>
          <div className="text-2xl font-black text-emerald-600">95.8%</div>
          <div className="text-[10px] text-emerald-600 font-bold">115 / 120 Days Present</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Homework Turn-In</div>
          <div className="text-2xl font-black text-blue-600">100%</div>
          <div className="text-[10px] text-blue-600 font-bold">18 / 18 Tasks Completed</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Quiz Accuracy</div>
          <div className="text-2xl font-black text-purple-600">88.5%</div>
          <div className="text-[10px] text-purple-600 font-bold">District Top 5%</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-bold">Weekly AI Study</div>
          <div className="text-2xl font-black text-amber-500">14.5 Hours</div>
          <div className="text-[10px] text-amber-600 font-bold">Avg 2.1 hrs/day</div>
        </div>
      </div>

      {/* Teacher Feedback & Evaluation Rubric */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Class Teacher Observations & Rubric
        </h3>

        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
              Smt. Lakshmi Devi (Head Mathematics Teacher)
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Logged 2 days ago</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            "Ananya shows outstanding dedication in Mathematics and Physical Science. She actively uses Vidya AI doubt solver to clear discriminant and lens concepts. We encourage her parents to ensure she continues practicing 20 minutes of daily math problem-solving at home."
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Formative Assessment 1 Score: 48/50 (Grade A1)
          </div>
        </div>
      </div>

      {/* Schedule Parent Meeting */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-500" /> Parent-Teacher Meeting (PTM) Request
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Request an in-person or phone consultation with Class 9 head teacher.
          </p>
        </div>

        <button
          onClick={handleRequestMeeting}
          disabled={meetingRequested}
          className={`px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md transition cursor-pointer ${
            meetingRequested
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {meetingRequested ? 'PTM Slot Requested ✓' : 'Schedule PTM Call'}
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-teal-500" />
          <span>Parent Notification Service: SMS & WhatsApp Sync</span>
        </span>
        <span>Telangana Education Portal Integration</span>
      </div>
    </div>
  );
};
