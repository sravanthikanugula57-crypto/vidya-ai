import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  BookOpen,
  MessageSquare,
  Trash2,
  Check
} from 'lucide-react';

interface ParentNotificationsViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

interface NotificationItem {
  id: string;
  category: 'Attendance' | 'Academic' | 'Message' | 'Notice';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'Attendance',
    title: 'School Attendance Checked-In',
    message: 'Ananya Sharma entered school gate at 08:45 AM. Present for morning assembly.',
    time: 'Today, 8:45 AM',
    read: false,
  },
  {
    id: 'n2',
    category: 'Message',
    title: 'Teacher Message Received',
    message: 'Teacher Ramesh Sharma: "Ananya scored 18/20 in today\'s math quiz on quadratic equations."',
    time: 'Yesterday, 4:30 PM',
    read: true,
  },
  {
    id: 'n3',
    category: 'Academic',
    title: 'Homework Assigned',
    message: 'Mathematics: Algebra Worksheet #4 assigned. Due tomorrow by 4:00 PM.',
    time: 'Yesterday, 2:15 PM',
    read: true,
  },
  {
    id: 'n4',
    category: 'Notice',
    title: 'PTA Meeting Schedule Announcement',
    message: 'Parent-Teacher Association meeting this Saturday at 10:00 AM at ZPHS Medak Auditorium.',
    time: '2 days ago',
    read: true,
  },
];

export const ParentNotificationsView: React.FC<ParentNotificationsViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'All' | 'Attendance' | 'Academic' | 'Message'>('All');

  const handleMarkAllRead = () => {
    soundFx.playCheck();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    soundFx.playClick();
    setNotifications([]);
  };

  const filteredNotifs = notifications.filter(n => filter === 'All' || n.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            Real-Time SMS & Push Alerts
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Notifications for {selectedChildName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated SMS & App Alerts sent to registered phone +91 98765 43210
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {(['All', 'Attendance', 'Academic', 'Message'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundFx.playClick();
              setFilter(cat);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              filter === cat
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat} Alerts
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No notifications available in this category.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  n.category === 'Attendance'
                    ? 'bg-emerald-100 text-emerald-700'
                    : n.category === 'Academic'
                    ? 'bg-sky-100 text-sky-700'
                    : n.category === 'Message'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {n.category === 'Attendance' && <UserCheck className="w-5 h-5" />}
                  {n.category === 'Academic' && <BookOpen className="w-5 h-5" />}
                  {n.category === 'Message' && <MessageSquare className="w-5 h-5" />}
                  {n.category === 'Notice' && <Bell className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{n.message}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap self-start">
                {n.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
