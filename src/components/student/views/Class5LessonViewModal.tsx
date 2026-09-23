import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Play, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  Download, 
  BookOpen, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  Check,
  Eye,
  Layers,
  Award
} from 'lucide-react';
import { 
  FirestoreLesson, 
  subscribeToChapterLessons 
} from '../../../services/classSyllabusService';
import { 
  LessonProgressDoc, 
  setLessonCompletionInFirestore, 
  subscribeToStudentLessonProgress 
} from '../../../services/studentProgressService';
import { formatYouTubeEmbedUrl, isYouTubeUrl } from '../../../lib/videoUtils';
import { soundFx } from '../../../lib/audio';
import { AIVideoLessonModal } from '../AIVideoLessonModal';

interface Class5LessonViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  studentClassGrade?: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  chapterNumber?: number;
  initialLessonId?: string;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
}

export const Class5LessonViewModal: React.FC<Class5LessonViewModalProps> = ({
  isOpen,
  onClose,
  userId,
  studentClassGrade = 'Class 5',
  subjectId,
  subjectName,
  chapterId,
  chapterName,
  chapterNumber = 1,
  initialLessonId,
  onAddXp = (_xp: number) => {},
  onAddCoins = (_coins: number) => {}
}) => {
  const [lessons, setLessons] = useState<FirestoreLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressDoc>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAIVideoModalOpen, setIsAIVideoModalOpen] = useState<boolean>(false);

  // Subscribe to published lessons from Firestore
  useEffect(() => {
    if (!isOpen || !subjectId || !chapterId) return;

    setLoading(true);
    setFetchError(null);

    const unsubLessons = subscribeToChapterLessons(
      studentClassGrade,
      subjectId,
      chapterId,
      (fetchedLessons) => {
        setLessons(fetchedLessons);
        setLoading(false);

        if (fetchedLessons.length > 0) {
          if (initialLessonId) {
            const matchIdx = fetchedLessons.findIndex((l) => l.lessonId === initialLessonId);
            setActiveLessonIndex(matchIdx >= 0 ? matchIdx : 0);
          } else {
            setActiveLessonIndex(0);
          }
        }
      },
      (err) => {
        console.error('Error fetching chapter lessons:', err);
        setFetchError('Unable to load lessons from Firestore. Please check connection and try again.');
        setLoading(false);
      }
    );

    const unsubProg = subscribeToStudentLessonProgress(userId, (map) => {
      setLessonProgressMap(map);
    });

    return () => {
      unsubLessons();
      unsubProg();
    };
  }, [isOpen, studentClassGrade, subjectId, chapterId, initialLessonId, userId]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeLesson = lessons[activeLessonIndex] || null;
  const isCompleted = activeLesson ? !!lessonProgressMap[activeLesson.lessonId]?.completed : false;

  const handleMarkComplete = async () => {
    if (!activeLesson || isSavingCompletion) return;

    setIsSavingCompletion(true);
    soundFx.playSuccess();
    const nextState = !isCompleted;

    try {
      await setLessonCompletionInFirestore(
        userId,
        studentClassGrade,
        subjectId,
        chapterId,
        activeLesson.lessonId,
        nextState
      );

      if (nextState) {
        if (onAddXp) onAddXp(25);
        if (onAddCoins) onAddCoins(10);
        showToast('🎉 Lesson Marked as Completed! +25 XP +10 Coins');
      } else {
        showToast('Lesson marked as incomplete.');
      }
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
      showToast('❌ Error saving progress to Firestore. Please try again.');
    } finally {
      setIsSavingCompletion(false);
    }
  };

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

  const hasVideo = isRealVideoUrl(activeLesson?.videoUrl);
  const hasPdf = isRealPdfUrl(activeLesson?.pdfUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[900px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
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
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl font-black text-xs shrink-0 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {studentClassGrade}
                </span>
                <span className="text-[10px] font-bold text-slate-400 truncate">
                  {subjectName} • Chapter {chapterNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                {chapterName}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Lessons List */}
          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto max-h-48 md:max-h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Lessons ({lessons.length})
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {Object.values(lessonProgressMap).filter((l: LessonProgressDoc) => l.completed).length} / {lessons.length} Done
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading published lessons...</p>
              </div>
            ) : fetchError ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">{fetchError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : lessons.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No Class 5 {subjectName} lessons available yet.</p>
                <p className="text-[11px] text-slate-400">Check back soon for published content.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((les, idx) => {
                  const isCurrent = idx === activeLessonIndex;
                  const isLesDone = !!lessonProgressMap[les.lessonId]?.completed;

                  return (
                    <button
                      key={les.lessonId}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveLessonIndex(idx);
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition-all border cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : isLesDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-slate-800 dark:text-slate-200 hover:bg-emerald-100'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-white text-blue-700'
                            : isLesDone
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isLesDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate">
                            {les.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] opacity-80 mt-0.5">
                            {les.duration && <span>{les.duration}</span>}
                            {les.videoUrl && <Video className="w-3 h-3 text-rose-400" />}
                            {les.pdfUrl && <FileText className="w-3 h-3 text-indigo-400" />}
                          </div>
                        </div>
                      </div>

                      {isLesDone && !isCurrent && (
                        <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded shrink-0">
                          Done
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Main Panel: Lesson Content & Media */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {loading ? (
              <div className="h-full flex items-center justify-center py-16 text-slate-400 text-xs space-y-3 flex-col">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p>Fetching lesson details from Firestore...</p>
              </div>
            ) : fetchError ? (
              <div className="h-full flex items-center justify-center py-16 text-center space-y-3 flex-col">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Unable to load lesson</h3>
                <p className="text-xs text-slate-500">{fetchError}</p>
              </div>
            ) : !activeLesson ? (
              <div className="h-full flex items-center justify-center py-16 text-center text-slate-400 space-y-3 flex-col">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="font-extrabold text-sm text-slate-700 dark:text-slate-300">No published lesson selected.</p>
                <p className="text-xs">Please select a lesson from the left sidebar.</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                
                {/* Active Lesson Header & Actions */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                          Lesson {activeLessonIndex + 1} of {lessons.length}
                        </span>
                        {isCompleted && (
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

                    {/* Mark Complete Action Button */}
                    <button
                      onClick={handleMarkComplete}
                      disabled={isSavingCompletion}
                      className={`px-5 py-3 rounded-2xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isSavingCompletion ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{isCompleted ? 'Marked as Completed ✓' : 'Mark as Complete (+25 XP)'}</span>
                    </button>
                  </div>
                </div>

                {/* VIDYA AI EDUCATIONAL VIDEO GENERATOR BANNER */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-2 border-blue-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shrink-0">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                          AI Video Studio
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          SCERT Smart Classroom
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
                        Watch AI Video Lesson: {activeLesson.title}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Chalkboard animations, visual models, teacher voiceover & interactive quiz.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setIsAIVideoModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-xs shadow-lg hover:shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Generate & Watch AI Video</span>
                  </button>
                </div>

                {/* Video Player Section (Rendered ONLY if videoUrl exists, else show clean notice) */}
                {hasVideo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-rose-500" />
                        <span>Video Tutorial</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">Class 5 Media Stream</span>
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

                {/* PDF & Download Resources (Rendered ONLY if pdfUrl exists) */}
                {hasPdf && (
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
                      setActiveLessonIndex((prev) => Math.max(0, prev - 1));
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
                    disabled={activeLessonIndex >= lessons.length - 1}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1));
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                      activeLessonIndex >= lessons.length - 1
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

      {/* AI Video Lesson Modal */}
      {activeLesson && (
        <AIVideoLessonModal
          isOpen={isAIVideoModalOpen}
          onClose={() => setIsAIVideoModalOpen(false)}
          grade={studentClassGrade}
          subject={subjectName}
          subjectId={subjectId}
          chapter={chapterName}
          chapterId={chapterId}
          topic={activeLesson.title}
          topicId={activeLesson.lessonId}
        />
      )}
    </div>
  );
};
