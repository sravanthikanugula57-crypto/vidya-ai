import React from 'react';
import { OFFICIAL_SCHOLARSHIPS } from '../../data/officialScholarships';
import { X, Award, ExternalLink, CheckCircle, Calendar, IndianRupee } from 'lucide-react';

interface ScholarshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScholarshipsModal: React.FC<ScholarshipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Verified Government Scholarships Directory</h3>
              <p className="text-xs text-amber-100">Official Central & State Government Welfare Schemes for Government School Students</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scholarships List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>Official Government Scholarship Schemes for SSC & State Board enrolled students:</span>
          </div>

          {OFFICIAL_SCHOLARSHIPS.map((sch) => (
            <div key={sch.id} className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-amber-500 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  {sch.category}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified Govt Scheme
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white">{sch.title}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <IndianRupee className="w-4 h-4 text-emerald-500" />
                  <span>Benefit: <b>{sch.amount}</b></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Timeline: <b>{sch.deadline}</b></span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl">
                <b>Eligibility Criteria:</b> {sch.eligibility}
              </p>

              <a
                href={sch.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl transition shadow cursor-pointer"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
