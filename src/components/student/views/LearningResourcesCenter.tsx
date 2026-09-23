import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  FileText,
  Eye,
  Play,
  Video,
  Layers,
  FileSpreadsheet,
  ListOrdered,
  X,
  Clock,
  Filter,
  ExternalLink,
  ShieldCheck,
  Globe,
  FolderOpen
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  FirestoreLibraryResource,
  OfficialResourceType,
  OfficialResourceLanguage,
  SavedResourceRecord
} from '../../../types/library';
import { 
  subscribeToDigitalLibrary, 
  subscribeToSavedResources, 
  toggleSaveResource, 
  trackResourceDownload,
  isSubjectMatch,
  isChapterMatch
} from '../../../services/digitalLibraryService';
import { 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  normalizeGradeKey, 
  OfficialClassGrade 
} from '../../../data/officialSyllabusData';
import { IntegratedPDFViewerModal } from '../../common/IntegratedPDFViewerModal';
import { VideoModalPlayer, VideoItem } from '../../common/VideoModalPlayer';
import { auth } from '../../../lib/firebase';
import { useLanguage } from '../../../context/LanguageContext';
import { useStudentClass } from '../../../context/StudentClassContext';

export type StudentFilterCategory =
  | 'ALL'
  | OfficialResourceType
  | 'SAVED';

interface LearningResourcesCenterProps {
  initialCategory?: string;
  studentClassGrade?: string;
  studentId?: string;
  initialSubject?: string;
  initialChapter?: string;
}

const CATEGORY_TABS: { id: StudentFilterCategory; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Resources', icon: Layers },
  { id: 'Official Textbook', label: 'Textbooks', icon: BookOpen },
  { id: 'Chapter Notes', label: 'Chapter Notes', icon: FileText },
  { id: 'Formula / Key Facts', label: 'Formula Sheets', icon: Bookmark },
  { id: 'Study Material', label: 'Study Material', icon: Layers },
  { id: 'Practice Material', label: 'Practice Sets', icon: FileSpreadsheet },
  { id: 'Previous / Model Papers', label: 'Previous Papers', icon: ListOrdered },
  { id: 'Video Lesson', label: 'Video Lessons', icon: Video },
  { id: 'SAVED', label: 'Saved Resources', icon: BookmarkCheck },
];

