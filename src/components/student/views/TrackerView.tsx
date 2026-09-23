import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Bot, 
  Play, 
  Zap, 
  Target, 
  Award, 
  BarChart2, 
  Layers, 
  RotateCcw,
  Star,
  ChevronRight,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  subscribeToChapterProgress, 
  ChapterProgressRecord 
} from '../../../services/studentFirestoreService';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, OFFICIAL_CLASSES } from '../../../data/officialSyllabusData';

function normalizeGradeKey(rawGrade: string): OfficialClassGrade {
  if (!rawGrade) return 'Class 10';
  const clean = rawGrade.toString().trim();
  if ((OFFICIAL_CLASSES as readonly string[]).includes(clean)) {
    return clean as OfficialClassGrade;
  }
  const match = clean.match(/\d+/);
  if (match) {
    const num = match[0];
    const candidate = `Class ${num}` as OfficialClassGrade;
    if ((OFFICIAL_CLASSES as readonly string[]).includes(candidate)) {
      return candidate;
    }
  }
  return 'Class 10';
}

interface TrackerViewProps {
  userId: string;
  studentClassGrade?: string;
  onNavigateTab: (tab: string) => void;
  onLaunchTutor?: (subjectName?: string, chapterTitle?: string) => void;
}

interface ChapterTrackerData {
  id: string;
  chapterNumber: number;
  title: string;
  nativeTitle?: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  progressPct: number;
  lessonsCompleted: number;
  totalLessons: number;
  videosWatched: number;
  totalVideos: number;
  practiceSolved: number;
  totalPractice: number;
  quizScore: number;
  revisionStatus: 'Mastered' | 'In Progress' | 'Needs Revision' | 'Not Started';
}

interface SubjectTracker {
  id: string;
  name: string;
  totalChapters: number;
  chaptersCompleted: number;
  overallPct: number;
  icon: string;
  chapters: ChapterTrackerData[];
}

