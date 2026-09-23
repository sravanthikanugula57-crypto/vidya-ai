import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  FileCheck2, 
  Printer, 
  Search, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Users,
  GraduationCap
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  subscribeToRealStudents, 
  RealStudentProfile 
} from '../../../services/studentFirestoreService';

const CLASSES = ['All', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const ReportsView: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('Formative Assessment 1 (FA1)');
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [students, setStudents] = useState<RealStudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RealStudentProfile | null>(null);

  useEffect(() => {
    // Subscribe to real student profiles from Firestore
    const unsub = subscribeToRealStudents((realData) => {
      setStudents(realData);
    });
    return () => unsub();
  }, []);

  const handleDownloadCsv = () => {
    soundFx.playSuccess();
    if (filtered.length === 0) {
      alert('No student records found to export for the selected class.');
      return;
    }

    const csvRows = [
      ['Roll No / ID', 'Name', 'Class/Grade', 'Status', 'Quiz Score Avg (%)', 'Mock Test Score (%)', 'Progress (%)', 'SCERT Grade']
    ];

    filtered.forEach((s, idx) => {
      const quizScore = s.quizScoreAvg ?? Math.round((s.averageMockTestScore || s.progressPercentage || 0));
      const mockScore = s.averageMockTestScore ?? 0;
      const grade = getSCERTGrade(mockScore || quizScore);
      csvRows.push([
        s.rollNumber || `STU-${idx + 1}`,
        `"${s.name}"`,
        s.grade,
        s.status || 'Offline',
        `${quizScore}%`,
        `${mockScore}%`,
        `${s.progressPercentage || 0}%`,
        grade
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Report_${selectedClass.replace(' ', '_')}_${selectedTerm.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSCERTGrade = (score: number) => {
    if (score >= 90) return 'A1';
    if (score >= 80) return 'A2';
    if (score >= 70) return 'B1';
    if (score >= 60) return 'B2';
    if (score >= 50) return 'C1';
    if (score >= 40) return 'C2';
    if (score >= 35) return 'D';
    return 'F';
  };

  const isStudentInClass = (s: RealStudentProfile, targetClass: string) => {
    if (targetClass === 'All') return true;
    const targetNum = parseInt(targetClass.replace(/\D/g, ''), 10);
    const stuNum = typeof s.class === 'number' ? s.class : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
    return s.grade === targetClass || stuNum === targetNum;
  };

  const filtered = students.filter(s => {
    const matchesClass = isStudentInClass(s, selectedClass);
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(query));
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>State Board SCERT Grading Scale (A1 to F)</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Real Student Report Cards & Assessment Analytics</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Live student records tracked directly from Firestore. View class, online/offline status, quiz score average, and mock test scores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-extrabold focus:outline-none"
          >
            {CLASSES.map(cls => (
              <option key={cls} value={cls} className="text-slate-900">{cls}</option>
            ))}
          </select>

          {/* Term Selector */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-extrabold focus:outline-none"
          >
            <option value="Formative Assessment 1 (FA1)" className="text-slate-900">FA1 Assessment</option>
            <option value="Formative Assessment 2 (FA2)" className="text-slate-900">FA2 Assessment</option>
            <option value="Summative Assessment 1 (SA1)" className="text-slate-900">SA1 Term Exam</option>
            <option value="Annual Board Exam (SA2)" className="text-slate-900">Annual SA2 Board Exam</option>
          </select>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Real Reports Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Real Class Marks Register ({selectedClass} • {selectedTerm})
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {filtered.length} Real Students
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              No registered students found for {selectedClass}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students sign in and select {selectedClass}, their live quiz scores, mock test scores, and class status will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-2">Roll / ID</th>
                  <th className="pb-3 px-2">Student Name</th>
                  <th className="pb-3 px-2">Class</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Quiz Score Avg</th>
                  <th className="pb-3 px-2">Mock Test Score</th>
                  <th className="pb-3 px-2">Progress</th>
                  <th className="pb-3 px-2">SCERT Grade</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s, idx) => {
                  const quizAvg = s.quizScoreAvg ?? Math.round((s.averageMockTestScore || s.progressPercentage || 0));
                  const mockScore = s.averageMockTestScore ?? 0;
                  const scertGrade = getSCERTGrade(mockScore || quizAvg);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-2 font-bold text-slate-400">
                        {s.rollNumber || `#${idx + 1}`}
                      </td>
                      <td className="py-3 px-2 font-extrabold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          {s.photoURL ? (
                            <img src={s.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-[10px] flex items-center justify-center">
                              {s.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div>{s.name}</div>
                            <div className="text-[10px] font-normal text-slate-400">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300">
                        {s.grade}
                      </td>
                      <td className="py-3 px-2 font-bold">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          s.status === 'Online'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : s.status === 'Idle'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'Online' ? 'bg-emerald-500 animate-pulse' : s.status === 'Idle' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          {s.status || 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-black text-indigo-600 dark:text-indigo-400">
                        {quizAvg}%
                      </td>
                      <td className="py-3 px-2 font-black text-emerald-600 dark:text-emerald-400">
                        {mockScore}%
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300">
                        {s.progressPercentage || 0}%
                      </td>
                      <td className="py-3 px-2 font-black">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
                          {scertGrade}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => {
                            soundFx.playPop();
                            setSelectedStudent(s);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 dark:text-slate-300 hover:text-emerald-700 font-extrabold text-[11px] cursor-pointer transition"
                        >
                          Print Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Card Printable Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white text-slate-900 border border-slate-300 shadow-2xl max-w-lg w-full space-y-6 font-serif">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                Government High School / ZPHS Educational Institute
              </h2>
              <p className="text-xs font-bold text-slate-600">
                Official Student Academic Progress Report Card • {selectedTerm}
              </p>
            </div>

            <div className="grid grid-cols-2 text-xs font-sans font-bold gap-y-2">
              <div>Student Name: <span className="text-emerald-700">{selectedStudent.name}</span></div>
              <div>Roll No / ID: <span className="text-slate-700">{selectedStudent.rollNumber || selectedStudent.id.substring(0, 8)}</span></div>
              <div>Class / Grade: <span className="text-slate-700">{selectedStudent.grade}</span></div>
              <div>Status: <span className="text-emerald-700">{selectedStudent.status || 'Offline'}</span></div>
              <div>School: <span className="text-slate-700">{selectedStudent.schoolName || 'SCERT Affiliated Board'}</span></div>
              <div>Board: <span className="text-slate-700">{selectedStudent.board || 'AP SSC (State Board)'}</span></div>
            </div>

            <table className="w-full text-xs font-sans text-left border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border">Assessment Metric</th>
                  <th className="p-2 border">Score / Value</th>
                  <th className="p-2 border">Performance Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Quiz Score Average</td>
                  <td className="p-2 border font-bold text-indigo-700">{selectedStudent.quizScoreAvg ?? 0}%</td>
                  <td className="p-2 border font-bold">{getSCERTGrade(selectedStudent.quizScoreAvg ?? 0)}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Mock Test Score Average</td>
                  <td className="p-2 border font-bold text-emerald-700">{selectedStudent.averageMockTestScore ?? 0}%</td>
                  <td className="p-2 border font-bold">{getSCERTGrade(selectedStudent.averageMockTestScore ?? 0)}</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Curriculum Completion Progress</td>
                  <td className="p-2 border font-bold text-blue-700">{selectedStudent.progressPercentage || 0}%</td>
                  <td className="p-2 border font-bold">On Track</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Lessons & Exercises Completed</td>
                  <td className="p-2 border font-bold">{selectedStudent.lessonsCompleted || 0} Lessons</td>
                  <td className="p-2 border font-bold">Active</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center text-xs font-sans font-bold pt-2 border-t">
              <div>Overall SCERT Grade: <span className="text-emerald-700 text-sm font-black">{getSCERTGrade(selectedStudent.averageMockTestScore || selectedStudent.quizScoreAvg || 0)}</span></div>
              <div>Current Activity: <span className="text-slate-600">{selectedStudent.currentActivity || 'Studying'}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t font-sans">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

