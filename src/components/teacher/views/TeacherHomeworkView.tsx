import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Award, 
  Sparkles, 
  Filter, 
  AlertCircle,
  Users,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  RealHomeworkDoc, 
  RealHomeworkSubmissionDoc, 
  subscribeTeacherHomeworkList, 
  subscribeAllHomeworkSubmissions,
  setHomeworkStatus,
  deleteHomework,
  extractGradeNum
} from '../../../services/realHomeworkService';
import { RealStudentProfile, subscribeToRealStudents } from '../../../services/studentFirestoreService';
import { OFFICIAL_CLASSES, OfficialClassGrade } from '../../../data/officialSyllabusData';
import { CreateHomeworkModal } from '../homework/CreateHomeworkModal';
import { HomeworkSubmissionsView } from '../homework/HomeworkSubmissionsView';
import { TeacherAIHomeworkModal } from '../ai-homework/TeacherAIHomeworkModal';

interface TeacherHomeworkViewProps {
  currentUser?: any;
  students?: RealStudentProfile[];
}

export const TeacherHomeworkView: React.FC<TeacherHomeworkViewProps> = ({
  currentUser,
  students: propStudents
}) => {
  // Navigation & Filter states
  const [filterClass, setFilterClass] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  
  // Real Firestore Data
  const [homeworkList, setHomeworkList] = useState<RealHomeworkDoc[]>([]);
  const [submissions, setSubmissions] = useState<RealHomeworkSubmissionDoc[]>([]);
  const [allStudents, setAllStudents] = useState<RealStudentProfile[]>(propStudents || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Sub-views
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [viewingHomework, setViewingHomework] = useState<RealHomeworkDoc | null>(null);

  // Teacher display name
  const teacherName = currentUser?.displayName || currentUser?.name || 'Faculty Teacher';
  const teacherId = currentUser?.uid || 't_portal';

  // 1. Fetch Students from Firestore if not provided via props
  useEffect(() => {
    if (propStudents && propStudents.length > 0) {
      setAllStudents(propStudents);
    } else {
      const unsub = subscribeToRealStudents((res) => {
        setAllStudents(res);
      });
      return () => unsub();
    }
  }, [propStudents]);

  // 2. Real-time listener for Teacher Homeworks
  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeTeacherHomeworkList(filterClass, (list) => {
      setHomeworkList(list);
      setIsLoading(false);
    });

    return () => unsub();
  }, [filterClass]);

  // 3. Real-time listener for All Homework Submissions
  useEffect(() => {
    const unsub = subscribeAllHomeworkSubmissions((subList) => {
      setSubmissions(subList);
    });

    return () => unsub();
  }, []);

  // Compute Real Metrics across the current class filter
  // "Total Assigned", "Not Started", "Started", "Submitted", "Pending Review", "Reviewed"
  const publishedHomeworks = homeworkList.filter(h => h.status === 'published');
  const totalAssigned = publishedHomeworks.length;

  // Filter students by selected class
  const relevantStudents = filterClass === 'All' 
    ? allStudents 
    : allStudents.filter(s => {
        const targetGradeNum = extractGradeNum(filterClass);
        const stuGradeNum = typeof s.class === 'number'
          ? s.class
          : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
        return stuGradeNum === targetGradeNum || s.grade === filterClass;
      });

  // Filter submissions by relevant homeworks
  const relevantHwIds = new Set(homeworkList.map(h => h.id));
  const relevantSubmissions = submissions.filter(s => relevantHwIds.has(s.homeworkId));

  // Count submission statuses
  const countStarted = relevantSubmissions.filter(s => s.status === 'In Progress').length;
  const countSubmitted = relevantSubmissions.filter(s => s.status === 'Submitted').length;
  const countPendingReview = relevantSubmissions.filter(s => s.status === 'Submitted' && s.hasSubjectivePending).length;
  const countReviewed = relevantSubmissions.filter(s => s.status === 'Reviewed').length;

  // Calculate Not Started: total expected submissions across published assignments minus started/submitted/reviewed
  // For each published homework, count students who haven't started
  let countNotStarted = 0;
  if (publishedHomeworks.length > 0 && relevantStudents.length > 0) {
    publishedHomeworks.forEach((hw) => {
      const hwGradeNum = extractGradeNum(hw.class);
      const enrolledForThisHw = allStudents.filter(s => {
        const sGradeNum = typeof s.class === 'number'
          ? s.class
          : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
        return sGradeNum === hwGradeNum || s.grade === hw.class;
      });

      const startedOrSubmittedIds = new Set(
        submissions.filter(s => s.homeworkId === hw.id).map(s => s.studentId)
      );

      const notStartedInClass = enrolledForThisHw.filter(s => !startedOrSubmittedIds.has(s.uid)).length;
      countNotStarted += notStartedInClass;
    });
  }

  // Filter homework list by status
  const displayedHomeworks = homeworkList.filter((hw) => {
    if (statusFilter === 'all') return true;
    return hw.status === statusFilter;
  });

  // Action handlers
  const handlePublishHomework = async (hwId: string) => {
    soundFx.playClick();
    try {
      await setHomeworkStatus(hwId, 'published');
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    }
  };

  const handleCloseHomework = async (hwId: string) => {
    soundFx.playClick();
    try {
      await setHomeworkStatus(hwId, 'closed');
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    }
  };

  const handleDelete = async (hwId: string) => {
    if (confirm('Are you sure you want to delete this homework assignment?')) {
      soundFx.playClick();
      await deleteHomework(hwId);
      soundFx.playSuccess();
    }
  };

  // If currently viewing submissions for a specific homework
  if (viewingHomework) {
    return (
      <HomeworkSubmissionsView
        homework={viewingHomework}
        onBack={() => setViewingHomework(null)}
        enrolledStudents={allStudents}
        teacherName={teacherName}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Banner with AI Co-Pilot & Quick Create Action */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-500/30">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-blue-200 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Official AP SSC Homework Management • Firestore Integrated</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Class Homework & Assignment Hub
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Create syllabus-aligned objective and subjective assignments. Auto-evaluate with stored answer keys, review student submissions in real time, and award marks.
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsAiModalOpen(true);
            }}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center space-x-2 cursor-pointer backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Question Generator</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsCreateModalOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-amber-300 hover:text-slate-900 font-black text-xs shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-blue-700" />
            <span>Create Homework Assignment</span>
          </button>
        </div>
      </div>

      {/* Realtime Teacher Homework Dashboard Metrics */}
      {/* Required fields: Total Assigned | Not Started | Started | Submitted | Pending Review | Reviewed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Assigned
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalAssigned}
          </div>
          <span className="text-[10px] text-slate-400">Published tasks</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Not Started
          </span>
          <div className="text-2xl font-black text-slate-600 dark:text-slate-400">
            {countNotStarted}
          </div>
          <span className="text-[10px] text-slate-400">Pending opens</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
            Started
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {countStarted}
          </div>
          <span className="text-[10px] text-slate-400">In Progress</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
            Submitted
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {countSubmitted}
          </div>
          <span className="text-[10px] text-slate-400">Student submissions</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider block">
            Pending Review
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {countPendingReview}
          </div>
          <span className="text-[10px] text-slate-400">Subjective answers</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
            Reviewed
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {countReviewed}
          </div>
          <span className="text-[10px] text-slate-400">Graded & feedback sent</span>
        </div>
      </div>

      {/* Control Bar: Class Filter & Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
          <button
            onClick={() => { soundFx.playClick(); setStatusFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Assignments ({homeworkList.length})</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setStatusFilter('published'); }}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'published' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published ({homeworkList.filter(h => h.status === 'published').length})</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setStatusFilter('draft'); }}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'draft' 
                ? 'bg-amber-500 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Drafts ({homeworkList.filter(h => h.status === 'draft').length})</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setStatusFilter('closed'); }}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'closed' 
                ? 'bg-slate-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Closed ({homeworkList.filter(h => h.status === 'closed').length})</span>
          </button>
        </div>

        {/* Dynamic Class Filter Dropdown */}
        <div className="flex items-center space-x-2 pl-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Class Filter:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Grades (5–10)</option>
            {OFFICIAL_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Cards List */}
      {displayedHomeworks.length === 0 ? (
        /* Truthful Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <div className="space-y-1">
            <h4 className="font-black text-base text-slate-800 dark:text-slate-200">
              No homework assigned yet.
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create and publish a syllabus-aligned assignment for your students to begin practicing and receiving real feedback.
            </p>
          </div>
          
          <button
            onClick={() => {
              soundFx.playClick();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Homework Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedHomeworks.map((hw) => {
            // Count submissions for this specific homework
            const hwSubs = submissions.filter(s => s.homeworkId === hw.id);
            const subCount = hwSubs.filter(s => s.status === 'Submitted' || s.status === 'Reviewed').length;
            const pendingReviewCount = hwSubs.filter(s => s.status === 'Submitted' && s.hasSubjectivePending).length;

            return (
              <div
                key={hw.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header: Class & Status Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-black">
                        {hw.class}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {hw.subject}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      hw.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : hw.status === 'draft'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {hw.status}
                    </span>
                  </div>

                  {/* Title & Chapter */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {hw.chapterName}
                    </p>
                  </div>

                  {/* Details row: Questions & Marks & Due Date */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {hw.questions?.length || 0} Questions
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {hw.totalMarks} Marks
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400 ml-auto">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Due: {hw.dueDate}</span>
                    </span>
                  </div>

                  {/* Real-time Submissions Indicator Badge */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{subCount} Submissions</span>
                    </span>
                    {pendingReviewCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                        {pendingReviewCount} Needs Review
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        {hw.status === 'published' ? 'Active' : 'Not Active'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    {hw.status === 'draft' && (
                      <button
                        onClick={() => handlePublishHomework(hw.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        title="Publish this draft to class students"
                      >
                        Publish
                      </button>
                    )}

                    {hw.status === 'published' && (
                      <button
                        onClick={() => handleCloseHomework(hw.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                        title="Close submissions"
                      >
                        Close
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(hw.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Open Roster & Submissions View */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setViewingHomework(hw);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Submissions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Homework Creation Modal */}
      {isCreateModalOpen && (
        <CreateHomeworkModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          teacherId={teacherId}
          teacherName={teacherName}
          initialClass={filterClass !== 'All' ? filterClass : 'Class 6'}
          onSuccess={(hwId) => {
            // Refreshes automatically via snapshot listener
          }}
        />
      )}

      {/* AI Homework Generator Modal */}
      {isAiModalOpen && (
        <TeacherAIHomeworkModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onHomeworkSaved={() => {
            // Snapshot updates list
          }}
        />
      )}
    </div>
  );
};
