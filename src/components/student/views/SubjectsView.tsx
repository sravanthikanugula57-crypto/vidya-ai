import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  Globe, 
  Languages, 
  Code, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Play, 
  FileText, 
  FileSpreadsheet, 
  HelpCircle, 
  ArrowRight, 
  Search, 
  Filter, 
  TrendingUp, 
  Bot, 
  Award, 
  Layers, 
  Brain, 
  ChevronRight, 
  Download, 
  Upload, 
  FolderTree, 
  ChevronLeft,
  Video,
  FileCode,
  Zap,
  RotateCcw,
  Star,
  MessageSquare
} from 'lucide-react';
import { Subject, Chapter, LanguageCode } from '../../../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey } from '../../../data/officialSyllabusData';
import { CMSItem, INITIAL_CMS_ITEMS } from '../../cms/cmsData';
import { soundFx } from '../../../lib/audio';
import { ChapterLearningHub } from '../ChapterLearningHub';
import { 
  SubjectProgressDoc, 
  subscribeToSubjectProgress, 
  subscribeToCmsItems 
} from '../../../services/studentFirestoreService';

import { 
  subscribeToClassSubjects, 
  subscribeToSubjectChapters,
  FirestoreSubject,
  FirestoreChapter 
} from '../../../services/classSyllabusService';
import { 
  subscribeToStudentTopicProgress,
  subscribeToStudentLessonProgress,
  LessonProgressDoc 
} from '../../../services/studentProgressService';
import { Class5LessonViewModal } from './Class5LessonViewModal';

interface SubjectsViewProps {
  userId: string;
  selectedLang: LanguageCode;
  studentClassGrade?: string;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
  onLaunchTutor?: (subjectName: string, chapterTitle?: string) => void;
}

