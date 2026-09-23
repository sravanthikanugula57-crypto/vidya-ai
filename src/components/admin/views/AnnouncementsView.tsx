import React, { useState, useEffect } from 'react';
import { soundFx } from '../../../lib/audio';
import {
  Bell,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  School,
  Calendar,
  Layers,
  Megaphone
} from 'lucide-react';
import { 
  AnnouncementDoc, 
  AnnouncementType, 
  AnnouncementPriority,
  subscribeToTeacherAnnouncements, 
  saveTeacherAnnouncement, 
  deleteAnnouncementDoc 
} from '../../../services/studentFirestoreService';

interface AnnouncementsViewProps {
  announcements?: any[];
  setAnnouncements?: any;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = () => {
  const [announcements, setAnnouncementsList] = useState<AnnouncementDoc[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementType>('Academic');
  const [targetClass, setTargetClass] = useState<string>('All Students');
  const [targetAudience, setTargetAudience] = useState<'All' | 'Teachers' | 'Students' | 'Parents'>('All');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToTeacherAnnouncements((items) => {
      setAnnouncementsList(items);
    });
    return () => unsub();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    soundFx.playSuccess();

    try {
      await saveTeacherAnnouncement({
        title: title.trim(),
        message: content.trim(),
        type: category,
        targetClass: targetClass,
        targetSection: 'All Sections',
        targetAudience: targetAudience,
        priority: priority,
        status: 'PUBLISHED',
        authorName: 'Headmaster / Admin',
        authorRole: 'admin'
      });

      setShowAddModal(false);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error publishing administrative announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    soundFx.playClick();
    try {
      await deleteAnnouncementDoc(id);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            Official Broadcast & Circular Center
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Announcements & Emergency Circular Bulletins
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast DEO Orders, Examination Dates, and School Holidays directly to Student, Teacher & Parent Portals in Real Time
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Bulletin</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">No Circulars Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Published announcements appear on all authorized student and teacher portals immediately.
            </p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative hover:border-amber-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                    {item.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    Target: {item.targetClass || 'All Students'}
                  </span>
                  {item.priority === 'Urgent' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                  {item.priority === 'Important' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                      Important
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                  {item.message || item.content || item.announcement}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Published by {item.authorName || 'School Administration'}</span>
                <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Publish Official Broadcast Circular
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Registration Notice / Holiday Circular"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Body Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter official circular details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                    <option value="Exam">Exam</option>
                    <option value="Notice">Notice</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Event">Event</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
