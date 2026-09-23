import React from 'react';
import { X, History, ArrowLeft, CheckCircle2, RotateCcw, GitCommit, Calendar, User } from 'lucide-react';
import { CMSItem, CMSVersionRecord } from './cmsData';
import { soundFx } from '../../lib/audio';

interface VersionHistoryModalProps {
  item: CMSItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRevertVersion: (version: CMSVersionRecord) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  item,
  isOpen,
  onClose,
  onRevertVersion
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <History className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>Version History Audit Log</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Current: {item.version}
                </span>
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

        {/* Timeline Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="relative border-l-2 border-purple-200 dark:border-purple-900/60 ml-4 pl-6 space-y-6">
            {item.versionHistory.map((ver, idx) => {
              const isCurrent = ver.version === item.version;
              return (
                <div key={idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-purple-600 border-white text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-700 text-purple-600'
                  }`}>
                    {isCurrent ? '✓' : idx + 1}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg">
                          {ver.version}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                            Active Live Version
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {ver.updatedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {ver.author}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Summary: {ver.summary}
                    </p>

                    {/* Diff changes */}
                    {ver.changesDiff && ver.changesDiff.length > 0 && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Detailed Code / Content Changes (Diff)
                        </span>
                        <ul className="space-y-1">
                          {ver.changesDiff.map((diff, dIdx) => (
                            <li key={dIdx} className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">+</span>
                              <span>{diff}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Revert Action Button */}
                    {!isCurrent && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            soundFx.playSuccess();
                            onRevertVersion(ver);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 text-purple-700 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revert Content to {ver.version}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Close Version History
          </button>
        </div>
      </div>
    </div>
  );
};
