import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Clock, 
  Activity, 
  CheckCircle2, 
  UserX, 
  Trash2, 
  LogIn, 
  Zap, 
  Eye, 
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { RealStudentProfile, deleteRealStudent, simulateRealStudentLogin, simulateRealStudentActivity } from '../../services/studentFirestoreService';
import { soundFx } from '../../lib/audio';

interface StudentRosterProps {
  students: RealStudentProfile[];
  className: string;
  subject: string;
  onOpenTestHelper?: () => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  className,
  subject,
  onOpenTestHelper
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recently_active' | 'logged_in' | 'offline'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedStudent, setSelectedStudent] = useState<RealStudentProfile | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter students based on search term & activity status
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'recently_active') {
      return !!s.isRecentlyActive;
    }
    if (filterType === 'logged_in') {
      return !!(s.lastLoginAt || s.lastLogin);
    }
    if (filterType === 'offline') {
      return !s.isRecentlyActive;
    }
    return true;
  });

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSimulateLogin = async (s: RealStudentProfile) => {
    setIsProcessing(true);
    soundFx.playClick();
    try {
      await simulateRealStudentLogin(s.uid);
      showFeedback(`Simulated login for ${s.name}. Last Login timestamp updated in Firestore!`);
    } catch (err: any) {
      showFeedback(`Error updating Firestore: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateActivity = async (s: RealStudentProfile, activity: string) => {
    setIsProcessing(true);
    soundFx.playClick();
    try {
      await simulateRealStudentActivity(s.uid, activity);
      showFeedback(`Recorded activity for ${s.name}: "${activity}". Last Active updated!`);
    } catch (err: any) {
      showFeedback(`Error updating Firestore: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteStudent = async (s: RealStudentProfile) => {
    if (!window.confirm(`Are you sure you want to remove "${s.name}" from Firestore? This helps test data accuracy (e.g. 0 -> 0).`)) {
      return;
    }
    setIsProcessing(true);
    soundFx.playClick();
    try {
      await deleteRealStudent(s.uid);
      showFeedback(`Student ${s.name} removed from Firestore.`);
      if (selectedStudent?.uid === s.uid) {
        setSelectedStudent(null);
      }
    } catch (err: any) {
      showFeedback(`Error removing from Firestore: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatRelative = (iso?: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    const ms = Date.now() - date.getTime();
    if (isNaN(ms) || ms < 0) return 'Just now';
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionFeedback}</span>
          </div>
          <button 
            onClick={() => setActionFeedback(null)} 
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Roster Controls: Search, Filters, View toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilterType('recently_active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              filterType === 'recently_active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active (&lt;15m) ({students.filter((s) => s.isRecentlyActive).length})</span>
          </button>
          <button
            onClick={() => setFilterType('logged_in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'logged_in'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
            }`}
          >
            Logged In ({students.filter((s) => !!(s.lastLoginAt || s.lastLogin)).length})
          </button>
          <button
            onClick={() => setFilterType('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'offline'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Offline ({students.filter((s) => !s.isRecentlyActive).length})
          </button>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center ml-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Empty State: EXACT REQUIREMENT MATCH "No students enrolled yet." */}
      {filteredStudents.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <UserX className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No students enrolled yet.
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {students.length === 0
                ? `There are currently 0 real students enrolled in ${className} (${subject}) in Firestore. When students register and choose ${className}, they will appear here in real time.`
                : `No enrolled students match your filter "${filterType}".`}
            </p>
          </div>

          {onOpenTestHelper && (
            <div className="pt-2">
              <button
                onClick={onOpenTestHelper}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enroll Test Student in {className} via Firestore</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {filteredStudents.length > 0 && viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Learning Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((s) => {
                  const isRecent = !!s.isRecentlyActive;
                  const hasLoggedIn = !!(s.lastLoginAt || s.lastLogin);
                  return (
                    <tr 
                      key={s.uid}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStudent(s)}
                    >
                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRecent 
                              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span>{s.name}</span>
                              {(s.isDemo || s.hasDemoActivity) && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  DEMO / TEST ACTIVITY
                                </span>
                              )}
                              {isRecent && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                                  Active Now
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {s.rollNumber || `UID: ${s.uid.substring(0, 8)}...`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{s.email}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasLoggedIn ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatRelative(s.lastLoginAt || s.lastLogin)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatTimestamp(s.lastLoginAt || s.lastLogin)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Never logged in</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {s.lastActiveAt ? (
                          <div className="space-y-0.5">
                            <div className={`font-semibold flex items-center space-x-1.5 ${
                              isRecent ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {isRecent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>}
                              <span>{formatRelative(s.lastActiveAt)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatTimestamp(s.lastActiveAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No activity yet</span>
                        )}
                      </td>

                      {/* Learning Activity */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[220px]">
                          <div className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate" title={s.currentActivity || s.recentActivity || 'None'}>
                            {s.currentActivity || s.recentActivity || 'Enrolled in class'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span>📚 {s.lessonsCompleted || 0} lessons</span>
                            <span>•</span>
                            <span>✍️ {s.practiceCompleted || 0} practice</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleSimulateLogin(s)}
                            title="Simulate student login in Firestore"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            title="View student profile details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s)}
                            title="Delete student document from Firestore"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {filteredStudents.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((s) => {
            const isRecent = !!s.isRecentlyActive;
            const hasLoggedIn = !!(s.lastLoginAt || s.lastLogin);
            return (
              <div
                key={s.uid}
                onClick={() => setSelectedStudent(s)}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer hover:shadow-md space-y-3 ${
                  isRecent 
                    ? 'border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/30' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      isRecent ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                          {s.name}
                        </h4>
                        {s.isDemo && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {s.email}
                      </div>
                    </div>
                  </div>
                  {isRecent ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                      Active Now
                    </span>
                  ) : hasLoggedIn ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Enrolled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                      Not Logged In
                    </span>
                  )}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Last Login:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatRelative(s.lastLoginAt || s.lastLogin)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Last Active:</span>
                    <span className={`font-bold ${isRecent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {formatRelative(s.lastActiveAt)}
                    </span>
                  </div>
                </div>

                {/* Current Activity */}
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] text-slate-400 block">Current Activity:</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={s.currentActivity || s.recentActivity || ''}>
                    {s.currentActivity || s.recentActivity || 'Enrolled in Class'}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-slate-400">
                    Joined: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleSimulateLogin(s)}
                      title="Simulate Login"
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      title="Delete Student"
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 flex-wrap">
                    <span>{selectedStudent.name}</span>
                    {(selectedStudent.isDemo || selectedStudent.hasDemoActivity) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        DEMO / TEST ACTIVITY
                      </span>
                    )}
                    {selectedStudent.isRecentlyActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active Now
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Class / Grade</span>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedStudent.grade || `Class ${selectedStudent.class}` || className}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Board</span>
                <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  {selectedStudent.board || 'AP State Board / SSC'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Joined Date</span>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Instruction Medium</span>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedStudent.medium || 'Telugu Medium'}
                </div>
              </div>
            </div>

            {/* Login & Activity Real Timestamps */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Real-Time Login & Activity Tracking</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Last Login Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatTimestamp(selectedStudent.lastLoginAt || selectedStudent.lastLogin)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Last Active Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatTimestamp(selectedStudent.lastActiveAt)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Current Learning Activity:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedStudent.currentActivity || selectedStudent.recentActivity || 'Enrolled in Class'}
                </span>
              </div>
            </div>

            {/* Live Simulation Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate Student Events (Direct Firestore Writes)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleSimulateLogin(selectedStudent)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Simulate Login</span>
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleSimulateActivity(selectedStudent, `Opened Chapter 3 - Quadratic Equations`)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Chapter</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
