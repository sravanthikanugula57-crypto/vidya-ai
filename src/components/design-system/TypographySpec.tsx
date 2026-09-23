import React, { useState } from 'react';
import { TYPOGRAPHY_TOKENS } from './tokens';
import { Type, Languages, Sliders, Check, Copy } from 'lucide-react';
import { soundFx } from '../../lib/audio';

export const TypographySpec: React.FC = () => {
  const [customText, setCustomText] = useState('VidyaAI: న్యూటన్ మూడవ గమన సూత్రము (Newton\'s 3rd Law of Motion)');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const copyCode = (text: string, tokenName: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedName(tokenName);
    setTimeout(() => setCopiedName(null), 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Interactive Sandbox Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Type className="w-6 h-6 text-emerald-600" />
            <span>Typography System & Type Scale</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Built using standard mathematical ratio (1.25 Major Third scale) for maximum legibility on mobile & low-res screens.
          </p>
        </div>

        {/* Live Text Sandbox Input */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
            Live Preview Text Sandbox
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type custom text..."
            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Typography Scale List */}
      <div className="space-y-6">
        {TYPOGRAPHY_TOKENS.map((token, idx) => (
          <div 
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {token.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {token.sizePx}px ({token.size})
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                <span>Weight: {token.weight}</span>
                <span>•</span>
                <span>LH: {token.lineHeight}</span>
                <button
                  onClick={() => copyCode(token.size, token.name)}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  title="Copy Tailwind class"
                >
                  {copiedName === token.name ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Rendered Live Sample */}
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 ${token.size} ${token.weight} ${token.lineHeight} ${token.tracking}`}>
              {customText || token.sampleText}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              <strong>Usage:</strong> {token.usage}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
