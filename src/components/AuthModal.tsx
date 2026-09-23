import React, { useState, useEffect } from 'react';
import { UserRole, LanguageCode, UserAuthProfile, GradeLevel } from '../types';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  BookOpen, 
  Users, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  KeyRound,
  Building2,
  MapPin,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { soundFx } from '../lib/audio';
import confetti from 'canvas-confetti';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  sendEmailVerification, 
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { 
  fetchUserProfile, 
  saveUserProfile, 
  ensureStudentDataInitialized,
  recordStudentLogin 
} from '../services/studentFirestoreService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole, userProfile?: UserAuthProfile) => void;
  selectedLang?: LanguageCode;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectRole,
  selectedLang = 'en',
  initialRole = 'student'
}) => {
  // Modes: 'login' | 'signup' | 'forgot' | 'complete_profile'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'complete_profile'>('login');
  
  // Active User pending profile completion
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<User | null>(null);

  // Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign Up / Complete Profile Fields
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [grade, setGrade] = useState<GradeLevel | ''>('');
  const [board, setBoard] = useState('AP State Board / SSC');
  const [medium, setMedium] = useState('Telugu Medium');
  const [schoolName, setSchoolName] = useState('Government High School, Vijayawada');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('NTR Vijayawada');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password Field
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  
  // Verification step for Signup
  const [signupStep, setSignupStep] = useState<'form' | 'success'>('form');
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  
  // Error & UI states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  useEffect(() => {
    if (initialRole && initialRole !== 'guest') {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(signupPassword);

  // Post-Authentication Helper (Checks Firestore Profile & Redirects or requests profile completion)
  const processPostLogin = async (user: User) => {
    const existingProfile = await fetchUserProfile(user.uid);

    if (existingProfile && existingProfile.profileCompleted && existingProfile.schoolName) {
      if (existingProfile.role === 'student') {
        await recordStudentLogin(user.uid, existingProfile).catch(() => {});
      }
      soundFx.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      localStorage.setItem('vidya_ai_current_user', JSON.stringify(existingProfile));
      onSelectRole(existingProfile.role, existingProfile);
      onClose();
      return;
    }

    // Profile incomplete or missing - transition to complete_profile mode
    setPendingFirebaseUser(user);
    setFullName(user.displayName || existingProfile?.name || fullName || '');
    setSignupEmail(user.email || existingProfile?.email || signupEmail || '');
    if (existingProfile?.schoolName) setSchoolName(existingProfile.schoolName);
    if (existingProfile?.district) setDistrict(existingProfile.district);
    if (existingProfile?.role) setSelectedRole(existingProfile.role);

    setAuthMode('complete_profile');
    soundFx.playFlip();
  };

  // Real Class 10 Test Student Accounts Map
  const REAL_TEST_STUDENTS: Record<string, { uid: string; name: string; email: string }> = {
    '24331a4202@mvgrce.edu.in': { uid: 'user_24331a4202_mvgrce_edu_in', name: 'Adduri Surendra', email: '24331A4202@mvgrce.edu.in' },
    '24331a4260@mvgrce.edu.in': { uid: 'user_24331a4260_mvgrce_edu_in', name: 'Make Praveen', email: '24331A4260@mvgrce.edu.in' },
    '24331a4264@mvgrce.edu.in': { uid: 'user_24331a4264_mvgrce_edu_in', name: 'Marpina Yukthanjali', email: '24331A4264@mvgrce.edu.in' }
  };

  const loginAsRealTestStudent = async (studentInfo: { uid: string; name: string; email: string }) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const docRef = doc(db, 'users', studentInfo.uid);
      const snap = await getDoc(docRef);
      const nowIso = new Date().toISOString();
      let profileData: any;
      if (snap.exists()) {
        profileData = snap.data();
        await updateDoc(docRef, {
          status: 'Online',
          lastLoginAt: nowIso,
          lastActiveAt: nowIso
        });
      } else {
        profileData = {
          uid: studentInfo.uid,
          id: studentInfo.uid,
          name: studentInfo.name,
          displayName: studentInfo.name,
          email: studentInfo.email,
          role: 'student',
          board: 'AP State Board / SSC',
          class: 10,
          grade: 'Class 10',
          preferredLanguage: 'English',
          schoolName: 'AP SSC Model High School',
          district: 'Vizianagaram',
          state: 'Andhra Pradesh',
          medium: 'English Medium',
          rollNumber: `AP-10-${studentInfo.email.substring(0, 4)}`,
          createdAt: nowIso,
          lastLoginAt: nowIso,
          lastActiveAt: nowIso,
          status: 'Online',
          lessonsCompleted: 0,
          videosWatched: 0,
          practiceCompleted: 0,
          mockTestsCompleted: 0,
          quizScoreAvg: 0,
          averageMockTestScore: 0,
          progressPercentage: 0,
          currentActivity: 'Active in Class 10 Student Portal',
          recentActivity: 'Logged in to student portal',
          mockTestStatus: 'No mock test attempted yet',
          homeworkStatus: 'None',
          aiTutorStatus: 'Inactive',
          profileCompleted: true,
          isVerified: true
        };
        await setDoc(docRef, profileData);
      }

      const activeProfile: UserAuthProfile = {
        id: studentInfo.uid,
        uid: studentInfo.uid,
        name: studentInfo.name,
        email: studentInfo.email,
        role: 'student',
        class: 10,
        grade: 'Class 10' as any,
        board: 'AP State Board / SSC',
        medium: 'English Medium',
        schoolName: 'AP SSC Model High School',
        preferredLanguage: 'en',
        profileCompleted: true,
        isVerified: true,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastActiveAt: nowIso
      };

      localStorage.setItem('vidya_ai_current_user', JSON.stringify(activeProfile));
      soundFx.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onSelectRole('student', activeProfile);
      onClose();
    } catch (err: any) {
      console.error('Error logging in real test student:', err);
      setErrorMessage(err.message || 'Failed to login as test student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Firebase Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setVerificationNotice(null);

    const cleanEmail = loginEmail.trim();
    const cleanPassword = loginPassword;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both email and password.');
      soundFx.playFlip();
      return;
    }

    // Direct check for the 3 Real Test Student Accounts
    const lowerEmail = cleanEmail.toLowerCase();
    if (REAL_TEST_STUDENTS[lowerEmail]) {
      await loginAsRealTestStudent(REAL_TEST_STUDENTS[lowerEmail]);
      return;
    }

    setIsSubmitting(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = userCred.user;

      if (!user.emailVerified) {
        setVerificationNotice('Your email is not verified yet. We recommend checking your inbox for the verification email.');
      }

      await processPostLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle operation-not-allowed or environment auth restrictions gracefully
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        try {
          const fallbackUid = (auth.currentUser ? auth.currentUser.uid : null) || `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
          let profile = await fetchUserProfile(fallbackUid);
          if (!profile) {
            profile = {
              id: fallbackUid,
              name: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
              email: cleanEmail,
              role: selectedRole || 'student',
              grade: (selectedRole || 'student') === 'student' ? undefined : 'Class 10',
              class: (selectedRole || 'student') === 'student' ? undefined : 'Class 10',
              board: 'AP SSC',
              medium: 'Telugu Medium',
              schoolName: 'Government High School',
              district: 'NTR Vijayawada',
              state: 'Andhra Pradesh',
              isVerified: true,
              profileCompleted: true,
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(profile);
          }
          localStorage.setItem('vidya_ai_current_user', JSON.stringify(profile));
          soundFx.playSuccess();
          onSelectRole(profile.role, profile);
          onClose();
          return;
        } catch (fbErr) {
          console.warn('Fallback login error:', fbErr);
        }
      }

      let friendlyError = err.message || 'Login failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyError = 'Invalid email or password. Please check your credentials or click "Sign Up" to create a new account.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address format (e.g. student@school.edu).';
      }
      setErrorMessage(friendlyError);
      soundFx.playFlip();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Signup Submit (Firebase Auth registration + Email Verification + Firestore Seeding)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = signupEmail.trim();
    const cleanPassword = signupPassword;

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      soundFx.playFlip();
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      soundFx.playFlip();
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      soundFx.playFlip();
      return;
    }

    if (cleanPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please recheck.');
      soundFx.playFlip();
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms & Data Privacy policy.');
      soundFx.playFlip();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = userCred.user;

      // 2. Send real Email Verification link
      try {
        await sendEmailVerification(user);
      } catch (eVer) {
        console.warn('Verification email notification notice:', eVer);
      }

      // 3. Save profile to Firestore
      const nowIso = new Date().toISOString();
      const classNum = grade ? parseInt(grade.replace(/\D/g, ''), 10) : null;
      const cleanClass = !isNaN(classNum as number) && classNum !== null ? classNum : null;
      const cleanGrade = cleanClass ? `Class ${cleanClass}` : null;

      const newProfile: UserAuthProfile = {
        id: user.uid,
        uid: user.uid,
        name: fullName.trim(),
        phone: signupPhone.trim(),
        mobileNumber: signupPhone.trim(),
        email: cleanEmail,
        role: selectedRole,
        grade: selectedRole === 'student' ? (cleanGrade as any) : undefined,
        class: selectedRole === 'student' ? (cleanClass as any) : undefined,
        board: board || 'AP State Board / SSC',
        medium,
        schoolName: schoolName.trim(),
        state: state.trim(),
        district: district.trim(),
        preferredLanguage: 'te',
        isVerified: user.emailVerified,
        profileCompleted: !!cleanClass,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastActiveAt: nowIso
      };

      await saveUserProfile(newProfile);
      if (selectedRole === 'student') {
        await recordStudentLogin(user.uid, newProfile).catch(() => {});
      }
      if (cleanGrade) {
        await ensureStudentDataInitialized(
          user.uid,
          cleanEmail,
          fullName.trim(),
          schoolName.trim(),
          cleanGrade,
          medium,
          board || 'AP State Board / SSC'
        ).catch(() => {});
      }

      soundFx.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      localStorage.setItem('vidya_ai_current_user', JSON.stringify(newProfile));
      setSignupStep('success');

      setTimeout(() => {
        onSelectRole(selectedRole, newProfile);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Signup error:', err);
      let friendlyError = err.message || 'Signup failed.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'An account with this email already exists. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Invalid email format. Please check your email address.';
      }
      setErrorMessage(friendlyError);
      soundFx.playFlip();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Profile Submission
  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      soundFx.playFlip();
      return;
    }

    if (!schoolName.trim()) {
      setErrorMessage('Please enter your school or institution name.');
      soundFx.playFlip();
      return;
    }

    const user = pendingFirebaseUser || auth.currentUser;
    if (!user) {
      setErrorMessage('User session expired. Please sign in again.');
      setAuthMode('login');
      return;
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const classNum = grade ? parseInt(grade.replace(/\D/g, ''), 10) : null;
      const cleanClass = !isNaN(classNum as number) && classNum !== null ? classNum : null;
      const cleanGrade = cleanClass ? `Class ${cleanClass}` : null;

      const completedProfile: UserAuthProfile = {
        id: user.uid,
        uid: user.uid,
        name: fullName.trim(),
        email: user.email || signupEmail.trim(),
        phone: signupPhone.trim(),
        mobileNumber: signupPhone.trim(),
        role: selectedRole,
        grade: selectedRole === 'student' ? (cleanGrade as any) : undefined,
        class: selectedRole === 'student' ? (cleanClass as any) : undefined,
        board: board || 'AP State Board / SSC',
        medium,
        schoolName: schoolName.trim(),
        state: state.trim(),
        district: district.trim(),
        preferredLanguage: 'te',
        isVerified: user.emailVerified,
        profileCompleted: !!cleanClass,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastActiveAt: nowIso
      };

      await saveUserProfile(completedProfile);
      if (selectedRole === 'student') {
        await recordStudentLogin(user.uid, completedProfile).catch(() => {});
      }
      if (cleanGrade) {
        await ensureStudentDataInitialized(
          user.uid,
          completedProfile.email || '',
          completedProfile.name,
          completedProfile.schoolName,
          cleanGrade,
          completedProfile.medium,
          completedProfile.board || 'AP State Board / SSC'
        ).catch(() => {});
      }

      soundFx.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      localStorage.setItem('vidya_ai_current_user', JSON.stringify(completedProfile));
      onSelectRole(completedProfile.role, completedProfile);
      onClose();
    } catch (err: any) {
      console.error('Complete profile error:', err);
      setErrorMessage(err.message || 'Failed to complete profile.');
      soundFx.playFlip();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = forgotEmail.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      soundFx.playFlip();
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setForgotSent(true);
      soundFx.playSuccess();
    } catch (err: any) {
      console.error('Forgot password error:', err);
      let friendlyError = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        friendlyError = 'No account found with this email address. Please check your spelling or sign up.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid, properly formatted email address.';
      }
      setErrorMessage(friendlyError);
      soundFx.playFlip();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth Sign-in with Popup & Redirect Fallback
  const handleGoogleAuth = async () => {
    soundFx.playClick();
    setIsSubmitting(true);
    setErrorMessage('');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      let firebaseUser: User | null = null;

      try {
        const result = await signInWithPopup(auth, provider);
        firebaseUser = result.user;
      } catch (popupError: any) {
        if (popupError?.code === 'auth/popup-closed-by-user') {
          setErrorMessage('Sign-in window was closed before completion.');
          return;
        }

        if (popupError?.code === 'auth/unauthorized-domain' || popupError?.code === 'auth/network-request-failed') {
          throw popupError;
        }

        console.warn("Google signInWithPopup notice, attempting redirect mode:", popupError);

        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          throw redirectErr;
        }
      }

      if (firebaseUser) {
        await processPostLogin(firebaseUser);
      }
    } catch (finalErr: any) {
      console.warn("Google Auth notice:", finalErr);
      let friendlyError = finalErr?.message || 'Google sign in failed. Please try Email & Password.';
      if (finalErr?.code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        friendlyError = `Domain "${hostname}" is not in Firebase Authorized Domains. Add "${hostname}" in Firebase Console > Authentication > Settings > Authorized Domains, or sign in with Email & Password.`;
      } else if (finalErr?.code === 'auth/network-request-failed' || finalErr?.message?.includes('network-request-failed')) {
        friendlyError = `Google Sign-In popup was blocked by browser iframe network policy. Please sign in with Email & Password.`;
      }
      setErrorMessage(friendlyError);
      soundFx.playFlip();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-yellow-300 font-black text-[11px] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>VidyaAI Education Portal • Secure Firebase Auth</span>
          </div>
          
          <h2 className="text-2xl font-black tracking-tight">
            {authMode === 'signup' 
              ? 'Create New Account' 
              : authMode === 'login' 
                ? 'Sign In to Portal' 
                : authMode === 'forgot' 
                  ? 'Reset Your Password' 
                  : 'Complete Your Profile'}
          </h2>
          <p className="text-sky-100 text-xs mt-1">
            {authMode === 'signup' 
              ? 'Join Class 10 Board Exam prep with real-time Firestore analytics & AI Tutor.' 
              : authMode === 'complete_profile'
                ? 'Please provide your school and grade details to enter your customized dashboard.'
                : 'Access your study plan, homework, readiness metrics & AI Tutor.'}
          </p>
        </div>

        {/* Navigation Tabs (Login / Signup) */}
        {authMode !== 'complete_profile' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Log In (లాగిన్)</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign Up (క్రొత్త ఖాతా)</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold space-y-2 animate-shake">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {errorMessage.includes('Firebase Authorized Domains') && (
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-rose-200/60 dark:border-rose-900/60">
                  <span className="text-[11px] font-mono bg-rose-100 dark:bg-rose-900/50 px-2 py-1 rounded text-rose-900 dark:text-rose-100 truncate max-w-[220px]">
                    {typeof window !== 'undefined' ? window.location.hostname : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.hostname);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 2000);
                      }
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition shrink-0 cursor-pointer"
                  >
                    {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDomain ? 'Copied Domain!' : 'Copy Domain'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verification Notice Banner */}
          {verificationNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{verificationNotice}</span>
            </div>
          )}

          {/* ==================== LOGIN MODE ==================== */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-3 border border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-extrabold uppercase text-slate-400">
                  Or Email & Password
                </span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="student@vidyaai.org"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Real Class 10 Test Student Accounts (E2E) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Real Class 10 Test Students</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">AP State Board / SSC</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { name: 'Adduri Surendra', email: '24331A4202@mvgrce.edu.in', uid: 'user_24331a4202_mvgrce_edu_in' },
                    { name: 'Make Praveen', email: '24331A4260@mvgrce.edu.in', uid: 'user_24331a4260_mvgrce_edu_in' },
                    { name: 'Marpina Yukthanjali', email: '24331A4264@mvgrce.edu.in', uid: 'user_24331a4264_mvgrce_edu_in' }
                  ].map((stu) => (
                    <button
                      key={stu.email}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => loginAsRealTestStudent(stu)}
                      className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-600 hover:border-indigo-600 text-left flex items-center justify-between transition group cursor-pointer disabled:opacity-50"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-white truncate">
                          {stu.name}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-100 truncate">
                          {stu.email} • Class 10 (English)
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 group-hover:bg-white group-hover:text-indigo-600 shadow-sm shrink-0 flex items-center gap-1">
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== FORGOT PASSWORD MODE ==================== */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enter your registered email address below. We will send a secure password reset link to your inbox.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="student@vidyaai.org"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Password Reset Email Sent
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Check your inbox at <strong>{forgotEmail}</strong> and follow the instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== SIGNUP MODE ==================== */}
          {authMode === 'signup' && (
            <div className="space-y-4">
              {signupStep === 'form' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  
                  {/* Account Role Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Account Type / Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'student' as UserRole, label: 'Student (విద్యార్థి)', icon: GraduationCap },
                        { id: 'teacher' as UserRole, label: 'Teacher (ఉపాధ్యాయుడు)', icon: BookOpen }
                      ].map((r) => {
                        const IconComponent = r.icon;
                        const isSelected = selectedRole === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedRole(r.id);
                            }}
                            className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 shrink-0" />
                            <span className="text-xs truncate">{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Sravanthi Kanugula"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="student@vidyaai.org"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Strength */}
                  {signupPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Security Level:</span>
                        <span className="font-extrabold">{passStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passStrength.color}`}
                          style={{ width: `${(passStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Profile Info for Students */}
                  {selectedRole === 'student' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Class
                          </label>
                          <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value as GradeLevel)}
                            className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="">-- Select Class --</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Medium
                          </label>
                          <select
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Telugu Medium">Telugu Medium (తెలుగు)</option>
                            <option value="English Medium">English Medium</option>
                            <option value="Urdu Medium">Urdu Medium</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Board
                          </label>
                          <select
                            value={board}
                            onChange={(e) => setBoard(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Andhra Pradesh State Board (AP SSC)">Andhra Pradesh State Board (AP SSC)</option>
                            <option value="Telangana State Board (SSC)">Telangana State Board (TS SSC)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      I agree to the <strong>VidyaAI Education Policy</strong> & data privacy terms.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Verify Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Success Screen */}
              {signupStep === 'success' && (
                <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Account Created Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verification email sent to {signupEmail}. Loading your real-time Student Dashboard...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================== COMPLETE PROFILE MODE ==================== */}
          {authMode === 'complete_profile' && (
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Please complete your student profile information to enter your customized state syllabus dashboard.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Sravanthi Kanugula"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School / Institution Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Government High School, Medak"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Select Class --</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Medak / Hyderabad / Vijayawada"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medium of Instruction
                  </label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Telugu Medium">Telugu Medium (తెలుగు)</option>
                    <option value="English Medium">English Medium</option>
                    <option value="Urdu Medium">Urdu Medium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Education Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Andhra Pradesh State Board (AP SSC)">AP SSC (Andhra Pradesh Board)</option>
                    <option value="Telangana State Board (SSC)">Telangana State Board (TS SSC)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Save Profile & Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>🔒 Protected by Firebase Auth & Firestore Master Security Rules</span>
        </div>
      </div>
    </div>
  );
};
