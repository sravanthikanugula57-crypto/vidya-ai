import React, { useState } from 'react';
import { 
  Bell, 
  Megaphone, 
  Pin, 
  Calendar, 
  User, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  Send, 
  Database,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

interface NoticeItem {
  id: string;
  title: string;
  author: string;
  role: 'Principal' | 'Head Teacher' | 'Education Dept';
  time: string;
  priority: 'High' | 'Normal';
  content: string;
  attachmentName?: string;
  isRead: boolean;
}

export const ClassroomHubView: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'n1',
      title: 'Class 9 Formative Assessment 2 (FA-2) Time Table Announced',
      author: 'Sri. M. Ramana Rao (Principal)',
      role: 'Principal',
      time: '2 hours ago',
      priority: 'High',
      content: 'All Class 9 students are notified that FA-2 exams will commence from August 12. Mathematics and Science exams are scheduled on Day 1. Revise Chapters 1-5.',
      attachmentName: 'FA2_Schedule_ZPHS_Medak.pdf',
      isRead: false
    },
    {
      id: 'n2',
      title: 'National Means-cum-Merit Scholarship (NMMS) Special Coaching',
      author: 'Smt. Lakshmi Devi (Head Math Teacher)',
      role: 'Head Teacher',
      time: '1 day ago',
      priority: 'Normal',
      content: 'Special after-school coaching for Class 8 & 9 NMMS scholarship aspirants will be held every Tuesday and Thursday at 4:30 PM in Room 102.',
      attachmentName: 'NMMS_Application_Form_2026.pdf',
      isRead: true
    },
    {
      id: 'n3',
      title: 'Telangana School Education Department Science Fair 2026 Registration',
      author: 'Telangana SCERT Department',
      role: 'Education Dept',
      time: '2 days ago',
      priority: 'Normal',
      content: 'District-level science exhibition entries are open for eco-friendly technology models and solar innovation projects.',
      isRead: true
    }
  ]);

  const [questionText, setQuestionText] = useState('');

  const handleMarkRead = (id: string) => {
    soundFx.playCheck();
    setNotices(notices.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    soundFx.playSuccess();
    setQuestionText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Megaphone className="w-4 h-4" />
            <span>ZPHS Medak Digital Notice Board</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Classroom Hub & School Announcements</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Official notices, examination schedules, teacher assignments, and live class timetables.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-lg font-black text-yellow-300">Class 9A Hub</div>
          <div className="text-[10px] text-purple-100 uppercase font-bold">1 Unread Notice</div>
        </div>
      </div>

      {/* Main Notice Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" /> Official School Notice Feed
          </h3>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-6 rounded-3xl border transition space-y-3 ${
                  !notice.isRead
                    ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      notice.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {notice.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{notice.time}</span>
                  </div>

                  {!notice.isRead && (
                    <button
                      onClick={() => handleMarkRead(notice.id)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Mark as Acknowledged
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{notice.title}</h4>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                    By {notice.author} • {notice.role}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notice.content}
                </p>

                {notice.attachmentName && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Paperclip className="w-4 h-4 text-purple-500" /> {notice.attachmentName}
                    </span>
                    <span className="text-[10px] text-purple-600 cursor-pointer hover:underline">Download PDF</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ask Teacher Q&A Box */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-500" /> Ask Class Teacher
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have a question regarding upcoming exams, timetable, or hall tickets? Send a direct message to Class Teacher.
            </p>

            <form onSubmit={handlePostQuestion} className="space-y-3">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Question to Teacher</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-purple-500" />
          <span>Notice Channel: Firestore /schools/zphs_medak/notices</span>
        </span>
        <span>Synced with Teacher Portal</span>
      </div>
    </div>
  );
};
