import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Type, 
  Grid, 
  Box, 
  Bot, 
  ShieldCheck, 
  Code, 
  Layers, 
  Flame,
  Globe,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { soundFx } from '../../lib/audio';

export type DesignSystemSection = 
  | 'overview' 
  | 'colors' 
  | 'typography' 
  | 'spacing_radius' 
  | 'components' 
  | 'ai_components' 
  | 'accessibility' 
  | 'dev_export';

interface DesignSystemHeaderProps {
  activeSection: DesignSystemSection;
  setActiveSection: (sec: DesignSystemSection) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const DesignSystemHeader: React.FC<DesignSystemHeaderProps> = ({
  activeSection,
  setActiveSection,
  isDarkMode,
  setIsDarkMode
}) => {
  const sections: { id: DesignSystemSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: '1. Brand & Voice', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'colors', label: '2. Color System', icon: <Palette className="w-4 h-4 text-blue-500" /> },
    { id: 'typography', label: '3. Typography', icon: <Type className="w-4 h-4 text-emerald-500" /> },
    { id: 'spacing_radius', label: '4. Spacing & Radius', icon: <Grid className="w-4 h-4 text-purple-500" /> },
    { id: 'components', label: '5. UI Controls (100+)', icon: <Box className="w-4 h-4 text-sky-500" />, badge: '100+ Components' },
    { id: 'ai_components', label: '6. AI Tutor UI', icon: <Bot className="w-4 h-4 text-indigo-500" />, badge: 'Socratic AI' },
    { id: 'accessibility', label: '7. Accessibility & WCAG', icon: <ShieldCheck className="w-4 h-4 text-rose-500" /> },
    { id: 'dev_export', label: '8. Dev Tokens & Code', icon: <Code className="w-4 h-4 text-amber-600" /> }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-widest">
                  Enterprise Design System v1.0
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Production Ready</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                VidyaAI Master Design System Studio
              </h1>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsDarkMode(!isDarkMode);
              }}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 transition flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>{isDarkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pt-5 scrollbar-none">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                soundFx.playClick();
                setActiveSection(sec.id);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
              {sec.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeSection === sec.id ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                }`}>
                  {sec.badge}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
