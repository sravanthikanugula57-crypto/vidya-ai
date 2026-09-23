import React, { useState } from 'react';
import { 
  Users, 
  LogIn, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  Settings, 
  Layers,
  Clock,
  Circle,
  Database
} from 'lucide-react';
import { RealStudentProfile, updateTeacherAssignedClasses } from '../../services/studentFirestoreService';
import { UserAuthProfile } from '../../types';
import { soundFx } from '../../lib/audio';

export interface AssignedClassItem {
  id: string;
  className: string;      // e.g. "Class 5"
  gradeNumber: number;    // e.g. 5
  subject: string;        // e.g. "Mathematics"
  fullName: string;       // e.g. "Class 5 - Mathematics"
}

interface MyClassesProps {
  currentUser: UserAuthProfile | null;
  students: RealStudentProfile[];
  onSelectClass: (className: string, subject: string) => void;
  onOpenTestFlow: () => void;
}

// Available AP Board Classes & Subjects for teachers to configure
const AVAILABLE_CLASSES = [
  { grade: 5, className: 'Class 5' },
  { grade: 6, className: 'Class 6' },
  { grade: 7, className: 'Class 7' },
  { grade: 8, className: 'Class 8' },
  { grade: 9, className: 'Class 9' },
  { grade: 10, className: 'Class 10' },
];

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'General Science',
  'Physical Science',
  'Biological Science',
  'Social Studies',
  'English',
  'Telugu'
];

