import React, { useState, useEffect } from 'react';
import { X, Award, Crown, Trophy, Users } from 'lucide-react';
import { subscribeToRealStudents, RealStudentRecord } from '../../services/studentFirestoreService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, currentUserId }) => {
  const [level, setLevel] = useState<'district' | 'state' | 'national'>('district');
  const [students, setStudents] = useState<RealStudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const unsubscribe = subscribeToRealStudents((data) => {
      const sorted = [...data].sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setStudents(sorted);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Govt School Leaderboard</h3>
              <p className="text-xs text-sky-100">Learners ranked by verified practice XP & study achievements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2 gap-2">
          <button
            onClick={() => setLevel('district')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              level === 'district' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🏫 District Rank
          </button>
          <button
            onClick={() => setLevel('state')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              level === 'state' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🏛️ State Rank (SSC Board)
          </button>
          <button
            onClick={() => setLevel('national')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              level === 'national' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🇮🇳 All-India Rank
          </button>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
              Loading verified leaderboard standings...
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Student Rankings Available Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No students have earned XP in this leaderboard tier yet. Complete quizzes and lessons to appear here!
              </p>
            </div>
          ) : (
            students.map((item, idx) => {
              const rank = idx + 1;
              const isUser = currentUserId ? item.id === currentUserId : false;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl flex items-center justify-between border transition ${
                    isUser
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 font-bold shadow'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      rank === 1 ? 'bg-yellow-400 text-slate-900' : rank === 2 ? 'bg-slate-300 text-slate-900' : rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {rank === 1 ? <Crown className="w-4 h-4 fill-slate-900" /> : `#${rank}`}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-extrabold text-sm border border-blue-200 dark:border-blue-800">
                      {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.name}
                        {isUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            You
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                          {item.grade}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">{item.schoolName || 'Government School'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Award className="w-4 h-4 text-sky-500" />
                      {item.xp || 0} XP
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
