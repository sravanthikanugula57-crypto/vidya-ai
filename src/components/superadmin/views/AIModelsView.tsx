import React, { useState } from 'react';
import { AIModelConfig } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Brain,
  Sliders,
  ShieldCheck,
  Zap,
  Gauge,
  Sparkles,
  Lock,
  Save,
  Check
} from 'lucide-react';

interface AIModelsViewProps {
  models: AIModelConfig[];
  setModels: React.Dispatch<React.SetStateAction<AIModelConfig[]>>;
}

export const AIModelsView: React.FC<AIModelsViewProps> = ({ models, setModels }) => {
  const [savedModelId, setSavedModelId] = useState<string | null>(null);

  const handleUpdateTemperature = (modelId: string, newTemp: number) => {
    soundFx.playClick();
    setModels(prev =>
      prev.map(m => (m.id === modelId ? { ...m, temperature: newTemp } : m))
    );
  };

  const handleUpdateSafety = (modelId: string, safety: AIModelConfig['safetyLevel']) => {
    soundFx.playClick();
    setModels(prev =>
      prev.map(m => (m.id === modelId ? { ...m, safetyLevel: safety } : m))
    );
  };

  const handleSaveConfig = (modelId: string) => {
    soundFx.playSuccess();
    setSavedModelId(modelId);
    setTimeout(() => setSavedModelId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-amber-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Google Gemini AI Model Governance & Parameters
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure Gemini 2.0 Flash, Gemini 1.5 Pro & Vernacular Speech Fine-Tuning across State Schools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {models.map(model => (
          <div
            key={model.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 hover:border-amber-500/40 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {model.provider}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    ID: {model.modelCode}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {model.modelAlias}
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 self-start sm:self-auto">
                ● STATUS: {model.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {model.primaryRole}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Temperature Control */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Temperature (Creativity)</span>
                  <span className="text-amber-600">{model.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={model.temperature}
                  onChange={(e) => handleUpdateTemperature(model.id, parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Lower = Factual & Deterministic tutoring</p>
              </div>

              {/* Safety Level */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <span className="font-bold block">Government Safety Guardrails</span>
                <select
                  value={model.safetyLevel}
                  onChange={(e) => handleUpdateSafety(model.id, e.target.value as AIModelConfig['safetyLevel'])}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none"
                >
                  <option value="Strict">Strict (Block Harmful & Leaks)</option>
                  <option value="Standard">Standard Guardrails</option>
                  <option value="Custom">Custom High Threshold</option>
                </select>
                <p className="text-[10px] text-slate-400">Enforces SCERT textbook factual boundaries</p>
              </div>

              {/* Stats */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Average Latency</p>
                <p className="font-black text-emerald-600 text-lg">{model.avgLatencyMs} ms</p>
                <p className="text-[10px] text-slate-400">Max Tokens: {model.maxOutputTokens}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Daily API Volume: <strong>{model.currentDailyRequests.toLocaleString()}</strong> / {model.dailyRequestsLimit.toLocaleString()}
              </span>

              <button
                onClick={() => handleSaveConfig(model.id)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                {savedModelId === model.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedModelId === model.id ? 'Saved!' : 'Save Model Policy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
