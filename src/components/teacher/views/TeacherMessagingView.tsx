import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  PhoneCall, 
  CheckCheck, 
  Search,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { subscribeToRealStudents, RealStudentProfile } from '../../../services/studentFirestoreService';

interface Conversation {
  id: string;
  name: string;
  role: 'Student' | 'Parent';
  phone: string;
  unreadCount: number;
  lastMsg: string;
  lastTime: string;
}

export const TeacherMessagingView: React.FC = () => {
  const [realStudents, setRealStudents] = useState<RealStudentProfile[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([
    { id: 'm1', sender: 'other', text: 'Namaste Sir, I am studying my lessons on the portal.', time: '10:20 AM' },
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const unsub = subscribeToRealStudents((students) => {
      setRealStudents(students);
      if (students.length > 0 && !activeConv) {
        const first = students[0];
        setActiveConv({
          id: first.id,
          name: `${first.name} (${first.grade})`,
          role: 'Student',
          phone: first.phone || 'N/A',
          unreadCount: 0,
          lastMsg: first.currentActivity || 'Active on student portal',
          lastTime: first.lastActiveTime || 'Just now'
        });
      }
    });
    return () => unsub();
  }, []);

  const conversations: Conversation[] = realStudents.map((s) => ({
    id: s.id,
    name: `${s.name} (${s.grade})`,
    role: 'Student',
    phone: s.phone || 'N/A',
    unreadCount: 0,
    lastMsg: s.currentActivity || 'Active on portal',
    lastTime: s.lastActiveTime || 'Recently'
  }));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundFx.playPop();
    const newMsg = { id: `msg_${Date.now()}`, sender: 'me', text: inputText, time: 'Just now' };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Direct Community Channel</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Direct Teacher - Parent & Student Chat</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Communicate 1-on-1 with parents and students, send homework reminders, and share learning updates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {/* Conversations List */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 overflow-y-auto">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white px-2">Messages</h3>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveConv(conv);
                }}
                className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeConv?.id === conv.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">{conv.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{conv.lastMsg}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block">{conv.lastTime}</span>
                  {conv.unreadCount > 0 && (
                    <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          {activeConv ? (
            <>
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{activeConv.name}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold">{activeConv.role} • {activeConv.phone}</span>
                </div>
                <button
                  onClick={() => alert(`Dialing ${activeConv.phone}`)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>

          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-2xl text-xs font-medium space-y-1 ${
                    m.sender === 'me'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-70 block text-right">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-bold">No student selected or registered yet.</p>
              <p className="text-[11px] text-slate-400 text-center">When real students register on the app, you can select them from the list to message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
