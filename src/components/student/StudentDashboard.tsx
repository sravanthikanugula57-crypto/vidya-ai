import React, { useState, useEffect } from 'react';
import { StudentProfile, LanguageCode, UserAuthProfile, Subject } from '../../types';
import { 
  Sparkles, 
  Flame, 
  Coins, 
  Award, 
  Bot, 
  Camera, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Zap, 
  Code, 
  Calculator, 
  Atom, 
  Globe, 
  Languages, 
  FileCheck2, 
  FolderTree, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Database, 
  Plus,
  Send,
  Upload,
  UserCheck,
  RefreshCw,
  Bell,
  X,
  Target,
  Megaphone,
  Download,
  Search,
  FileText,
  Shield,
  User
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { StudentSidebar, StudentTab } from './StudentSidebar';
import { StudentTopNav } from './StudentTopNav';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStudentClass } from '../../context/StudentClassContext';
import { ChooseClassScreen } from './ChooseClassScreen';
import { useLanguage } from '../../context/LanguageContext';

import { seedClass5SyllabusIfEmpty } from '../../services/classSyllabusService';
import {
  StudentProfileData,
  StudyPlanDoc,
  SubjectProgressDoc,
  HomeworkDoc,
  NotificationDoc,
  ActivityDoc,
  AITutorMessageDoc,
  WeeklyProgressDoc,
  CalendarEventDoc,
  ContinueLearningDoc,
  subscribeToStudentProfile,
  subscribeToStudyPlans,
  subscribeToSubjectProgress,
  subscribeToHomework,
  subscribeToTeacherHomework,
  subscribeToNotifications,
  subscribeToActivityLogs,
  subscribeToWeeklyProgress,
  subscribeToCalendarEvents,
  subscribeToContinueLearning,
  subscribeToAITutorChat,
  subscribeToStudentAnnouncements,
  toggleStudyPlanItem,
  addStudyPlanItem,
  submitHomework,
  markNotificationRead,
  addCalendarEvent,
  sendAITutorMessageToFirestore,
  uploadProfilePhoto,
  updateStudentProfile
} from '../../services/studentFirestoreService';

import { AITutorModal } from './AITutorModal';
import { AIHomeworkHelperModal } from './AIHomeworkHelperModal';
import { AIWhiteboardModal } from './AIWhiteboardModal';
import { ScholarshipsModal } from './ScholarshipsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { VidyaStoreModal } from './VidyaStoreModal';
import { MockExamModal } from './MockExamModal';
import { ChapterExplorerModal } from './ChapterExplorerModal';
import { StudentCleanDashboard } from './StudentCleanDashboard';

import { SubjectsView } from './views/SubjectsView';
import { SyllabusView } from './views/SyllabusView';
import { MyLearningView } from './views/MyLearningView';
import { TrackerView } from './views/TrackerView';
import { DigitalLibraryView } from './views/DigitalLibraryView';
import { HomeworkCenterView } from './views/HomeworkCenterView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { ProgressAnalyticsView } from './views/ProgressAnalyticsView';
import { CareerGuidanceView } from './views/CareerGuidanceView';
import { PreviousPapersView } from './views/PreviousPapersView';
import { NotesView } from './views/NotesView';
import { CalendarView } from './views/CalendarView';
import { MessagesView } from './views/MessagesView';
import { ParentPortalView } from './views/ParentPortalView';
import { CommunityView } from './views/CommunityView';
import { ClassroomHubView } from './views/ClassroomHubView';
import { LearningPortfolioView } from './views/LearningPortfolioView';
import { StudentDoubtCenterView } from './views/StudentDoubtCenterView';
import { ResourcesView } from './views/ResourcesView';
import { PracticeCenterView } from './views/PracticeCenterView';
import { MockTestListView } from './mockTest/MockTestListView';
import { StudentAnnouncementsView } from './views/StudentAnnouncementsView';
import { StudentClassDiscussionView } from './views/StudentClassDiscussionView';

