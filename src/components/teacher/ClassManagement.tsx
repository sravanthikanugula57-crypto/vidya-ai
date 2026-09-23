import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  LogIn, 
  Activity, 
  Sparkles, 
  GraduationCap, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';
import { RealStudentProfile } from '../../services/studentFirestoreService';
import { StudentRoster } from './StudentRoster';
import { soundFx } from '../../lib/audio';
import { DemoStudentToggle } from '../common/DemoStudentToggle';
import { isDemoRecord } from '../../services/demoStudentService';

interface ClassManagementProps {
  className: string;
  subject: string;
  students: RealStudentProfile[];
  onBack: () => void;
  onOpenTestFlow: () => void;
  onSwitchClass?: (newClass: string) => void;
}

const ALL_CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const ClassManagement: React.FC<ClassManagementProps> = ({
  className,
  subject,
  students,
  onBack,
  onOpenTestFlow,
  onSwitchClass
}) => {
  // Extract number from className (e.g. "Class 5" -> 5)
  const targetGradeNum = parseInt(className.replace(/\D/g, ''), 10) || 5;

  // Filter students strictly matching this class
  const classStudents = students.filter((s) => {
    const studentClassNum = typeof s.class === 'number'
      ? s.class
      : (s.class ? parseInt(String(s.class).replace(/\D/g, ''), 10) : null);

    return (
      studentClassNum === targetGradeNum ||
      s.grade === className ||
      s.grade === `Class ${targetGradeNum}`
    );
  });

  // Split real vs demo students for accurate MDM verification
  const realClassStudents = classStudents.filter((s) => !isDemoRecord(s));
  const demoClassStudents = classStudents.filter((s) => isDemoRecord(s));

  // Calculate counts directly from Firestore data
  const studentsJoinedCount = classStudents.length;
  const studentsLoggedInCount = classStudents.filter((s) => !isDemoRecord(s) && !!(s.lastLoginAt || s.lastLogin)).length;
  const recentlyActiveStudents = classStudents.filter((s) => !isDemoRecord(s) && !!s.isRecentlyActive);
  const recentlyActiveCount = recentlyActiveStudents.length;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            title="Back to My Classes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold">
              <span className="hover:underline cursor-pointer" onClick={onBack}>
                My Classes
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{className}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{subject}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {className} • {subject}
            </h1>
          </div>
        </div>

        {/* Quick Class Switcher & Test Tool */}
        <div className="flex items-center space-x-2">
          {onSwitchClass && (
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 px-2">Switch:</span>
              <select
                value={className}
                onChange={(e) => onSwitchClass(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 py-1 pr-2 outline-none cursor-pointer"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenTestFlow}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Test Real Student Flow</span>
          </button>
        </div>
      </div>

      {/* Demo Student Mode Control for MDM Inspection */}
      <DemoStudentToggle />

      {/* REQUIREMENT 3 SPECIFICATION:
          Display:
          Students Joined: REAL COUNT vs DEMO COUNT
          Students Logged In: REAL COUNT
          Recently Active: REAL COUNT
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Students Joined */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Students Joined
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {realClassStudents.length}
              </span>
              <span className="text-xs font-bold text-slate-500">Real</span>
              {demoClassStudents.length > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 font-bold">|</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{demoClassStudents.length}</span>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">Demo</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {demoClassStudents.length > 0 
                ? `Real Students: ${realClassStudents.length} • Demo/Test: ${demoClassStudents.length}`
                : `Registered in ${className}`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Students Logged In */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Students Logged In
            </span>
            <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
              {studentsLoggedInCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Have authenticated at least once
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        {/* Recently Active */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center space-x-1.5">
              <span>Recently Active</span>
              {recentlyActiveCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
              <span>{recentlyActiveCount}</span>
              {recentlyActiveCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active within last 15 minutes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Roster & Actual Student List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Enrolled Students ({studentsJoinedCount})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Live Firestore Sync
            </span>
          </div>
        </div>

        {/* Render StudentRoster */}
        <StudentRoster
          students={classStudents}
          className={className}
          subject={subject}
          onOpenTestHelper={onOpenTestFlow}
        />
      </div>
    </div>
  );
};
