import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ExamCalendarViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

interface ExamSchedule {
  id: string;
  examName: string;
  type: 'Formative (FA)' | 'Summative (SA)';
  subject: string;
  date: string;
  time: string;
  maxMarks: number;
  syllabusTopics: string[];
}

const EXAM_SCHEDULES: ExamSchedule[] = [
  {
    id: 'e1',
    examName: 'Formative Assessment 2 (FA-2)',
    type: 'Formative (FA)',
    subject: 'Mathematics',
    date: '2026-08-10',
    time: '10:00 AM - 11:30 AM',
    maxMarks: 20,
    syllabusTopics: ['Quadratic Equations (Factorization & Discriminant)', 'Real Numbers & Irrational Proofs', 'Polynomial Division'],
  },
  {
    id: 'e2',
    examName: 'Formative Assessment 2 (FA-2)',
    type: 'Formative (FA)',
    subject: 'Physical & Biological Science',
    date: '2026-08-11',
    time: '10:00 AM - 11:30 AM',
    maxMarks: 20,
    syllabusTopics: ['Refraction of Light at Curved Surfaces', 'Snell\'s Law', 'Cell Organelles & Functions'],
  },
  {
    id: 'e3',
    examName: 'Formative Assessment 2 (FA-2)',
    type: 'Formative (FA)',
    subject: 'English Language',
    date: '2026-08-12',
    time: '10:00 AM - 11:30 AM',
    maxMarks: 20,
    syllabusTopics: ['Formal Letter Writing', 'Reading Comprehension', 'Tenses & Prepositions'],
  },
  {
    id: 'e4',
    examName: 'Summative Assessment 1 (SA-1 Midterm)',
    type: 'Summative (SA)',
    subject: 'All State Curriculum Subjects',
    date: '2026-10-05',
    time: '09:30 AM - 12:30 PM',
    maxMarks: 80,
    syllabusTopics: ['Chapters 1 to 7 across Mathematics, Science, Social Studies, English, Telugu'],
  }
];

export const ExamCalendarView: React.FC<ExamCalendarViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({
    'Quadratic Equations (Factorization & Discriminant)': true,
    'Cell Organelles & Functions': true,
  });

  const toggleTopicCheck = (topic: string) => {
    soundFx.playCheck();
    setCheckedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Official Examination Timetable
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {selectedChildName}'s Exam Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SCERT AP SSC Board Exam Schedule • Class 10 Board Examinations & Formative Assessments
          </p>
        </div>

        {/* Exam Countdown Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow flex items-center gap-3">
          <Clock className="w-6 h-6 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-100">Next FA-2 Exam Starts In</div>
            <div className="text-lg font-black">12 Days Remaining</div>
          </div>
        </div>
      </div>

      {/* Exam Timetable Cards */}
      <div className="space-y-4">
        {EXAM_SCHEDULES.map((exam) => (
          <div
            key={exam.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  exam.type === 'Formative (FA)'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                }`}>
                  {exam.examName}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">
                  {exam.subject}
                </h3>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{exam.date}</div>
                <div className="text-xs text-slate-500 font-medium">{exam.time} • Max {exam.maxMarks} Marks</div>
              </div>
            </div>

            {/* Syllabus Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                Parent Home Revision Checklist:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exam.syllabusTopics.map((topic, idx) => {
                  const isChecked = !!checkedTopics[topic];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTopicCheck(topic)}
                      className={`p-3 rounded-2xl border text-left text-xs transition flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                        {topic}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
