import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  REAL_MDM_STUDENTS,
  isDemoActivityRecord,
  checkMdmDemoSeeded,
  seedMdmDemonstrationData,
  resetMdmDemonstrationActivity,
  MDM_ACTIVITY_SOURCE
} from './mdmDemonstrationService';

export {
  REAL_MDM_STUDENTS,
  isDemoActivityRecord,
  checkMdmDemoSeeded,
  seedMdmDemonstrationData,
  resetMdmDemonstrationActivity,
  MDM_ACTIVITY_SOURCE
};

export const DEMO_STUDENT_IDS = [
  'user_24331a4202_mvgrce_edu_in',
  'user_24331a4260_mvgrce_edu_in',
  'user_24331a4264_mvgrce_edu_in'
] as const;

export type DemoStudentId = typeof DEMO_STUDENT_IDS[number];

export const DEMO_STUDENTS_CONFIG = REAL_MDM_STUDENTS.map(s => ({
  uid: s.targetUid,
  name: s.name,
  email: s.email,
  class: s.class,
  grade: s.grade,
  board: s.board,
  medium: 'Telugu Medium',
  schoolName: 'Zilla Parishad High School (AP State Board)',
  rollNumber: s.rollNumber,
  performanceTier: s.performanceTier === 'High Achiever' ? 'High Performer' : s.performanceTier === 'Consistent Performer' ? 'Moderate' : 'Needs Support',
  description: `${s.name} is a registered student in Class 10 AP SSC curriculum.`,
  mockScore: Math.round((s.targetMockScore / 25) * 100),
  practiceScore: Math.round((s.targetPracticeScore / 10) * 100),
  homeworkStatus: s.homeworkStatus === 'submitted' ? 'Submitted' : s.homeworkStatus === 'in_progress' ? 'In Progress' : 'Not Submitted',
  homeworkScore: s.homeworkScore,
  status: 'Online' as const,
  isRecentlyActive: true
}));

/**
 * Helper to check if an activity record, submission, or attempt is demo-seeded.
 * Real student user accounts are NOT considered demo records.
 */
export function isDemoRecord(record: any): boolean {
  if (!record) return false;
  // If explicitly flagged as demo activity or demonstration source
  if (record.isDemoActivity === true || record.activitySource === MDM_ACTIVITY_SOURCE) {
    return true;
  }
  // Backward compatibility with legacy flags on activity attempts
  if (record.isDemo === true || record.demoStudent === true) {
    // If it's a real student profile, don't treat the student as fake
    const uid = record.uid || record.studentId || record.id || '';
    if (uid === 'user_24331a4202_mvgrce_edu_in' || uid === 'user_24331a4260_mvgrce_edu_in' || uid === 'user_24331a4264_mvgrce_edu_in') {
      return false;
    }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// LocalStorage & CustomEvent reactive toggle management
// ---------------------------------------------------------------------------
const DEMO_TOGGLE_STORAGE_KEY = 'vidya_show_demo_students';
const DEMO_TOGGLE_EVENT = 'vidya_demo_toggle_change';

export function getShowDemoStudents(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(DEMO_TOGGLE_STORAGE_KEY);
  if (stored === null) return true; // Default ON so presentation is immediately ready
  return stored === 'true';
}

export function setShowDemoStudents(show: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_TOGGLE_STORAGE_KEY, show ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent(DEMO_TOGGLE_EVENT, { detail: { show } }));
}

export function subscribeDemoToggle(callback: (show: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: any) => {
    const show = event.detail?.show ?? getShowDemoStudents();
    callback(show);
  };
  window.addEventListener(DEMO_TOGGLE_EVENT, handler);
  return () => window.removeEventListener(DEMO_TOGGLE_EVENT, handler);
}

/**
 * Deprecated legacy seeder: redirects to the new clean seedMdmDemonstrationData
 */
export async function seedDemoStudentsIfMissing(): Promise<void> {
  try {
    const status = await checkMdmDemoSeeded();
    if (!status.isSeeded) {
      console.log('MDM demo activity not seeded yet. Can be seeded via MDM Demonstration Data control.');
    }
  } catch (err) {
    console.warn('Notice checking demo seeding status:', err);
  }
}
