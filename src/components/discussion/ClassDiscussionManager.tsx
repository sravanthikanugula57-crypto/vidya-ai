import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Lock,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  DiscussionGroupDoc,
  subscribeToAllDiscussionGroups,
  createDiscussionGroup,
  updateDiscussionGroupStatus,
  ensureDefaultClassDiscussionGroups
} from '../../services/discussionService';
import { ClassDiscussionFeed } from './ClassDiscussionFeed';
import { soundFx } from '../../lib/audio';

const AP_SUBJECTS = [
  'Physical Science',
  'Mathematics',
  'Biological Science',
  'Social Studies',
  'English',
  'Telugu',
  'Hindi'
];

const CLASSES = [10, 9, 8, 7, 6, 5];

interface ClassDiscussionManagerProps {
  currentUser: {
    uid: string;
    name: string;
    role: 'teacher' | 'mdm' | 'student';
    email?: string;
  };
}

export const ClassDiscussionManager: React.FC<ClassDiscussionManagerProps> = ({ currentUser }) => {
  const [groups, setGroups] = useState<DiscussionGroupDoc[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DiscussionGroupDoc | null>(null);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Form states for group creation
  const [formClass, setFormClass] = useState<number>(10);
  const [formSubject, setFormSubject] = useState<string>('Physical Science');
  const [formGroupName, setFormGroupName] = useState<string>('Class 10 Physical Science Discussion');
  const [formDescription, setFormDescription] = useState<string>('Official discussion room for Class 10 Physical Science students and teachers.');
  const [formChapterName, setFormChapterName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-generate group name when class or subject changes
  const handleFormSubjectOrClassChange = (newCls: number, newSub: string) => {
    setFormClass(newCls);
    setFormSubject(newSub);
    setFormGroupName(`Class ${newCls} ${newSub} Discussion`);
    setFormDescription(`Official interactive discussion room for Class ${newCls} ${newSub} students and teachers.`);
  };

  useEffect(() => {
    ensureDefaultClassDiscussionGroups();
    const unsub = subscribeToAllDiscussionGroups((data) => {
      setGroups(data);
      // If currently viewing a group, update its reference
      if (selectedGroup) {
        const updated = data.find((g) => g.groupId === selectedGroup.groupId);
        if (updated) setSelectedGroup(updated);
      }
    });
    return () => unsub();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGroupName.trim()) return;

    soundFx.playPop();
    setIsSubmitting(true);
    try {
      const newGrp = await createDiscussionGroup({
        board: 'AP_SSC',
        class: formClass,
        subject: formSubject,
        chapterName: formChapterName.trim() || undefined,
        groupName: formGroupName.trim(),
        description: formDescription.trim(),
        createdBy: currentUser.uid,
        createdByRole: currentUser.role === 'mdm' ? 'mdm' : 'teacher',
        createdByName: currentUser.name
      });

      setIsCreatingModalOpen(false);
      setSelectedGroup(newGrp);
      soundFx.playSuccess();
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.chapterName && g.chapterName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      selectedClassFilter === 'all' || String(g.class) === selectedClassFilter;

    const matchesSubject =
      selectedSubjectFilter === 'all' || g.subject === selectedSubjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  if (selectedGroup) {
    return (
      <ClassDiscussionFeed
        group={selectedGroup}
        currentUser={currentUser}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Classroom Discussion Groups • Firestore Active</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Class Discussion Management</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
            Create and moderate class discussion groups. Posts and student replies synchronize immediately across student, teacher, and MDM monitoring portals without requiring page refresh.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsCreatingModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discussion Group</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussion groups by name, subject, or chapter..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Classes</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={String(cls)}>Class {cls}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Subjects</option>
            {AP_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No discussion groups match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Create a group above or adjust your search filter.</p>
          </div>
        ) : (
          filteredGroups.map((grp, gIdx) => (
            <div
              key={grp.groupId || (grp as any).id || `grp-${gIdx}`}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/70 transition shadow-sm hover:shadow-md flex flex-col justify-between group cursor-pointer"
              onClick={() => {
                soundFx.playClick();
                setSelectedGroup(grp);
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Class {grp.class}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {grp.subject}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {grp.groupName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {grp.description || 'Interactive discussion room for course students.'}
                  </p>
                </div>

                {grp.chapterName && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Topic:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{grp.chapterName}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>By {grp.createdByName || grp.createdByRole.toUpperCase()}</span>
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                  Open Group <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Group Creation Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Discussion Group</h3>
                  <p className="text-xs text-slate-400">Create a real classroom discussion room for students.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => handleFormSubjectOrClassChange(parseInt(e.target.value, 10), formSubject)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => handleFormSubjectOrClassChange(formClass, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {AP_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={formGroupName}
                  onChange={(e) => setFormGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Chapter (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Refraction of Light, Quadratic Equations"
                  value={formChapterName}
                  onChange={(e) => setFormChapterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formGroupName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating...' : 'Create Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
