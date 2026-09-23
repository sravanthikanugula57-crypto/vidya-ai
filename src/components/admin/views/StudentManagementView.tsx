import React, { useState } from 'react';
import { AdminStudent } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Phone,
  Award,
  UserCheck,
  Download,
  Check
} from 'lucide-react';

interface StudentManagementViewProps {
  students: AdminStudent[];
  setStudents: React.Dispatch<React.SetStateAction<AdminStudent[]>>;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  setStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Form State for Adding Student
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    grade: 'Class 9',
    section: 'A',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    guardianName: '',
    guardianPhone: '+91 ',
    casteCategory: 'OBC',
    scholarshipEligible: true,
  });

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo) return;
    soundFx.playSuccess();

    const created: AdminStudent = {
      id: `STU-00${students.length + 1}`,
      rollNo: newStudent.rollNo,
      name: newStudent.name,
      grade: newStudent.grade,
      section: newStudent.section,
      gender: newStudent.gender,
      guardianName: newStudent.guardianName || 'Guardian',
      guardianPhone: newStudent.guardianPhone || '+91 98765 00000',
      attendancePercent: 100,
      academicAverage: 85,
      status: 'Active',
      casteCategory: newStudent.casteCategory,
      scholarshipEligible: newStudent.scholarshipEligible,
    };

    setStudents([created, ...students]);
    setShowAddModal(false);
    setNewStudent({
      name: '',
      rollNo: '',
      grade: 'Class 9',
      section: 'A',
      gender: 'Female',
      guardianName: '',
      guardianPhone: '+91 ',
      casteCategory: 'OBC',
      scholarshipEligible: true,
    });
  };

  const toggleStudentSelection = (id: string) => {
    soundFx.playClick();
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    soundFx.playClick();
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Student Master Registry
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Student Profiles & Attendance Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total {students.length} Registered Students • SCERT & District Educational Office Roll Ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Student Name, Roll #, or Guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
          >
            <option value="All">All Class Grades</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          {selectedStudentIds.length > 0 && (
            <div className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <span>{selectedStudentIds.length} Selected</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  alert(`Exporting ${selectedStudentIds.length} student records for DEO audit.`);
                }}
                className="underline font-black"
              >
                Export List
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                </th>
                <th className="py-3 px-3">Roll #</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Grade & Sec</th>
                <th className="py-3 px-3">Guardian Contact</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Academic Avg</th>
                <th className="py-3 px-3">Scholarship</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={() => toggleStudentSelection(s.id)}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-amber-600">
                    #{s.rollNo}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                    {s.name}
                    <div className="text-[10px] text-slate-400 font-normal">{s.id}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">
                    {s.grade} - {s.section}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    <div>{s.guardianName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {s.guardianPhone}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {s.attendancePercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600">
                    {s.academicAverage}%
                  </td>
                  <td className="py-3 px-3">
                    {s.scholarshipEligible ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        Eligible
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      s.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                Admit New Student to School Ledger
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Grade
                  </label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Section & Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roll 29"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="Parent / Guardian Name"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
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
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Save Student Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
