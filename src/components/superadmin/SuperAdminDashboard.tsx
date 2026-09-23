import React, { useState } from 'react';
import { UserAuthProfile } from '../../types';
import { soundFx } from '../../lib/audio';

// Mock Datasets
import {
  INITIAL_SUPERADMIN_SCHOOLS,
  INITIAL_SUPERADMIN_DISTRICTS,
  INITIAL_SUPERADMIN_USERS,
  INITIAL_SUPERADMIN_ROLES,
  INITIAL_SUPERADMIN_PERMISSIONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CMS_CONTENT,
  INITIAL_AI_MODELS,
  INITIAL_FLAGGED_CONTENT,
  INITIAL_SUPERADMIN_AUDIT_LOGS,
  INITIAL_PLATFORM_SERVICES,
  INITIAL_SYSTEM_SETTINGS,
  SuperAdminSchool,
  SuperAdminDistrict,
  SuperAdminUser,
  SuperAdminRole,
  SuperAdminPermission,
  SupportTicket,
  CMSContentItem,
  AIModelConfig,
  FlaggedContentItem,
  SuperAdminAuditLog,
  PlatformHealthService,
  SystemSettingsData
} from './data/superAdminMockData';

// View Modules
import { SchoolsView } from './views/SchoolsView';
import { DistrictsView } from './views/DistrictsView';
import { UsersView } from './views/UsersView';
import { RolesView } from './views/RolesView';
import { PermissionsView } from './views/PermissionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { PlatformHealthView } from './views/PlatformHealthView';
import { SupportTicketsView } from './views/SupportTicketsView';
import { CMSView } from './views/CMSView';
import { AIModelsView } from './views/AIModelsView';
import { ContentModerationView } from './views/ContentModerationView';
import { AuditLogsView } from './views/AuditLogsView';
import { SecurityDashboardView } from './views/SecurityDashboardView';
import { SystemSettingsView } from './views/SystemSettingsView';

// Icons
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
  Activity,
  LifeBuoy,
  FileText,
  Brain,
  Terminal,
  Settings,
  Lock,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Crown
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentUser?: UserAuthProfile | null;
}

export type SuperAdminModule =
  | 'schools'
  | 'districts'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'analytics'
  | 'platform_health'
  | 'support'
  | 'cms'
  | 'ai_models'
  | 'moderation'
  | 'audit'
  | 'security'
  | 'settings';

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser }) => {
  const [activeModule, setActiveModule] = useState<SuperAdminModule>('schools');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // States
  const [schools, setSchools] = useState<SuperAdminSchool[]>(INITIAL_SUPERADMIN_SCHOOLS);
  const [districts, setDistricts] = useState<SuperAdminDistrict[]>(INITIAL_SUPERADMIN_DISTRICTS);
  const [users, setUsers] = useState<SuperAdminUser[]>(INITIAL_SUPERADMIN_USERS);
  const [roles, setRoles] = useState<SuperAdminRole[]>(INITIAL_SUPERADMIN_ROLES);
  const [permissions, setPermissions] = useState<SuperAdminPermission[]>(INITIAL_SUPERADMIN_PERMISSIONS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [cmsItems, setCmsItems] = useState<CMSContentItem[]>(INITIAL_CMS_CONTENT);
  const [aiModels, setAiModels] = useState<AIModelConfig[]>(INITIAL_AI_MODELS);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedContentItem[]>(INITIAL_FLAGGED_CONTENT);
  const [auditLogs] = useState<SuperAdminAuditLog[]>(INITIAL_SUPERADMIN_AUDIT_LOGS);
  const [services] = useState<PlatformHealthService[]>(INITIAL_PLATFORM_SERVICES);
  const [settings, setSettings] = useState<SystemSettingsData>(INITIAL_SYSTEM_SETTINGS);

  const adminName = currentUser?.name || 'Sravanthi Kanugula';
  const adminEmail = currentUser?.email || 'sravanthikanugula57@gmail.com';

  const navItems: { id: SuperAdminModule; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'schools', label: 'Schools', icon: <Building2 className="w-4 h-4" />, badge: `${schools.length}` },
    { id: 'districts', label: 'Districts', icon: <MapPin className="w-4 h-4" />, badge: `${districts.length}` },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, badge: `${users.length}` },
    { id: 'roles', label: 'Roles', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'platform_health', label: 'Platform Health', icon: <Activity className="w-4 h-4" /> },
    { id: 'support', label: 'Support Tickets', icon: <LifeBuoy className="w-4 h-4" />, badge: `${tickets.filter(t=>t.status==='Open').length}` },
    { id: 'cms', label: 'CMS', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai_models', label: 'AI Models', icon: <Brain className="w-4 h-4" /> },
    { id: 'moderation', label: 'Content Moderation', icon: <ShieldAlert className="w-4 h-4" />, badge: `${flaggedItems.length}` },
    { id: 'audit', label: 'Audit Logs', icon: <Terminal className="w-4 h-4" /> },
    { id: 'security', label: 'Security Dashboard', icon: <Lock className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 p-4 space-y-5 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white shadow-lg space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-200 fill-yellow-300" />
            <span className="font-black text-sm tracking-tight">SUPER ADMIN PORTAL</span>
          </div>
          <p className="text-[10px] text-amber-100/90 font-medium">
            State Government Multi-School Governance
          </p>
        </div>

        {/* Navigation List */}
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
                className={`w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between gap-2 text-left ${
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

        {/* Profile Card */}
        <div className="pt-4 border-t border-slate-800 mt-auto text-xs space-y-1">
          <div className="font-extrabold text-white truncate">{adminName}</div>
          <div className="text-[10px] text-slate-400 truncate">{adminEmail}</div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800/40">
            👑 State Super Administrator
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="font-black text-sm">Super Admin Portal</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-black text-base text-white">Super Admin Modules</span>
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

      {/* View Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
        {activeModule === 'schools' && (
          <SchoolsView schools={schools} setSchools={setSchools} />
        )}

        {activeModule === 'districts' && (
          <DistrictsView districts={districts} setDistricts={setDistricts} />
        )}

        {activeModule === 'users' && (
          <UsersView users={users} setUsers={setUsers} />
        )}

        {activeModule === 'roles' && (
          <RolesView roles={roles} setRoles={setRoles} />
        )}

        {activeModule === 'permissions' && (
          <PermissionsView permissions={permissions} setPermissions={setPermissions} />
        )}

        {activeModule === 'analytics' && (
          <AnalyticsView />
        )}

        {activeModule === 'platform_health' && (
          <PlatformHealthView services={services} />
        )}

        {activeModule === 'support' && (
          <SupportTicketsView tickets={tickets} setTickets={setTickets} />
        )}

        {activeModule === 'cms' && (
          <CMSView cmsItems={cmsItems} setCmsItems={setCmsItems} />
        )}

        {activeModule === 'ai_models' && (
          <AIModelsView models={aiModels} setModels={setAiModels} />
        )}

        {activeModule === 'moderation' && (
          <ContentModerationView flaggedItems={flaggedItems} setFlaggedItems={setFlaggedItems} />
        )}

        {activeModule === 'audit' && (
          <AuditLogsView auditLogs={auditLogs} />
        )}

        {activeModule === 'security' && (
          <SecurityDashboardView />
        )}

        {activeModule === 'settings' && (
          <SystemSettingsView settings={settings} setSettings={setSettings} />
        )}
      </main>
    </div>
  );
};
