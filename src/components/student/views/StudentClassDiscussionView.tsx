import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Clock,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Bell,
  ArrowRight
} from 'lucide-react';
import {
  DiscussionGroupDoc,
  subscribeToStudentDiscussionGroups,
  subscribeToUserDiscussionNotifications,
  DiscussionNotificationDoc,
  markDiscussionNotificationAsRead,
  ensureDefaultClassDiscussionGroups
} from '../../../services/discussionService';
import { ClassDiscussionFeed } from '../../discussion/ClassDiscussionFeed';
import { soundFx } from '../../../lib/audio';

interface StudentClassDiscussionViewProps {
  studentProfile: {
    uid: string;
    name: string;
    email: string;
    class?: string | number | null;
    grade?: string | null;
    board?: string;
  };
}

export const StudentClassDiscussionView: React.FC<StudentClassDiscussionViewProps> = ({
  studentProfile
}) => {
  const [groups, setGroups] = useState<DiscussionGroupDoc[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DiscussionGroupDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<DiscussionNotificationDoc[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  // Derive student's class number
  const rawClass = studentProfile.class || studentProfile.grade || '10';
  const numericClass = String(rawClass).replace(/\D/g, '') || '10';

  useEffect(() => {
    ensureDefaultClassDiscussionGroups();

    // Subscribe to student's available discussion groups matching board and class
    const unsubGroups = subscribeToStudentDiscussionGroups(
      {
        uid: studentProfile.uid,
        board: studentProfile.board || 'AP_SSC',
        class: numericClass,
        grade: String(rawClass)
      },
      (data) => {
        setGroups(data);
        if (selectedGroup) {
          const updated = data.find((g) => g.groupId === selectedGroup.groupId);
          if (updated) setSelectedGroup(updated);
        }
      }
    );

    // Subscribe to real-time notifications
    const unsubNotifs = subscribeToUserDiscussionNotifications(
      studentProfile.uid,
      (list, unread) => {
        setNotifications(list);
        setUnreadCount(unread);
      }
    );

    return () => {
      unsubGroups();
      unsubNotifs();
    };
  }, [studentProfile.uid, numericClass]);

  const handleOpenGroup = (grp: DiscussionGroupDoc) => {
    soundFx.playClick();
    setSelectedGroup(grp);
  };

  const handleNotificationClick = async (notif: DiscussionNotificationDoc) => {
    await markDiscussionNotificationAsRead(notif.id);
    const targetGroup = groups.find((g) => g.groupId === notif.groupId);
    if (targetGroup) {
      setSelectedGroup(targetGroup);
      setShowNotificationsModal(false);
    }
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.chapterName && g.chapterName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubjectFilter === 'all' || g.subject === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(groups.map((g) => g.subject)));

  if (selectedGroup) {
    return (
      <ClassDiscussionFeed
        group={selectedGroup}
        currentUser={{
          uid: studentProfile.uid,
          name: studentProfile.name,
          role: 'student',
          email: studentProfile.email
        }}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-emerald-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Class {numericClass} Official Discussion Groups • Realtime Chat</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Class Discussion</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl">
            Join discussions with your subject teachers and educational officers. Ask questions, clarify doubts, and view real-time replies instantly without page refresh.
          </p>
        </div>

        {/* Notifications Pill */}
        <button
          onClick={() => {
            soundFx.playClick();
            setShowNotificationsModal(true);
          }}
          className="relative px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <Bell className="w-4 h-4 text-yellow-300" />
          <span>Discussion Alerts</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussion groups or topics..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {uniqueSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSubjectFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Subjects
            </button>
            {uniqueSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedSubjectFilter === sub
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No discussion groups available for Class {numericClass}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your teacher or district educational officer will create active groups for your syllabus shortly.
            </p>
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <div
              key={grp.groupId}
              onClick={() => handleOpenGroup(grp)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-sm hover:shadow-md flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Class {grp.class}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {grp.subject}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Group
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {grp.groupName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {grp.description || 'Join this classroom discussion group.'}
                  </p>
                </div>

                {grp.chapterName && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Topic:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{grp.chapterName}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{grp.createdByName || 'Course Faculty'}</span>
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                  Enter Group <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Discussion Alerts</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No discussion notifications yet</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      notif.isRead
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 text-slate-500'
                        : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <p className="text-xs mt-1 line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
