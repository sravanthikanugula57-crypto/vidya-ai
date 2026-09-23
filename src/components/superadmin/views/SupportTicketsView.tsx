import React, { useState } from 'react';
import { SupportTicket } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  X,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

interface SupportTicketsViewProps {
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({ tickets, setTickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    soundFx.playClick();
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Multi-School Helpdesk & Support Tickets
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hardware Labs, Vernacular AI Error Reports, Account Lockouts & Network Technical Support.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Ticket Code, Subject or School..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-black border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">School & District</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                    {t.ticketCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.schoolName}</p>
                    <p className="text-[10px] text-slate-400">{t.district} District</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                    {t.subject}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{t.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      t.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                      t.priority === 'High' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' :
                      t.status === 'In Progress' ? 'bg-sky-500/10 text-sky-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {t.assignedTo}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedTicket(t);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black text-amber-600">{selectedTicket.ticketCode}</span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedTicket.subject}
                </h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
              <p>🏫 <strong>School:</strong> {selectedTicket.schoolName} ({selectedTicket.district})</p>
              <p>🏷️ <strong>Category:</strong> {selectedTicket.category}</p>
              <p>👤 <strong>Assigned Support Engineer:</strong> {selectedTicket.assignedTo}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Update Ticket Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['In Progress', 'Resolved', 'Escalated'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      selectedTicket.status === st
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
