import React, { useState } from 'react';
import { COLOR_TOKENS, TYPOGRAPHY_TOKENS, SPACING_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from './tokens';
import { Code, Copy, Check, FileJson, Terminal, Download, Sparkles } from 'lucide-react';
import { soundFx } from '../../lib/audio';

export const DevTokensExport: React.FC = () => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const fullJsonTokens = JSON.stringify({
    system: 'VidyaAI Enterprise Design System',
    version: '1.0.0',
    colors: COLOR_TOKENS,
    typography: TYPOGRAPHY_TOKENS,
    spacing: SPACING_TOKENS,
    radius: RADIUS_TOKENS,
    shadows: SHADOW_TOKENS
  }, null, 2);

  const tailwindTokensSnippet = `// tailwind.config.js - VidyaAI Token Extensions
module.exports = {
  theme: {
    extend: {
      colors: {
        vidya: {
          50: '#EFF6FF',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        emeraldGov: '#10B981',
        parentPurple: '#9333EA',
        adminAmber: '#F59E0B',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    }
  }
};`;

  const copyText = (text: string, format: string) => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  const downloadJson = () => {
    soundFx.playSuccess();
    const blob = new Blob([fullJsonTokens], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vidya-ai-design-tokens-v1.0.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-amber-600" />
            <span>Developer Design Tokens & Code Export</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export tokens directly into your React, Tailwind, or Android codebase.
          </p>
        </div>

        <button
          onClick={downloadJson}
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/25 transition flex items-center gap-2 cursor-pointer self-start"
        >
          <Download className="w-4 h-4" />
          <span>Download tokens.json</span>
        </button>
      </div>

      {/* Code Snippet Box 1: Full JSON Tokens */}
      <div className="p-6 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
            <FileJson className="w-4 h-4" />
            <span>tokens.json (Full Enterprise Design Tokens)</span>
          </div>
          <button
            onClick={() => copyText(fullJsonTokens, 'json')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'json' ? 'Copied JSON!' : 'Copy JSON'}</span>
          </button>
        </div>

        <pre className="text-[11px] font-mono leading-relaxed text-slate-300 max-h-72 overflow-y-auto scrollbar-thin">
          {fullJsonTokens}
        </pre>
      </div>

      {/* Code Snippet Box 2: Tailwind Config */}
      <div className="p-6 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400">
            <Terminal className="w-4 h-4" />
            <span>tailwind.config.js Extension</span>
          </div>
          <button
            onClick={() => copyText(tailwindTokensSnippet, 'tailwind')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedFormat === 'tailwind' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'tailwind' ? 'Copied Tailwind!' : 'Copy Config'}</span>
          </button>
        </div>

        <pre className="text-[11px] font-mono leading-relaxed text-sky-300 max-h-60 overflow-y-auto scrollbar-thin">
          {tailwindTokensSnippet}
        </pre>
      </div>

    </div>
  );
};
