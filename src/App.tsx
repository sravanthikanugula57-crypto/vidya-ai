import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { UserRole, LanguageCode, UserAuthProfile, StudentProfile } from './types';
import { AccessibilityBar } from './components/AccessibilityBar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { AnimatedCursor } from './components/common/AnimatedCursor';
import { LandingAIChatbot } from './components/landing/LandingAIChatbot';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherLoginPage } from './components/teacher/TeacherLoginPage';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { auth, signOut } from './lib/firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { 
  ensureStudentDataInitialized, 
  fetchUserProfile, 
  saveUserProfile, 
  recordStudentLogin 
} from './services/studentFirestoreService';
import { StudentClassProvider, useStudentClass } from './context/StudentClassContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ChooseClassScreen } from './components/student/ChooseClassScreen';
import { StudentTestSwitcher } from './components/StudentTestSwitcher';
import { GrandMockTestModal } from './components/student/mockTest/GrandMockTestModal';

interface StudentAppRouterProps {
  currentUser: UserAuthProfile | null;
  selectedLang: LanguageCode;
  xp: number;
  coins: number;
  addXp: (amt: number) => void;
  addCoins: (amt: number) => void;
  onLogout: () => void;
}

const StudentAppRouter: React.FC<StudentAppRouterProps> = ({
  currentUser,
  selectedLang,
  xp,
  coins,
  addXp,
  addCoins,
  onLogout
}) => {
  const { selectedClass, selectClass } = useStudentClass();
  const { language } = useLanguage();

  // If student hasn't selected their class yet, show "Choose Your Class" screen
  if (!selectedClass) {
    return (
      <ChooseClassScreen
        currentUser={currentUser}
        onSelectClass={async (chosenClass) => {
          await selectClass(chosenClass, currentUser);
        }}
        onLogout={onLogout}
      />
    );
  }

  // Student has chosen a class -> Open Dashboard for that specific class
  const studentProfile: StudentProfile = {
    id: currentUser?.id || 'guest_student',
    name: currentUser?.name || 'Student',
    schoolName: currentUser?.schoolName || 'Government High School',
    district: currentUser?.district || '',
    state: currentUser?.state || 'Andhra Pradesh',
    grade: (selectedClass as any) || (currentUser?.grade as any) || 'Class 10',
    board: currentUser?.board || 'Andhra Pradesh State Board (AP SSC)',
    medium: currentUser?.medium || 'Telugu Medium',
    avatar: currentUser?.avatar || currentUser?.photoURL || '',
    xp: currentUser?.xp ?? xp,
    coins: currentUser?.coins ?? coins,
    streakDays: currentUser?.streakDays ?? 0,
    dailyGoalMinutes: 30,
    todayMinutesStudied: 0,
    weakSubjects: [],
    strongSubjects: [],
    badges: []
  };

  return (
    <StudentDashboard
      student={studentProfile}
      currentUser={currentUser}
      selectedLang={language || selectedLang}
      xp={xp}
      coins={coins}
      addXp={addXp}
      addCoins={addCoins}
      onLogout={onLogout}
    />
  );
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<UserRole>('student');
  const [isGrandMockOpen, setIsGrandMockOpen] = useState<boolean>(false);

  // Firebase Persistent Auth Listener & Redirect Result Handling
  useEffect(() => {
    // Process Google redirect result if returning from Google Auth redirect
    getRedirectResult(auth).then(async (result) => {
      if (result && result.user) {
        const user = result.user;
        const profile = await fetchUserProfile(user.uid);
        if (profile && profile.profileCompleted) {
          setCurrentUser(profile);
          setCurrentRole(profile.role || 'student');
          localStorage.setItem('vidya_ai_current_user', JSON.stringify(profile));
        } else {
          setIsAuthModalOpen(true);
        }
      }
    }).catch((err) => {
      console.warn('Google Auth redirect result notice:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Fetch real user profile from Firestore 'users/{uid}'
        const profile = await fetchUserProfile(firebaseUser.uid);

        if (profile) {
          setCurrentUser(profile);
          setCurrentRole(profile.role || 'student');
          if (profile.preferredLanguage) {
            setSelectedLang(profile.preferredLanguage);
          } else if (profile.preferredLang) {
            setSelectedLang(profile.preferredLang);
          }
          localStorage.setItem('vidya_ai_current_user', JSON.stringify(profile));

          // If confirmed student role, ensure student progress data is initialized & update login time
          if (profile.role === 'student') {
            await recordStudentLogin(firebaseUser.uid, profile).catch(() => {});
            await ensureStudentDataInitialized(
              firebaseUser.uid,
              firebaseUser.email || 'student@vidyaai.org',
              profile.name || firebaseUser.displayName || undefined
            ).catch((err) => {
              console.warn('Non-blocking student data initialization notice:', err);
            });
          }
        } else {
          // Construct active user profile from Firebase User credentials
          const nowIso = new Date().toISOString();
          const activeProfile: UserAuthProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
            email: firebaseUser.email || '',
            role: 'student',
            board: 'AP State Board / SSC',
            class: undefined,
            grade: undefined,
            medium: 'Telugu Medium',
            schoolName: 'Government High School',
            district: 'NTR Vijayawada',
            preferredLanguage: 'te',
            isVerified: firebaseUser.emailVerified,
            profileCompleted: false,
            createdAt: nowIso,
            lastLoginAt: nowIso,
            lastActiveAt: nowIso
          };
          await saveUserProfile(activeProfile).catch(() => {});
          await recordStudentLogin(firebaseUser.uid, activeProfile).catch(() => {});
          setCurrentUser(activeProfile);
          setCurrentRole('student');
          localStorage.setItem('vidya_ai_current_user', JSON.stringify(activeProfile));
        }
      } else {
        // Check for active local user profile session (e.g. Teacher session or verified student session)
        const cachedUserStr = localStorage.getItem('vidya_ai_current_user');
        if (cachedUserStr) {
          try {
            const cachedProfile = JSON.parse(cachedUserStr);
            if (cachedProfile && cachedProfile.id && cachedProfile.role) {
              setCurrentUser(cachedProfile);
              setCurrentRole(cachedProfile.role);
              setIsLoadingAuth(false);
              return;
            }
          } catch (e) {
            console.warn('Cached profile parse error:', e);
          }
        }

        // Unauthenticated session
        setCurrentUser(null);
        setCurrentRole('guest');
        localStorage.removeItem('vidya_ai_current_user');
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Gamification state
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(0);

  // Synchronize gamification with authenticated user profile
  useEffect(() => {
    if (currentUser) {
      setXp(currentUser.xp || 0);
      setCoins(currentUser.coins || 0);
      setStreakDays(currentUser.streakDays || 0);
    } else {
      setXp(0);
      setCoins(0);
      setStreakDays(0);
    }
  }, [currentUser]);

  // Accessibility States
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [screenReaderActive, setScreenReaderActive] = useState<boolean>(false);

  // Synchronize Dark Mode & High Contrast on root elements
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    if (highContrast) {
      document.body.classList.add('bg-black', 'text-yellow-300');
    } else {
      document.body.classList.remove('bg-black', 'text-yellow-300');
    }
  }, [isDarkMode, highContrast]);

  const addXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem('vidya_ai_current_user');
    setCurrentUser(null);
    setCurrentRole('guest');
  };

  // Font size multiplier class helper
  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-base';
    if (fontSize === 'xlarge') return 'text-lg';
    return 'text-sm';
  };

  return (
    <LanguageProvider
      currentUser={currentUser}
      onUpdateUser={(updated) => setCurrentUser(updated)}
    >
      <StudentClassProvider
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      >
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
          highContrast 
            ? 'bg-black text-yellow-300 font-bold' 
            : isDarkMode 
              ? 'bg-slate-950 text-slate-100' 
              : 'bg-slate-50 text-slate-900'
        } ${getFontSizeClass()}`}>
        
        {/* Interactive Custom Glowing Animated Cursor */}
        <AnimatedCursor />

        {/* Floating 24/7 AI Tutor Chatbot */}
        <LandingAIChatbot selectedLang={selectedLang} />

        {/* Top Government Inclusive Accessibility Bar */}
        <AccessibilityBar
          lowBandwidth={lowBandwidth}
          setLowBandwidth={setLowBandwidth}
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          screenReaderActive={screenReaderActive}
          setScreenReaderActive={setScreenReaderActive}
        />

        {/* Real 3-Student Test Runner & Switcher Panel */}
        <StudentTestSwitcher
          currentRole={currentRole}
          currentUser={currentUser}
          onSwitchUser={(profile, role) => {
            setCurrentUser(profile);
            setCurrentRole(role);
          }}
          onOpenGrandMock={() => setIsGrandMockOpen(true)}
        />

        {/* Main Header Navbar */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          selectedLang={selectedLang}
          setSelectedLang={setSelectedLang}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNavigateHome={() => setCurrentRole('guest')}
          xp={xp}
          coins={coins}
          streakDays={streakDays}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Primary Role Views & Protected Routes */}
        <main className="flex-1">
          {isLoadingAuth ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading Class 10 Student Profile & Firestore Data...</p>
            </div>
          ) : (
            <>
              {currentRole === 'guest' && (
                <LandingPage
                  onSelectRole={(role) => {
                    if (!currentUser && role !== 'guest') {
                      setAuthModalInitialRole(role);
                      setIsAuthModalOpen(true);
                    } else {
                      setCurrentRole(role);
                    }
                  }}
                  selectedLang={selectedLang}
                />
              )}

              {currentRole === 'teacher' && (!currentUser || currentUser?.role !== 'teacher') ? (
                <TeacherLoginPage
                  onLoginSuccess={(teacherProfile) => {
                    setCurrentUser(teacherProfile);
                    setCurrentRole('teacher');
                  }}
                  onCancel={() => setCurrentRole('guest')}
                />
              ) : currentRole !== 'guest' && !currentUser ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                  <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-4">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-full mx-auto flex items-center justify-center">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Authentication Required
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please sign in or create an account to access the {currentRole.replace('_', ' ')} portal and your saved Firestore data.
                    </p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
                    >
                      Sign In or Create Account
                    </button>
                    <button
                      onClick={() => setCurrentRole('guest')}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold block mx-auto"
                    >
                      Return to Home Page
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {currentRole === 'student' && (
                    <StudentAppRouter
                      currentUser={currentUser}
                      selectedLang={selectedLang}
                      xp={xp}
                      coins={coins}
                      addXp={addXp}
                      addCoins={addCoins}
                      onLogout={handleLogout}
                    />
                  )}

                  {currentRole === 'teacher' && (
                    <TeacherDashboard currentUser={currentUser} selectedLang={selectedLang} onLogout={handleLogout} />
                  )}

                  {currentRole === 'parent' && (
                    <ParentDashboard selectedLang={selectedLang} />
                  )}

                  {currentRole === 'admin' && (
                    <AdminDashboard currentUser={currentUser} />
                  )}

                  {currentRole === 'super_admin' && (
                    <SuperAdminDashboard currentUser={currentUser} />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Login & Portal Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialRole={authModalInitialRole}
          onSelectRole={(role, profile) => {
            setCurrentRole(role);
            if (profile) {
              setCurrentUser(profile);
            }
            setIsAuthModalOpen(false);
          }}
          selectedLang={selectedLang}
        />

        {/* 100-Question Grand Mock Test Modal */}
        <GrandMockTestModal
          isOpen={isGrandMockOpen}
          onClose={() => setIsGrandMockOpen(false)}
          studentUid={currentUser?.id || currentUser?.uid || ''}
          studentName={currentUser?.name || 'Student'}
          studentClass={currentUser?.grade || 'Class 10'}
        />
      </div>
      </StudentClassProvider>
    </LanguageProvider>
  );
}
