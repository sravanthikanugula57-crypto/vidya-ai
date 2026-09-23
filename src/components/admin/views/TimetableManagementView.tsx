import React, { useState } from 'react';
import { DayTimetable, TimetableSlot } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  CheckCircle2,
  X,
  BookOpen,
  User,
  Building
} from 'lucide-react';

interface TimetableManagementViewProps {
  timetable: DayTimetable[];
  setTimetable: React.Dispatch<React.SetStateAction<DayTimetable[]>>;
}

export const TimetableManagementView: React.FC<TimetableManagementViewProps> = ({
  timetable,
  setTimetable,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [selectedClass, setSelectedClass] = useState('Class 9-A');
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const activeDaySchedule = timetable.find((d) => d.day === selectedDay) || timetable[0];

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    soundFx.playSuccess();

    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === selectedDay) {
          return {
            ...d,
            slots: d.slots.map((s) => (s.id === editingSlot.id ? editingSlot : s)),
          };
        }
        return d;
      })
    );
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            Master School Timetable & Period Allocation
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Daily & Weekly Schedule Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Period Scheduling for {selectedClass} • 8 Daily Periods with Lunch & Assembly Intervals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
          >
            <option value="Class 9-A">Class 9-A</option>
            <option value="Class 9-B">Class 9-B</option>
            <option value="Class 10-A">Class 10-A</option>
            <option value="Class 8-A">Class 8-A</option>
          </select>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map((day) => (
          <button
            key={day}
            onClick={() => {
              soundFx.playClick();
              setSelectedDay(day);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              selectedDay === day
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeDaySchedule?.slots.map((slot) => (
          <div
            key={slot.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative hover:border-amber-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                P{slot.periodNumber}
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {slot.timeSlot}
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {slot.subject}
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                {slot.teacher}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-medium">{slot.room}</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setEditingSlot(slot);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 font-bold text-[10px] flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                Edit Period {editingSlot.periodNumber} ({selectedDay})
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={editingSlot.subject}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subject: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Teacher
                </label>
                <input
                  type="text"
                  required
                  value={editingSlot.teacher}
                  onChange={(e) => setEditingSlot({ ...editingSlot, teacher: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlot.room}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlot.timeSlot}
                    onChange={(e) => setEditingSlot({ ...editingSlot, timeSlot: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Update Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
