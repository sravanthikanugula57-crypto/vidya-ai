import React, { useState } from 'react';
import { AdminClass, AdminTeacher } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  BookOpen,
  Plus,
  Users,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  Edit2,
  X,
  TrendingUp
} from 'lucide-react';

interface ClassManagementViewProps {
  classes: AdminClass[];
  setClasses: React.Dispatch<React.SetStateAction<AdminClass[]>>;
  teachers: AdminTeacher[];
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  setClasses,
  teachers,
}) => {
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('Class 7-B');
  const [newGrade, setNewGrade] = useState('Class 7');
  const [newSection, setNewSection] = useState('B');
  const [newRoom, setNewRoom] = useState('Room 105');
  const [newTeacher, setNewTeacher] = useState(teachers[0]?.name || 'Ramesh Sharma');

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();

    const created: AdminClass = {
      id: `CLS-00${classes.length + 1}`,
      name: newClassName,
      grade: newGrade,
      section: newSection,
      roomNumber: newRoom,
      classTeacher: newTeacher,
      studentCount: 38,
      capacity: 45,
      attendanceToday: 96,
      averageGpa: 8.5,
    };

    setClasses([...classes, created]);
    setShowAddClassModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Classrooms & Section Directory
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Class Management & Room Allocation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {classes.length} Active Classroom Sections • Physical Room Assignment & Class Teacher Mapping
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddClassModal(true);
          }}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Configure New Section</span>
        </button>
      </div>

      {/* Class Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 transition"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">
                  {cls.id}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {cls.name}
                </h3>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold">
                {cls.roomNumber}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Class Teacher:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {cls.classTeacher}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Student Strength:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {cls.studentCount} / {cls.capacity} Enrolled
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${(cls.studentCount / cls.capacity) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{cls.attendanceToday}% Attendance</span>
                </div>

                <div className="font-black text-amber-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{cls.averageGpa} Avg GPA</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Create New Classroom Section
              </h3>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Teacher
                  </label>
                  <select
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
