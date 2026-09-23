import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Brain, 
  HelpCircle, 
  Send, 
  RotateCcw, 
  Maximize2, 
  Search, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Lightbulb, 
  Printer, 
  ArrowRight, 
  ThumbsUp, 
  Video, 
  FileSpreadsheet, 
  Check, 
  Eye, 
  Languages, 
  Volume2, 
  Sliders,
  Share2,
  Lock,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { Subject, Chapter, LanguageCode } from '../../types';
import { CMSItem, INITIAL_CMS_ITEMS } from '../cms/cmsData';
import { soundFx } from '../../lib/audio';
import { formatYouTubeEmbedUrl, isYouTubeUrl, extractYouTubeId, getYouTubeWatchUrl } from '../../lib/videoUtils';
import { AIVideoLessonModal } from './AIVideoLessonModal';
import { LearningResourcesCenter } from './views/LearningResourcesCenter';
import { useStudentClass } from '../../context/StudentClassContext';
import { auth } from '../../lib/firebase';
import { 
  subscribeToDigitalLibrary, 
  toggleSaveResource, 
  trackResourceDownload,
  FirestoreLibraryResource 
} from '../../services/digitalLibraryService';
import { 
  subscribeStudentAssignmentsForChapter,
  submitStudentHomeworkWithAutoEvaluation,
  subscribeStudentSubmissions,
  RealHomeworkDoc,
  RealHomeworkSubmissionDoc
} from '../../services/realHomeworkService';
import { IntegratedPDFViewerModal, PDFViewerPaperInfo } from '../common/IntegratedPDFViewerModal';
import { StudentSolveHomeworkModal } from './homework/StudentSolveHomeworkModal';

interface ChapterLearningHubProps {
  subject: Subject;
  chapter: Chapter;
  selectedLang: LanguageCode;
  onBack: () => void;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
  customCmsItems?: CMSItem[];
  studentClassGrade?: string;
  studentId?: string;
  studentName?: string;
}

export type HubTab = 
  | 'overview'
  | 'digital_library'
  | 'videos'
  | 'notes'
  | 'slides'
  | 'worksheets'
  | 'assignments'
  | 'practice'
  | 'pyqs'
  | 'flashcards'
  | 'mindmaps'
  | 'formulas'
  | 'definitions'
  | 'key_concepts'
  | 'summary'
  | 'ai_tutor'
  | 'quiz'
  | 'progress_discussion';

