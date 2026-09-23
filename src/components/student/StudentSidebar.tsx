import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderTree, 
  Bot, 
  Camera, 
  FileCheck2, 
  Zap, 
  Award, 
  Clock, 
  Calendar, 
  FileText, 
  Library, 
  Trophy, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Target,
  Megaphone
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { useTranslation } from '../../context/LanguageContext';

export type StudentTab = 
  | 'dashboard'
  | 'learning'
  | 'practice'
  | 'homework'
  | 'class_discussion'
  | 'tutor'
  | 'tracker'
  | 'settings'
  | 'syllabus'
  | 'subjects'
  | 'doubts'
  | 'mock_tests'
  | 'previous_papers'
  | 'library'
  | 'study_planner'
  | 'achievements'
  | 'announcements'
  | 'science_lab'
  | 'english_lab'
  | 'assignments'
  | 'calendar'
  | 'notes'
  | 'resources'
  | 'classroom'
  | 'portfolio'
  | 'community'
  | 'parent'
  | 'scholarships'
  | 'career'
  | 'progress'
  | 'messages'
  | 'help';

interface StudentSidebarProps {
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  unreadMessagesCount?: number;
  unreadAnnouncementsCount?: number;
  pendingHomeworkCount?: number;
  onLogout?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  unreadMessagesCount = 0,
  unreadAnnouncementsCount = 0,
  pendingHomeworkCount = 0,
  onLogout,
}) => {
  const { t } = useTranslation();

  const menuSections = [
    {
      title: 'LEARNING & STUDY',
      items: [
        { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4 text-blue-400" /> },
        { id: 'learning', label: 'Learn', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
        { id: 'practice', label: 'Practice', icon: <Zap className="w-4 h-4 text-purple-400" /> },
        { id: 'homework', label: 'Homework', icon: <Camera className="w-4 h-4 text-amber-400" />, badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined, badgeColor: 'bg-rose-500 text-white' },
        { id: 'class_discussion', label: 'Class Discussion', icon: <MessageSquare className="w-4 h-4 text-indigo-400" /> },
        { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4 text-sky-400" /> },
        { id: 'tracker', label: 'My Learning', icon: <TrendingUp className="w-4 h-4 text-cyan-400" /> },
        { id: 'settings', label: 'Profile', icon: <Settings className="w-4 h-4 text-slate-400" /> },
      ]
    }
  ];

  const handleSelectTab = (tab: StudentTab) => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 sticky top-0 h-screen z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
                V
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">{t('appName', 'Vidya AI')}</h1>
                <p className="text-[10px] text-sky-400 font-semibold mt-0.5">SSC State Board</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-md">
              V
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  {sec.title}
                </div>
              )}

              {sec.items.map((item: any) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id as StudentTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                        : item.highlight
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/60'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (onLogout) onLogout();
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{t('logout', 'Logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-40 px-2 py-2 flex items-center justify-around shadow-2xl">
        {[
          { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'learning', label: 'Learn', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'practice', label: 'Practice', icon: <Zap className="w-5 h-5 text-purple-400" /> },
          { id: 'class_discussion', label: 'Discussion', icon: <MessageSquare className="w-5 h-5 text-indigo-400" /> },
          { id: 'settings', label: 'Profile', icon: <Settings className="w-5 h-5 text-slate-400" /> },
        ].map((m) => {
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectTab(m.id as StudentTab)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                isActive ? 'text-blue-400 bg-blue-950/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.icon}
              <span className="mt-0.5">{m.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
