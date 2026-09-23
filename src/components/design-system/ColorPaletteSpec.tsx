import React, { useState } from 'react';
import { COLOR_TOKENS } from './tokens';
import { Palette, Check, Copy, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { soundFx } from '../../lib/audio';

export const ColorPaletteSpec: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const gradients = [
    { name: 'Primary Hero Brand', class: 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600', code: 'from-blue-600 via-sky-500 to-indigo-600' },
    { name: 'Teacher Success', class: 'bg-gradient-to-r from-emerald-600 to-teal-500', code: 'from-emerald-600 to-teal-500' },
    { name: 'Parent Portal Audio', class: 'bg-gradient-to-r from-purple-600 to-pink-600', code: 'from-purple-600 to-pink-600' },
    { name: 'Admin DEO Executive', class: 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600', code: 'from-amber-600 to-orange-600' },
    { name: 'Dark Theme Surface', class: 'bg-gradient-to-b from-slate-900 to-slate-950', code: 'from-slate-900 to-slate-950' },
    { name: 'Glass Overlay Tint', class: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800', code: 'backdrop-blur-xl bg-white/80' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            <span>Design System Token Palette & Contrast Rules</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any color hex or token variable to copy directly to your clipboard.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>WCAG 2.1 AA & AAA Verified</span>
        </div>
      </div>

      {/* Grid of Token Swatches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLOR_TOKENS.map((token, idx) => (
          <div 
            key={idx}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-500 transition-all group"
          >
            {/* Color Swatch Visual Box */}
            <div 
              className="h-28 w-full p-4 flex flex-col justify-between relative transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: token.hex }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-md uppercase tracking-wider">
                  {token.wcagOnWhite}
                </span>

                <button
                  onClick={() => copyToClipboard(token.hex)}
                  className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white transition shadow-md cursor-pointer"
                  title="Copy Hex Code"
                >
                  {copiedHex === token.hex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-white font-mono text-xs font-black drop-shadow-md">
                {token.hex}
              </div>
            </div>

            {/* Token Meta Information */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {token.name}
                </h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {token.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => copyToClipboard(token.variable)}
                  className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <code>{token.variable}</code>
                </button>
                <span className="text-slate-400 font-medium">Dark: {token.darkHex || token.hex}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Official Enterprise Gradient Token Library */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Enterprise Token Gradient Library</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradients.map((g, i) => (
            <div 
              key={i}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className={`h-16 w-full rounded-2xl ${g.class} shadow-inner flex items-center justify-center text-white font-black text-xs drop-shadow`} />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{g.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-[10px] text-slate-500 font-mono truncate">{g.code}</code>
                  <button
                    onClick={() => copyToClipboard(g.code)}
                    className="p-1 text-slate-400 hover:text-blue-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
