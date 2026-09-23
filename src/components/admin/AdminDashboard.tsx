import React, { useState } from 'react';
import { UserAuthProfile } from '../../types';
import { soundFx } from '../../lib/audio';

// Mock Data Sets
import {
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_PERMISSIONS,
  INITIAL_AUDIT_LOGS,
  AdminStudent,
  AdminTeacher,
  AdminClass,
  AdminSubject,
  DayTimetable,
  SchoolReport,
  AnnouncementItem,
  CalendarEventItem,
  PermissionRole,
  SchoolSettingsData
} from './data/adminMockData';

// View Modules
import { SchoolOverviewView } from './views/SchoolOverviewView';
import { StudentManagementView } from './views/StudentManagementView';
import { TeacherManagementView } from './views/TeacherManagementView';
import { ClassManagementView } from './views/ClassManagementView';
import { SubjectManagementView } from './views/SubjectManagementView';
import { TimetableManagementView } from './views/TimetableManagementView';
import { ReportsManagementView } from './views/ReportsManagementView';
import { AnalyticsManagementView } from './views/AnalyticsManagementView';
import { SchoolSettingsView } from './views/SchoolSettingsView';
import { PermissionsManagementView } from './views/PermissionsManagementView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { AcademicCalendarView } from './views/AcademicCalendarView';
import { AuditLogsView } from './views/AuditLogsView';
import { MDMMockTestMonitoringView } from '../teacher/views/MDMMockTestMonitoringView';
import { EducationCMS } from '../cms/EducationCMS';

// Icons
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  BarChart2,
  Settings,
  ShieldCheck,
  Bell,
  Terminal,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser?: UserAuthProfile | null;
}

export type AdminModule =
  | 'overview'
  | 'education_cms'
  | 'mdm_monitoring'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'timetable'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'permissions'
  | 'announcements'
  | 'calendar'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State Collections
  const [settings, setSettings] = useState<SchoolSettingsData>(INITIAL_SCHOOL_SETTINGS);
  const [students, setStudents] = useState<AdminStudent[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<AdminTeacher[]>(INITIAL_TEACHERS);
  const [classes, setClasses] = useState<AdminClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<AdminSubject[]>(INITIAL_SUBJECTS);
  const [timetable, setTimetable] = useState<DayTimetable[]>(INITIAL_TIMETABLE);
  const [reports] = useState<SchoolReport[]>(INITIAL_REPORTS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(INITIAL_CALENDAR_EVENTS);
  const [permissions, setPermissions] = useState<PermissionRole[]>(INITIAL_PERMISSIONS);
  const [auditLogs] = useState(INITIAL_AUDIT_LOGS);

  const adminName = currentUser?.name || 'Sravanthi Kanugula';
  const adminEmail = currentUser?.email || 'sravanthikanugula57@gmail.com';

  const navItems: { id: AdminModule; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'School Dashboard', icon: <Building2 className="w-4 h-4" /> },
    { id: 'mdm_monitoring', label: 'MDM Live Mock Monitoring', icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />, badge: 'Live' },
    { id: 'education_cms', label: 'Education CMS Studio', icon: <Sparkles className="w-4 h-4 text-yellow-300" />, badge: '12 Types' },
    { id: 'students', label: 'Student Management', icon: <Users className="w-4 h-4" />, badge: `${students.length}` },
    { id: 'teachers', label: 'Teacher Roster', icon: <GraduationCap className="w-4 h-4" />, badge: `${teachers.length}` },
    { id: 'classes', label: 'Class Sections', icon: <BookOpen className="w-4 h-4" />, badge: `${classes.length}` },
    { id: 'subjects', label: 'Subjects & Board', icon: <FileText className="w-4 h-4" /> },
    { id: 'timetable', label: 'Timetable Matrix', icon: <Clock className="w-4 h-4" /> },
    { id: 'reports', label: 'DEO Reports & Cards', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Academic Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'announcements', label: 'Broadcast Bulletins', icon: <Bell className="w-4 h-4" />, badge: `${announcements.length}` },
    { id: 'calendar', label: 'Academic Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'permissions', label: 'RBAC Permissions', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'School Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit', label: 'System Audit Logs', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 p-4 space-y-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-yellow-300" />
            <span className="font-black text-sm tracking-tight">VidyaAI Admin</span>
          </div>
          <p className="text-[10px] text-amber-100/80 font-medium">
            DEO Medak Government Control
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 text-xs font-bold">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveModule(item.id);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between gap-2.5 text-left ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="pt-4 border-t border-slate-800/80 mt-auto text-xs space-y-2">
          <div className="font-extrabold text-white truncate">{adminName}</div>
          <div className="text-[10px] text-slate-400 truncate">{adminEmail}</div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
            ● District Educational Officer
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          <span className="font-black text-sm">School Administration</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-black text-base text-white">Select Portal Module</span>
            <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveModule(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left flex items-center justify-between ${
                  activeModule === item.id
                    ? 'bg-amber-600 text-white font-black'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content View Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
        {activeModule === 'overview' && (
          <SchoolOverviewView
            settings={settings}
            students={students}
            teachers={teachers}
            classes={classes}
            announcements={announcements}
            onNavigateModule={(mod) => setActiveModule(mod as AdminModule)}
          />
        )}

        {activeModule === 'education_cms' && (
          <EducationCMS userRole="admin" userName={adminName} />
        )}

        {activeModule === 'mdm_monitoring' && (
          <MDMMockTestMonitoringView />
        )}

        {activeModule === 'students' && (
          <StudentManagementView students={students} setStudents={setStudents} />
        )}

        {activeModule === 'teachers' && (
          <TeacherManagementView teachers={teachers} setTeachers={setTeachers} />
        )}

        {activeModule === 'classes' && (
          <ClassManagementView
            classes={classes}
            setClasses={setClasses}
            teachers={teachers}
          />
        )}

        {activeModule === 'subjects' && (
          <SubjectManagementView subjects={subjects} setSubjects={setSubjects} />
        )}

        {activeModule === 'timetable' && (
          <TimetableManagementView timetable={timetable} setTimetable={setTimetable} />
        )}

        {activeModule === 'reports' && (
          <ReportsManagementView reports={reports} />
        )}

        {activeModule === 'analytics' && (
          <AnalyticsManagementView />
        )}

        {activeModule === 'settings' && (
          <SchoolSettingsView settings={settings} setSettings={setSettings} />
        )}

        {activeModule === 'permissions' && (
          <PermissionsManagementView permissions={permissions} setPermissions={setPermissions} />
        )}

        {activeModule === 'announcements' && (
          <AnnouncementsView announcements={announcements} setAnnouncements={setAnnouncements} />
        )}

        {activeModule === 'calendar' && (
          <AcademicCalendarView events={calendarEvents} setEvents={setCalendarEvents} />
        )}

        {activeModule === 'audit' && (
          <AuditLogsView auditLogs={auditLogs} />
        )}
      </main>
    </div>
  );
};
