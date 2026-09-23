import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  checkMdmDemoSeeded,
  seedMdmDemonstrationData,
  resetMdmDemonstrationActivity,
  REAL_MDM_STUDENTS
} from '../../services/mdmDemonstrationService';
import { soundFx } from '../../lib/audio';

interface MdmDemonstrationControlProps {
  className?: string;
  compact?: boolean;
  onNotice?: (msg: string) => void;
}

export const MdmDemonstrationControl: React.FC<MdmDemonstrationControlProps> = ({
  className = '',
  compact = false,
  onNotice
}) => {
  const [isSeeded, setIsSeeded] = useState<boolean>(false);
  const [seededCount, setSeededCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'info' | 'error'>('info');
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Sync current seeded status from Firestore
  const refreshStatus = async () => {
    try {
      const res = await checkMdmDemoSeeded();
      setIsSeeded(res.isSeeded);
      setSeededCount(res.seededCount);
    } catch (err) {
      console.warn('Error checking demo status:', err);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleSeed = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await seedMdmDemonstrationData();
      setStatusMessage(res.message);
      setStatusType(res.message.includes('already') ? 'info' : 'success');
      if (onNotice) onNotice(res.message);
      await refreshStatus();
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to seed demonstration data';
      setStatusMessage(errMsg);
      setStatusType('error');
      if (onNotice) onNotice(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setShowConfirmReset(false);
    setStatusMessage(null);
    try {
      const res = await resetMdmDemonstrationActivity();
      setStatusMessage(res.message);
      setStatusType('success');
      if (onNotice) onNotice(res.message);
      await refreshStatus();
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to reset demonstration activity';
      setStatusMessage(errMsg);
      setStatusType('error');
      if (onNotice) onNotice(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setShowDetailsModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
            isSeeded
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
          title="MDM Demonstration Data Controls"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSeeded ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
          <span>MDM Demo:</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
            isSeeded ? 'bg-amber-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {isSeeded ? 'Seeded' : 'Unseeded'}
          </span>
        </button>

        {/* Modal for Details and Actions */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">MDM Live Demonstration System</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real Firebase Student Accounts & AP SSC Content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                <p>
                  Demonstration activity is pre-seeded for three <strong>real Firebase student accounts</strong> in Class 10 using published curriculum resources:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 font-mono text-[11px]">
                  {REAL_MDM_STUDENTS.map(s => (
                    <div key={s.targetUid} className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="text-slate-500">{s.email}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{s.performanceTier}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs">
                  <p className="font-semibold mb-1">Pre-Seeded Real Curriculum Content:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Practice Center: Class 10 Mathematics - Real Numbers</li>
                    <li>Mock Test: AP SSC Class 10 Mathematics Board Mock Test</li>
                    <li>Homework: Class 10 Quadratic Equations & Factorization</li>
                  </ul>
                </div>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusType === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : statusType === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmReset(true)}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Activity
                </button>
                <button
                  onClick={handleSeed}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isLoading ? 'Processing...' : 'Seed MDM Demonstration Data'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog for Reset */}
        {showConfirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Reset Demonstration Activity?</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    This will delete <strong>only</strong> the demonstration records tagged with <code>activitySource: &quot;MDM_DEMONSTRATION&quot;</code> in Firestore.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Real student accounts, user profiles, published tests, and any genuine submissions will <strong>never</strong> be deleted.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  {isLoading ? 'Resetting...' : 'Yes, Reset Demo Activity'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Expanded Panel
  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">MDM Live Demonstration Controls</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isSeeded
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {isSeeded ? 'Activity Seeded' : 'Clean State'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real Firebase student accounts for Adduri Surendra, Make Praveen, and Marpina Yukthanjali
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirmReset(true)}
            disabled={isLoading || !isSeeded}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Activity
          </button>
          <button
            onClick={handleSeed}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            {isLoading ? 'Processing...' : 'Seed MDM Demonstration Data'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          statusType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : statusType === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        }`}>
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Confirmation Dialog for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Reset Demonstration Activity?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  This will delete <strong>only</strong> the demonstration records tagged with <code>activitySource: &quot;MDM_DEMONSTRATION&quot;</code> in Firestore.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real student accounts, user profiles, published tests, and any genuine submissions will <strong>never</strong> be deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                {isLoading ? 'Resetting...' : 'Yes, Reset Demo Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility export
export const DemoStudentToggle = MdmDemonstrationControl;
