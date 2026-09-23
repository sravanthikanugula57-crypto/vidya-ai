import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TypewriterEffect } from '../common/TypewriterEffect';
import { Modern3DCard } from '../common/3d/Modern3DCard';
import { ThreeDSubjectIcon } from '../common/3d/ThreeDSubjectIcon';
import { ThreeDAssistantOrb } from '../common/3d/ThreeDAssistantOrb';
import { 
  BookOpen, 
  CheckSquare, 
  FileCheck2, 
  Bot, 
  FolderTree, 
  FileText, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  Bell, 
  User, 
  Sparkles, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Video, 
  FileCode, 
  Megaphone, 
  Check, 
  ChevronRight, 
  RefreshCw, 
  GraduationCap, 
  School,
  X,
  Target,
  Award,
  Zap,
  Download,
  HelpCircle,
  BrainCircuit,
  Bookmark,
  Layers,
  Settings,
  Flame,
  Coins,
  MessageSquare,
  ExternalLink,
  Shield,
  HeartHandshake,
  Share2,
  Info,
  TrendingUp,
  Maximize2,
  Sun,
  Moon,
  Filter,
  Eye,
  Send,
  ThumbsUp,
  Calculator,
  Atom,
  Globe,
  Languages,
  Paperclip,
  CheckCircle,
  Smile,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { VideoModalPlayer } from '../common/VideoModalPlayer';
import { Class5LessonViewModal } from './views/Class5LessonViewModal';
import { Class5SubjectExplorerModal } from './views/Class5SubjectExplorerModal';
import {
  StudentProfileData,
  StudyPlanDoc,
  HomeworkDoc,
  NotificationDoc,
  CalendarEventDoc,
  ContinueLearningDoc,
  LessonDoc,
  VideoDoc,
  NoteDoc,
  QuizDoc,
  TeacherAnnouncementDoc,
  DailyQuestionDoc,
  ActivityDoc,
  AnnouncementDoc,
  subscribeToStudentAnnouncements,
  subscribeToStudentProfile,
  subscribeToStudyPlans,
  subscribeToHomework,
  subscribeToTeacherHomework,
  subscribeToNotifications,
  subscribeToCalendarEvents,
  subscribeToContinueLearning,
  subscribeToLessons,
  subscribeToVideos,
  subscribeToNotes,
  subscribeToQuizzes,
  subscribeToAnnouncements,
  subscribeToDailyQuestions,
  subscribeToActivityLogs,
  toggleStudyPlanItem,
  markNotificationRead,
  submitStudentHomework,
  subscribeToHomeworkSubmissions,
  TeacherHomeworkItem,
  HomeworkSubmissionDoc
} from '../../services/studentFirestoreService';
import { 
  subscribeToStudentLessonProgress, 
  LessonProgressDoc 
} from '../../services/studentProgressService';
import { 
  seedClass5SyllabusIfEmpty, 
  FirestoreLesson, 
  subscribeToChapterLessons 
} from '../../services/classSyllabusService';
import { 
  subscribeToDoubts, 
  postDoubt, 
  StudentDoubt 
} from '../../services/doubtService';
import { 
  seedClass5MockTestsIfEmpty, 
  subscribeToMockTests 
} from '../../services/mockTestService';
import { subscribeToHomeworks, Homework as ServiceHomework } from '../../services/homeworkService';
import { StudentTab } from './StudentSidebar';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, normalizeGradeKey } from '../../data/officialSyllabusData';
import { MockTestDoc } from '../../types/mockTest';
import { useStudentClass } from '../../context/StudentClassContext';
import { useLanguage } from '../../context/LanguageContext';

interface StudentCleanDashboardProps {
  userId: string;
  onNavigateTab: (tab: StudentTab) => void;
  onLaunchModal: (modalName: 'tutor' | 'exam' | 'homework' | 'addTask' | 'addEvent') => void;
  onOpenProfile?: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  studentClassGrade?: string;
}

