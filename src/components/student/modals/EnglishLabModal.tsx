import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Bot, 
  Award, 
  Zap,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

interface EnglishLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXp?: (amount: number) => void;
}

interface ChatTurn {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  grammarTip?: string;
  pronunciationScore?: number;
}

export const EnglishLabModal: React.FC<EnglishLabModalProps> = ({
  isOpen,
  onClose,
  addXp = (_amount: number) => {},
}) => {
  const [activeTopic, setActiveTopic] = useState<'intro' | 'interview' | 'directions' | 'shopping'>('intro');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const [chatLog, setChatLog] = useState<ChatTurn[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello Ananya! Welcome to today\'s English Speaking Lab. Let\'s practice introducing yourself in formal English. Could you tell me your name, class, and favourite subject?'
    }
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundFx.playSuccess();
    const studentTurn: ChatTurn = {
      id: `std_${Date.now()}`,
      sender: 'student',
      text: inputText,
      grammarTip: 'Tip: Say "My name is Ananya" instead of "Myself Ananya".',
      pronunciationScore: 92
    };

    const aiResponseText = activeTopic === 'intro'
      ? 'Excellent intro! Your sentence structure is very clear. Now, can you share what career you want to pursue after Class 10?'
      : 'That was well communicated! Keep practicing tone and pacing.';

    const aiTurn: ChatTurn = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: aiResponseText
    };

    setChatLog((prev) => [...prev, studentTurn, aiTurn]);
    setInputText('');
    addXp(15);
  };

  const handleMicToggle = () => {
    soundFx.playPop();
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputText('Hello maam, my name is Ananya and my favourite subject is Physical Science.');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  AI Language Lab
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                English Speaking & Pronunciation Coach
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

        {/* Topic Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'intro', label: 'Self Introduction' },
            { id: 'interview', label: 'School Interview' },
            { id: 'directions', label: 'Asking Directions' },
            { id: 'shopping', label: 'Daily Vocabulary' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTopic(t.id as any);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                activeTopic === t.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 space-y-4 overflow-y-auto max-h-96 p-2 scrollbar-thin">
          {chatLog.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-3xl text-xs space-y-2 shadow-sm ${
                  m.sender === 'student'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold text-[10px] opacity-80">
                  <span>{m.sender === 'student' ? 'You (Voice Input)' : 'Vidya AI English Coach'}</span>
                  {m.pronunciationScore && (
                    <span className="px-2 py-0.5 rounded bg-white/20 font-black">
                      Score: {m.pronunciationScore}%
                    </span>
                  )}
                </div>
                <p className="leading-relaxed font-medium">{m.text}</p>

                {m.grammarTip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-100 border border-amber-500/30 text-[11px]">
                    <span className="font-extrabold text-amber-300">Grammar Feedback: </span>
                    {m.grammarTip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Speech Controls & Input */}
        <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-3.5 rounded-2xl font-bold transition flex items-center gap-2 cursor-pointer ${
                isRecording 
                  ? 'bg-rose-600 text-white animate-bounce' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-xs font-black hidden sm:inline">
                {isRecording ? 'Listening...' : 'Hold & Speak'}
              </span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type your response in English..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              Send
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Daily Speaking Goal: 3 / 5 Conversations Completed</span>
            <span className="text-emerald-600 font-bold">+15 XP per response</span>
          </div>
        </form>

      </div>
    </div>
  );
};
