import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  ChevronDown, 
  Play, 
  FileText, 
  BookOpen, 
  FileCheck, 
  Award, 
  HelpCircle, 
  Send, 
  ExternalLink,
  Zap,
  Clock,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAuthProfile, UserRole } from '../types';
import { 
  logStudentLogin, 
  logResourceOpened, 
  logVideoProgress, 
  logPracticeAttempt, 
  logQuizAttempt, 
  logHomeworkSubmission, 
  logDoubtCreated 
} from '../services/studentActivityService';
import { soundFx } from '../lib/audio';

export interface RealStudentAccount {
  id: string;
  name: string;
  email: string;
  classNum: number;
  classGrade: string;
  board: string;
  rollNumber: string;
}

export const REAL_STUDENTS: RealStudentAccount[] = [
  {
    id: 'std_surendra_4202',
    name: 'Adduri Surendra',
    email: '24331A4202@mvgrce.edu.in',
    classNum: 10,
    classGrade: 'Class 10',
    board: 'AP State Board / SSC',
    rollNumber: '24331A4202'
  },
  {
    id: 'std_praveen_4260',
    name: 'Make Praveen',
    email: '24331A4260@mvgrce.edu.in',
    classNum: 10,
    classGrade: 'Class 10',
    board: 'AP State Board / SSC',
    rollNumber: '24331A4260'
  },
  {
    id: 'std_yukthanjali_4264',
    name: 'Marpina Yukthanjali',
    email: '24331A4264@mvgrce.edu.in',
    classNum: 10,
    classGrade: 'Class 10',
    board: 'AP State Board / SSC',
    rollNumber: '24331A4264'
  }
];

interface StudentTestSwitcherProps {
  currentRole: UserRole;
  currentUser: UserAuthProfile | null;
  onSwitchUser: (profile: UserAuthProfile, role: UserRole) => void;
  onOpenGrandMock?: () => void;
}