export const StudentCleanDashboard: React.FC<StudentCleanDashboardProps> = ({
  userId,
  onNavigateTab,
  onLaunchModal,
  onOpenProfile,
  isDarkMode = false,
  setIsDarkMode,
  studentClassGrade
}) => {
  const { selectedClass, openClassSwitcher } = useStudentClass();
  const { language, setSelectedLang, setLanguage, supportedLanguages, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  // ----------------------------------------------------
  // TIME & CLOCK STATES
  // ----------------------------------------------------
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning', 'Good Morning');
    if (hour < 17) return t('goodAfternoon', 'Good Afternoon');
    return t('goodEvening', 'Good Evening');
  };

  // ----------------------------------------------------
  // REAL-TIME FIRESTORE DATA STATES
  // ----------------------------------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [continueLearningDoc, setContinueLearningDoc] = useState<ContinueLearningDoc | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanDoc[]>([]);
  const [homeworkList, setHomeworkList] = useState<TeacherHomeworkItem[]>([]);
  const [mySubmissions, setMySubmissions] = useState<HomeworkSubmissionDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDoc[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityDoc[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestionDoc[]>([]);
  const [studentDoubts, setStudentDoubts] = useState<StudentDoubt[]>([]);
  const [mockTests, setMockTests] = useState<MockTestDoc[]>([]);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressDoc>>({});

  // Interactive Question State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<NoteDoc | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Class 5 Lesson Player Modal
  const [selectedLessonModal, setSelectedLessonModal] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    lessonId?: string;
  } | null>(null);

  // Class 5 Subject Chapter Explorer Modal
  const [selectedSubjectExplorer, setSelectedSubjectExplorer] = useState<{
    subjectId: string;
    subjectName: string;
    nativeName?: string;
    initialChapterId?: string;
  } | null>(null);

  // Homework Submit Modal
  const [activeHomeworkModal, setActiveHomeworkModal] = useState<TeacherHomeworkItem | null>(null);
  const [homeworkAnswerText, setHomeworkAnswerText] = useState('');
  const [homeworkAttachmentUrl, setHomeworkAttachmentUrl] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [hwSubmitSuccess, setHwSubmitSuccess] = useState(false);

  // Smart Doubt Asker State
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtChapter, setDoubtChapter] = useState('Shapes and Angles');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [doubtAiResponse, setDoubtAiResponse] = useState<string | null>(null);
  const [isAskingAiDoubt, setIsAskingAiDoubt] = useState(false);
  const [doubtSuccessMessage, setDoubtSuccessMessage] = useState<string | null>(null);

  // Library Active Category Tab
  const [activeLibraryCategory, setActiveLibraryCategory] = useState<'all' | 'books' | 'notes' | 'formula' | 'worksheets' | 'pyq'>('all');

  // Motivation Quote Refresh
  const quotesList = [
    "“The more that you read, the more things you will know. The more that you learn, the more places you'll go.” – Dr. Seuss",
    "“Mistakes are proof that you are trying and learning every day!”",
    "“Small daily steps in Class 5 lead to big achievements!”",
    "“Curiosity is the wick in the candle of learning.” – William Arthur Ward"
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  const activeGrade = normalizeGradeKey(selectedClass || studentClassGrade || profile?.grade || (profile as any)?.class || 'Class 5');

  // ----------------------------------------------------
  // INITIAL SEEDING & REALTIME SUBSCRIPTIONS
  // ----------------------------------------------------
  useEffect(() => {
    setLoading(true);

    // 1. Seed syllabus & mock tests if Firestore is brand new
    seedClass5SyllabusIfEmpty().catch(console.warn);
    seedClass5MockTestsIfEmpty().catch(console.warn);

    // 2. Real-time Listeners
    const unsubProfile = subscribeToStudentProfile(userId, setProfile);
    const unsubContinue = subscribeToContinueLearning(userId, setContinueLearningDoc);
    const unsubPlan = subscribeToStudyPlans(userId, setStudyPlan);
    const unsubNotif = subscribeToNotifications(userId, setNotifications);
    const unsubEvents = subscribeToCalendarEvents(userId, setCalendarEvents);
    const unsubAnnouncements = subscribeToStudentAnnouncements(
      activeGrade,
      'All Sections',
      userId,
      (items) => {
        setAnnouncements(items);
      }
    );
    const unsubDailyQ = subscribeToDailyQuestions(setDailyQuestions);
    const unsubActivities = subscribeToActivityLogs(userId, setActivityLogs);
    const unsubProgress = subscribeToStudentLessonProgress(userId, setLessonProgressMap);

    // Homework listeners filtered for activeGrade
    const unsubHw = subscribeToHomeworks(activeGrade, (items) => {
      if (Array.isArray(items)) {
        setHomeworkList(items as unknown as TeacherHomeworkItem[]);
      }
    });

    const unsubSubmissions = subscribeToHomeworkSubmissions((subs) => {
      if (Array.isArray(subs)) {
        setMySubmissions(subs.filter(s => s.studentId === userId || !s.studentId));
      }
    }, userId);

    // Doubts listener
    const unsubDoubts = subscribeToDoubts(activeGrade, (doubts) => {
      if (Array.isArray(doubts)) {
        // Filter for this student's doubts or public doubts
        setStudentDoubts(doubts.filter(d => d.studentId === userId || !d.studentId || d.studentId === 'std_demo_101'));
      }
    });

    // Mock Tests listener
    const unsubMockTests = subscribeToMockTests(null, (tests) => {
      if (Array.isArray(tests)) {
        setMockTests(tests);
      }
    }, activeGrade);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => {
      if (typeof unsubProfile === 'function') unsubProfile();
      if (typeof unsubContinue === 'function') unsubContinue();
      if (typeof unsubPlan === 'function') unsubPlan();
      if (typeof unsubNotif === 'function') unsubNotif();
      if (typeof unsubEvents === 'function') unsubEvents();
      if (typeof unsubAnnouncements === 'function') unsubAnnouncements();
      if (typeof unsubDailyQ === 'function') unsubDailyQ();
      if (typeof unsubActivities === 'function') unsubActivities();
      if (typeof unsubProgress === 'function') unsubProgress();
      if (typeof unsubHw === 'function') unsubHw();
      if (typeof unsubSubmissions === 'function') unsubSubmissions();
      if (typeof unsubDoubts === 'function') unsubDoubts();
      if (typeof unsubMockTests === 'function') unsubMockTests();
      clearTimeout(timer);
    };
  }, [userId, activeGrade]);

  // Derived Profile Data
  const studentName = profile?.name || 'Student';
  const fullDisplayName = `${studentName} 👋`;
  const schoolName = profile?.schoolName || 'Government High School';
  const gradeBoard = `${activeGrade} • AP & TS SCERT (SSC State Board)`;
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Official Subjects for activeGrade
  const class5OfficialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[activeGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'] || [];

  // Color styles mapped to Class 5 subjects
  const subjectStyleMap: Record<string, { color: string; bgAccent: string; textAccent: string; icon: any; nativeName: string }> = {
    'c5_math': { color: 'from-blue-600 to-indigo-700', bgAccent: 'bg-blue-50 dark:bg-blue-950/60', textAccent: 'text-blue-600 dark:text-blue-400', icon: Calculator, nativeName: 'గణితం' },
    'c5_evs': { color: 'from-emerald-600 to-teal-800', bgAccent: 'bg-emerald-50 dark:bg-emerald-950/60', textAccent: 'text-emerald-600 dark:text-emerald-400', icon: Atom, nativeName: 'పరిసరాల విజ్ఞానం' },
    'c5_eng': { color: 'from-purple-600 to-indigo-800', bgAccent: 'bg-purple-50 dark:bg-purple-950/60', textAccent: 'text-purple-600 dark:text-purple-400', icon: BookOpen, nativeName: 'ఆంగ్లం (Marigold)' },
    'c5_tel': { color: 'from-amber-600 to-orange-700', bgAccent: 'bg-amber-50 dark:bg-amber-950/60', textAccent: 'text-amber-600 dark:text-amber-400', icon: Languages, nativeName: 'తెలుగు భారతి' },
    'c5_hin': { color: 'from-rose-600 to-pink-700', bgAccent: 'bg-rose-50 dark:bg-rose-950/60', textAccent: 'text-rose-600 dark:text-rose-400', icon: Globe, nativeName: 'रिमझिम (Hindi)' }
  };

  // Calculate subject progress dynamically from real Firestore lesson progress
  const subjectsData = useMemo(() => {
    return class5OfficialSubjects.map((sub) => {
      const style = subjectStyleMap[sub.id] || {
        color: 'from-blue-600 to-indigo-700',
        bgAccent: 'bg-blue-50 dark:bg-blue-950/60',
        textAccent: 'text-blue-600 dark:text-blue-400',
        icon: BookOpen,
        nativeName: sub.nativeName || sub.name
      };

      const totalChapters = sub.chapters.length;
      let completedLessonsCount = 0;
      let totalLessonsCount = 0;

      sub.chapters.forEach(chap => {
        const topicsCount = chap.lessons?.length || 3;
        totalLessonsCount += topicsCount;
        chap.lessons?.forEach(les => {
          if (lessonProgressMap[les.id]?.completed) {
            completedLessonsCount++;
          }
        });
      });

      const calcProgress = totalLessonsCount > 0 
        ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100))
        : 0;

      return {
        id: sub.id,
        name: sub.name,
        nativeName: style.nativeName,
        icon: style.icon,
        chaptersCount: totalChapters,
        completedLessons: completedLessonsCount,
        totalLessons: totalLessonsCount || totalChapters * 3,
        progress: calcProgress,
        color: style.color,
        bgAccent: style.bgAccent,
        textAccent: style.textAccent,
        firstChapter: sub.chapters[0]
      };
    });
  }, [class5OfficialSubjects, lessonProgressMap]);

  // Overall Class 5 Progress Computation
  const overallLessonsCompleted = (Object.values(lessonProgressMap) as LessonProgressDoc[]).filter(l => l?.completed && (l.class === 'Class 5' || !l.class)).length;
  const totalClass5Lessons = class5OfficialSubjects.reduce((acc, s) => acc + (s.chapters.length * 3), 0);
  const overallProgressPercent = totalClass5Lessons > 0 ? Math.min(100, Math.round((overallLessonsCompleted / totalClass5Lessons) * 100)) : 0;

  // Determine exact "Continue Learning" position
  const activeContinue = useMemo(() => {
    // 1. Check if Firestore continue learning doc exists
    if (continueLearningDoc && continueLearningDoc.subject) {
      return continueLearningDoc;
    }

    // 2. Find the first subject & chapter with incomplete lesson in Class 5
    for (const sub of class5OfficialSubjects) {
      for (const chap of sub.chapters) {
        const firstIncompleteLesson = chap.lessons?.find(l => !lessonProgressMap[l.id]?.completed);
        if (firstIncompleteLesson) {
          return {
            subject: sub.name,
            chapterName: `Chapter ${chap.chapterNumber || 1}: ${chap.title}`,
            topicName: `Lesson: ${firstIncompleteLesson.title}`,
            progressPercent: 40,
            lastStep: 'Step 2: Interactive Concept & Real Examples',
            updatedAt: 'Recently',
            subjectId: sub.id,
            chapterId: chap.id
          };
        }
      }
    }

    // Default Class 5 starter topic
    return {
      subject: 'Mathematics',
      chapterName: 'Chapter 1: The Fish Tale (చేపల కథ)',
      topicName: 'Lesson 1: Understanding Numbers & Speed Calculation',
      progressPercent: 0,
      lastStep: 'Ready to Start Step 1',
      updatedAt: 'Today',
      subjectId: 'c5_math',
      chapterId: 'c5_math_ch1'
    };
  }, [continueLearningDoc, class5OfficialSubjects, lessonProgressMap]);

  // Real Homework Data mapping & filter status
  const submittedHwIds = new Set(mySubmissions.map(s => s.homeworkId));
  const pendingHomeworkList = homeworkList.filter(hw => !submittedHwIds.has(hw.id));
  const submittedHomeworkList = homeworkList.filter(hw => submittedHwIds.has(hw.id));

  // Today's Study Plan Tasks (Live Firestore Data Only)
  const displayStudyPlan: StudyPlanDoc[] = studyPlan;
  const completedPlans = displayStudyPlan.filter(p => p.completed).length;
  const planCompletionPercent = displayStudyPlan.length > 0 
    ? Math.round((completedPlans / displayStudyPlan.length) * 100)
    : 0;

  // Class 5 Curated Digital Library Notes & Resources
  const class5LibraryResources: NoteDoc[] = [
    {
      id: 'lib_m1',
      title: 'Class 5 Mathematics: Place Value, Angles & Formula Guide',
      type: 'Formula Sheets',
      subject: 'Mathematics',
      teacher: 'Sri M. Venkatrao',
      fileSize: '1.2 MB'
    },
    {
      id: 'lib_e1',
      title: 'Class 5 EVS: Super Senses & Living World Summary Notes',
      type: 'Revision Notes',
      subject: 'Environmental Studies',
      teacher: 'Smt. P. Sunitha',
      fileSize: '1.6 MB'
    },
    {
      id: 'lib_eng1',
      title: 'Class 5 English: Marigold Unit 1-3 Word Meanings & Worksheets',
      type: 'Worksheets',
      subject: 'English',
      teacher: 'Ms. Ananya Sharma',
      fileSize: '950 KB'
    },
    {
      id: 'lib_tel1',
      title: 'Class 5 Telugu: తెలుగు భారతి పాఠాల సారాంశం & పదజాలం',
      type: 'Revision Notes',
      subject: 'Telugu',
      teacher: 'శ్రీ కె. రామకృష్ణ',
      fileSize: '1.4 MB'
    }
  ];

  // Daily Question
  const displayDailyQuestion: DailyQuestionDoc = dailyQuestions.length > 0 ? dailyQuestions[0] : {
    id: 'dq_c5_1',
    question: 'A fisherman’s motor boat travels at a speed of 20 km in 1 hour. How far will it go in 3 and a half hours?',
    subject: 'Mathematics (Class 5 - The Fish Tale)',
    options: [
      '60 km',
      '70 km',
      '80 km',
      '50 km'
    ],
    correctIndex: 1,
    explanation: 'Distance = Speed × Time. In 3 hours = 20 × 3 = 60 km. In half hour = 10 km. Total Distance = 60 + 10 = 70 km.'
  };

  // Recent Activity stream
  const displayActivities: ActivityDoc[] = activityLogs.length > 0 ? activityLogs : [
    {
      id: 'act1',
      type: 'lesson',
      title: 'Completed Lesson: Shapes and Angles (Right Angles)',
      timestamp: 'Today, 8:45 AM',
      xpEarned: 30,
      details: 'Mathematics • Class 5'
    },
    {
      id: 'act2',
      type: 'quiz',
      title: 'Practiced 10 Questions on Animal Senses',
      timestamp: 'Yesterday',
      xpEarned: 45,
      details: 'Score: 9/10 (90%)'
    },
    {
      id: 'act3',
      type: 'note',
      title: 'Read Formula Sheet on Length and Distances',
      timestamp: '2 days ago',
      xpEarned: 15,
      details: 'Digital Library'
    }
  ];

  // Unread Notifications Count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Search Filter
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery?.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{ title: string; category: string; subject: string; tab: StudentTab }> = [];

    class5OfficialSubjects.forEach(s => {
      if ((s.name || '').toLowerCase().includes(q) || (s.nativeName && s.nativeName.includes(q))) {
        results.push({ title: `${s.name} (${s.nativeName || ''})`, category: 'Subject', subject: s.name, tab: 'subjects' });
      }
      (s.chapters || []).forEach(c => {
        if ((c.title || '').toLowerCase().includes(q)) {
          results.push({ title: `Chapter: ${c.title}`, category: 'Chapter', subject: s.name, tab: 'syllabus' });
        }
      });
    });

    class5LibraryResources.forEach(n => {
      if ((n.title || '').toLowerCase().includes(q) || (n.subject || '').toLowerCase().includes(q)) {
        results.push({ title: n.title, category: 'Library Resource', subject: n.subject, tab: 'library' });
      }
    });

    mockTests.forEach(m => {
      if ((m.title || '').toLowerCase().includes(q) || (m.subject || '').toLowerCase().includes(q)) {
        results.push({ title: m.title, category: 'Mock Test', subject: m.subject, tab: 'mock_tests' });
      }
    });

    return results;
  }, [searchQuery, class5OfficialSubjects, class5LibraryResources, mockTests]);

  // Submit Homework Handler
  const handleConfirmSubmitHomework = async () => {
    if (!activeHomeworkModal) return;
    setIsSubmittingHw(true);
    try {
      soundFx.playClick();
      await submitStudentHomework({
        homeworkId: activeHomeworkModal.id,
        homeworkTitle: activeHomeworkModal.title,
        studentId: userId,
        studentName: studentName,
        studentGrade: 'Class 5',
        classId: 'Class 5',
        answersText: homeworkAnswerText || 'Completed assignment submission.',
        attachedImages: homeworkAttachmentUrl ? [homeworkAttachmentUrl] : []
      });
      setHwSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmittingHw(false);
        setHwSubmitSuccess(false);
        setActiveHomeworkModal(null);
        setHomeworkAnswerText('');
        setHomeworkAttachmentUrl('');
      }, 1500);
    } catch (err) {
      console.error('Homework submission error:', err);
      setIsSubmittingHw(false);
      alert('Unable to submit homework to Firestore. Please try again.');
    }
  };

  // Submit Doubt to Teacher
  const handlePostDoubtToTeacher = async () => {
    if (!doubtQuestion.trim()) return;
    setIsSubmittingDoubt(true);
    try {
      soundFx.playClick();
      await postDoubt({
        studentId: userId,
        studentName: studentName,
        class: activeGrade,
        studentClass: activeGrade,
        subject: doubtSubject,
        chapter: doubtChapter,
        question: doubtQuestion,
        priority: 'Medium'
      });
      setDoubtSuccessMessage('Doubt posted successfully! Your school teacher will review and reply.');
      setDoubtQuestion('');
      setTimeout(() => setDoubtSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error posting doubt:', err);
      alert('Error posting doubt. Please check your connection.');
    } finally {
      setIsSubmittingDoubt(false);
    }
  };

  // Ask Vidya AI Teacher for Instant Doubt Explanation
  const handleAskVidyaAiTeacher = async () => {
    if (!doubtQuestion.trim()) return;
    setIsAskingAiDoubt(true);
    setDoubtAiResponse(null);
    try {
      soundFx.playClick();
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `I am a ${activeGrade} student. My subject is ${doubtSubject} (Chapter: ${doubtChapter}). My question is: "${doubtQuestion}". Please explain this to me in simple terms with everyday examples!`,
          grade: activeGrade,
          subject: doubtSubject,
          language: language || 'en'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDoubtAiResponse(data.text || 'I have explained the solution step-by-step for you!');
      } else {
        setDoubtAiResponse(`Namaste ${studentName}! Here is the simple step-by-step concept for ${doubtSubject}: Break down the problem, check what numbers are given, and solve each step slowly.`);
      }
    } catch (err) {
      console.warn('AI Doubt API fallback:', err);
      setDoubtAiResponse(`Namaste ${studentName}! For ${doubtSubject} (${doubtChapter}): Remember to always read the question carefully, write down the formula, and check your calculation step-by-step!`);
    } finally {
      setIsAskingAiDoubt(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-slate-900 dark:text-slate-100 font-sans max-w-[1440px] mx-auto px-3 sm:px-6">
      
      {/* ==================================================== */}
      {/* 1. TOP HEADER (Student Focused, Non-Admin)          */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-sm transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Profile & Time Info */}
        <div className="flex items-center gap-4">
          <div 
            className="relative group shrink-0 cursor-pointer"
            onClick={onOpenProfile}
            title="View Student Profile"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md group-hover:scale-105 transition duration-200">
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`}
                alt={studentName}
                className="w-full h-full rounded-[14px] object-cover bg-slate-100 dark:bg-slate-800"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow">
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {getGreeting()},
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {fullDisplayName}
              </h1>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (openClassSwitcher) openClassSwitcher();
                }}
                className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-[11px] font-extrabold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                title="Change active class / grade"
              >
                <School className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{gradeBoard}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 underline ml-1">Change</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{currentDateFormatted}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{currentTime || '10:00 AM'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Search Bar, Notifications, Dark Mode, Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Global Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeGrade} lessons, notes, tests...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Search Dropdown Preview */}
            {searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2 max-h-72 overflow-y-auto">
                <div className="text-[10px] font-black uppercase text-slate-400 px-1">{activeGrade} Matches ({filteredSearchItems.length})</div>
                {filteredSearchItems.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2 text-center">No matching {activeGrade} content found</p>
                ) : (
                  filteredSearchItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        setSearchQuery('');
                        onNavigateTab(item.tab);
                      }}
                      className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-400 block">{item.subject} • {item.category}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowNotificationsDropdown(!showNotificationsDropdown);
              }}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition relative cursor-pointer"
              title="Class 5 Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Class 5 Alerts</h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(userId, n.id)}
                        className={`p-3 rounded-2xl text-xs space-y-1 cursor-pointer transition ${
                          n.read ? 'bg-slate-50 dark:bg-slate-800/40 opacity-70' : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
                        }`}
                      >
                        <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{n.title}</span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown (English, Telugu, Hindi) */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowLangDropdown(!showLangDropdown);
              }}
              className="px-2.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={t('selectLanguage', 'Select Language')}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                {supportedLanguages.find(l => l.code === language)?.flag || '🇮🇳'}{' '}
                {supportedLanguages.find(l => l.code === language)?.nativeName || 'తెలుగు'}
              </span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-52 py-2 px-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  {t('preferredLanguage', 'Preferred Language')}
                </div>
                {supportedLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        soundFx.playClick();
                        await (setSelectedLang || setLanguage)(lang.code, userId);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{lang.flag}</span>
                        <div>
                          <div className="font-bold leading-tight">{lang.nativeName}</div>
                          <div className="text-[10px] opacity-75 font-normal">{lang.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          {setIsDarkMode && (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsDarkMode(!isDarkMode);
              }}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* Profile Quick Settings */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenProfile) onOpenProfile();
              else onNavigateTab('settings');
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Profile & Settings"
          >
            <User className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. TODAY'S LEARNING / HERO SPOTLIGHT                 */}
      {/* ==================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden border border-blue-800/40">
        
        {/* Subtle Decorative Gradient Glowing Blobs */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Daily Goal */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-black tracking-wider uppercase border border-blue-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                <span>{activeGrade} Personalized Learning</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile?.streakDays || 5} Day Study Streak</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                What are we learning today, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-emerald-300">{studentName}</span>?
              </h2>
              <div className="mt-2 text-sm sm:text-base font-extrabold text-sky-200 flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Today's Focus:</span>
                <TypewriterEffect
                  staticText=""
                  words={
                    activeGrade === 'Class 10'
                      ? [
                          "Mathematics (Quadratic Equations & Trigonometry)",
                          "Physical Science (Refraction of Light)",
                          "Biological Science (Nutrition & Respiration)",
                          "Social Studies (India - Relief Features)",
                          "English (A Letter to God)"
                        ]
                      : activeGrade === 'Class 9'
                      ? [
                          "Mathematics (Number Systems & Polynomials)",
                          "Science (Matter in Our Surroundings)",
                          "Social Studies (Our Earth)",
                          "English (The Fun They Had)"
                        ]
                      : activeGrade === 'Class 8'
                      ? [
                          "Mathematics (Rational Numbers & Linear Equations)",
                          "Science (Crop Production & Management)",
                          "Social Studies (Reading Maps)",
                          "English (The Best Christmas Present)"
                        ]
                      : activeGrade === 'Class 7'
                      ? [
                          "Mathematics (Integers & Fractions)",
                          "Science (Nutrition in Plants)",
                          "Social Studies (The Earth's Interior)",
                          "English (Three Questions)"
                        ]
                      : activeGrade === 'Class 6'
                      ? [
                          "Mathematics (Knowing Our Numbers)",
                          "Science (Components of Food)",
                          "Social Studies (Diversity and Discrimination)",
                          "English (Who Did Patrick's Homework?)"
                        ]
                      : [
                          "Mathematics (The Fish Tale & Angles)",
                          "EVS (Super Senses in Living Animals)",
                          "English (Marigold Reading & Rhymes)",
                          "Telugu (తెలుగు భారతి గేయాలు & కథలు)",
                          "Hindi (रिमझिम भाषा अभ्यास)"
                        ]
                  }
                  typeMode="letter"
                  speed={80}
                  eraseSpeed={40}
                  delay={2000}
                  animatedClassName="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-300 to-emerald-300 font-black"
                  cursorColor="#38bdf8"
                />
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-2 font-medium max-w-xl leading-relaxed">
                You have completed <span className="font-extrabold text-white">{overallLessonsCompleted} {activeGrade} lessons</span> so far. Keep moving forward!
              </p>
            </div>

            {/* Today's Study Goal Progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 max-w-lg">
              <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Today's Learning Tasks</span>
                </span>
                {displayStudyPlan.length > 0 ? (
                  <button 
                    onClick={() => onNavigateTab('study_planner')}
                    className="text-emerald-300 font-black hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{completedPlans} of {displayStudyPlan.length} Tasks ({planCompletionPercent}%)</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onNavigateTab('study_planner')}
                    className="text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Create Plan</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              {displayStudyPlan.length > 0 ? (
                <div className="w-full h-2.5 rounded-full bg-slate-900/60 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 via-sky-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${planCompletionPercent}%` }}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-blue-200">
                  Generate your custom Class 5 daily schedule based on your syllabus & homework.
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedLessonModal({
                    subjectId: (activeContinue as any).subjectId || 'c5_math',
                    subjectName: activeContinue.subject,
                    chapterId: (activeContinue as any).chapterId || 'c5_math_ch1',
                    chapterName: activeContinue.chapterName
                  });
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-2xl transition duration-200 cursor-pointer flex items-center gap-2.5 group shrink-0"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition" />
                <span>Continue Lesson</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onLaunchModal('tutor');
                }}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition cursor-pointer flex items-center gap-2 backdrop-blur-md"
              >
                <Bot className="w-4 h-4 text-sky-300" />
                <span>Ask Vidya AI Teacher</span>
              </button>
            </div>

          </div>

          {/* Right Card: Class 5 Learning Progress Summary & Daily Quote */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Overall Syllabus Progress Card */}
            <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/90 backdrop-blur-xl p-5 rounded-2xl border border-blue-400/20 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Class 5 Mastery Level</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-bold">
                  {overallProgressPercent}% Complete
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                <div>
                  <p className="text-2xl font-black text-white">{overallLessonsCompleted} / {totalClass5Lessons}</p>
                  <p className="text-[10px] text-slate-300 font-semibold">Class 5 Lessons Finished</p>
                </div>
                <button 
                  onClick={() => onNavigateTab('syllabus')}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-lg transition"
                >
                  View Syllabus
                </button>
              </div>
            </div>

            {/* Daily Encouragement Quote */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-200">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  <span>Daily Encouragement</span>
                </span>
                <button
                  onClick={() => setQuoteIndex((prev) => (prev + 1) % quotesList.length)}
                  className="text-slate-300 hover:text-white text-[10px] underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next</span>
                </button>
              </div>
              <p className="text-xs text-white italic font-medium leading-relaxed">
                {quotesList[quoteIndex]}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. CONTINUE LEARNING EXACT POSITION                   */}
      {/* ==================================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-black tracking-wider uppercase border border-blue-400/30">
                Resume Where You Stopped
              </span>
              <span className="text-xs text-slate-300 font-semibold">• {activeContinue.subject}</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {activeContinue.chapterName}
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-medium">
                {activeContinue.topicName}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Last Updated: {activeContinue.updatedAt || 'Today'}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{activeContinue.lastStep}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Chapter Progress</span>
                <span className="text-emerald-400 font-black">{activeContinue.progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${activeContinue.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedLessonModal({
                subjectId: (activeContinue as any).subjectId || 'c5_math',
                subjectName: activeContinue.subject,
                chapterId: (activeContinue as any).chapterId || 'c5_math_ch1',
                chapterName: activeContinue.chapterName
              });
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Open Interactive Lesson</span>
          </button>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. MY SUBJECTS (Class 5 Exclusive)                   */}
      {/* ==================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              My Class 5 Subjects
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official SCERT & NCERT Class 5 Curriculum Modules
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All Subjects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsData.map((subj) => {
            return (
              <Modern3DCard
                key={subj.id}
                depth={16}
                glare={true}
                className="rounded-3xl"
              >
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubjectExplorer({
                      subjectId: subj.id,
                      subjectName: subj.name,
                      nativeName: subj.nativeName,
                    });
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 space-y-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <ThreeDSubjectIcon subjectName={subj.name} size="md" />
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">{subj.nativeName} • {subj.chaptersCount} Chapters</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                      {subj.progress}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <p className="font-black text-slate-900 dark:text-white">{subj.completedLessons} / {subj.totalLessons}</p>
                      <p className="text-[10px] text-slate-400">Lessons Completed</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <p className="font-black text-slate-900 dark:text-white">{subj.chaptersCount}</p>
                      <p className="text-[10px] text-slate-400">SCERT Chapters</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${subj.color} rounded-full transition-all duration-500`}
                        style={{ width: `${subj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Modern3DCard>
            );
          })}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 5. CLASS 5 LEARNING PATH JOURNEY                    */}
      {/* ==================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Class 5 Learning Path & Step Journey
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step-by-step roadmap from foundations to assessment mastery
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            { step: '1', title: 'Concept Foundations', desc: 'Real-world analogies and illustrated examples', status: 'Completed', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
            { step: '2', title: 'Textbook Lessons', desc: 'SCERT Chapter reading with key takeaways', status: 'In Progress', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
            { step: '3', title: 'Interactive Practice', desc: 'Daily drills and adaptive questions', status: 'Upcoming', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500' },
            { step: '4', title: 'Homework Worksheets', desc: 'Teacher review and feedback', status: 'Upcoming', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500' },
            { step: '5', title: 'Chapter Assessment', desc: 'Mock tests and score certification', status: 'Upcoming', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500' }
          ].map((pathItem, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${pathItem.color} space-y-2 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black flex items-center justify-center">
                    {pathItem.step}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{pathItem.status}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">{pathItem.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{pathItem.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 6. SMART DOUBT ASKER (Primary Feature)               */}
      {/* ==================================================== */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500 text-slate-950 font-black shadow-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Have a Doubt? Ask Your Teacher or Vidya AI
              </h3>
              <p className="text-xs text-sky-200">
                Post your question to your school teacher or get an instant step-by-step explanation
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-sky-200 block mb-1">Select Subject</label>
              <select
                value={doubtSubject}
                onChange={(e) => setDoubtSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-800 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="Mathematics">Mathematics (గణితం)</option>
                <option value="Environmental Studies">Environmental Studies (పరిసరాల విజ్ఞానం)</option>
                <option value="English">English (Marigold)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (रिमझिम)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-sky-200 block mb-1">Topic or Chapter</label>
              <input
                type="text"
                placeholder="e.g. Chapter 1 Speed & Distance or Animal Senses"
                value={doubtChapter}
                onChange={(e) => setDoubtChapter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-sky-200 block mb-1">Your Question / Doubt Description</label>
            <textarea
              rows={3}
              placeholder="Type your question clearly... e.g. How do we convert meters into kilometers in boat problems?"
              value={doubtQuestion}
              onChange={(e) => setDoubtQuestion(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-indigo-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAskVidyaAiTeacher}
                disabled={isAskingAiDoubt || !doubtQuestion.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                {isAskingAiDoubt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                <span>{isAskingAiDoubt ? 'Vidya AI is Explaining...' : 'Ask Vidya AI Teacher (Instant)'}</span>
              </button>

              <button
                onClick={handlePostDoubtToTeacher}
                disabled={isSubmittingDoubt || !doubtQuestion.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 border border-indigo-400/40"
              >
                {isSubmittingDoubt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Post to School Teacher</span>
              </button>
            </div>

            {doubtSuccessMessage && (
              <span className="text-xs text-emerald-300 font-bold bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500/50">
                {doubtSuccessMessage}
              </span>
            )}
          </div>
        </div>

        {/* AI Immediate Explanation Card */}
        {doubtAiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-sky-500/50 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between border-b border-sky-900/60 pb-2">
              <div className="flex items-center gap-2 text-sky-300 font-extrabold">
                <Bot className="w-4 h-4" />
                <span>Vidya AI Teacher Explanation</span>
              </div>
              <button 
                onClick={() => setDoubtAiResponse(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {doubtAiResponse}
            </p>
          </motion.div>
        )}

        {/* Student's Previous Doubts from Firestore */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-sky-300">
            Your Previous Doubts & Teacher Replies ({studentDoubts.length})
          </h4>

          {studentDoubts.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-indigo-900/40 text-center text-xs text-slate-400">
              No doubts posted yet. Whenever you have a question, type it above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {studentDoubts.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-sky-300">{d.subject} • {d.chapter}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      d.status === 'Answered' || d.teacherReply
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {d.status === 'Answered' || d.teacherReply ? 'Teacher Replied' : 'Pending Review'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white line-clamp-2">{d.question || d.description}</p>

                  {d.teacherReply && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-200">
                      <p className="font-extrabold text-emerald-300">Teacher: {d.teacherName || 'Subject Teacher'}</p>
                      <p>{typeof d.teacherReply === 'string' ? d.teacherReply : d.teacherReply.replyText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 7. HOMEWORK CENTER (Real Class 5 Homework Only)      */}
      {/* ==================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Class 5 Homework Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official assignments uploaded by your school teachers
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('homework')}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Full Homework Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {homeworkList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">You're All Caught Up!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No new homework is assigned right now. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw) => {
              const isSubmitted = submittedHwIds.has(hw.id);
              return (
                <div key={hw.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        isSubmitted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isSubmitted ? 'Submitted' : `Due: ${hw.dueDate || 'Soon'}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{hw.subject}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{hw.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{hw.instructions || hw.description || 'Complete the exercise questions.'}</p>
                  </div>

                  <div className="pt-1">
                    {isSubmitted ? (
                      <span className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        <span>Submitted to Teacher</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setActiveHomeworkModal(hw);
                        }}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <span>Submit Work</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 8. PRACTICE CENTER & MOCK TESTS                      */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Practice Center */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Class 5 Practice Center
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive concept drills and daily questions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-black uppercase">Math Drill</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Shapes, Angles & Distances</h4>
                <p className="text-[11px] text-slate-500">10 Questions with instant solution hints</p>
                <button 
                  onClick={() => onNavigateTab('practice')}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Start Practice
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase">EVS Drill</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Super Senses in Animals</h4>
                <p className="text-[11px] text-slate-500">10 Questions with diagrams</p>
                <button 
                  onClick={() => onNavigateTab('practice')}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Start Practice
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('practice')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition cursor-pointer text-center"
          >
            Explore All Practice Sets
          </button>
        </section>

        {/* Mock Tests & Assessment Drills */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Class 5 Mock Tests
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Timed chapter tests and unit assessments</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {mockTests.slice(0, 2).map((test) => (
                <div key={test.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">{test.subject}</span>
                      <span className="text-[10px] text-slate-400">{test.durationMinutes || 20} Mins • {test.totalQuestions || 10} Qs</span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">{test.title}</h4>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onLaunchModal('exam');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shrink-0"
                  >
                    Start Test
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('mock_tests')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition cursor-pointer text-center"
          >
            View All Mock Assessments
          </button>
        </section>

      </div>

      {/* ==================================================== */}
      {/* 9. DIGITAL LIBRARY & STUDY RESOURCES                 */}
      {/* ==================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Class 5 Digital Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SCERT E-Books, Revision PDFs, Worksheets, Formula Guides
              </p>
            </div>
          </div>

          {/* Library Quick Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Resources' },
              { id: 'notes', label: 'Revision Notes' },
              { id: 'formula', label: 'Formula Sheets' },
              { id: 'worksheets', label: 'Worksheets' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeLibraryCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {class5LibraryResources
            .filter(n => activeLibraryCategory === 'all' || (n.type || '').toLowerCase().includes(activeLibraryCategory))
            .map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-black uppercase">
                  {n.type}
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">{n.title}</h4>
                <p className="text-[11px] text-slate-400">{n.subject} • Size: {n.fileSize}</p>
                <p className="text-[10px] text-slate-400 italic">By {n.teacher}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActivePdfModal(n);
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    alert(`Downloading Class 5 resource: ${n.title}`);
                  }}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 10. DAILY QUESTION OF THE DAY                        */}
      {/* ==================================================== */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase border border-emerald-400/30">
              Class 5 Daily Brain Teaser
            </span>
            <span className="text-xs text-emerald-200 font-bold">• {displayDailyQuestion.subject}</span>
          </div>
          <span className="text-xs text-amber-300 font-extrabold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>+25 XP Reward</span>
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
          {displayDailyQuestion.question}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {displayDailyQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === displayDailyQuestion.correctIndex;
            return (
              <button
                key={idx}
                disabled={answerSubmitted}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedAnswer(idx);
                  setAnswerSubmitted(true);
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                  answerSubmitted
                    ? isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : isSelected
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-emerald-400 hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {answerSubmitted && isCorrect && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {answerSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 text-xs text-emerald-200 space-y-1"
          >
            <p className="font-extrabold text-emerald-300">Explanation & Solution:</p>
            <p>{displayDailyQuestion.explanation}</p>
          </motion.div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 11. RECENT ACTIVITY & TEACHER ANNOUNCEMENTS          */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Stream */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Recent Learning Activity
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Realtime History</span>
          </div>

          <div className="space-y-3">
            {displayActivities.map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    {act.type === 'lesson' && <BookOpen className="w-4 h-4" />}
                    {act.type === 'quiz' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {act.type === 'note' && <Download className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{act.title}</h4>
                    <p className="text-[10px] text-slate-400">{act.details} • {act.timestamp}</p>
                  </div>
                </div>
                {act.xpEarned && (
                  <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    +{act.xpEarned} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Teacher Announcements */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {studentClassGrade} Announcements
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('announcements')}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All ({announcements.length})
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  No announcements published yet for {studentClassGrade}.
                </p>
                <p className="text-[11px] text-slate-400">
                  Official notices, exam schedules, or circulars published by your teachers will appear here in real time.
                </p>
              </div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => onNavigateTab('announcements')}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-pink-300 dark:hover:border-pink-800 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {a.authorName || 'Class Teacher'}
                      </span>
                      {a.priority === 'Urgent' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-black uppercase">
                          Urgent
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase">
                        {a.type || 'General'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(a.publishedAt || a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {a.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {a.message || a.content || a.announcement}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* ==================================================== */}
      {/* 12. FOOTER SECTION                                   */}
      {/* ==================================================== */}
      <footer className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-black text-sm text-slate-900 dark:text-white">AP Vidya Digital LMS • Class 5 Portal</span>
            </div>
            <p className="text-slate-400">Department of School Education • SCERT AP & TS Learning Platform</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-bold text-slate-700 dark:text-slate-300">
            <button 
              onClick={() => onNavigateTab('messages')} 
              className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Contact Teacher</span>
            </button>
            <button 
              onClick={() => onNavigateTab('help')} 
              className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>Help Center</span>
            </button>
            <button 
              onClick={() => setShowFeedbackModal(true)} 
              className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5 text-blue-600 font-extrabold"
            >
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <span>Student Feedback</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2026 AP Vidya AI Education Platform. Real Data & Student Centric Design.</p>
          <p className="font-semibold">SCERT Class 5 Standard Curriculum</p>
        </div>
      </footer>

      {/* ==================================================== */}
      {/* MODALS & OVERLAYS                                    */}
      {/* ==================================================== */}

      {/* 1. Interactive Class 5 Lesson Player Modal */}
      {selectedLessonModal && (
        <Class5LessonViewModal
          isOpen={!!selectedLessonModal}
          onClose={() => setSelectedLessonModal(null)}
          userId={userId}
          studentClassGrade="Class 5"
          subjectId={selectedLessonModal.subjectId}
          subjectName={selectedLessonModal.subjectName}
          chapterId={selectedLessonModal.chapterId}
          chapterName={selectedLessonModal.chapterName}
          initialLessonId={selectedLessonModal.lessonId}
        />
      )}

      {/* 1b. Class 5 Subject Chapter Explorer Modal */}
      {selectedSubjectExplorer && (
        <Class5SubjectExplorerModal
          isOpen={!!selectedSubjectExplorer}
          onClose={() => setSelectedSubjectExplorer(null)}
          userId={userId}
          subjectId={selectedSubjectExplorer.subjectId}
          subjectName={selectedSubjectExplorer.subjectName}
          nativeName={selectedSubjectExplorer.nativeName}
          initialChapterId={selectedSubjectExplorer.initialChapterId}
          lessonProgressMap={lessonProgressMap}
        />
      )}

      {/* 2. Homework Submission Modal */}
      {activeHomeworkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-600">{activeHomeworkModal.subject}</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white">{activeHomeworkModal.title}</h3>
              </div>
              <button 
                onClick={() => setActiveHomeworkModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hwSubmitSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Homework Submitted!</h4>
                <p className="text-xs text-slate-500">Your solution has been sent directly to your teacher's grading portal in Firestore.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-white">Teacher Instructions:</p>
                  <p>{activeHomeworkModal.instructions || activeHomeworkModal.description || 'Solve all exercise questions and submit your answers below.'}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Written Answer / Steps</label>
                  <textarea
                    rows={4}
                    value={homeworkAnswerText}
                    onChange={(e) => setHomeworkAnswerText(e.target.value)}
                    placeholder="Type your answers, calculation steps, or explanations here..."
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-rose-500 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Photo / Document Attachment URL (Optional)</label>
                  <input
                    type="text"
                    value={homeworkAttachmentUrl}
                    onChange={(e) => setHomeworkAttachmentUrl(e.target.value)}
                    placeholder="Paste image link or worksheet photo URL..."
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-rose-500 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleConfirmSubmitHomework}
                  disabled={isSubmittingHw || (!homeworkAnswerText.trim() && !homeworkAttachmentUrl.trim())}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingHw ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSubmittingHw ? 'Submitting to Teacher...' : 'Submit Assignment to Teacher'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Video Player Modal */}
      <VideoModalPlayer
        isOpen={!!activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        video={activeVideoModal}
      />

      {/* 4. PDF Viewer Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{activePdfModal.title}</h3>
                  <p className="text-[10px] text-slate-400">{activePdfModal.subject} • {activePdfModal.type}</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePdfModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="p-8 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-dashed border-indigo-200 dark:border-slate-700 text-center space-y-3">
                <FileCode className="w-12 h-12 text-indigo-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">Interactive PDF Document Ready</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  This study resource is verified by faculty for the SCERT Class 5 curriculum.
                </p>
                <button
                  onClick={() => alert(`Downloading: ${activePdfModal.title}`)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF ({activePdfModal.fileSize || '1.8 MB'})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Student Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">Student Feedback</h3>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Thank you, {studentName}!</h4>
                <p className="text-xs text-slate-500">Your feedback has been recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How can we make your Class 5 learning experience even better?
                </p>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts or ideas..."
                  className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-rose-500 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setFeedbackSubmitted(true);
                    setTimeout(() => {
                      setShowFeedbackModal(false);
                      setFeedbackSubmitted(false);
                      setFeedbackText('');
                    }, 1800);
                  }}
                  disabled={!feedbackText.trim()}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