interface StudentDashboardProps {
  student: StudentProfile;
  currentUser: UserAuthProfile | null;
  selectedLang: LanguageCode;
  xp: number;
  coins: number;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  onSelectLang?: (lang: LanguageCode) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  onLogout?: () => void;
  onOpenRoleSwitcher?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  currentUser,
  selectedLang,
  xp,
  coins,
  addXp,
  addCoins,
  onSelectLang = (_lang?: LanguageCode) => {},
  isDarkMode = false,
  setIsDarkMode = (_dark?: boolean) => {},
  onLogout,
  onOpenRoleSwitcher,
}) => {
  const { language, setSelectedLang, setLanguage, t } = useLanguage();
  const effectiveLang = language || selectedLang;
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Firestore Real-Time States
  const userId = currentUser?.id || 'std_class10_ananya';
  const [profileDoc, setProfileDoc] = useState<StudentProfileData | null>(null);
  const [studyPlans, setStudyPlans] = useState<StudyPlanDoc[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressDoc[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityDoc[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressDoc[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDoc[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearningDoc | null>(null);
  const [aiChatMessages, setAiChatMessages] = useState<AITutorMessageDoc[]>([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState<number>(0);

  const { selectedClass, openClassSwitcher, isClassSwitcherOpen, closeClassSwitcher, selectClass } = useStudentClass();
  const rawGrade = selectedClass || profileDoc?.grade || profileDoc?.class || currentUser?.grade || currentUser?.class || null;
  const activeGrade: string | null = rawGrade 
    ? (typeof rawGrade === 'number' 
        ? `Class ${rawGrade}` 
        : (String(rawGrade).startsWith('Class') ? String(rawGrade) : `Class ${rawGrade}`))
    : null;

  // Subscriptions on mount
  useEffect(() => {
    seedClass5SyllabusIfEmpty().catch(console.warn);
    const unsubProfile = subscribeToStudentProfile(userId, setProfileDoc);
    const unsubPlans = subscribeToStudyPlans(userId, setStudyPlans);
    const unsubSubs = subscribeToSubjectProgress(userId, setSubjectProgress);
    const unsubHw = subscribeToTeacherHomework(activeGrade, (items) => {
      const converted: HomeworkDoc[] = items.map(hw => ({
        id: hw.id,
        title: hw.title,
        subject: hw.subject,
        dueDate: hw.dueDate,
        status: 'pending',
        priority: 'High',
        description: hw.instructions || hw.chapter,
        maxScore: hw.totalMarks || 20,
        createdAt: hw.createdAt
      }));
      setHomeworkList(converted);
    });
    const unsubNotifs = subscribeToNotifications(userId, setNotifications);
    const unsubActs = subscribeToActivityLogs(userId, setActivityLogs);
    const unsubWeekly = subscribeToWeeklyProgress(userId, setWeeklyProgress);
    const unsubCal = subscribeToCalendarEvents(userId, setCalendarEvents);
    const unsubCL = subscribeToContinueLearning(userId, setContinueLearning);
    const unsubChat = subscribeToAITutorChat(userId, setAiChatMessages);
    const unsubAnnouncements = subscribeToStudentAnnouncements(
      activeGrade,
      'All Sections',
      userId,
      (_items, unread) => {
        setUnreadAnnouncementsCount(unread);
      }
    );

    return () => {
      unsubProfile();
      unsubPlans();
      unsubSubs();
      unsubHw();
      unsubNotifs();
      unsubActs();
      unsubWeekly();
      unsubCal();
      unsubCL();
      unsubChat();
      unsubAnnouncements();
    };
  }, [userId, activeGrade]);

  // Modal & Interactive states
  const [activeModal, setActiveModal] = useState<
    'tutor' | 'homework' | 'whiteboard' | 'scholarship' | 'leaderboard' | 'store' | 'exam' | 'chapter' | 'addTask' | 'addEvent' | null
  >(null);

  const [activeExplorerSubject, setActiveExplorerSubject] = useState<Subject | null>(null);
  const [aiWidgetInput, setAiWidgetInput] = useState('');
  const [isAiWidgetThinking, setIsAiWidgetThinking] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // New Study Plan Form State
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanSubject, setNewPlanSubject] = useState('Mathematics');
  const [newPlanMins, setNewPlanMins] = useState('20');
  const [newPlanPriority, setNewPlanPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // New Calendar Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-08-20');
  const [newEventCategory, setNewEventCategory] = useState<'exam' | 'study' | 'assignment' | 'revision'>('study');

  // Homework Filter State
  const [hwFilter, setHwFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('pending');

  // Calculate Days Remaining to Class 10 SSC Exams
  const getExamCountdown = () => {
    const target = new Date('2027-03-15T09:00:00');
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate overall Board Exam Readiness % from real subject progress
  const calculateBoardReadiness = () => {
    if (subjectProgress.length === 0) return 76;
    const total = subjectProgress.reduce((sum, s) => sum + s.completedPercent, 0);
    return Math.round(total / subjectProgress.length);
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      await uploadProfilePhoto(userId, file);
      soundFx.playSuccess();
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // AI Tutor Quick Message Handler
  const handleSendAIWidgetMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiWidgetInput.trim()) return;
    const text = aiWidgetInput.trim();
    setAiWidgetInput('');
    setIsAiWidgetThinking(true);

    try {
      await sendAITutorMessageToFirestore(userId, text, 'user', 'Mathematics');
      
      // Auto response
      setTimeout(async () => {
        const responseText = `Here is the step-by-step ${activeGrade} solution for "${text}":\n1. Identify given terms.\n2. Apply relevant formula.\n3. Verify results. Practice similar exercises!`;
        await sendAITutorMessageToFirestore(userId, responseText, 'ai', 'Mathematics');
        setIsAiWidgetThinking(false);
        soundFx.playCoin();
      }, 1000);
    } catch (err) {
      console.error('AI message send error:', err);
      setIsAiWidgetThinking(false);
    }
  };

  const subjectIconMap: Record<string, React.ReactNode> = {
    Calculator: <Calculator className="w-5 h-5 text-blue-500" />,
    Atom: <Atom className="w-5 h-5 text-cyan-500" />,
    BookOpen: <BookOpen className="w-5 h-5 text-emerald-500" />,
    Globe: <Globe className="w-5 h-5 text-amber-500" />,
    Languages: <Languages className="w-5 h-5 text-purple-500" />,
    Code: <Code className="w-5 h-5 text-pink-500" />
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        unreadMessagesCount={notifications.filter(n => !n.read).length}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
        pendingHomeworkCount={homeworkList.filter(h => h.status === 'pending').length}
        onLogout={onLogout}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        
        {activeTab === 'dashboard' ? (
          <StudentCleanDashboard
            userId={userId}
            studentClassGrade={activeGrade}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onLaunchModal={(modalName) => {
              if (modalName === 'tutor') setActiveModal('tutor');
              else if (modalName === 'exam') setActiveModal('exam');
              else if (modalName === 'homework') setActiveModal('homework');
              else if (modalName === 'addTask') setActiveModal('addTask');
              else if (modalName === 'addEvent') setActiveModal('addEvent');
            }}
            onOpenProfile={() => setActiveTab('settings')}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        ) : (
          <>
            {/* Top Navbar */}
            <StudentTopNav
              student={{
                ...student,
                name: profileDoc?.name || student.name,
                schoolName: profileDoc?.schoolName || student.schoolName,
                grade: (activeGrade || 'Class 6') as any,
              }}
              selectedLang={effectiveLang}
              onSelectLang={(l) => {
                (setSelectedLang || setLanguage)(l, currentUser || userId);
                if (onSelectLang) onSelectLang(l);
              }}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onOpenRoleSwitcher={onOpenRoleSwitcher}
              onOpenClassSwitcher={openClassSwitcher}
            />

            {/* Tab Body */}
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
              {(activeTab as string) === 'dashboard' && (
                <StudentCleanDashboard
                  userId={userId}
                  studentClassGrade={activeGrade}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onLaunchModal={(m) => setActiveModal(m)}
                  onOpenProfile={() => setActiveModal('profile' as any)}
                />
              )}
              {false && (
            <div className="space-y-8">
              
              {/* 1. Welcome Section & Board Exam Countdown */}
              <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 text-white p-6 sm:p-8 shadow-2xl overflow-hidden">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                  
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    {/* Avatar & Photo Upload */}
                    <div className="relative group shrink-0">
                      {profileDoc?.photoURL || student.avatar ? (
                        <img
                          src={profileDoc?.photoURL || student.avatar}
                          alt={profileDoc?.name || student.name}
                          className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-white/50 shadow-md"
                        />
                      ) : (
                        <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/20 border-2 border-white/50 shadow-md flex items-center justify-center text-2xl font-black text-white">
                          {(profileDoc?.name || student.name || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-xl border border-white/30 text-xs font-black text-white shadow-sm">
                          <GraduationCap className="w-4 h-4 text-yellow-300" />
                          <label htmlFor="class-grade-selector" className="sr-only">Select Class Grade</label>
                          <select
                            id="class-grade-selector"
                            value={activeGrade}
                            onChange={async (e) => {
                              const newGrade = e.target.value;
                              soundFx.playClick();
                              try {
                                await updateStudentProfile(userId, { grade: newGrade });
                              } catch (err) {
                                console.warn('Grade update error:', err);
                              }
                            }}
                            className="bg-transparent text-yellow-300 font-extrabold focus:outline-none cursor-pointer border-none py-0 text-xs tracking-wider"
                          >
                            <option value="Class 5" className="bg-slate-900 text-white font-bold">Class 5 (5th Grade)</option>
                            <option value="Class 6" className="bg-slate-900 text-white font-bold">Class 6 (6th Grade)</option>
                            <option value="Class 7" className="bg-slate-900 text-white font-bold">Class 7 (7th Grade)</option>
                            <option value="Class 8" className="bg-slate-900 text-white font-bold">Class 8 (8th Grade)</option>
                            <option value="Class 9" className="bg-slate-900 text-white font-bold">Class 9 (9th Grade)</option>
                            <option value="Class 10" className="bg-slate-900 text-white font-bold">Class 10 (10th Grade)</option>
                          </select>
                          <span className="text-[10px] text-sky-200 uppercase font-extrabold">• {profileDoc?.board || 'SSC Board'}</span>
                        </div>

                        <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500 text-slate-950 font-black tracking-wide">
                          Class-Specific Syllabus
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        Welcome, {profileDoc?.name || student.name}! 🎓
                      </h1>
                      
                      <p className="text-xs sm:text-sm text-sky-100 mt-0.5 font-medium">
                        {profileDoc?.schoolName || 'Government High School, Medak'} • {profileDoc?.medium || 'Telugu Medium'}
                      </p>

                      {/* Live Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center space-x-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold border border-white/20">
                          <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
                          <span>{profileDoc?.streakDays || 7} Day Streak</span>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold border border-white/20">
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>Level 4 Scholar ({profileDoc?.xp || xp} XP)</span>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow-md">
                          <Clock className="w-4 h-4" />
                          <span>{getExamCountdown()} Days to {activeGrade} Final Exams</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveModal('tutor')}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Ask AI Tutor</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('homework')}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl backdrop-blur transition transform hover:scale-105 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-yellow-300" />
                      <span>Homework Cam</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Continue Learning Widget & Board Exam Readiness Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Continue Learning Doc Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4 border border-indigo-800/50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-sky-400">Continue Learning</span>
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-500 text-slate-950">Firestore Sync</span>
                    </div>

                    <div>
                      <span className="text-xs text-indigo-300 font-bold">{continueLearning?.subject || 'Mathematics'}</span>
                      <h3 className="text-lg font-black text-white mt-0.5">{continueLearning?.chapterName || 'Chapter 5: Quadratic Equations'}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Topic: {continueLearning?.topicName || 'Finding Discriminant D = b² - 4ac'}.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                        <span>Lesson Completion</span>
                        <span>{continueLearning?.progressPercent || 68}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${continueLearning?.progressPercent || 68}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">Last step: {continueLearning?.lastStep || 'Real roots check'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('tutor')}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume Lesson Now</span>
                  </button>
                </div>

                {/* 3. Board Exam Readiness Gauge & Subject Breakdown */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{activeGrade} Exam Readiness Score</h3>
                        <p className="text-[11px] text-slate-400">Real-time aggregate across all {activeGrade} subjects in Firestore</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3.5 py-1 rounded-2xl">
                      {calculateBoardReadiness()}% Readiness
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Target Grade Goal</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">A1 Grade (90%+ Target)</div>
                      <p className="text-[11px] text-slate-500">Based on quiz accuracy averages across Mathematics and Physical Science.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Weak Topics to Revise</div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">• Quadratic Discriminants</div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">• Convex Lens Ray Diagrams</div>
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">• Monsoon Wind Currents</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Today's Study Plan (Firestore Synced) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Today's Study Plan Tasks</h3>
                      <p className="text-[11px] text-slate-400">Interactive task checklist synced live with Firestore database</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal('addTask')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {studyPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => toggleStudyPlanItem(userId, plan.id, plan.completed)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                        plan.completed 
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 line-through' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button className="mt-0.5 shrink-0">
                          <CheckCircle2 className={`w-5 h-5 ${plan.completed ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                              {plan.subject}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{plan.estMinutes} mins</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{plan.title}</h4>
                          {plan.reasoning && <p className="text-[11px] text-slate-400 mt-0.5">{plan.reasoning}</p>}
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        plan.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {plan.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Subject Progress Cards Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeGrade} Subject Progress Cards</h2>
                    <p className="text-xs text-slate-500">Live chapter completion and weak topics from Firestore</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{subjectProgress.length} Subjects</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectProgress.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setActiveExplorerSubject({
                          id: sub.id,
                          name: sub.name,
                          nativeName: sub.nativeName,
                          icon: sub.icon,
                          bgGradient: sub.color,
                          completedPercent: sub.completedPercent,
                          chaptersCount: sub.totalChapters
                        });
                        setActiveModal('chapter');
                      }}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-blue-500 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${sub.color}`}>
                          {subjectIconMap[sub.icon] || <BookOpen className="w-5 h-5 text-blue-500" />}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{sub.completedPercent}% Complete</span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{sub.name}</h3>
                        {sub.nativeName && <p className="text-xs text-slate-500 font-medium">{sub.nativeName}</p>}
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${sub.completedPercent}%` }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium space-y-1">
                        <div>Chapters: {sub.chaptersCompleted} / {sub.totalChapters} Completed</div>
                        <div className="text-rose-600 dark:text-rose-400 font-bold truncate">Weak Topic: {sub.weakTopics}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Pending Homework & Assignments */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Pending Homework & Assignments</h3>
                      <p className="text-[11px] text-slate-400">{activeGrade} assignments with live submission status</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['all', 'pending', 'submitted', 'graded'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setHwFilter(st)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition cursor-pointer ${
                          hwFilter === st ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {homeworkList
                    .filter((h) => hwFilter === 'all' || h.status === hwFilter)
                    .map((hw) => (
                      <div key={hw.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {hw.subject}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Due: {hw.dueDate}</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{hw.title}</h4>
                          <p className="text-[11px] text-slate-500">{hw.description}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          {hw.status === 'pending' && (
                            <button
                              onClick={() => submitHomework(userId, hw.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                            >
                              Submit Homework
                            </button>
                          )}
                          {hw.status === 'submitted' && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl">
                              Submitted (Pending Grading)
                            </span>
                          )}
                          {hw.status === 'graded' && (
                            <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-xl">
                              Graded: {hw.gradeScore}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 7. Weekly Progress Recharts Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Weekly Study Progress Analytics</h3>
                      <p className="text-[11px] text-slate-400">Daily study minutes & quiz accuracy stored in Firestore</p>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155',
                          borderRadius: '1rem',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="studyMinutes" fill="#2563eb" radius={[8, 8, 0, 0]} name="Study Mins" />
                      <Bar dataKey="accuracyPercent" fill="#10b981" radius={[8, 8, 0, 0]} name="Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 8. AI Tutor Interactive Widget */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-sky-950 text-white shadow-xl space-y-4 border border-sky-800/50">
                <div className="flex items-center justify-between border-b border-sky-800/60 pb-3">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-sky-400 animate-pulse" />
                    <div>
                      <h3 className="font-extrabold text-base text-white">{activeGrade} AI Tutor Assistant</h3>
                      <p className="text-[11px] text-sky-200">Ask any {activeGrade} doubt in Telugu or English (Saved in Firestore)</p>
                    </div>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="h-48 overflow-y-auto space-y-3 p-3 bg-slate-950/60 rounded-2xl border border-sky-900/50">
                  {aiChatMessages.length === 0 ? (
                    <div className="text-center text-xs text-sky-300/60 py-12">
                      Ask your first question e.g. "Explain Quadratic Discriminant" or "What is refraction?"
                    </div>
                  ) : (
                    aiChatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-sky-100 rounded-bl-none border border-sky-800/40'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isAiWidgetThinking && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-slate-800 text-sky-300 rounded-2xl text-xs flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Vidya AI is solving...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Chat Input Form */}
                <form onSubmit={handleSendAIWidgetMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Type your ${activeGrade} math or science doubt...`}
                    value={aiWidgetInput}
                    onChange={(e) => setAiWidgetInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-sky-800 text-xs text-white outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>

              {/* 9. Notifications Panel & Calendar Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Notifications Panel */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Notifications & Alerts</h3>
                    </div>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {notifications.filter(n => !n.read).length} Unread
                    </span>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(userId, n.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          n.read ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70' : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 shadow-sm'
                        }`}
                      >
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.date}</span>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Schedule */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-purple-500" />
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Calendar & Exam Dates</h3>
                    </div>
                    <button
                      onClick={() => setActiveModal('addEvent')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Event</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {calendarEvents.map((ev) => (
                      <div key={ev.id} className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                              {ev.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{ev.date} • {ev.time}</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{ev.title}</h4>
                          <p className="text-[11px] text-slate-500">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Data Governance Info */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <span className="flex items-center gap-1.5 font-mono">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span>Firestore Path: /users/{userId} & /students/{userId}/**</span>
                </span>
                <span>Protected by Master Firestore Security Rules</span>
              </div>

            </div>
          )}

          {/* MY LEARNING TAB */}
          {activeTab === 'learning' && (
            <MyLearningView
              userId={userId}
              studentClassGrade={activeGrade}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onLaunchTutor={(sub, chap) => setActiveModal('tutor')}
              onLaunchLesson={() => setActiveTab('syllabus' as any)}
            />
          )}

          {/* SYLLABUS & SUBJECTS TAB */}
          {(activeTab === 'syllabus' || activeTab === 'subjects') && (
            <SyllabusView
              userId={userId}
              selectedLang={effectiveLang}
              studentClassGrade={activeGrade}
              onAddXp={addXp}
              onAddCoins={addCoins}
              onLaunchTutor={() => setActiveModal('tutor')}
            />
          )}

          {/* TRACKER & PROGRESS TAB */}
          {(activeTab === 'tracker' || activeTab === 'progress') && (
            <TrackerView
              userId={userId}
              studentClassGrade={activeGrade}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onLaunchTutor={(sub, chap) => setActiveModal('tutor')}
            />
          )}

          {/* DIGITAL LIBRARY TAB */}
          {activeTab === 'library' && <DigitalLibraryView studentClassGrade={activeGrade} />}

          {/* HOMEWORK & ASSIGNMENTS CENTER TAB */}
          {(activeTab === 'homework' || activeTab === 'assignments') && (
            <HomeworkCenterView
              userId={userId}
              studentName={profileDoc?.name || student.name}
              homeworkList={homeworkList}
              studentClassGrade={activeGrade}
              onSubmitHomework={(hwId) => submitHomework(userId, hwId)}
              onLaunchCam={() => setActiveModal('homework')}
            />
          )}

          {/* SMART DOUBT CENTER TAB */}
          {activeTab === 'doubts' && (
            <StudentDoubtCenterView
              userId={userId}
              studentName={profileDoc?.name || student.name}
              studentClassGrade={activeGrade}
            />
          )}

          {/* STUDY PLANNER TAB */}
          {activeTab === 'study_planner' && (
            <StudyPlannerView
              userId={userId}
              studentClassGrade={activeGrade}
              onStartLesson={(subj, chap) => {
                setActiveTab('syllabus' as any);
              }}
              onNavigateTab={(tab) => {
                setActiveTab(tab as any);
              }}
              onLaunchExam={() => {
                setActiveModal('exam');
              }}
            />
          )}

          {/* CALENDAR SCHEDULE TAB */}
          {activeTab === 'calendar' && (
            <CalendarView />
          )}

          {/* REVISION NOTES TAB */}
          {activeTab === 'notes' && (
            <NotesView 
              studentClassGrade={activeGrade} 
              studentUid={student?.id || (currentUser as any)?.uid || ''}
              studentName={student?.name || (currentUser as any)?.displayName || 'Student'}
            />
          )}

          {/* DOWNLOAD RESOURCES TAB */}
          {activeTab === 'resources' && <ResourcesView studentClassGrade={activeGrade} />}

          {/* PRACTICE TAB */}
          {activeTab === 'practice' && (
            <PracticeCenterView
              userId={student?.id || (currentUser as any)?.uid || (currentUser as any)?.id || userId}
              studentName={student?.name || (currentUser as any)?.name || 'Student'}
              studentEmail={(student as any)?.email || (currentUser as any)?.email || ''}
              studentBoard={(student as any)?.board || profileDoc?.board || 'State Board (TG/AP)'}
              studentClassGrade={activeGrade}
              onSelectClass={openClassSwitcher}
              onLaunchLesson={(lessonId) => {
                setActiveModal(null);
              }}
            />
          )}

          {/* MOCK TESTS TAB */}
          {activeTab === 'mock_tests' && (
            <MockTestListView
              userId={student?.id || (currentUser as any)?.uid || (currentUser as any)?.id || 'std_adduri'}
              userName={student?.name || (currentUser as any)?.name || 'Adduri Surendra'}
              userEmail={(student as any)?.email || (currentUser as any)?.email || '24331A4202@mvgrce.edu.in'}
              studentClassGrade={activeGrade}
              onSelectClass={openClassSwitcher}
            />
          )}

          {/* PREVIOUS PAPERS TAB */}
          {activeTab === 'previous_papers' && (
            <PreviousPapersView
              userId={student?.id || (currentUser as any)?.uid || 'student_1'}
              studentClassGrade={activeGrade}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase">Level {(profileDoc as any)?.level || 4} Scholar</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-xs font-black">{profileDoc?.xp || 1420} XP Total</span>
                  </div>
                  <h2 className="text-2xl font-black">Achievements, Badges & Rewards</h2>
                  <p className="text-xs text-amber-100 mt-1 max-w-xl">
                    Earn XP points, unlock rare badges, maintain daily study streaks, and redeem VidyaCoins in the rewards store!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveModal('leaderboard')}
                    className="px-4 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg hover:bg-amber-50 transition cursor-pointer flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>State Leaderboard</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('store')}
                    className="px-4 py-2.5 bg-slate-950 text-amber-300 font-extrabold text-xs rounded-2xl shadow-lg hover:bg-slate-900 transition cursor-pointer flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Vidya Store ({profileDoc?.coins || 350})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: '7-Day Streak Master', desc: 'Studied for 7 consecutive days', icon: '🔥', unlocked: true },
                  { name: 'Math Wizard', desc: 'Scored 90%+ in 5 Math Quizzes', icon: '📐', unlocked: true },
                  { name: 'Socratic Scholar', desc: 'Asked 20+ doubts to AI Tutor', icon: '🤖', unlocked: true },
                  { name: 'Night Owl Scholar', desc: 'Completed late-night revision session', icon: '🦉', unlocked: false },
                  { name: 'Science Lab Prodigy', desc: 'Finished all virtual science experiments', icon: '🧪', unlocked: false },
                  { name: 'Vocabulary Master', desc: 'Mastered 100 new English words', icon: '📖', unlocked: true },
                  { name: 'Top 5% Ranker', desc: 'Ranked in Top 5% of State Mock Exam', icon: '🏆', unlocked: true },
                  { name: 'Homework Champion', desc: 'Submitted 10 homework assignments on time', icon: '📸', unlocked: true },
                ].map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border transition flex flex-col items-center text-center space-y-2 ${
                      b.unlocked
                        ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-800/60 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="text-4xl my-1">{b.icon}</div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.desc}</p>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full mt-2 ${b.unlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {b.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <StudentAnnouncementsView
              studentGrade={student?.grade || activeGrade || 'Class 5'}
              studentSection={(student as any)?.section || 'Section A'}
              studentId={currentUser?.id || student?.id || 'student_current'}
            />
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Student Account Settings</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your profile information, academic medium, notification preferences, and application settings.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span>Academic Profile</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue={profileDoc?.name || student.name}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Grade / Class</label>
                      <select
                        value={profileDoc?.grade || activeGrade}
                        onChange={(e) => {
                          const newGrade = e.target.value;
                          setProfileDoc((prev) => prev ? { ...prev, grade: newGrade } : {
                            id: userId,
                            name: student?.name || 'Student',
                            email: '',
                            grade: newGrade,
                            board: 'AP SSC',
                            schoolName: 'Government High School',
                            district: 'Vijayawada',
                            medium: 'Telugu Medium',
                            avatar: student?.avatar || '',
                            xp: 1420,
                            coins: 350,
                            streakDays: 7,
                            role: 'student',
                            state: 'Andhra Pradesh',
                            isVerified: true,
                            isEmailVerified: true
                          } as any);
                          updateStudentProfile(userId, { grade: newGrade }).catch(console.error);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Class 10">Class 10 (SSC State Board)</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 5">Class 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Medium of Instruction / Language</label>
                      <select
                        value={language}
                        onChange={(e) => {
                          const newLang = e.target.value as LanguageCode;
                          (setSelectedLang || setLanguage)(newLang, currentUser || userId);
                          if (onSelectLang) onSelectLang(newLang);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="te">Telugu Medium (తెలుగు)</option>
                        <option value="en">English Medium</option>
                        <option value="hi">Hindi Medium (हिंदी)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">School Name</label>
                      <input
                        type="text"
                        defaultValue={profileDoc?.schoolName || 'Government High School'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>Data & Security</span>
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Firestore Cloud Synchronization</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">All progress and notes are encrypted and saved live to Firestore DB.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                      Connected Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLASSROOM HUB TAB */}
          {activeTab === 'classroom' && <ClassroomHubView />}

          {/* CLASS DISCUSSION GROUP (REALTIME FIRESTORE) */}
          {activeTab === 'class_discussion' && (
            <StudentClassDiscussionView
              studentProfile={{
                uid: userId,
                name: profileDoc?.name || currentUser?.name || student?.name || 'Student',
                email: profileDoc?.email || currentUser?.email || (student as any)?.email || '',
                class: profileDoc?.grade || profileDoc?.class || currentUser?.grade || activeGrade || 'Class 10',
                grade: profileDoc?.grade || activeGrade,
                board: profileDoc?.board || 'AP_SSC'
              }}
            />
          )}

          {/* LEARNING PORTFOLIO TAB */}
          {activeTab === 'portfolio' && <LearningPortfolioView />}

          {/* COMMUNITY FORUM TAB */}
          {activeTab === 'community' && (
            <CommunityView 
              studentClassGrade={profileDoc?.grade || currentUser?.grade || student?.grade || 'Class 10'}
              userRole="student"
              userName={profileDoc?.name || student?.name || 'Student'}
              userId={userId}
            />
          )}

          {/* PARENT PORTAL VIEW TAB */}
          {activeTab === 'parent' && <ParentPortalView />}

          {/* PROGRESS ANALYTICS TAB */}
          {activeTab === 'progress' && <ProgressAnalyticsView />}

          {/* CAREER GUIDANCE TAB */}
          {activeTab === 'career' && <CareerGuidanceView />}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && <MessagesView />}

          {/* AI TUTOR QUICK TAB */}
          {activeTab === 'tutor' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
              <Bot className="w-16 h-16 text-sky-500 mx-auto animate-pulse" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{activeGrade} AI Socratic Tutor</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Step-by-step doubt solver with Telugu voice support and practice drills.
              </p>
              <button
                onClick={() => setActiveModal('tutor')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-extrabold text-sm rounded-2xl shadow-lg cursor-pointer"
              >
                Launch Fullscreen AI Tutor
              </button>
            </div>
          )}

            </main>
          </>
        )}
      </div>

      {/* MODALS */}
      <AITutorModal
        isOpen={activeModal === 'tutor'}
        onClose={() => setActiveModal(null)}
        selectedLang={selectedLang}
        selectedSubject="Mathematics"
        addXp={addXp}
        addCoins={addCoins}
      />

      <AIHomeworkHelperModal
        isOpen={activeModal === 'homework'}
        onClose={() => setActiveModal(null)}
        selectedLang={selectedLang}
        addXp={addXp}
      />

      <AIWhiteboardModal
        isOpen={activeModal === 'whiteboard'}
        onClose={() => setActiveModal(null)}
        addXp={addXp}
      />

      <ScholarshipsModal
        isOpen={activeModal === 'scholarship'}
        onClose={() => setActiveModal(null)}
      />

      <LeaderboardModal
        isOpen={activeModal === 'leaderboard'}
        onClose={() => setActiveModal(null)}
        currentUserId={student?.id}
      />

      <VidyaStoreModal
        isOpen={activeModal === 'store'}
        onClose={() => setActiveModal(null)}
        userCoins={coins}
        onUpdateCoins={(newBalance) => addCoins(newBalance - coins)}
      />

      <MockExamModal
        isOpen={activeModal === 'exam'}
        onClose={() => setActiveModal(null)}
        onCompleteExam={(score, total, xpG, coinG) => {
          addXp(xpG);
          addCoins(coinG);
        }}
      />

      <ChapterExplorerModal
        isOpen={activeModal === 'chapter'}
        onClose={() => setActiveModal(null)}
        subject={activeExplorerSubject}
        selectedLang={selectedLang}
        onLaunchTutorForTopic={() => setActiveModal('tutor')}
        onLaunchWhiteboardForTopic={() => setActiveModal('whiteboard')}
        onAddXp={addXp}
        onAddCoins={addCoins}
      />

      {/* Add Study Plan Task Modal */}
      {activeModal === 'addTask' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add Study Task</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Solve Exercise 5.3 Q1 - Q5"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold">Subject</label>
                  <select
                    value={newPlanSubject}
                    onChange={(e) => setNewPlanSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physical Science">Physical Science</option>
                    <option value="Biological Science">Biological Science</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="English">English</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold">Est. Minutes</label>
                  <input
                    type="number"
                    value={newPlanMins}
                    onChange={(e) => setNewPlanMins(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!newPlanTitle.trim()) return;
                  await addStudyPlanItem(userId, {
                    title: newPlanTitle,
                    subject: newPlanSubject,
                    estMinutes: parseInt(newPlanMins) || 20,
                    completed: false,
                    dueDate: 'Today',
                    type: 'Custom Task',
                    priority: newPlanPriority,
                    reasoning: 'Added by student'
                  });
                  setNewPlanTitle('');
                  setActiveModal(null);
                  soundFx.playSuccess();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer"
              >
                Save Task to Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Calendar Event Modal */}
      {activeModal === 'addEvent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add Calendar Event</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Maths Chapter 5 Unit Test"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border mt-1 dark:bg-slate-800"
                  >
                    <option value="exam">Exam</option>
                    <option value="study">Study Session</option>
                    <option value="assignment">Assignment</option>
                    <option value="revision">Revision</option>
                  </select>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!newEventTitle.trim()) return;
                  await addCalendarEvent(userId, {
                    title: newEventTitle,
                    date: newEventDate,
                    time: '10:00 AM',
                    category: newEventCategory,
                    description: 'Scheduled on student calendar',
                    completed: false
                  });
                  setNewEventTitle('');
                  setActiveModal(null);
                  soundFx.playSuccess();
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer"
              >
                Save Event to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Switcher Modal */}
      {isClassSwitcherOpen && (
        <ChooseClassScreen
          isModalVariant
          onCloseModal={closeClassSwitcher}
          currentUser={currentUser}
          onSelectClass={async (newGrade) => {
            await selectClass(newGrade, currentUser);
            closeClassSwitcher();
          }}
        />
      )}

    </div>
  );
};
