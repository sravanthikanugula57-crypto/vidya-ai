import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  Lightbulb,
  Heart,
  HelpCircle,
  MessageSquare,
  BookOpen
} from 'lucide-react';

interface AISuggestionsViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

const PRESET_QUESTIONS = [
  "How can I help Ananya practice math equations at home?",
  "What simple activities can we do for science experiments using home items?",
  "How can I build my child's reading confidence in English?",
  "How can I encourage my child to prepare for upcoming FA-2 board exams?"
];

export const AISuggestionsView: React.FC<AISuggestionsViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>({
    advice: `Namaste! For ${selectedChildName} (Class 9), the key to mastering Mathematics and Science is daily 15-minute conceptual revision at home. Praise her effort whenever she solves a problem step-by-step!`,
    dailyActivities: [
      `15-Min Evening Review: Ask ${selectedChildName} to explain one main topic she learned today in school in her own vernacular words.`,
      `Practical Application: Use household items (like arranging utensils or coins) to demonstrate quadratic sequences or ratios.`,
      `Positive Praise: Praise her consistency and daily effort rather than test marks to build long-term confidence.`
    ],
    encouragementNote: `${selectedChildName}, your daily hard work and curiosity are bringing great pride to our family and ZPHS Medak school! Keep shining!`,
    suggestedTeacherQuestion: `Teacher Ramesh garu, how can we support ${selectedChildName}'s math revision at home during weekends?`
  });

  const handleAskAI = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    soundFx.playClick();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/parent-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: selectedChildName,
          grade: 'Class 9',
          subject: 'Mathematics',
          parentQuery: q,
          language: selectedLang
        })
      });
      const data = await res.json();
      if (data && data.advice) {
        setAiResponse(data);
        soundFx.playSuccess();
      }
    } catch (e) {
      console.error('Parent AI query failed:', e);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2 border border-yellow-400/30">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI Parent Socratic Advisor
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            AI Parent Suggestions for {selectedChildName}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Personalized, zero-cost home learning activities & vernacular guidance
          </p>
        </div>
      </div>

      {/* Ask AI Parent Assistant Query Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          Ask AI Parent Assistant for Specific Guidance
        </h3>

        {/* Preset Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRESET_QUESTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAskAI(preset)}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap transition"
            >
              💡 {preset}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. How can I help my child prepare for science exams without buying extra books?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            className="flex-1 p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => handleAskAI()}
            disabled={isLoading}
            className="px-5 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Thinking...' : 'Ask AI'}</span>
          </button>
        </div>
      </div>

      {/* AI Advice Output Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              AI Home Action Plan & Guidance
            </h3>
            <p className="text-xs text-slate-500">
              Tailored for {selectedChildName} • Class 9 SCERT Curriculum
            </p>
          </div>
        </div>

        {/* Primary Advice */}
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {aiResponse.advice}
        </div>

        {/* 3 Daily Home Activities */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Recommended 15-Minute Home Activities:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiResponse.dailyActivities?.map((activity: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                  #{idx + 1}
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {activity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement Note for Child */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-center gap-3">
          <Heart className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-extrabold uppercase text-[10px] text-emerald-700 dark:text-emerald-300 block">
              Words of Encouragement for {selectedChildName}:
            </span>
            <span>"{aiResponse.encouragementNote}"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
