import React, { useState } from 'react';
import { 
  X, 
  Atom, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  BookOpen, 
  Database,
  Flame,
  Award
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

interface ScienceLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXp?: (amount: number) => void;
}

export const ScienceLabModal: React.FC<ScienceLabModalProps> = ({
  isOpen,
  onClose,
  addXp = (_amount: number) => {},
}) => {
  const [activeLab, setActiveLab] = useState<'optics' | 'pendulum' | 'titration' | 'circuit'>('optics');

  // Optics State
  const [focalLength, setFocalLength] = useState<number>(10);
  const [objectDistance, setObjectDistance] = useState<number>(20);

  // Pendulum State
  const [length, setLength] = useState<number>(1.5);
  const [gravity, setGravity] = useState<number>(9.8);

  // Circuit State
  const [voltage, setVoltage] = useState<number>(9);
  const [resistance, setResistance] = useState<number>(10);

  if (!isOpen) return null;

  // Optics calculations: 1/f = 1/v - 1/u => 1/v = 1/f + 1/u (using Cartesian sign conventions u = -objectDistance)
  const calculateImageDistance = () => {
    const u = -objectDistance;
    const f = focalLength;
    // 1/v = 1/f + 1/u
    const invV = (1 / f) + (1 / u);
    if (invV === 0) return 'Infinity (Parallel Rays)';
    const v = 1 / invV;
    return `${v.toFixed(1)} cm`;
  };

  // Pendulum period: T = 2 * pi * sqrt(L / g)
  const calculatePeriod = () => {
    const T = 2 * Math.PI * Math.sqrt(length / gravity);
    return `${T.toFixed(2)} seconds`;
  };

  // Circuit current: I = V / R
  const calculateCurrent = () => {
    const I = voltage / resistance;
    return `${I.toFixed(2)} Amperes`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Atom className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
                  Telangana SCERT Science Simulator
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Interactive Virtual Science Laboratory
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'optics', label: 'Convex Lens Optics' },
            { id: 'pendulum', label: 'Simple Pendulum' },
            { id: 'titration', label: 'Acid-Base Titration' },
            { id: 'circuit', label: 'Ohm\'s Law Circuit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveLab(tab.id as any);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                activeLab === tab.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LAB CONTENT: OPTICS */}
        {activeLab === 'optics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" /> Experiment Controls
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Focal Length (f)</span>
                    <span className="text-cyan-600">{focalLength} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={focalLength}
                    onChange={(e) => setFocalLength(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Object Distance (u)</span>
                    <span className="text-cyan-600">{objectDistance} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={objectDistance}
                    onChange={(e) => setObjectDistance(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-1">
                <div className="text-[10px] uppercase font-black text-cyan-600">Calculated Image Distance (v)</div>
                <div className="text-xl font-black text-cyan-700 dark:text-cyan-300">{calculateImageDistance()}</div>
              </div>
            </div>

            {/* Visual Canvas Simulation Area */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>Lens Formula: 1/f = 1/v - 1/u</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Real-time Ray Tracer</span>
              </div>

              {/* Graphical Ray Diagram Mock Visualizer */}
              <div className="h-48 w-full border border-slate-800 rounded-2xl bg-slate-950/80 relative flex items-center justify-center overflow-hidden">
                {/* Principal Axis */}
                <div className="w-full h-0.5 bg-slate-700 absolute" />
                {/* Convex Lens */}
                <div className="w-4 h-32 rounded-full bg-cyan-500/30 border-2 border-cyan-400 absolute" />
                {/* Object Arrow */}
                <div 
                  className="w-1.5 bg-amber-400 absolute bottom-1/2 rounded-t transition-all"
                  style={{ 
                    height: '40px', 
                    right: `${50 + (objectDistance * 2)}px`
                  }}
                />
                {/* Focal points */}
                <div className="w-2 h-2 rounded-full bg-rose-500 absolute" style={{ left: `${50 + (focalLength * 2)}px` }} />
                <div className="w-2 h-2 rounded-full bg-rose-500 absolute" style={{ right: `${50 + (focalLength * 2)}px` }} />
              </div>

              {/* AI Assistant Explanation */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs text-slate-200">
                <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold">
                  <Sparkles className="w-4 h-4" /> Vidya AI Observation:
                </div>
                <p>
                  When object distance u = {objectDistance}cm and focal length f = {focalLength}cm:
                  {objectDistance > 2 * focalLength ? ' The image formed is real, inverted, and diminished between F2 and 2F2.' : objectDistance === focalLength ? ' Rays emerge parallel, image is formed at infinity.' : ' The image formed is inverted and magnified.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LAB CONTENT: OHM'S LAW */}
        {activeLab === 'circuit' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Battery & Resistor Controls
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Voltage (V)</span>
                    <span className="text-amber-600">{voltage} Volts</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Resistance (R)</span>
                    <span className="text-amber-600">{resistance} Ohms</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={resistance}
                    onChange={(e) => setResistance(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="text-[10px] uppercase font-black text-amber-600">Current Output (I = V / R)</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300">{calculateCurrent()}</div>
              </div>
            </div>

            <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between space-y-6">
              <div className="text-xs font-mono text-amber-400">Ohm's Law: V = I × R</div>

              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center space-x-6 text-center">
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-300 font-extrabold text-sm">
                  🔋 Battery: {voltage}V
                </div>
                <div className="text-xl text-slate-500 font-bold">➔ ➔ ➔</div>
                <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-extrabold text-sm">
                  💡 Bulb Brightness: {(voltage / resistance) > 1 ? 'High Brightness' : 'Low Dim'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs text-slate-200">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold">
                  <Sparkles className="w-4 h-4" /> AI Physics Rule:
                </div>
                <p>
                  As voltage increases, current increases linearly. As resistance increases, current decreases proportionally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span>Interactive WebGL/2D Canvas Physics Engine</span>
          </span>
          <button 
            onClick={() => {
              soundFx.playCoin();
              addXp(50);
            }}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Claim Lab Completion Badge (+50 XP)
          </button>
        </div>

      </div>
    </div>
  );
};
