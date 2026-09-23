import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  AlertCircle,
  Send,
  Plus,
  Check,
  Building,
  Info
} from 'lucide-react';

interface ParentAttendanceViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

interface LeaveRequest {
  id: string;
  childName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
  teacherNote?: string;
}

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    childName: 'Ananya Sharma',
    fromDate: '2026-07-12',
    toDate: '2026-07-13',
    reason: 'Mild Seasonal Fever & Doctor Visit',
    status: 'Approved',
    appliedOn: '2026-07-11',
    teacherNote: 'Approved by Headmaster Ramesh Sharma. Get well soon Ananya!',
  },
];

const ATTENDANCE_REGISTER = [
  { date: '2026-07-28', day: 'Tuesday', status: 'Present', timeIn: '08:45 AM', remark: 'On time for morning assembly' },
  { date: '2026-07-27', day: 'Monday', status: 'Present', timeIn: '08:42 AM', remark: 'On time' },
  { date: '2026-07-25', day: 'Saturday', status: 'Present', timeIn: '08:50 AM', remark: 'Half day school' },
  { date: '2026-07-24', day: 'Friday', status: 'Present', timeIn: '08:40 AM', remark: 'On time' },
  { date: '2026-07-23', day: 'Thursday', status: 'Late', timeIn: '09:15 AM', remark: 'Late by 30 mins due to rain bus delay' },
  { date: '2026-07-22', day: 'Wednesday', status: 'Present', timeIn: '08:44 AM', remark: 'On time' },
  { date: '2026-07-21', day: 'Tuesday', status: 'Present', timeIn: '08:45 AM', remark: 'On time' },
];

export const ParentAttendanceView: React.FC<ParentAttendanceViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Form states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Medical / Fever');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    soundFx.playClick();
    setIsSubmitting(true);

    setTimeout(() => {
      const newLeave: LeaveRequest = {
        id: 'l_' + Date.now(),
        childName: selectedChildName,
        fromDate,
        toDate,
        reason: `${reasonCategory}: ${note || 'Leave requested by parent'}`,
        status: 'Approved', // Auto-approved by system for demonstration
        appliedOn: new Date().toISOString().split('T')[0],
        teacherNote: 'Approved instantly via VidyaAI Parent Portal. Recorded in school register.',
      };
      setLeaveRequests([newLeave, ...leaveRequests]);
      setIsSubmitting(false);
      setIsLeaveModalOpen(false);
      soundFx.playSuccess();
      setFromDate('');
      setToDate('');
      setNote('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Biometric & Teacher Register Sync
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {selectedChildName}'s Attendance Record
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ZPHS Government High School, Medak • Academic Year 2026
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsLeaveModalOpen(true);
          }}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Student Leave Request</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold text-emerald-600 uppercase">Overall Attendance</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">98.0%</div>
          <p className="text-[11px] text-emerald-600 font-bold">State Target met (&gt;75%)</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold text-sky-600 uppercase">Days Present</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">24 / 25</div>
          <p className="text-[11px] text-slate-500">School working days</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold text-amber-600 uppercase">Late Arrivals</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">1 Day</div>
          <p className="text-[11px] text-amber-600">Arrived before 09:15 AM</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold text-purple-600 uppercase">Sanctioned Leave</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">1 Day</div>
          <p className="text-[11px] text-purple-600">Doctor Note submitted</p>
        </div>
      </div>

      {/* Leave Application History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Leave Applications & Teacher Approvals
        </h3>

        {leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No leave requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {leave.fromDate} to {leave.toDate}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{leave.reason}</p>
                  {leave.teacherNote && (
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium italic">
                      Note: "{leave.teacherNote}"
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  Applied on {leave.appliedOn}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Register List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Daily Attendance Register (July 2026)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gate Check-In Time</th>
                <th className="py-3 px-4">Teacher Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ATTENDANCE_REGISTER.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {item.date} <span className="text-slate-400 text-[11px]">({item.day})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{item.timeIn}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Request Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Student Leave Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct submission to Headmaster Ramesh Sharma
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedChildName}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    To Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Medical / Fever">Medical / Fever & Doctor Visit</option>
                  <option value="Family Function / Festival">Family Function / Village Festival</option>
                  <option value="Urgent Personal Work">Urgent Personal Work</option>
                  <option value="Other Reason">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note for Teacher / Headmaster
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ananya has high fever and doctor advised rest for 2 days. Will complete math homework at home."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
