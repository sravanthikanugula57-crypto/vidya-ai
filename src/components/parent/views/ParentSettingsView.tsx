import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { SUPPORTED_LANGUAGES } from '../../../data/languages';
import { soundFx } from '../../../lib/audio';
import {
  Settings,
  Globe,
  Bell,
  Volume2,
  Moon,
  CheckCircle2,
  Save,
  Smartphone
} from 'lucide-react';

interface ParentSettingsViewProps {
  selectedLang: LanguageCode;
}

export const ParentSettingsView: React.FC<ParentSettingsViewProps> = ({ selectedLang }) => {
  const [lang, setLang] = useState<LanguageCode>(selectedLang);
  const [smsAttendance, setSmsAttendance] = useState(true);
  const [smsHomework, setSmsHomework] = useState(true);
  const [smsExam, setSmsExam] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('0.95');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            Portal Settings & Preferences
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Parent Portal Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure language options, voice report playback, and automated SMS alerts
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Parent preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-purple-600" />
            Preferred Portal & Audio Language
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {SUPPORTED_LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setLang(item.code);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  lang === item.code
                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="text-lg">{item.flag}</span>
                <div>
                  <div className="font-extrabold">{item.nativeName}</div>
                  <div className="text-[10px] opacity-80">{item.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SMS & WhatsApp Notification Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Automated Parent SMS & WhatsApp Alerts
          </h3>

          <div className="space-y-3 text-xs">
            <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">Daily Gate Attendance SMS</div>
                <div className="text-slate-500 text-[11px]">Instant SMS when child checks in or out of school</div>
              </div>
              <input
                type="checkbox"
                checked={smsAttendance}
                onChange={(e) => setSmsAttendance(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">Homework & Assignment Alerts</div>
                <div className="text-slate-500 text-[11px]">Receive notification when teacher assigns new homework</div>
              </div>
              <input
                type="checkbox"
                checked={smsHomework}
                onChange={(e) => setSmsHomework(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">Exam Timetable & Result Alerts</div>
                <div className="text-slate-500 text-[11px]">Reminders for upcoming FA/SA exams & scorecard releases</div>
              </div>
              <input
                type="checkbox"
                checked={smsExam}
                onChange={(e) => setSmsExam(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">WhatsApp Progress Digest</div>
                <div className="text-slate-500 text-[11px]">Weekly audio summary sent directly to WhatsApp</div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Audio / Voice Report Speed Setting */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Volume2 className="w-5 h-5 text-purple-600" />
            Voice Synthesis & Audio Report Speed
          </h3>

          <div className="space-y-2 text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Audio Reading Speed Rate
            </label>
            <select
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(e.target.value)}
              className="w-full sm:w-64 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="0.8">Slow (0.8x) - Clear & Gentle</option>
              <option value="0.95">Normal Vernacular (0.95x)</option>
              <option value="1.1">Fast (1.1x)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
