import React, { useState, useEffect } from 'react';
import { LanguageCode, UserAuthProfile } from '../../types';
import { Modern3DCard } from '../common/3d/Modern3DCard';
import { 
  Users, 
  Sparkles, 
  Printer, 
  BrainCircuit, 
  AlertTriangle,
  Send,
  BookOpen, 
  FileSpreadsheet, 
  BarChart3, 
  Award, 
  User, 
  Sliders, 
  GraduationCap,
  Bell,
  CheckCircle2,
  LogOut,
  Clock,
  ArrowRight,
  UserPlus,
  LogIn,
  Activity,
  ShieldAlert,
  Zap,
  Video,
  MessageSquare,
  HelpCircle,
  FileText
} from 'lucide-react';

import { MyClasses } from './MyClasses';
import { ClassManagement } from './ClassManagement';
import { TestStudentFlowPanel } from './TestStudentFlowPanel';
import { ClassManagementView } from './views/ClassManagementView';
import { TeacherHomeworkView } from './views/TeacherHomeworkView';
import { TeacherProfileView } from './views/TeacherProfileView';
import { TeacherCMSManager } from './views/TeacherCMSManager';
import { TeacherDigitalLibraryManager } from './views/TeacherDigitalLibraryManager';
import { TeacherDoubtCenterView } from './views/TeacherDoubtCenterView';
import { ClassDiscussionManager } from '../discussion/ClassDiscussionManager';
import { MDMMockTestMonitoringView } from './views/MDMMockTestMonitoringView';
import { TeacherAIMockTestStudio } from './views/TeacherAIMockTestStudio';
import { TeacherAIPracticeSetStudio } from './views/TeacherAIPracticeSetStudio';
import { soundFx } from '../../lib/audio';
import { 
  subscribeToTeacherNotifications, 
  TeacherNotificationItem,
  subscribeToRealStudents,
  RealStudentProfile
} from '../../services/studentFirestoreService';
import { DemoStudentToggle } from '../common/DemoStudentToggle';
import { 
  getShowDemoStudents, 
  subscribeDemoToggle, 
  isDemoRecord, 
  seedDemoStudentsIfMissing 
} from '../../services/demoStudentService';

interface TeacherDashboardProps {
  selectedLang: LanguageCode;
  currentUser?: UserAuthProfile | null;
  onLogout?: () => void;
}

