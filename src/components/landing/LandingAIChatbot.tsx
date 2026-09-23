import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  User,
  Zap,
  HelpCircle,
  BookOpen,
  ChevronRight,
  MessageSquare,
  Flame,
  Award,
  RefreshCw,
  CornerDownLeft
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { LanguageCode } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  topic?: string;
  socraticSteps?: string[];
}

interface LandingAIChatbotProps {
  selectedLang: LanguageCode;
  onSelectRole?: (role: any) => void;
}

export const LandingAIChatbot: React.FC<LandingAIChatbotProps> = ({ selectedLang, onSelectRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: selectedLang === 'te'
        ? 'నమస్కారం! నేను మీ విద్యా AI ట్యూటర్ (Vidya AI Tutor). పదో తరగతి పరీక్షల్లో 10/10 GPA సాధించటానికి మరియు మీ అనుమానాలను నివృత్తి చేయడానికి నేను సిద్ధంగా ఉన్నాను! నన్ను ఏ ప్రశ్న అయినా అడగండి.'
        : 'Namaste! I am your 24/7 AI Tutor. I am powered by Socratic learning algorithms tailored for Class 10 AP & Telangana State Boards. Ask me any formula, concept, or exam doubt!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socraticSteps: [
        'Ask about Math, Physical Science, or Biology formulas.',
        'Get step-by-step Socratic guidance in English & Telugu.',
        'Explore Chapter Roadmaps & Previous Year Questions.'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const starterPrompts = [
    {
      labelEn: "Explain Pythagoras Theorem with real-life example",
      labelTe: "పైథాగరస్ సిద్ధాంతం వివరించు",
      query: "Explain Pythagoras Theorem with a simple real-life ladder or shadow example."
    },
    {
      labelEn: "What are Ohm's Law formulas & units?",
      labelTe: "ఓమ్ నియమం సూత్రాలు మరియు ప్రమాణాలు",
      query: "List Ohm's Law formula V = IR, resistance unit, and exam tip for Class 10 Physical Science."
    },
    {
      labelEn: "How does AI Tutor help me get 10/10 GPA?",
      labelTe: "AI ట్యూటర్ నాకు ఎలా సహాయపడుతుంది?",
      query: "How does Vidya AI Tutor help Class 10 students score 10/10 GPA in Board Exams?"
    },
    {
      labelEn: "Explain Photosynthesis equation",
      labelTe: "కిరణజన్య సంయోగక్రియ సమీకరణం",
      query: "Explain Photosynthesis chemical equation in simple Telugu and English."
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    soundFx.playClick();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language: selectedLang,
          grade: 'Class 10',
          subject: 'General Science & Math'
        })
      });

      const data = await response.json();
      const botReply = data.text || "I am your AI Tutor! Let's solve this concept step by step.";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      soundFx.playSuccess();
    } catch (error) {
      // Intelligent fallback response
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: selectedLang === 'te'
          ? `అద్భుతమైన ప్రశ్న! AI ట్యూటర్ గా నేను చెప్పేది: ${query} కు సంబంధించిన వివరాలు మరియు సూత్రాలు మన డిజిటల్ లెర్నింగ్ సెంటర్ లో సిద్ధంగా ఉన్నాయి. మన సాల్వింగ్ టూల్ ద్వారా మీరు మరిన్ని వివరణలు పొందవచ్చు!`
          : `Great question! As your Vidya AI Tutor, I analyze "${query}" using Socratic guidance. Remember to check the formula sheet and step-by-step chapter roadmaps in your student portal!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Trigger Widget */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundFx.playPop();
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/40 flex items-center gap-3 border border-blue-400/30 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>

            <div className="text-left hidden sm:block pr-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-black text-xs uppercase tracking-wider text-cyan-200">24/7 AI Tutor</span>
              </div>
              <span className="font-extrabold text-sm text-white block">Ask Vidya AI Tutor</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans"
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30 shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">Vidya AI Tutor</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Socratic Tutor for Class 10 Board Exams
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-2 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-none font-semibold'
                        : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/80'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.socraticSteps && (
                      <div className="pt-2 border-t border-slate-700/60 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                          AI Tutor Socratic Features:
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {msg.socraticSteps.map((step, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleSpeech(msg.text)}
                          className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1"
                          title="Listen Voice AI Tutor"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-amber-400" /> : <Volume2 className="w-3 h-3" />}
                          <span>Voice</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 w-fit animate-pulse">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Vidya AI Tutor is analyzing your question...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Prompts */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-cyan-300 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{selectedLang === 'te' ? p.labelTe : p.labelEn}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  selectedLang === 'te'
                    ? "AI ట్యూటర్ ని ఏదైనా ప్రశ్న అడగండి..."
                    : "Ask AI Tutor any concept or formula..."
                }
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black transition cursor-pointer shrink-0 shadow-lg shadow-cyan-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
