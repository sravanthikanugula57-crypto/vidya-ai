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
  MessageSquare,
  Compass,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { Subject, Chapter, LanguageCode } from '../../../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, normalizeGradeKey } from '../../../data/officialSyllabusData';
import { CMSItem, INITIAL_CMS_ITEMS } from '../../cms/cmsData';
import { soundFx } from '../../../lib/audio';
import { ChapterLearningHub } from '../ChapterLearningHub';
import { ChapterSubRoadmapView } from './ChapterSubRoadmapView';
import { 
  SubjectProgressDoc, 
  subscribeToSubjectProgress, 
  subscribeToCmsItems,
  subscribeToChapterProgress,
  updateChapterProgressInFirestore,
  ChapterProgressRecord
} from '../../../services/studentFirestoreService';
import { subscribeToStudentTopicProgress } from '../../../services/studentProgressService';

interface SyllabusViewProps {
  userId: string;
  selectedLang: LanguageCode;
  studentClassGrade?: string;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
  onLaunchTutor?: (subjectName: string, chapterTitle?: string) => void;
}

export interface DetailedSyllabusSubject {
  id: string;
  name: string;
  nativeName: string;
  icon: string;
  color: string;
  bgGradient: string;
  completedPercent: number;
  chaptersCompleted: number;
  totalChapters: number;
  videosCompleted: number;
  totalVideos: number;
  notesCompleted: number;
  totalNotes: number;
  practiceProgress: number;
  quizAccuracy: number;
  studyTimeHours: number;
  boardReadinessScore: number;
  weakTopics?: string;
  lastStudied: string;
  chapters: DetailedChapterData[];
}

export interface DetailedChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  nativeTitle?: string;
  completionStatus: 'completed' | 'in_progress' | 'not_started';
  lessonProgress: number;
  videosWatched: number;
  totalVideos: number;
  notesRead: number;
  totalNotes: number;
  practiceSolved: number;
  totalPractice: number;
  quizScore: number;
  aiRevisionStatus: 'Mastered' | 'Revision Due' | 'Needs Practice' | 'Not Started';
  masteryLevel: 'Novice' | 'Proficient' | 'Master';
  estimatedMinutes: number;
  lastStudiedDate: string;
  keyFormulas?: string[];
}