function buildSubjectTrackersForGrade(gradeGrade: string): SubjectTracker[] {
  const activeGradeKey = normalizeGradeKey(gradeGrade);
  const officialSubs = OFFICIAL_SYLLABUS_BY_CLASS[activeGradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];

  return officialSubs.map((sub) => {
    const chapters: ChapterTrackerData[] = sub.chapters.map((ch, cIdx) => {
      const totalLessons = ch.lessonsCount || ch.lessons.length || 3;
      const isFirst = cIdx === 0;
      return {
        id: ch.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        nativeTitle: ch.nativeTitle,
        status: isFirst ? 'in_progress' : 'upcoming',
        progressPct: isFirst ? 20 : 0,
        lessonsCompleted: isFirst ? 1 : 0,
        totalLessons,
        videosWatched: isFirst ? 1 : 0,
        totalVideos: 3,
        practiceSolved: isFirst ? 5 : 0,
        totalPractice: 10,
        quizScore: 0,
        revisionStatus: isFirst ? 'In Progress' : 'Not Started'
      };
    });

    const completedCount = chapters.filter(c => c.status === 'completed').length;
    const totalCount = chapters.length;
    const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      id: sub.id,
      name: sub.name,
      totalChapters: totalCount,
      chaptersCompleted: completedCount,
      overallPct,
      icon: sub.icon || 'BookOpen',
      chapters
    };
  });
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  userId,
  studentClassGrade = 'Class 10',
  onNavigateTab,
  onLaunchTutor
}) => {
  const [subjects, setSubjects] = useState<SubjectTracker[]>(() => buildSubjectTrackersForGrade(studentClassGrade));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const built = buildSubjectTrackersForGrade(studentClassGrade);
    return built[0]?.id || 'math';
  });
  const [selectedChapterDetails, setSelectedChapterDetails] = useState<ChapterTrackerData | null>(null);

  // Update subjects when studentClassGrade changes
  useEffect(() => {
    const built = buildSubjectTrackersForGrade(studentClassGrade);
    setSubjects(built);
    if (built.length > 0 && !built.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(built[0].id);
    }
  }, [studentClassGrade]);

  // Sync with Firestore chapter progress records
  useEffect(() => {
    const unsub = subscribeToChapterProgress(userId, (records) => {
      if (records && Object.keys(records).length > 0) {
        setSubjects((prevSubs) => {
          return prevSubs.map((sub) => {
            let completedCount = 0;
            const updatedChaps = sub.chapters.map((chap) => {
              const rec = records[chap.id];
              if (rec) {
                const isComp = rec.completionStatus === 'completed' || rec.lessonProgress === 100;
                if (isComp) completedCount++;
                return {
                  ...chap,
                  status: isComp ? 'completed' : (rec.lessonProgress > 0 ? 'in_progress' : chap.status),
                  progressPct: rec.lessonProgress ?? chap.progressPct,
                  lessonsCompleted: isComp ? chap.totalLessons : Math.round((rec.lessonProgress / 100) * chap.totalLessons),
                  quizScore: rec.quizScore ?? chap.quizScore,
                  revisionStatus: rec.aiRevisionStatus as any || chap.revisionStatus
                };
              }
              if (chap.status === 'completed') completedCount++;
              return chap;
            });

            return {
              ...sub,
              chaptersCompleted: completedCount,
              overallPct: Math.round((completedCount / sub.totalChapters) * 100),
              chapters: updatedChaps
            };
          });
        });
      }
    });

    return () => unsub();
  }, [userId]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Find next upcoming chapter
  const nextChapter = activeSubject.chapters.find((c) => c.status === 'in_progress' || c.status === 'upcoming');

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Chapter Roadmap & Syllabus Progress Tracker</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {studentClassGrade} Syllabus Completion Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Never wonder what comes next. Follow your structured chapter-by-chapter roadmap to achieve 100% board readiness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <div className="text-2xl font-black text-amber-300">
                {activeSubject.chaptersCompleted} / {activeSubject.totalChapters}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-black">Chapters Mastered</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-purple-600 text-white text-center shadow-lg shadow-purple-600/30">
              <div className="text-2xl font-black">{activeSubject.overallPct}%</div>
              <div className="text-[10px] text-purple-100 uppercase font-black">Subject Mastery</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUBJECT SELECTOR TABS */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => {
          const isActive = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedSubjectId(sub.id);
                setSelectedChapterDetails(null);
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2.5 shrink-0 border ${
                isActive 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/25 scale-105' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-400'
              }`}
            >
              <span>{sub.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {sub.overallPct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. NEXT IMMEDIATE CHAPTER CALLOUT */}
      {nextChapter && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              Ch {nextChapter.chapterNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                  🎯 Next Immediate Milestone
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {nextChapter.status === 'in_progress' ? 'In Progress (60%)' : 'Upcoming Next'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {nextChapter.title} {nextChapter.nativeTitle && <span className="text-xs text-slate-400 font-normal">({nextChapter.nativeTitle})</span>}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('syllabus')}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Chapter Now</span>
            </button>
            <button
              onClick={() => onLaunchTutor?.(activeSubject.name, nextChapter.title)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-50 transition cursor-pointer"
              title="Ask AI Tutor"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. VISUAL CONNECTED CHAPTER ROADMAP PIPELINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              <span>{activeSubject.name} Visual Roadmap</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Step-by-step chapter completion path</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" /> Upcoming</span>
          </div>
        </div>

        {/* ROADMAP NODES */}
        <div className="relative space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {activeSubject.chapters.map((chap) => {
            const isCompleted = chap.status === 'completed';
            const isInProgress = chap.status === 'in_progress';

            return (
              <div 
                key={chap.id}
                onClick={() => setSelectedChapterDetails(chap)}
                className={`relative z-10 pl-14 sm:pl-20 p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400' 
                    : isInProgress 
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/80 shadow-md ring-2 ring-amber-400/30' 
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                {/* CONNECTED ROADMAP NODE BADGE */}
                <div className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl font-black text-xs flex items-center justify-center text-white shadow-md transition ${
                  isCompleted ? 'bg-emerald-500 shadow-emerald-500/30' : isInProgress ? 'bg-amber-500 shadow-amber-500/30 animate-pulse' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : chap.chapterNumber}
                </div>

                {/* CHAPTER INFO */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Chapter {chap.chapterNumber}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isCompleted 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                        : isInProgress 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isCompleted ? '✅ Mastered' : isInProgress ? '🟡 In Progress (60%)' : '⚪ Upcoming'}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {chap.title} {chap.nativeTitle && <span className="text-xs text-slate-400 font-medium">({chap.nativeTitle})</span>}
                  </h4>

                  {/* MINI METRICS ROW */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span>📚 Lessons: {chap.lessonsCompleted}/{chap.totalLessons}</span>
                    <span>📹 Videos: {chap.videosWatched}/{chap.totalVideos}</span>
                    <span>⚡ Practice: {chap.practiceSolved}/{chap.totalPractice} Qs</span>
                    {chap.quizScore > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">🎯 Quiz: {chap.quizScore}%</span>}
                  </div>
                </div>

                {/* ACTION / PROGRESS BAR */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-200 dark:border-slate-700 pt-2 md:pt-0">
                  <div className="w-28 space-y-1 text-right hidden sm:block">
                    <div className="text-[10px] font-black text-slate-600 dark:text-slate-400">{chap.progressPct}% Done</div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${chap.progressPct}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playClick();
                      onNavigateTab('syllabus');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      isCompleted 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : isInProgress 
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Explore'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. CHAPTER DETAILED MODAL / FLYOUT */}
      {selectedChapterDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedChapterDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                Chapter {selectedChapterDetails.chapterNumber} • Detailed Breakdown
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedChapterDetails.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="text-lg font-black text-purple-600 dark:text-purple-400">{selectedChapterDetails.lessonsCompleted}/{selectedChapterDetails.totalLessons}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Lessons</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="text-lg font-black text-blue-600 dark:text-blue-400">{selectedChapterDetails.videosWatched}/{selectedChapterDetails.totalVideos}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Videos</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="text-lg font-black text-amber-500">{selectedChapterDetails.practiceSolved}/{selectedChapterDetails.totalPractice}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Practice Qs</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{selectedChapterDetails.quizScore}%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Quiz Accuracy</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300">AI Revision Status</span>
                <div className="text-sm font-black text-slate-900 dark:text-white">{selectedChapterDetails.revisionStatus}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedChapterDetails(null);
                  onLaunchTutor?.(activeSubject.name, selectedChapterDetails.title);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 transition"
              >
                Ask AI Tutor
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedChapterDetails(null);
                onNavigateTab('syllabus');
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition"
            >
              Open Complete Chapter Syllabus & Resources
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
