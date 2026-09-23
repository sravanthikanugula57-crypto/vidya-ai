import React, { useState } from 'react';
import { LanguageCode } from '../../types';
import { DEFAULT_PARENT_CHILDREN, ParentChildProfile } from '../../data/parentChildData';
import { soundFx } from '../../lib/audio';

import { ParentOverviewView } from './views/ParentOverviewView';
import { ChildProgressView } from './views/ChildProgressView';
import { ParentAttendanceView } from './views/ParentAttendanceView';
import { ParentHomeworkView } from './views/ParentHomeworkView';
import { ParentMessagingView } from './views/ParentMessagingView';
import { ExamCalendarView } from './views/ExamCalendarView';
import { WeeklyReportsView } from './views/WeeklyReportsView';
import { AISuggestionsView } from './views/AISuggestionsView';
import { ParentNotificationsView } from './views/ParentNotificationsView';
import { ParentProfileView } from './views/ParentProfileView';
import { ParentSettingsView } from './views/ParentSettingsView';

import {
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  BookOpen,
  MessageSquare,
  Calendar,
  FileText,
  BrainCircuit,
  Bell,
  User,
  Settings,
  Sparkles
} from 'lucide-react';

interface ParentDashboardProps {
  selectedLang: LanguageCode;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ selectedLang }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedChild, setSelectedChild] = useState<ParentChildProfile>(DEFAULT_PARENT_CHILDREN[0]);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: 'Child Progress', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'messaging', label: 'Teacher Messages', icon: MessageSquare },
    { id: 'exam_calendar', label: 'Exam Calendar', icon: Calendar },
    { id: 'weekly_reports', label: 'Weekly Reports', icon: FileText },
    { id: 'ai_suggestions', label: 'AI Suggestions', icon: BrainCircuit },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Scrollable Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active View Container */}
        <div>
          {activeTab === 'overview' && (
            <ParentOverviewView
              selectedLang={selectedLang}
              onNavigateTab={(tab) => setActiveTab(tab)}
              selectedChild={selectedChild}
              setSelectedChild={(child) => setSelectedChild(child)}
            />
          )}

          {activeTab === 'progress' && (
            <ChildProgressView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
              selectedChildGrade={selectedChild.grade}
            />
          )}

          {activeTab === 'attendance' && (
            <ParentAttendanceView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'homework' && (
            <ParentHomeworkView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'messaging' && (
            <ParentMessagingView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'exam_calendar' && (
            <ExamCalendarView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'weekly_reports' && (
            <WeeklyReportsView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'ai_suggestions' && (
            <AISuggestionsView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'notifications' && (
            <ParentNotificationsView
              selectedLang={selectedLang}
              selectedChildName={selectedChild.name}
            />
          )}

          {activeTab === 'profile' && (
            <ParentProfileView
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'settings' && (
            <ParentSettingsView
              selectedLang={selectedLang}
            />
          )}
        </div>
      </div>
    </div>
  );
};
