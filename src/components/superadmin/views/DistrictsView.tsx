import React, { useState } from 'react';
import { SuperAdminDistrict } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  MapPin,
  Users,
  Building2,
  Award,
  TrendingUp,
  Plus,
  Edit3,
  Phone,
  Mail,
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DistrictsViewProps {
  districts: SuperAdminDistrict[];
  setDistricts: React.Dispatch<React.SetStateAction<SuperAdminDistrict[]>>;
}

export const DistrictsView: React.FC<DistrictsViewProps> = ({ districts, setDistricts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [distName, setDistName] = useState('');
  const [deoName, setDeoName] = useState('');
  const [deoEmail, setDeoEmail] = useState('');
  const [deoPhone, setDeoPhone] = useState('');
  const [budget, setBudget] = useState('₹ 10.0 Cr');

  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.deoName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distName || !deoName) return;

    soundFx.playSuccess();
    const newDist: SuperAdminDistrict = {
      id: `dist-${Date.now()}`,
      name: distName,
      state: 'Andhra Pradesh',
      deoName,
      deoEmail: deoEmail || `deo.${distName.toLowerCase()}@ap.gov.in`,
      deoPhone: deoPhone || '+91 94400 00000',
      totalSchools: 120,
      totalStudents: 28000,
      totalTeachers: 950,
      allocatedBudget: budget,
      avgPassRate: 85.0,
      aiUsageRank: districts.length + 1,
      status: 'Optimal',
    };

    setDistricts([...districts, newDist]);
    setIsAddModalOpen(false);
    setDistName('');
    setDeoName('');
    setDeoEmail('');
    setDeoPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              State Districts Administration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            District Educational Officer (DEO) Assignments, Grant Allocations & Pass Rates across Andhra Pradesh (AP SSC).
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New District</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
        <input
          type="text"
          placeholder="Search District Name or DEO Officer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Districts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDistricts.map((dist) => (
          <div
            key={dist.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  RANK #{dist.aiUsageRank} IN TELANGANA
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                  {dist.name} District
                </h3>
                <p className="text-xs text-slate-500">
                  {dist.state} State Board Education
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                  dist.status === 'High Performance'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : dist.status === 'Optimal'
                    ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                ● {dist.status}
              </span>
            </div>

            {/* DEO Info */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <p className="font-extrabold text-slate-800 dark:text-slate-200">
                DEO: {dist.deoName}
              </p>
              <p className="text-slate-500 text-[11px]">✉️ {dist.deoEmail}</p>
              <p className="text-slate-500 text-[11px]">📞 {dist.deoPhone}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Schools</p>
                <p className="font-black text-slate-800 dark:text-slate-100">{dist.totalSchools}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
                <p className="font-black text-slate-800 dark:text-slate-100">{dist.totalStudents.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pass %</p>
                <p className="font-black text-emerald-600">{dist.avgPassRate}%</p>
              </div>
            </div>

            {/* Budget Banner */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Allocated Grant:</span>
              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{dist.allocatedBudget}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Add District */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDistrict}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Add District Portal
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
                  District Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Khammam"
                  value={distName}
                  onChange={(e) => setDistName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned DEO Officer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DEO Officer Name"
                  value={deoName}
                  onChange={(e) => setDeoName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  DEO Email
                </label>
                <input
                  type="email"
                  placeholder="deo.khammam@telangana.gov.in"
                  value={deoEmail}
                  onChange={(e) => setDeoEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Grant Budget Allocation
                </label>
                <input
                  type="text"
                  placeholder="₹ 12.0 Cr"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
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
                Create District
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
