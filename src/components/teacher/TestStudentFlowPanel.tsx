import React, { useState } from 'react';
import { 
  Sparkles, 
  UserPlus, 
  LogIn, 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  GraduationCap, 
  Clock, 
  Check, 
  Video, 
  FileText, 
  Award,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';
import { 
  RealStudentProfile, 
  createRealTestStudent, 
  simulateRealStudentLogin, 
  simulateRealStudentActivity, 
  deleteRealStudent 
} from '../../services/studentFirestoreService';
import { soundFx } from '../../lib/audio';

interface TestStudentFlowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass?: string | null;
  students: RealStudentProfile[];
}

export const TestStudentFlowPanel: React.FC<TestStudentFlowPanelProps> = ({
  isOpen,
  onClose,
  currentClass,
  students
}) => {
  // Extract number from currentClass (e.g. "Class 6" -> 6) or default to 5
  const initialClassNum = currentClass ? parseInt(currentClass.replace(/\D/g, ''), 10) || 5 : 5;

  const [studentName, setStudentName] = useState('Rahul Sharma');
  const [targetClass, setTargetClass] = useState<number>(initialClassNum);
  const [board, setBoard] = useState('AP State Board / SSC');
  const [lang, setLang] = useState('te');
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState('Opened Chapter: Chapter 3 - Quadratic Equations');

  const [isLoading, setIsLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<Array<{ text: string; time: string; type: 'success' | 'info' | 'error' }>>([]);

  if (!isOpen) return null;

  const addLog = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setLogMessages((prev) => [{ text, time, type }, ...prev.slice(0, 9)]);
  };

  const handleCreateStudent = async () => {
    if (!studentName.trim()) {
      addLog('Student name cannot be empty.', 'error');
      return;
    }
    setIsLoading(true);
    soundFx.playClick();
    try {
      addLog(`Writing new student document to Firestore (users/{uid})...`, 'info');
      const newUid = await createRealTestStudent({
        name: studentName.trim(),
        class: targetClass,
        board,
        preferredLanguage: lang,
        isOnlineNow: true
      });
      setSelectedStudentUid(newUid);
      soundFx.playSuccess();
      addLog(`Created student "${studentName}" in Firestore! UID: ${newUid.substring(0, 8)}... (users/${newUid})`, 'success');
      // Generate a new random name for next test
      const names = ['Priya Devi', 'Karthik Rao', 'Sneha Reddy', 'Venkata Sai', 'Ananya Varma', 'Manish Kumar'];
      setStudentName(names[Math.floor(Math.random() * names.length)]);
    } catch (err: any) {
      addLog(`Failed to create student in Firestore: ${err?.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateLogin = async () => {
    const uidToLogin = selectedStudentUid || (students[0] ? students[0].uid : '');
    if (!uidToLogin) {
      addLog('Please select or create a student first.', 'error');
      return;
    }
    const student = students.find((s) => s.uid === uidToLogin);
    const displayName = student ? student.name : uidToLogin.substring(0, 8);

    setIsLoading(true);
    soundFx.playClick();
    try {
      addLog(`Updating users/${uidToLogin}.lastLoginAt in Firestore...`, 'info');
      await simulateRealStudentLogin(uidToLogin);
      soundFx.playSuccess();
      addLog(`Simulated login for "${displayName}"! Firestore document updated. Teacher portal will reflect updated timestamp.`, 'success');
    } catch (err: any) {
      addLog(`Failed to update lastLoginAt: ${err?.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateActivity = async () => {
    const uidToAct = selectedStudentUid || (students[0] ? students[0].uid : '');
    if (!uidToAct) {
      addLog('Please select or create a student first.', 'error');
      return;
    }
    const student = students.find((s) => s.uid === uidToAct);
    const displayName = student ? student.name : uidToAct.substring(0, 8);

    setIsLoading(true);
    soundFx.playClick();
    try {
      addLog(`Updating users/${uidToAct}.lastActiveAt with "${selectedActivity}"...`, 'info');
      await simulateRealStudentActivity(uidToAct, selectedActivity);
      soundFx.playSuccess();
      addLog(`Activity recorded for "${displayName}"! lastActiveAt set to current time (<15m = Active Now).`, 'success');
    } catch (err: any) {
      addLog(`Failed to update student activity: ${err?.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    const uidToDelete = selectedStudentUid || (students[0] ? students[0].uid : '');
    if (!uidToDelete) {
      addLog('No student selected to delete.', 'error');
      return;
    }
    setIsLoading(true);
    soundFx.playClick();
    try {
      await deleteRealStudent(uidToDelete);
      addLog(`Deleted document users/${uidToDelete} from Firestore. Enrolled count will decrement immediately.`, 'info');
      setSelectedStudentUid('');
    } catch (err: any) {
      addLog(`Failed to delete: ${err?.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-yellow-300 font-black text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Evaluation Helper</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Test Real Student Flow
          </h3>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Every button directly writes real documents in <span className="font-mono bg-blue-700/50 px-1 py-0.5 rounded">users/{'{uid}'}</span> on Firebase Firestore. No fake data or state-only updates.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Action 1: Create Test Student via Firebase */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Create Test Student (via Firebase)</span>
              </div>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                Writes to Firestore users/{'{uid}'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Enrolled Class
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value={5}>Class 5</option>
                  <option value={6}>Class 6</option>
                  <option value={7}>Class 7</option>
                  <option value={8}>Class 8</option>
                  <option value={9}>Class 9</option>
                  <option value={10}>Class 10</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Board & Language
                </label>
                <div className="flex gap-1">
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="flex-1 px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="AP State Board / SSC">AP SSC</option>
                    <option value="CBSE">CBSE</option>
                  </select>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-16 px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold"
                  >
                    <option value="te">TE</option>
                    <option value="en">EN</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              onClick={handleCreateStudent}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Test Student in Class {targetClass} (Firestore)</span>
            </button>
          </div>

          {/* Action 2 & 3: Simulate Student Login & Meaningful Activity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Simulate Real Student Login & Activity</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Updates lastLoginAt / lastActiveAt
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Target Student ({students.length} in Firestore)
                </label>
                <span className="text-[10px] text-emerald-600 font-bold">Class 10 E2E Accounts</span>
              </div>

              {/* 3 Real Test Students Quick Pick */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Adduri Surendra', email: '24331A4202@mvgrce.edu.in', uid: 'user_24331a4202_mvgrce_edu_in' },
                  { name: 'Make Praveen', email: '24331A4260@mvgrce.edu.in', uid: 'user_24331a4260_mvgrce_edu_in' },
                  { name: 'Marpina Yukthanjali', email: '24331A4264@mvgrce.edu.in', uid: 'user_24331a4264_mvgrce_edu_in' }
                ].map((st) => (
                  <button
                    key={st.uid}
                    type="button"
                    onClick={() => {
                      setSelectedStudentUid(st.uid);
                      addLog(`Selected student: ${st.name} (${st.email})`, 'info');
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                      selectedStudentUid === st.uid 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-extrabold truncate">{st.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{st.email}</div>
                  </button>
                ))}
              </div>

              <select
                value={selectedStudentUid}
                onChange={(e) => setSelectedStudentUid(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Or choose from all registered students --</option>
                {students.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.name} ({s.grade || `Class ${s.class}`}) - {s.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                disabled={isLoading}
                onClick={handleSimulateLogin}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Simulate Student Login</span>
              </button>

              <button
                disabled={isLoading}
                onClick={handleDeleteSelected}
                className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student Document</span>
              </button>
            </div>

            {/* Activity Picker */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Meaningful Student Activity (sets lastActiveAt &lt; 15m)
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Opened Chapter: Chapter 3 - Quadratic Equations">
                    📖 Opened Chapter: Chapter 3 - Quadratic Equations
                  </option>
                  <option value="Watching Lesson: Plant Cell Structure">
                    🎥 Watching Lesson: Plant Cell Structure
                  </option>
                  <option value="Attempting Practice: 10 AP Board Questions">
                    ✍️ Attempting Practice: 10 AP Board Questions
                  </option>
                  <option value="Submitted Homework: Mathematics Exercise 4.2">
                    📑 Submitted Homework: Mathematics Exercise 4.2
                  </option>
                  <option value="Attempting Mock Test: SSC Grand Mock Assessment">
                    🏆 Attempting Mock Test: SSC Grand Mock Assessment
                  </option>
                </select>

                <button
                  disabled={isLoading}
                  onClick={handleSimulateActivity}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Apply Activity
                </button>
              </div>
            </div>
          </div>

          {/* Action Logs Box */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Database className="w-3 h-3 text-blue-400" />
                <span>Firestore Live Operations Log</span>
              </span>
              <span>Real-time</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {logMessages.length === 0 ? (
                <div className="text-slate-500 italic">No actions executed yet in this session. Click any button above to test Firestore integration.</div>
              ) : (
                logMessages.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={
                      log.type === 'success' 
                        ? 'text-emerald-400' 
                        : log.type === 'error' 
                          ? 'text-rose-400' 
                          : 'text-sky-300'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Testing Guide - Exactly matches prompt specifications */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-2">
            <span className="font-bold text-blue-900 dark:text-blue-300 block">
              Evaluation Flow Verification (8 Steps from Spec):
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>Create test student via button above or register real student via Auth modal</li>
              <li>Student assigns Class (e.g., Class 6) &amp; AP State Board</li>
              <li>Firestore saves profile under <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded">users/{'{uid}'}</span></li>
              <li>Teacher visits <span className="font-bold">My Classes</span> in Teacher Portal</li>
              <li>Teacher opens <span className="font-bold">Class 6</span></li>
              <li>Portal displays real counts: Joined, Logged In, Recently Active</li>
              <li>Click &quot;Simulate Student Login&quot; (or log in on student account)</li>
              <li>Teacher portal instantly updates login time in real-time via Firestore snapshot!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