export const ChapterLearningHub: React.FC<ChapterLearningHubProps> = ({
  subject,
  chapter,
  selectedLang,
  onBack,
  onAddXp = (_xp: number) => {},
  onAddCoins = (_coins: number) => {},
  customCmsItems = [],
  studentClassGrade,
  studentId,
  studentName
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageMode, setLanguageMode] = useState<'en' | 'te'>(selectedLang === 'te' ? 'te' : 'en');
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>(['notes_sec_1', 'formula_f1']);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Active student context: Never force Class 5 or hardcode Class 10!
  let contextClass: string | null = null;
  try {
    const ctx = useStudentClass();
    contextClass = ctx?.selectedClass || null;
  } catch (e) {
    // context optional
  }
  const activeStudentClass = studentClassGrade || contextClass || 'Class 10';
  const activeStudentId = studentId || auth.currentUser?.uid || 'guest_student';
  const activeStudentName = studentName || auth.currentUser?.displayName || 'Student';

  // --- REAL-TIME FIRESTORE SUBSCRIPTIONS ---
  const [firestoreResources, setFirestoreResources] = useState<FirestoreLibraryResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const [chapterAssignments, setChapterAssignments] = useState<RealHomeworkDoc[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  const [studentSubmissions, setStudentSubmissions] = useState<RealHomeworkSubmissionDoc[]>([]);

  // Subscribe to real published resources for this class, subject, and chapter
  useEffect(() => {
    setIsLoadingResources(true);
    const unsub = subscribeToDigitalLibrary(
      {
        isStudent: true,
        classGrade: activeStudentClass,
        subject: subject.name,
        chapterId: chapter.id,
        chapterName: chapter.title
      },
      (items) => {
        setFirestoreResources(items);
        setIsLoadingResources(false);
      }
    );
    return () => unsub();
  }, [activeStudentClass, subject.name, chapter.id, chapter.title]);

  // Subscribe to real assignments for this class, subject, and chapter
  useEffect(() => {
    setIsLoadingAssignments(true);
    const unsub = subscribeStudentAssignmentsForChapter(
      activeStudentClass,
      subject.name,
      chapter.id,
      chapter.title,
      (items) => {
        setChapterAssignments(items);
        setIsLoadingAssignments(false);
      }
    );
    return () => unsub();
  }, [activeStudentClass, subject.name, chapter.id, chapter.title]);

  // Subscribe to student's own submissions
  useEffect(() => {
    if (!activeStudentId) return;
    const unsub = subscribeStudentSubmissions(activeStudentId, (subs) => {
      setStudentSubmissions(subs);
    });
    return () => unsub();
  }, [activeStudentId]);

  // Real categorized resource slices
  const realVideos = firestoreResources.filter(r => 
    r.type === 'Video Lesson' || 
    r.resourceType === 'Video' || 
    r.resourceType === 'Video Lessons' || 
    r.fileType === 'video' ||
    (r.sourceUrl && (r.sourceUrl.includes('youtube') || r.sourceUrl.includes('youtu.be') || r.sourceUrl.endsWith('.mp4')))
  );

  const realNotes = firestoreResources.filter(r => 
    r.type === 'Chapter Notes' || 
    r.type === 'Formula / Key Facts' || 
    r.type === 'Study Material' ||
    r.fileType === 'pdf'
  );

  const realTextbooks = firestoreResources.filter(r => 
    r.type === 'Official Textbook'
  );

  const realWorksheets = firestoreResources.filter(r => 
    r.type === 'Practice Material' || 
    r.type === 'Previous / Model Papers'
  );

  // Combine default CMS items and custom CMS items
  const allCmsItems = [...INITIAL_CMS_ITEMS, ...customCmsItems];
  const chapterCmsItems = allCmsItems.filter(
    (item) => item.subject === subject.name || item.subject === 'All Subjects' || item.classLevel === activeStudentClass
  );

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const toggleBookmark = (id: string, title: string) => {
    soundFx.playClick();
    if (bookmarkedSections.includes(id)) {
      setBookmarkedSections(bookmarkedSections.filter(b => b !== id));
      showToast(`Removed "${title}" from Bookmarks`);
    } else {
      setBookmarkedSections([...bookmarkedSections, id]);
      showToast(`Bookmarked "${title}"`);
    }
  };

  // --- SECTION 1: VIDEOS STATE ---
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const activeVideo = realVideos.find(v => v.resourceId === activeVideoId) || realVideos[0] || null;

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isAIVideoModalOpen, setIsAIVideoModalOpen] = useState(false);
  const [selectedAIVideoTopic, setSelectedAIVideoTopic] = useState<string>(chapter.title);
  const [selectedAIVideoTopicId, setSelectedAIVideoTopicId] = useState<string>(`topic_${chapter.id || 'ch'}_1`);

  // --- SECTION 2: NOTES STATE & PDF VIEWER ---
  const [notesHighlightText, setNotesHighlightText] = useState('');
  const [notesSearch, setNotesSearch] = useState('');
  const [activePdfResource, setActivePdfResource] = useState<PDFViewerPaperInfo | null>(null);

  // --- SECTION 5: ASSIGNMENT SOLVER STATE ---
  const [activeSolvingAssignment, setActiveSolvingAssignment] = useState<RealHomeworkDoc | null>(null);
  const [assignmentAnswers, setAssignmentAnswers] = useState<Record<string, string>>({});
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{ score: number; maxScore: number; hasSubjectivePending: boolean } | null>(null);

  // --- SECTION 3: SLIDES STATE ---
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const totalSlides = 12;

  // --- SECTION 4: WORKSHEETS STATE ---
  const [isSubmitWorksheetModalOpen, setIsSubmitWorksheetModalOpen] = useState(false);
  const [uploadedWorksheetFile, setUploadedWorksheetFile] = useState<string | null>(null);

  // --- SECTION 5: ASSIGNMENTS STATE ---
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');

  // --- SECTION 6: PRACTICE QUESTIONS STATE ---
  const [practiceFilter, setPracticeFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [shownHints, setShownHints] = useState<Record<string, boolean>>({});

  // --- SECTION 7: PYQs STATE ---
  const [pyqFilterYear, setPyqFilterYear] = useState<string>('All');
  const [pyqAIModal, setPyqAIModal] = useState<{ question: string; explanation: string } | null>(null);

  // --- SECTION 8: FLASHCARDS STATE ---
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardMastered, setFlashcardMastered] = useState<Record<number, boolean>>({});

  // --- SECTION 9: MIND MAP STATE ---
  const [mindmapZoom, setMindmapZoom] = useState(100);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    node1: true,
    node2: true
  });

  // --- SECTION 14: AI TUTOR STATE ---
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      sender: 'ai',
      text: `Namaste! I am your Socratic AI Tutor pre-loaded with **${chapter.title}** (${subject.name}, Class 10).\n\nAsk me any doubt in Telugu or English! I can explain with real-life examples, give step-by-step hints, generate practice quizzes, or translate concepts.`,
      timestamp: 'Just now'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- SECTION 15: QUIZ STATE ---
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- SECTION 17: DISCUSSION STATE ---
  const [discussionPosts, setDiscussionPosts] = useState([
    {
      id: 'p1',
      studentName: 'Sravani K. (Medak ZPHS)',
      time: '2 hours ago',
      question: 'Why does light bend towards the normal when passing from air into glass?',
      upvotes: 8,
      teacherResponse: 'Great question Sravani! Light travels slower in denser media like glass. To minimize travel time, the light wave changes direction towards the normal line.',
      isTeacherVerified: true
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Handle AI Chat Submit
  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    soundFx.playClick();
    const userMsg = { sender: 'user', text: aiInput, timestamp: 'Now' };
    setAiChatHistory(prev => [...prev, userMsg]);
    const promptText = aiInput;
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Chapter: ${chapter.chapterNumber} - ${chapter.title}. Subject: ${subject.name}. User query: ${promptText}`,
          language: languageMode,
          grade: 'Class 10',
          subject: subject.name
        })
      });
      const data = await res.json();
      setAiChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.text || 'I am ready to help you master this chapter! Let us break it down into simple steps.',
          timestamp: 'Now'
        }
      ]);
    } catch (err) {
      setAiChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `In **${chapter.title}**, the key concept is understanding the fundamental rules and formulas. What specific step can I clarify for you?`,
          timestamp: 'Now'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const navItems: { id: HubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'digital_library', label: 'Digital Library', icon: <BookOpen className="w-4 h-4 text-emerald-400" />, badge: firestoreResources.length > 0 ? `${firestoreResources.length} Res` : 'Official' },
    { id: 'videos', label: 'Tutorial Videos', icon: <Video className="w-4 h-4" />, badge: realVideos.length > 0 ? `${realVideos.length} Videos` : undefined },
    { id: 'notes', label: 'Lesson Notes', icon: <FileText className="w-4 h-4" />, badge: realNotes.length > 0 ? `${realNotes.length} Notes` : 'PDF' },
    { id: 'slides', label: 'Slides', icon: <Layers className="w-4 h-4" /> },
    { id: 'worksheets', label: 'Worksheets', icon: <FileSpreadsheet className="w-4 h-4" />, badge: realWorksheets.length > 0 ? `${realWorksheets.length}` : undefined },
    { id: 'assignments', label: 'Assignments', icon: <Upload className="w-4 h-4" />, badge: chapterAssignments.length > 0 ? `${chapterAssignments.length} Live` : undefined },
    { id: 'practice', label: 'Practice Questions', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'pyqs', label: 'Previous Board PYQs', icon: <Award className="w-4 h-4" />, badge: '10 Yrs' },
    { id: 'flashcards', label: 'Flashcards', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'mindmaps', label: 'Mind Maps', icon: <Brain className="w-4 h-4" /> },
    { id: 'formulas', label: 'Formula Sheet', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'definitions', label: 'Definitions', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'key_concepts', label: 'Key Concepts', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'summary', label: 'Chapter Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai_tutor', label: 'Chapter AI Tutor', icon: <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />, badge: 'Live' },
    { id: 'quiz', label: 'Chapter Quiz', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'progress_discussion', label: 'Progress & Doubts', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Dummy practice questions
  const practiceQuestionsList = [
    {
      id: 'pq_1',
      difficulty: 'Easy',
      question: 'Define refractive index of a medium and write its formula.',
      concept: 'Refraction Fundamentals',
      hint: 'Refractive index is the ratio of speed of light in vacuum (c) to speed of light in the medium (v).',
      solution: 'Refractive index (n) = Speed of light in vacuum (c) / Speed of light in medium (v). It is a dimensionless quantity.'
    },
    {
      id: 'pq_2',
      difficulty: 'Medium',
      question: 'A ray of light enters from air into glass plate having refractive index 1.50. What is the speed of light in glass?',
      concept: 'Snell\'s Law Application',
      hint: 'Speed of light in vacuum c = 3 × 10⁸ m/s. Use v = c / n.',
      solution: 'v = (3 × 10⁸ m/s) / 1.50 = 2.0 × 10⁸ m/s.'
    },
    {
      id: 'pq_3',
      difficulty: 'Hard',
      question: 'Derive Snell\'s Law using Fermat\'s Principle of Least Time for curved convex lenses.',
      concept: 'Advanced Optics Derivation',
      hint: 'Consider a path where time derivative dt/dx = 0 at stationary point.',
      solution: 'n1 sin(i) = n2 sin(r). Detailed diagram shows incident ray bending towards normal.'
    }
  ];

  // Flashcards List
  const flashcardsList = [
    { id: 1, front: 'What is Snell\'s Law?', back: 'sin(i) / sin(r) = n2 / n1 = Constant for a given pair of media.' },
    { id: 2, front: 'What is Total Internal Reflection?', back: 'When light travels from denser to rarer medium at angle greater than critical angle, it reflects 100% back.' },
    { id: 3, front: 'Lens Formula for Class 10 Board Exam', back: '1/f = 1/v - 1/u (where f = focal length, v = image distance, u = object distance).' },
    { id: 4, front: 'Power of a Lens (P)', back: 'P = 1 / f (in meters). Unit is Dioptre (D).' }
  ];

  // Sample Quiz
  const quizQuestions = [
    {
      id: 1,
      q: 'Which of the following optical phenomena causes mirages in hot summer deserts of Telangana?',
      options: ['Diffraction', 'Total Internal Reflection', 'Interference', 'Polarization'],
      correct: 1,
      exp: 'Mirages occur due to total internal reflection in layers of air heated near the hot road surface.'
    },
    {
      id: 2,
      q: 'The SI unit of power of a lens is:',
      options: ['Watt', 'Joule', 'Dioptre (D)', 'Meter'],
      correct: 2,
      exp: 'Dioptre (D) is the SI unit equal to 1 meter⁻¹.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 animate-fade-in">
      {/* Toast Alert */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white border-b border-indigo-800/40 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Chapter List</span>
            </button>

            <div className="h-6 w-px bg-white/20 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  {activeStudentClass} State Board
                </span>
                <span className="text-xs text-indigo-200 font-semibold">
                  {subject.name}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-yellow-300 font-bold">
                  Chapter {chapter.chapterNumber}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                <span>{chapter.title}</span>
                {chapter.nativeTitle && (
                  <span className="text-xs sm:text-sm font-normal text-indigo-300 font-serif">
                    ({chapter.nativeTitle})
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => {
                soundFx.playClick();
                setLanguageMode(languageMode === 'en' ? 'te' : 'en');
                showToast(`Language switched to ${languageMode === 'en' ? 'Telugu (తెలుగు)' : 'English'}`);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{languageMode === 'en' ? 'English Mode' : 'తెలుగు మోడ్'}</span>
            </button>

            {/* Overall Chapter Progress Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{chapter.completed ? '100% Completed' : '65% Complete'}</span>
            </div>
          </div>
        </div>

        {/* 17 Section Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1 border-t border-white/10 pt-1 pb-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300/40'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                    isActive ? 'bg-white text-blue-900' : 'bg-blue-500/30 text-blue-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ================= SECTION: DIGITAL LIBRARY ================= */}
        {activeTab === 'digital_library' && (
          <div className="space-y-6 animate-fade-in">
            <LearningResourcesCenter
              studentClassGrade={activeStudentClass}
              studentId={activeStudentId}
              initialSubject={subject.name}
              initialChapter={chapter.title}
              initialCategory="ALL"
            />
          </div>
        )}

        {/* ================= SECTION: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Summary Banner */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Difficulty: Medium
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Est. Time: {chapter.estimatedMinutes} Mins
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {firestoreResources.length} Resources Published
                  </span>
                  {chapterAssignments.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-blue-500" />
                      {chapterAssignments.length} Assignments Active
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Chapter Overview & SCERT Board Objectives
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  This chapter covers the fundamental principles of light refraction, lens optics, and mirror equations essential for Class 10 State Board Examinations. Mastering these concepts provides 8-12 marks in the final board paper.
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Learning Objectives</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Understand refractive index & Fermat principle</span>
                    </li>
                    <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Apply Snell\'s Law in numerical problems</span>
                    </li>
                    <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Draw ray diagrams for convex and concave lenses</span>
                    </li>
                    <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Solve board exam previous year essay questions</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Details Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classroom Metadata</h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Master Teacher:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Mr. Ramesh Sharma (Senior Physics Master)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Prerequisites:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Class 9 Reflection of Light & Trigonometry basics</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Content Update:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">July 2026 (SCERT Blueprint Aligned)</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('ai_tutor')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Launch Chapter AI Tutor</span>
                </button>
              </div>
            </div>

            {/* Quick Section Jump Hub Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('videos')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">4 HD Tutorial Videos</h4>
                <p className="text-[10px] text-slate-400">Experiments & concept videos</p>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">SCERT Lesson Notes</h4>
                <p className="text-[10px] text-slate-400">PDFs, Markdown, and highlights</p>
              </button>

              <button
                onClick={() => setActiveTab('pyqs')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">10-Year Board PYQs</h4>
                <p className="text-[10px] text-slate-400">Questions with AI model answers</p>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">Chapter Board Test</h4>
                <p className="text-[10px] text-slate-400">Instant score & +100 XP</p>
              </button>
            </div>
          </div>
        )}

        {/* ================= SECTION 1: TUTORIAL VIDEOS ================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fade-in">
            {/* AI Video Lesson Generator Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 border-2 border-blue-500/40 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                  <Sparkles className="w-7 h-7 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/40">
                      Vidya AI Studio
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      Chalkboard Engine & Smart Narration
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    AI-Generated Video Lesson: {chapter.title}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                    Generate an animated chalkboard lesson with step-by-step concepts, synchronized teacher voiceover, and real-time checkpoint quizzes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAIVideoTopic(chapter.title);
                    setSelectedAIVideoTopicId(`chap_${chapter.id}`);
                    setIsAIVideoModalOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl hover:shadow-blue-500/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Generate & Watch AI Video Lesson</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Tutorial Videos & Virtual Physics Experiments
                </h3>
                <p className="text-xs text-slate-500">
                  Real video lessons uploaded by teachers for {activeStudentClass} • {subject.name} • Chapter {chapter.chapterNumber}.
                </p>
              </div>
              {realVideos.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {realVideos.length} Video{realVideos.length > 1 ? 's' : ''} Available
                </span>
              )}
            </div>

            {isLoadingResources ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading published videos from Firestore...</p>
              </div>
            ) : realVideos.length > 0 && activeVideo ? (
              <div className="space-y-6">
                {/* Main Active Video Player */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2 p-4 bg-black flex flex-col justify-center">
                    <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center group">
                      {isPlayingVideo ? (
                        activeVideo.sourceUrl && (isYouTubeUrl(activeVideo.sourceUrl) || extractYouTubeId(activeVideo.sourceUrl).length > 0) ? (
                          <iframe
                            src={`${formatYouTubeEmbedUrl(activeVideo.sourceUrl)}${formatYouTubeEmbedUrl(activeVideo.sourceUrl).includes('?') ? '&' : '?'}autoplay=1&rel=0&enablejsapi=1`}
                            title={activeVideo.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />
                        ) : (activeVideo.fileUrl || activeVideo.sourceUrl) ? (
                          <video
                            controls
                            autoPlay
                            src={activeVideo.fileUrl || activeVideo.sourceUrl || undefined}
                            className="w-full h-full object-contain"
                          />
                        ) : null
                      ) : (
                        <>
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
                            <Video className="w-16 h-16 opacity-40 mb-2 text-blue-400" />
                            <p className="text-sm font-bold text-white line-clamp-2">{activeVideo.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{activeVideo.attribution || 'Teacher Uploaded Video'}</p>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setIsPlayingVideo(true);
                              }}
                              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl transition transform group-hover:scale-110 cursor-pointer"
                            >
                              <Play className="w-8 h-8 fill-white ml-1" />
                            </button>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl">
                            <span className="font-bold flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-blue-400" /> {activeVideo.language || 'English'} Medium
                            </span>
                            <div className="flex items-center gap-2">
                              {activeVideo.sourceUrl && (
                                <a
                                  href={activeVideo.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold px-2 py-1 rounded bg-white/20 hover:bg-white/30 cursor-pointer flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> External Link
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Video Info Panel */}
                  <div className="p-6 flex flex-col justify-between space-y-4 text-white">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {activeVideo.attribution || 'Teacher Uploaded'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {activeVideo.class ? `Class ${activeVideo.class}` : activeStudentClass}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-2 leading-snug">
                        {activeVideo.title}
                      </h3>
                      {activeVideo.description && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                          {activeVideo.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Class & Subject:</span>
                        <span className="font-bold text-slate-200">
                          {activeVideo.subject} • Chapter {chapter.chapterNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setVideoCompleted(!videoCompleted);
                          showToast(videoCompleted ? "Marked video as incomplete" : "Marked video as completed (+15 XP)");
                          if (!videoCompleted) onAddXp(15);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                          videoCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{videoCompleted ? 'Completed' : 'Mark as Completed (+15 XP)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Videos Playlist if multiple videos exist */}
                {realVideos.length > 1 && (
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      More Video Lessons for this Chapter ({realVideos.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {realVideos.map((vid) => (
                        <button
                          key={vid.resourceId}
                          onClick={() => {
                            soundFx.playClick();
                            setActiveVideoId(vid.resourceId);
                            setIsPlayingVideo(false);
                          }}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                            vid.resourceId === activeVideo.resourceId
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {vid.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">
                              {vid.attribution || 'Teacher Lesson'} • {vid.language || 'English'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 mx-auto flex items-center justify-center">
                  <Video className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No Video Lessons Uploaded Yet for {activeStudentClass} • {subject.name}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When your teacher uploads a video lesson for {chapter.title} in the Teacher Portal, it will appear here in real-time.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedAIVideoTopic(chapter.title);
                      setSelectedAIVideoTopicId(`chap_${chapter.id}`);
                      setIsAIVideoModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate AI Video Lesson</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('digital_library')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold"
                  >
                    Browse Digital Library
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: LESSON NOTES ================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Official Lesson Notes & Study Materials
                </h3>
                <p className="text-xs text-slate-500">
                  Read, search, bookmark, and download official notes published by teachers for {activeStudentClass} • Chapter {chapter.chapterNumber}.
                </p>
              </div>

              {realNotes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {realNotes.length} Document{realNotes.length > 1 ? 's' : ''} Published
                  </span>
                </div>
              )}
            </div>

            {isLoadingResources ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading published notes from Firestore...</p>
              </div>
            ) : realNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {realNotes.map((note) => {
                  const isBookmarked = bookmarkedSections.includes(note.resourceId);
                  return (
                    <div
                      key={note.resourceId}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {note.type}
                          </span>
                          <button
                            onClick={() => {
                              toggleBookmark(note.resourceId, note.title);
                              toggleSaveResource(activeStudentId, note);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
                          </button>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {note.title}
                        </h4>

                        {note.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {note.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>By: <strong className="text-slate-700 dark:text-slate-300">{note.attribution || 'Teacher'}</strong></span>
                          <span>•</span>
                          <span>{note.language || 'English'} Medium</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            trackResourceDownload(note.resourceId);
                            setActivePdfResource({
                              id: note.resourceId,
                              title: note.title,
                              subject: note.subject,
                              board: note.board || 'AP State Board',
                              year: '2026',
                              medium: note.language || 'English',
                              pdfUrl: note.fileUrl || note.sourceUrl || ''
                            });
                          }}
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Read / View PDF</span>
                        </button>

                        {(note.fileUrl || note.sourceUrl) && (
                          <a
                            href={note.fileUrl || note.sourceUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => trackResourceDownload(note.resourceId)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No Notes Uploaded Yet for {activeStudentClass} • {subject.name}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When your teacher uploads notes or study guides in Teacher Portal → Digital Library, they will be listed here in real-time.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setActiveTab('digital_library')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Digital Library to Browse Textbooks</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 3: PRESENTATION SLIDES ================= */}
        {activeTab === 'slides' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Teacher Presentation Slides (PowerPoint & PDF)
                </h3>
                <p className="text-xs text-slate-500">Interactive slide deck used during school smart classroom lectures.</p>
              </div>
            </div>

            {/* Slide Player Box */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between p-8 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  <span>SCERT Class 10 Physics Deck</span>
                  <span>Slide {currentSlideIndex} of {totalSlides}</span>
                </div>

                <div className="my-auto space-y-3">
                  <h2 className="text-2xl font-black text-white">
                    {currentSlideIndex === 1 && 'Slide 1: Fermat\'s Principle of Least Time'}
                    {currentSlideIndex === 2 && 'Slide 2: Snell\'s Law & Refractive Indices'}
                    {currentSlideIndex >= 3 && `Slide ${currentSlideIndex}: Ray Diagram Rules for Convex Lens`}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-xl">
                    Light takes the path of minimum time between two points. This principle explains the bending of light rays across media boundaries.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    disabled={currentSlideIndex <= 1}
                    onClick={() => setCurrentSlideIndex(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast("Downloading PowerPoint Presentation Deck (.pptx)...")}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Download Slides (.pptx)
                    </button>
                  </div>

                  <button
                    disabled={currentSlideIndex >= totalSlides}
                    onClick={() => setCurrentSlideIndex(prev => Math.min(totalSlides, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 4: WORKSHEETS ================= */}
        {activeTab === 'worksheets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Worksheets & Solve-and-Upload Assignments
                </h3>
                <p className="text-xs text-slate-500">Download worksheets, solve on paper, and upload your work for teacher grading.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Worksheet #1: Refraction Ray Diagram Practice
                    </h4>
                    <p className="text-xs text-slate-400">PDF • 1.2 MB • 5 Practice Diagrams</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => showToast("Worksheet PDF Downloaded!")}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button
                    onClick={() => setIsSubmitWorksheetModalOpen(true)}
                    className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Upload className="w-4 h-4" /> Submit Solved Sheet
                  </button>
                </div>
              </div>
            </div>

            {/* Modal for Worksheet Upload */}
            {isSubmitWorksheetModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Completed Worksheet</h3>
                    <button onClick={() => setIsSubmitWorksheetModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">Take a clear photo or scan of your solved worksheet page and attach it below.</p>

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-800/50">
                    <Upload className="w-8 h-8 text-teal-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Drag & Drop photo here, or click to browse</p>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG, PDF up to 10MB</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSubmitWorksheetModalOpen(false);
                      showToast("Worksheet submitted successfully to Mr. Ramesh Sharma! (+20 XP)");
                      onAddXp(20);
                    }}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow cursor-pointer"
                  >
                    Confirm & Upload Submission
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 5: ASSIGNMENTS ================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Class Homework & Chapter Assignments
                </h3>
                <p className="text-xs text-slate-500">
                  Real assignments published by your teachers for {activeStudentClass} • {subject.name} • Chapter {chapter.chapterNumber}.
                </p>
              </div>

              {chapterAssignments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {chapterAssignments.length} Assignment{chapterAssignments.length > 1 ? 's' : ''} Published
                  </span>
                </div>
              )}
            </div>

            {isLoadingAssignments ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading published assignments from Firestore...</p>
              </div>
            ) : chapterAssignments.length > 0 ? (
              <div className="space-y-4">
                {chapterAssignments.map((assign) => {
                  const sub = studentSubmissions.find(s => s.homeworkId === assign.id);
                  const isSubmitted = !!sub;
                  const isGraded = sub && (sub.status === 'Reviewed' || (sub.score !== undefined && sub.score !== null && sub.score > 0));

                  return (
                    <div
                      key={assign.id}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            {assign.dueDate ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due: {assign.dueDate}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Open Submission
                              </span>
                            )}

                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              {assign.questions?.length || 0} Question{assign.questions?.length === 1 ? '' : 's'}
                            </span>

                            {isGraded ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Graded: {sub.score} / {sub.maxScore || assign.totalMarks} Marks
                              </span>
                            ) : isSubmitted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Submitted • Under Review
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Not Submitted Yet
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                            {assign.title}
                          </h4>

                          {assign.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {assign.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-400">Total Marks</span>
                          <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {assign.totalMarks || 20} Marks
                          </p>
                        </div>
                      </div>

                      {assign.instructions && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">Teacher Instructions:</p>
                          <p>{assign.instructions}</p>
                        </div>
                      )}

                      {/* Submission / Action Box */}
                      {isSubmitted ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold flex items-center gap-1.5 text-sm">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              <span>Your Submission is Recorded in Firestore</span>
                            </div>
                            {sub.submittedAt && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                                Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {sub.teacherFeedback ? (
                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-200">
                              <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">Teacher Feedback:</span>
                              {sub.teacherFeedback}
                            </div>
                          ) : (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                              Your teacher will review any subjective answers and provide feedback shortly.
                            </p>
                          )}

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setActiveSolvingAssignment(assign);
                            }}
                            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Answers & Results</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <p className="text-xs text-slate-500">
                            Complete all questions to earn XP and receive teacher feedback.
                          </p>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setActiveSolvingAssignment(assign);
                            }}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-2 transition transform hover:scale-[1.02]"
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span>Solve & Submit Assignment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 mx-auto flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No Active Assignments for {activeStudentClass} • {subject.name}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When your teacher creates homework for {chapter.title} in the Teacher Portal, it will appear here instantly for you to solve and submit.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Award className="w-4 h-4" />
                    <span>Practice Chapter Questions Instead</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 6: PRACTICE QUESTIONS ================= */}
        {activeTab === 'practice' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Topic-wise & Difficulty-wise Practice Bank
                </h3>
                <p className="text-xs text-slate-500">Practice questions with instant step-by-step hints and detailed solutions.</p>
              </div>

              {/* Difficulty Filters */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setPracticeFilter(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      practiceFilter === diff ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300' : 'text-slate-500'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {practiceQuestionsList
                .filter(pq => practiceFilter === 'All' || pq.difficulty === practiceFilter)
                .map((pq, idx) => (
                  <div key={pq.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Q{idx + 1}. {pq.concept}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pq.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : pq.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pq.difficulty}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {pq.question}
                    </h4>

                    {/* Hint Button */}
                    {shownHints[pq.id] && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Hint:</strong> {pq.hint}</span>
                      </div>
                    )}

                    {/* Solution Button */}
                    {revealedSolutions[pq.id] && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                        <span className="font-bold block">Detailed Board Exam Solution:</span>
                        <p>{pq.solution}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setShownHints({ ...shownHints, [pq.id]: !shownHints[pq.id] })}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>{shownHints[pq.id] ? 'Hide Hint' : 'Show Hint'}</span>
                      </button>
                      <button
                        onClick={() => setRevealedSolutions({ ...revealedSolutions, [pq.id]: !revealedSolutions[pq.id] })}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{revealedSolutions[pq.id] ? 'Hide Solution' : 'Reveal Solution'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 7: PREVIOUS YEAR QUESTIONS (PYQ) ================= */}
        {activeTab === 'pyqs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  10-Year AP SSC Board Exam Question Papers
                </h3>
                <p className="text-xs text-slate-500">Real Class 10 Board exam questions organized by marks, frequency, and model answers.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { year: '2025 Board Exam', marks: '4 Marks Essay Question', q: 'State Snell\'s Law. Derive the expression for refractive index of a glass prism with a neat ray diagram.', freq: 'Asked in 2025, 2023, 2021 Exams' },
                { year: '2024 Board Exam', marks: '2 Marks Short Question', q: 'Define power of a convex lens and state its SI unit.', freq: 'Asked in 2024, 2022 Exams' }
              ].map((pyq, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                      {pyq.year} • {pyq.marks}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {pyq.freq}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {pyq.q}
                  </h4>

                  <button
                    onClick={() => setPyqAIModal({ question: pyq.q, explanation: 'Detailed AI Board Exam Explanation: Draw prism diagram with angle A and deviation D. Apply sin((A+D)/2) / sin(A/2) formula for full 4 marks.' })}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Explain Model Answer with AI</span>
                  </button>
                </div>
              ))}
            </div>

            {/* AI PYQ Modal */}
            {pyqAIModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-sm text-blue-600 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> AI Board Answer Guide
                    </h3>
                    <button onClick={() => setPyqAIModal(null)} className="p-1 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{pyqAIModal.question}</p>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif border">
                    {pyqAIModal.explanation}
                  </div>

                  <button
                    onClick={() => setPyqAIModal(null)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Got It!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 8: FLASHCARDS ================= */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto text-center">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Interactive Revision Flashcards
              </h3>
              <p className="text-xs text-slate-500">Click card to flip and test memory recall before exams.</p>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-64 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 flex flex-col justify-between shadow-2xl cursor-pointer transform transition duration-500 hover:scale-[1.02] relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                <span>Card {currentFlashcardIndex + 1} of {flashcardsList.length}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  {isFlipped ? 'Answer Side' : 'Question Side (Click to Flip)'}
                </span>
              </div>

              <div className="my-auto font-black text-xl leading-snug">
                {isFlipped ? flashcardsList[currentFlashcardIndex].back : flashcardsList[currentFlashcardIndex].front}
              </div>

              <div className="text-[10px] text-indigo-200 font-semibold">
                Tap card to reveal {isFlipped ? 'question' : 'answer'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                disabled={currentFlashcardIndex <= 0}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  setFlashcardMastered({ ...flashcardMastered, [currentFlashcardIndex]: true });
                  showToast("Marked card as mastered! (+10 XP)");
                  onAddXp(10);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Mastered Card
              </button>

              <button
                disabled={currentFlashcardIndex >= flashcardsList.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentFlashcardIndex(prev => Math.min(flashcardsList.length - 1, prev + 1));
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* ================= SECTION 9: MIND MAPS ================= */}
        {activeTab === 'mindmaps' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Interactive Concept Mind Map
                </h3>
                <p className="text-xs text-slate-500">Visual concept map connecting light laws, lens types, and board formulas.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMindmapZoom(prev => Math.min(150, prev + 10))}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Zoom +
                </button>
                <button
                  onClick={() => setMindmapZoom(prev => Math.max(70, prev - 10))}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Zoom -
                </button>
              </div>
            </div>

            {/* Mind Map Tree Box */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-inner overflow-x-auto min-h-[350px] flex items-center justify-center">
              <div style={{ transform: `scale(${mindmapZoom / 100})` }} className="transition-transform space-y-6 text-center">
                <div className="inline-block p-4 rounded-2xl bg-blue-600 text-white font-extrabold text-base shadow-lg ring-4 ring-blue-400/30">
                  {chapter.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-blue-400">1. Refraction Laws</h5>
                    <p className="text-[11px] text-slate-300">Snell\'s Law • Fermat Principle • Bending towards normal</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-purple-400">2. Lenses & Optics</h5>
                    <p className="text-[11px] text-slate-300">Convex vs Concave • Focal length • Real & Virtual images</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs text-emerald-400">3. Board Formulas</h5>
                    <p className="text-[11px] text-slate-300">1/f = 1/v - 1/u • Power P = 1/f • Magnification m = v/u</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 10: FORMULA SHEET ================= */}
        {activeTab === 'formulas' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Board Exam Formula Cheat-Sheet
                </h3>
                <p className="text-xs text-slate-500">High-yield mathematical and physical formulas for quick revision.</p>
              </div>

              <button
                onClick={() => showToast("Formula Sheet PDF downloaded!")}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Download Sheet
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chapter.keyFormulas.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Formula #{idx + 1}</span>
                  <div className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100 bg-white/80 dark:bg-amber-900/40 p-3 rounded-xl border border-amber-300/50">
                    {f}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 11: DEFINITIONS ================= */}
        {activeTab === 'definitions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { term: 'Refractive Index (నైరూప్య వక్రీభవన గుణకం)', def: 'The measure of how much light slows down and bends when entering a medium relative to vacuum.' },
                { term: 'Critical Angle (సందサプライ కోణం)', def: 'The angle of incidence in denser medium for which the angle of refraction in rarer medium becomes 90 degrees.' }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">{item.term}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.def}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 12: KEY CONCEPTS ================= */}
        {activeTab === 'key_concepts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-bold text-purple-600">Concept 1</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Real-world Example: Solar Water Heating in Telangana</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Convex mirrors and Fresnel lenses concentrate sunlight onto water pipes, converting radiant optical energy into thermal energy efficiently.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 13: SUMMARY ================= */}
        {activeTab === 'summary' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">1-Page Chapter Quick Revision Summary</h3>
            <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <li>Light travels slower in denser media like glass and water.</li>
              <li>Snell\'s Law: n1 sin(i) = n2 sin(r).</li>
              <li>Lens power P = 1 / f in meters (measured in Dioptres).</li>
            </ul>
          </div>
        )}

        {/* ================= SECTION 14: CONTEXT-AWARE AI TUTOR ================= */}
        {activeTab === 'ai_tutor' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 fill-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Socratic Chapter AI Tutor</h3>
                    <p className="text-[10px] text-slate-400">Context: Class 10 {subject.name} • Chapter {chapter.chapterNumber}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Pre-Loaded Chapter Memory
                </span>
              </div>

              {/* Chat Output Container */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto p-2 pr-1">
                {aiChatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none font-serif'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl text-xs text-yellow-300 animate-pulse flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" /> Vidya AI Tutor is analyzing chapter concept...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="Ask any doubt about this chapter in Telugu or English..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAiSend}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 15: CHAPTER QUIZ ================= */}
        {activeTab === 'quiz' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Chapter Mastery Board Exam Quiz</h3>
                <p className="text-xs text-slate-500">Test your understanding to earn +100 XP and +25 Vidya Coins.</p>
              </div>
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Q{idx + 1}. {q.q}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                        className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
                          quizAnswers[q.id] === optIdx
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setQuizSubmitted(true);
                  showToast("Quiz submitted! You scored 100%! (+100 XP, +25 Coins)");
                  onAddXp(100);
                  onAddCoins(25);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow cursor-pointer"
              >
                Submit Chapter Test
              </button>
            </div>
          </div>
        )}

        {/* ================= SECTION 17: PROGRESS & DISCUSSION ================= */}
        {activeTab === 'progress_discussion' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Academic Doubt Forum & Discussion</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Post a question to teacher and school peers..."
                  className="flex-1 p-3 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                />
                <button
                  onClick={() => {
                    if (!newQuestionText.trim()) return;
                    setDiscussionPosts([
                      {
                        id: 'p_' + Date.now(),
                        studentName: 'Ananya S. (Your Post)',
                        time: 'Just now',
                        question: newQuestionText,
                        upvotes: 0,
                        teacherResponse: 'Mr. Ramesh Sharma is reviewing your question.',
                        isTeacherVerified: false
                      },
                      ...discussionPosts
                    ]);
                    setNewQuestionText('');
                    showToast("Question posted to Chapter Discussion!");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Post Question
                </button>
              </div>

              <div className="space-y-3 pt-4">
                {discussionPosts.map(post => (
                  <div key={post.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{post.studentName}</span>
                      <span className="text-slate-400 text-[10px]">{post.time}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{post.question}</p>
                    {post.teacherResponse && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200 text-[11px]">
                        <strong>Teacher Reply:</strong> {post.teacherResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Vidya AI Video Lesson Generator & Player Modal */}
      <AIVideoLessonModal
        isOpen={isAIVideoModalOpen}
        onClose={() => setIsAIVideoModalOpen(false)}
        grade={activeStudentClass}
        subject={subject.name}
        subjectId={subject.id}
        chapter={chapter.title}
        chapterId={chapter.id}
        topic={selectedAIVideoTopic}
        topicId={selectedAIVideoTopicId}
      />

      {/* Student Interactive Homework Solver Modal */}
      {activeSolvingAssignment && (
        <StudentSolveHomeworkModal
          isOpen={!!activeSolvingAssignment}
          onClose={() => setActiveSolvingAssignment(null)}
          homework={activeSolvingAssignment}
          studentId={activeStudentId}
          studentName={activeStudentName}
          studentEmail={auth.currentUser?.email || undefined}
          studentClass={activeStudentClass}
          existingSubmission={studentSubmissions.find(s => s.homeworkId === activeSolvingAssignment.id) || null}
          onSubmitted={(res) => {
            showToast(`Assignment submitted! Score: ${res.score}/${res.maxScore} (+${res.score * 5 + 20} XP)`);
            onAddXp(res.score * 5 + 20);
            onAddCoins(10);
          }}
        />
      )}

      {/* Integrated PDF Viewer Modal */}
      {activePdfResource && (
        <IntegratedPDFViewerModal
          paper={activePdfResource}
          onClose={() => setActivePdfResource(null)}
        />
      )}
    </div>
  );
};
