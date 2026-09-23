import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Bell, 
  CheckCircle2, 
  CheckCheck, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  School, 
  User, 
  Sparkles, 
  FileText, 
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  AnnouncementDoc, 
  AnnouncementType, 
  AnnouncementPriority, 
  subscribeToStudentAnnouncements, 
  markAnnouncementAsRead 
} from '../../../services/studentFirestoreService';

const CATEGORIES: ('ALL' | AnnouncementType)[] = [
  'ALL',
  'General',
  'Academic',
  'Homework',
  'Exam',
  'Event',
  'Important',
  'Holiday',
  'Notice'
];

interface StudentAnnouncementsViewProps {
  studentGrade?: string;
  studentSection?: string;
  studentId?: string;
}

export const StudentAnnouncementsView: React.FC<StudentAnnouncementsViewProps> = ({
  studentGrade = 'Class 5',
  studentSection = 'Section A',
  studentId = 'student_current'
}) => {
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AnnouncementType>('ALL');
  const [filterReadStatus, setFilterReadStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDoc | null>(null);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeToStudentAnnouncements(
      studentGrade,
      studentSection,
      studentId,
      (items, unread, reads) => {
        setAnnouncements(items);
        setUnreadCount(unread);
        setReadIds(reads);
      }
    );
    return () => unsub();
  }, [studentGrade, studentSection, studentId]);

  const handleMarkAsRead = async (announcement: AnnouncementDoc, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    if (!readIds.has(announcement.id)) {
      await markAnnouncementAsRead(studentId, announcement.id);
    }
  };

  const handleOpenAnnouncement = async (announcement: AnnouncementDoc) => {
    soundFx.playClick();
    setSelectedAnnouncement(announcement);
    if (!readIds.has(announcement.id)) {
      await markAnnouncementAsRead(studentId, announcement.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    soundFx.playSuccess();
    for (const item of announcements) {
      if (!readIds.has(item.id)) {
        await markAnnouncementAsRead(studentId, item.id);
      }
    }
  };

  // Filter announcements
  const filteredList = announcements.filter((item) => {
    const isRead = readIds.has(item.id);

    // Read status filter
    if (filterReadStatus === 'UNREAD' && isRead) return false;
    if (filterReadStatus === 'READ' && !isRead) return false;

    // Category filter
    if (selectedCategory !== 'ALL' && item.type !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = (item.message || item.content || '').toLowerCase().includes(q);
      const matchAuthor = (item.authorName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchAuthor) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-900 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Urgent Notice
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200 dark:border-amber-900">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
            General
          </span>
        );
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const map: Record<AnnouncementType, string> = {
      General: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      Academic: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      Homework: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      Exam: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      Event: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      Important: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      Holiday: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      Notice: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wide border ${map[type] || map.General}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-pink-200 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Megaphone className="w-4 h-4 text-pink-300" />
            <span>Official School & Teacher Announcements</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <span>Class Announcements & Circulars</span>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
            Real-time notifications, exam timetables, homework guidelines, and official circulars published by your teachers and school headmaster for {studentGrade}.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0 backdrop-blur-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Read / Unread Status Filter */}
          <div className="flex items-center gap-2">
            {(['ALL', 'UNREAD', 'READ'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  soundFx.playClick();
                  setFilterReadStatus(status);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  filterReadStatus === status
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>
                  {status === 'ALL'
                    ? `All Notices (${announcements.length})`
                    : status === 'UNREAD'
                    ? `Unread (${unreadCount})`
                    : `Read (${announcements.length - unreadCount})`}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'All Types' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {filterReadStatus === 'UNREAD' ? 'You are all caught up!' : 'No Announcements Yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {filterReadStatus === 'UNREAD'
                ? 'There are no new unread announcements for your class. Great job staying updated!'
                : 'Any official notices, exam schedules, or homework updates published by your teachers will appear here in real time.'}
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isRead = readIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleOpenAnnouncement(item)}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-4 cursor-pointer relative hover:shadow-md ${
                  !isRead
                    ? 'border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(item.type)}
                    {getPriorityBadge(item.priority)}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-400" />
                      {item.targetClass || 'All Students'}
                    </span>
                    {!isRead ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Unread
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                        Read
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item, e)}
                        title="Mark as read"
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Read</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                    {item.message || item.content || item.announcement}
                  </p>
                </div>

                {/* Footer details */}
                <div className="text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Posted by: <strong className="text-slate-700 dark:text-slate-300 font-bold">{item.authorName || 'Class Teacher'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Date: <strong className="text-slate-700 dark:text-slate-300 font-bold">{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </span>
                  </div>

                  <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedAnnouncement.type)}
                {getPriorityBadge(selectedAnnouncement.priority)}
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-start gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600 mt-1 shrink-0" />
                <span>{selectedAnnouncement.title}</span>
              </h2>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mt-4 whitespace-pre-line">
                {selectedAnnouncement.message || selectedAnnouncement.content || selectedAnnouncement.announcement}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Target Class:</span>
                <strong className="text-slate-900 dark:text-white">{selectedAnnouncement.targetClass || 'All Students'} {selectedAnnouncement.targetSection && selectedAnnouncement.targetSection !== 'All Sections' ? `(${selectedAnnouncement.targetSection})` : ''}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Published By:</span>
                <strong className="text-slate-900 dark:text-white">{selectedAnnouncement.authorName || 'Teacher'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Published Date:</span>
                <strong className="text-slate-900 dark:text-white">{new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow cursor-pointer transition"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
