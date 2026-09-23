import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Calendar, 
  BookOpen, 
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  RealHomeworkDoc, 
  RealHomeworkSubmissionDoc, 
  subscribeSubmissionsForHomework,
  extractGradeNum,
  normalizeSubmissionStatus
} from '../../../services/realHomeworkService';
import { RealStudentProfile, subscribeToRealStudents } from '../../../services/studentFirestoreService';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

interface HomeworkSubmissionsViewProps {
  homework: RealHomeworkDoc;
  onBack: () => void;
  enrolledStudents?: RealStudentProfile[];
  teacherName?: string;
}

export const HomeworkSubmissionsView: React.FC<HomeworkSubmissionsViewProps> = ({
  homework,
  onBack,
  enrolledStudents,
  teacherName = 'Faculty Teacher'
}) => {
  const [submissions, setSubmissions] = useState<RealHomeworkSubmissionDoc[]>([]);
  const [classStudents, setClassStudents] = useState<RealStudentProfile[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<RealHomeworkSubmissionDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const targetGradeNum = extractGradeNum(homework.class);

  // 1. Subscribe to real submissions for this homework in Firestore
  useEffect(() => {
    const unsub = subscribeSubmissionsForHomework(homework.id, (subList) => {
      setSubmissions(subList);
    });
    return () => unsub();
  }, [homework.id]);

  // 2. Fetch / filter students enrolled strictly in this class
  useEffect(() => {
    if (enrolledStudents && enrolledStudents.length > 0) {
      const filtered = enrolledStudents.filter((s) => {
        const studentClassNum = typeof s.class === 'number'
          ? s.class
          : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);

        return (
          studentClassNum === targetGradeNum ||
          s.grade === homework.class ||
          s.grade === `Class ${targetGradeNum}`
        );
      });
      setClassStudents(filtered);
    } else {
      // Fallback subscribe from Firestore users collection
      setIsLoadingStudents(true);
      const unsubStudents = subscribeToRealStudents((all) => {
        const filtered = all.filter((s) => {
          const studentClassNum = typeof s.class === 'number'
            ? s.class
            : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);

          return (
            studentClassNum === targetGradeNum ||
            s.grade === homework.class ||
            s.grade === `Class ${targetGradeNum}`
          );
        });
        setClassStudents(filtered);
        setIsLoadingStudents(false);
      });
      return () => unsubStudents();
    }
  }, [enrolledStudents, homework.class]);

  // Create lookup map of submissions by studentId
  const submissionByStudentId = new Map<string, RealHomeworkSubmissionDoc>();
  submissions.forEach((sub) => {
    submissionByStudentId.set(sub.studentId, sub);
  });

  // Calculate real metrics directly from real students + submissions
  const totalEnrolled = classStudents.length;
  
  // Roster combined records
  const studentRows = classStudents.map((stu) => {
    const sub = submissionByStudentId.get(stu.uid);
    let status: 'Not Started' | 'In Progress' | 'Submitted' | 'Reviewed' = 'Not Started';
    let submittedAt: string | null = null;
    let score: string = '-';

    if (sub) {
      const norm = normalizeSubmissionStatus(sub.status);
      if (norm === 'submitted') {
        status = 'Submitted';
      } else if (norm === 'graded') {
        status = 'Reviewed';
      } else if (norm === 'in_progress') {
        status = 'In Progress';
      } else {
        status = 'Not Started';
      }

      submittedAt = sub.submittedAt || null;
      score = norm === 'submitted' || norm === 'graded' 
        ? `${sub.score ?? 0} / ${sub.maxScore ?? homework.totalMarks}` 
        : '-';
    }

    return {
      student: stu,
      submission: sub || null,
      status,
      submittedAt,
      score
    };
  });

  // Metric counts
  const countNotStarted = studentRows.filter(r => r.status === 'Not Started').length;
  const countInProgress = studentRows.filter(r => r.status === 'In Progress').length;
  const countSubmitted = studentRows.filter(r => r.status === 'Submitted').length;
  const countReviewed = studentRows.filter(r => r.status === 'Reviewed').length;

  // Filter rows by search
  const filteredRows = studentRows.filter(r => 
    r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.student.email && r.student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
              <span className="hover:underline cursor-pointer" onClick={onBack}>
                Homework Dashboard
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{homework.class}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{homework.subject}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {homework.title}
            </h1>
          </div>
        </div>

        {/* Due Date & Marks Pill */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Due: {homework.dueDate}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-extrabold">
            {homework.totalMarks} Marks
          </span>
        </div>
      </div>

      {/* Realtime Submission Counts Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Not Started
          </span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
            {countNotStarted}
          </div>
          <span className="text-[10px] text-slate-400">Enrolled students</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
            In Progress
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {countInProgress}
          </div>
          <span className="text-[10px] text-slate-400">Opened assignment</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
            Submitted
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {countSubmitted}
          </div>
          <span className="text-[10px] text-slate-400">Pending review / graded</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
            Reviewed
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {countReviewed}
          </div>
          <span className="text-[10px] text-slate-400">Feedback finalized</span>
        </div>
      </div>

      {/* Roster & Submissions Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Student Submissions ({filteredRows.length})
            </h3>
            <span className="text-xs text-slate-400">
              • {homework.class}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Empty States */}
        {totalEnrolled === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                No students enrolled yet.
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No students from {homework.class} have registered in Firestore yet.
              </p>
            </div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-xs font-bold text-slate-500">No matching students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRows.map((row) => {
                  const stu = row.student;
                  const sub = row.submission;
                  const canReview = row.status === 'Submitted' || row.status === 'Reviewed';

                  return (
                    <tr 
                      key={stu.uid}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Student Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                            {stu.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white">
                              {stu.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {stu.email || stu.uid.substring(0, 10)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column: Not Started | In Progress | Submitted | Reviewed */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          row.status === 'Reviewed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : row.status === 'Submitted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : row.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {row.status === 'Reviewed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {row.status === 'Submitted' && <Clock className="w-3 h-3 text-blue-600" />}
                          <span>{row.status}</span>
                        </span>
                      </td>

                      {/* Submitted At Column */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {row.submittedAt 
                          ? new Date(row.submittedAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </td>

                      {/* Score Column */}
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        {row.score !== '-' ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                            {row.score}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Review Column */}
                      <td className="py-3.5 px-4 text-right">
                        {canReview && sub ? (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedSubmissionForReview(sub);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                              row.status === 'Reviewed'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {row.status === 'Reviewed' ? 'Edit Review' : 'Review & Grade'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {row.status === 'In Progress' ? 'Working...' : 'Not submitted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmissionForReview && (
        <ReviewSubmissionModal
          isOpen={!!selectedSubmissionForReview}
          onClose={() => setSelectedSubmissionForReview(null)}
          submission={selectedSubmissionForReview}
          homework={homework}
          reviewerName={teacherName}
          onReviewSaved={() => {
            // Updated in Firestore; live snapshot updates list
          }}
        />
      )}
    </div>
  );
};
