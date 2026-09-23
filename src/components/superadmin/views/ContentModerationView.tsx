import React, { useState } from 'react';
import { FlaggedContentItem } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  X
} from 'lucide-react';

interface ContentModerationViewProps {
  flaggedItems: FlaggedContentItem[];
  setFlaggedItems: React.Dispatch<React.SetStateAction<FlaggedContentItem[]>>;
}

export const ContentModerationView: React.FC<ContentModerationViewProps> = ({
  flaggedItems,
  setFlaggedItems
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filtered = flaggedItems.filter(item => {
    const matchesSearch =
      item.querySnippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleUpdateStatus = (id: string, newStatus: FlaggedContentItem['status']) => {
    soundFx.playClick();
    setFlaggedItems(prev =>
      prev.map(i => (i.id === id ? { ...i, status: newStatus } : i))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Tutor Content Safety & Student Chat Moderation
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated & Human Safety Filters, Cheating Prevention, PII Masking & Vernacular Guardrails.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Flagged Query Snippet, Student ID, or School..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="All">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                  item.severity === 'High' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                  item.severity === 'Medium' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                  'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                }`}>
                  SEVERITY: {item.severity}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.flagReason}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 font-medium">{item.flaggedAt}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400">STUDENT PROMPT QUERY ({item.language}):</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">"{item.querySnippet}"</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400">AI TUTOR SAFEGUARD RESPONSE:</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">"{item.aiResponseSnippet}"</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">
                Student ID: <strong>{item.studentId}</strong> ({item.schoolName}, {item.district})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'Blocked & Warned')}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-[11px]"
                >
                  Block & Warn
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'Auto-Dismissed')}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
