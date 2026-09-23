import React, { useState } from 'react';
import { SuperAdminSchool } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Phone,
  Mail,
  X,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Download
} from 'lucide-react';

interface SchoolsViewProps {
  schools: SuperAdminSchool[];
  setSchools: React.Dispatch<React.SetStateAction<SuperAdminSchool[]>>;
}

export const SchoolsView: React.FC<SchoolsViewProps> = ({ schools, setSchools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedSchool, setSelectedSchool] = useState<SuperAdminSchool | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newUdise, setNewUdise] = useState('');
  const [newDistrict, setNewDistrict] = useState('Medak');
  const [newMedium, setNewMedium] = useState('Telugu & English Medium');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const districtsList = Array.from(new Set(schools.map(s => s.district)));

  const filteredSchools = schools.filter(school => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.udiseCode.includes(searchTerm) ||
      school.principalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === 'All' || school.district === districtFilter;
    const matchesStatus = statusFilter === 'All' || school.status === statusFilter;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newUdise) return;

    soundFx.playSuccess();
    const newEntry: SuperAdminSchool = {
      id: `sch-${Date.now()}`,
      udiseCode: newUdise,
      name: newSchoolName,
      district: newDistrict,
      state: 'Andhra Pradesh',
      board: 'Andhra Pradesh State Board (AP SSC)',
      medium: newMedium,
      principalName: newPrincipal || 'To Be Appointed',
      contactPhone: newPhone || '+91 94400 00000',
      contactEmail: `school.${newUdise}@ap.gov.in`,
      totalStudents: 350,
      totalTeachers: 15,
      activeTabletLabs: 1,
      status: 'Active',
      licenseTier: 'Government Enterprise',
      aiQuotaLimit: 15000,
      aiQuotaUsed: 0,
      establishedYear: 2020,
      lastAuditDate: new Date().toISOString().split('T')[0],
    };

    setSchools([newEntry, ...schools]);
    setIsAddModalOpen(false);
    setNewSchoolName('');
    setNewUdise('');
    setNewPrincipal('');
    setNewPhone('');
  };

  const handleToggleStatus = (schoolId: string) => {
    soundFx.playClick();
    setSchools(prev =>
      prev.map(s => {
        if (s.id === schoolId) {
          const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Multi-School Directory Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized UDISE Registry, License Grants, AI Token Quotas & School Readiness across Andhra Pradesh (AP SSC).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              alert('Exported Multi-School Registry as CSV');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Registry</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New School</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by School Name, UDISE Code or Principal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="All">All Districts ({districtsList.length})</option>
            {districtsList.map(d => (
              <option key={d} value={d}>{d} District</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((school) => {
          const quotaPercent = Math.round((school.aiQuotaUsed / school.aiQuotaLimit) * 100);

          return (
            <div
              key={school.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      UDISE: {school.udiseCode}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {school.name}
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      {school.district} District • {school.medium}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                      school.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : school.status === 'Maintenance'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : school.status === 'Onboarding'
                        ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}
                  >
                    ● {school.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
                    <p className="font-black text-slate-800 dark:text-slate-200">{school.totalStudents}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Teachers</p>
                    <p className="font-black text-slate-800 dark:text-slate-200">{school.totalTeachers}</p>
                  </div>
                </div>

                {/* AI Quota Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Daily AI Token Quota</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {school.aiQuotaUsed.toLocaleString()} / {school.aiQuotaLimit.toLocaleString()} ({quotaPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quotaPercent > 90
                          ? 'bg-rose-500'
                          : quotaPercent > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                  <p>👤 <strong>HM:</strong> {school.principalName}</p>
                  <p>📞 <strong>Phone:</strong> {school.contactPhone}</p>
                  <p>💻 <strong>Tablet Labs:</strong> {school.activeTabletLabs} Active Unit(s)</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSchool(school);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleToggleStatus(school.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    school.status === 'Active'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {school.status === 'Active' ? 'Suspend Access' : 'Activate School'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                  {selectedSchool.licenseTier}
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedSchool.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-[10px] font-bold text-slate-400">UDISE CODE</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{selectedSchool.udiseCode}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-[10px] font-bold text-slate-400">DISTRICT</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{selectedSchool.district}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-[10px] font-bold text-slate-400">ESTABLISHED YEAR</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{selectedSchool.establishedYear}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-[10px] font-bold text-slate-400">LAST AUDIT DATE</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{selectedSchool.lastAuditDate}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">Contact Information</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <p>👤 <strong>Head Master / Principal:</strong> {selectedSchool.principalName}</p>
                <p>📞 <strong>Phone:</strong> {selectedSchool.contactPhone}</p>
                <p>✉️ <strong>Official Email:</strong> {selectedSchool.contactEmail}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New School Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSchool}
            className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Register New Government School
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZPHS Medak Girls High School"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    UDISE Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="36140100999"
                    value={newUdise}
                    onChange={(e) => setNewUdise(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    District
                  </label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  >
                    {districtsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Medium of Instruction
                </label>
                <select
                  value={newMedium}
                  onChange={(e) => setNewMedium(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                >
                  <option value="Telugu & English Medium">Telugu & English Medium</option>
                  <option value="Telugu Medium">Telugu Medium</option>
                  <option value="English Medium">English Medium</option>
                  <option value="Urdu & English Medium">Urdu & English Medium</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Principal Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name of HM"
                    value={newPrincipal}
                    onChange={(e) => setNewPrincipal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 94400 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Save & Provision School
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