export const StudentTestSwitcher: React.FC<StudentTestSwitcherProps> = ({
  currentRole,
  currentUser,
  onSwitchUser,
  onOpenGrandMock
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Look up student's actual UID from Firestore if they logged in via Firebase Auth
  const findOrCreateStudentUid = async (student: RealStudentAccount): Promise<string> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', student.email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].id;
      }
    } catch (e) {
      console.warn('Lookup student UID warning:', e);
    }
    return student.id;
  };

  const handleSwitchToStudent = async (student: RealStudentAccount) => {
    soundFx.playClick();
    setIsPerformingAction(true);
    
    try {
      const actualUid = await findOrCreateStudentUid(student);
      const nowIso = new Date().toISOString();

      const profile: UserAuthProfile = {
        id: actualUid,
        uid: actualUid,
        name: student.name,
        email: student.email,
        role: 'student',
        board: student.board,
        class: student.classNum as any,
        grade: student.classGrade as any,
        schoolName: 'MVGR College of Engineering',
        district: 'Vizianagaram',
        state: 'Andhra Pradesh',
        medium: 'Telugu Medium',
        preferredLanguage: 'te',
        isVerified: true,
        profileCompleted: true,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastActiveAt: nowIso
      };
      (profile as any).status = 'Online';
      (profile as any).rollNumber = student.rollNumber;

      // Ensure doc exists in Firestore `users/{actualUid}`
      const userRef = doc(db, 'users', actualUid);
      await setDoc(userRef, {
        ...profile,
        updatedAt: nowIso
      }, { merge: true });

      // Record real login activity
      await logStudentLogin(actualUid, student.name, student.email, student.classGrade);

      localStorage.setItem('vidya_ai_current_user', JSON.stringify(profile));
      localStorage.setItem('vidya_selected_class', student.classGrade);

      onSwitchUser(profile, 'student');
      soundFx.playSuccess();
      showToast(`Switched to ${student.name} (Class 10)`);
    } catch (err: any) {
      console.error('Error switching to student:', err);
    } finally {
      setIsPerformingAction(false);
      setIsOpen(false);
    }
  };

  const handleSwitchToTeacher = async () => {
    soundFx.playClick();
    setIsPerformingAction(true);

    const nowIso = new Date().toISOString();
    const teacherProfile: UserAuthProfile = {
      id: 'teacher_ap_ramesh',
      uid: 'teacher_ap_ramesh',
      name: 'Dr. Ramesh Naidu (Senior Mathematics Teacher)',
      email: 'teacher.andhra@vidyaai.edu.in',
      role: 'teacher',
      board: 'AP State Board / SSC',
      class: 10 as any,
      grade: 'Class 10' as any,
      schoolName: 'Zilla Parishad High School, Vijayawada',
      district: 'NTR Vijayawada',
      state: 'Andhra Pradesh',
      isVerified: true,
      profileCompleted: true,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      lastActiveAt: nowIso
    };
    (teacherProfile as any).status = 'Online';

    try {
      await setDoc(doc(db, 'users', 'teacher_ap_ramesh'), teacherProfile, { merge: true });
    } catch (e) {}

    localStorage.setItem('vidya_ai_current_user', JSON.stringify(teacherProfile));
    onSwitchUser(teacherProfile, 'teacher');
    soundFx.playSuccess();
    showToast(`Switched to Teacher CMS Portal`);
    setIsPerformingAction(false);
    setIsOpen(false);
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Quick Test Action Executions for the currently active student
  const activeStudentUid = currentUser?.id || currentUser?.uid || '';
  const activeStudentName = currentUser?.name || 'Student';
  const isStudentActive = currentRole === 'student';

  const runQuickAction = async (actionType: string) => {
    if (!isStudentActive || !activeStudentUid) {
      alert('Please switch to one of the 3 students first to perform student test actions.');
      return;
    }

    soundFx.playClick();
    setIsPerformingAction(true);

    try {
      switch (actionType) {
        case 'textbook':
          await logResourceOpened(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Mathematics',
            'Chapter 1: Real Numbers',
            'res_tb_math_ch1',
            'AP SSC Class 10 Official Mathematics Textbook',
            'Official Textbook'
          );
          showToast(`Logged: Opened Official Textbook in Firestore!`);
          break;

        case 'video':
          await logVideoProgress(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Physical Science',
            'Chapter 1: Reflection of Light at Curved Surfaces',
            'vid_phys_ch1_concave',
            'Concave Mirror Ray Diagrams & Sign Convention',
            100
          );
          showToast(`Logged: Completed watching Video Lesson (100%) in Firestore!`);
          break;

        case 'notes':
          await logResourceOpened(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Mathematics',
            'Chapter 3: Polynomials',
            'res_notes_poly',
            'Quadratic Polynomials & Zeroes Revision Notes',
            'Chapter Notes'
          );
          showToast(`Logged: Read Chapter Notes in Firestore!`);
          break;

        case 'formula':
          await logResourceOpened(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Mathematics',
            'Chapter 11: Trigonometry',
            'res_formula_trig',
            'Trigonometric Identities & Standard Angles Cheat Sheet',
            'Formula Sheet'
          );
          showToast(`Logged: Opened Formula Sheet in Firestore!`);
          break;

        case 'worksheet':
          await logResourceOpened(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Physical Science',
            'Chapter 2: Chemical Equations',
            'res_ws_chem_eq',
            'Balancing Redox Equations Practice Worksheet',
            'Worksheet'
          );
          showToast(`Logged: Downloaded Worksheet in Firestore!`);
          break;

        case 'practice':
          await logPracticeAttempt(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Mathematics',
            'Chapter 5: Quadratic Equations',
            9,
            10,
            'Discriminant & Nature of Roots'
          );
          showToast(`Logged: Attempted Practice Set (Score 9/10) in Firestore!`);
          break;

        case 'quiz':
          await logQuizAttempt(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Biological Science',
            'Chapter 1: Nutrition',
            'Photosynthesis & Human Digestive System Quiz',
            18,
            20
          );
          showToast(`Logged: Submitted Quiz (Score 18/20) in Firestore!`);
          break;

        case 'homework':
          await logHomeworkSubmission(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'hw_quad_eq_10',
            'Solve Exercise 5.2 - Quadratic Equations Factorisation',
            'Mathematics',
            'Completed all 10 problems on graph sheet. Found roots for x^2 - 7x + 12 = 0 are x = 3, 4.'
          );
          showToast(`Logged: Submitted Real Homework Assignment in Firestore!`);
          break;

        case 'doubt':
          const doubtId = `dbt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
          const doubtText = 'Why is the focal length of a convex mirror always taken as positive in sign convention?';
          await setDoc(doc(db, 'doubtThreads', doubtId), {
            id: doubtId,
            studentUid: activeStudentUid,
            studentName: activeStudentName,
            class: 'Class 10',
            subject: 'Physical Science',
            chapter: 'Reflection of Light at Curved Surfaces',
            question: doubtText,
            status: 'Pending',
            createdAt: new Date().toISOString()
          });
          await logDoubtCreated(
            activeStudentUid,
            activeStudentName,
            'Class 10',
            'Physical Science',
            'Reflection of Light',
            doubtId,
            doubtText
          );
          showToast(`Logged: Asked Real Doubt in Doubt Center!`);
          break;

        case 'grand_mock':
          if (onOpenGrandMock) {
            onOpenGrandMock();
          } else {
            showToast('Opening Grand Mock...');
          }
          break;
      }
      soundFx.playSuccess();
    } catch (e: any) {
      console.error('Quick action error:', e);
      showToast(`Action error: ${e?.message}`);
    } finally {
      setIsPerformingAction(false);
    }
  };

  return (
    <div className="relative z-40">
      {/* Toast Notification Bar */}
      {actionSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Persistent Runner Pill */}
      <div className="bg-slate-900/95 dark:bg-slate-950 text-white border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
            3-Student Test Runner
          </span>
          
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Active Session:
          </span>
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {currentUser?.name || 'Guest'} ({currentRole.toUpperCase()})
          </span>
        </div>

        {/* Switcher Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {REAL_STUDENTS.map((st, idx) => {
            const isActive = currentUser?.email === st.email && currentRole === 'student';
            return (
              <button
                key={st.id}
                onClick={() => handleSwitchToStudent(st)}
                disabled={isPerformingAction}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={`Switch to Student ${idx + 1}: ${st.name} (${st.email})`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Student {idx + 1}:</span>
                <span>{st.name.split(' ')[0]}</span>
              </button>
            );
          })}

          <button
            onClick={handleSwitchToTeacher}
            disabled={isPerformingAction}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'teacher'
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
            title="Switch to Teacher CMS Portal"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teacher CMS</span>
          </button>

          {/* Quick Actions Drawer Toggle */}
          {isStudentActive && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition ml-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test Actions</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Quick Action Toolbar for Active Student */}
      {isOpen && isStudentActive && (
        <div className="bg-slate-800 text-white border-b border-slate-700 px-4 py-3 animate-fade-in shadow-2xl">
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold uppercase tracking-wider text-amber-400">
                Execute Real Student Action for {currentUser?.name}
              </span>
              <span>All actions immediately write to Firestore & update Teacher CMS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 pt-1">
              {[
                { id: 'textbook', label: 'Textbook', icon: BookOpen, color: 'hover:bg-blue-600' },
                { id: 'video', label: 'Watch Video', icon: Play, color: 'hover:bg-red-600' },
                { id: 'notes', label: 'Read Notes', icon: FileText, color: 'hover:bg-teal-600' },
                { id: 'formula', label: 'Formula Sheet', icon: Zap, color: 'hover:bg-purple-600' },
                { id: 'worksheet', label: 'Worksheet', icon: FileCheck, color: 'hover:bg-emerald-600' },
                { id: 'practice', label: 'Practice Set', icon: Clock, color: 'hover:bg-amber-600' },
                { id: 'quiz', label: 'Take Quiz', icon: Award, color: 'hover:bg-indigo-600' },
                { id: 'grand_mock', label: '100-Q Mock', icon: Award, color: 'hover:bg-rose-600' },
                { id: 'homework', label: 'Submit HW', icon: Send, color: 'hover:bg-cyan-600' },
                { id: 'doubt', label: 'Ask Doubt', icon: HelpCircle, color: 'hover:bg-orange-600' }
              ].map((act) => {
                const IconComponent = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => runQuickAction(act.id)}
                    disabled={isPerformingAction}
                    className={`p-2 rounded-xl bg-slate-700 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer ${act.color} disabled:opacity-50`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate w-full text-center">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
