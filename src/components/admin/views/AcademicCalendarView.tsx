import React, { useState } from 'react';
import { CalendarEventItem } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Award,
  Flag,
  Users
} from 'lucide-react';

interface AcademicCalendarViewProps {
  events: CalendarEventItem[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEventItem[]>>;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  events,
  setEvents,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Exam' | 'Holiday' | 'Sports' | 'Meeting' | 'Inspection'>('Exam');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [applicableGrades, setApplicableGrades] = useState('Class 6 to 10');
  const [description, setDescription] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    soundFx.playSuccess();

    const created: CalendarEventItem = {
      id: `EV-${100 + events.length + 1}`,
      title,
      type,
      startDate,
      endDate,
      description,
      applicableGrades,
      status: 'Upcoming',
    };

    setEvents([...events, created]);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Academic Term Schedule & Government Holidays
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            SCERT Andhra Pradesh (AP SSC) Academic Calendar 2026 - 2027
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formative (FA) & Summative (SA) Examinations, Inspection Dates, and Government Gazetted Holidays
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative hover:border-emerald-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                ev.type === 'Exam'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : ev.type === 'Holiday'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {ev.type}
              </span>

              <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                {ev.startDate} {ev.startDate !== ev.endDate ? `to ${ev.endDate}` : ''}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {ev.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {ev.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Grades: {ev.applicableGrades}
              </span>
              <span className="font-bold text-emerald-600">
                ● {ev.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Calendar Event
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FA-2 Examinations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Exam">Exam</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grades
                  </label>
                  <input
                    type="text"
                    value={applicableGrades}
                    onChange={(e) => setApplicableGrades(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
