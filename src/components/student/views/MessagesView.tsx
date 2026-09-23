import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  CheckCircle2, 
  Clock, 
  Database,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';

interface Contact {
  id: string;
  name: string;
  role: 'Teacher' | 'Parent' | 'School Admin';
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export const MessagesView: React.FC = () => {
  const contacts: Contact[] = [
    {
      id: 'c1',
      name: 'Smt. Lakshmi Devi (Head Math Teacher)',
      role: 'Teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      lastMessage: 'Great job on completing the discriminant worksheet! Keep practicing.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'c2',
      name: 'Sri. Rajesh Kumar (Physics Lead)',
      role: 'Teacher',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      lastMessage: 'Remember to bring your geometry box for optics lab tomorrow.',
      time: '2h ago',
      unread: false
    },
    {
      id: 'c3',
      name: 'ZPHS Medak School Administration',
      role: 'School Admin',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      lastMessage: 'Scholarship verification forms are available at office desk.',
      time: '1d ago',
      unread: false
    }
  ];

  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    c1: [
      { id: 'm1', sender: 'them', text: 'Namaste Ananya! I reviewed your Chapter 5 Quadratic Discriminant homework.', time: '10:15 AM' },
      { id: 'm2', sender: 'me', text: 'Thank you maam! I used Vidya AI Teacher to clarify Question 4.', time: '10:18 AM' },
      { id: 'm3', sender: 'them', text: 'Great job on completing the discriminant worksheet! Keep practicing.', time: '10:20 AM' },
    ]
  });

  const [inputMsg, setInputMsg] = useState('');

  const currentChat = messages[activeContact.id] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    soundFx.playSuccess();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: inputMsg,
      time: 'Just now'
    };

    setMessages({
      ...messages,
      [activeContact.id]: [...currentChat, newMsg]
    });
    setInputMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>School Communication Network</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Teacher & Parent Messages</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Secure, moderated communication hub for doubts, assignment feedback, and school notices.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-lg font-black text-yellow-300">1 Unread</div>
          <div className="text-[10px] text-sky-100 uppercase font-bold">Teacher Message</div>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
        {/* Contact List */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="font-extrabold text-xs uppercase tracking-wider text-slate-400 px-2">Contacts</div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveContact(contact);
                }}
                className={`p-3 rounded-2xl cursor-pointer transition flex items-center space-x-3 ${
                  activeContact.id === contact.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
                }`}
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs truncate">{contact.name}</h4>
                    <span className="text-[9px] opacity-75">{contact.time}</span>
                  </div>
                  <p className="text-[10px] opacity-80 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Chat Conversation Area */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          {/* Chat Header */}
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{activeContact.name}</h3>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{activeContact.role}</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 p-2 scrollbar-thin">
            {currentChat.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    m.sender === 'me'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div className="text-[9px] text-right opacity-70">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Type a message to ${activeContact.name}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Messaging Queue: Firestore /school_chats/std_101</span>
        </span>
        <span>End-to-end encrypted school channel</span>
      </div>
    </div>
  );
};
