import React from 'react';
import { Volume2, Wifi, Type, Eye, Check } from 'lucide-react';

interface AccessibilityBarProps {
  lowBandwidth: boolean;
  setLowBandwidth: (val: boolean) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  screenReaderActive: boolean;
  setScreenReaderActive: (val: boolean) => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  lowBandwidth,
  setLowBandwidth,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  screenReaderActive,
  setScreenReaderActive,
}) => {
  return (
    <div className={`px-4 py-1.5 text-xs border-b transition-colors ${
      highContrast 
        ? 'bg-black text-yellow-300 border-yellow-400 font-bold' 
        : 'bg-slate-900 text-slate-200 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sky-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Govt School Inclusive Mode:
          </span>
          <span className="hidden sm:inline text-slate-400">Low-bandwidth, Voice & High Readability Active</span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Low Bandwidth Mode Toggle */}
          <button
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              lowBandwidth ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Saves 80% mobile internet data by caching local diagrams and audio"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Data Saver: {lowBandwidth ? 'ON (2G Friendly)' : 'OFF'}</span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 mr-1">Text:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 rounded text-[11px] font-medium ${fontSize === 'normal' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              100%
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 rounded text-[11px] font-medium ${fontSize === 'large' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              125%
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-1.5 rounded text-[11px] font-medium ${fontSize === 'xlarge' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              150%
            </button>
          </div>

          {/* High Contrast Mode */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              highContrast ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">High Contrast</span>
          </button>

          {/* Screen Reader Voice Narration Helper */}
          <button
            onClick={() => setScreenReaderActive(!screenReaderActive)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
              screenReaderActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Reads out screen content in clear native voice"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Assistant</span>
            {screenReaderActive && <Check className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
