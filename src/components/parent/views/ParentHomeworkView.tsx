import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Award,
  MessageSquare,
  Check,
  Send,
  Calendar
} from 'lucide-react';

interface ParentHomeworkViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  status: 'Submitted' | 'Graded' | 'Pending';
  score?: string;
  teacherComment?: string;
  parentAcknowledged: boolean;
}

const INITIAL_HOMEWORKS: HomeworkItem[] = [
  {
    id: 'hw1',
    subject: 'Mathematics',
    title: 'Algebra Worksheet #4 - Solving Quadratic Equations',
    assignedDate: '2026-07-28',
    dueDate: '2026-07-30 (Tomorrow)',
    status: 'Graded',
    score: '18 / 20 (Grade A)',
    teacherComment: 'Excellent working steps shown in factoring! Just watch the negative sign on problem #4.',
    parentAcknowledged: true,
  },
  {
    id: 'hw2',
    subject: 'Physical Science',
    title: 'Draw & Label Refraction Ray Diagrams through Glass Prism',
    assignedDate: '2026-07-27',
    dueDate: '2026-07-31',
    status: 'Submitted',
    score: 'Awaiting Grading',
    teacherComment: 'Submitted via VidyaAI Socratic Scanner. Teacher review in progress.',
    parentAcknowledged: false,
  },
  {
    id: 'hw3',
    subject: 'English Communication',
    title: 'Write a 200-word Formal Letter to District Collector on Rural Solar Power',
    assignedDate: '2026-07-26',
    dueDate: '2026-08-02',
    status: 'Pending',
    teacherComment: 'Student needs to write 1 draft in notebook tonight.',
    parentAcknowledged: false,
  },
  {
    id: 'hw4',
    subject: 'Biological Science',
    title: 'Plant Cell vs Animal Cell Comparison Chart',
    assignedDate: '2026-07-20',
    dueDate: '2026-07-23',
    status: 'Graded',
    score: '20 / 20 (100%)',
    teacherComment: 'Outstanding diagram! Clear labels for mitochondria and chloroplasts.',
    parentAcknowledged: true,
  }
];

export const ParentHomeworkView: React.FC<ParentHomeworkViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(INITIAL_HOMEWORKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  const handleAcknowledge = (id: string) => {
    soundFx.playSuccess();
    setHomeworks(prev =>
      prev.map(hw => hw.id === id ? { ...hw, parentAcknowledged: true } : hw)
    );
  };

  const filteredHomeworks = homeworks.filter(hw => {
    if (filter === 'pending') return hw.status === 'Pending' || hw.status === 'Submitted';
    if (filter === 'graded') return hw.status === 'Graded';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Homework & Assignment Tracker
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {selectedChildName}'s Homework Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily assignments, teacher remarks, and sign digital parent acknowledgments
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({homeworks.length})
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('pending');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              filter === 'pending'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Active / Pending
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('graded');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              filter === 'graded'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {filteredHomeworks.map((hw) => (
          <div
            key={hw.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {hw.subject}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    hw.status === 'Graded'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : hw.status === 'Submitted'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    ● {hw.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">
                  {hw.title}
                </h3>
              </div>

              {hw.score && (
                <div className="text-right self-start sm:self-auto">
                  <div className="text-xs text-slate-400 font-bold">Teacher Score</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">{hw.score}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Assigned: <b>{hw.assignedDate}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Due Date: <b>{hw.dueDate}</b></span>
              </div>
            </div>

            {hw.teacherComment && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  Teacher Review Comment:
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">{hw.teacherComment}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-medium">
                Digital Parent Verification
              </span>

              {hw.parentAcknowledged ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledged by Savitri Devi</span>
                </div>
              ) : (
                <button
                  onClick={() => handleAcknowledge(hw.id)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Acknowledge Homework Checked</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
