import React, { useState } from 'react';
import { WhiteboardData } from '../../types';
import { X, Sparkles, Eye, Play, ArrowRight, Layers } from 'lucide-react';

interface AIWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXp: (amount: number) => void;
}

export const AIWhiteboardModal: React.FC<AIWhiteboardModalProps> = ({ isOpen, onClose, addXp }) => {
  const [topic, setTopic] = useState('Refraction of Light through Prism');
  const [loading, setLoading] = useState(false);
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardData>({
    title: 'Interactive Visualizer: Refraction through Glass Prism',
    steps: [
      {
        stepNumber: 1,
        title: 'Incident Ray Entry',
        description: 'Ray of light strikes the first refracting surface AB of the glass prism from air.',
        formula: 'Medium 1: Air (n1 = 1.0) -> Medium 2: Glass (n2 = 1.5)'
      },
      {
        stepNumber: 2,
        title: 'Bending Towards Normal',
        description: 'Moving from rarer (air) to denser (glass) medium, light bends towards the normal line.',
        formula: 'Snell\'s Law: sin(i) / sin(r) = 1.5'
      },
      {
        stepNumber: 3,
        title: 'Dispersion into Rainbow Colors (VIBGYOR)',
        description: 'Different wavelengths bend by different angles. Violet bends the most, Red bends the least.',
        formula: 'White Light -> Red, Orange, Yellow, Green, Blue, Indigo, Violet'
      }
    ]
  });

  if (!isOpen) return null;

  const handleGenerateWhiteboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject: 'Science' })
      });
      const data = await res.json();
      setWhiteboardData(data);
      addXp(20);
    } catch (e) {
      // Keep existing simulation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold">
              <Layers className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">AI Interactive Whiteboard</h3>
              <p className="text-xs text-emerald-100">Visual step-by-step science & math diagram generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Enter topic e.g. Photosynthesis, Heart Blood Flow, Pythagoras Theorem"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
          />
          <button
            onClick={handleGenerateWhiteboard}
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            {loading ? 'Drawing...' : 'Draw Diagram'}
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </button>
        </div>

        {/* Interactive Whiteboard Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{whiteboardData.title}</h3>
            <p className="text-xs text-slate-500 mt-1">Interactive step-by-step visual lesson breakdown</p>
          </div>

          {/* SVG Visual Graphic Container */}
          <div className="w-full h-64 rounded-3xl bg-slate-950 p-6 flex flex-col items-center justify-center border border-slate-800 shadow-inner relative overflow-hidden">
            <div className="absolute top-3 left-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Interactive Canvas
            </div>

            {/* Custom SVG Illustration for Light Prism */}
            <svg viewBox="0 0 500 220" className="w-full h-full max-w-md">
              {/* Glass Prism Triangle */}
              <polygon points="250,30 150,180 350,180" fill="rgba(255,255,255,0.08)" stroke="#06B6D4" strokeWidth="3" />
              
              {/* Incident Ray */}
              <line x1="50" y1="140" x2="185" y2="125" stroke="#FBBF24" strokeWidth="4" />
              <text x="70" y="130" fill="#FBBF24" fontSize="11" fontWeight="bold">Incident White Light</text>

              {/* Refracted Dispersion Rays */}
              <line x1="185" y1="125" x2="310" y2="150" stroke="#EF4444" strokeWidth="2" />
              <line x1="185" y1="125" x2="305" y2="155" stroke="#3B82F6" strokeWidth="2" />
              <line x1="185" y1="125" x2="300" y2="160" stroke="#8B5CF6" strokeWidth="2" />

              {/* Emergent VIBGYOR Rays */}
              <line x1="310" y1="150" x2="440" y2="170" stroke="#EF4444" strokeWidth="3" />
              <line x1="305" y1="155" x2="440" y2="185" stroke="#3B82F6" strokeWidth="3" />
              <line x1="300" y1="160" x2="440" y2="200" stroke="#8B5CF6" strokeWidth="3" />
              
              <text x="360" y="160" fill="#EF4444" fontSize="10" fontWeight="bold">Red (Least bent)</text>
              <text x="360" y="210" fill="#8B5CF6" fontSize="10" fontWeight="bold">Violet (Most bent)</text>
            </svg>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {whiteboardData.steps.map((step) => (
              <div key={step.stepNumber} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Step {step.stepNumber}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                {step.formula && (
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border">
                    {step.formula}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
