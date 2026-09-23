import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Upload,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  FileSpreadsheet,
  Bookmark,
  Layers,
  Video,
  ListOrdered,
  AlertTriangle,
  X,
  ExternalLink,
  Sparkles,
  Check,
  ChevronRight,
  Send,
  FileCheck,
  ShieldCheck,
  Globe,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  FirestoreLibraryResource,
  OfficialResourceType,
  OfficialResourceStatus,
  OfficialResourceLanguage,
  OfficialResourceSourceType
} from '../../../types/library';
import {
  createLibraryResource,
  updateResourceApprovalStatus,
  deleteLibraryResource,
  subscribeToDigitalLibrary,
  isVerifiedOfficialUrl,
  VERIFIED_OFFICIAL_DOMAINS
} from '../../../services/digitalLibraryService';
import { 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OFFICIAL_CLASSES, 
  OfficialClassGrade,
  normalizeGradeKey
} from '../../../data/officialSyllabusData';
import { IntegratedPDFViewerModal } from '../../common/IntegratedPDFViewerModal';
import { VideoModalPlayer, VideoItem } from '../../common/VideoModalPlayer';
import { auth } from '../../../lib/firebase';

export const OFFICIAL_RESOURCE_TYPES: { id: OfficialResourceType; label: string; icon: any; color: string }[] = [
  { id: 'Official Textbook', label: 'Official Textbook', icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  { id: 'Chapter Notes', label: 'Chapter Notes', icon: FileText, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  { id: 'Formula / Key Facts', label: 'Formula / Key Facts', icon: Bookmark, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  { id: 'Study Material', label: 'Study Material', icon: Layers, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  { id: 'Practice Material', label: 'Practice Material', icon: FileSpreadsheet, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800' },
  { id: 'Previous / Model Papers', label: 'Previous / Model Papers', icon: ListOrdered, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  { id: 'Video Lesson', label: 'Video Lesson', icon: Video, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' }
];

const SUPPORTED_LANGUAGES: OfficialResourceLanguage[] = ['English', 'Telugu', 'Hindi'];

const LANGUAGE_STORAGE_KEY = 'vidya_teacher_selected_lang';

interface TeacherDigitalLibraryManagerProps {
  teacherName?: string;
}

export const TeacherDigitalLibraryManager: React.FC<TeacherDigitalLibraryManagerProps> = ({
  teacherName = 'Authorized Teacher'
}) => {
  // Navigation tabs within Digital Library
  const [activeSubTab, setActiveSubTab] = useState<'manager' | 'approval_queue'>('manager');

  // Filter States
  const [filterClass, setFilterClass] = useState<string>('All Classes');
  const [filterSubject, setFilterSubject] = useState<string>('All Subjects');
  const [filterChapter, setFilterChapter] = useState<string>('All Chapters');
  const [filterType, setFilterType] = useState<string>('All Types');
  const [filterLanguage, setFilterLanguage] = useState<string>('All Languages');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Firestore Resources
  const [resources, setResources] = useState<FirestoreLibraryResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Viewers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [previewResource, setPreviewResource] = useState<FirestoreLibraryResource | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [deletingResource, setDeletingResource] = useState<FirestoreLibraryResource | null>(null);
  const [reviewModalResource, setReviewModalResource] = useState<FirestoreLibraryResource | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // -------------------------------------------------------------
  // FORM STATE: Step-by-Step Teacher Flow
  // 1. Class
  // 2. Subject
  // 3. Chapter
  // 4. Resource Type
  // 5. Title, Description, Language, Source, File/URL
  // -------------------------------------------------------------
  const [formClass, setFormClass] = useState<OfficialClassGrade>('Class 10');
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formChapter, setFormChapter] = useState<string>('');
  const [formChapterId, setFormChapterId] = useState<string>('ch_1');
  const [formType, setFormType] = useState<OfficialResourceType>('Chapter Notes');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formLanguage, setFormLanguage] = useState<OfficialResourceLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'Telugu' || saved === 'Hindi' || saved === 'English') return saved;
    }
    return 'English';
  });
  const [formSourceType, setFormSourceType] = useState<OfficialResourceSourceType>('file');
  const [formSource, setFormSource] = useState<string>('');
  const [formSourceUrl, setFormSourceUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [formLicense, setFormLicense] = useState<string>('AP Educational License');
  const [formAttribution, setFormAttribution] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Persist language choice
  const handleSetLanguage = (lang: OfficialResourceLanguage) => {
    setFormLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  // Real-time Firestore Subscription
  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToDigitalLibrary(
      {
        isStudent: false, // Teacher sees all statuses (draft, pending, approved, published, unpublished)
        classGrade: filterClass !== 'All Classes' ? filterClass : undefined,
        subject: filterSubject !== 'All Subjects' ? filterSubject : undefined,
        chapterName: filterChapter !== 'All Chapters' ? filterChapter : undefined,
        language: filterLanguage !== 'All Languages' ? filterLanguage : undefined,
        type: filterType !== 'All Types' ? filterType : undefined,
        status: filterStatus !== 'all' ? (filterStatus as OfficialResourceStatus) : undefined,
        searchQuery: searchQuery.trim() || undefined
      },
      (data) => {
        setResources(data);
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, [filterClass, filterSubject, filterChapter, filterLanguage, filterType, filterStatus, searchQuery]);

  // Dynamic Subjects for Selected Class in Form
  const availableSubjectsForForm = useMemo(() => {
    const normGrade = normalizeGradeKey(formClass);
    const syllabus = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || [];
    return syllabus.map((s) => s.name);
  }, [formClass]);

  // Keep form subject valid
  useEffect(() => {
    if (availableSubjectsForForm.length > 0 && !availableSubjectsForForm.includes(formSubject)) {
      setFormSubject(availableSubjectsForForm[0]);
    }
  }, [availableSubjectsForForm, formSubject]);

  // Dynamic Chapters for Selected Class & Subject in Form
  const availableChaptersForForm = useMemo(() => {
    const normGrade = normalizeGradeKey(formClass);
    const syllabus = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || [];
    const foundSubj = syllabus.find((s) => s.name.toLowerCase() === formSubject.toLowerCase());
    if (!foundSubj || !foundSubj.chapters || foundSubj.chapters.length === 0) {
      return [{ id: 'ch_general', title: 'General / Syllabus Overview' }];
    }
    return foundSubj.chapters.map((c) => ({
      id: String(c.id),
      title: c.title
    }));
  }, [formClass, formSubject]);

  // Keep form chapter valid
  useEffect(() => {
    if (availableChaptersForForm.length > 0) {
      const exists = availableChaptersForForm.some((c) => c.title === formChapter);
      if (!exists) {
        setFormChapter(availableChaptersForForm[0].title);
        setFormChapterId(availableChaptersForForm[0].id);
      }
    }
  }, [availableChaptersForForm, formChapter]);

  // Filter Chapters for Filter Bar
  const availableFilterChapters = useMemo(() => {
    if (filterClass === 'All Classes' || filterSubject === 'All Subjects') {
      return ['All Chapters'];
    }
    const normGrade = normalizeGradeKey(filterClass);
    const syllabus = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || [];
    const foundSubj = syllabus.find((s) => s.name.toLowerCase() === filterSubject.toLowerCase());
    if (!foundSubj) return ['All Chapters'];
    return ['All Chapters', ...foundSubj.chapters.map((c) => c.title)];
  }, [filterClass, filterSubject]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    soundFx.playSuccess();
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Open Create Resource Modal
  const handleOpenCreateModal = (presetType?: OfficialResourceType) => {
    soundFx.playClick();
    setFormClass('Class 10');
    setFormSubject('Mathematics');
    setFormType(presetType || 'Chapter Notes');
    setFormTitle('');
    setFormDescription('');
    setFormSourceType('file');
    setFormSource('SCERT Curriculum Reference');
    setFormSourceUrl('');
    setSelectedFile(null);
    setIsAiGenerated(false);
    setFormLicense('AP SCERT / Educational License');
    setFormAttribution(teacherName);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Submit Handler: Draft OR Submit for Approval
  const handleSubmitResource = async (targetStatus: 'draft' | 'pending' | 'published') => {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Please enter a Resource Title.');
      return;
    }
    if (!formSubject) {
      setFormError('Please select a Subject.');
      return;
    }
    if (!formChapter) {
      setFormError('Please select a Chapter.');
      return;
    }

    if (formSourceType === 'file' && !selectedFile) {
      setFormError('Please select a document or video file to upload.');
      return;
    }

    if (formSourceType === 'url') {
      const url = formSourceUrl.trim();
      if (!url) {
        setFormError('Please provide a valid URL.');
        return;
      }
      try {
        new URL(url);
      } catch (e) {
        setFormError('Invalid URL format. Must start with https://');
        return;
      }
    }

    // Validation: Official Textbook constraint
    if (formType === 'Official Textbook') {
      if (isAiGenerated) {
        setFormError('AI-generated content can NEVER be labelled as an Official Textbook.');
        return;
      }
      const urlToCheck = formSourceType === 'url' ? formSourceUrl.trim() : '';
      if (!isVerifiedOfficialUrl(urlToCheck)) {
        setFormError(
          'Only verified official AP State Board / SSC / NCERT sources (e.g. ap.gov.in, ncert.nic.in) may be labelled as "Official Textbook".'
        );
        return;
      }
    }

    // Validation: AI Generated constraints
    if (isAiGenerated) {
      if (formType === 'Official Textbook' || formType === 'Previous / Model Papers') {
        setFormError(
          'AI-generated content cannot be labelled as Official Textbook or Previous / Model Papers.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const currentAuthUser = auth.currentUser;
      await createLibraryResource({
        title: formTitle.trim(),
        description: formDescription.trim(),
        type: formType,
        class: formClass,
        subject: formSubject,
        chapterId: formChapterId,
        chapterName: formChapter,
        language: formLanguage,
        sourceType: formSourceType,
        sourceUrl: formSourceUrl.trim(),
        file: formSourceType === 'file' ? selectedFile : null,
        board: 'AP State Board',
        license: formLicense,
        attribution: formAttribution.trim() || teacherName,
        isAiGenerated,
        status: targetStatus,
        uploadedBy: {
          uid: currentAuthUser?.uid || 'teacher_local',
          name: teacherName,
          email: currentAuthUser?.email || '',
          role: 'teacher'
        }
      });

      setIsCreateModalOpen(false);
      showToast(
        targetStatus === 'published'
          ? `Resource "${formTitle}" published successfully to the Student Library!`
          : targetStatus === 'pending'
          ? `Resource "${formTitle}" submitted for Admin Approval.`
          : `Resource "${formTitle}" saved as Draft.`
      );
    } catch (err: any) {
      console.error('Error creating resource:', err);
      setFormError(err.message || 'Failed to create resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Approval Actions
  const handleAdminApprove = async (resource: FirestoreLibraryResource) => {
    soundFx.playClick();
    try {
      await updateResourceApprovalStatus(resource.resourceId, 'approved', 'Approved for curriculum publishing');
      showToast(`Resource "${resource.title}" approved.`);
    } catch (err: any) {
      alert(err.message || 'Failed to approve resource');
    }
  };

  const handleAdminPublish = async (resource: FirestoreLibraryResource) => {
    soundFx.playClick();
    try {
      await updateResourceApprovalStatus(resource.resourceId, 'published', 'Published to live student digital library');
      showToast(`Resource "${resource.title}" published! Live for students in ${resource.class}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to publish resource');
    }
  };

  const handleAdminUnpublish = async (resource: FirestoreLibraryResource) => {
    soundFx.playClick();
    try {
      await updateResourceApprovalStatus(resource.resourceId, 'unpublished', 'Resource unpublished by admin');
      showToast(`Resource "${resource.title}" unpublished.`);
    } catch (err: any) {
      alert(err.message || 'Failed to unpublish resource');
    }
  };

  const handleConfirmReject = async () => {
    if (!reviewModalResource) return;
    soundFx.playClick();
    try {
      await updateResourceApprovalStatus(
        reviewModalResource.resourceId,
        'draft',
        reviewNotes || 'Returned for revisions by Admin'
      );
      showToast(`Resource "${reviewModalResource.title}" returned to Draft.`);
      setReviewModalResource(null);
      setReviewNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject resource');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    soundFx.playClick();
    try {
      await deleteLibraryResource(deletingResource.resourceId, deletingResource.storagePath);
      showToast(`Resource "${deletingResource.title}" deleted.`);
      setDeletingResource(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  // Preview Handler
  const handleOpenPreview = (res: FirestoreLibraryResource) => {
    soundFx.playClick();
    if (res.type === 'Video Lesson' || res.fileType === 'video' || (res.fileUrl && (res.fileUrl.includes('youtube.com') || res.fileUrl.includes('youtu.be')))) {
      setActiveVideoModal({
        title: res.title,
        description: res.description,
        videoUrl: res.fileUrl,
        subject: res.subject,
        chapter: res.chapterName,
        teacher: typeof res.uploadedBy === 'object' ? res.uploadedBy.name : res.uploadedBy,
        duration: 'Lesson Video'
      });
    } else if (res.fileUrl && res.sourceType === 'url' && !res.fileUrl.endsWith('.pdf')) {
      window.open(res.fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      setPreviewResource(res);
    }
  };

  // Pending queue count
  const pendingCount = useMemo(() => {
    return resources.filter((r) => r.status === 'pending').length;
  }, [resources]);

  // Displayed items based on active sub tab
  const displayedResources = useMemo(() => {
    if (activeSubTab === 'approval_queue') {
      return resources.filter((r) => r.status === 'pending' || r.status === 'approved');
    }
    return resources;
  }, [resources, activeSubTab]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans pb-16 animate-fade-in" id="teacher-digital-library-portal">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER WITH WORKFLOW TABS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 border border-white/20 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase Source of Truth • AP SSC Digital Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-sky-400" />
              <span>DIGITAL LIBRARY RESOURCE MANAGER</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Upload, verify, and distribute educational resources for Classes 5 to 10. Managed in Firebase Firestore & Storage with an admin review and publishing workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-sky-500/30 cursor-pointer"
              id="add-resource-btn"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Resource Manager vs. Admin Approval Queue */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10 relative z-10">
          <button
            onClick={() => { soundFx.playClick(); setActiveSubTab('manager'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'manager'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
            id="subtab-manager"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Resource Manager</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-sky-300 font-extrabold">
              {resources.length}
            </span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveSubTab('approval_queue'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'approval_queue'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
            id="subtab-approval-queue"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Approval Queue</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-extrabold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & CASCADING FILTERS */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Query Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by resource title, subject, chapter, or keyword..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-700"
            id="search-resources-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Rows: Class, Subject, Chapter, Type, Language, Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilterChapter('All Chapters');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-class"
            >
              <option value="All Classes">All Classes</option>
              {OFFICIAL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setFilterChapter('All Chapters');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-subject"
            >
              <option value="All Subjects">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physical Science">Physical Science</option>
              <option value="Biological Science">Biological Science</option>
              <option value="General Science">General Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Telugu">Telugu</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Environmental Studies">Environmental Studies</option>
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Chapter
            </label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-chapter"
            >
              {availableFilterChapters.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-type"
            >
              <option value="All Types">All Types</option>
              {OFFICIAL_RESOURCE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-language"
            >
              <option value="All Languages">All Languages</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              id="filter-status"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RESOURCE CARDS LIST OR EMPTY STATE */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">Loading resources from Firestore...</p>
        </div>
      ) : displayedResources.length === 0 ? (
        /* Honest empty state per user instructions: "No resources available for this chapter yet." */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4" id="empty-state-notice">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No resources available for this chapter yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {activeSubTab === 'approval_queue'
                ? 'There are no pending resources waiting for curriculum approval.'
                : 'No educational resources have been uploaded for these filter criteria yet. Click "+ Add Resource" to upload a textbook, notes, or model paper.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="resources-grid">
          {displayedResources.map((res) => {
            const isPending = res.status === 'pending';
            const isPublished = res.status === 'published';
            const isDraft = res.status === 'draft';
            const isApproved = res.status === 'approved';
            const typeConfig = OFFICIAL_RESOURCE_TYPES.find((t) => t.id === res.type) || OFFICIAL_RESOURCE_TYPES[1];
            const Icon = typeConfig.icon;

            return (
              <motion.div
                key={res.resourceId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                id={`resource-card-${res.resourceId}`}
              >
                <div className="space-y-3">
                  {/* Status & Type Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${typeConfig.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{res.type}</span>
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                          : isApproved
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  {/* AI Label or Official Badge */}
                  {res.isAiGenerated && (
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>
                        {res.language === 'Telugu'
                          ? 'AI ద్వారా రూపొందించిన అధ్యయన సామగ్రి'
                          : res.language === 'Hindi'
                          ? 'AI द्वारा तैयार अध्ययन सामग्री'
                          : 'AI-Generated Study Material'}
                      </span>
                    </div>
                  )}

                  {res.isOfficial && res.verifiedOfficialSource && (
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Verified Official AP SCERT Resource</span>
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {res.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold">{res.class}</span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{res.subject}</span>
                      {res.chapterName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{res.chapterName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Language, Source Type & Uploader */}
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{res.language}</span>
                      <span>•</span>
                      <span>{res.sourceType === 'file' ? `File (${res.fileSize || 'PDF'})` : 'External URL'}</span>
                    </span>
                    <span>
                      {typeof res.uploadedBy === 'object' ? res.uploadedBy.name : res.uploadedBy}
                    </span>
                  </div>

                  {res.adminReviewNotes && (
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                      <span className="font-bold">Admin Note: </span>
                      <span>{res.adminReviewNotes}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPreview(res)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => setDeletingResource(res)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Workflow Approval / Publish Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    {isDraft && (
                      <div className="w-full flex items-center gap-2">
                        <button
                          onClick={() => handleAdminPublish(res)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publish Now</span>
                        </button>
                        <button
                          onClick={() => updateResourceApprovalStatus(res.resourceId, 'pending', 'Submitted by teacher')}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          title="Submit for Approval"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit</span>
                        </button>
                      </div>
                    )}

                    {isPending && (
                      <div className="w-full flex items-center gap-2">
                        <button
                          onClick={() => handleAdminApprove(res)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setReviewModalResource(res);
                            setReviewNotes('');
                          }}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleAdminPublish(res)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish to Live Library</span>
                      </button>
                    )}

                    {isPublished && (
                      <button
                        onClick={() => handleAdminUnpublish(res)}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Unpublish</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE RESOURCE (STEP-BY-STEP TEACHER FLOW) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-6"
              id="create-resource-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Add New Digital Resource
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Follow the teacher curriculum workflow to attach materials to official AP State Board syllabus.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs font-semibold">
                
                {/* STEP 1: SELECT CLASS */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    1. Select Class
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {OFFICIAL_CLASSES.map((cls) => (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => {
                          soundFx.playClick();
                          setFormClass(cls);
                        }}
                        className={`py-2.5 px-2 rounded-2xl text-xs font-black transition cursor-pointer text-center ${
                          formClass === cls
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: SELECT SUBJECT */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    2. Select Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {availableSubjectsForForm.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* STEP 3: SELECT CHAPTER */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    3. Select Chapter / Topic
                  </label>
                  <select
                    value={formChapter}
                    onChange={(e) => {
                      setFormChapter(e.target.value);
                      const found = availableChaptersForForm.find((c) => c.title === e.target.value);
                      if (found) setFormChapterId(found.id);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {availableChaptersForForm.map((ch) => (
                      <option key={ch.id} value={ch.title}>{ch.title}</option>
                    ))}
                  </select>
                </div>

                {/* STEP 4: SELECT RESOURCE TYPE */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    4. Select Resource Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {OFFICIAL_RESOURCE_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = formType === t.id;
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            soundFx.playClick();
                            setFormType(t.id);
                          }}
                          className={`p-2.5 rounded-2xl text-[11px] font-black transition cursor-pointer flex items-center gap-2 text-left border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 5: DETAILS (Title, Description, Language, Source) */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Real Numbers — Comprehensive Handwritten Notes"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief overview of what students will learn from this resource..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Language
                    </label>
                    <div className="flex items-center gap-2">
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                          type="button"
                          key={l}
                          onClick={() => handleSetLanguage(l)}
                          className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
                            formLanguage === l
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Source Attribution */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Source / Author
                    </label>
                    <input
                      type="text"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      placeholder="e.g. AP SCERT / Teacher Faculty Notes"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* STEP 6: SOURCE TYPE (FILE OR VERIFIED URL) */}
                  <div className="pt-2">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Resource Source (File or Verified URL)
                    </label>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setFormSourceType('file')}
                        className={`flex-1 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                          formSourceType === 'file'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File (Storage)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormSourceType('url')}
                        className={`flex-1 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                          formSourceType === 'url'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verified External URL</span>
                      </button>
                    </div>

                    {formSourceType === 'file' ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-5 text-center bg-slate-50 dark:bg-slate-800/50 space-y-2">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedFile ? (
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          ) : (
                            <span>Drag and drop a PDF or MP4 video, or click to browse</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.mp4,.webm,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                            }
                          }}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={formSourceUrl}
                          onChange={(e) => setFormSourceUrl(e.target.value)}
                          placeholder="https://scert.ap.gov.in/textbooks/math10.pdf"
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        />
                        {formType === 'Official Textbook' && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className={`w-3.5 h-3.5 ${isVerifiedOfficialUrl(formSourceUrl) ? 'text-emerald-500' : 'text-amber-500'}`} />
                            <span>
                              {isVerifiedOfficialUrl(formSourceUrl)
                                ? 'Verified AP State Board / SCERT / NCERT official portal URL.'
                                : 'Official textbooks require a verified government domain (e.g. ap.gov.in, ncert.nic.in).'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Generated Checkbox */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAiGenerated}
                        onChange={(e) => setIsAiGenerated(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>This is AI-Generated study material (will be clearly labeled per state regulations)</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: DRAFT vs SUBMIT FOR APPROVAL vs PUBLISH */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitResource('draft')}
                  className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitResource('pending')}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitResource('published')}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Immediately'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MODAL: REJECT WITH NOTES MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {reviewModalResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Return Resource for Revisions
              </h3>
              <p className="text-xs text-slate-500">
                Provide feedback to the teacher explaining what needs modification before publication.
              </p>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Please attach the latest 2026 AP SCERT blueprint formula questions."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setReviewModalResource(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md"
                >
                  Return to Draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. MODAL: CONFIRM DELETE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Delete Resource?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete "{deletingResource.title}"? This cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingResource(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. INTEGRATED REAL VIEWERS (PDF & VIDEO) */}
      {/* ========================================================================= */}
      {previewResource && (
        <IntegratedPDFViewerModal
          onClose={() => setPreviewResource(null)}
          paper={{
            id: previewResource.resourceId,
            title: previewResource.title,
            subject: previewResource.subject,
            board: previewResource.board || 'AP State Board',
            year: '2026',
            medium: previewResource.language,
            fileSize: previewResource.fileSize || 'PDF Document',
            pdfUrl: previewResource.fileUrl
          }}
        />
      )}

      {activeVideoModal && (
        <VideoModalPlayer
          isOpen={true}
          onClose={() => setActiveVideoModal(null)}
          video={activeVideoModal}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs shadow-2xl border border-slate-700 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
