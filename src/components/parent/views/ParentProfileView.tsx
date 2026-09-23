import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  Users
} from 'lucide-react';

interface ParentProfileViewProps {
  selectedLang: LanguageCode;
}

export const ParentProfileView: React.FC<ParentProfileViewProps> = ({ selectedLang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [parentName, setParentName] = useState('Savitri Devi Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [occupation, setOccupation] = useState('Anganwadi Educator & Homemaker');
  const [village, setVillage] = useState('Vijayawada Mandal, Andhra Pradesh');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" />
            Verified Parent Profile Card
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {parentName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered Guardian for Ananya Sharma (Class 9) & Kumar Sharma (Class 6)
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsEditing(!isEditing);
          }}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile Details'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Parent profile updated successfully!</span>
        </div>
      )}

      {/* Parent Information Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-5 h-5 text-purple-600" />
          Guardian Personal Information
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parent / Guardian Full Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Registered Phone Number (SMS Alerts)
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Occupation
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Village / Mandal Address
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-75"
            />
          </div>

          {isEditing && (
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Save Profile Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Linked Children Profiles */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Users className="w-5 h-5 text-purple-600" />
          Linked Children Profiles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-base border-2 border-purple-500">
                A
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Ananya Sharma</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">Class 9 (Section A) • Roll #24</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>School: ZPHS Government High School, Vijayawada</div>
              <div>Medium: English Medium (AP SSC Board)</div>
              <div>Student ID: std_101</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80"
                alt="Kumar"
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Kumar Sharma</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">Class 6 (Section B) • Roll #18</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>School: ZPHS Government Primary School, Medak</div>
              <div>Medium: Telugu & English Medium</div>
              <div>Student ID: std_204</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
