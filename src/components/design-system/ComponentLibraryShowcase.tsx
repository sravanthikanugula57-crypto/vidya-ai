import React, { useState } from 'react';
import { 
  Box, 
  Search, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Play, 
  FileText, 
  Users, 
  BookOpen, 
  GraduationCap, 
  ShieldAlert, 
  Award, 
  ArrowRight, 
  ChevronDown, 
  Volume2, 
  RefreshCw, 
  Check, 
  X, 
  Star, 
  Filter, 
  Download, 
  Eye, 
  Lock, 
  Mail, 
  User, 
  WifiOff, 
  Bell 
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';

export const ComponentLibraryShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buttons_inputs' | 'cards_badges' | 'feedback_nav' | 'data_tables' | 'edu_widgets'>('buttons_inputs');

  // Interactive form states for demo
  const [toggleState, setToggleState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState('telugu');
  const [sliderVal, setSliderVal] = useState(75);
  const [searchValue, setSearchValue] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const triggerToast = () => {
    soundFx.playSuccess();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const triggerConfetti = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-sky-500" />
            <span>100+ Reusable Component Library</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Production-ready UI elements styled strictly with Tailwind utility tokens.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {[
            { id: 'buttons_inputs', label: 'Buttons & Forms' },
            { id: 'cards_badges', label: 'Cards & Badges' },
            { id: 'feedback_nav', label: 'Feedback & Nav' },
            { id: 'data_tables', label: 'Data & Tables' },
            { id: 'edu_widgets', label: 'Govt School UI' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB 1: BUTTONS & INPUTS ==================== */}
      {activeTab === 'buttons_inputs' && (
        <div className="space-y-10">
          
          {/* Button Variants */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Button System (Variants & Micro-Interactions)
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Primary */}
              <button 
                onClick={triggerConfetti}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Primary Action (Interactive)</span>
              </button>

              {/* Secondary */}
              <button className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition active:scale-95 flex items-center gap-2 cursor-pointer">
                <span>Secondary Button</span>
              </button>

              {/* Success Teacher */}
              <button className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4" />
                <span>Teacher Action</span>
              </button>

              {/* Parent Audio PTT */}
              <button className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition flex items-center gap-2 cursor-pointer">
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Telugu Voice PTT</span>
              </button>

              {/* Loading State */}
              <button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
                className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Click to Load</span>}
              </button>

              {/* Glass Button */}
              <button className="px-5 py-3 rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-white transition flex items-center gap-2 cursor-pointer">
                <span>Glass Floating Button</span>
              </button>
            </div>
          </div>

          {/* Input Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Form Inputs, Voice Search & Custom Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice Search Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Multilingual Search Input
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search chapters or ask in Telugu (ఉదా: కాంతి పరావర్తనం)..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button className="absolute right-3 top-3 text-blue-600 hover:scale-110 transition cursor-pointer">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floating Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class & Medium Select
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold appearance-none focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Class 9 - Telugu Medium (నవమ తరగతి)</option>
                    <option>Class 10 - English Medium</option>
                    <option>Class 8 - Hindi Medium</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Switches & Checkboxes */}
              <div className="flex items-center space-x-6">
                {/* Switch */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div 
                    onClick={() => setToggleState(!toggleState)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 relative ${toggleState ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggleState ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">2G Low Bandwidth Mode</span>
                </label>

                {/* Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxState}
                    onChange={(e) => setCheckboxState(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-speak Telugu Audio</span>
                </label>
              </div>

              {/* Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Socratic Difficulty Level</span>
                  <span className="text-blue-600">{sliderVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: CARDS & BADGES ==================== */}
      {activeTab === 'cards_badges' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Study Time</span>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">18.5 Hours</div>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span>↑ 24% higher than last week</span>
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Socratic Mastery</span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">94% Accuracy</div>
              <p className="text-xs text-slate-500 font-medium">9 out of 10 physics questions solved</p>
            </div>

            {/* Stat Card 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daily Streak</span>
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                  <Flame className="w-4 h-4 animate-bounce" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">12 Days 🔥</div>
              <p className="text-xs text-amber-600 font-bold">Earned 500 Vidya Coins!</p>
            </div>
          </div>

          {/* Badges & Tags Library */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Badge & Tag System
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200">
                GOVT VERIFIED
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                TEACHER APPROVED
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200">
                TELUGU AUDIO READY
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200">
                BLOOM'S TAXONOMY LEVEL 4
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200">
                URGENT DEO NOTICE
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 3: FEEDBACK & NAVIGATION ==================== */}
      {activeTab === 'feedback_nav' && (
        <div className="space-y-8">
          
          {/* Toast Notification Trigger Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Toast & Alert System
            </h3>

            <button
              onClick={triggerToast}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Trigger Government Notification Toast</span>
            </button>

            {/* Rendered Toast */}
            {toastVisible && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Success! Your Physics Quiz results have been synced to the DEO District Portal.</span>
                </div>
                <button onClick={() => setToastVisible(false)}><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Skeleton Loader Demo */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Skeleton Loaders (2G Slow Loading State)
            </h3>

            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Offline Banner */}
          <div className="p-4 rounded-2xl bg-amber-500 text-slate-900 font-extrabold text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Offline Mode Active • VidyaAI Socratic Lessons & Telugu Audio cached locally!</span>
            </div>
            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md">2G Optimized</span>
          </div>

        </div>
      )}

      {/* ==================== TAB 4: DATA & TABLES ==================== */}
      {activeTab === 'data_tables' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 overflow-x-auto">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Government School Leaderboard Table Component
            </h3>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">School & District</th>
                  <th className="py-3 px-4">XP Points</th>
                  <th className="py-3 px-4">Badge Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-black text-amber-500">🥇 1st</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Ananya Sharma</td>
                  <td className="py-3.5 px-4">ZPHS Medak • Telangana</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">3,450 XP</td>
                  <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Physics Champion</span></td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-400">🥈 2nd</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Vikram Rao</td>
                  <td className="py-3.5 px-4">GHS Warangal • Telangana</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">3,120 XP</td>
                  <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Math Wizard</span></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ==================== TAB 5: GOVT SCHOOL UI ==================== */}
      {activeTab === 'edu_widgets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Parent WhatsApp Audio Card */}
          <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-4">
            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Volume2 className="w-4 h-4" />
              <span>Parent Voice Alert Widget (తెలుగు ఆడియో)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic">
              "నమస్తే సావిత్రి గారు! మీ కుమార్తె అనన్య ఈ వారం సైన్స్ లో 3 గంటలు చదివింది. క్లాస్ 9 మ్యాథ్స్ లో 94% మార్కులు సాధించింది."
            </p>
            <button className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow flex items-center gap-2 cursor-pointer">
              <Play className="w-3.5 h-3.5" />
              <span>Play Audio Summary (0:45 min)</span>
            </button>
          </div>

          {/* Teacher Bloom's Paper Widget */}
          <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Teacher AI Bloom's Taxonomy Test Paper</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generate 20-mark unit test papers covering Remembering, Understanding, Applying, and Analyzing levels in 10 seconds.
            </p>
            <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow flex items-center gap-2 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Test Paper PDF</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