export const MyClasses: React.FC<MyClassesProps> = ({
  currentUser,
  students,
  onSelectClass,
  onOpenTestFlow
}) => {
  const [isConfiguringClasses, setIsConfiguringClasses] = useState(false);
  const [newGrade, setNewGrade] = useState('Class 5');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [isSaving, setIsSaving] = useState(false);

  // Parse assigned classes from teacher profile or default
  // Default to standard teacher assignment if not explicitly configured
  const getAssignedClasses = (): AssignedClassItem[] => {
    const rawList = currentUser?.assignedClasses;
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((itemStr, index) => {
        // format: "Class 5 - Mathematics" or "Class 5"
        const parts = itemStr.split('-').map((p) => p.trim());
        const clsName = parts[0] || 'Class 5';
        const subj = parts[1] || 'Mathematics';
        const gradeNum = parseInt(clsName.replace(/\D/g, ''), 10) || 5;
        return {
          id: `ac_${gradeNum}_${subj.toLowerCase().replace(/\s+/g, '_')}_${index}`,
          className: clsName.startsWith('Class') ? clsName : `Class ${clsName}`,
          gradeNumber: gradeNum,
          subject: subj,
          fullName: `${clsName} - ${subj}`
        };
      });
    }

    // Default assigned classes if teacher profile has not saved custom list yet
    return [
      {
        id: 'ac_5_math',
        className: 'Class 5',
        gradeNumber: 5,
        subject: 'Mathematics',
        fullName: 'Class 5 - Mathematics'
      },
      {
        id: 'ac_6_math',
        className: 'Class 6',
        gradeNumber: 6,
        subject: 'Mathematics',
        fullName: 'Class 6 - Mathematics'
      }
    ];
  };

  const assignedClasses = getAssignedClasses();

  // Robust student matcher for a specific class
  const getStudentsForClass = (gradeNum: number, clsName: string): RealStudentProfile[] => {
    return students.filter((s) => {
      const studentClassNum = typeof s.class === 'number' 
        ? s.class 
        : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);
      
      return (
        studentClassNum === gradeNum ||
        s.grade === clsName ||
        s.grade === `Class ${gradeNum}`
      );
    });
  };

  const handleAddClass = async () => {
    if (!currentUser?.uid) return;
    const itemToAdd = `${newGrade} - ${newSubject}`;
    const currentList = assignedClasses.map((c) => c.fullName);
    if (currentList.includes(itemToAdd)) {
      alert('This class is already in your assigned list.');
      return;
    }
    const updated = [...currentList, itemToAdd];
    setIsSaving(true);
    soundFx.playClick();
    try {
      await updateTeacherAssignedClasses(currentUser.uid, updated);
      if (currentUser) {
        currentUser.assignedClasses = updated;
      }
      setIsConfiguringClasses(false);
    } catch (err: any) {
      alert(`Could not save assigned classes: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveClass = async (fullName: string) => {
    if (!currentUser?.uid) return;
    const currentList = assignedClasses.map((c) => c.fullName);
    const updated = currentList.filter((item) => item !== fullName);
    setIsSaving(true);
    soundFx.playClick();
    try {
      await updateTeacherAssignedClasses(currentUser.uid, updated);
      if (currentUser) {
        currentUser.assignedClasses = updated;
      }
    } catch (err: any) {
      alert(`Could not update assigned classes: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              My Classes
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {assignedClasses.length} Assigned
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Firestore roster metrics: enrolled count, logged-in count, and recently active students.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsConfiguringClasses(!isConfiguringClasses)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isConfiguringClasses ? 'Done Editing' : 'Configure Classes'}</span>
          </button>

          <button
            onClick={onOpenTestFlow}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Test Real Student Flow</span>
          </button>
        </div>
      </div>

      {/* Class Configuration Drawer / Form */}
      {isConfiguringClasses && (
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Manage Assigned Classes (Stored in Teacher Profile users/{'{uid}'}.assignedClasses)</span>
            </span>
            <span className="text-[11px] text-slate-500">Only authorized classes are visible to you</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500">Class:</span>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
              >
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c.grade} value={c.className}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500">Subject:</span>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <button
              disabled={isSaving}
              onClick={handleAddClass}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Class</span>
            </button>
          </div>

          {/* Current List Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {assignedClasses.map((ac) => (
              <span 
                key={ac.id}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
              >
                <span>{ac.fullName}</span>
                {assignedClasses.length > 1 && (
                  <button
                    disabled={isSaving}
                    onClick={() => handleRemoveClass(ac.fullName)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                    title="Remove assignment"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedClasses.map((ac) => {
          // 1. Filter real students matching this class
          const classStudents = getStudentsForClass(ac.gradeNumber, ac.className);
          
          // 2. Real counts
          const enrolledCount = classStudents.length;
          const loggedInCount = classStudents.filter((s) => !!(s.lastLoginAt || s.lastLogin)).length;
          const recentlyActiveStudents = classStudents.filter((s) => !!s.isRecentlyActive);
          const recentlyActiveCount = recentlyActiveStudents.length;

          return (
            <div
              key={ac.id}
              onClick={() => onSelectClass(ac.className, ac.subject)}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:h-1.5 transition-all" />

              {/* Class Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-2">
                    AP State Board
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {ac.className}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {ac.subject}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              {/* Real 3-Metric Block - NO HARDCODING */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800">
                {/* Enrolled Students */}
                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 mb-1">
                    <Users className="w-3 h-3" />
                    <span>Enrolled</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {enrolledCount}
                  </div>
                </div>

                {/* Logged In */}
                <div className="text-center p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 mb-1">
                    <LogIn className="w-3 h-3" />
                    <span>Logged In</span>
                  </div>
                  <div className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {loggedInCount}
                  </div>
                </div>

                {/* Recently Active (<15m) */}
                <div className="text-center p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 mb-1">
                    <Activity className="w-3 h-3" />
                    <span>Active Now</span>
                  </div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                    {recentlyActiveCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                    <span>{recentlyActiveCount}</span>
                  </div>
                </div>
              </div>

              {/* Recently Active Students Preview */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>Recently Active Students:</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {recentlyActiveCount} active &lt;15m
                  </span>
                </div>

                {recentlyActiveCount > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {recentlyActiveStudents.slice(0, 3).map((stu) => (
                      <span
                        key={stu.uid}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="truncate max-w-[100px]">{stu.name}</span>
                      </span>
                    ))}
                    {recentlyActiveCount > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{recentlyActiveCount - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    {enrolledCount > 0 
                      ? 'No active students in the last 15 minutes' 
                      : 'No students enrolled in this class yet'}
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span className="flex items-center space-x-1">
                  <span>Manage Class Roster</span>
                  <span className="text-[10px] text-slate-400 font-normal">({enrolledCount} students)</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
