import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  Download, 
  Layers, 
  Sparkles, 
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey } from '../../../data/officialSyllabusData';
import { 
  FirestoreLesson, 
  subscribeToChapterLessons 
} from '../../../services/classSyllabusService';
import { 
  setLessonCompletionInFirestore, 
  LessonProgressDoc 
} from '../../../services/studentProgressService';

interface Class5SubjectExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  subjectId: string;
  subjectName: string;
  nativeName?: string;
  studentClassGrade?: string;
  initialChapterId?: string;
  lessonProgressMap: Record<string, LessonProgressDoc>;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
}

export const Class5SubjectExplorerModal: React.FC<Class5SubjectExplorerModalProps> = ({
  isOpen,
  onClose,
  userId,
  subjectId,
  subjectName,
  nativeName,
  studentClassGrade = 'Class 5',
  initialChapterId,
  lessonProgressMap,
  onAddXp,
  onAddCoins
}) => {
  const activeGrade = normalizeGradeKey(studentClassGrade);

  // 1. Get official subject and its chapters for active grade
  const classSubject = useMemo(() => {
    const subs = OFFICIAL_SYLLABUS_BY_CLASS[activeGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'] || [];
    return subs.find(s => s.id === subjectId || s.name.toLowerCase() === subjectName.toLowerCase()) || subs[0];
  }, [subjectId, subjectName, activeGrade]);

  const chapters = useMemo(() => {
    return classSubject?.chapters || [];
  }, [classSubject]);

  // Selected Chapter State (null = chapters list view)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId || null);

  // Selected Lesson State (null = lessons list view for selected chapter)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Firestore lessons state for the selected chapter
  const [chapterLessons, setChapterLessons] = useState<FirestoreLesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync initialChapterId when prop changes
  useEffect(() => {
    if (initialChapterId) {
      setSelectedChapterId(initialChapterId);
    }
  }, [initialChapterId]);

  // Find active chapter object
  const activeChapter = useMemo(() => {
    if (!selectedChapterId) return null;
    return chapters.find(c => c.id === selectedChapterId) || null;
  }, [chapters, selectedChapterId]);

  // Subscribe to real-time lessons from Firestore whenever active chapter changes
  useEffect(() => {
    if (!selectedChapterId || !isOpen) {
      setChapterLessons([]);
      setSelectedLessonId(null);
      return;
    }

    setIsLoadingLessons(true);
    setFetchError(null);

    const unsub = subscribeToChapterLessons(
      activeGrade,
      subjectId || classSubject?.id || 'c5_math',
      selectedChapterId,
      (lessons) => {
        setIsLoadingLessons(false);
        if (lessons && lessons.length > 0) {
          setChapterLessons(lessons);
          // If no lesson selected yet, keep it unselected so student sees the chapter's lesson list
        } else {
          // Fallback to official syllabus topics as lessons structure if Firestore is empty
          if (activeChapter && activeChapter.lessons) {
            const fallbackLessons: FirestoreLesson[] = activeChapter.lessons.map((t, idx) => ({
              lessonId: t.id,
              title: t.title,
              description: t.summary || `${activeGrade} ${subjectName} lesson on ${t.title}.`,
              class: activeGrade,
              subjectId: subjectId || classSubject?.id || 'c5_math',
              chapterId: selectedChapterId,
              topicId: t.id,
              content: t.summary 
                ? `${t.summary}\n\nKey Concepts & Exercises:\n• Understanding ${t.title} with SCERT examples.\n• Step-by-step solutions for ${activeGrade} students.\n• Practice questions to strengthen conceptual foundation.`
                : `${activeGrade} educational content for ${t.title}.`,
              videoUrl: t.videoUrl || '',
              pdfUrl: '',
              duration: '15 mins',
              order: idx + 1,
              published: true
            }));
            setChapterLessons(fallbackLessons);
          } else {
            setChapterLessons([]);
          }
        }
      },
      (err) => {
        console.warn('Firestore lessons listener notice:', err);
        setIsLoadingLessons(false);
        if (activeChapter && activeChapter.lessons) {
          const fallbackLessons: FirestoreLesson[] = activeChapter.lessons.map((t, idx) => ({
            lessonId: t.id,
            title: t.title,
            description: t.summary || `${activeGrade} ${subjectName} lesson on ${t.title}.`,
            class: activeGrade,
            subjectId: subjectId || classSubject?.id || 'c5_math',
            chapterId: selectedChapterId,
            topicId: t.id,
            content: t.summary || `${activeGrade} educational content for ${t.title}.`,
            videoUrl: t.videoUrl || '',
            pdfUrl: '',
            duration: '15 mins',
            order: idx + 1,
            published: true
          }));
          setChapterLessons(fallbackLessons);
        } else {
          setChapterLessons([]);
        }
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [selectedChapterId, subjectId, classSubject, isOpen, activeChapter, subjectName, activeGrade]);

  // Find active lesson object
  const activeLesson = useMemo(() => {
    if (!selectedLessonId || chapterLessons.length === 0) return null;
    return chapterLessons.find(l => l.lessonId === selectedLessonId) || chapterLessons[0] || null;
  }, [selectedLessonId, chapterLessons]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLesson) return 0;
    return chapterLessons.findIndex(l => l.lessonId === activeLesson.lessonId);
  }, [activeLesson, chapterLessons]);

  // Strict Real Video / PDF validation (Eliminates dummy/rickroll URLs)
  const isRealVideoUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.includes('dQw4w9WgXcQ') || trimmed.includes('sample-videos') || trimmed.includes('dummy')) return false;
    return true;
  };

  const isRealPdfUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.includes('dummy.pdf') || trimmed.includes('example.com')) return false;
    return true;
  };

  const formatYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const isYouTubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

  // Handle Mark Complete
  const handleMarkComplete = async () => {
    if (!activeLesson || !userId) return;
    const isCompleted = !!lessonProgressMap[activeLesson.lessonId]?.completed;
    const nextStatus = !isCompleted;

    setIsSavingCompletion(true);
    try {
      await setLessonCompletionInFirestore(
        userId,
        activeGrade,
        subjectId || classSubject?.id || 'c5_math',
        selectedChapterId || '',
        activeLesson.lessonId,
        nextStatus
      );

      if (nextStatus) {
        if (onAddXp) onAddXp(25);
        if (onAddCoins) onAddCoins(10);
        showToast('🎉 Lesson Marked as Completed! +25 XP +10 Coins');
      } else {
        showToast('Lesson marked as incomplete.');
      }
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
      showToast('❌ Error saving progress. Please try again.');
    } finally {
      setIsSavingCompletion(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-full shadow-2xl border border-amber-400 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            {selectedChapterId && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (selectedLessonId) {
                    setSelectedLessonId(null);
                  } else {
                    setSelectedChapterId(null);
                  }
                }}
                className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="p-2.5 bg-blue-600 text-white rounded-2xl font-black text-xs shrink-0 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  Class 5
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {subjectName} {nativeName ? `(${nativeName})` : ''}
                </span>
                {activeChapter && (
                  <span className="text-[10px] font-bold text-slate-500 truncate">
                    • Chapter {activeChapter.chapterNumber}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                {selectedLessonId && activeLesson
                  ? activeLesson.title
                  : activeChapter
                  ? activeChapter.title
                  : `${subjectName} Chapters (${chapters.length})`}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 3-Tier Flow (1. Chapters List -> 2. Lessons List -> 3. Lesson Content) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* LEVEL 1: CHAPTERS LIST (Shown when no chapter is selected) */}
          {!selectedChapterId && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase">
                    Official SCERT Telangana Class 5 Syllabus
                  </span>
                  <h3 className="text-2xl font-black mt-1">Class 5 {subjectName}</h3>
                  <p className="text-xs text-blue-100 mt-1 max-w-xl">
                    Select a chapter below to view lessons and start learning with step-by-step explanations.
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-center">
                  <span className="text-2xl font-black">{chapters.length}</span>
                  <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Total Chapters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((ch) => {
                  const chLessons = ch.lessons || [];
                  const doneLessonsCount = chLessons.filter(l => !!lessonProgressMap[l.id]?.completed).length;
                  const isChDone = chLessons.length > 0 && doneLessonsCount === chLessons.length;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedChapterId(ch.id);
                        setSelectedLessonId(null);
                      }}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black">
                            Chapter {ch.chapterNumber}
                          </span>
                          {isChDone ? (
                            <span className="text-emerald-500 font-black text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Completed
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">
                              {chLessons.length} {chLessons.length === 1 ? 'Lesson' : 'Lessons'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {ch.title}
                        </h4>
                        {ch.nativeTitle && (
                          <p className="text-xs text-slate-400 font-medium">
                            {ch.nativeTitle}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{(ch as any).estimatedMinutes || 30} mins
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-black flex items-center gap-1 group-hover:translate-x-1 transition">
                          <span>Select Chapter</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LEVEL 2: LESSONS LIST FOR SELECTED CHAPTER (Shown when chapter is selected but no lesson clicked) */}
          {selectedChapterId && !selectedLessonId && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                    Chapter {activeChapter?.chapterNumber} • {subjectName}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {activeChapter?.title}
                  </h3>
                  {activeChapter?.nativeTitle && (
                    <p className="text-xs text-slate-400 font-medium">{activeChapter.nativeTitle}</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedChapterId(null);
                  }}
                  className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>All Chapters</span>
                </button>
              </div>

              {isLoadingLessons ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading Class 5 lessons from Firestore...</p>
                </div>
              ) : chapterLessons.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="font-extrabold text-base text-slate-700 dark:text-slate-300">
                    No Class 5 {subjectName} lessons available yet.
                  </p>
                  <p className="text-xs max-w-md mx-auto">
                    Lessons for Chapter {activeChapter?.chapterNumber} are currently being prepared according to SCERT Telangana syllabus.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                    <span>Available Lessons ({chapterLessons.length})</span>
                    <span>Click a lesson to view learning content</span>
                  </div>

                  {chapterLessons.map((les, idx) => {
                    const isDone = !!lessonProgressMap[les.lessonId]?.completed;
                    const hasValidVideo = isRealVideoUrl(les.videoUrl);
                    const hasValidPdf = isRealPdfUrl(les.pdfUrl);

                    return (
                      <div
                        key={les.lessonId}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedLessonId(les.lessonId);
                        }}
                        className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between gap-4 group ${
                          isDone
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <span className={`w-8 h-8 rounded-2xl text-xs font-black flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition'
                          }`}>
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </span>

                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                              {les.title}
                            </h4>
                            {les.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {les.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              {les.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {les.duration}</span>}
                              {hasValidVideo && <span className="text-rose-500 flex items-center gap-1 font-bold"><Video className="w-3 h-3" /> Video Lesson</span>}
                              {hasValidPdf && <span className="text-indigo-500 flex items-center gap-1 font-bold"><FileText className="w-3 h-3" /> PDF Notes</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isDone && (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                              Completed ✓
                            </span>
                          )}
                          <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LEVEL 3: LESSON CONTENT VIEW (Shown when a specific lesson is clicked) */}
          {selectedChapterId && selectedLessonId && activeLesson && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Header card with completion state and XP button */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                        Lesson {activeLessonIndex + 1} of {chapterLessons.length}
                      </span>
                      {lessonProgressMap[activeLesson.lessonId]?.completed && (
                        <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {activeLesson.title}
                    </h1>
                    {activeLesson.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        {activeLesson.description}
                      </p>
                    )}
                  </div>

                  {/* Mark as Complete button */}
                  <button
                    onClick={handleMarkComplete}
                    disabled={isSavingCompletion}
                    className={`px-5 py-3 rounded-2xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer shrink-0 ${
                      lessonProgressMap[activeLesson.lessonId]?.completed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isSavingCompletion ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {lessonProgressMap[activeLesson.lessonId]?.completed
                        ? 'Marked as Completed ✓'
                        : 'Mark as Complete (+25 XP)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Video Player Section: Rendered ONLY if real valid video exists, else clean notice */}
              {isRealVideoUrl(activeLesson.videoUrl) ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-rose-500" />
                      <span>Video Tutorial</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">Class 5 Stream</span>
                  </div>

                  <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
                    {isYouTubeUrl(activeLesson.videoUrl!) ? (
                      <iframe
                        src={formatYouTubeEmbedUrl(activeLesson.videoUrl!) || undefined}
                        title={activeLesson.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        src={activeLesson.videoUrl || undefined}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                  <Video className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No video available for this lesson.</span>
                </div>
              )}

              {/* PDF & Download Resources: Rendered ONLY if real valid PDF exists */}
              {isRealPdfUrl(activeLesson.pdfUrl) && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Lesson Reference Material (PDF Document)
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Official Class 5 SCERT Study Guide & Notes
                      </p>
                    </div>
                  </div>

                  <a
                    href={activeLesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              )}

              {/* Main Written Learning Content */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Learning Content & Key Explanations</span>
                </h3>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                  {activeLesson.content || 'Content for this lesson is being populated according to SCERT Telangana guidelines.'}
                </div>
              </div>

              {/* Lesson Navigation Footer */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={activeLessonIndex === 0}
                  onClick={() => {
                    soundFx.playClick();
                    const prevLesson = chapterLessons[activeLessonIndex - 1];
                    if (prevLesson) setSelectedLessonId(prevLesson.lessonId);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    activeLessonIndex === 0
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800'
                      : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedLessonId(null);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Back to Chapter Lessons
                </button>

                <button
                  disabled={activeLessonIndex >= chapterLessons.length - 1}
                  onClick={() => {
                    soundFx.playClick();
                    const nextLesson = chapterLessons[activeLessonIndex + 1];
                    if (nextLesson) setSelectedLessonId(nextLesson.lessonId);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    activeLessonIndex >= chapterLessons.length - 1
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
