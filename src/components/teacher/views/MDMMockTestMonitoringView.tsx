import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  BarChart3,
  RefreshCw,
  Eye,
  Check,
  Zap,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle,
  HelpCircle,
  Send
} from 'lucide-react';
import { QuizAttemptDoc } from '../../../types/quiz';
import { subscribeToAllQuizAttempts } from '../../../services/quizService';
import { PracticeAttemptDoc, subscribeToAllPracticeAttempts } from '../../../services/practiceService';
import { 
  RealHomeworkDoc, 
  RealHomeworkSubmissionDoc, 
  subscribeAllHomeworkSubmissions, 
  subscribeTeacherHomeworkList,
  teacherReviewHomeworkSubmission,
  normalizeSubmissionStatus,
  formatSubmissionStatusBadge,
  extractGradeNum
} from '../../../services/realHomeworkService';
import { RealStudentProfile, subscribeToRealStudents } from '../../../services/studentFirestoreService';
import { soundFx } from '../../../lib/audio';
import { DemoStudentToggle } from '../../common/DemoStudentToggle';
import { 
  getShowDemoStudents, 
  subscribeDemoToggle, 
  isDemoRecord 
} from '../../../services/demoStudentService';

export type MonitoringMode = 'assignments' | 'practice_sets' | 'mock_tests';

interface MDMMockTestMonitoringViewProps {
  initialMode?: MonitoringMode;
}

