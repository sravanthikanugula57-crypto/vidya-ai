import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Calendar,
  AlertTriangle,
  UserCheck,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { CMSItem, CMSApprovalStatus } from './cmsData';
import { soundFx } from '../../lib/audio';

interface ApprovalWorkflowModalProps {
  item: CMSItem | null;
  userName: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (item: CMSItem, newStatus: CMSApprovalStatus, comments: string) => void;
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  item,
  userName,
  userRole,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!isOpen || !item) return null;

  const [selectedStatus, setSelectedStatus] = useState<CMSApprovalStatus>(item.status);
  const [comments, setComments] = useState('');

  const handleApplyWorkflow = () => {
    soundFx.playSuccess();
    onStatusChange(item, selectedStatus, comments || `Status changed to ${selectedStatus} by ${userName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>SCERT Approval Workflow & Governance</span>
              </h2>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {item.title} ({item.code})
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Current Status Pill Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Current State
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {item.status}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Author
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {item.author.name} ({item.author.role})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Scheduled Date
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {item.schedule?.publishDate || 'Immediate'}
              </span>
            </div>
          </div>

          {/* Workflow Action Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Select New Approval / Publishing Transition State
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { status: 'Draft', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                { status: 'Pending Approval', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                { status: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                { status: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                { status: 'Published', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                { status: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' },
                { status: 'Archived', color: 'bg-zinc-200 text-zinc-800 border-zinc-400' },
              ].map((st) => (
                <button
                  key={st.status}
                  type="button"
                  onClick={() => { soundFx.playClick(); setSelectedStatus(st.status as CMSApprovalStatus); }}
                  className={`p-3 rounded-2xl text-xs font-bold border transition text-center cursor-pointer ${st.color} ${
                    selectedStatus === st.status
                      ? 'ring-2 ring-amber-500 shadow-md font-black scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {st.status}
                </button>
              ))}
            </div>
          </div>

          {/* Approver Notes textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
              Approval / Review Comments (Logged in Audit History)
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Verified against SCERT 2026 textbook syllabus and state exam blueprint."
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
            />
          </div>

          {/* Previous Approval History Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Approval Audit History</span>
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {item.approvalHistory?.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{rec.status}</span>
                    <span className="text-slate-500 font-semibold ml-2">• by {rec.actor}</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{rec.comments}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{rec.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyWorkflow}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply Workflow State: {selectedStatus}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
