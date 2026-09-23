import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Archive, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  X, 
  Filter, 
  Search, 
  Layers, 
  Users, 
  School,
  AlertCircle,
  HelpCircle,
  Bell,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  AnnouncementDoc, 
  AnnouncementType, 
  AnnouncementPriority, 
  AnnouncementStatus,
  subscribeToTeacherAnnouncements, 
  saveTeacherAnnouncement, 
  deleteAnnouncementDoc, 
  archiveAnnouncementDoc 
} from '../../../services/studentFirestoreService';

const ANNOUNCEMENT_TYPES: AnnouncementType[] = [
  'General',
  'Academic',
  'Homework',
  'Exam',
  'Event',
  'Important',
  'Holiday',
  'Notice'
];

const TARGET_CLASSES = [
  'All Students',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
];

const TARGET_SECTIONS = [
  'All Sections',
  'Section A',
  'Section B',
  'Section C',
  '5A',
  '5B',
  '6A',
  '6B',
  '7A',
  '7B',
  '8A',
  '8B',
  '9A',
  '9B',
  '10A',
  '10B'
];

interface AnnouncementsViewProps {
  teacherName?: string;
  teacherRole?: string;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  teacherName = 'Class Teacher (Sri M. Venkatrao)',
  teacherRole = 'teacher'
}) => {
  // Announcements state from Firestore
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<Partial<AnnouncementDoc> | null>(null);
  const [editingItem, setEditingItem] = useState<AnnouncementDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    message: string;
    type: AnnouncementType;
    targetClass: string;
    targetSection: string;
    targetAudience: 'All' | 'Students' | 'Parents' | 'Teachers';
    priority: AnnouncementPriority;
    publishTiming: 'now' | 'schedule';
    scheduledDate: string;
    scheduledTime: string;
    hasExpiry: boolean;
    expiryDate: string;
    expiryTime: string;
  }>({
    title: '',
    message: '',
    type: 'Academic',
    targetClass: 'All Students',
    targetSection: 'All Sections',
    targetAudience: 'All',
    priority: 'Normal',
    publishTiming: 'now',
    scheduledDate: '',
    scheduledTime: '09:00',
    hasExpiry: false,
    expiryDate: '',
    expiryTime: '23:59'
  });

  // AI Assistant suggestion state
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeToTeacherAnnouncements((items) => {
      setAnnouncements(items);
    });
    return () => unsub();
  }, []);

  const handleOpenCreateModal = (existing?: AnnouncementDoc) => {
    soundFx.playClick();
    if (existing) {
      setEditingItem(existing);
      const isScheduled = !!existing.scheduledFor && new Date(existing.scheduledFor) > new Date();
      const sched = existing.scheduledFor ? new Date(existing.scheduledFor) : null;
      const exp = existing.expiresAt ? new Date(existing.expiresAt) : null;

      setFormData({
        id: existing.id,
        title: existing.title,
        message: existing.message || existing.content || existing.announcement || '',
        type: existing.type,
        targetClass: existing.targetClass || 'All Students',
        targetSection: existing.targetSection || 'All Sections',
        targetAudience: existing.targetAudience || 'All',
        priority: existing.priority || 'Normal',
        publishTiming: isScheduled ? 'schedule' : 'now',
        scheduledDate: sched ? sched.toISOString().split('T')[0] : '',
        scheduledTime: sched ? sched.toTimeString().slice(0, 5) : '09:00',
        hasExpiry: !!existing.expiresAt,
        expiryDate: exp ? exp.toISOString().split('T')[0] : '',
        expiryTime: exp ? exp.toTimeString().slice(0, 5) : '23:59'
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        message: '',
        type: 'Academic',
        targetClass: 'All Students',
        targetSection: 'All Sections',
        targetAudience: 'All',
        priority: 'Normal',
        publishTiming: 'now',
        scheduledDate: '',
        scheduledTime: '09:00',
        hasExpiry: false,
        expiryDate: '',
        expiryTime: '23:59'
      });
    }
    setShowCreateModal(true);
  };

  const handleSaveAnnouncement = async (statusToSave: AnnouncementStatus) => {
    if (!formData.title.trim()) {
      alert('Please provide an announcement title.');
      return;
    }
    if (!formData.message.trim()) {
      alert('Please provide announcement message content.');
      return;
    }

    setIsSubmitting(true);
    soundFx.playSuccess();

    try {
      let scheduledFor: string | null = null;
      if (formData.publishTiming === 'schedule' && formData.scheduledDate) {
        scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime || '09:00'}:00`).toISOString();
      }

      let expiresAt: string | null = null;
      if (formData.hasExpiry && formData.expiryDate) {
        expiresAt = new Date(`${formData.expiryDate}T${formData.expiryTime || '23:59'}:00`).toISOString();
      }

      await saveTeacherAnnouncement({
        id: editingItem?.id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetClass: formData.targetClass,
        targetSection: formData.targetSection,
        targetAudience: formData.targetAudience,
        priority: formData.priority,
        status: statusToSave,
        authorName: teacherName,
        authorRole: (teacherRole as any) || 'teacher',
        scheduledFor,
        expiresAt
      });

      setShowCreateModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert('Failed to save announcement. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectPublish = async (item: AnnouncementDoc) => {
    soundFx.playSuccess();
    try {
      await saveTeacherAnnouncement({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        targetClass: item.targetClass,
        targetSection: item.targetSection,
        targetAudience: item.targetAudience,
        priority: item.priority,
        status: 'PUBLISHED',
        authorName: item.authorName || teacherName,
        authorRole: (item.authorRole as any) || 'teacher',
        scheduledFor: null,
        expiresAt: item.expiresAt
      });
    } catch (err) {
      console.error('Error publishing announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    soundFx.playClick();
    try {
      await deleteAnnouncementDoc(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const handleArchive = async (id: string) => {
    soundFx.playClick();
    try {
      await archiveAnnouncementDoc(id);
    } catch (err) {
      console.error('Failed to archive announcement:', err);
    }
  };

  // AI draft assistant helper (produces template for teacher to review & edit)
  const handleGenerateAiDraft = () => {
    if (!aiPromptTopic.trim()) return;
    setIsGeneratingAI(true);
    soundFx.playClick();

    setTimeout(() => {
      let suggestedTitle = '';
      let suggestedMessage = '';
      let suggestedType: AnnouncementType = 'General';
      let suggestedPriority: AnnouncementPriority = 'Normal';

      const topicLower = aiPromptTopic.toLowerCase();
      if (topicLower.includes('exam') || topicLower.includes('test') || topicLower.includes('fa') || topicLower.includes('sa')) {
        suggestedTitle = `Upcoming ${formData.targetClass} Assessment & Syllabus Revision`;
        suggestedMessage = `Dear Students, please be informed that the upcoming subject evaluation will be held this week. Kindly revise all prescribed SCERT textbook chapters and complete practice worksheets. Bring required stationery and report 10 minutes prior to class time.`;
        suggestedType = 'Exam';
        suggestedPriority = 'Important';
      } else if (topicLower.includes('holiday') || topicLower.includes('vacation') || topicLower.includes('leave')) {
        suggestedTitle = `School Holiday Notice - ${aiPromptTopic}`;
        suggestedMessage = `All students and parents are hereby notified that the school will remain closed on the occasion of ${aiPromptTopic}. Regular class schedules will resume on the subsequent working day. Complete your assigned self-study tasks during the break.`;
        suggestedType = 'Holiday';
        suggestedPriority = 'Important';
      } else if (topicLower.includes('homework') || topicLower.includes('assignment') || topicLower.includes('project')) {
        suggestedTitle = `Homework Submission Deadline - ${formData.targetClass}`;
        suggestedMessage = `Please note that all students must submit their completed chapter assignments and lab activity record books by tomorrow. Ensure neat handwriting and parental acknowledgment.`;
        suggestedType = 'Homework';
        suggestedPriority = 'Normal';
      } else {
        suggestedTitle = `Important Notice: ${aiPromptTopic}`;
        suggestedMessage = `This is an official announcement regarding ${aiPromptTopic} for ${formData.targetClass}. All students are advised to read carefully and adhere to the guidelines provided by the school administration.`;
        suggestedType = 'Notice';
        suggestedPriority = 'Normal';
      }

      setFormData((prev) => ({
        ...prev,
        title: suggestedTitle,
        message: suggestedMessage,
        type: suggestedType,
        priority: suggestedPriority
      }));

      setIsGeneratingAI(false);
      setShowAiAssistant(false);
    }, 400);
  };

  // Filtered announcements list
  const now = Date.now();
  const filteredList = announcements.filter((item) => {
    const isExpired = item.expiresAt ? new Date(item.expiresAt).getTime() <= now : false;

    // Filter by Tab
    if (activeFilterTab === 'DRAFT' && item.status !== 'DRAFT') return false;
    if (activeFilterTab === 'PUBLISHED' && (item.status !== 'PUBLISHED' || isExpired)) return false;
    if (activeFilterTab === 'EXPIRED' && !isExpired && item.status !== 'EXPIRED' && item.status !== 'ARCHIVED') return false;

    // Filter by Type
    if (selectedTypeFilter !== 'ALL' && item.type !== selectedTypeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = (item.message || '').toLowerCase().includes(q);
      const matchClass = (item.targetClass || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchClass) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Urgent Priority
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200 dark:border-amber-900">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
            Normal
          </span>
        );
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const map: Record<AnnouncementType, string> = {
      General: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      Academic: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      Homework: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      Exam: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
      Event: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
      Important: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
      Holiday: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
      Notice: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wide ${map[type] || map.General}`}>
        {type}
      </span>
    );
  };

  const getStatusBadge = (item: AnnouncementDoc) => {
    const isExpired = item.expiresAt ? new Date(item.expiresAt).getTime() <= now : false;
    if (isExpired || item.status === 'EXPIRED') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[9px] uppercase">
          Expired
        </span>
      );
    }
    if (item.status === 'DRAFT') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[9px] uppercase border border-amber-300 dark:border-amber-800">
          Draft
        </span>
      );
    }
    if (item.status === 'ARCHIVED') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[9px] uppercase">
          Archived
        </span>
      );
    }
    const isScheduled = !!item.scheduledFor && new Date(item.scheduledFor).getTime() > now;
    if (isScheduled) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black text-[9px] uppercase border border-sky-300 dark:border-sky-800">
          Scheduled ({new Date(item.scheduledFor!).toLocaleDateString('en-IN')})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[9px] uppercase border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live in Student Portal
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Megaphone className="w-4 h-4" />
            <span>Teacher & School Broadcast Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Targeted Class Announcements
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            Create verified academic, exam, homework, and administrative circulars with class and section targeting. Announcements appear in real-time on student dashboards only after teacher authorization.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 md:pb-0 md:border-none">
            {(['ALL', 'PUBLISHED', 'DRAFT', 'EXPIRED'] as const).map((tab) => {
              const count = announcements.filter((a) => {
                const isExp = a.expiresAt ? new Date(a.expiresAt).getTime() <= now : false;
                if (tab === 'ALL') return true;
                if (tab === 'DRAFT') return a.status === 'DRAFT';
                if (tab === 'PUBLISHED') return a.status === 'PUBLISHED' && !isExp;
                if (tab === 'EXPIRED') return isExp || a.status === 'EXPIRED' || a.status === 'ARCHIVED';
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveFilterTab(tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    activeFilterTab === tab
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Broadcasts' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeFilterTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {ANNOUNCEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {activeFilterTab === 'ALL' ? 'No Announcements Created Yet' : `No ${activeFilterTab.toLowerCase()} announcements found`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Announcements will appear in the Student Portal only after you compose and publish them. Click the button below to draft your first announcement.
            </p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Announcement</span>
            </button>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(item.type)}
                  {getPriorityBadge(item.priority)}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center gap-1">
                    <School className="w-3 h-3 text-slate-400" />
                    Target: {item.targetClass || 'All Students'} {item.targetSection && item.targetSection !== 'All Sections' ? `(${item.targetSection})` : ''}
                  </span>
                  {getStatusBadge(item)}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setPreviewItem(item);
                    }}
                    title="Student View Preview"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>

                  {item.status === 'DRAFT' && (
                    <button
                      onClick={() => handleDirectPublish(item)}
                      title="Publish to students immediately"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Now</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenCreateModal(item)}
                    title="Edit announcement"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleArchive(item.id)}
                    title="Archive announcement"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold transition cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    title="Delete permanently"
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                  {item.message || item.content || item.announcement}
                </p>
              </div>

              {/* Metadata Footer */}
              <div className="text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span>Posted by: <strong className="text-slate-700 dark:text-slate-300">{item.authorName || 'Teacher'}</strong></span>
                  <span>Published: <strong>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  {item.scheduledFor && new Date(item.scheduledFor).getTime() > now && (
                    <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      Scheduled: {new Date(item.scheduledFor).toLocaleString('en-IN')}
                    </span>
                  )}
                  {item.expiresAt && (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                      <Calendar className="w-3 h-3" />
                      Expires: {new Date(item.expiresAt).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {editingItem ? 'Edit Announcement' : 'Compose Class Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assistant Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  AI Draft Suggestion: Teacher approval is required before publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow transition shrink-0 cursor-pointer"
              >
                {showAiAssistant ? 'Hide Helper' : 'Draft with AI'}
              </button>
            </div>

            {showAiAssistant && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  What topic would you like to announce? (e.g. "Science FA-1 Test on Friday", "Independence Day celebration timing", "Holiday for Diwali")
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter topic..."
                    value={aiPromptTopic}
                    onChange={(e) => setAiPromptTopic(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAI || !aiPromptTopic.trim()}
                    onClick={handleGenerateAiDraft}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Generate Draft</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Test on Friday / Class 5 Exam Schedule"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Revise Chapter 3 before Friday's test. Bring required notebooks..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Row 1: Type, Priority, Target Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent (Top of Student Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class *
                  </label>
                  <select
                    value={formData.targetClass}
                    onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    {TARGET_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Target Section & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Section
                  </label>
                  <select
                    value={formData.targetSection}
                    onChange={(e) => setFormData({ ...formData, targetSection: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    {TARGET_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="All">All Portal Users (Students & Parents)</option>
                    <option value="Students">Students Only</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Teachers">Teachers Only</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Publish Timing (Publish Now vs Schedule) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Publish Schedule</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="publishTiming"
                        checked={formData.publishTiming === 'now'}
                        onChange={() => setFormData({ ...formData, publishTiming: 'now' })}
                        className="text-emerald-600"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">Publish Now</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="publishTiming"
                        checked={formData.publishTiming === 'schedule'}
                        onChange={() => setFormData({ ...formData, publishTiming: 'schedule' })}
                        className="text-emerald-600"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">Schedule for Later</span>
                    </label>
                  </div>
                </div>

                {formData.publishTiming === 'schedule' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Time</label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Optional Expiration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasExpiry}
                      onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>Set Expiry Date (Auto-disappears from active student feed after date)</span>
                  </label>
                </div>

                {formData.hasExpiry && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiry Time</label>
                      <input
                        type="time"
                        value={formData.expiryTime}
                        onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Save Draft, Preview, Publish */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPreviewItem({
                    title: formData.title || 'Untitled Announcement',
                    message: formData.message || 'No content provided yet.',
                    type: formData.type,
                    priority: formData.priority,
                    targetClass: formData.targetClass,
                    targetSection: formData.targetSection,
                    authorName: teacherName,
                    publishedAt: new Date().toISOString()
                  });
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveAnnouncement('DRAFT')}
                  className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveAnnouncement('PUBLISHED')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                  Student Portal View Preview
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Render exact student card */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {previewItem.type && getTypeBadge(previewItem.type)}
                  {previewItem.priority && getPriorityBadge(previewItem.priority)}
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  ● New
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <span>{previewItem.title}</span>
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {previewItem.message || previewItem.content}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div>Target: <strong className="text-slate-700 dark:text-slate-200">{previewItem.targetClass || 'All Students'} {previewItem.targetSection && previewItem.targetSection !== 'All Sections' ? `(${previewItem.targetSection})` : ''}</strong></div>
                <div>Posted by: <strong className="text-slate-700 dark:text-slate-200">{previewItem.authorName || teacherName}</strong></div>
                <div>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Permanently Delete Announcement?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This announcement will be immediately removed from the Firestore database and will no longer appear on any student portal.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
