import React from 'react';
import { BRAND_IDENTITY } from './tokens';
import { 
  Sparkles, 
  Heart, 
  Zap, 
  ShieldCheck, 
  Globe2, 
  Bot, 
  Smile, 
  Volume2, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2,
  Image,
  Sun,
  Palette
} from 'lucide-react';

export const BrandOverview: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Hero Mission Statement */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-yellow-300 text-xs font-black uppercase tracking-widest border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design System Mission & Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            One Unified Visual Language for 2.4 Million Government School Students
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The VidyaAI Design System is an enterprise-grade UI architecture built for low-bandwidth rural environments, multi-lingual voice navigation (Telugu, English, Hindi), and accessibility across budget Android phones and school computers.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-2xl font-black text-yellow-400">100%</div>
              <div className="text-[11px] text-slate-400">WCAG AAA Accessible</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">&lt;50 KB</div>
              <div className="text-[11px] text-slate-400">Optimized Bundle</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sky-400">7 Languages</div>
              <div className="text-[11px] text-slate-400">Multilingual Voice UI</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-400">Offline-First</div>
              <div className="text-[11px] text-slate-400">PWA & 2G Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Voice & Personality */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Brand Voice & Personality</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">Human-Centered Socratic Learning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRAND_IDENTITY.voice.map((v, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all space-y-2"
            >
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{v.trait}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Character Guidelines */}
      <div className="p-7 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                Official AI Tutor Character
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {BRAND_IDENTITY.aiCharacter.name}
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold self-start">
            Socratic Method Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <span className="font-bold text-slate-500 text-[10px] uppercase">Personality Trait</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{BRAND_IDENTITY.aiCharacter.personality}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <span className="font-bold text-slate-500 text-[10px] uppercase">Visual Emblem</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{BRAND_IDENTITY.aiCharacter.avatarStyle}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <span className="font-bold text-slate-500 text-[10px] uppercase">Audio Feedback</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{BRAND_IDENTITY.aiCharacter.soundFeedback}</p>
          </div>
        </div>
      </div>

      {/* Asset Styles: Iconography, Photography & Illustrations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Unified Icon Language</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All icons MUST be imported directly from <code>lucide-react</code>. Stroke width standard is 2px for clear optical density on low-resolution LCD screens.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Image className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Authentic Photography</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Depict real Indian government school classrooms (ZPHS/GHS), students in uniforms with notebooks, and teachers using digital whiteboards with high contrast.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Anti-Slop Clean Aesthetic</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            No excessive dark mode glowing neon effects or generic SaaS buzzwords. Clean off-white canvas with 7% max brightness delta and crisp optical alignment.
          </p>
        </div>
      </div>

    </div>
  );
};
