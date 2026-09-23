import React, { useState } from 'react';
import { SystemSettingsData } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Settings,
  Save,
  Check,
  Building2,
  Lock,
  Globe,
  Smartphone,
  Database,
  RefreshCcw,
  Sliders
} from 'lucide-react';

interface SystemSettingsViewProps {
  settings: SystemSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettingsData>>;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({ settings, setSettings }) => {
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof SystemSettingsData) => {
    soundFx.playClick();
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    soundFx.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Global Platform System Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Andhra Pradesh School Education Dept Branding, Maintenance Mode, Backup Schedules & Gateway Connections.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 shrink-0"
        >
          {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Configuration Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branding & Agency */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            Portal Identity & Agency
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Government Agency</label>
              <input
                type="text"
                value={settings.governmentAgency}
                onChange={(e) => setSettings({ ...settings, governmentAgency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold">PORTAL VERSION</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{settings.portalVersion}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold">DEFAULT SCHOOL TOKEN QUOTA</p>
                <p className="font-black text-amber-600">{settings.maxSchoolAIQuota.toLocaleString()} Queries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toggles */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Global Operational Toggles
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                <p className="text-[10px] text-slate-400">Puts public student app in read-only mode during state updates</p>
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.maintenanceMode ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Default Rural Low-Bandwidth Mode</p>
                <p className="text-[10px] text-slate-400">Forces aggressive text compression for 2G/3G tablet labs</p>
              </div>
              <button
                onClick={() => handleToggle('lowBandwidthDefault')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.lowBandwidthDefault ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.lowBandwidthDefault ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Daily Automated Database Backup</p>
                <p className="text-[10px] text-slate-400">Backs up Firestore state to multi-region cloud storage at 02:00 AM</p>
              </div>
              <button
                onClick={() => handleToggle('autoBackupDaily')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.autoBackupDaily ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoBackupDaily ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
