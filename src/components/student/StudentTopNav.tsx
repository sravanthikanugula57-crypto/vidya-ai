import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Wifi, 
  RefreshCw, 
  Languages, 
  ChevronDown, 
  X, 
  BookOpen, 
  FileText, 
  Bot, 
  GraduationCap,
  Layers,
  Check
} from 'lucide-react';
import { StudentProfile, LanguageCode } from '../../types';
import { soundFx } from '../../lib/audio';
import { useLanguage } from '../../context/LanguageContext';

interface StudentTopNavProps {
  student: StudentProfile;
  selectedLang?: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenRoleSwitcher?: () => void;
  onOpenClassSwitcher?: () => void;
}

export const StudentTopNav: React.FC<StudentTopNavProps> = ({
  student,
  isDarkMode,
  setIsDarkMode,
  onOpenRoleSwitcher,
  onOpenClassSwitcher,
}) => {
  const { language, setSelectedLang, setLanguage, t, supportedLanguages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [lastSyncedTime] = useState('1 min ago');

  const notifications = [
    { id: 'n1', title: 'New Science Assignment Available', desc: 'Chapter 4 Refraction worksheet is available in Practice Center.', time: '10m ago', unread: true },
    { id: 'n2', title: 'Quiz Score Graded: 95%', desc: 'Your Mathematics practice test result is available.', time: '1h ago', unread: true },
    { id: 'n3', title: 'State Board Mock Exam Announcement', desc: 'SSC Board Model Test series is live.', time: '3h ago', unread: false },
  ];

  const searchCategories = [
    { label: `${t('chapter', 'Chapter')}: Quadratic Equations`, type: t('myLearning', 'Lesson'), icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" /> },
    { label: `${t('digitalLibrary', 'Digital Library')}: Formula Sheet PDF`, type: t('digitalLibrary', 'Resource'), icon: <FileText className="w-3.5 h-3.5 text-emerald-500" /> },
    { label: `${t('aiTutor', 'AI Tutor')}: "${t('askDoubt', 'Ask a Doubt')}"`, type: t('aiTutor', 'AI'), icon: <Bot className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const toggleDarkMode = () => {
    soundFx.playClick();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Global Search Input */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
              placeholder={t('searchResourcesPlaceholder', 'Search lessons, homework, notes, past papers...')}
              className="w-full pl-10 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl space-y-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">{t('recommendedForYou', 'Quick Matches')}</div>
              {searchCategories.map((res, i) => (
                <div 
                  key={i}
                  onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {res.icon}
                    <span>{res.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Utility Badges & Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Status Badges: Sync & Academic Year */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin-slow" />
              <span>{lastSyncedTime}</span>
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-blue-500" />
              <span>SSC State Board</span>
            </span>
          </div>

          {/* Active Class Grade Badge & Switcher */}
          {onOpenClassSwitcher && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenClassSwitcher();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center space-x-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer text-xs font-black shadow-sm"
              title={t('changeClass', 'Change Class')}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{student.grade || t('selectClass', 'Select Class')}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          )}

          {/* Multilingual Selector (English, Telugu, Hindi ONLY) */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowLangDropdown(!showLangDropdown);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition text-xs font-bold cursor-pointer"
              title={t('selectLanguage', 'Select Language')}
            >
              <Languages className="w-4 h-4 text-blue-500" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-52 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1">
                  {t('preferredLanguage', 'Preferred Language')}
                </div>
                {supportedLanguages.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={async () => {
                        soundFx.playClick();
                        await (setSelectedLang || setLanguage)(l.code, student?.id);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{l.flag}</span>
                        <div className="flex flex-col">
                          <span className="leading-tight">{l.nativeName}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {l.name}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowNotifications(!showNotifications);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition relative cursor-pointer"
              title={t('announcements', 'Notifications')}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{t('announcements', 'Notifications')} (3)</h4>
                  <button className="text-[10px] font-bold text-blue-600 hover:underline">{t('markComplete', 'Mark read')}</button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Profile Menu Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-7 h-7 rounded-xl object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <span className="hidden sm:inline font-extrabold text-xs text-slate-900 dark:text-white pr-1">
                {student.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 space-y-2">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">{student.name}</div>
                  <div className="text-[10px] text-slate-400">{student.schoolName}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-1">{student.grade} • SSC State Board</div>
                </div>

                {onOpenClassSwitcher && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenClassSwitcher();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{t('changeClass', 'Change Class')} ({student.grade})</span>
                  </button>
                )}

                {onOpenRoleSwitcher && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenRoleSwitcher();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{t('profile', 'Portal Roles')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