export const MDMMockTestMonitoringView: React.FC<MDMMockTestMonitoringViewProps> = ({
  initialMode = 'assignments'
}) => {
  const [monitoringMode, setMonitoringMode] = useState<MonitoringMode>(initialMode);
  
  // Real Homework & Submissions State (Firestore onSnapshot)
  const [homeworkList, setHomeworkList] = useState<RealHomeworkDoc[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<RealHomeworkSubmissionDoc[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<RealStudentProfile[]>([]);
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Submission for Teacher Audit & Grading Modal
  const [selectedSubmissionAudit, setSelectedSubmissionAudit] = useState<RealHomeworkSubmissionDoc | null>(null);
  const [subjectiveMarksInput, setSubjectiveMarksInput] = useState<Record<string, number>>({});
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState<boolean>(false);

  // Practice Attempts State (Real-time onSnapshot)
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttemptDoc[]>([]);
  
  // Mock Test Attempts State (Real-time onSnapshot)
  const [mockAttempts, setMockAttempts] = useState<QuizAttemptDoc[]>([]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Drilldown modals
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [selectedPracticeAttemptDetail, setSelectedPracticeAttemptDetail] = useState<PracticeAttemptDoc | null>(null);
  const [selectedMockAttemptDetail, setSelectedMockAttemptDetail] = useState<QuizAttemptDoc | null>(null);

  // 1. Real-time listener for Real Homework Submissions
  useEffect(() => {
    const unsubSubs = subscribeAllHomeworkSubmissions((subs) => {
      setHomeworkSubmissions(subs);
    });

    const unsubHw = subscribeTeacherHomeworkList(undefined, (list) => {
      setHomeworkList(list);
    });

    const unsubStudents = subscribeToRealStudents((students) => {
      setEnrolledStudents(students);
    });

    return () => {
      unsubSubs();
      unsubHw();
      unsubStudents();
    };
  }, []);

  // 2. Real-time listener for Practice Attempts (Requirements 9 & 10)
  useEffect(() => {
    const unsub = subscribeToAllPracticeAttempts((data) => {
      setPracticeAttempts(data);
    });
    return () => unsub();
  }, []);

  // 3. Real-time listener for Mock Test Attempts
  useEffect(() => {
    const unsub = subscribeToAllQuizAttempts((data) => {
      setMockAttempts(data);
    });
    return () => unsub();
  }, []);

  // 4. Demo Student Visibility Toggle for MDM Presentation
  const [showDemoStudents, setShowDemoStudents] = useState<boolean>(getShowDemoStudents());

  useEffect(() => {
    const unsubDemo = subscribeDemoToggle((val) => {
      setShowDemoStudents(val);
    });
    return () => unsubDemo();
  }, []);

  // Filter datasets based on showDemoStudents setting
  const effectivePracticeAttempts = showDemoStudents
    ? practiceAttempts
    : practiceAttempts.filter(att => !isDemoRecord(att));

  const effectiveMockAttempts = showDemoStudents
    ? mockAttempts
    : mockAttempts.filter(att => !isDemoRecord(att));

  const effectiveHomeworkSubmissions = showDemoStudents
    ? homeworkSubmissions
    : homeworkSubmissions.filter(sub => !isDemoRecord(sub));

  const effectiveEnrolledStudents = showDemoStudents
    ? enrolledStudents
    : enrolledStudents.filter(s => !isDemoRecord(s));

  // Filter Practice Attempts
  const filteredPracticeAttempts = effectivePracticeAttempts.filter((att) => {
    const matchesSearch =
      (att.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.studentEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.practiceSetTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.chapterName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === 'all' ||
      String(att.class).toLowerCase().includes(String(classFilter).toLowerCase()) ||
      String(classFilter).toLowerCase().includes(String(att.class).toLowerCase());

    const matchesSubject =
      subjectFilter === 'all' || (att.subject || att.subjectName) === subjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Filter Mock Test Attempts
  const filteredMockAttempts = effectiveMockAttempts.filter((att) => {
    const matchesSearch =
      (att.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.studentEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.quizTitle || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === 'all' || String(att.class) === String(classFilter);

    const matchesSubject =
      subjectFilter === 'all' || att.subject === subjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Unique list of subjects
  const subjectsList = Array.from(new Set(
    monitoringMode === 'practice_sets'
      ? effectivePracticeAttempts.map(a => a.subject || a.subjectName).filter(Boolean)
      : effectiveMockAttempts.map(a => a.subject).filter(Boolean)
  ));

  // Aggregate Stats for Practice Sets
  const totalPracticeAttempts = effectivePracticeAttempts.length;
  const avgPracticePercentage = totalPracticeAttempts > 0
    ? Math.round(effectivePracticeAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalPracticeAttempts)
    : 0;
  const topPracticeScore = totalPracticeAttempts > 0
    ? Math.max(...effectivePracticeAttempts.map(a => a.score || 0))
    : 0;

  // Published homeworks
  const publishedHomeworks = homeworkList.filter(h => h.status === 'published');

  // Build Real Assignment Rows comparing enrolled students with real submissions (Requirements 8 & 9)
  interface AssignmentMonitoringRow {
    key: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    class: string;
    assignmentId: string;
    assignmentTitle: string;
    subject: string;
    chapter: string;
    status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded' | 'Late';
    statusCode: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'late';
    submittedAt?: string;
    scoreStr: string;
    scoreVal: number;
    maxScore: number;
    percentage: number;
    isDemo?: boolean;
    submissionDoc?: RealHomeworkSubmissionDoc;
    homeworkDoc?: RealHomeworkDoc;
  }

  const activeAssignments = selectedAssignmentFilter === 'all'
    ? publishedHomeworks
    : publishedHomeworks.filter(h => h.id === selectedAssignmentFilter);

  const assignmentRows: AssignmentMonitoringRow[] = [];

  activeAssignments.forEach((hw) => {
    const hwGradeNum = extractGradeNum(hw.class);
    // Real enrolled students for this class (or demo if enabled)
    const classEnrolled = effectiveEnrolledStudents.filter(s => {
      const sGradeNum = typeof s.class === 'number'
        ? s.class
        : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
      return sGradeNum === hwGradeNum || s.grade === hw.class || s.grade === `Class ${hwGradeNum}`;
    });

    const accountedStudentKeys = new Set<string>();

    classEnrolled.forEach((stu) => {
      const stuKey = stu.uid || stu.id;
      accountedStudentKeys.add(stuKey);
      if (stu.id) accountedStudentKeys.add(stu.id);
      if (stu.email) accountedStudentKeys.add(stu.email);

      const sub = effectiveHomeworkSubmissions.find(s => 
        (s.homeworkId === hw.id || s.assignmentId === hw.id) &&
        (s.studentId === stu.uid || s.studentId === stu.id || (stu.email && s.studentEmail === stu.email))
      );

      let status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded' | 'Late' = 'Not Started';
      let statusCode: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'late' = 'not_started';
      let scoreStr = '—';
      let scoreVal = 0;
      let maxScore = hw.totalMarks || 10;
      let percentage = 0;

      if (sub) {
        statusCode = normalizeSubmissionStatus(sub.status);
        if (statusCode === 'submitted') {
          status = 'Submitted';
        } else if (statusCode === 'graded') {
          status = 'Graded';
        } else if (statusCode === 'late') {
          status = 'Late';
        } else if (statusCode === 'in_progress') {
          status = 'In Progress';
        }

        scoreVal = sub.score || 0;
        maxScore = sub.maxScore || hw.totalMarks || 10;
        percentage = sub.percentage ?? Math.round((scoreVal / (maxScore || 1)) * 100);
        scoreStr = `${scoreVal} / ${maxScore} (${percentage}%)`;
      }

      assignmentRows.push({
        key: `${hw.id}_${stu.uid || stu.id}`,
        studentId: stu.uid || stu.id,
        studentName: stu.name,
        studentEmail: stu.email || '',
        class: hw.class,
        assignmentId: hw.id,
        assignmentTitle: hw.title,
        subject: hw.subject,
        chapter: hw.chapterName,
        status,
        statusCode,
        submittedAt: sub?.submittedAt,
        scoreStr: (status === 'Submitted' || status === 'Graded' || status === 'Late') ? scoreStr : (status === 'In Progress' ? 'In Progress' : '—'),
        scoreVal,
        maxScore,
        percentage,
        isDemo: isDemoRecord(stu) || isDemoRecord(sub),
        submissionDoc: sub,
        homeworkDoc: hw
      });
    });

    // Also include any submissions that were logged from students not currently matched in class list
    effectiveHomeworkSubmissions.filter(s => (s.homeworkId === hw.id || s.assignmentId === hw.id)).forEach((sub) => {
      if (!accountedStudentKeys.has(sub.studentId) && (!sub.studentEmail || !accountedStudentKeys.has(sub.studentEmail))) {
        const statusCode = normalizeSubmissionStatus(sub.status);
        let status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded' | 'Late' = 'Submitted';
        if (statusCode === 'graded') status = 'Graded';
        else if (statusCode === 'late') status = 'Late';
        else if (statusCode === 'in_progress') status = 'In Progress';

        const scoreVal = sub.score || 0;
        const maxScore = sub.maxScore || hw.totalMarks || 10;
        const percentage = sub.percentage ?? Math.round((scoreVal / (maxScore || 1)) * 100);

        assignmentRows.push({
          key: `${hw.id}_${sub.studentId}`,
          studentId: sub.studentId,
          studentName: sub.studentName,
          studentEmail: sub.studentEmail || '',
          class: sub.class || hw.class,
          assignmentId: hw.id,
          assignmentTitle: hw.title,
          subject: hw.subject,
          chapter: hw.chapterName,
          status,
          statusCode,
          submittedAt: sub.submittedAt,
          scoreStr: `${scoreVal} / ${maxScore} (${percentage}%)`,
          scoreVal,
          maxScore,
          percentage,
          isDemo: isDemoRecord(sub),
          submissionDoc: sub,
          homeworkDoc: hw
        });
      }
    });
  });

  // Filtered Assignment Rows
  const filteredAssignmentRows = assignmentRows.filter((row) => {
    const matchesSearch =
      row.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === 'all' ||
      String(row.class).toLowerCase().includes(String(classFilter).toLowerCase());

    const matchesSubject =
      subjectFilter === 'all' || row.subject === subjectFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'submitted' && (row.statusCode === 'submitted' || row.statusCode === 'late')) ||
      (statusFilter === 'graded' && row.statusCode === 'graded') ||
      (statusFilter === 'in_progress' && row.statusCode === 'in_progress') ||
      (statusFilter === 'not_started' && row.statusCode === 'not_started');

    return matchesSearch && matchesClass && matchesSubject && matchesStatus;
  });

  // Dynamic Metrics for Assignments (Requirements 8 & 9)
  const countAssignmentSubmissions = assignmentRows.filter(r => r.statusCode === 'submitted' || r.statusCode === 'graded' || r.statusCode === 'late').length;
  const countAssignmentInProgress = assignmentRows.filter(r => r.statusCode === 'in_progress').length;
  const countAssignmentNotStarted = assignmentRows.filter(r => r.statusCode === 'not_started').length;
  const submittedRows = assignmentRows.filter(r => r.statusCode === 'submitted' || r.statusCode === 'graded' || r.statusCode === 'late');
  const avgAssignmentScore = submittedRows.length > 0
    ? Math.round(submittedRows.reduce((sum, r) => sum + r.percentage, 0) / submittedRows.length)
    : 0;

  // Selected student's records (Practice Sets)
  const studentPracticeAttempts = selectedStudentEmail
    ? practiceAttempts.filter((a) => a.studentEmail === selectedStudentEmail)
    : [];
  const studentPracticeProfile = studentPracticeAttempts.length > 0 ? studentPracticeAttempts[0] : null;

  // Selected student's records (Mock Tests)
  const studentMockAttempts = selectedStudentEmail
    ? mockAttempts.filter((a) => a.studentEmail === selectedStudentEmail)
    : [];
  const studentMockProfile = studentMockAttempts.length > 0 ? studentMockAttempts[0] : null;

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Handler to open submission audit modal (Requirement 12)
  const handleOpenSubmissionAudit = (sub: RealHomeworkSubmissionDoc) => {
    soundFx.playClick();
    setSelectedSubmissionAudit(sub);
    setTeacherFeedbackInput(sub.teacherFeedback || '');
    setReviewSavedSuccess(false);

    // Populate initial subjective marks
    const initialMarks: Record<string, number> = {};
    if (sub.answers) {
      Object.keys(sub.answers).forEach((qId) => {
        initialMarks[qId] = sub.answers[qId].marksAwarded || 0;
      });
    }
    setSubjectiveMarksInput(initialMarks);
  };

  const handleSaveTeacherAudit = async () => {
    if (!selectedSubmissionAudit) return;
    soundFx.playClick();
    setIsSavingReview(true);
    try {
      await teacherReviewHomeworkSubmission({
        submissionId: selectedSubmissionAudit.id,
        subjectiveMarks: subjectiveMarksInput,
        teacherFeedback: teacherFeedbackInput,
        reviewerName: 'Teacher'
      });
      soundFx.playSuccess();
      setReviewSavedSuccess(true);
      setTimeout(() => {
        setIsSavingReview(false);
      }, 500);
    } catch (e) {
      console.error('Failed to save teacher review:', e);
      setIsSavingReview(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Vidya AI Live Surveillance Hub</span>
          </div>
          <h2 className="text-2xl font-black">Real-Time Practice & Assessment Monitoring</h2>
          <p className="text-xs text-blue-200">
            Live real-time stream of student submissions directly from Firestore database.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                soundFx.playClick();
                setMonitoringMode('assignments');
                setSelectedStudentEmail(null);
              }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                monitoringMode === 'assignments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-300" />
              <span>Assignments / Homework</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMonitoringMode('practice_sets');
                setSelectedStudentEmail(null);
              }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                monitoringMode === 'practice_sets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Practice Sets</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMonitoringMode('mock_tests');
                setSelectedStudentEmail(null);
              }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                monitoringMode === 'mock_tests'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-300" />
              <span>Mock Tests</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-sm border border-white/10 text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Live Sync: ON</span>
          </div>
        </div>
      </div>

      {/* Demo Student Toggle for Official MDM Assessment Surveillance */}
      <DemoStudentToggle />

      {/* Aggregate Metric Cards */}
      {monitoringMode === 'assignments' ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Total Published</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {publishedHomeworks.length}
            </div>
            <p className="text-[11px] font-bold text-blue-600">Active assignments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-emerald-600">Submissions</span>
            <div className="text-3xl font-black text-emerald-600">
              {countAssignmentSubmissions}
            </div>
            <p className="text-[11px] font-bold text-slate-500">Submitted & graded</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-amber-600">In Progress</span>
            <div className="text-3xl font-black text-amber-600">
              {countAssignmentInProgress}
            </div>
            <p className="text-[11px] font-bold text-slate-500">Drafting answers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-rose-600">Not Started</span>
            <div className="text-3xl font-black text-rose-600">
              {countAssignmentNotStarted}
            </div>
            <p className="text-[11px] font-bold text-slate-500">Enrolled students</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-indigo-600">Average Score</span>
            <div className="text-3xl font-black text-indigo-600">
              {avgAssignmentScore}%
            </div>
            <p className="text-[11px] font-bold text-slate-500">Class performance</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Total Attempts Logged</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {monitoringMode === 'practice_sets' ? totalPracticeAttempts : effectiveMockAttempts.length}
            </div>
            <p className="text-[11px] font-bold text-blue-600">
              {showDemoStudents 
                ? (monitoringMode === 'practice_sets'
                    ? `${practiceAttempts.filter(a => !isDemoRecord(a)).length} Real • ${practiceAttempts.filter(a => isDemoRecord(a)).length} Demo/Test`
                    : `${mockAttempts.filter(a => !isDemoRecord(a)).length} Real • ${mockAttempts.filter(a => isDemoRecord(a)).length} Demo/Test`)
                : 'Active student submissions'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-indigo-600">Average Performance</span>
            <div className="text-3xl font-black text-indigo-600">
              {monitoringMode === 'practice_sets' ? `${avgPracticePercentage}%` : `${Math.round(effectiveMockAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / (effectiveMockAttempts.length || 1))}%`}
            </div>
            <p className="text-[11px] font-bold text-slate-500">Mean accuracy rate</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-emerald-600">Top Score Recorded</span>
            <div className="text-3xl font-black text-emerald-600">
              {monitoringMode === 'practice_sets' ? topPracticeScore : Math.max(...effectiveMockAttempts.map(a => a.score || 0), 0)} <span className="text-xs text-slate-400">pts</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500">Live high watermark</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-purple-600">Active Students</span>
            <div className="text-3xl font-black text-purple-600">
              {new Set((monitoringMode === 'practice_sets' ? effectivePracticeAttempts : effectiveMockAttempts).map(a => a.studentEmail || a.studentId)).size}
            </div>
            <p className="text-[11px] font-bold text-slate-500">Unique participants</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={
              monitoringMode === 'assignments'
                ? 'Search student name, email, assignment title, or chapter...'
                : monitoringMode === 'practice_sets'
                ? 'Search student name, email, practice set, or chapter...'
                : 'Search student name, email, or mock test title...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Classes</option>
            <option value="10">Class 10</option>
            <option value="9">Class 9</option>
            <option value="8">Class 8</option>
            <option value="7">Class 7</option>
            <option value="6">Class 6</option>
            <option value="5">Class 5</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjectsList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {monitoringMode === 'assignments' && (
            <>
              <select
                value={selectedAssignmentFilter}
                onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none max-w-[200px] truncate"
              >
                <option value="all">All Assignments</option>
                {publishedHomeworks.map((hw) => (
                  <option key={hw.id} value={hw.id}>
                    {hw.class} - {hw.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="not_started">Not Started</option>
                <option value="graded">Graded</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Real-time Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {monitoringMode === 'assignments'
                ? `Live Assignment Submissions (${filteredAssignmentRows.length})`
                : monitoringMode === 'practice_sets'
                ? `Live Practice Set Submissions (${filteredPracticeAttempts.length})`
                : `Live Mock Test Submissions (${filteredMockAttempts.length})`}
            </h3>
            <p className="text-xs text-slate-500">
              {monitoringMode === 'assignments'
                ? 'Student homework status synchronized in real time via Firestore snapshot.'
                : 'Click any student row to inspect that student’s complete submission history and verified explanations.'}
            </p>
          </div>
        </div>

        {/* ASSIGNMENTS SURVEILLANCE TABLE (Requirements 7, 8, 9, 10, 11) */}
        {monitoringMode === 'assignments' ? (
          filteredAssignmentRows.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-600 dark:text-slate-400">
                No assignment submissions yet.
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When students complete and submit assignments in their accounts, their submissions will appear here automatically via Firestore live listener.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-3 py-3 text-center">Class</th>
                    <th className="px-5 py-3">Assignment</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Chapter</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Submitted At</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssignmentRows.map((row) => {
                    const badge = formatSubmissionStatusBadge(row.status);
                    return (
                      <tr
                        key={row.key}
                        onClick={() => {
                          if (row.submissionDoc) {
                            handleOpenSubmissionAudit(row.submissionDoc);
                          }
                        }}
                        className={`transition ${row.submissionDoc ? 'hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer' : ''}`}
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                              {row.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span>{row.studentName}</span>
                                {row.isDemo && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    DEMO / TEST ACTIVITY
                                  </span>
                                )}
                              </div>
                              {row.studentEmail && (
                                <div className="text-[10px] text-slate-400 font-normal">{row.studentEmail}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                            {row.class}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                          {row.assignmentTitle}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {row.subject}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium max-w-[160px] truncate">
                          {row.chapter}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {formatDateTime(row.submittedAt)}
                        </td>

                        <td className="px-4 py-3.5 text-center font-black text-slate-900 dark:text-white">
                          {row.scoreStr}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {row.submissionDoc ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSubmissionAudit(row.submissionDoc!);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition font-bold text-[11px] flex items-center space-x-1 mx-auto cursor-pointer"
                              title="Inspect Submission & Review"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : monitoringMode === 'practice_sets' ? (
          filteredPracticeAttempts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              {/* User-mandated exact empty state string */}
              <div className="font-bold text-sm text-slate-600 dark:text-slate-400">
                No student practice attempts yet.
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When students complete and submit Practice Sets in their accounts, their attempts will appear here automatically via Firestore live listener.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-3 py-3 text-center">Class</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-5 py-3">Practice Set</th>
                    <th className="px-4 py-3">Chapter</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-center">Percentage</th>
                    <th className="px-4 py-3 text-center">Correct</th>
                    <th className="px-4 py-3 text-center">Wrong</th>
                    <th className="px-4 py-3">Submitted Time</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPracticeAttempts.map((att) => (
                    <tr
                      key={att.id || att.attemptId}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedStudentEmail(att.studentEmail || att.studentId);
                      }}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span>{att.studentName}</span>
                          {isDemoRecord(att) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              DEMO / TEST ACTIVITY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{att.studentEmail}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                          {typeof att.class === 'number' ? `Class ${att.class}` : att.class}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {att.subject || att.subjectName}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {att.practiceSetTitle}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium max-w-[160px] truncate">
                        {att.chapterName}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-900 dark:text-white">
                        {att.score}/{att.totalMarks}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                          att.percentage >= 80
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : att.percentage >= 50
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                        {att.correctCount !== undefined ? att.correctCount : (att.correctAnswers || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-rose-600">
                        {att.wrongCount !== undefined ? att.wrongCount : (att.incorrectAnswers || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(att.submittedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setSelectedPracticeAttemptDetail(att);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition"
                          title="Inspect Attempt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* MOCK TESTS SURVEILLANCE TABLE */
          filteredMockAttempts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-600 dark:text-slate-400">
                No mock test attempts yet.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-3 py-3 text-center">Class</th>
                    <th className="px-5 py-3">Mock Test</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-center">Percentage</th>
                    <th className="px-4 py-3 text-center">Correct</th>
                    <th className="px-4 py-3 text-center">Wrong</th>
                    <th className="px-4 py-3">Submitted Time</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMockAttempts.map((att) => (
                    <tr
                      key={att.attemptId}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedStudentEmail(att.studentEmail);
                      }}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span>{att.studentName}</span>
                          {isDemoRecord(att) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              DEMO / TEST ACTIVITY
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{att.studentEmail}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                          Class {att.class}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {att.quizTitle}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {att.subject}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-900 dark:text-white">
                        {att.score}/{att.totalMarks}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                          att.percentage >= 80
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : att.percentage >= 50
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                        {att.correctCount}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-rose-600">
                        {att.wrongCount}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(att.submittedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setSelectedMockAttemptDetail(att);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* STUDENT PRACTICE SET HISTORY MODAL (Requirement 10) */}
      {selectedStudentEmail && monitoringMode === 'practice_sets' && studentPracticeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-sm">
                  {studentPracticeProfile.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-lg">{studentPracticeProfile.studentName}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {studentPracticeProfile.studentEmail} • {typeof studentPracticeProfile.class === 'number' ? `Class ${studentPracticeProfile.class}` : studentPracticeProfile.class}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentEmail(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Aggregate Summary Cards */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Practice Sets Taken</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">{studentPracticeAttempts.length}</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Average Score</span>
                <div className="text-xl font-black text-blue-600">
                  {Math.round(studentPracticeAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / studentPracticeAttempts.length)}%
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Latest Score</span>
                <div className="text-xl font-black text-indigo-600">{studentPracticeAttempts[0]?.score || 0} pts</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Highest Score</span>
                <div className="text-xl font-black text-emerald-600">
                  {Math.max(...studentPracticeAttempts.map(a => a.percentage || 0))}%
                </div>
              </div>
            </div>

            {/* Attempts List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider">
                Practice Set History for {studentPracticeProfile.studentName}
              </h4>

              {studentPracticeAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No practice attempts yet.</p>
              ) : (
                <div className="space-y-2">
                  {studentPracticeAttempts.map((att) => (
                    <div
                      key={att.id || att.attemptId}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedPracticeAttemptDetail(att);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                            {att.practiceSetTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {att.subject || att.subjectName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                            {att.chapterName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Submitted: {formatDateTime(att.submittedAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-6 text-xs">
                        <div className="text-right">
                          <div className="font-black text-sm text-slate-900 dark:text-white">
                            {att.score}/{att.totalMarks} ({att.percentage}%)
                          </div>
                          <div className="text-[10px] text-slate-500 space-x-2 font-medium">
                            <span className="text-emerald-600 font-bold">
                              {att.correctCount !== undefined ? att.correctCount : (att.correctAnswers || 0)} Correct
                            </span>
                            <span>•</span>
                            <span className="text-rose-600 font-bold">
                              {att.wrongCount !== undefined ? att.wrongCount : (att.incorrectAnswers || 0)} Wrong
                            </span>
                            <span>•</span>
                            <span className="text-amber-600 font-bold">
                              {att.unansweredCount !== undefined ? att.unansweredCount : (att.unanswered || 0)} Skipped
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION-WISE PRACTICE SET RESULT DRILL DOWN MODAL (Requirement 10) */}
      {selectedPracticeAttemptDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  Practice Attempt Audit & Verified Solutions
                </span>
                <h3 className="font-black text-lg">{selectedPracticeAttemptDetail.practiceSetTitle}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedPracticeAttemptDetail.studentName} ({selectedPracticeAttemptDetail.studentEmail}) • {selectedPracticeAttemptDetail.chapterName} • Score: {selectedPracticeAttemptDetail.score}/{selectedPracticeAttemptDetail.totalMarks} ({selectedPracticeAttemptDetail.percentage}%)
                </p>
              </div>

              <button
                onClick={() => setSelectedPracticeAttemptDetail(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedPracticeAttemptDetail.questionResults && selectedPracticeAttemptDetail.questionResults.length > 0 ? (
                selectedPracticeAttemptDetail.questionResults.map((qr, idx) => (
                  <div
                    key={qr.questionId || idx}
                    className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      qr.isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                        : qr.selectedAnswer !== null && qr.selectedAnswer !== undefined
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-black text-slate-800 dark:text-slate-200">
                          Q{idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {qr.questionText}
                        </span>
                      </div>

                      <div className="shrink-0">
                        {qr.isCorrect ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{qr.marks})
                          </span>
                        ) : qr.selectedAnswer !== null && qr.selectedAnswer !== undefined ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-[10px] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Wrong (0/{qr.marks})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[10px]">
                            Skipped (0/{qr.marks})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Answers Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Student Selected:</span>
                        <span className={`font-black mt-0.5 block ${qr.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {qr.selectedOptionText || 'Not answered'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Correct Answer:</span>
                        <span className="font-black text-emerald-600 mt-0.5 block">
                          {qr.correctOptionText || String(qr.correctAnswer)}
                        </span>
                      </div>
                    </div>

                    {/* Real Explanation from Firestore */}
                    {qr.explanation && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <strong className="text-amber-600 dark:text-amber-400 mr-1.5">Curriculum Explanation:</strong>
                        <span>{qr.explanation}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  No individual question results recorded for this attempt.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENT SUBMISSION AUDIT & TEACHER EVALUATION MODAL (Requirement 12) */}
      {selectedSubmissionAudit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                    {selectedSubmissionAudit.subject || 'Assignment'} • {selectedSubmissionAudit.chapterName || 'Curriculum'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    Class {selectedSubmissionAudit.class}
                  </span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-white">
                  {selectedSubmissionAudit.assignmentTitle || 'Assignment Submission'}
                </h3>
                <p className="text-xs text-slate-400">
                  Student: <strong className="text-white">{selectedSubmissionAudit.studentName}</strong>
                  {selectedSubmissionAudit.studentEmail && ` (${selectedSubmissionAudit.studentEmail})`} • Submitted: {formatDateTime(selectedSubmissionAudit.submittedAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmissionAudit(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Score Banner */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
                  {selectedSubmissionAudit.score ?? 0}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Total Score / Max Score</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedSubmissionAudit.score ?? 0} / {selectedSubmissionAudit.maxScore || 10} Marks
                    <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                      ({selectedSubmissionAudit.percentage ?? Math.round(((selectedSubmissionAudit.score || 0) / (selectedSubmissionAudit.maxScore || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct: {selectedSubmissionAudit.correctCount ?? 0}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>Wrong: {selectedSubmissionAudit.wrongCount ?? 0}</span>
                </div>

                {selectedSubmissionAudit.hasSubjectivePending && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Subjective Pending Review</span>
                  </div>
                )}
              </div>
            </div>

            {/* Questions Breakdown */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Question-by-Question Audit & Answers
              </h4>

              {selectedSubmissionAudit.answers && Object.keys(selectedSubmissionAudit.answers).length > 0 ? (
                Object.keys(selectedSubmissionAudit.answers).map((qId, idx) => {
                  const ans = selectedSubmissionAudit.answers[qId];
                  const isSubjective = ans.type === 'subjective';

                  return (
                    <div
                      key={qId}
                      className={`p-4 rounded-2xl border text-xs space-y-3 ${
                        ans.isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                          : isSubjective
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-black text-slate-800 dark:text-slate-200">
                            Q{idx + 1}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {ans.questionText}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              {isSubjective ? 'Subjective / Long Answer' : 'Multiple Choice / Objective'} • Max Marks: {ans.maxMarks}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSubjective ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] font-bold text-slate-500">Award Marks:</span>
                              <input
                                type="number"
                                min={0}
                                max={ans.maxMarks}
                                value={subjectiveMarksInput[qId] !== undefined ? subjectiveMarksInput[qId] : (ans.marksAwarded ?? 0)}
                                onChange={(e) => {
                                  const val = Math.min(ans.maxMarks, Math.max(0, parseInt(e.target.value, 10) || 0));
                                  setSubjectiveMarksInput(prev => ({ ...prev, [qId]: val }));
                                }}
                                className="w-14 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-black text-center text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-[11px] font-bold text-slate-400">/ {ans.maxMarks}</span>
                            </div>
                          ) : ans.isCorrect ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Evaluated: +{ans.marksAwarded}/{ans.maxMarks}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-[10px] flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Auto-Evaluated: 0/{ans.maxMarks}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Answers comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Student's Submitted Answer:</span>
                          <span className={`font-semibold mt-1 block whitespace-pre-wrap ${ans.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {ans.studentAnswer || '(No answer provided)'}
                          </span>
                        </div>

                        {!isSubjective && ans.correctAnswer && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Correct Answer Key:</span>
                            <span className="font-bold text-emerald-600 mt-1 block">
                              {ans.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No individual question answers logged for this submission.
                </div>
              )}

              {/* Teacher Feedback / Remarks */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Teacher Remarks & Feedback:
                </label>
                <textarea
                  rows={3}
                  value={teacherFeedbackInput}
                  onChange={(e) => setTeacherFeedbackInput(e.target.value)}
                  placeholder="Enter constructive feedback, praise, or remarks for the student..."
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Save Success Banner */}
              {reviewSavedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Teacher evaluation and feedback saved successfully! Synced to student portal.</span>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedSubmissionAudit(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleSaveTeacherAudit}
                disabled={isSavingReview}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                {isSavingReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Evaluation & Marks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
