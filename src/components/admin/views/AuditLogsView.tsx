import React, { useState } from 'react';
import { AuditLogItem } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Terminal,
  Activity
} from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLogItem[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
          <Terminal className="w-3.5 h-3.5" />
          System Activity & Audit Compliance Ledger
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Real-time Audit Logs & Security Traces
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable System Event Log Tracking Admin Approvals, Gate Attendance Updates & DEO Inspector Audits
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search logs by User, Action, or Module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
        >
          <option value="All">All Severity Levels</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-slate-500 font-bold">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                    {log.user}
                    <div className="text-[10px] text-slate-400 font-normal">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-bold">
                    {log.module}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      log.severity === 'Critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : log.severity === 'Warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
