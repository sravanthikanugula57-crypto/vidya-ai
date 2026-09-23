import React, { useState } from 'react';
import { SPACING_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from './tokens';
import { Grid, Box, Layers, Calculator, Check, ArrowRight } from 'lucide-react';

export const SpacingRadiusSpec: React.FC = () => {
  // Nested Radius Calculator state
  const [outerRadius, setOuterRadius] = useState<number>(24);
  const [padding, setPadding] = useState<number>(16);

  const innerRadius = Math.max(0, outerRadius - padding);

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* 1. Spacing Scale */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Grid className="w-6 h-6 text-purple-600" />
          <span>Rhythmic Spacing Scale (4px – 128px)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Base unit is 4px. Container outer padding MUST always equal or exceed inner element gap spacing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPACING_TOKENS.map((s, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.usage}</p>
              </div>
              <div 
                className="bg-purple-600 rounded-md shrink-0 transition-all"
                style={{ width: `${Math.min(s.px * 1.5, 96)}px`, height: '24px' }}
                title={`${s.px}px (${s.rem})`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Nested Radius Calculator */}
      <div className="p-7 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 tracking-wider">
                Mathematical Design Token Formula
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Nested Border Radius Calculator
              </h3>
            </div>
          </div>

          <div className="text-xs font-mono font-extrabold px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            Inner Radius = Outer Radius ({outerRadius}px) - Padding ({padding}px) = {innerRadius}px
          </div>
        </div>

        {/* Live Controls & Interactive Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Outer Container Radius (R_outer): {outerRadius}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="48"
                step="2"
                value={outerRadius}
                onChange={(e) => setOuterRadius(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Inner Container Padding (P): {padding}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Interactive Live Render Visualizer */}
          <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-800 shadow-inner">
            <div 
              className="bg-purple-100 dark:bg-purple-900/60 border-2 border-purple-500 transition-all flex items-center justify-center text-center shadow-md"
              style={{
                borderRadius: `${outerRadius}px`,
                padding: `${padding}px`,
                width: '100%',
                maxWidth: '280px'
              }}
            >
              <div 
                className="bg-white dark:bg-slate-900 border-2 border-purple-600 w-full p-4 transition-all shadow-sm"
                style={{
                  borderRadius: `${innerRadius}px`
                }}
              >
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Perfect Nested Radius
                </div>
                <div className="text-[10px] text-purple-600 font-bold mt-1">
                  Inner R = {innerRadius}px
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Radius Tokens */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Border Radius Token Scale
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {RADIUS_TOKENS.map((r, i) => (
            <div 
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3"
            >
              <div 
                className={`w-16 h-16 bg-blue-600 mx-auto ${r.value} transition-all shadow-md`} 
              />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{r.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{r.px}px</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Elevation & Shadow System */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <span>Elevation & Shadow Depth Scale</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHADOW_TOKENS.map((sh, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 ${sh.css} dark:${sh.darkCss} space-y-2 transition-all hover:-translate-y-1`}
            >
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{sh.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{sh.usage}</p>
              <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400 block pt-2 border-t border-slate-100 dark:border-slate-800">
                {sh.css}
              </code>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
