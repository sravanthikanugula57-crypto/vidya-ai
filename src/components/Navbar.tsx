import React, { useState } from 'react';
import { UserRole, LanguageCode, UserAuthProfile } from '../types';
import { 
  Sparkles, 
  Flame, 
  Coins, 
  Globe, 
  UserCheck, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronDown, 
  GraduationCap, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  Award, 
  User, 
  CheckCircle2, 
  Layers, 
  Crown,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedLang?: LanguageCode;
  setSelectedLang?: (lang: LanguageCode) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenAuthModal: () => void;
  onNavigateHome: () => void;
  xp: number;
  coins: number;
  streakDays: number;
  currentUser?: UserAuthProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  selectedLang: _propSelectedLang,
  setSelectedLang: propSetSelectedLang,
  isDarkMode,
  setIsDarkMode,
  onOpenAuthModal,
  onNavigateHome,
  xp,
  coins,
  streakDays,
  currentUser,
  onLogout
}) => {
  const { language, setSelectedLang, setLanguage, t, supportedLanguages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const selectedLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    student: { label: t('profile', 'Student View'), icon: <GraduationCap className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    teacher: { label: t('teacherPortal', 'Teacher Portal'), icon: <BookOpen className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    parent: { label: 'Parent Portal', icon: <Users className="w-4 h-4" />, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    admin: { label: t('adminPortal', 'District Admin'), icon: <ShieldAlert className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    super_admin: { label: 'Super Admin Portal', icon: <Crown className="w-4 h-4 text-amber-500" />, color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400 font-extrabold shadow-sm' },
    guest: { label: 'Public Home / Guest', icon: <Sparkles className="w-4 h-4" />, color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    design_system: { label: 'Design System v1.0', icon: <Layers className="w-4 h-4" />, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200/80 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                VidyaAI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
                Govt School Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Free AI Tutor for Every Indian Government School Student
            </p>
          </div>
        </div>

        {/* Gamification Stats (Visible when in Student View) */}
        {currentRole === 'student' && (
          <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-500" title="Daily Learning Streak">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{streakDays} Days</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center space-x-1 text-xs font-bold text-sky-500" title="Experience Points">
              <Award className="w-4 h-4 text-sky-500" />
              <span>{xp} XP</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center space-x-1 text-xs font-bold text-yellow-500" title="Vidya Coins earned">
              <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{coins}</span>
            </div>
          </div>
        )}

        {/* Controls Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedLangObj.flag} {selectedLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 py-1.5 px-1 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                  {t('preferredLanguage', 'Preferred Language')}
                </div>
                {supportedLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        if (propSetSelectedLang) {
                          propSetSelectedLang(lang.code);
                        }
                        await (setSelectedLang || setLanguage)(lang.code, currentUser);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${
                        isSelected ? 'font-bold text-blue-600 bg-blue-50/50 dark:bg-slate-700/80' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{lang.flag}</span>
                        <div>
                          <div className="font-bold leading-tight">{lang.nativeName}</div>
                          <div className="text-[10px] opacity-75 font-normal">{lang.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${roleLabels[currentRole].color}`}
            >
              {roleLabels[currentRole].icon}
              <span className="hidden sm:inline">{roleLabels[currentRole].label}</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 py-1.5 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  Switch Portal Role
                </div>
                {(['guest', 'student', 'teacher'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                      currentRole === r ? 'font-bold text-blue-600 bg-blue-50/60 dark:bg-slate-700/90' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {roleLabels[r].icon}
                    <span>{roleLabels[r].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Auth Button or User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100 transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 py-2 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                          {currentUser.name || 'User'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {currentUser.phone || currentUser.email || 'Verified Account'}
                        </div>
                      </div>
                    </div>

                    {currentUser.schoolName && (
                      <div className="mt-2 text-[10px] text-slate-500 font-medium">
                        🏫 {currentUser.schoolName} ({currentUser.district || 'State Board'})
                      </div>
                    )}
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out (లాగ్ అవుట్)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login / Register (లాగిన్)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
