import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  Pin, 
  Paperclip, 
  FileText, 
  Video, 
  BookOpen, 
  Megaphone, 
  Sparkles, 
  MessageSquare,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  subscribeToClassGroupMessages, 
  sendClassGroupMessage, 
  togglePinClassGroupMessage, 
  ClassGroupMessageDoc 
} from '../../../services/studentFirestoreService';

const CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const TeacherGroupDiscussionView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [messages, setMessages] = useState<ClassGroupMessageDoc[]>([]);
  
  const [inputText, setInputText] = useState<string>('');
  const [msgType, setMsgType] = useState<ClassGroupMessageDoc['type']>('text');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isPosting, setIsPosting] = useState<boolean>(false);

  useEffect(() => {
    // Realtime subscription to class group chat messages
    const unsub = subscribeToClassGroupMessages(selectedClass, (data) => {
      setMessages(data);
    });
    return () => unsub();
  }, [selectedClass]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundFx.playPop();
    setIsPosting(true);

    await sendClassGroupMessage({
      classId: selectedClass,
      senderId: 'teacher_ramesh_1',
      senderName: 'Mr. Ramesh Sharma (Teacher)',
      senderRole: 'teacher',
      senderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: inputText.trim(),
      type: msgType,
      attachmentUrl: attachmentUrl.trim() || undefined,
      attachmentName: attachmentName.trim() || undefined,
      isPinned: false
    });

    setInputText('');
    setAttachmentUrl('');
    setAttachmentName('');
    setMsgType('text');
    setIsPosting(false);
    soundFx.playSuccess();
  };

  const handleTogglePin = async (msgId: string, currentPinned: boolean) => {
    soundFx.playClick();
    await togglePinClassGroupMessage(selectedClass, msgId, !currentPinned);
  };

  return (
    <div className="space-y-6 animate-in fade-in font-sans text-slate-900 dark:text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Class-Wise Discussion Rooms • Firebase Realtime Chat</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Class Group Discussion & Resource Distribution</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Exclusive class group rooms for Class 5 to 10. Post announcements, digital notes, homework, videos, worksheets, and pin important instructions.
          </p>
        </div>

        {/* Class Selection Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => { soundFx.playClick(); setSelectedClass(cls); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
        {/* Room Header */}
        <div className="border-b pb-4 border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>{selectedClass} Discussion Group</span>
            </h3>
            <p className="text-xs text-slate-400">
              Only students enrolled in {selectedClass} and assigned teachers can read & post.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
            🟢 Firebase Realtime Connected
          </span>
        </div>

        {/* Pinned Messages Bar */}
        {messages.some(m => m.isPinned) && (
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>Pinned Class Instructions</span>
            </div>
            <div className="space-y-1.5">
              {messages.filter(m => m.isPinned).map((pm) => (
                <div key={pm.id} className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>📌 <b>{pm.senderName}:</b> {pm.text}</span>
                  <button onClick={() => handleTogglePin(pm.id, true)} className="text-[10px] text-amber-700 hover:underline">Unpin</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="h-[380px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No messages in {selectedClass} group yet. Post the first lesson update or announcement!
            </div>
          ) : (
            messages.map((m) => {
              const isTeacher = m.senderRole === 'teacher';
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-xl ${
                    isTeacher
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 ml-auto'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span className={isTeacher ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}>
                      {m.senderName}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => handleTogglePin(m.id, Boolean(m.isPinned))}
                        className="hover:text-amber-500 cursor-pointer"
                        title="Pin Message"
                      >
                        <Pin className={`w-3 h-3 ${m.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">{m.text}</p>

                  {/* Optional Attachment */}
                  {m.attachmentUrl && (
                    <div className="pt-2">
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{m.attachmentName || 'View Attachment Document'}</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Post Type:</span>
            {(['text', 'notes', 'homework', 'announcement', 'video', 'pdf', 'worksheet'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMsgType(t)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                  msgType === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Post update or assignment to ${selectedClass} group...`}
              className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isPosting || !inputText.trim()}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isPosting ? 'Posting...' : 'Post to Class'}</span>
            </button>
          </div>

          {/* Optional Attachment Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Attachment Document/PDF/Video URL (Optional)..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
            />
            <input
              type="text"
              placeholder="Attachment Title e.g. Class 10 Chapter 2 Notes PDF..."
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
