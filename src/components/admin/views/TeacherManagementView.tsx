import React, { useState } from 'react';
import { AdminTeacher } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  GraduationCap,
  Plus,
  Phone,
  Mail,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  X,
  Search,
  UserCheck
} from 'lucide-react';

interface TeacherManagementViewProps {
  teachers: AdminTeacher[];
  setTeachers: React.Dispatch<React.SetStateAction<AdminTeacher[]>>;
}

export const TeacherManagementView: React.FC<TeacherManagementViewProps> = ({
  teachers,
  setTeachers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    designation: 'School Assistant Science',
    subjects: 'Physical Science, Mathematics',
    qualification: 'M.Sc, B.Ed',
    experienceYears: 5,
    phone: '+91 ',
    email: '@telangana.gov.in',
    classTeacherOf: 'Class 8-B',
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name) return;
    soundFx.playSuccess();

    const created: AdminTeacher = {
      id: `TCH-${100 + teachers.length + 1}`,
      employeeId: `EMP-2026-0${teachers.length + 1}`,
      name: newTeacher.name,
      designation: newTeacher.designation,
      subjects: newTeacher.subjects.split(',').map((s) => s.trim()),
      qualification: newTeacher.qualification,
      experienceYears: Number(newTeacher.experienceYears) || 3,
      phone: newTeacher.phone,
      email: newTeacher.email,
      classTeacherOf: newTeacher.classTeacherOf || undefined,
      attendanceStatus: 'Present',
      assignedPeriodsPerWeek: 24,
    };

    setTeachers([created, ...teachers]);
    setShowAddModal(false);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjects.some((sub) => sub.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty & Teaching Staff Roster
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Teacher Management & Workload Allocation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {teachers.length} Verified Teaching Staff • Verified DEO AP SSC Staff Credentials
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty Member</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search Faculty Name, Designation, or Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  {t.employeeId}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                  {t.name}
                </h3>
                <p className="text-xs font-bold text-slate-500">{t.designation}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                t.attendanceStatus === 'Present'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {t.attendanceStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Subjects Taught:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {t.subjects.join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Class Teacher Of:</span>
                <span className="font-extrabold text-blue-600">
                  {t.classTeacherOf || 'Subject Specialist'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Qualification:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {t.qualification} ({t.experienceYears} Yrs Exp)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Weekly Workload:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {t.assignedPeriodsPerWeek} Periods / Wk
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-500" />
                <span>{t.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-500" />
                <span className="truncate max-w-[120px]">{t.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Faculty Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. K. Fatima"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={newTeacher.designation}
                    onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTeacher.subjects}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subjects: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={newTeacher.qualification}
                    onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Teacher Assignment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Class 8-B"
                    value={newTeacher.classTeacherOf}
                    onChange={(e) => setNewTeacher({ ...newTeacher, classTeacherOf: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  Register Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