export const LearningResourcesCenter: React.FC<LearningResourcesCenterProps> = ({
  initialCategory = 'ALL',
  studentClassGrade,
  studentId = 'std_current',
  initialSubject,
  initialChapter
}) => {
  const { language: currentAppLang } = useLanguage();
  const { selectedClass } = useStudentClass();

  // CLASS LOGIC: Do not default to Class 5! Always respect student's selected class.
  const activeClass: string = useMemo(() => {
    if (selectedClass) return selectedClass;
    if (studentClassGrade) return studentClassGrade;
    return 'Class 10';
  }, [studentClassGrade, selectedClass]);

  const normGrade = normalizeGradeKey(activeClass) as OfficialClassGrade;
  
  // Real Syllabus data for the student's actual class
  const classSyllabus = useMemo(() => {
    return OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'] || [];
  }, [normGrade]);

  // Active Category / Resource Type Tab
  const [activeTab, setActiveTab] = useState<StudentFilterCategory>(() => {
    if (initialCategory === 'Textbook' || initialCategory === 'Official Textbook') return 'Official Textbook';
    if (initialCategory === 'notes' || initialCategory === 'Chapter Notes') return 'Chapter Notes';
    if (initialCategory === 'formula_sheets' || initialCategory === 'Formula / Key Facts') return 'Formula / Key Facts';
    if (initialCategory === 'practice' || initialCategory === 'Practice Material') return 'Practice Material';
    if (initialCategory === 'videos' || initialCategory === 'Video Lesson') return 'Video Lesson';
    if (initialCategory === 'pyqs' || initialCategory === 'Previous / Model Papers') return 'Previous / Model Papers';
    return 'ALL';
  });

  // Filters: Subject, Chapter, Language, Search
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'All Subjects');
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapter || 'All Chapters');
  
  // Language filter (English, Telugu, Hindi) - defaults to user's selected language
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    if (currentAppLang === 'te') return 'Telugu';
    if (currentAppLang === 'hi') return 'Hindi';
    return 'All Languages';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Firestore Data (Strictly published resources for this class)
  const [resources, setResources] = useState<FirestoreLibraryResource[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedResourceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals for real viewers
  const [pdfPreviewResource, setPdfPreviewResource] = useState<FirestoreLibraryResource | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  // Real-time listener for Published Resources from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToDigitalLibrary(
      {
        isStudent: true, // STRICT: only returns status === 'published'
        classGrade: activeClass
      },
      (data) => {
        setResources(data);
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, [activeClass]);

  // Real-time listener for Student's Saved / Bookmarked Resources
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || studentId;
    const unsubSaved = subscribeToSavedResources(currentUid, (records) => {
      setSavedRecords(records);
    });
    return () => unsubSaved();
  }, [studentId]);

  // Available chapters for the selected subject
  const availableChapters = useMemo(() => {
    if (selectedSubject === 'All Subjects') {
      return ['All Chapters'];
    }
    const subj = classSyllabus.find((s) => s.name.toLowerCase() === selectedSubject.toLowerCase());
    if (!subj || !subj.chapters) return ['All Chapters'];
    return ['All Chapters', ...subj.chapters.map((c) => c.title)];
  }, [selectedSubject, classSyllabus]);

  // Reset chapter if not available in current subject
  useEffect(() => {
    if (!availableChapters.includes(selectedChapter)) {
      setSelectedChapter('All Chapters');
    }
  }, [availableChapters, selectedChapter]);

  // Bookmark checker
  const isResourceSaved = (resId: string) => {
    return savedRecords.some((s) => s.resourceId === resId);
  };

  // Toggle bookmark handler
  const handleToggleBookmark = async (resource: FirestoreLibraryResource) => {
    soundFx.playClick();
    const currentUid = auth.currentUser?.uid || studentId;
    const added = await toggleSaveResource(currentUid, resource);
    if (added) soundFx.playSuccess();
  };

  // Open resource viewer handler
  const handleOpenResource = (res: FirestoreLibraryResource) => {
    soundFx.playClick();
    trackResourceDownload(res.resourceId);

    const fUrl = res.fileUrl || res.sourceUrl || '';
    if (res.type === 'Video Lesson' || res.fileType === 'video' || fUrl.includes('youtube.com') || fUrl.includes('youtu.be')) {
      setActiveVideoModal({
        title: res.title || 'Video Lesson',
        description: res.description || '',
        videoUrl: fUrl,
        subject: res.subject || 'Subject',
        chapter: res.chapterName || '',
        teacher: typeof res.uploadedBy === 'object' ? res.uploadedBy.name : res.uploadedBy,
        duration: 'Lesson Video'
      });
    } else if (res.sourceType === 'url' && !fUrl.endsWith('.pdf')) {
      // Verified external URL
      window.open(fUrl, '_blank', 'noopener,noreferrer');
    } else {
      setPdfPreviewResource(res);
    }
  };

  // Filtered resources list for the student
  const displayedResources = useMemo(() => {
    let list = resources;

    // If 'SAVED' tab is active, show only saved resources
    if (activeTab === 'SAVED') {
      list = savedRecords.map((s) => s.resource).filter(Boolean);
    } else if (activeTab !== 'ALL') {
      const target = activeTab.toLowerCase();
      list = list.filter((r) => {
        const t1 = (r.type || '').toLowerCase();
        const t2 = (r.resourceType || '').toLowerCase();
        return t1 === target || t2 === target || (target === 'video lesson' && r.fileType === 'video');
      });
    }

    // Subject Filter
    if (selectedSubject !== 'All Subjects') {
      list = list.filter((r) => isSubjectMatch(r.subject, selectedSubject));
    }

    // Chapter Filter
    if (selectedChapter !== 'All Chapters') {
      list = list.filter((r) => isChapterMatch(r.chapterId, r.chapterName, undefined, selectedChapter));
    }

    // Language Filter (English, Telugu, Hindi)
    if (selectedLanguage !== 'All Languages') {
      list = list.filter((r) => (r.language || '').toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q) ||
        (r.chapterName || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [resources, savedRecords, activeTab, selectedSubject, selectedChapter, selectedLanguage, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: resources.length,
      SAVED: savedRecords.length
    };
    CATEGORY_TABS.forEach((tab) => {
      if (tab.id !== 'ALL' && tab.id !== 'SAVED') {
        const target = tab.id.toLowerCase();
        counts[tab.id] = resources.filter((r) => {
          const t1 = (r.type || '').toLowerCase();
          const t2 = (r.resourceType || '').toLowerCase();
          return t1 === target || t2 === target || (target === 'video lesson' && r.fileType === 'video');
        }).length;
      }
    });
    return counts;
  }, [resources, savedRecords]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans animate-in fade-in pb-16" id="student-digital-library-view">
      
      {/* ========================================================================= */}
      {/* 1. HEADER HERO BANNER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 border border-white/20 text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{activeClass} • AP State Board (SSC) Digital Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>DIGITAL LIBRARY</span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-2xl leading-relaxed">
              Real published educational materials for {activeClass}. Access official textbooks, teacher chapter notes, verified formula sheets, and practice papers.
            </p>
          </div>
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full z-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeClass} textbooks, notes, formula sheets, or question papers...`}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-sky-400/50 shadow-lg"
            id="student-search-library-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY TABS (RESOURCE TYPES) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. CASCADING FILTERS: SUBJECT, CHAPTER & LANGUAGE */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        
        {/* Row 1: Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </span>

          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedSubject('All Subjects');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              selectedSubject === 'All Subjects'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>

          {classSyllabus.map((subj) => (
            <button
              key={subj.name}
              onClick={() => {
                soundFx.playClick();
                setSelectedSubject(subj.name);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                selectedSubject.toLowerCase() === subj.name.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {subj.name}
            </button>
          ))}
        </div>

        {/* Row 2: Chapter Filter Pills (when subject is selected) */}
        {selectedSubject !== 'All Subjects' && availableChapters.length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-2">
              Chapter:
            </span>
            {availableChapters.map((chap) => (
              <button
                key={chap}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedChapter(chap);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  selectedChapter.toLowerCase() === chap.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {chap}
              </button>
            ))}
          </div>
        )}

        {/* Row 3: Language Filter Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Globe className="w-3 h-3" />
            <span>Language:</span>
          </span>
          {['All Languages', 'English', 'Telugu', 'Hindi'].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                soundFx.playClick();
                setSelectedLanguage(lang);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedLanguage === lang
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RESOURCE CARDS OR HONEST EMPTY STATE */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">Loading resources from Digital Library...</p>
        </div>
      ) : displayedResources.length === 0 ? (
        /* Mandatory empty state from user instructions: "No resources available for this chapter yet." */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4" id="student-empty-state-notice">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              No resources available for this chapter yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your teachers have not published any materials matching your selected filters yet. Check back soon or switch subjects.
            </p>
          </div>
          {(selectedSubject !== 'All Subjects' || selectedChapter !== 'All Chapters' || searchQuery || selectedLanguage !== 'All Languages') && (
            <button
              onClick={() => {
                setSelectedSubject('All Subjects');
                setSelectedChapter('All Chapters');
                setSelectedLanguage('All Languages');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="student-resources-grid">
          {displayedResources.map((res) => {
            const isSaved = isResourceSaved(res.resourceId);
            const isVideo = res.type === 'Video Lesson' || res.fileType === 'video';

            return (
              <motion.div
                key={res.resourceId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                id={`student-card-${res.resourceId}`}
              >
                <div className="space-y-3">
                  {/* Top Badges & Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{res.type}</span>
                    </span>

                    <button
                      onClick={() => handleToggleBookmark(res)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isSaved
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Resource'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
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
                      <span>Official Textbook (AP SCERT / SSC Board)</span>
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {res.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold">{res.subject}</span>
                      {res.chapterName && res.chapterName !== 'All Chapters' && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 dark:text-slate-300">{res.chapterName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Language, Source type & Date */}
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>{res.language}</span>
                      <span>•</span>
                      <span>{res.sourceType === 'file' ? 'Uploaded Document' : 'Verified Web Link'}</span>
                    </span>
                    <span>
                      {new Date(res.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions: Open / Read / Download (Students cannot upload/edit/delete) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenResource(res)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {isVideo ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch Video</span>
                      </>
                    ) : res.sourceType === 'url' && !res.fileUrl.endsWith('.pdf') ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Verified Link</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>{res.type === 'Official Textbook' ? 'Read Textbook' : 'View Resource'}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Integrated PDF Viewer Modal */}
      {pdfPreviewResource && (
        <IntegratedPDFViewerModal
          onClose={() => setPdfPreviewResource(null)}
          paper={{
            id: pdfPreviewResource.resourceId,
            title: pdfPreviewResource.title,
            subject: pdfPreviewResource.subject,
            board: pdfPreviewResource.board || 'AP State Board',
            year: '2026',
            medium: pdfPreviewResource.language,
            fileSize: pdfPreviewResource.fileSize || 'PDF Document',
            pdfUrl: pdfPreviewResource.fileUrl
          }}
        />
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <VideoModalPlayer
          isOpen={true}
          onClose={() => setActiveVideoModal(null)}
          video={activeVideoModal}
        />
      )}
    </div>
  );
};
