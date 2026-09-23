import React, { useState } from 'react';
import { AdminSubject } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  BookOpen,
  Plus,
  Award,
  Clock,
  UserCheck,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';

interface SubjectManagementViewProps {
  subjects: AdminSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<AdminSubject[]>>;
}

export const SubjectManagementView: React.FC<SubjectManagementViewProps> = ({
  subjects,
  setSubjects,
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newCode, setNewCode] = useState('ICT-09');
  const [newName, setNewName] = useState('AI & Information Technology');
  const [newGrade, setNewGrade] = useState('Class 9');
  const [newHead, setNewHead] = useState('Ramesh Sharma');
  const [newPeriods, setNewPeriods] = useState(4);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();

    const created: AdminSubject = {
      id: `SUB-0${subjects.length + 1}`,
      code: newCode,
      name: newName,
      grade: newGrade,
      departmentHead: newHead,
      weeklyPeriods: Number(newPeriods) || 4,
      curriculumBoard: 'SCERT AP SSC',
      teachersAssigned: 2,
    };

    setSubjects([...subjects, created]);
    setShowAddSubject(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum Catalog & Board Alignment
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Subject Management & Weekly Period Quota
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {subjects.length} Core Subjects Aligned with SCERT AP SSC Board Framework
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddSubject(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-300 transition"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-black text-emerald-600 uppercase">
                  {sub.code}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {sub.name}
                </h3>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                {sub.grade}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Department Head:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {sub.departmentHead}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Weekly Period Quota:</span>
                <span className="font-black text-emerald-600">
                  {sub.weeklyPeriods} Periods / Week
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Curriculum Board:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {sub.curriculumBoard}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Assigned Faculty:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {sub.teachersAssigned} Teachers
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add New Curriculum Subject
              </h3>
              <button
                onClick={() => setShowAddSubject(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    required
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Weekly Periods
                  </label>
                  <input
                    type="number"
                    required
                    value={newPeriods}
                    onChange={(e) => setNewPeriods(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
