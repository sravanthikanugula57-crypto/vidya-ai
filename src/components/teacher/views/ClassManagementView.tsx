import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  PhoneCall, 
  Filter, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Play, 
  Clock, 
  FileText, 
  CheckSquare, 
  X, 
  Smartphone, 
  Eye,
  ArrowLeft,
  Activity,
  AlertCircle,
  BrainCircuit,
  Award,
  Circle,
  Mail,
  UserCheck,
  UserPlus,
  Trash2,
  Calendar,
  LogIn
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  subscribeToRealStudents, 
  RealStudentProfile, 
  subscribeToTeacherHomework,
  subscribeToHomeworkSubmissions,
  TeacherHomeworkItem,
  HomeworkSubmissionDoc,
  createRealTestStudent,
  deleteRealStudent
} from '../../../services/studentFirestoreService';

const CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export interface ClassManagementViewProps {
  initialSelectedClass?: string | null;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({ initialSelectedClass = null }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(initialSelectedClass);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline' | 'low_perf' | 'top_perf' | 'hw_pending' | 'hw_submitted'>('all');
  
  const [students, setStudents] = useState<RealStudentProfile[]>([]);
  const [homeworkList, setHomeworkList] = useState<TeacherHomeworkItem[]>([]);
  const [submissionsList, setSubmissionsList] = useState<HomeworkSubmissionDoc[]>([]);
  const [selectedStudentModal, setSelectedStudentModal] = useState<RealStudentProfile | null>(null);

  // Test Student Creation Modal State
  const [showTestStudentModal, setShowTestStudentModal] = useState(false);
  const [testStudentName, setTestStudentName] = useState('');
  const [testStudentClass, setTestStudentClass] = useState<number>(5);
  const [testStudentLang, setTestStudentLang] = useState('te');
  const [testStudentOnline, setTestStudentOnline] = useState(true);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  useEffect(() => {
    if (initialSelectedClass) {
      setSelectedClass(initialSelectedClass);
    }
  }, [initialSelectedClass]);

  useEffect(() => {
    // Real-time listener for registered students from Firestore
    const unsubStudents = subscribeToRealStudents((data) => {
      setStudents(data);
    });

    // Real-time listener for homeworks
    const unsubHw = subscribeToTeacherHomework(undefined, (hwData) => {
      setHomeworkList(hwData);
    });

    // Real-time listener for homework submissions
    const unsubSubmissions = subscribeToHomeworkSubmissions((subData) => {
      setSubmissionsList(subData);
    });

    return () => {
      unsubStudents();
      unsubHw();
      unsubSubmissions();
    };
  }, []);

  // Robust class matcher for student documents
  const isStudentInClass = (s: RealStudentProfile, clsName: string) => {
    const clsNum = parseInt(clsName.replace(/\D/g, ''), 10);
    const stuNum = typeof s.class === 'number' ? s.class : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
    return s.grade === clsName || stuNum === clsNum || s.grade === `Class ${clsNum}`;
  };

  // Compute metrics for each class strictly from real Firestore data
  const getClassMetrics = (clsName: string) => {
    const classStudents = students.filter(s => isStudentInClass(s, clsName));
    const totalStudents = classStudents.length;
    
    const onlineStudents = classStudents.filter(s => s.status === 'Online');
    const offlineStudents = classStudents.filter(s => s.status === 'Offline' || !s.status);
    const idleStudents = classStudents.filter(s => s.status === 'Idle');
    
    // Today's logins
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogins = classStudents.filter(s => {
      const login = s.lastLoginAt || s.lastLogin || '';
      return login.includes(todayStr) || s.status === 'Online';
    }).length;

    // Active activities strictly from real data
    const studyingNowCount = classStudents.filter(s => s.status === 'Online' && (s.currentActivity?.includes('Studying') || s.currentActivity?.includes('Reading') || s.currentActivity?.includes('Learning'))).length;
    const watchingVideosCount = classStudents.filter(s => s.status === 'Online' && (s.currentActivity?.includes('Video') || s.currentActivity?.includes('Watching'))).length;
    const aiTutorActiveCount = classStudents.filter(s => s.status === 'Online' && (s.aiTutorStatus === 'Active' || s.currentActivity?.includes('AI Tutor'))).length;
    const mockTestsRunningCount = classStudents.filter(s => s.status === 'Online' && (s.mockTestStatus === 'In Progress' || s.currentActivity?.includes('Mock Test'))).length;

    // Homework for this class
    const classHws = homeworkList.filter(h => h.targetGrade === clsName);
    const classSubmissions = submissionsList.filter(sub => sub.studentGrade === clsName);

    const homeworkSubmittedCount = classSubmissions.length;
    const homeworkPendingCount = Math.max(0, (classHws.length * totalStudents) - homeworkSubmittedCount);

    // Progress and scores
    const avgProgress = totalStudents > 0 
      ? Math.round(classStudents.reduce((acc, s) => acc + (s.progressPercentage || 0), 0) / totalStudents)
      : 0;
    
    const avgScore = totalStudents > 0
      ? Math.round(classStudents.reduce((acc, s) => acc + (s.averageMockTestScore || s.quizScoreAvg || 0), 0) / totalStudents)
      : 0;

    const avgStudyMinutes = totalStudents > 0
      ? Math.round(classStudents.reduce((acc, s) => acc + (s.studyTimeTodayMinutes || 0), 0) / totalStudents)
      : 0;
    const avgStudyTimeDisplay = avgStudyMinutes > 60 
      ? `${(avgStudyMinutes / 60).toFixed(1)} Hrs` 
      : `${avgStudyMinutes} Mins`;

    const lastActivityTime = classStudents.length > 0 && classStudents[0].lastActiveTime ? classStudents[0].lastActiveTime : 'None';

    return {
      totalStudents,
      onlineStudentsCount: onlineStudents.length,
      offlineStudentsCount: offlineStudents.length,
      idleStudentsCount: idleStudents.length,
      todaysLogins,
      studyingNowCount,
      watchingVideosCount,
      aiTutorActiveCount,
      mockTestsRunningCount,
      homeworkPending: homeworkPendingCount,
      homeworkSubmitted: homeworkSubmittedCount,
      avgProgress,
      avgScore,
      avgStudyTimeDisplay,
      lastActivityTime
    };
  };

  // Filter students for the selected class
  const selectedClassStudents = selectedClass ? students.filter(s => isStudentInClass(s, selectedClass)) : [];
  
  const filteredStudents = selectedClassStudents.filter(student => {
    const query = searchTerm.toLowerCase();
    const matchesQuery = 
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (activeFilter === 'online') return student.status === 'Online';
    if (activeFilter === 'offline') return student.status === 'Offline';
    if (activeFilter === 'low_perf') return (student.mockTestsCompleted || 0) < 2;
    if (activeFilter === 'top_perf') return (student.lessonsCompleted || 0) > 10;
    if (activeFilter === 'hw_pending') return (student.homeworkSubmitted || 0) < 3;
    if (activeFilter === 'hw_submitted') return (student.homeworkSubmitted || 0) >= 3;

    return true;
  });

  const selectedClassMetrics = selectedClass ? getClassMetrics(selectedClass) : null;

  const handleCreateTestStudent = async () => {
    if (!testStudentName.trim()) return;
    setIsCreatingStudent(true);
    try {
      await createRealTestStudent({
        name: testStudentName.trim(),
        class: testStudentClass,
        board: 'AP_SSC',
        preferredLanguage: testStudentLang,
        isOnlineNow: testStudentOnline
      });
      soundFx.playSuccess();
      setShowTestStudentModal(false);
      setTestStudentName('');
    } catch (err) {
      console.error("Error creating test student:", err);
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleDeleteStudent = async (uid: string) => {
    if (!uid) return;
    try {
      await deleteRealStudent(uid);
      soundFx.playClick();
      if (selectedStudentModal?.uid === uid || selectedStudentModal?.id === uid) {
        setSelectedStudentModal(null);
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in text-slate-900 dark:text-slate-100 font-sans">
      {/* Top LMS Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>School Learning Management System (LMS) • Real-Time Firebase Data</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Classroom & Real Student Analytics</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Live updates connected directly to Firebase Firestore. Monitor real-time student count, online presence, study activity, and login timestamps for Class 5 to 10.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              if (selectedClass) {
                const clsNum = parseInt(selectedClass.replace(/\D/g, ''), 10);
                if (!isNaN(clsNum)) setTestStudentClass(clsNum);
              }
              setShowTestStudentModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Real Test Student</span>
          </button>

          {selectedClass && (
            <button
              onClick={() => { soundFx.playClick(); setSelectedClass(null); }}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to 6-Class Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: 6-CLASS DASHBOARD CARDS */}
      {!selectedClass ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Active School Classes Overview
              </h3>
              <p className="text-xs text-slate-500">
                Click any class card to view real-time student directory, live status, and enrolled student profiles.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              🟢 Live Firestore Listeners Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CLASSES.map((clsName) => {
              const metrics = getClassMetrics(clsName);
              return (
                <div
                  key={clsName}
                  onClick={() => { soundFx.playClick(); setSelectedClass(clsName); }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between space-y-5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg group-hover:scale-105 transition">
                        {clsName.replace('Class ', '')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                          {clsName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          AP State Board (AP_SSC)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{metrics.onlineStudentsCount} Online</span>
                    </div>
                  </div>

                  {/* Highlight: Real Students Joined */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Students Joined:</span>
                    <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl ${
                      metrics.totalStudents > 0 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {metrics.totalStudents > 0 ? `${metrics.totalStudents} Enrolled` : '0 / No students enrolled yet'}
                    </span>
                  </div>

                  {/* Metrics Grid inside Card */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-800/80 py-3.5">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Online / Offline</div>
                      <div className="text-xs font-black text-emerald-600">🟢 {metrics.onlineStudentsCount} / 🔴 {metrics.offlineStudentsCount}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Logged In Today</div>
                      <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">📅 {metrics.todaysLogins}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Studying Now</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">📖 {metrics.studyingNowCount}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Homework Status</div>
                      <div className="text-xs font-black text-emerald-600">📝 {metrics.homeworkPending} Pend / ✅ {metrics.homeworkSubmitted} Sub</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">AI Tutor Active</div>
                      <div className="text-xs font-bold text-sky-600">🧠 {metrics.aiTutorActiveCount}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Test Score</div>
                      <div className="text-xs font-black text-purple-600">🎯 {metrics.avgScore}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition">
                    <span>Click to view student list & live activity</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: SPECIFIC CLASS DETAILS & STUDENT LIST */
        <div className="space-y-6">
          {/* Class Analytics Banner */}
          {selectedClassMetrics && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                    Detailed Real-Time Class Analytics
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedClass} Student Directory & Live Monitoring
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    🟢 {selectedClassMetrics.onlineStudentsCount} Online
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    🟡 {selectedClassMetrics.idleStudentsCount} Idle
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    🔴 {selectedClassMetrics.offlineStudentsCount} Offline
                  </span>
                  <button
                    onClick={() => {
                      const clsNum = parseInt(selectedClass.replace(/\D/g, ''), 10);
                      if (!isNaN(clsNum)) setTestStudentClass(clsNum);
                      setShowTestStudentModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Enroll to {selectedClass}</span>
                  </button>
                </div>
              </div>

              {/* Class Analytics Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Students Enrolled</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedClassMetrics.totalStudents}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Today's Attendance</div>
                  <div className="text-base font-black text-indigo-600 mt-0.5">{selectedClassMetrics.todaysLogins} Logins</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Homework Submitted</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{selectedClassMetrics.homeworkSubmitted}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Homework Pending</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">{selectedClassMetrics.homeworkPending}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Avg Mock Test Score</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{selectedClassMetrics.avgScore}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 font-bold">Average Study Time</div>
                  <div className="text-base font-black text-purple-600 mt-0.5">{selectedClassMetrics.avgStudyTimeDisplay}</div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by Name, Roll Number, or Email..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Students ({selectedClassStudents.length})
              </button>
              <button
                onClick={() => setActiveFilter('online')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'online' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                🟢 Online ({selectedClassStudents.filter(s => s.status === 'Online').length})
              </button>
              <button
                onClick={() => setActiveFilter('offline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'offline' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}
              >
                🔴 Offline ({selectedClassStudents.filter(s => s.status === 'Offline' || !s.status).length})
              </button>
              <button
                onClick={() => setActiveFilter('low_perf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'low_perf' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                ⚠️ Low Performance
              </button>
              <button
                onClick={() => setActiveFilter('top_perf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'top_perf' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                🌟 Top Performers
              </button>
            </div>
          </div>

          {/* Student Roster Cards */}
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                  No students enrolled yet.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  There are currently no real students registered in {selectedClass} on Firebase Firestore. Real students who register with role &quot;student&quot; in {selectedClass} will appear here dynamically.
                </p>
              </div>
              <div>
                <button
                  onClick={() => {
                    const clsNum = parseInt(selectedClass.replace(/\D/g, ''), 10);
                    if (!isNaN(clsNum)) setTestStudentClass(clsNum);
                    setShowTestStudentModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Enroll Real Test Student to {selectedClass}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student) => {
                const statusColor = student.status === 'Online' ? 'bg-emerald-500' : 'bg-rose-500';
                const currentActivity = student.currentActivity || student.recentActivity || 'No active study session';
                const joinedDateStr = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Enrolled';
                const lastLoginStr = student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (student.lastLogin || 'Never');
                const lastActiveStr = student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (student.lastActiveTime || 'Never');

                return (
                  <div
                    key={student.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    {/* Header with Photo & Live Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={student.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
                            alt={student.name}
                            className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${statusColor} border-2 border-white dark:border-slate-900`} />
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {student.name}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-400 block">
                            Roll #{student.rollNumber || `AP-${student.class || 5}-${student.id.substring(0, 4)}`} • {student.board || 'AP_SSC'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        student.status === 'Online' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {student.status === 'Online' ? '🟢 Online' : '🔴 Offline'}
                      </span>
                    </div>

                    {/* Live Activity Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
                        <span>Current Learning Activity</span>
                        <span className="text-emerald-600 font-black">{student.lastActiveTime || 'Just now'}</span>
                      </div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        <span className="truncate">{currentActivity}</span>
                      </div>
                    </div>

                    {/* Details Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Email</span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate block">{student.email}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Mock Test Status</span>
                        <span className={`font-semibold block truncate ${(student.mockTestsCompleted || 0) > 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {(student.mockTestsCompleted || 0) > 0 ? `${student.mockTestsCompleted} Taken` : 'No mock test attempted yet'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Video Lessons</span>
                        <span className={`font-semibold block truncate ${(student.videosWatched || 0) > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {(student.videosWatched || 0) > 0 ? `${student.videosWatched} Watched` : '0% (Not started)'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Last Active</span>
                        <span className="font-semibold text-emerald-600 block truncate">{lastActiveStr}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedStudentModal(student)}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-extrabold text-xs text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(student.uid || student.id)}
                        title="Remove student record from Firestore"
                        className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ENROLL REAL TEST STUDENT IN FIREBASE */}
      {showTestStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-600">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Enroll Real Test Student
                </h3>
              </div>
              <button
                onClick={() => setShowTestStudentModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Creates a real student document in Firebase Firestore (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600">users</code> collection) with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600">role: &quot;student&quot;</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600">board: &quot;AP_SSC&quot;</code>. The teacher dashboard and class counts will update instantly.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={testStudentName}
                  onChange={(e) => setTestStudentName(e.target.value)}
                  placeholder="e.g. K. Sai Kumar or Ananya Reddy"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Class
                  </label>
                  <select
                    value={testStudentClass}
                    onChange={(e) => setTestStudentClass(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {[5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Language Medium
                  </label>
                  <select
                    value={testStudentLang}
                    onChange={(e) => setTestStudentLang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="te">Telugu Medium</option>
                    <option value="en">English Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">Set Status to Online Now:</span>
                <input
                  type="checkbox"
                  checked={testStudentOnline}
                  onChange={(e) => setTestStudentOnline(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Quick sample name pills */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Quick Name Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['K. Sai Kumar', 'Ananya Reddy', 'M. Venkatesh', 'P. Sneha', 'T. Rahul'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setTestStudentName(name)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowTestStudentModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isCreatingStudent || !testStudentName.trim()}
                onClick={handleCreateTestStudent}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-lg transition cursor-pointer"
              >
                {isCreatingStudent ? 'Writing to Firestore...' : 'Save to Firestore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT FULL DIAGNOSTIC MODAL */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStudentModal.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudentModal.name}`}
                  alt={selectedStudentModal.name}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover"
                />
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {selectedStudentModal.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {selectedStudentModal.grade} • Board: {selectedStudentModal.board || 'AP_SSC'} • Role: {selectedStudentModal.role || 'student'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentModal(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Firestore UID</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block truncate">{selectedStudentModal.uid || selectedStudentModal.id}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Email</span>
                  <span className="font-extrabold text-slate-900 dark:text-white truncate block">{selectedStudentModal.email}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Enrolled Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedStudentModal.createdAt ? new Date(selectedStudentModal.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Preferred Language</span>
                  <span className="font-extrabold text-emerald-600">
                    {selectedStudentModal.preferredLanguage === 'te' ? 'Telugu (te)' : 'English (en)'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Last Login Timestamp</span>
                  <span className="font-extrabold text-indigo-600 truncate block">
                    {selectedStudentModal.lastLoginAt ? new Date(selectedStudentModal.lastLoginAt).toLocaleString() : (selectedStudentModal.lastLogin || 'Never')}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 font-bold block">Last Active Timestamp</span>
                  <span className="font-extrabold text-emerald-600 truncate block">
                    {selectedStudentModal.lastActiveAt ? new Date(selectedStudentModal.lastActiveAt).toLocaleString() : (selectedStudentModal.lastActiveTime || 'Never')}
                  </span>
                </div>
              </div>

              {/* Current Learning Activity */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Current Learning Activity</span>
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>{selectedStudentModal.currentActivity || selectedStudentModal.recentActivity || 'No active session'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>Learning Progress Breakdown</span>
                  <span className="text-[10px] font-bold text-slate-500">Live Firebase Data</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60">
                    <span className="text-slate-400 text-[10px] block">Lessons</span>
                    <div className="font-black text-slate-900 dark:text-white">{selectedStudentModal.lessonsCompleted || 0} Done</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60">
                    <span className="text-slate-400 text-[10px] block">Videos</span>
                    <div className="font-black text-slate-900 dark:text-white">
                      {(selectedStudentModal.videosWatched || 0) > 0 ? `${selectedStudentModal.videosWatched} Watched` : '0% (Not started)'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60">
                    <span className="text-slate-400 text-[10px] block">Mock Tests</span>
                    <div className="font-black text-slate-900 dark:text-white">
                      {(selectedStudentModal.mockTestsCompleted || 0) > 0 
                        ? `${selectedStudentModal.mockTestsCompleted} Taken` 
                        : 'No mock test attempted yet'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDeleteStudent(selectedStudentModal.uid || selectedStudentModal.id)}
                className="px-4 py-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
              </button>

              <button
                onClick={() => setSelectedStudentModal(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs shadow cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