export type TeacherTab = 
  | 'overview' 
  | 'class_mgmt' 
  | 'resource_manager'
  | 'video_manager'
  | 'homework' 
  | 'practice_sets'
  | 'mock_tests'
  | 'class_discussion'
  | 'doubts'
  | 'mdm_monitoring'
  | 'profile';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ selectedLang, currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [selectedClassForMgmt, setSelectedClassForMgmt] = useState<string | null>(null);
  const [selectedSubjectForMgmt, setSelectedSubjectForMgmt] = useState<string>('Mathematics');
  const [isTestFlowOpen, setIsTestFlowOpen] = useState(false);
  
  // Real-time Teacher Notifications feed
  const [notifications, setNotifications] = useState<TeacherNotificationItem[]>([]);
  const [realStudents, setRealStudents] = useState<RealStudentProfile[]>([]);
  const [showDemoStudents, setShowDemoStudents] = useState<boolean>(getShowDemoStudents());

  useEffect(() => {
    seedDemoStudentsIfMissing().catch(console.warn);
    const unsubDemo = subscribeDemoToggle((val) => {
      setShowDemoStudents(val);
    });
    return () => unsubDemo();
  }, []);

  useEffect(() => {
    const unsubNotifs = subscribeToTeacherNotifications((data) => {
      setNotifications(data);
    });
    const unsubStudents = subscribeToRealStudents((data) => {
      setRealStudents(data);
    });
    return () => {
      unsubNotifs();
      unsubStudents();
    };
  }, []);

  // Separate real production students vs seeded demo/test students
  const realOnlyStudents = realStudents.filter(s => !isDemoRecord(s));
  const demoOnlyStudents = realStudents.filter(s => isDemoRecord(s));
  const displayedStudents = showDemoStudents ? realStudents : realOnlyStudents;

  // Class assignment helper
  const isStudentInClass = (s: RealStudentProfile, clsNumOrName: number | string) => {
    const targetNum = typeof clsNumOrName === 'number' ? clsNumOrName : parseInt(String(clsNumOrName).replace(/\D/g, ''), 10);
    const stuNum = typeof s.class === 'number' ? s.class : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
    return s.grade === `Class ${targetNum}` || stuNum === targetNum;
  };

  // 1. Total students joined (explicitly separating Real vs Demo/Test when toggle enabled)
  const realStudentsCount = realOnlyStudents.length;
  const demoStudentsCount = demoOnlyStudents.length;
  const totalStudentsJoined = displayedStudents.length;

  // 2. Students who have logged in
  const loggedInStudentsCount = displayedStudents.filter(s => !!(s.lastLoginAt || s.lastLogin)).length;

  // 3. Recently active students
  const recentlyActiveStudentsCount = displayedStudents.filter(s => s.status === 'Online' || s.status === 'Idle').length;

  // 4. Last login time (actual Firestore timestamp)
  const getLatestLoginDisplay = () => {
    const logins = displayedStudents
      .map(s => s.lastLoginAt || (s.lastLogin && s.lastLogin !== 'Recently' && s.lastLogin !== 'Today' ? s.lastLogin : null))
      .filter(Boolean) as string[];
    
    if (logins.length === 0) {
      if (displayedStudents.some(s => s.status === 'Online' || s.lastLogin === 'Today' || s.lastLogin === 'Recently')) {
        return 'Today (Active Now)';
      }
      return 'No logins recorded yet';
    }

    const sorted = logins.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    try {
      const d = new Date(sorted[0]);
      if (isNaN(d.getTime())) return sorted[0];
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return sorted[0];
    }
  };
  const latestLoginTime = getLatestLoginDisplay();

  // Assigned classes configuration for this teacher (AP SCERT / AP State Board syllabus)
  const ASSIGNED_CLASSES = [
    { grade: 5, className: 'Class 5', subject: 'Mathematics', syllabus: 'AP SCERT Maths', board: 'AP_SSC' },
    { grade: 6, className: 'Class 6', subject: 'Mathematics', syllabus: 'AP SCERT Maths', board: 'AP_SSC' },
    { grade: 7, className: 'Class 7', subject: 'Physical Science', syllabus: 'AP SCERT Physics & Chemistry', board: 'AP_SSC' },
    { grade: 8, className: 'Class 8', subject: 'Physical Science', syllabus: 'AP SCERT Physics & Chemistry', board: 'AP_SSC' },
    { grade: 9, className: 'Class 9', subject: 'Physical Science', syllabus: 'AP SCERT Physics & Chemistry', board: 'AP_SSC' },
    { grade: 10, className: 'Class 10', subject: 'Physical Science', syllabus: 'AP SSC Board Exam Prep', board: 'AP_SSC' },
  ];

  const scoredStudents = realStudents.filter(s => (s.quizScoreAvg || 0) > 0);
  const averageScore = scoredStudents.length > 0
    ? Math.round(scoredStudents.reduce((acc, s) => acc + (s.quizScoreAvg || 0), 0) / scoredStudents.length)
    : 0;
  const strugglingStudents = realStudents.filter(s => (s.quizScoreAvg || 0) < 60 && (s.quizScoreAvg || 0) > 0);

  // Question Paper Generator State
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations & Factorization');
  const [marks, setMarks] = useState(20);
  const [paperResult, setPaperResult] = useState<any>(null);
  const [loadingPaper, setLoadingPaper] = useState(false);

  // Lesson Planner State
  const [lessonTopic, setLessonTopic] = useState('Refraction of Light & Snell\'s Law');
  const [lessonResult, setLessonResult] = useState<any>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  const handleGenerateQuestionPaper = async () => {
    soundFx.playClick();
    setLoadingPaper(true);
    setPaperResult(null);

    try {
      const res = await fetch('/api/ai/lesson-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: 'Class 9', subject, topic, duration: '50 mins' })
      });
      const data = await res.json();
      setPaperResult(data);
      soundFx.playSuccess();
    } catch (e) {
      setPaperResult({
        lessonTitle: `Class 9 ${subject}: ${topic} (Unit Assessment Test)`,
        bloomsQuestionPaper: [
          { marks: 1, type: 'Remembering', question: '1. State the standard form of a quadratic equation.' },
          { marks: 2, type: 'Understanding', question: '2. Explain why a quadratic equation can have at most two real roots.' },
          { marks: 5, type: 'Applying', question: '3. Solve the equation x² + 5x + 6 = 0 by factorization method and verify your answer.' },
          { marks: 5, type: 'Applying', question: '4. The length of a rectangular garden is 3 meters more than twice its width. If area is 90 sq.m, find dimensions.' }
        ]
      });
    } finally {
      setLoadingPaper(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    soundFx.playClick();
    setLoadingLesson(true);
    setLessonResult(null);

    try {
      const res = await fetch('/api/ai/lesson-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: 'Class 9', subject: 'Science', topic: lessonTopic })
      });
      const data = await res.json();
      setLessonResult(data);
      soundFx.playSuccess();
    } catch (e) {
      setLessonResult({
        lessonTitle: `50-Min Lesson Plan: ${lessonTopic}`,
        objectives: [
          'Understand Snell\'s Law in simple terms using local village materials.',
          'Demonstrate refraction using a transparent glass mug, water, and coin.',
          'Solve 2 state board exam numerical problems.'
        ],
        timeBreakdown: [
          { minuteRange: '0 - 10 mins', activity: 'Zero-Cost Hook', details: 'Place coin at bottom of glass cup. Pour water, coin appears to rise!' },
          { minuteRange: '10 - 25 mins', activity: 'Board Concept Teaching', details: 'Explain light bending when changing medium speed.' },
          { minuteRange: '25 - 40 mins', activity: 'Classroom Group Activity', details: 'Students draw ray diagrams on slate/notebooks.' },
          { minuteRange: '40 - 50 mins', activity: 'Exit Ticket Check', details: 'Quick 2-question oral check before bell.' }
        ],
        lowCostLabExperiment: 'Transparent glass cup + Water + Wooden Pencil. Total Cost: ₹0.'
      });
    } finally {
      setLoadingLesson(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-800 text-white p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
              {currentUser?.schoolName || 'Government High School'} • Faculty LMS Operating Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, {currentUser?.name || 'Teacher'} 👋</h1>
            <p className="text-xs sm:text-sm text-emerald-100">
              Faculty Member • {currentUser?.email || 'Teacher Dashboard'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs">
              <div>
                <div className="text-lg font-black text-white">{notifications.length}</div>
                <div className="text-[10px] text-emerald-100 font-semibold uppercase">LMS Alerts</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <div className="text-lg font-black text-yellow-300">{averageScore}%</div>
                <div className="text-[10px] text-emerald-100 font-semibold uppercase">Avg Exam Score</div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLogout();
                }}
                className="flex items-center space-x-2 bg-rose-500/90 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg transition cursor-pointer border border-rose-400/30"
                title="Log out of Teacher Dashboard"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout Teacher</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Bar / Tabs */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('overview'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('class_mgmt'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'class_mgmt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Class Management</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('resource_manager'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'resource_manager' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="teacher-nav-resource-manager"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Resource Manager</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('video_manager'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'video_manager' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="teacher-nav-video-manager"
            >
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>Video Manager</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('homework'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'homework' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Homework</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('practice_sets'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'practice_sets'
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
              }`}
              id="teacher-nav-ai-practice-gen"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Practice Sets</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('mock_tests'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'mock_tests'
                  ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/50'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
              }`}
              id="teacher-nav-ai-mock-generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400 animate-pulse" />
              <span>Mock Tests</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('class_discussion'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'class_discussion' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="teacher-nav-class-discussion"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Class Discussion</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('doubts'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'doubts' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />
              <span>Doubt Center</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('mdm_monitoring'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'mdm_monitoring' ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <span>MDM Monitoring</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveTab('profile'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Demo / Test Student Mode Toggle (Official MDM Presentation Mode) */}
            <DemoStudentToggle />

            {/* REQUIREMENT 4: REAL-TIME STUDENT ANALYTICS CARDS (REAL FIRESTORE DATA ONLY) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Real-Time Student Analytics (Live Firebase Firestore)
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Single Source of Truth: Firestore
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Total Students Joined */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Total Students Joined</span>
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{realStudentsCount}</span>
                    <span className="text-xs font-bold text-slate-500">Real</span>
                    {showDemoStudents && demoStudentsCount > 0 && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700 font-bold">|</span>
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400">+{demoStudentsCount}</span>
                        <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">Demo</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {showDemoStudents && demoStudentsCount > 0
                      ? `Real Students: ${realStudentsCount} • Demo/Test Students: ${demoStudentsCount}`
                      : (realStudentsCount === 0 ? 'No real students enrolled yet' : `${realStudentsCount} real verified student profiles`)}
                  </p>
                </div>

                {/* Metric 2: Students Who Have Logged In */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Logged In Students</span>
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <LogIn className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {loggedInStudentsCount}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {totalStudentsJoined === 0 
                      ? 'No students enrolled yet' 
                      : `${loggedInStudentsCount} of ${totalStudentsJoined} logged in at least once`}
                  </p>
                </div>

                {/* Metric 3: Recently Active Students */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Recently Active</span>
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{recentlyActiveStudentsCount}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {realStudents.filter(s => s.status === 'Online').length} currently online
                  </p>
                </div>

                {/* Metric 4: Last Student Login Time */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Last Student Login</span>
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white truncate">
                    {latestLoginTime}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {totalStudentsJoined > 0 ? 'Actual Firestore timestamp' : 'No logins recorded yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* REQUIREMENT 1: ASSIGNED CLASSES & REAL STUDENT ENROLLMENT */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <MyClasses
                currentUser={currentUser || null}
                students={realStudents}
                onSelectClass={(className, subject) => {
                  soundFx.playClick();
                  setSelectedClassForMgmt(className);
                  setSelectedSubjectForMgmt(subject);
                  setActiveTab('class_mgmt');
                }}
                onOpenTestFlow={() => setIsTestFlowOpen(true)}
              />
            </div>

            {/* Real-Time Teacher Notifications Feed */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Real-Time Teacher Notifications & Activity Feed
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Firebase Realtime Listener Active
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs text-center">
                  No notifications recorded yet. Live notifications will appear when students log in, submit homework, take tests, or register.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.slice(0, 10).map((n) => (
                    <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{n.title}</span>
                        <p className="text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostic Alert */}
            <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 space-y-4">
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>AI Automated Student Struggling Alert (Classroom Diagnostic)</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Sub-topics requiring revision in upcoming classes:
              </h3>

              {strugglingStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {strugglingStudents.map((student) => (
                    <div key={student.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        {student.grade}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{student.name}</h4>
                      <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                        ⚠️ Average Quiz Score: {student.quizScoreAvg}% (Needs Remedial Attention)
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-dashed border-amber-300 dark:border-amber-800/60">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    No student diagnostic alerts at this time. When enrolled students complete practice tests and quizzes, diagnostic insights will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('practice_sets')}
                  className="w-full h-full p-5 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-500/50 shadow-md hover:shadow-xl transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                  id="teacher-quick-action-ai-practice"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/30 text-yellow-300 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">AI Practice Generator</h4>
                    <p className="text-[10px] text-blue-200">Classes 5 to 10 Practice Sets</p>
                  </div>
                </button>
              </Modern3DCard>

              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('mock_tests')}
                  className="w-full h-full p-5 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white border border-purple-500/50 shadow-md hover:shadow-xl transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                  id="teacher-quick-action-ai-mock"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/30 text-yellow-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">AI Mock Test Studio</h4>
                    <p className="text-[10px] text-purple-200">Generate & Publish Tests Live</p>
                  </div>
                </button>
              </Modern3DCard>

              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('class_mgmt')}
                  className="w-full h-full p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/50 shadow-md hover:shadow-xl transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Classroom Directory</h4>
                    <p className="text-[10px] text-indigo-200">Monitor Classes 5 to 10 Live</p>
                  </div>
                </button>
              </Modern3DCard>

              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('homework')}
                  className="w-full h-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Assign & Grade Homework</h4>
                    <p className="text-[10px] text-slate-400">Target specific class grades</p>
                  </div>
                </button>
              </Modern3DCard>

              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('doubts')}
                  className="w-full h-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Student Doubt Center</h4>
                    <p className="text-[10px] text-slate-400">Answer with AI / PDF / Audio</p>
                  </div>
                </button>
              </Modern3DCard>

              <Modern3DCard depth={14} glare={true} className="rounded-3xl">
                <button
                  onClick={() => setActiveTab('class_discussion')}
                  className="w-full h-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Class Discussions</h4>
                    <p className="text-[10px] text-slate-400">Real-time chat & doubts</p>
                  </div>
                </button>
              </Modern3DCard>
            </div>
          </div>
        )}

        {/* Tab 2: Class Management */}
        {activeTab === 'class_mgmt' && (
          selectedClassForMgmt ? (
            <ClassManagement
              className={selectedClassForMgmt}
              subject={selectedSubjectForMgmt || 'Mathematics'}
              students={displayedStudents}
              onBack={() => setSelectedClassForMgmt(null)}
              onOpenTestFlow={() => setIsTestFlowOpen(true)}
              onSwitchClass={(newCls) => setSelectedClassForMgmt(newCls)}
            />
          ) : (
            <MyClasses
              currentUser={currentUser || null}
              students={displayedStudents}
              onSelectClass={(className, subject) => {
                soundFx.playClick();
                setSelectedClassForMgmt(className);
                setSelectedSubjectForMgmt(subject);
              }}
              onOpenTestFlow={() => setIsTestFlowOpen(true)}
            />
          )
        )}

        {/* Tab 3: Resource Manager */}
        {activeTab === 'resource_manager' && (
          <TeacherDigitalLibraryManager />
        )}

        {/* Tab 4: Video Manager */}
        {activeTab === 'video_manager' && (
          <TeacherCMSManager teacherName={currentUser?.name || "Mr. Ramesh Sharma"} initialTab="videos" />
        )}

        {/* Tab 5: Homework */}
        {activeTab === 'homework' && (
          <TeacherHomeworkView 
            currentUser={currentUser || null} 
            students={displayedStudents} 
          />
        )}

        {/* Tab 6: Practice Sets Studio */}
        {activeTab === 'practice_sets' && (
          <TeacherAIPracticeSetStudio
            currentUser={currentUser}
            onNavigateToMonitoring={() => setActiveTab('mdm_monitoring')}
          />
        )}

        {/* Tab 7: AI Mock Test Studio & Instant Student Publisher */}
        {activeTab === 'mock_tests' && (
          <TeacherAIMockTestStudio
            currentUser={currentUser}
            onNavigateToMonitoring={() => setActiveTab('mdm_monitoring')}
          />
        )}

        {/* Tab 8: Real-Time Firebase Class Discussion */}
        {activeTab === 'class_discussion' && (
          <ClassDiscussionManager
            currentUser={{
              uid: currentUser?.uid || 'teacher_ramesh_1',
              name: currentUser?.name || 'Mr. Ramesh Sharma (Teacher)',
              role: (currentUser?.role as string) === 'mdm' ? 'mdm' : 'teacher',
              email: currentUser?.email
            }}
          />
        )}

        {/* Tab 9: Student Doubt Center */}
        {activeTab === 'doubts' && <TeacherDoubtCenterView />}

        {/* Tab 10: MDM Live Mock Test Surveillance Tab */}
        {activeTab === 'mdm_monitoring' && (
          <MDMMockTestMonitoringView />
        )}

        {/* Tab 11: Profile */}
        {activeTab === 'profile' && <TeacherProfileView />}
      </div>

      {/* Test Real Student Flow Interactive Helper Modal */}
      <TestStudentFlowPanel
        isOpen={isTestFlowOpen}
        onClose={() => setIsTestFlowOpen(false)}
        currentClass={selectedClassForMgmt}
        students={realStudents}
      />
    </div>
  );
};
