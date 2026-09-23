import React, { useState } from 'react';
import { 
  Sliders, 
  Bell, 
  Globe, 
  Shield, 
  CheckCircle2, 
  Save,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

export const TeacherSettingsView: React.FC = () => {
  const [autoSmsAbsent, setAutoSmsAbsent] = useState(true);
  const [aiLanguage, setAiLanguage] = useState('Telugu & English');
  const [gradingScale, setGradingScale] = useState('SCERT AP SSC (A1-F)');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Portal & AI Configuration</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Teacher Portal Settings</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Configure automated SMS notifications, default AI lesson languages, and state grading frameworks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Portal configuration updated successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" /> Attendance & Parent Notification Rules
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="font-extrabold text-xs text-slate-900 dark:text-white">Automated Absentee Parent SMS</div>
              <p className="text-[11px] text-slate-400">Trigger instant native language SMS when student marked absent after 9:30 AM.</p>
            </div>
            <input
              type="checkbox"
              checked={autoSmsAbsent}
              onChange={(e) => setAutoSmsAbsent(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" /> AI Assistant Language Preferences
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Default Vernacular Medium for Lesson Plans</label>
            <select
              value={aiLanguage}
              onChange={(e) => setAiLanguage(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Telugu & English">Telugu & English (Bilingual)</option>
              <option value="English">English Medium Only</option>
              <option value="Hindi & English">Hindi & English (Bilingual)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> State Academic Grading Scale
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Grading System</label>
            <select
              value={gradingScale}
              onChange={(e) => setGradingScale(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="SCERT AP SSC (A1-F)">SCERT AP SSC 8-Point Grade Scale (A1, A2, B1, B2, C1, C2, D, F)</option>
              <option value="TS SSC (A1-E)">TS SSC 10-Point GPA Scale (A1, A2, B1, B2, C1, C2, D, E)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
};
