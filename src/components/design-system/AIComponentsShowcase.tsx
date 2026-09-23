import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  Volume2, 
  Lightbulb, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  RotateCw, 
  Cpu, 
  Zap, 
  Layers 
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';

export const AIComponentsShowcase: React.FC = () => {
  // Demo states for interactive AI components
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const hints = [
    "Hint 1: Think about what happens when you push against a wall. Does the wall push back with equal force?",
    "Hint 2: Newton's Third Law states every action force has an equal and opposite reaction force.",
    "Hint 3: Formula is F_A_on_B = - F_B_on_A!"
  ];

  const handleNextHint = () => {
    soundFx.playClick();
    setHintIndex((prev) => (prev + 1) % hints.length);
  };

  const handleQuizSelect = (idx: number) => {
    soundFx.playClick();
    setSelectedQuizOption(idx);
    if (idx === 1) {
      soundFx.playSuccess();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
          <Bot className="w-4 h-4" />
          <span>VidyaAI Premium AI Interface System</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Socratic AI Tutor Components & Multimodal Widgets
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Designed specifically to guide students through guided enquiry rather than providing raw solutions.
        </p>
      </div>

      {/* Grid of AI Interfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Socratic Streaming AI Response Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Vidya AI Tutor (విద్యా AI)</h4>
                <p className="text-[10px] text-emerald-600 font-bold">● Streaming Socratic Guidance</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10px] font-extrabold border border-blue-200">
              PHYSICAL SCIENCE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "Great question! When a rocket launches into space, its engines blast hot exhaust gases downward. How does Newton's 3rd Law explain why the rocket accelerates upward?"
            </div>

            {/* Socratic Hint Drawer */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Socratic Hint #{hintIndex + 1}</span>
                </span>
                <button
                  onClick={handleNextHint}
                  className="text-[11px] underline hover:text-amber-600 cursor-pointer"
                >
                  Next Hint →
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                {hints[hintIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Voice Assistant Wave & PTT Synthesizer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Telugu Voice Assistant UI</h4>
                  <p className="text-[10px] text-purple-600 font-bold">Audio Synthesizer Active</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700">
                2G Audio Optimized
              </span>
            </div>

            {/* Animated Audio Frequency Waves */}
            <div className="py-6 flex items-center justify-center space-x-1.5">
              {[40, 80, 100, 60, 90, 50, 70, 95, 45, 85].map((h, idx) => (
                <div 
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-full animate-pulse"
                  style={{ height: `${h * 0.4}px`, animationDelay: `${idx * 0.1}s` }}
                />
              ))}
            </div>

            <p className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
              "ప్రశ్న అడగడానికి మైక్రోఫోన్ నొక్కండి..." (Listening in Telugu)
            </p>
          </div>

          <button className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 cursor-pointer">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>Hold to Speak in Telugu (మాట్లాడటానికి నొక్కండి)</span>
          </button>
        </div>

        {/* 3. AI Quiz Card Component */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Interactive Socratic Quiz</span>
            <span className="text-[11px] font-bold text-slate-400">Question 1 of 5</span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            If a swimmer pushes the water backwards, in which direction does the swimmer move?
          </h4>

          <div className="space-y-2">
            {[
              "Backwards due to friction",
              "Forwards due to Newton's 3rd Law (Equal & Opposite Reaction)",
              "Downwards due to gravity",
              "Remains stationary"
            ].map((opt, i) => (
              <button
                key={i}
                onClick={() => handleQuizSelect(i)}
                className={`w-full p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  selectedQuizOption === i
                    ? i === 1
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. AI Flashcard Flip Component */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-purple-600 tracking-wider">AI Interactive Flashcard</span>
            <button 
              onClick={() => setIsFlipped(!isFlipped)} 
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="h-44 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-inner relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
          >
            <span className="text-[10px] font-extrabold uppercase text-yellow-300 tracking-widest mb-2">
              {isFlipped ? 'ANSWER KEY' : 'CONCEPT QUESTION'}
            </span>

            <p className="text-sm font-extrabold leading-relaxed max-w-xs">
              {isFlipped 
                ? "Formula: F = m × a (Force = Mass × Acceleration). SI Unit is Newton (N)."
                : "What is the mathematical formula for Newton's 2nd Law of Motion and its SI unit?"}
            </p>

            <span className="text-[10px] text-slate-400 mt-3 font-medium">Click card to reveal answer</span>
          </div>
        </div>

      </div>

    </div>
  );
};