const CLASS10_SUBJECT_METADATA: Record<string, { icon: string; color: string; bgGradient: string; nativeName: string }> = {
  Mathematics: {
    icon: 'Calculator',
    color: 'bg-blue-600',
    bgGradient: 'from-blue-600 to-indigo-700',
    nativeName: 'గణిత శాస్త్రం'
  },
  'Physical Science': {
    icon: 'Atom',
    color: 'bg-cyan-600',
    bgGradient: 'from-cyan-600 to-teal-700',
    nativeName: 'భౌతిక శాస్త్రం'
  },
  'Biological Science': {
    icon: 'BookOpen',
    color: 'bg-emerald-600',
    bgGradient: 'from-emerald-600 to-green-700',
    nativeName: 'జీవ శాస్త్రం'
  },
  'English Language': {
    icon: 'Languages',
    color: 'bg-purple-600',
    bgGradient: 'from-purple-600 to-pink-700',
    nativeName: 'ఇంగ్లీష్ భాష'
  },
  'Telugu Language': {
    icon: 'Languages',
    color: 'bg-teal-600',
    bgGradient: 'from-teal-600 to-emerald-700',
    nativeName: 'తెలుగు భాష & సాహిత్యం'
  },
  'Social Studies': {
    icon: 'Globe',
    color: 'bg-amber-600',
    bgGradient: 'from-amber-600 to-orange-700',
    nativeName: 'సాంఘిక శాస్త్రం'
  },
  'Computer Science & AI': {
    icon: 'Code',
    color: 'bg-pink-600',
    bgGradient: 'from-pink-600 to-rose-700',
    nativeName: 'కంప్యూటర్ & AI'
  }
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  userId,
  selectedLang,
  studentClassGrade = 'Class 5',
  onAddXp = () => {},
  onAddCoins = () => {},
  onLaunchTutor
}) => {
  const [subjectProgressList, setSubjectProgressList] = useState<SubjectProgressDoc[]>([]);
  const [firestoreSubjects, setFirestoreSubjects] = useState<FirestoreSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectProgressDoc | null>(null);
  const [selectedChapterForHub, setSelectedChapterForHub] = useState<{ subject: Subject; chapter: Chapter } | null>(null);
  const [selectedChapterForModal, setSelectedChapterForModal] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    chapterNumber: number;
  } | null>(null);
  const [firestoreChapters, setFirestoreChapters] = useState<FirestoreChapter[]>([]);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressDoc>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterStatusFilter, setChapterStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  // Real-time Firestore Subscriptions
  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    const unsubClassSubs = subscribeToClassSubjects(
      studentClassGrade,
      (subs) => {
        setFirestoreSubjects(subs);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching class subjects:', err);
        setFetchError('Unable to load subjects from Firestore. Please try again.');
        setLoading(false);
      }
    );

    const unsubSubs = subscribeToSubjectProgress(userId, setSubjectProgressList);
    const unsubLessonProg = subscribeToStudentLessonProgress(userId, setLessonProgressMap);
    const unsubCms = subscribeToCmsItems((items) => {
      if (items && items.length > 0) {
        setCmsItems(items as CMSItem[]);
      } else {
        setCmsItems(INITIAL_CMS_ITEMS);
      }
    });

    return () => {
      unsubClassSubs();
      unsubSubs();
      unsubLessonProg();
      unsubCms();
    };
  }, [userId, studentClassGrade]);

  // Subscribe to Chapters when a subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setFirestoreChapters([]);
      return;
    }

    const unsubChaps = subscribeToSubjectChapters(
      studentClassGrade,
      selectedSubject.id,
      (chaps) => {
        setFirestoreChapters(chaps);
      }
    );

    return () => {
      unsubChaps();
    };
  }, [selectedSubject, studentClassGrade]);

  // Combine real Firestore subject list
  const activeSubjectList: SubjectProgressDoc[] = useMemo(() => {
    if (subjectProgressList.length > 0) return subjectProgressList;

    return firestoreSubjects.map((fs) => ({
      id: fs.subjectId,
      name: fs.subjectName,
      nativeName: fs.nativeName || fs.subjectName,
      completedPercent: 0,
      chaptersCompleted: 0,
      totalChapters: fs.chaptersCount || 10,
      weakTopics: `${fs.subjectName} Practice Topics`,
      lastStudied: 'Not started yet',
      quizScoreAvg: 0,
      color: fs.color || 'from-blue-600 to-indigo-700',
      icon: fs.icon || 'BookOpen'
    }));
  }, [subjectProgressList, firestoreSubjects]);

  // Helper to map icon names
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-6 h-6 text-white" />;
      case 'Atom': return <Atom className="w-6 h-6 text-white" />;
      case 'Globe': return <Globe className="w-6 h-6 text-white" />;
      case 'Languages': return <Languages className="w-6 h-6 text-white" />;
      case 'Code': return <Code className="w-6 h-6 text-white" />;
      default: return <BookOpen className="w-6 h-6 text-white" />;
    }
  };

  // Get verified chapters for a given subject from official SSC syllabus
  const getSubjectChapters = (subjectName: string): Chapter[] => {
    const gradeKey = normalizeGradeKey(studentClassGrade || 'Class 5');
    const classSyllabus = OFFICIAL_SYLLABUS_BY_CLASS[gradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'];
    const matchedSub = classSyllabus.find(s => 
      s.id === selectedSubject?.id ||
      s.name.toLowerCase().includes(subjectName.toLowerCase()) || 
      subjectName.toLowerCase().includes(s.name.toLowerCase())
    );

    if (matchedSub && matchedSub.chapters && matchedSub.chapters.length > 0) {
      return matchedSub.chapters.map(ch => ({
        id: ch.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        nativeTitle: ch.nativeTitle,
        topicsCount: ch.lessonsCount || ch.lessons?.length || 4,
        estimatedMinutes: (ch.lessonsCount || 4) * 12,
        completed: false,
        keyFormulas: ch.lessons?.slice(0, 3).map(l => l.title) || []
      }));
    }

    return [];
  };

  // Get CMS resources for a given chapter/subject
  const getCmsResourcesForChapter = (subjectName: string, chapterTitle?: string) => {
    return cmsItems.filter(item => {
      const isSubMatch = item.subject === subjectName || item.subject === 'All Subjects' || subjectName.toLowerCase().includes(item.subject.toLowerCase());
      const isChapMatch = !chapterTitle || !item.chapter || item.chapter === chapterTitle;
      return isSubMatch && isChapMatch && item.status === 'Published';
    });
  };

  // Calculate Overall Syllabus Completion %
  const totalSyllabusProgress = Math.round(
    activeSubjectList.reduce((acc, sub) => acc + sub.completedPercent, 0) / (activeSubjectList.length || 1)
  );

  // If student opened Chapter Learning Hub workspace
  if (selectedChapterForHub) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto animate-fade-in">
        <ChapterLearningHub
          subject={selectedChapterForHub.subject}
          chapter={selectedChapterForHub.chapter}
          selectedLang={selectedLang}
          onBack={() => {
            soundFx.playClick();
            setSelectedChapterForHub(null);
          }}
          onAddXp={onAddXp}
          onAddCoins={onAddCoins}
          customCmsItems={cmsItems}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 text-white p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
                <FolderTree className="w-7 h-7 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                    Class 10 State Board (SSC)
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                    Live Firestore Synced
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  Class 10 Complete Curriculum & Subjects
                </h1>
                <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                  Chapter-by-Chapter Learning Hub, Video Tutorials, Notes, Practice Drills & AI Tutor
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[160px]">
              <span className="text-xs text-sky-200 font-bold block">Overall Readiness</span>
              <span className="text-2xl font-black text-amber-300">{totalSyllabusProgress}% Complete</span>
              <div className="w-full bg-black/20 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalSyllabusProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search subject, chapter title, or topic e.g. 'Quadratic Equations' or 'Refraction'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 dark:bg-slate-950/60 border border-white/20 text-xs text-white placeholder-sky-200/60 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {selectedSubject && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedSubject(null);
                }}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl backdrop-blur transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>All Subjects</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUBJECT DETAILS EXPLORER VIEW (When a subject card is selected) */}
      {selectedSubject ? (
        <div className="space-y-6">
          
          {/* Selected Subject Header */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedSubject.color || 'from-blue-600 to-indigo-700'}`}>
                  {getSubjectIcon(selectedSubject.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Class 10 Syllabus
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Last studied: {selectedSubject.lastStudied}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedSubject.name}
                  </h2>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedSubject.nativeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLaunchTutor?.(selectedSubject.name)}
                  className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Tutor for {selectedSubject.name}</span>
                </button>
              </div>
            </div>

            {/* Subject Level Progress Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Syllabus Completion</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{selectedSubject.completedPercent}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Chapters Completed</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {selectedSubject.chaptersCompleted} / {selectedSubject.totalChapters}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Quiz Accuracy Avg</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400">{selectedSubject.quizScoreAvg}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Published CMS Resources</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {getCmsResourcesForChapter(selectedSubject.name).length} Items
                </span>
              </div>
            </div>

            {selectedSubject.weakTopics && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between font-bold">
                <span>⚠️ Focus Area to Revise: {selectedSubject.weakTopics}</span>
                <button
                  onClick={() => onLaunchTutor?.(selectedSubject.name, selectedSubject.weakTopics)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-xl transition cursor-pointer"
                >
                  Generate AI Practice Drill
                </button>
              </div>
            )}
          </div>

          {/* Chapter-by-Chapter Learning List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Chapter-Wise Learning Modules ({firestoreChapters.length > 0 ? firestoreChapters.length : getSubjectChapters(selectedSubject.name).length} Chapters)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any chapter to access published lessons, videos, notes, and interactive learning.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['all', 'completed', 'in_progress'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setChapterStatusFilter(st)}
                    className={`px-3 py-1 text-[11px] font-extrabold rounded-lg capitalize transition cursor-pointer ${
                      chapterStatusFilter === st ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {firestoreChapters.length > 0 ? (
                firestoreChapters
                  .filter((chap) => {
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      return chap.chapterName.toLowerCase().includes(q) || (chap.nativeTitle && chap.nativeTitle.toLowerCase().includes(q));
                    }
                    return true;
                  })
                  .map((chap, idx) => {
                    const chapCmsItems = getCmsResourcesForChapter(selectedSubject.name, chap.chapterName);
                    return (
                      <div
                        key={chap.chapterId}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition group"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              {`Ch ${chap.chapterNumber || idx + 1}`}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  {chap.lessonsCount || 3} Lessons
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {studentClassGrade} SCERT Curriculum
                                </span>
                                {chapCmsItems.length > 0 && (
                                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                                    {chapCmsItems.length} Resources
                                  </span>
                                )}
                              </div>

                              <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                                Chapter {chap.chapterNumber || idx + 1}: {chap.chapterName}
                              </h4>
                              {chap.nativeTitle && (
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {chap.nativeTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedChapterForModal({
                                  subjectId: selectedSubject.id,
                                  subjectName: selectedSubject.name,
                                  chapterId: chap.chapterId,
                                  chapterName: chap.chapterName,
                                  chapterNumber: chap.chapterNumber || idx + 1
                                });
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" />
                              <span>View Lessons & Content</span>
                            </button>
                          </div>
                        </div>

                        {/* Resource Badges Bar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span>{chap.lessonsCount || 3} Published Lessons</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-rose-500" />
                              <span>Video Tutorials</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Study Notes & PDF</span>
                            </span>
                          </div>

                          <button
                            onClick={() => onLaunchTutor?.(selectedSubject.name, chap.chapterName)}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Ask AI Tutor</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                getSubjectChapters(selectedSubject.name)
                  .filter((ch) => {
                    if (chapterStatusFilter === 'completed') return ch.completed;
                    if (chapterStatusFilter === 'in_progress') return !ch.completed;
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      return ch.title.toLowerCase().includes(q) || (ch.nativeTitle && ch.nativeTitle.toLowerCase().includes(q));
                    }
                    return true;
                  })
                  .map((chap) => {
                    const chapCmsItems = getCmsResourcesForChapter(selectedSubject.name, chap.title);
                    return (
                      <div
                        key={chap.id}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition group"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                              chap.completed ? 'bg-emerald-500 text-slate-950' : 'bg-blue-600 text-white'
                            }`}>
                              {chap.completed ? <CheckCircle2 className="w-5 h-5" /> : `Ch ${chap.chapterNumber}`}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  chap.completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {chap.completed ? 'Completed' : 'In Progress'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Est. Time: {chap.estimatedMinutes} mins
                                </span>
                                {chapCmsItems.length > 0 && (
                                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                                    {chapCmsItems.length} Teacher Uploads
                                  </span>
                                )}
                              </div>

                              <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                                Chapter {chap.chapterNumber}: {chap.title}
                              </h4>
                              {chap.nativeTitle && (
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {chap.nativeTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedChapterForModal({
                                  subjectId: selectedSubject.id,
                                  subjectName: selectedSubject.name,
                                  chapterId: chap.id,
                                  chapterName: chap.title,
                                  chapterNumber: chap.chapterNumber
                                });
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" />
                              <span>View Lessons & Content</span>
                            </button>
                          </div>
                        </div>

                        {/* Resource Badges Bar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-rose-500" />
                              <span>4 Video Tutorials</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span>PDF & Slide Notes</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Worksheet Exercises</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                              <span>Practice & PYQs</span>
                            </span>
                          </div>

                          <button
                            onClick={() => onLaunchTutor?.(selectedSubject.name, chap.title)}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Ask AI Tutor</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

        </div>
      ) : (
        /* 3. ALL SUBJECTS GRID VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Class 10 Core Subjects ({activeSubjectList.length} Subjects)
              </h2>
              <p className="text-xs text-slate-500">
                Complete AP SSC Board Class 10 Curriculum
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubjectList
              .filter((sub) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return sub.name.toLowerCase().includes(q) || (sub.nativeName && sub.nativeName.toLowerCase().includes(q));
              })
              .map((sub) => {
                const cmsCount = getCmsResourcesForChapter(sub.name).length;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSubject(sub);
                    }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${sub.color || 'from-blue-600 to-indigo-700'}`}>
                          {getSubjectIcon(sub.icon)}
                        </div>

                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl">
                          {sub.completedPercent}% Complete
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                          {sub.name}
                        </h3>
                        {sub.nativeName && (
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {sub.nativeName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-sky-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${sub.completedPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Chapters: {sub.chaptersCompleted}/{sub.totalChapters}</span>
                          <span>Avg Quiz: {sub.quizScoreAvg}%</span>
                        </div>
                      </div>

                      {sub.weakTopics && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 font-extrabold truncate">
                          Focus: {sub.weakTopics}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                      <span>Explore Syllabus & Chapters</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. Published CMS Resources Auto-Feed Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Recently Published Teacher Educational Resources
              </h3>
              <p className="text-[11px] text-slate-400">
                Uploaded via Teacher CMS and auto-linked to Class 10 subjects
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
            {cmsItems.filter(i => i.status === 'Published').length} Published Resources
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cmsItems
            .filter(i => i.status === 'Published')
            .slice(0, 6)
            .map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{item.subject}</span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-200/50 dark:border-slate-700/50">
                  <span>Author: {item.author?.name || 'SCERT Board Teacher'}</span>
                  <span className="text-blue-600 font-extrabold cursor-pointer">Open File</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Class 5 Lesson View Modal */}
      {selectedChapterForModal && (
        <Class5LessonViewModal
          isOpen={!!selectedChapterForModal}
          onClose={() => setSelectedChapterForModal(null)}
          userId={userId}
          studentClassGrade={studentClassGrade}
          subjectId={selectedChapterForModal.subjectId}
          subjectName={selectedChapterForModal.subjectName}
          chapterId={selectedChapterForModal.chapterId}
          chapterName={selectedChapterForModal.chapterName}
          chapterNumber={selectedChapterForModal.chapterNumber}
          onAddXp={onAddXp}
          onAddCoins={onAddCoins}
        />
      )}

    </div>
  );
};
