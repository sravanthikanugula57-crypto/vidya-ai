import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { DEFAULT_PARENT_CHILDREN, ParentChildProfile } from '../../../data/parentChildData';
import { soundFx } from '../../../lib/audio';
import {
  Volume2,
  Clock,
  CheckCircle,
  Award,
  BrainCircuit,
  HeartHandshake,
  Calendar,
  BookOpen,
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
  ChevronRight,
  BellRing
} from 'lucide-react';

interface ParentOverviewViewProps {
  selectedLang: LanguageCode;
  onNavigateTab: (tab: string) => void;
  selectedChild: ParentChildProfile;
  setSelectedChild: (child: ParentChildProfile) => void;
}

export const ParentOverviewView: React.FC<ParentOverviewViewProps> = ({
  selectedLang,
  onNavigateTab,
  selectedChild,
  setSelectedChild,
}) => {
  const [isPlayingVoiceReport, setIsPlayingVoiceReport] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  const handlePlayVoiceReport = () => {
    soundFx.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Namaste Savitri Devi! Here is your child ${selectedChild.name}'s weekly study summary from ${selectedChild.school}: Studied ${selectedChild.weeklyMinutes} minutes on VidyaAI this week with ${selectedChild.attendancePercent} percent attendance. Strong in ${selectedChild.strongSubject}. Focus area is ${selectedChild.focusArea}. Teacher note: ${selectedChild.teacherNote}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      if (selectedLang === 'hi') utterance.lang = 'hi-IN';
      else if (selectedLang === 'te') utterance.lang = 'te-IN';
      else utterance.lang = 'en-IN';

      utterance.onend = () => setIsPlayingVoiceReport(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoiceReport(true);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    soundFx.playSuccess();
    setReplySent(true);
    setTimeout(() => {
      setReplyText('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Child Selector */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parent Portal • Government School Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Namaste, Savitri Devi 👋</h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1">
              Active Parent Dashboard for Andhra Pradesh State Board (AP SSC) Education
            </p>
          </div>

          {/* Voice Summary Audio Player */}
          <button
            onClick={handlePlayVoiceReport}
            className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 self-start md:self-auto"
          >
            <Volume2 className={`w-5 h-5 text-slate-950 ${isPlayingVoiceReport ? 'animate-bounce' : ''}`} />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-800">
                {isPlayingVoiceReport ? 'Playing Voice Report...' : 'Listen Voice Report'}
              </div>
              <div className="font-extrabold text-xs">
                {selectedLang === 'te' ? 'తెలుగు వాయిస్ రిపోర్ట్' : selectedLang === 'hi' ? 'हिंदी वॉयस रिपोर्ट' : 'English / Vernacular Audio'}
              </div>
            </div>
          </button>
        </div>

        {/* Linked Children Toggle Cards */}
        <div className="mt-6 pt-6 border-t border-purple-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEFAULT_PARENT_CHILDREN.map((child) => {
            const isSelected = selectedChild.id === child.id;
            return (
              <button
                key={child.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedChild(child);
                  setReplySent(false);
                }}
                className={`p-3.5 rounded-2xl transition text-left flex items-center gap-3 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-yellow-400'
                    : 'bg-purple-800/50 hover:bg-purple-800/80 text-white'
                }`}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400 shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm truncate">{child.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-purple-100 text-purple-800' : 'bg-purple-900/60 text-purple-200'
                    }`}>
                      {child.grade} ({child.section})
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-600' : 'text-purple-200'}`}>
                    Roll #{child.rollNo} • {child.school}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Metric Cards for Selected Child */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Weekly AI Time
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Target 200m
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {selectedChild.weeklyMinutes} Mins
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +25% study time vs last week
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              School Attendance
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Present
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {selectedChild.attendancePercent}%
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Present 24 of 25 working days
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              District Rank
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Medak DEO
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            Rank #{selectedChild.districtRank}
          </div>
          <p className="text-[11px] text-purple-600 font-bold">
            Top 5% in Medak Govt Schools
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Next Exam
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              In 12 Days
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            FA-2 Exam
          </div>
          <p className="text-[11px] text-amber-600 font-bold">
            Math & Science Formative
          </p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Quick Parent Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('attendance');
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Apply for Leave</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Submit online leave note</div>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('messaging');
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Message Teacher</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Direct chat with teacher</div>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('exam_calendar');
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Exam Schedule</div>
            <div className="text-[10px] text-slate-500 mt-0.5">View syllabus & dates</div>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateTab('ai_suggestions');
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">AI Home Activity</div>
            <div className="text-[10px] text-slate-500 mt-0.5">15-min practice tips</div>
          </button>
        </div>
      </div>

      {/* Subject Insights & Headmaster Note */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Strengths & Revision Areas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              Academic Performance Focus
            </h3>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Full Breakdown <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                ⭐ Top Performing Subject
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {selectedChild.strongSubject}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {selectedChild.name} consistently scores above 85% in weekly quizzes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                🎯 Focus Revision Topic
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {selectedChild.focusArea}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Recommended 10 minutes of AI Socratic practice every evening after dinner.
              </p>
            </div>
          </div>
        </div>

        {/* Headmaster Teacher Note & Direct Reply */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-600" />
            Teacher Note from Headmaster Ramesh Sharma
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs italic text-slate-800 dark:text-slate-200 leading-relaxed">
              "{selectedChild.teacherNote}"
            </p>
            <div className="mt-2 text-[10px] font-bold text-slate-500">
              Posted: Yesterday, 4:30 PM • ZPHS High School Staff
            </div>
          </div>

          <form onSubmit={handleSendReply} className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Direct Parent Message to Class Teacher:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Thank you teacher! Ananya will practice tonight."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
            {replySent && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Message delivered to Teacher Ramesh Sharma!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* School Announcements Alert Ticker */}
      <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              School Notice Board • ZPHS Medak
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5">
              Parent-Teacher Association (PTA) Meeting scheduled for Saturday, 10:00 AM at School Auditorium.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('notifications')}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow transition"
        >
          View All Notices
        </button>
      </div>
    </div>
  );
};
