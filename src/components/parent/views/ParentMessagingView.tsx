import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  MessageSquare,
  Send,
  User,
  Mic,
  Volume2,
  CheckCheck,
  Globe,
  Sparkles,
  PhoneCall,
  Search,
  Plus
} from 'lucide-react';

interface ParentMessagingViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

interface Message {
  id: string;
  sender: 'parent' | 'teacher';
  senderName: string;
  text: string;
  textTelugu?: string;
  timestamp: string;
  isVoice?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'teacher',
    senderName: 'Teacher Ramesh Sharma (Headmaster)',
    text: 'Namaste Savitri Devi garu! Ananya scored 18/20 in today\'s math quiz on quadratic equations. She is doing very well!',
    textTelugu: 'నమస్తే సావిత్రి దేవి గారూ! అనన్య నేటి గణితం క్విజ్‌లో 18/20 మార్కులు సాధించింది. తను చాలా బాగా చదువుతోంది!',
    timestamp: 'Yesterday, 4:30 PM',
  },
  {
    id: 'm2',
    sender: 'parent',
    senderName: 'Savitri Devi (Parent)',
    text: 'Namaste Teacher! Thank you so much. We are making sure she practices 20 minutes of math at home every evening.',
    textTelugu: 'నమస్తే టీచర్! చాలా ధన్యవాదాలు. రోజు సాయంత్రం ఇంట్లో 20 నిమిషాలు ప్రాక్టీస్ చేయిస్తున్నాం.',
    timestamp: 'Yesterday, 5:15 PM',
  },
  {
    id: 'm3',
    sender: 'teacher',
    senderName: 'Teacher Ramesh Sharma (Headmaster)',
    text: 'Wonderful! Also, please remember that the PTA meeting is this Saturday at 10:00 AM in the school hall.',
    textTelugu: 'చాలా సంతోషం! అలాగే శనివారం ఉదయం 10 గంటలకు స్కూల్లో జరిగే PTA సమావేశానికి తప్పక రండి.',
    timestamp: 'Today, 9:10 AM',
  }
];

const QUICK_CHIPS = [
  "Thank you teacher! 🙏",
  "Ananya will practice math tonight.",
  "Please grant leave for tomorrow.",
  "Will attend the PTA meeting on Saturday.",
  "What is the syllabus for FA-2 exam?"
];

export const ParentMessagingView: React.FC<ParentMessagingViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [showTeluguScript, setShowTeluguScript] = useState(selectedLang === 'te');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;
    soundFx.playClick();

    const newMsg: Message = {
      id: 'm_' + Date.now(),
      sender: 'parent',
      senderName: 'Savitri Devi (Parent)',
      text: text,
      textTelugu: text,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    soundFx.playSuccess();

    // Auto teacher reply simulation after 1 border delay
    setTimeout(() => {
      const autoReply: Message = {
        id: 'm_reply_' + Date.now(),
        sender: 'teacher',
        senderName: 'Teacher Ramesh Sharma (Headmaster)',
        text: `Received your note regarding ${selectedChildName}! Thank you for your support at home.`,
        textTelugu: `${selectedChildName} గురించిన మీ సమాచారం అందింది! ధన్యవాదాలు.`,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1500);
  };

  const handleVoiceRecordClick = () => {
    soundFx.playClick();
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      handleSendMessage('🎤 [Voice Message Recorded in Telugu/English - 12 Seconds]');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Direct Teacher Communication
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Messages for {selectedChildName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ZPHS Medak • Headmaster Ramesh Sharma & Subject Teachers
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowTeluguScript(!showTeluguScript);
          }}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
        >
          <Globe className="w-4 h-4 text-purple-600" />
          <span>{showTeluguScript ? 'Showing Telugu Script' : 'Translate to Vernacular'}</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Chat Top Contact Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt="Teacher Ramesh"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                Teacher Ramesh Sharma (Headmaster & Math Master)
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Online • ZPHS High School Medak Staff
              </div>
            </div>
          </div>

          <a
            href="tel:08452223344"
            className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition text-xs font-bold flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden sm:inline">School Helpline</span>
          </a>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => {
            const isParent = msg.sender === 'parent';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isParent
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p className="font-medium">
                    {showTeluguScript && msg.textTelugu ? msg.textTelugu : msg.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap px-1">
            Quick Replies:
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceRecordClick}
            className={`p-3 rounded-2xl font-bold transition flex items-center gap-1.5 text-xs ${
              isRecordingVoice
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Record Vernacular Voice Message"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{isRecordingVoice ? 'Recording...' : 'Voice Msg'}</span>
          </button>

          <input
            type="text"
            placeholder="Type message in English or Telugu script..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={() => handleSendMessage()}
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