// Master Class 10 Syllabus Data for 6 Core Subjects
const INITIAL_CLASS10_SYLLABUS: DetailedSyllabusSubject[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    nativeName: 'గణిత శాస్త్రం',
    icon: 'Calculator',
    color: 'bg-blue-600',
    bgGradient: 'from-blue-600 to-indigo-700',
    completedPercent: 72,
    chaptersCompleted: 10,
    totalChapters: 14,
    videosCompleted: 28,
    totalVideos: 36,
    notesCompleted: 14,
    totalNotes: 14,
    practiceProgress: 78,
    quizAccuracy: 84,
    studyTimeHours: 42.5,
    boardReadinessScore: 86,
    weakTopics: 'Quadratic Discriminant & Trigonometric Identities',
    lastStudied: 'Today, 10:15 AM',
    chapters: [
      {
        id: 'maths_ch1',
        chapterNumber: 1,
        title: 'Real Numbers',
        nativeTitle: 'వాస్తవ సంఖ్యలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 4,
        totalVideos: 4,
        notesRead: 2,
        totalNotes: 2,
        practiceSolved: 20,
        totalPractice: 20,
        quizScore: 92,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: 'Yesterday',
        keyFormulas: ["Euclid's Division Lemma: a = bq + r", 'Fundamental Theorem of Arithmetic']
      },
      {
        id: 'maths_ch2',
        chapterNumber: 2,
        title: 'Sets & Set Operations',
        nativeTitle: 'సమితులు - పరిక్రియలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 2,
        totalNotes: 2,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '2 days ago'
      },
      {
        id: 'maths_ch3',
        chapterNumber: 3,
        title: 'Polynomials & Zeros',
        nativeTitle: 'బహుపదులు మరియు శూన్యాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 18,
        totalPractice: 18,
        quizScore: 85,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 50,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'maths_ch4',
        chapterNumber: 4,
        title: 'Pair of Linear Equations in Two Variables',
        nativeTitle: 'రెండు చరరాశులలో రేఖీయ సమీకరణాల జత',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 4,
        totalVideos: 4,
        notesRead: 2,
        totalNotes: 2,
        practiceSolved: 22,
        totalPractice: 22,
        quizScore: 80,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 55,
        lastStudiedDate: '4 days ago'
      },
      {
        id: 'maths_ch5',
        chapterNumber: 5,
        title: 'Quadratic Equations & Discriminants',
        nativeTitle: 'వర్గ సమీకరణాలు మరియు విచక్షణి',
        completionStatus: 'in_progress',
        lessonProgress: 65,
        videosWatched: 2,
        totalVideos: 4,
        notesRead: 1,
        totalNotes: 2,
        practiceSolved: 12,
        totalPractice: 25,
        quizScore: 72,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 60,
        lastStudiedDate: 'Today, 10:15 AM',
        keyFormulas: ['Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a', 'Discriminant D = b² - 4ac']
      },
      {
        id: 'maths_ch6',
        chapterNumber: 6,
        title: 'Progressions (AP & GP)',
        nativeTitle: 'శ్రేఢులు (అంక మరియు గుణ శ్రేఢులు)',
        completionStatus: 'in_progress',
        lessonProgress: 50,
        videosWatched: 2,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 20,
        quizScore: 75,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 45,
        lastStudiedDate: 'Yesterday'
      },
      {
        id: 'maths_ch7',
        chapterNumber: 7,
        title: 'Coordinate Geometry',
        nativeTitle: 'నిరూపక రేఖాగాణితం',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 3,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 15,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 50,
        lastStudiedDate: 'Never'
      },
      {
        id: 'maths_ch8',
        chapterNumber: 8,
        title: 'Similar Triangles & Proofs',
        nativeTitle: 'సరూప త్రిభుజాలు',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 4,
        notesRead: 0,
        totalNotes: 2,
        practiceSolved: 0,
        totalPractice: 20,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 55,
        lastStudiedDate: 'Never'
      },
      {
        id: 'maths_ch9',
        chapterNumber: 9,
        title: 'Tangents & Secants to a Circle',
        nativeTitle: 'వృత్తానికి స్పర్శరేఖలు మరియు ఛేదన రేఖలు',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 3,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 15,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 45,
        lastStudiedDate: 'Never'
      },
      {
        id: 'maths_ch10',
        chapterNumber: 10,
        title: 'Mensuration (3D Solids Volume & Area)',
        nativeTitle: 'క్షేత్రమితి',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 18,
        totalPractice: 18,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 50,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'maths_ch11',
        chapterNumber: 11,
        title: 'Trigonometry & Identities',
        nativeTitle: 'త్రికోణమితి మరియు సర్వసమీకరణాలు',
        completionStatus: 'in_progress',
        lessonProgress: 60,
        videosWatched: 2,
        totalVideos: 4,
        notesRead: 1,
        totalNotes: 2,
        practiceSolved: 14,
        totalPractice: 25,
        quizScore: 78,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 60,
        lastStudiedDate: 'Yesterday',
        keyFormulas: ['sin²θ + cos²θ = 1', '1 + tan²θ = sec²θ']
      },
      {
        id: 'maths_ch12',
        chapterNumber: 12,
        title: 'Applications of Trigonometry (Heights & Distances)',
        nativeTitle: 'త్రికోణమితి అనువర్తనాలు',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 3,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 15,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 40,
        lastStudiedDate: 'Never'
      },
      {
        id: 'maths_ch13',
        chapterNumber: 13,
        title: 'Probability & Events',
        nativeTitle: 'సంభావ్యత',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 95,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'maths_ch14',
        chapterNumber: 14,
        title: 'Statistics (Mean, Median, Mode)',
        nativeTitle: 'సాంఖ్యక శాస్త్రం (అంకమధ్యమం, మధ్యగతం, బాహుళకం)',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 20,
        totalPractice: 20,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 50,
        lastStudiedDate: '6 days ago'
      }
    ]
  },
  {
    id: 'physical_science',
    name: 'Physical Science',
    nativeName: 'భౌతిక శాస్త్రం',
    icon: 'Atom',
    color: 'bg-cyan-600',
    bgGradient: 'from-cyan-600 to-teal-700',
    completedPercent: 75,
    chaptersCompleted: 9,
    totalChapters: 12,
    videosCompleted: 24,
    totalVideos: 30,
    notesCompleted: 12,
    totalNotes: 12,
    practiceProgress: 80,
    quizAccuracy: 79,
    studyTimeHours: 36.0,
    boardReadinessScore: 82,
    weakTopics: 'Convex Lens Ray Diagrams & Refraction Formulas',
    lastStudied: 'Yesterday, 4:30 PM',
    chapters: [
      {
        id: 'ps_ch1',
        chapterNumber: 1,
        title: 'Heat & Thermal Energy',
        nativeTitle: 'ఉష్ణము',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'ps_ch2',
        chapterNumber: 2,
        title: 'Chemical Equations & Reactions',
        nativeTitle: 'రసాయనిక సమీకరణాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 18,
        totalPractice: 18,
        quizScore: 86,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '4 days ago'
      },
      {
        id: 'ps_ch3',
        chapterNumber: 3,
        title: 'Reflection of Light at Curved Surfaces',
        nativeTitle: 'వక్రతలాల వద్ద కాంతి పరావర్తనం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 82,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 50,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'ps_ch4',
        chapterNumber: 4,
        title: 'Acids, Bases and Salts',
        nativeTitle: 'ఆమ్లాలు, క్షారాలు మరియు లవణాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 85,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '6 days ago'
      },
      {
        id: 'ps_ch5',
        chapterNumber: 5,
        title: 'Refraction of Light at Plane Surfaces',
        nativeTitle: 'సమతలాల వద్ద కాంతి వక్రీభవనం',
        completionStatus: 'in_progress',
        lessonProgress: 70,
        videosWatched: 2,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 15,
        quizScore: 74,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 45,
        lastStudiedDate: 'Yesterday, 4:30 PM'
      },
      {
        id: 'ps_ch6',
        chapterNumber: 6,
        title: 'Refraction of Light at Curved Surfaces (Lenses)',
        nativeTitle: 'వక్రతలాల వద్ద కాంతి వక్రీభవనం (కటకాలు)',
        completionStatus: 'in_progress',
        lessonProgress: 55,
        videosWatched: 2,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 8,
        totalPractice: 15,
        quizScore: 70,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 50,
        lastStudiedDate: 'Yesterday'
      },
      {
        id: 'ps_ch7',
        chapterNumber: 7,
        title: 'Human Eye & Colourful World',
        nativeTitle: 'మానవుని కన్ను - వర్ణ ప్రపంచం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'ps_ch8',
        chapterNumber: 8,
        title: 'Structure of Atom & Quantum Numbers',
        nativeTitle: 'పరమాణు నిర్మాణం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 84,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'ps_ch9',
        chapterNumber: 9,
        title: 'Classification of Elements - Periodic Table',
        nativeTitle: 'మూలకాల వర్గీకరణ - ఆవర్తన పట్టిక',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'ps_ch10',
        chapterNumber: 10,
        title: 'Chemical Bonding (Ionic & Covalent)',
        nativeTitle: 'రసాయనిక బంధం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 82,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 40,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'ps_ch11',
        chapterNumber: 11,
        title: 'Electric Current & Ohm’s Law',
        nativeTitle: 'విద్యుత్ ప్రవాహం',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 3,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 15,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 50,
        lastStudiedDate: 'Never'
      },
      {
        id: 'ps_ch12',
        chapterNumber: 12,
        title: 'Electromagnetism & Induction',
        nativeTitle: 'విద్యుదయస్కాంతత్వం',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 12,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 45,
        lastStudiedDate: 'Never'
      }
    ]
  },
  {
    id: 'biological_science',
    name: 'Biological Science',
    nativeName: 'జీవ శాస్త్రం',
    icon: 'BookOpen',
    color: 'bg-emerald-600',
    bgGradient: 'from-emerald-600 to-green-700',
    completedPercent: 80,
    chaptersCompleted: 8,
    totalChapters: 10,
    videosCompleted: 22,
    totalVideos: 25,
    notesCompleted: 10,
    totalNotes: 10,
    practiceProgress: 85,
    quizAccuracy: 88,
    studyTimeHours: 31.0,
    boardReadinessScore: 89,
    weakTopics: 'Cellular Respiration & ATP Cycle',
    lastStudied: '2 days ago',
    chapters: [
      {
        id: 'bio_ch1',
        chapterNumber: 1,
        title: 'Nutrition - Food Supplying System',
        nativeTitle: 'పోషణ - ఆహార సరఫరా వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 92,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '2 days ago'
      },
      {
        id: 'bio_ch2',
        chapterNumber: 2,
        title: 'Respiration - Energy Producing System',
        nativeTitle: 'శ్వాసక్రియ - శక్తి ఉత్పాదక వ్యవస్థ',
        completionStatus: 'in_progress',
        lessonProgress: 75,
        videosWatched: 2,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 15,
        quizScore: 80,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 50,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'bio_ch3',
        chapterNumber: 3,
        title: 'Transportation - The Circulatory System',
        nativeTitle: 'ప్రసరణ - పదార్థవాహక వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '4 days ago'
      },
      {
        id: 'bio_ch4',
        chapterNumber: 4,
        title: 'Excretion - The Waste Disposing System',
        nativeTitle: 'విసర్జన - వ్యర్థాల తొలగింపు వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'bio_ch5',
        chapterNumber: 5,
        title: 'Coordination - The Control System (Nervous System)',
        nativeTitle: 'నియంత్రణ - సమన్వయ వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 85,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 50,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'bio_ch6',
        chapterNumber: 6,
        title: 'Reproduction - The Generating System',
        nativeTitle: 'ప్రత్యుత్పత్తి - పునరుత్పాదక వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 50,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'bio_ch7',
        chapterNumber: 7,
        title: 'Coordination in Life Processes',
        nativeTitle: 'జీవ క్రియల్లో సమన్వయం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 86,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'bio_ch8',
        chapterNumber: 8,
        title: 'Heredity - From Parent to Offspring (Genetics)',
        nativeTitle: 'అనువంశికత - తరతరాల తరగని లక్షణాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 84,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'bio_ch9',
        chapterNumber: 9,
        title: 'Our Environment - Our Concern',
        nativeTitle: 'మన పర్యావరణం - మన బాధ్యత',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 35,
        lastStudiedDate: 'Never'
      },
      {
        id: 'bio_ch10',
        chapterNumber: 10,
        title: 'Natural Resources & Conservation',
        nativeTitle: 'సహజ వనరులు - సంరక్షణ',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 35,
        lastStudiedDate: 'Never'
      }
    ]
  },
  {
    id: 'english',
    name: 'English Language',
    nativeName: 'ఇంగ్లీష్ భాష & గ్రాఫికల్ గ్రామర్',
    icon: 'Languages',
    color: 'bg-purple-600',
    bgGradient: 'from-purple-600 to-pink-700',
    completedPercent: 88,
    chaptersCompleted: 7,
    totalChapters: 8,
    videosCompleted: 20,
    totalVideos: 22,
    notesCompleted: 8,
    totalNotes: 8,
    practiceProgress: 90,
    quizAccuracy: 91,
    studyTimeHours: 28.5,
    boardReadinessScore: 92,
    weakTopics: 'Relative Clauses & Formal Letter Writing Format',
    lastStudied: 'Today, 8:00 AM',
    chapters: [
      {
        id: 'eng_ch1',
        chapterNumber: 1,
        title: 'Personality Development (Attitude is Altitude)',
        nativeTitle: 'యూనిట్ 1: పర్సనాలిటీ డెవలప్‌మెంట్',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 95,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: 'Today, 8:00 AM'
      },
      {
        id: 'eng_ch2',
        chapterNumber: 2,
        title: 'Wit and Humour (The Dear Departed Play)',
        nativeTitle: 'యూనిట్ 2: హాస్యం మరియు నాటకం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'eng_ch3',
        chapterNumber: 3,
        title: 'Human Relations (The Journey Narrative)',
        nativeTitle: 'యూనిట్ 3: మానవ సంబంధాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'eng_ch4',
        chapterNumber: 4,
        title: 'Films and Theatre (Rendezvous with Ray)',
        nativeTitle: 'యూనిట్ 4: సినిమా మరియు థియేటర్',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 92,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'eng_ch5',
        chapterNumber: 5,
        title: 'Social Issues (A Havoc of Tsunami)',
        nativeTitle: 'యూనిట్ 5: సామాజిక సమస్యలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'eng_ch6',
        chapterNumber: 6,
        title: 'Bio-Diversity & Environmental Awareness',
        nativeTitle: 'యూనిట్ 6: జీవ వైవిధ్యం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 86,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'eng_ch7',
        chapterNumber: 7,
        title: 'Nation and Heritage (My Childhood - Dr. APJ Abdul Kalam)',
        nativeTitle: 'యూనిట్ 7: దే శసంస్కృతి - ఎపిజె అబ్దుల్ కలాం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 94,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'eng_ch8',
        chapterNumber: 8,
        title: 'Human Rights & Grammar Drills (Jamaica Fragment)',
        nativeTitle: 'యూనిట్ 8: మానవ హక్కులు మరియు వ్యాకరణం',
        completionStatus: 'in_progress',
        lessonProgress: 40,
        videosWatched: 2,
        totalVideos: 5,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 5,
        totalPractice: 20,
        quizScore: 78,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 45,
        lastStudiedDate: 'Yesterday'
      }
    ]
  },
  {
    id: 'hindi',
    name: 'Hindi Language',
    nativeName: 'द्वितीय भाषा - हिंदी साहित्य एवं व्याकरण',
    icon: 'Languages',
    color: 'bg-rose-600',
    bgGradient: 'from-rose-600 to-red-700',
    completedPercent: 90,
    chaptersCompleted: 7,
    totalChapters: 8,
    videosCompleted: 18,
    totalVideos: 20,
    notesCompleted: 8,
    totalNotes: 8,
    practiceProgress: 92,
    quizAccuracy: 94,
    studyTimeHours: 26.0,
    boardReadinessScore: 95,
    weakTopics: 'संधि-विच्छेद एवं समास (Hindi Grammar)',
    lastStudied: 'Yesterday, 11:00 AM',
    chapters: [
      {
        id: 'hin_ch1',
        chapterNumber: 1,
        title: 'ईदगाह (मुंशी प्रेमचंद)',
        nativeTitle: 'పాఠం 1: ఈద్గాహ్ (ప్రేమ్‌చంద్)',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 98,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: 'Yesterday'
      },
      {
        id: 'hin_ch2',
        chapterNumber: 2,
        title: 'दोहे (कबीर एवं रहीम)',
        nativeTitle: 'పాఠం 2: కబీర్ & రహీమ్ దోహాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 95,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'hin_ch3',
        chapterNumber: 3,
        title: 'बरसते बादल (सुमित्रानंदन पंत)',
        nativeTitle: 'పాఠం 3: బరసతే బాదల్ (కవిత)',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 92,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '4 days ago'
      },
      {
        id: 'hin_ch4',
        chapterNumber: 4,
        title: 'कण-कण का अधिकारी (रामधारी सिंह दिनकर)',
        nativeTitle: 'పాఠం 4: కణ్-కణ్ కా అధికారీ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'hin_ch5',
        chapterNumber: 5,
        title: 'लोकगीत (भगवतशरण उपाध्याय)',
        nativeTitle: 'పాఠం 5: జానపద గేయాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 94,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'hin_ch6',
        chapterNumber: 6,
        title: 'अंतरराष्ट्रीय स्तर पर हिंदी',
        nativeTitle: 'పాఠం 6: ప్రపంచ స్థాయిలో హిందీ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 92,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'hin_ch7',
        chapterNumber: 7,
        title: 'भक्ति पद (मीराबाई एवं सूरदास)',
        nativeTitle: 'పాఠం 7: భక్తి పదాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 96,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'hin_ch8',
        chapterNumber: 8,
        title: 'स्वदेशी एवं व्यावहारिक व्याकरण',
        nativeTitle: 'పాఠం 8: స్వదేశీ & వ్యాకరణం',
        completionStatus: 'in_progress',
        lessonProgress: 50,
        videosWatched: 2,
        totalVideos: 4,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 8,
        totalPractice: 15,
        quizScore: 82,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 40,
        lastStudiedDate: 'Yesterday'
      }
    ]
  },
  {
    id: 'social_studies',
    name: 'Social Studies',
    nativeName: 'సాంఘిక శాస్త్రం (భూగోళ, చరిత్ర, ఆర్థిక, పౌరశాస్త్రం)',
    icon: 'Globe',
    color: 'bg-amber-600',
    bgGradient: 'from-amber-600 to-orange-700',
    completedPercent: 65,
    chaptersCompleted: 13,
    totalChapters: 20,
    videosCompleted: 26,
    totalVideos: 40,
    notesCompleted: 15,
    totalNotes: 20,
    practiceProgress: 70,
    quizAccuracy: 76,
    studyTimeHours: 38.0,
    boardReadinessScore: 78,
    weakTopics: 'Monsoon Wind Currents, Climate Maps & WW1 Events',
    lastStudied: '3 days ago',
    chapters: [
      {
        id: 'soc_ch1',
        chapterNumber: 1,
        title: 'India: Relief Features & Geography',
        nativeTitle: 'భారతదేశ నైసర్గిక స్వరూపాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 15,
        totalPractice: 15,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'soc_ch2',
        chapterNumber: 2,
        title: 'Ideas of Development & HDI',
        nativeTitle: 'అభివృద్ధి భావనలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 82,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '4 days ago'
      },
      {
        id: 'soc_ch3',
        chapterNumber: 3,
        title: 'Production and Employment in India',
        nativeTitle: 'ఉత్పత్తి మరియు ఉపాధి',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 80,
        aiRevisionStatus: 'Revision Due',
        masteryLevel: 'Proficient',
        estimatedMinutes: 40,
        lastStudiedDate: '5 days ago'
      },
      {
        id: 'soc_ch4',
        chapterNumber: 4,
        title: 'Climate of India & Monsoon Maps',
        nativeTitle: 'భారతదేశ వాతావరణం మరియు రుతుపవనాలు',
        completionStatus: 'in_progress',
        lessonProgress: 60,
        videosWatched: 2,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 8,
        totalPractice: 15,
        quizScore: 70,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 50,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'soc_ch5',
        chapterNumber: 5,
        title: 'Indian Rivers & Water Resources',
        nativeTitle: 'భారతదేశ నదులు మరియు నీటి వనరులు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 85,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'soc_ch6',
        chapterNumber: 6,
        title: 'The People & Population Dynamics',
        nativeTitle: 'జనాభా మరియు మానవ వనరులు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 84,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '1 week ago'
      },
      {
        id: 'soc_ch7',
        chapterNumber: 7,
        title: 'Settlements - People and Places',
        nativeTitle: 'నివాస ప్రాంతాలు - ప్రదేశాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 80,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'soc_ch8',
        chapterNumber: 8,
        title: 'Rampur: A Village Economy',
        nativeTitle: 'గ్రామీణ ఆర్థిక వ్యవస్థ - రాంపూర్',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 88,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'soc_ch9',
        chapterNumber: 9,
        title: 'Globalization & Indian Economy',
        nativeTitle: 'ప్రపంచీకరణ మరియు భారత ఆర్థిక వ్యవస్థ',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 82,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '2 weeks ago'
      },
      {
        id: 'soc_ch10',
        chapterNumber: 10,
        title: 'Food Security in India',
        nativeTitle: 'ఆహార భద్రత',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 86,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '3 weeks ago'
      },
      {
        id: 'soc_ch11',
        chapterNumber: 11,
        title: 'Sustainable Development with Equity',
        nativeTitle: 'సుస్థిర అభివృద్ధి',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 80,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 35,
        lastStudiedDate: '3 weeks ago'
      },
      {
        id: 'soc_ch12',
        chapterNumber: 12,
        title: 'World Between the World Wars (1900-1950)',
        nativeTitle: 'ప్రపంచ యుద్ధాల మధ్య ప్రపంచం',
        completionStatus: 'in_progress',
        lessonProgress: 50,
        videosWatched: 2,
        totalVideos: 4,
        notesRead: 1,
        totalNotes: 2,
        practiceSolved: 8,
        totalPractice: 20,
        quizScore: 72,
        aiRevisionStatus: 'Needs Practice',
        masteryLevel: 'Proficient',
        estimatedMinutes: 55,
        lastStudiedDate: '3 days ago'
      },
      {
        id: 'soc_ch13',
        chapterNumber: 13,
        title: 'National Liberation Movements in Colonies',
        nativeTitle: 'కాలనిల్లో స్వాతంత్ర్య పోరాటాలు',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 2,
        totalVideos: 2,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 10,
        totalPractice: 10,
        quizScore: 84,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 40,
        lastStudiedDate: '3 weeks ago'
      },
      {
        id: 'soc_ch14',
        chapterNumber: 14,
        title: 'The Making of Independent India’s Constitution',
        nativeTitle: 'భారత రాజ్యాంగ నిర్మాణం',
        completionStatus: 'completed',
        lessonProgress: 100,
        videosWatched: 3,
        totalVideos: 3,
        notesRead: 1,
        totalNotes: 1,
        practiceSolved: 12,
        totalPractice: 12,
        quizScore: 90,
        aiRevisionStatus: 'Mastered',
        masteryLevel: 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: '3 weeks ago'
      },
      {
        id: 'soc_ch15',
        chapterNumber: 15,
        title: 'The Election Process in India',
        nativeTitle: 'భారత్‌లో ఎన్నికల ప్రక్రియ',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 35,
        lastStudiedDate: 'Never'
      },
      {
        id: 'soc_ch16',
        chapterNumber: 16,
        title: 'Post-World War II Era and Cold War',
        nativeTitle: 'రెండో ప్రపంచ యుద్ధానంతర ప్రపంచం',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 40,
        lastStudiedDate: 'Never'
      },
      {
        id: 'soc_ch17',
        chapterNumber: 17,
        title: 'Social Movements in Modern Times',
        nativeTitle: 'ఆధునిక యుగంలో సామాజిక ఉద్యమాలు',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 40,
        lastStudiedDate: 'Never'
      },
      {
        id: 'soc_ch18',
        chapterNumber: 18,
        title: 'The Movement for the Formation of Telangana State',
        nativeTitle: 'తెలంగాణ రాష్ట్ర సాధన ఉద్యమం',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 3,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 15,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 45,
        lastStudiedDate: 'Never'
      },
      {
        id: 'soc_ch19',
        chapterNumber: 19,
        title: 'Disaster Management & Preparedness',
        nativeTitle: 'విపత్తు నిర్వహణ',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 2,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 10,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 35,
        lastStudiedDate: 'Never'
      },
      {
        id: 'soc_ch20',
        chapterNumber: 20,
        title: 'Traffic Education & Civic Awareness',
        nativeTitle: 'ట్రాఫిక్ విద్య మరియు పౌర అవగాహన',
        completionStatus: 'not_started',
        lessonProgress: 0,
        videosWatched: 0,
        totalVideos: 1,
        notesRead: 0,
        totalNotes: 1,
        practiceSolved: 0,
        totalPractice: 5,
        quizScore: 0,
        aiRevisionStatus: 'Not Started',
        masteryLevel: 'Novice',
        estimatedMinutes: 25,
        lastStudiedDate: 'Never'
      }
    ]
  }
];

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  userId,
  selectedLang,
  studentClassGrade = 'Class 10',
  onAddXp = (_xp: number) => {},
  onAddCoins = (_coins: number) => {},
  onLaunchTutor
}) => {
  const activeGradeKey = normalizeGradeKey(studentClassGrade);

  // Build initial list based on student's class grade from OFFICIAL_SYLLABUS_BY_CLASS
  const initialClassSubjects = useMemo(() => {
    const officialSubs = OFFICIAL_SYLLABUS_BY_CLASS[activeGradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];

    if (!officialSubs || officialSubs.length === 0) return INITIAL_CLASS10_SYLLABUS;

    return officialSubs.map((sub, sIdx) => ({
      id: sub.id,
      name: sub.name,
      nativeName: sub.nativeName,
      icon: sub.icon || 'BookOpen',
      color: sub.color || 'bg-blue-600',
      bgGradient: 'from-blue-600 to-indigo-700',
      completedPercent: Math.min(100, Math.max(10, 80 - sIdx * 8)),
      chaptersCompleted: Math.max(1, Math.floor((sub.chapters?.length || 6) * 0.6)),
      totalChapters: sub.chapters?.length || 6,
      videosCompleted: Math.max(2, Math.floor((sub.chapters?.length || 6) * 1.5)),
      totalVideos: (sub.chapters?.length || 6) * 2,
      notesCompleted: Math.max(1, Math.floor(sub.chapters?.length || 6)),
      totalNotes: sub.chapters?.length || 6,
      practiceProgress: 75,
      quizAccuracy: 82,
      studyTimeHours: 24.5,
      boardReadinessScore: Math.min(95, Math.max(60, 88 - sIdx * 3)),
      weakTopics: `${sub.name} Core Practice Concepts`,
      lastStudied: 'Today',
      chapters: (sub.chapters || []).map((chap) => ({
        id: chap.id,
        chapterNumber: chap.chapterNumber,
        title: chap.title,
        nativeTitle: chap.nativeTitle,
        completionStatus: (chap.chapterNumber <= 2 ? 'completed' : chap.chapterNumber === 3 ? 'in_progress' : 'not_started') as 'completed' | 'in_progress' | 'not_started',
        lessonProgress: chap.chapterNumber <= 2 ? 100 : chap.chapterNumber === 3 ? 50 : 0,
        videosWatched: chap.chapterNumber <= 2 ? 2 : 0,
        totalVideos: 2,
        notesRead: chap.chapterNumber <= 2 ? 1 : 0,
        totalNotes: 1,
        practiceSolved: chap.chapterNumber <= 2 ? 10 : 0,
        totalPractice: 10,
        quizScore: chap.chapterNumber <= 2 ? 85 : 0,
        aiRevisionStatus: (chap.chapterNumber <= 2 ? 'Mastered' : chap.chapterNumber === 3 ? 'Needs Practice' : 'Not Started') as 'Mastered' | 'Revision Due' | 'Needs Practice' | 'Not Started',
        masteryLevel: (chap.chapterNumber <= 2 ? 'Master' : chap.chapterNumber === 3 ? 'Proficient' : 'Novice') as 'Novice' | 'Proficient' | 'Master',
        estimatedMinutes: 45,
        lastStudiedDate: chap.chapterNumber <= 2 ? 'Yesterday' : 'Never'
      }))
    }));
  }, [studentClassGrade]);

  const [subjectsList, setSubjectsList] = useState<DetailedSyllabusSubject[]>(initialClassSubjects);

  useEffect(() => {
    setSubjectsList(initialClassSubjects);
  }, [initialClassSubjects]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'needs_revision'>('all');
  const [selectedChapterForHub, setSelectedChapterForHub] = useState<{ subject: Subject; chapter: Chapter } | null>(null);
  const [selectedChapterForRoadmap, setSelectedChapterForRoadmap] = useState<{ subject: DetailedSyllabusSubject; chapter: DetailedChapterData } | null>(null);
  const [roadmapViewMode, setRoadmapViewMode] = useState<'path' | 'list'>('path');

  // Firestore Real-time Subscriptions
  useEffect(() => {
    // 1. Subscribe to Teacher CMS published items
    const unsubCms = subscribeToCmsItems((items) => {
      if (items && items.length > 0) {
        setCmsItems(items as CMSItem[]);
      } else {
        setCmsItems(INITIAL_CMS_ITEMS);
      }
    });

    // 2. Subscribe to user's chapter progress records in Firestore
    const unsubChapProgress = subscribeToChapterProgress(userId, (records) => {
      if (Object.keys(records).length > 0) {
        setSubjectsList((prevSubjects) => {
          return prevSubjects.map((sub) => {
            let chapsCompletedCount = 0;
            let sumQuizScore = 0;
            let quizCount = 0;

            const updatedChapters = sub.chapters.map((chap) => {
              const userRec = records[chap.id];
              if (userRec) {
                const isComp = userRec.completionStatus === 'completed' || userRec.lessonProgress === 100;
                if (isComp) chapsCompletedCount++;
                if (userRec.quizScore > 0) {
                  sumQuizScore += userRec.quizScore;
                  quizCount++;
                }

                return {
                  ...chap,
                  completionStatus: userRec.completionStatus || chap.completionStatus,
                  lessonProgress: userRec.lessonProgress ?? chap.lessonProgress,
                  videosWatched: userRec.videosWatched ?? chap.videosWatched,
                  notesRead: userRec.notesRead ?? chap.notesRead,
                  practiceSolved: userRec.practiceSolved ?? chap.practiceSolved,
                  quizScore: userRec.quizScore ?? chap.quizScore,
                  aiRevisionStatus: userRec.aiRevisionStatus || chap.aiRevisionStatus,
                  masteryLevel: userRec.masteryLevel || chap.masteryLevel,
                  lastStudiedDate: userRec.lastStudiedDate || chap.lastStudiedDate
                };
              }
              if (chap.completionStatus === 'completed') chapsCompletedCount++;
              if (chap.quizScore > 0) {
                sumQuizScore += chap.quizScore;
                quizCount++;
              }
              return chap;
            });

            const overallPct = Math.round((chapsCompletedCount / (sub.totalChapters || 1)) * 100);
            const avgQuiz = quizCount > 0 ? Math.round(sumQuizScore / quizCount) : sub.quizAccuracy;

            return {
              ...sub,
              completedPercent: overallPct,
              chaptersCompleted: chapsCompletedCount,
              quizAccuracy: avgQuiz,
              chapters: updatedChapters
            };
          });
        });
      }
    });

    // 3. Subscribe to user's topic progress records in Firestore
    const unsubTopicProgress = subscribeToStudentTopicProgress(userId, (topicsMap) => {
      if (Object.keys(topicsMap).length > 0) {
        setSubjectsList((prevSubjects) => {
          return prevSubjects.map((sub) => {
            const updatedChapters = sub.chapters.map((chap) => {
              // check if any topic in topicsMap matches this chapter
              const completedTopicsInChap = Object.values(topicsMap).filter(
                t => (t.chapterId === chap.id || t.subjectId === sub.id) && t.completed
              );
              if (completedTopicsInChap.length > 0) {
                return {
                  ...chap,
                  completionStatus: 'completed' as const,
                  lessonProgress: 100,
                  aiRevisionStatus: 'Mastered' as const,
                  masteryLevel: 'Master' as const
                };
              }
              return chap;
            });

            const completedChaps = updatedChapters.filter(c => c.completionStatus === 'completed').length;
            const pct = Math.round((completedChaps / (sub.totalChapters || 1)) * 100);

            return {
              ...sub,
              completedPercent: Math.max(sub.completedPercent, pct),
              chaptersCompleted: Math.max(sub.chaptersCompleted, completedChaps),
              chapters: updatedChapters
            };
          });
        });
      }
    });

    return () => {
      unsubCms();
      unsubChapProgress();
      unsubTopicProgress();
    };
  }, [userId]);

  // Compute overall class 10 syllabus metrics across all 6 subjects
  const overallSyllabusPercent = Math.round(
    subjectsList.reduce((acc, sub) => acc + sub.completedPercent, 0) / (subjectsList.length || 1)
  );

  const totalChaptersCount = subjectsList.reduce((acc, sub) => acc + sub.totalChapters, 0);
  const totalCompletedChaptersCount = subjectsList.reduce((acc, sub) => acc + sub.chaptersCompleted, 0);
  const overallBoardReadinessIndex = Math.round(
    subjectsList.reduce((acc, sub) => acc + sub.boardReadinessScore, 0) / (subjectsList.length || 1)
  );

  // Get currently active subject
  const currentSubject = subjectsList.find((s) => s.id === selectedSubjectId) || null;

  // Helper to map Subject Icons
  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-6 h-6 text-white" />;
      case 'Atom': return <Atom className="w-6 h-6 text-white" />;
      case 'Globe': return <Globe className="w-6 h-6 text-white" />;
      case 'Languages': return <Languages className="w-6 h-6 text-white" />;
      default: return <BookOpen className="w-6 h-6 text-white" />;
    }
  };

  // Get CMS items published for a specific chapter
  const getCmsForChapter = (subjectName: string, chapterTitle: string) => {
    return cmsItems.filter(
      (item) =>
        item.status === 'Published' &&
        (item.subject === subjectName || subjectName.toLowerCase().includes(item.subject.toLowerCase()) || item.subject === 'All Subjects') &&
        (!item.chapter || item.chapter === chapterTitle || chapterTitle.toLowerCase().includes(item.chapter.toLowerCase()))
    );
  };

  // Handle marking a chapter complete
  const handleMarkChapterCompleted = async (subjectId: string, chap: DetailedChapterData) => {
    soundFx.playSuccess();
    const newRecord: ChapterProgressRecord = {
      chapterId: chap.id,
      subjectName: subjectsList.find((s) => s.id === subjectId)?.name || 'Subject',
      chapterNumber: chap.chapterNumber,
      chapterTitle: chap.title,
      nativeTitle: chap.nativeTitle,
      completionStatus: 'completed',
      lessonProgress: 100,
      videosWatched: chap.totalVideos,
      totalVideos: chap.totalVideos,
      notesRead: chap.totalNotes,
      totalNotes: chap.totalNotes,
      practiceSolved: chap.totalPractice,
      totalPractice: chap.totalPractice,
      quizScore: chap.quizScore || 85,
      aiRevisionStatus: 'Mastered',
      masteryLevel: 'Master',
      estimatedMinutes: chap.estimatedMinutes,
      lastStudiedDate: 'Just now'
    };

    onAddXp(100);
    onAddCoins(25);

    // Save to Firestore
    await updateChapterProgressInFirestore(userId, newRecord);
  };

  // If student opened Chapter Sub-Roadmap view
  if (selectedChapterForRoadmap) {
    return (
      <div className="animate-fade-in">
        <ChapterSubRoadmapView
          userId={userId}
          subjectName={selectedChapterForRoadmap.subject.name}
          chapter={selectedChapterForRoadmap.chapter}
          studentClassGrade={studentClassGrade}
          cmsItems={cmsItems}
          onBack={() => {
            soundFx.playClick();
            setSelectedChapterForRoadmap(null);
          }}
          onCompleteChapter={() => {
            handleMarkChapterCompleted(selectedChapterForRoadmap.subject.id, selectedChapterForRoadmap.chapter);
            setSelectedChapterForRoadmap(null);
          }}
          onAddXp={onAddXp}
          onAddCoins={onAddCoins}
          onLaunchTutor={onLaunchTutor}
        />
      </div>
    );
  }

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
      
      {/* 1. Header Hero Roadmap Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
                <Compass className="w-8 h-8 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                    {activeGradeKey} State Board (SSC)
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                    Live Firestore Synced
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {activeGradeKey} Complete Syllabus & Exam Roadmap
                </h1>
                <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                  Chapter-wise progression, videos, notes, worksheets, AI revisions & board readiness tracker.
                </p>
              </div>
            </div>

            {/* Board Exam Readiness Index Badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>Board Readiness Score</span>
              </div>
              <span className="text-3xl font-black text-white">{overallBoardReadinessIndex}%</span>
              <div className="w-full bg-black/30 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${overallBoardReadinessIndex}%` }}
                />
              </div>
              <span className="text-[10px] text-sky-200 mt-1 block font-extrabold">
                {overallBoardReadinessIndex >= 85 ? '🌟 Exam Ready (A1 Grade)' : overallBoardReadinessIndex >= 70 ? '📈 On Track for Distinction' : '⚠️ Practice Needed'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-extrabold text-sky-200 uppercase block">Overall Syllabus</span>
              <span className="text-lg font-black text-white">{overallSyllabusPercent}% Complete</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-extrabold text-sky-200 uppercase block">Chapters Finished</span>
              <span className="text-lg font-black text-emerald-300">{totalCompletedChaptersCount} / {totalChaptersCount}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-extrabold text-sky-200 uppercase block">Total Study Time</span>
              <span className="text-lg font-black text-amber-300">
                {subjectsList.reduce((acc, s) => acc + s.studyTimeHours, 0).toFixed(1)} Hours
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-extrabold text-sky-200 uppercase block">Teacher CMS Uploads</span>
              <span className="text-lg font-black text-purple-300">{cmsItems.length} Resources Live</span>
            </div>
          </div>

          {/* Search & Navigation Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search subject, chapter name, formulas, or topics e.g. 'Quadratic' or 'Trigonometry'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 dark:bg-slate-950/60 border border-white/20 text-xs text-white placeholder-sky-200/60 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {selectedSubjectId && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedSubjectId(null);
                }}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl backdrop-blur transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>All 6 Core Subjects</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUBJECT CHAPTER DRILL-DOWN VIEW (When a subject is selected) */}
      {currentSubject ? (
        <div className="space-y-6">
          
          {/* Selected Subject Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentSubject.bgGradient}`}>
                  {renderSubjectIcon(currentSubject.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {activeGradeKey} State Syllabus
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Last studied: {currentSubject.lastStudied}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {currentSubject.name} Syllabus Roadmap
                  </h2>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {currentSubject.nativeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLaunchTutor?.(currentSubject.name)}
                  className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Tutor for {currentSubject.name}</span>
                </button>
              </div>
            </div>

            {/* Subject Level Progress Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Syllabus Completion</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{currentSubject.completedPercent}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Chapters Finished</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {currentSubject.chaptersCompleted} / {currentSubject.totalChapters}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Videos Watched</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {currentSubject.videosCompleted} / {currentSubject.totalVideos}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Quiz Accuracy</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400">{currentSubject.quizAccuracy}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Board Readiness</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{currentSubject.boardReadinessScore}%</span>
              </div>
            </div>

            {currentSubject.weakTopics && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between font-bold">
                <span>⚠️ AI Identified High-Priority Revision: {currentSubject.weakTopics}</span>
                <button
                  onClick={() => onLaunchTutor?.(currentSubject.name, currentSubject.weakTopics)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-xl transition cursor-pointer"
                >
                  Generate AI Revision Drill
                </button>
              </div>
            )}
          </div>

          {/* Chapter Wise Detailed Breakdown List or Roadmap Path */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
                  <span>{currentSubject.name} Learning Roadmap ({currentSubject.chapters.length} Chapters)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Hierarchy: Board → Class 10 → {currentSubject.name} → Chapter Roadmap → Lesson Sub-Nodes
                </p>
              </div>

              {/* View Switcher & Chapter Filter Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setRoadmapViewMode('path');
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      roadmapViewMode === 'path'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Roadmap Path</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setRoadmapViewMode('list');
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      roadmapViewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Detailed Cards</span>
                  </button>
                </div>

                {/* Filter Status Pills */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(['all', 'completed', 'in_progress', 'needs_revision'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg capitalize transition cursor-pointer ${
                        filterStatus === st ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ROADMAP PATH VIEW MODE */}
            {roadmapViewMode === 'path' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      Sequential Board Recommended Chapter Order
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl">
                    100% AP SSC Board Syllabus Aligned
                  </span>
                </div>

                <div className="relative max-w-4xl mx-auto py-6">
                  {/* Central Curved Connection Line */}
                  <div className="absolute left-1/2 top-12 bottom-12 w-1.5 bg-gradient-to-b from-blue-600 via-indigo-600 to-emerald-500 -translate-x-1/2 hidden md:block rounded-full opacity-30" />

                  <div className="space-y-12 relative z-10">
                    {currentSubject.chapters
                      .filter((ch) => {
                        if (filterStatus === 'completed') return ch.completionStatus === 'completed';
                        if (filterStatus === 'in_progress') return ch.completionStatus === 'in_progress';
                        if (filterStatus === 'needs_revision') return ch.aiRevisionStatus === 'Revision Due' || ch.aiRevisionStatus === 'Needs Practice';
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          return ch.title.toLowerCase().includes(q) || (ch.nativeTitle && ch.nativeTitle.toLowerCase().includes(q));
                        }
                        return true;
                      })
                      .map((chap, idx) => {
                        const isEven = idx % 2 === 0;
                        const isCompleted = chap.completionStatus === 'completed';
                        const isInProgress = chap.completionStatus === 'in_progress';

                        return (
                          <div
                            key={chap.id}
                            className={`flex flex-col md:flex-row items-center justify-between gap-6 ${
                              isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                            }`}
                          >
                            {/* Chapter Node Card */}
                            <div className={`w-full md:w-[46%] p-6 rounded-3xl border transition-all duration-300 shadow-xl space-y-4 hover:scale-[1.02] ${
                              isCompleted
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                                : isInProgress
                                ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-700 shadow-blue-500/10 ring-2 ring-blue-500/30'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
                                    isCompleted
                                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                                      : isInProgress
                                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    Chapter {chap.chapterNumber}
                                  </span>

                                  <span className="text-[10px] font-bold text-slate-400">
                                    Est. {chap.estimatedMinutes} mins
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" /> {chap.masteryLevel}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                                  {chap.title}
                                </h4>
                                {chap.nativeTitle && (
                                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                    {chap.nativeTitle}
                                  </p>
                                )}
                              </div>

                              {/* Progress bar inside card */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-500">Lesson Progress</span>
                                  <span className="text-blue-600 dark:text-blue-400">{chap.lessonProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${chap.lessonProgress}%` }}
                                  />
                                </div>
                              </div>

                              {/* 13-Step Sub-Nodes Teaser Badges */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-slate-500">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Intro</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Objectives</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Topics 1-3</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Examples</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">PYQs</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Quiz</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">AI Revision</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                                <button
                                  onClick={() => {
                                    soundFx.playClick();
                                    setSelectedChapterForRoadmap({ subject: currentSubject, chapter: chap });
                                  }}
                                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-white" />
                                  <span>Open Chapter 13-Step Roadmap</span>
                                </button>
                              </div>
                            </div>

                            {/* Node Center Badge */}
                            <div className="shrink-0 relative z-20">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-lg shadow-2xl border-4 transition-transform hover:scale-110 cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 border-white dark:border-slate-900 shadow-emerald-500/40'
                                  : isInProgress
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-white dark:border-slate-900 shadow-blue-500/40 animate-pulse'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedChapterForRoadmap({ subject: currentSubject, chapter: chap });
                              }}>
                                {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : `Ch ${chap.chapterNumber}`}
                              </div>
                            </div>

                            {/* Opposite side spacer */}
                            <div className="hidden md:block w-[46%]" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Chapters List Cards */}
            {roadmapViewMode === 'list' && (
              <div className="space-y-4">
              {currentSubject.chapters
                .filter((ch) => {
                  if (filterStatus === 'completed') return ch.completionStatus === 'completed';
                  if (filterStatus === 'in_progress') return ch.completionStatus === 'in_progress';
                  if (filterStatus === 'needs_revision') return ch.aiRevisionStatus === 'Revision Due' || ch.aiRevisionStatus === 'Needs Practice';
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return ch.title.toLowerCase().includes(q) || (ch.nativeTitle && ch.nativeTitle.toLowerCase().includes(q));
                  }
                  return true;
                })
                .map((chap) => {
                  const chapCms = getCmsForChapter(currentSubject.name, chap.title);
                  return (
                    <div
                      key={chap.id}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition group"
                    >
                      {/* Chapter Header Line */}
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                            chap.completionStatus === 'completed'
                              ? 'bg-emerald-500 text-slate-950'
                              : chap.completionStatus === 'in_progress'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {chap.completionStatus === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : `Ch ${chap.chapterNumber}`}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
                                chap.completionStatus === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : chap.completionStatus === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {chap.completionStatus === 'completed' ? 'Completed' : chap.completionStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </span>

                              {/* AI Revision Badge */}
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
                                chap.aiRevisionStatus === 'Mastered'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : chap.aiRevisionStatus === 'Revision Due'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : chap.aiRevisionStatus === 'Needs Practice'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                AI Status: {chap.aiRevisionStatus}
                              </span>

                              {/* Mastery Level Badge */}
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-400" />
                                {chap.masteryLevel}
                              </span>

                              {chapCms.length > 0 && (
                                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                                  {chapCms.length} Teacher Uploads
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                              Chapter {chap.chapterNumber}: {chap.title}
                            </h4>
                            {chap.nativeTitle && (
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {chap.nativeTitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {chap.completionStatus !== 'completed' && (
                            <button
                              onClick={() => handleMarkChapterCompleted(currentSubject.id, chap)}
                              className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs rounded-xl transition cursor-pointer"
                            >
                              Mark Completed (+100 XP)
                            </button>
                          )}

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedChapterForHub({
                                subject: {
                                  id: currentSubject.id,
                                  name: currentSubject.name,
                                  nativeName: currentSubject.nativeName,
                                  icon: currentSubject.icon,
                                  color: '#2563eb',
                                  bgGradient: currentSubject.bgGradient,
                                  completedPercent: currentSubject.completedPercent,
                                  chaptersCount: currentSubject.totalChapters
                                },
                                chapter: {
                                  id: chap.id,
                                  chapterNumber: chap.chapterNumber,
                                  title: chap.title,
                                  nativeTitle: chap.nativeTitle,
                                  topicsCount: 5,
                                  estimatedMinutes: chap.estimatedMinutes,
                                  completed: chap.completionStatus === 'completed',
                                  keyFormulas: chap.keyFormulas
                                }
                              });
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Launch Chapter Learning Hub</span>
                          </button>
                        </div>
                      </div>

                      {/* Detailed Metric Progress Bars */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                        {/* 1. Lesson Progress */}
                        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500">Lesson Progress</span>
                            <span className="text-blue-600 dark:text-blue-400">{chap.lessonProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${chap.lessonProgress}%` }} />
                          </div>
                        </div>

                        {/* 2. Video Progress */}
                        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Video className="w-3 h-3 text-rose-500" /> Video Tutorials
                            </span>
                            <span className="text-rose-600 dark:text-rose-400">
                              {chap.videosWatched}/{chap.totalVideos}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-rose-500 h-full rounded-full" 
                              style={{ width: `${Math.round((chap.videosWatched / (chap.totalVideos || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* 3. Notes & Worksheets */}
                        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-sky-500" /> PDF & PPT Notes
                            </span>
                            <span className="text-sky-600 dark:text-sky-400">
                              {chap.notesRead}/{chap.totalNotes} Read
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-sky-500 h-full rounded-full" 
                              style={{ width: `${Math.round((chap.notesRead / (chap.totalNotes || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* 4. Quiz Score */}
                        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-purple-500" /> Quiz Accuracy
                            </span>
                            <span className="text-purple-600 dark:text-purple-400">
                              {chap.quizScore > 0 ? `${chap.quizScore}%` : 'Not Taken'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${chap.quizScore}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Key Formulas or Formulas Badge */}
                      {chap.keyFormulas && chap.keyFormulas.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex flex-wrap items-center gap-2">
                          <span className="font-black flex items-center gap-1 text-amber-700 dark:text-amber-300">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Key Formulas:
                          </span>
                          {chap.keyFormulas.map((f, i) => (
                            <span key={i} className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300/40 font-mono text-[10px] font-bold">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Info & Quick AI Drill */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Est. Time: {chap.estimatedMinutes} mins
                          </span>
                          <span>Last studied: {chap.lastStudiedDate}</span>
                        </div>

                        <button
                          onClick={() => onLaunchTutor?.(currentSubject.name, chap.title)}
                          className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI Chapter Revision Drill</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
            </div>
            )}
          </div>

        </div>
      ) : (
        /* 3. ALL 6 SUBJECTS OVERVIEW GRID */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {activeGradeKey} Core Board Examination Subjects ({subjectsList.length} Subjects)
              </h2>
              <p className="text-xs text-slate-500">
                Official SCERT Board {activeGradeKey} Curriculum & Real-time Progress Tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectsList
              .filter((sub) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return sub.name.toLowerCase().includes(q) || (sub.nativeName && sub.nativeName.toLowerCase().includes(q));
              })
              .map((sub) => {
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSubjectId(sub.id);
                    }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${sub.bgGradient}`}>
                          {renderSubjectIcon(sub.icon)}
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl block">
                            {sub.completedPercent}% Complete
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                            Readiness: {sub.boardReadinessScore}%
                          </span>
                        </div>
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

                      {/* Main Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-sky-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${sub.completedPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Chapters: {sub.chaptersCompleted}/{sub.totalChapters}</span>
                          <span>Quiz Avg: {sub.quizAccuracy}%</span>
                        </div>
                      </div>

                      {/* Quick Resource Breakdown Pills */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500 pt-1">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                          <span>Videos:</span>
                          <span className="text-rose-600 font-extrabold">{sub.videosCompleted}/{sub.totalVideos}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                          <span>Notes:</span>
                          <span className="text-sky-600 font-extrabold">{sub.notesCompleted}/{sub.totalNotes}</span>
                        </div>
                      </div>

                      {sub.weakTopics && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 font-extrabold truncate">
                          Focus: {sub.weakTopics}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                      <span>Explore Chapter Roadmap</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. Real-time Teacher CMS Live Uploads Widget */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Live Teacher CMS Resources linked to Class 10 Syllabus
              </h3>
              <p className="text-[11px] text-slate-400">
                Uploaded by school teachers and auto-synced to corresponding subject chapters
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
            {cmsItems.filter(i => i.status === 'Published').length} Live Files
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
                  <span className="text-blue-600 font-extrabold cursor-pointer">View Resource</span>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
