import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  X, 
  Music, 
  Volume2, 
  VolumeX, 
  Bot, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Flame, 
  EyeOff,
  Bell
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: (minsCompleted: number, xpEarned: number) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [sessionMins, setSessionMins] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'library' | 'binaural'>('rain');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<string>('Solving Mathematics Quadratic Discriminant Worksheet');
  const [aiTip, setAiTip] = useState<string>('Stay focused! Research shows 25-minute sprints boost retention by 40%.');

  useEffect(() => {
    let timer: any;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      soundFx.playSuccess();
      onSessionComplete(sessionMins, sessionMins * 10);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    soundFx.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundFx.playPop();
    setIsRunning(false);
    setSecondsLeft(sessionMins * 60);
  };

  const handleSelectPreset = (mins: number) => {
    soundFx.playClick();
    setSessionMins(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/30">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight">VidyaAI Deep Focus Mode</h2>
            <p className="text-xs text-indigo-300 font-bold">Zero-Distraction Pomodoro Studio</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Ambient Sound Selector */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs font-bold">
            <Music className="w-4 h-4 text-sky-400" />
            <select 
              value={ambientSound} 
              onChange={(e) => setAmbientSound(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="none" className="bg-slate-900">Silent Focus</option>
              <option value="rain" className="bg-slate-900">Monsoon Rain Ambience</option>
              <option value="library" className="bg-slate-900">Quiet Study Library</option>
              <option value="binaural" className="bg-slate-900">432Hz Alpha Waves</option>
            </select>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-white transition cursor-pointer"
            title="Exit Focus Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Clock Circle Display */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
        {/* Active Task Tag */}
        <div className="px-5 py-2 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs font-bold flex items-center gap-2 max-w-lg">
          <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="truncate">{currentTask}</span>
        </div>

        {/* Big Timer */}
        <div className="relative flex items-center justify-center">
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-indigo-900/60 flex items-center justify-center shadow-2xl bg-gradient-to-b from-slate-900 to-indigo-950 relative">
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white">
              {formatTime(secondsLeft)}
            </div>
            {isRunning && (
              <span className="absolute bottom-12 text-xs font-bold text-emerald-400 animate-pulse flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-emerald-400" /> Focus Session Active
              </span>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleStartPause}
            className={`px-8 py-4 rounded-3xl font-black text-sm transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 cursor-pointer ${
              isRunning ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-4 rounded-3xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center space-x-2">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                sessionMins === m 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m} Mins
            </button>
          ))}
        </div>
      </div>

      {/* Bottom AI Tutor Coach Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur flex items-center justify-between text-xs max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <span className="font-extrabold text-sky-400">Vidya AI Focus Coach: </span>
            <span className="text-slate-300">{aiTip}</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Session Reward: +{sessionMins * 10} XP
        </span>
      </div>

    </div>
  );
};
