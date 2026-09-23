import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  limit, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserAuthProfile } from '../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, normalizeGradeKey } from '../data/officialSyllabusData';

export interface StudentProfileData {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  role: 'student';
  grade: string;
  class?: string | number;
  board: string;
  medium: string;
  schoolName: string;
  district: string;
  state: string;
  preferredLanguage?: string;
  photoURL?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  streakDays: number;
  xp: number;
  coins: number;
  boardExamDate: string;
  dailyStudyHours?: number;
  weakSubjects?: string;
}

export interface StudyPlanDoc {
  id: string;
  classId?: string;
  classGrade?: string;
  title: string;
  subject: string;
  subjectId?: string;
  chapterId?: string;
  chapterName?: string;
  lessonId?: string;
  lessonName?: string;
  estMinutes: number;
  completed: boolean;
  dueDate: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
  createdAt: string;
  status?: 'active' | 'completed' | 'skipped' | 'rescheduled';
  timeSlot?: string;
  actionType?: 'lesson' | 'practice' | 'homework' | 'mock_test' | 'library' | 'revision';
  xpReward?: number;
}

export interface SubjectProgressDoc {
  id: string;
  classId?: string;
  name: string;
  nativeName: string;
  completedPercent: number;
  chaptersCompleted: number;
  totalChapters: number;
  weakTopics: string;
  lastStudied: string;
  quizScoreAvg: number;
  color: string;
  icon: string;
}

export interface HomeworkDoc {
  id: string;
  classId?: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  priority: string;
  gradeScore?: string;
  description: string;
  maxScore: number;
  submittedAt?: string;
  createdAt: string;
}

export interface NotificationDoc {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'exam' | 'ai' | 'system';
  date: string;
  read: boolean;
  link?: string;
}

export interface ActivityDoc {
  id: string;
  action?: string;
  title: string;
  subject?: string;
  timestamp: string;
  xpGained?: number;
  type?: string;
  details?: string;
  xpEarned?: number;
}

export interface AITutorMessageDoc {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  subject: string;
  timestamp: string;
}

export interface WeeklyProgressDoc {
  id: string;
  day: string;
  studyMinutes: number;
  quizzesAttempted: number;
  accuracyPercent: number;
}

export interface CalendarEventDoc {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'exam' | 'study' | 'assignment' | 'revision';
  description: string;
  completed: boolean;
}

export interface ContinueLearningDoc {
  subject: string;
  chapterName: string;
  topicName: string;
  progressPercent: number;
  lastStep: string;
  updatedAt: string;
}

/**
 * Ensures initial Firestore documents are seeded for a student when first logging in.
 */
export async function ensureStudentDataInitialized(
  userId: string,
  userEmail: string,
  userName?: string,
  schoolName?: string,
  grade?: string,
  medium?: string,
  board?: string
): Promise<void> {
  const pathUser = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      const targetGrade = grade || '';
      const classNum = extractClassNumber(targetGrade) || 5;
      const nowIso = new Date().toISOString();
      const initialProfile: Partial<StudentProfileData> = {
        id: userId,
        uid: userId,
        name: userName || userEmail.split('@')[0] || 'Student',
        email: userEmail,
        role: 'student',
        board: board || 'AP_SSC',
        class: classNum,
        grade: `Class ${classNum}`,
        medium: medium || 'Telugu Medium',
        schoolName: schoolName || 'Government High School',
        district: 'NTR Vijayawada',
        state: 'Andhra Pradesh',
        preferredLanguage: 'te',
        photoURL: '',
        isVerified: true,
        isEmailVerified: false,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastActiveAt: nowIso,
        streakDays: 1,
        xp: 0,
        coins: 0,
        boardExamDate: ''
      };
      await setDoc(userDocRef, initialProfile, { merge: true });
    }

    // Check if subjects exist
    const mathSubRef = doc(db, 'students', userId, 'subjectProgress', 'mathematics');
    const mathSnap = await getDoc(mathSubRef);

    if (!mathSnap.exists()) {
      const userProfileData = userSnap.exists() ? (userSnap.data() as any) : null;
      const resolvedGrade = grade || userProfileData?.grade || userProfileData?.class || 'Class 5';
      const activeGrade = normalizeGradeKey(resolvedGrade);
      const classOfficialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[activeGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'];
      const subjects: SubjectProgressDoc[] = classOfficialSubjects.map((s) => ({
        id: s.id,
        classId: activeGrade,
        name: `${s.name} (${s.nativeName})`,
        nativeName: s.nativeName,
        completedPercent: 0,
        chaptersCompleted: 0,
        totalChapters: s.chaptersCount || 6,
        weakTopics: '',
        lastStudied: '',
        quizScoreAvg: 0,
        color: s.color || 'from-blue-600 to-indigo-600',
        icon: s.icon || 'BookOpen'
      }));

      for (const sub of subjects) {
        await setDoc(doc(db, 'students', userId, 'subjectProgress', sub.id), sub);
      }
    }
  } catch (error) {
    console.warn("Firestore initialization notice:", error);
  }
}

// Subscriptions
export function subscribeToStudentProfile(userId: string, callback: (profile: StudentProfileData | null) => void) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as StudentProfileData);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("Firestore profile snapshot warning:", err);
    }
  );
}

export function subscribeToStudyPlans(userId: string, callback: (plans: StudyPlanDoc[]) => void) {
  const path = `students/${userId}/studyPlans`;
  return onSnapshot(
    collection(db, 'students', userId, 'studyPlans'),
    (snap) => {
      const plans = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StudyPlanDoc));
      callback(plans);
    },
    (err) => {
      console.warn("Firestore study plans snapshot warning:", err);
    }
  );
}

export function subscribeToSubjectProgress(userId: string, callback: (subs: SubjectProgressDoc[]) => void) {
  const path = `students/${userId}/subjectProgress`;
  return onSnapshot(
    collection(db, 'students', userId, 'subjectProgress'),
    (snap) => {
      const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubjectProgressDoc));
      callback(subs);
    },
    (err) => {
      console.warn("Firestore subject progress snapshot warning:", err);
    }
  );
}

export function subscribeToHomework(userId: string, callback: (hws: HomeworkDoc[]) => void) {
  const path = `students/${userId}/homework`;
  return onSnapshot(
    collection(db, 'students', userId, 'homework'),
    (snap) => {
      const hws = snap.docs.map((d) => ({ id: d.id, ...d.data() } as HomeworkDoc));
      callback(hws);
    },
    (err) => {
      console.warn("Firestore homework snapshot warning:", err);
    }
  );
}

export function subscribeToNotifications(userId: string, callback: (notifs: NotificationDoc[]) => void) {
  const path = `students/${userId}/notifications`;
  return onSnapshot(
    collection(db, 'students', userId, 'notifications'),
    (snap) => {
      const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc));
      callback(notifs);
    },
    (err) => {
      console.warn("Firestore notifications snapshot warning:", err);
    }
  );
}

export function subscribeToActivityLogs(userId: string, callback: (acts: ActivityDoc[]) => void) {
  const path = `students/${userId}/activity`;
  return onSnapshot(
    collection(db, 'students', userId, 'activity'),
    (snap) => {
      const acts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityDoc));
      callback(acts);
    },
    (err) => {
      console.warn("Firestore activity snapshot warning:", err);
    }
  );
}

export function subscribeToWeeklyProgress(userId: string, callback: (weekly: WeeklyProgressDoc[]) => void) {
  const path = `students/${userId}/weeklyProgress`;
  return onSnapshot(
    collection(db, 'students', userId, 'weeklyProgress'),
    (snap) => {
      const weekly = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WeeklyProgressDoc));
      callback(weekly);
    },
    (err) => {
      console.warn("Firestore weekly progress snapshot warning:", err);
    }
  );
}

export function subscribeToCalendarEvents(userId: string, callback: (evts: CalendarEventDoc[]) => void) {
  const path = `students/${userId}/calendarEvents`;
  return onSnapshot(
    collection(db, 'students', userId, 'calendarEvents'),
    (snap) => {
      const evts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEventDoc));
      callback(evts);
    },
    (err) => {
      console.warn("Firestore calendar events snapshot warning:", err);
    }
  );
}

export function subscribeToContinueLearning(userId: string, callback: (cl: ContinueLearningDoc | null) => void) {
  const path = `students/${userId}/continueLearning/current`;
  return onSnapshot(
    doc(db, 'students', userId, 'continueLearning', 'current'),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as ContinueLearningDoc);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("Firestore continue learning snapshot warning:", err);
    }
  );
}

export function subscribeToAITutorChat(userId: string, callback: (msgs: AITutorMessageDoc[]) => void) {
  const path = `students/${userId}/aiTutorChat`;
  return onSnapshot(
    collection(db, 'students', userId, 'aiTutorChat'),
    (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AITutorMessageDoc));
      // Sort by timestamp
      msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      callback(msgs);
    },
    (err) => {
      console.warn("Firestore AI tutor chat snapshot warning:", err);
    }
  );
}

// Mutations
export async function toggleStudyPlanItem(userId: string, planId: string, currentCompleted: boolean) {
  const path = `students/${userId}/studyPlans/${planId}`;
  try {
    const planRef = doc(db, 'students', userId, 'studyPlans', planId);
    await setDoc(planRef, { id: planId, completed: !currentCompleted }, { merge: true });
  } catch (err) {
    console.warn(`Firestore toggleStudyPlanItem warning at ${path}:`, err);
  }
}

export async function addStudyPlanItem(userId: string, item: Omit<StudyPlanDoc, 'id' | 'createdAt'>) {
  const path = `students/${userId}/studyPlans`;
  try {
    const newDocRef = doc(collection(db, 'students', userId, 'studyPlans'));
    const newItem: StudyPlanDoc = {
      ...item,
      id: newDocRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newDocRef, newItem);
  } catch (err) {
    console.warn(`Firestore addStudyPlanItem warning at ${path}:`, err);
  }
}

export async function updateStudyPlanItem(userId: string, planId: string, updates: Partial<StudyPlanDoc>) {
  const path = `students/${userId}/studyPlans/${planId}`;
  try {
    const planRef = doc(db, 'students', userId, 'studyPlans', planId);
    await setDoc(planRef, updates, { merge: true });
  } catch (err) {
    console.warn(`Firestore updateStudyPlanItem warning at ${path}:`, err);
  }
}

export async function deleteStudyPlanItem(userId: string, planId: string) {
  const path = `students/${userId}/studyPlans/${planId}`;
  try {
    const planRef = doc(db, 'students', userId, 'studyPlans', planId);
    await deleteDoc(planRef);
  } catch (err) {
    console.warn(`Firestore deleteStudyPlanItem warning at ${path}:`, err);
  }
}

export async function submitHomework(userId: string, homeworkId: string, description?: string) {
  const path = `students/${userId}/homework/${homeworkId}`;
  try {
    const hwRef = doc(db, 'students', userId, 'homework', homeworkId);
    await setDoc(hwRef, {
      id: homeworkId,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }, { merge: true });

    // Add activity log
    const actRef = doc(collection(db, 'students', userId, 'activity'));
    await setDoc(actRef, {
      id: actRef.id,
      action: 'assignment_submitted',
      title: `Submitted Homework: ${homeworkId}`,
      subject: 'Class 10 Homework',
      timestamp: 'Just now',
      xpGained: 40
    });
  } catch (err) {
    console.warn(`Firestore submitHomework warning at ${path}:`, err);
  }
}

export async function markNotificationRead(userId: string, notifId: string) {
  const path = `students/${userId}/notifications/${notifId}`;
  try {
    const notifRef = doc(db, 'students', userId, 'notifications', notifId);
    await setDoc(notifRef, { id: notifId, read: true }, { merge: true });
  } catch (err) {
    console.warn(`Firestore markNotificationRead warning at ${path}:`, err);
  }
}

export async function saveLessonProgressAndQuizScore(
  userId: string,
  subjectId: string,
  chapterId: string,
  lessonId: string,
  quizScore: number,
  totalQuestions: number
) {
  const path = `students/${userId}/student_progress/${subjectId}_${chapterId}_${lessonId}`;
  try {
    const progRef = doc(db, 'students', userId, 'student_progress', `${subjectId}_${chapterId}_${lessonId}`);
    await setDoc(progRef, {
      subjectId,
      chapterId,
      lessonId,
      quizScore,
      totalQuestions,
      percentage: Math.round((quizScore / (totalQuestions || 1)) * 100),
      completed: true,
      lastStudied: new Date().toISOString()
    }, { merge: true });

    // Log Activity
    const actRef = doc(collection(db, 'students', userId, 'activity'));
    await setDoc(actRef, {
      id: actRef.id,
      action: 'lesson_completed',
      title: `Completed Lesson Quiz (${Math.round((quizScore / (totalQuestions || 1)) * 100)}%)`,
      subject: subjectId,
      timestamp: 'Just now',
      xpGained: 50
    });
  } catch (err) {
    console.warn(`Firestore saveLessonProgressAndQuizScore warning at ${path}:`, err);
  }
}

export async function logStudentActivity(
  userId: string,
  action: string,
  title: string,
  subject: string,
  xpGained: number = 20
) {
  const path = `students/${userId}/activity`;
  try {
    const actRef = doc(collection(db, 'students', userId, 'activity'));
    await setDoc(actRef, {
      id: actRef.id,
      action,
      title,
      subject,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      xpGained
    });
  } catch (err) {
    console.warn(`Firestore logStudentActivity warning at ${path}:`, err);
  }
}

export async function addCalendarEvent(userId: string, event: Omit<CalendarEventDoc, 'id'>) {
  const path = `students/${userId}/calendarEvents`;
  try {
    const newRef = doc(collection(db, 'students', userId, 'calendarEvents'));
    const newEvt: CalendarEventDoc = {
      ...event,
      id: newRef.id
    };
    await setDoc(newRef, newEvt);
  } catch (err) {
    console.warn(`Firestore addCalendarEvent warning at ${path}:`, err);
  }
}

export async function sendAITutorMessageToFirestore(userId: string, text: string, sender: 'user' | 'ai', subject: string = 'General') {
  const path = `students/${userId}/aiTutorChat`;
  try {
    const chatRef = doc(collection(db, 'students', userId, 'aiTutorChat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      sender,
      text,
      subject,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Firestore sendAITutorMessageToFirestore warning at ${path}:`, err);
  }
}

export async function updateStudentProfile(userId: string, updates: Partial<StudentProfileData>) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updates, { merge: true });
  } catch (err) {
    console.warn(`Firestore updateStudentProfile warning at ${path}:`, err);
  }
}

/**
 * Fetches the user profile document from Firestore.
 */
export async function fetchUserProfile(userId: string): Promise<UserAuthProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserAuthProfile;
    }
    return null;
  } catch (err) {
    console.warn("Error reading user profile from Firestore:", err);
    return null;
  }
}

/**
 * Saves or updates a complete user profile in Firestore.
 */
export async function saveUserProfile(profile: UserAuthProfile): Promise<void> {
  const userId = profile.uid || profile.id;
  try {
    const userRef = doc(db, 'users', userId);
    const targetClass = profile.grade || profile.class || undefined;
    const classNum = extractClassNumber(targetClass);
    const nowIso = new Date().toISOString();
    
    const dataToSave: any = {
      ...profile,
      id: userId,
      uid: userId,
      mobileNumber: profile.mobileNumber || profile.phone || '',
      phone: profile.phone || profile.mobileNumber || '',
      profileCompleted: true,
      updatedAt: nowIso
    };

    if (profile.role === 'student') {
      dataToSave.role = 'student';
      dataToSave.board = profile.board || 'AP_SSC';
      dataToSave.preferredLanguage = profile.preferredLanguage || profile.preferredLang || 'te';
      if (classNum) {
        dataToSave.class = classNum;
        dataToSave.grade = `Class ${classNum}`;
      }
      if (!dataToSave.createdAt) {
        dataToSave.createdAt = nowIso;
      }
      if (!dataToSave.lastLoginAt) {
        dataToSave.lastLoginAt = nowIso;
      }
      if (!dataToSave.lastActiveAt) {
        dataToSave.lastActiveAt = nowIso;
      }
    } else if (targetClass) {
      dataToSave.class = targetClass;
      dataToSave.grade = targetClass;
    }

    await setDoc(userRef, dataToSave, { merge: true });
  } catch (err) {
    console.warn("Error saving user profile to Firestore:", err);
    // Non-blocking fallback
  }
}

/**
 * Uploads student profile photo to Firebase Storage with automatic data-URL fallback.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `profile_photos/${userId}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    await updateStudentProfile(userId, { photoURL: downloadURL });
    return downloadURL;
  } catch (err) {
    console.warn('Firebase storage upload fallback to base64 data-URL:', err);
    // Convert to base64 Data URL as reliable fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          await updateStudentProfile(userId, { photoURL: dataUrl });
          resolve(dataUrl);
        } catch (updateErr) {
          reject(updateErr);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

export interface ChapterProgressRecord {
  chapterId: string;
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  nativeTitle?: string;
  completionStatus: 'completed' | 'in_progress' | 'not_started';
  lessonProgress: number;
  videosWatched: number;
  totalVideos: number;
  notesRead: number;
  totalNotes: number;
  practiceSolved: number;
  totalPractice: number;
  quizScore: number;
  aiRevisionStatus: 'Mastered' | 'Revision Due' | 'Needs Practice' | 'Not Started';
  masteryLevel: 'Novice' | 'Proficient' | 'Master';
  estimatedMinutes: number;
  lastStudiedDate: string;
}

/**
 * Real-time subscription to published CMS Educational Resources uploaded by Teachers/Admins.
 */
export function subscribeToCmsItems(callback: (items: any[]) => void) {
  return onSnapshot(
    collection(db, 'cms'),
    (snap) => {
      const items: any[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore CMS items snapshot warning:', err);
      callback([]);
    }
  );
}

/**
 * Real-time subscription to detailed chapter progress records for a student.
 */
export function subscribeToChapterProgress(userId: string, callback: (records: Record<string, ChapterProgressRecord>) => void) {
  if (!userId) return () => {};
  
  return onSnapshot(
    collection(db, `users/${userId}/chapterProgress`),
    (snap) => {
      const records: Record<string, ChapterProgressRecord> = {};
      snap.forEach((d) => {
        records[d.id] = { chapterId: d.id, ...d.data() } as ChapterProgressRecord;
      });
      callback(records);
    },
    (err) => {
      console.warn('Firestore chapter progress subscription warning:', err);
      callback({});
    }
  );
}

/**
 * Saves or updates a chapter's detailed progress in Firestore.
 */
export async function updateChapterProgressInFirestore(userId: string, record: Partial<ChapterProgressRecord> & { chapterId: string }) {
  if (!userId || !record.chapterId) return;
  try {
    const chapRef = doc(db, `users/${userId}/chapterProgress`, record.chapterId);
    await setDoc(chapRef, {
      ...record,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating chapter progress in Firestore:', err);
  }
}

// Global LMS Collections Interfaces
export interface LessonDoc {
  id: string;
  title: string;
  chapter: string;
  subject: string;
  lessonNumber: number;
  uploadedAt: string;
  teacherName: string;
  estimatedMinutes?: number;
  isNew?: boolean;
}

export interface VideoDoc {
  id: string;
  title: string;
  duration: string;
  teacher: string;
  chapter: string;
  subject: string;
  thumbnailUrl?: string;
  youtubeId?: string;
}

export interface NoteDoc {
  id: string;
  title: string;
  type: 'PDF Notes' | 'Revision Notes' | 'Formula Sheets' | 'Worksheets' | 'Mind Maps';
  subject: string;
  teacher: string;
  fileSize: string;
  downloadUrl?: string;
}

export interface QuizDoc {
  id: string;
  title: string;
  type: 'Chapter Quiz' | 'Weekly Test' | 'Monthly Test' | 'Mock Test';
  date: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface TeacherAnnouncementDoc {
  id: string;
  teacherName: string;
  teacherPhoto?: string;
  announcement: string;
  uploadDate: string;
  subject?: string;
}

export interface DailyQuestionDoc {
  id: string;
  question: string;
  subject: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Global LMS Subscription Functions with Class Grade Filtering
export function subscribeToLessons(callback: (lessons: LessonDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'lessons'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LessonDoc));
      const filtered = studentClassGrade && studentClassGrade !== 'All'
        ? docs.filter((d: any) => !d.classId || d.classId === 'All' || d.classId === studentClassGrade)
        : docs;
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore lessons snapshot warning:", err);
      callback([]);
    }
  );
}

export function subscribeToVideos(callback: (videos: VideoDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'videos'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VideoDoc));
      const filtered = studentClassGrade && studentClassGrade !== 'All'
        ? docs.filter((d: any) => !d.classId || d.classId === 'All' || d.classId === studentClassGrade)
        : docs;
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore videos snapshot warning:", err);
      callback([]);
    }
  );
}

export function subscribeToNotes(callback: (notes: NoteDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'notes'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NoteDoc));
      const filtered = studentClassGrade && studentClassGrade !== 'All'
        ? docs.filter((d: any) => !d.classId || d.classId === 'All' || d.classId === studentClassGrade)
        : docs;
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore notes snapshot warning:", err);
      callback([]);
    }
  );
}

export function subscribeToQuizzes(callback: (quizzes: QuizDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'quizzes'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizDoc));
      const filtered = studentClassGrade && studentClassGrade !== 'All'
        ? docs.filter((d: any) => !d.classId || d.classId === 'All' || d.classId === studentClassGrade)
        : docs;
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore quizzes snapshot warning:", err);
      callback([]);
    }
  );
}

export function subscribeToAnnouncements(callback: (announcements: TeacherAnnouncementDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'announcements'),
    (snap) => {
      const now = Date.now();
      const docs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          teacherName: data.authorName || data.teacherName || 'Teacher',
          teacherPhoto: data.teacherPhoto || '',
          announcement: data.message || data.content || data.announcement || data.title || '',
          title: data.title || 'Announcement',
          uploadDate: data.publishDate || data.publishedAt || data.createdAt ? new Date(data.publishDate || data.publishedAt || data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
          subject: data.type || data.subject || 'General',
          status: data.status || 'PUBLISHED',
          expiresAt: data.expiresAt || null,
          scheduledFor: data.scheduledFor || null,
          targetClass: data.targetClass || data.classId || 'All Students',
          targetSection: data.targetSection || 'All Sections'
        };
      });

      const filtered = docs.filter((d: any) => {
        if (d.status !== 'PUBLISHED') return false;
        if (d.expiresAt && new Date(d.expiresAt).getTime() <= now) return false;
        if (d.scheduledFor && new Date(d.scheduledFor).getTime() > now) return false;
        return isAnnouncementTargetedToStudent(d, studentClassGrade);
      });

      callback(filtered as unknown as TeacherAnnouncementDoc[]);
    },
    (err) => {
      console.warn("Firestore announcements snapshot warning:", err);
      callback([]);
    }
  );
}

export function subscribeToDailyQuestions(callback: (questions: DailyQuestionDoc[]) => void, studentClassGrade?: string) {
  return onSnapshot(
    collection(db, 'daily_questions'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DailyQuestionDoc));
      const filtered = studentClassGrade && studentClassGrade !== 'All'
        ? docs.filter((d: any) => !d.classId || d.classId === 'All' || d.classId === studentClassGrade)
        : docs;
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore daily_questions snapshot warning:", err);
      callback([]);
    }
  );
}

// Practice Center Helper Services
export interface PracticeQuestionAttempt {
  questionId: string;
  subject: string;
  chapter: string;
  topic: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptedAt: string;
}

export async function savePracticeAttempt(userId: string, attempt: PracticeQuestionAttempt) {
  try {
    const ref = doc(collection(db, 'students', userId, 'practice_attempts'));
    await setDoc(ref, {
      ...attempt,
      id: ref.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore savePracticeAttempt warning:", err);
  }
}

export async function toggleQuestionBookmark(userId: string, questionId: string, isBookmarked: boolean, questionData?: any) {
  try {
    const ref = doc(db, 'students', userId, 'bookmarks', questionId);
    if (isBookmarked) {
      await setDoc(ref, {
        questionId,
        questionData,
        savedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn("Firestore toggleQuestionBookmark warning:", err);
  }
}

export async function saveQuestionMistake(userId: string, questionId: string, questionData: any, userAnswer: any) {
  try {
    const ref = doc(db, 'students', userId, 'mistakes', questionId);
    await setDoc(ref, {
      questionId,
      questionData,
      userAnswer,
      lastAttemptedAt: new Date().toISOString(),
      resolved: false
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore saveQuestionMistake warning:", err);
  }
}

export async function resolveQuestionMistake(userId: string, questionId: string) {
  try {
    const ref = doc(db, 'students', userId, 'mistakes', questionId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn("Firestore resolveQuestionMistake warning:", err);
  }
}

// Digital Library Helper Services
export interface LibraryResourceDoc {
  id: string;
  title: string;
  subject: string;
  chapter?: string;
  classLevel?: string;
  classGrade?: string;
  classId?: string;
  category?: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
  description?: string;
  medium?: string;
  board?: string;
  uploaderName?: string;
  downloadCount?: number;
  viewsCount?: number;
  isOfficial?: boolean;
  status?: string;
  createdAt?: string;
}

export function subscribeToLibraryCollection(
  collectionName: string,
  callback: (docs: LibraryResourceDoc[]) => void
) {
  const getCombinedDocs = (firestoreDocs: LibraryResourceDoc[]) => {
    try {
      const localData = localStorage.getItem(`lib_res_${collectionName}`);
      const localDocs: LibraryResourceDoc[] = localData ? JSON.parse(localData) : [];
      const map = new Map<string, LibraryResourceDoc>();
      // Add local docs first
      localDocs.forEach(d => map.set(d.id, d));
      // Add firestore docs (overwriting or merging)
      firestoreDocs.forEach(d => map.set(d.id, d));
      return Array.from(map.values());
    } catch (e) {
      return firestoreDocs;
    }
  };

  // Event listener for local storage updates
  const handleLocalUpdate = (e: any) => {
    if (e.detail?.collectionName === collectionName || !e.detail) {
      try {
        const localData = localStorage.getItem(`lib_res_${collectionName}`);
        const localDocs: LibraryResourceDoc[] = localData ? JSON.parse(localData) : [];
        callback(localDocs);
      } catch (err) {}
    }
  };
  window.addEventListener('lib_res_updated', handleLocalUpdate);

  const unsub = onSnapshot(
    collection(db, collectionName),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LibraryResourceDoc));
      callback(getCombinedDocs(docs));
    },
    (err) => {
      console.warn(`Firestore ${collectionName} subscription notice:`, err);
      try {
        const localData = localStorage.getItem(`lib_res_${collectionName}`);
        const localDocs: LibraryResourceDoc[] = localData ? JSON.parse(localData) : [];
        callback(localDocs);
      } catch (e) {
        callback([]);
      }
    }
  );

  return () => {
    unsub();
    window.removeEventListener('lib_res_updated', handleLocalUpdate);
  };
}

export async function uploadFileToFirebaseStorage(file: File, folderPath: string): Promise<string> {
  try {
    const fileRef = ref(storage, `${folderPath}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (err) {
    console.warn("Firebase storage upload notice, generating secure URL fallback:", err);
    return URL.createObjectURL(file);
  }
}

export function subscribeToGenericCollection<T = any>(
  collectionName: string,
  callback: (docs: T[]) => void
) {
  const getCombinedDocs = (firestoreDocs: T[]) => {
    try {
      const localData = localStorage.getItem(`fs_${collectionName}`);
      const localDocs: T[] = localData ? JSON.parse(localData) : [];
      const map = new Map<string, T>();
      localDocs.forEach((d: any) => map.set(d.id, d));
      firestoreDocs.forEach((d: any) => map.set(d.id, d));
      return Array.from(map.values());
    } catch (e) {
      return firestoreDocs;
    }
  };

  const handleLocalUpdate = (e: any) => {
    if (e.detail?.collectionName === collectionName || !e.detail) {
      try {
        const localData = localStorage.getItem(`fs_${collectionName}`);
        const localDocs: T[] = localData ? JSON.parse(localData) : [];
        callback(localDocs);
      } catch (err) {}
    }
  };
  window.addEventListener('fs_updated', handleLocalUpdate);

  const unsub = onSnapshot(
    collection(db, collectionName),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
      callback(getCombinedDocs(docs));
    },
    (err) => {
      console.warn(`Firestore ${collectionName} subscription notice:`, err);
      try {
        const localData = localStorage.getItem(`fs_${collectionName}`);
        const localDocs: T[] = localData ? JSON.parse(localData) : [];
        callback(localDocs);
      } catch (e) {
        callback([]);
      }
    }
  );

  return () => {
    unsub();
    window.removeEventListener('fs_updated', handleLocalUpdate);
  };
}

export async function publishTeacherContent<T extends Record<string, any>>(
  collectionName: string,
  content: T
): Promise<T & { id: string }> {
  const docId = (content as any).id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const fullDoc = {
    ...content,
    id: docId,
    createdAt: (content as any).createdAt || now,
    updatedAt: now,
    published: true
  };

  // Cache locally for instant UI update across tabs
  try {
    const existing = localStorage.getItem(`fs_${collectionName}`);
    const list: any[] = existing ? JSON.parse(existing) : [];
    const idx = list.findIndex((item) => item.id === docId);
    if (idx >= 0) {
      list[idx] = fullDoc;
    } else {
      list.unshift(fullDoc);
    }
    localStorage.setItem(`fs_${collectionName}`, JSON.stringify(list));

    // Also mirror to Digital Library if applicable
    if (['videos', 'notes', 'worksheets', 'formula_sheets', 'previous_papers'].includes(collectionName)) {
      const libExisting = localStorage.getItem(`lib_res_${collectionName}`);
      const libList: any[] = libExisting ? JSON.parse(libExisting) : [];
      libList.unshift(fullDoc);
      localStorage.setItem(`lib_res_${collectionName}`, JSON.stringify(libList));
      window.dispatchEvent(new CustomEvent('lib_res_updated', { detail: { collectionName } }));
    }

    window.dispatchEvent(new CustomEvent('fs_updated', { detail: { collectionName } }));
  } catch (e) {
    console.warn('Failed to cache locally:', e);
  }

  // Sync to Firestore
  try {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn('Anonymous auth signin notice:', authErr);
      }
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, fullDoc, { merge: true });

    // UNIFIED PIPELINE: Also write to `resources/{docId}` as published resource so all students see it
    const colToTypeMap: Record<string, string> = {
      'textbooks': 'Official Textbook',
      'notes': 'Chapter Notes',
      'formula_sheets': 'Formula / Key Facts',
      'study_material': 'Study Material',
      'worksheets': 'Practice Material',
      'practice_sets': 'Practice Material',
      'previous_papers': 'Previous / Model Papers',
      'videos': 'Video Lesson'
    };
    const mappedType = colToTypeMap[collectionName];
    if (mappedType) {
      const cls = (fullDoc as any).class || (fullDoc as any).grade || (fullDoc as any).classGrade || 'Class 10';
      const cleanClass = typeof cls === 'number' || !String(cls).toLowerCase().includes('class') ? `Class ${cls}` : String(cls);
      const unifiedResDoc = {
        resourceId: docId,
        board: (fullDoc as any).board || 'AP State Board',
        class: cleanClass,
        classGrade: cleanClass,
        subject: (fullDoc as any).subject || 'General',
        chapterId: (fullDoc as any).chapterId || 'ch_1',
        chapterName: (fullDoc as any).chapterName || (fullDoc as any).chapterTitle || (fullDoc as any).chapter || (fullDoc as any).title || '',
        chapter: (fullDoc as any).chapterName || (fullDoc as any).chapterTitle || (fullDoc as any).chapter || (fullDoc as any).title || '',
        type: mappedType,
        resourceType: mappedType,
        title: (fullDoc as any).title || (fullDoc as any).name || mappedType,
        description: (fullDoc as any).description || '',
        language: (fullDoc as any).language || 'English',
        sourceType: (fullDoc as any).fileUrl ? 'file' : ((fullDoc as any).videoUrl || (fullDoc as any).url ? 'url' : 'file'),
        sourceUrl: (fullDoc as any).fileUrl || (fullDoc as any).videoUrl || (fullDoc as any).url || '',
        fileUrl: (fullDoc as any).fileUrl || (fullDoc as any).videoUrl || (fullDoc as any).url || '',
        storagePath: (fullDoc as any).storagePath || '',
        fileSize: (fullDoc as any).fileSize || '1.0 MB',
        fileType: mappedType === 'Video Lesson' ? 'video' : 'pdf',
        isOfficial: mappedType === 'Official Textbook' || !!(fullDoc as any).isOfficial,
        status: 'published',
        publishedAt: now,
        createdAt: (fullDoc as any).createdAt || now,
        updatedAt: now,
        viewsCount: (fullDoc as any).viewsCount || 0,
        downloadCount: (fullDoc as any).downloadCount || 0
      };
      const resDocRef = doc(db, 'resources', docId);
      await setDoc(resDocRef, unifiedResDoc, { merge: true });
    }
  } catch (err) {
    console.warn(`Firestore publishTeacherContent notice (${collectionName}):`, err);
  }

  return fullDoc as T & { id: string };
}

export async function uploadLibraryResource(
  collectionName: string,
  resourceData: Partial<LibraryResourceDoc> & { title: string; subject: string; chapter: string; fileUrl: string },
  fileObj?: File | null
): Promise<LibraryResourceDoc> {
  let fileUrl = resourceData.fileUrl || '';
  if (fileObj) {
    fileUrl = await uploadFileToFirebaseStorage(fileObj, `library/${collectionName}`);
  }

  const docData: LibraryResourceDoc = {
    fileSize: '2.5 MB',
    fileType: 'pdf',
    description: '',
    medium: 'Telugu Medium',
    board: 'AP SCERT',
    ...resourceData,
    id: resourceData.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fileUrl,
    uploadedAt: resourceData.uploadedAt || new Date().toISOString()
  };

  await publishTeacherContent(collectionName, docData);
  return docData;
}

export const addLibraryResource = uploadLibraryResource;

// ==========================================
// PRACTICE CENTER FIRESTORE SERVICES
// ==========================================

export async function fetchPracticeSetsFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'practice_sets'));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (docs.length > 0) return docs;
  } catch (err) {
    console.warn('Firestore fetchPracticeSets notice:', err);
  }
  try {
    const cached = localStorage.getItem('fs_practice_sets');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return [];
}

export async function savePracticeAttemptState(
  userId: string,
  attempt: {
    setId: string;
    currentQuestionIndex: number;
    answers: Record<string, any>;
    markedForRevision: Record<string, boolean>;
    bookmarked: Record<string, boolean>;
    timeSpentSeconds: number;
    isCompleted: boolean;
  }
): Promise<void> {
  const attemptId = `att_${userId}_${attempt.setId}`;
  const now = new Date().toISOString();
  const data = {
    id: attemptId,
    userId,
    ...attempt,
    lastSavedAt: now,
    startedAt: now
  };

  try {
    const localKey = `fs_practice_attempts_${userId}_${attempt.setId}`;
    localStorage.setItem(localKey, JSON.stringify(data));
  } catch (e) {}

  try {
    const docRef = doc(db, 'practice_attempts', attemptId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn('Firestore savePracticeAttemptState notice:', err);
  }
}

export async function savePracticeResultToFirestore(result: any): Promise<void> {
  const resultId = result.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const docData = { ...result, id: resultId, completedAt: new Date().toISOString() };

  try {
    const existing = localStorage.getItem('fs_practice_results');
    const list: any[] = existing ? JSON.parse(existing) : [];
    list.unshift(docData);
    localStorage.setItem('fs_practice_results', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fs_updated', { detail: { collectionName: 'practice_results' } }));
  } catch (e) {}

  try {
    const docRef = doc(db, 'practice_results', resultId);
    await setDoc(docRef, docData, { merge: true });
  } catch (err) {
    console.warn('Firestore savePracticeResultToFirestore notice:', err);
  }
}

export async function deletePracticeSetFromFirestore(setId: string): Promise<void> {
  try {
    const existing = localStorage.getItem('fs_practice_sets');
    if (existing) {
      const list: any[] = JSON.parse(existing);
      const filtered = list.filter(s => s.id !== setId);
      localStorage.setItem('fs_practice_sets', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('fs_updated', { detail: { collectionName: 'practice_sets' } }));
    }
  } catch (e) {}

  try {
    await deleteDoc(doc(db, 'practice_sets', setId));
  } catch (err) {
    console.warn('Firestore deletePracticeSet notice:', err);
  }
}

// ==========================================
// PREVIOUS PAPERS FIRESTORE SERVICES
// ==========================================

export interface PreviousPaperDoc {
  id: string;
  title: string;
  subject: string;
  board: string;
  year: string;
  medium: string;
  totalMarks: number;
  classGrade?: string;
  classId?: string;
  durationMinutes?: number;
  downloadCount?: number;
  status?: string;
  schemeUrl?: string;
  duration?: string;
  examDuration?: string;
  fileSize?: string;
  pdfUrl?: string;
  questionPaperUrl?: string;
  answerKeyUrl?: string;
  thumbnail?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  academicYear?: string;
  teacherSolution?: string;
  uploadedBy?: string;
  paperType?: string;
}

export const INITIAL_GENUINE_PREVIOUS_PAPERS: PreviousPaperDoc[] = [
  {
    id: 'pyq_ts_2024_maths_em',
    title: 'Telangana SSC Board Public Examination 2024 Mathematics Paper I & II',
    subject: 'Mathematics',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 80,
    duration: '3 Hours 15 Mins',
    fileSize: '2.4 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Maths_EM.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Maths_EM.pdf',
    thumbnail: 'maths_2024',
    published: true,
    createdAt: '2024-03-20T10:00:00.000Z',
    updatedAt: '2024-03-20T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ts_2024_physics_tm',
    title: 'Telangana SSC Public Examination 2024 Physical Science (భౌతిక శాస్త్రం)',
    subject: 'Physical Science',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'Telugu',
    totalMarks: 40,
    duration: '1 Hour 30 Mins',
    fileSize: '1.8 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Physics_TM.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Physics_TM.pdf',
    thumbnail: 'physics_2024',
    published: true,
    createdAt: '2024-03-22T10:00:00.000Z',
    updatedAt: '2024-03-22T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ap_2024_social_em',
    title: 'Andhra Pradesh SSC Public Examination 2024 Social Studies Paper',
    subject: 'Social Studies',
    board: 'AP SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 100,
    duration: '3 Hours 15 Mins',
    fileSize: '2.1 MB',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Social_EM.pdf',
    questionPaperUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Social_EM.pdf',
    thumbnail: 'social_2024',
    published: true,
    createdAt: '2024-04-05T10:00:00.000Z',
    updatedAt: '2024-04-05T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ap_2024_english',
    title: 'AP SSC Public Examination 2024 General English Paper I & II',
    subject: 'General English',
    board: 'AP SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 100,
    duration: '3 Hours 15 Mins',
    fileSize: '1.9 MB',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_English.pdf',
    questionPaperUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_English.pdf',
    thumbnail: 'english_2024',
    published: true,
    createdAt: '2024-04-02T10:00:00.000Z',
    updatedAt: '2024-04-02T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ap_2024_telugu',
    title: 'AP SSC Board Examination 2024 First Language Telugu (ప్రథమ భాష తెలుగు)',
    subject: 'First Language Telugu',
    board: 'AP SSC',
    year: '2024',
    medium: 'Telugu',
    totalMarks: 100,
    duration: '3 Hours 15 Mins',
    fileSize: '2.3 MB',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Telugu.pdf',
    questionPaperUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Telugu.pdf',
    thumbnail: 'telugu_2024',
    published: true,
    createdAt: '2024-03-18T10:00:00.000Z',
    updatedAt: '2024-03-18T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ts_2024_bio_em',
    title: 'TS SSC Public Examination 2024 Biological Science Paper',
    subject: 'Biological Science',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 40,
    duration: '1 Hour 30 Mins',
    fileSize: '1.7 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_BioScience_EM.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_BioScience_EM.pdf',
    thumbnail: 'bioscience_2024',
    published: true,
    createdAt: '2024-03-24T10:00:00.000Z',
    updatedAt: '2024-03-24T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ts_2023_maths_em',
    title: 'TS SSC Public Examination 2023 Mathematics Paper',
    subject: 'Mathematics',
    board: 'Telangana SSC',
    year: '2023',
    medium: 'English',
    totalMarks: 80,
    duration: '3 Hours 15 Mins',
    fileSize: '2.3 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2023_Maths_EM.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2023_Maths_EM.pdf',
    thumbnail: 'maths_2023',
    published: true,
    createdAt: '2023-04-10T10:00:00.000Z',
    updatedAt: '2023-04-10T10:00:00.000Z',
    academicYear: '2022-2023',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ap_2023_physics_tm',
    title: 'AP SSC Public Examination 2023 Physical Science (భౌతిక శాస్త్రం)',
    subject: 'Physical Science',
    board: 'AP SSC',
    year: '2023',
    medium: 'Telugu',
    totalMarks: 50,
    duration: '2 Hours',
    fileSize: '1.8 MB',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2023_Physics_TM.pdf',
    questionPaperUrl: 'https://bse.ap.gov.in/pdf/SSC_2023_Physics_TM.pdf',
    thumbnail: 'physics_2023',
    published: true,
    createdAt: '2023-04-14T10:00:00.000Z',
    updatedAt: '2023-04-14T10:00:00.000Z',
    academicYear: '2022-2023',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ts_2022_social_tm',
    title: 'Telangana SSC Board Examination 2022 Social Studies (సాంఘిక శాస్త్రం)',
    subject: 'Social Studies',
    board: 'Telangana SSC',
    year: '2022',
    medium: 'Telugu',
    totalMarks: 80,
    duration: '3 Hours 15 Mins',
    fileSize: '2.2 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2022_Social_TM.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2022_Social_TM.pdf',
    thumbnail: 'social_2022',
    published: true,
    createdAt: '2022-05-20T10:00:00.000Z',
    updatedAt: '2022-05-20T10:00:00.000Z',
    academicYear: '2021-2022',
    paperType: 'Public Exam Main'
  },
  {
    id: 'pyq_ts_2024_urdu',
    title: 'TS SSC Public Examination 2024 Urdu First Language (زبان اول اردو)',
    subject: 'Urdu First Language',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'Urdu',
    totalMarks: 80,
    duration: '3 Hours 15 Mins',
    fileSize: '2.2 MB',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Urdu.pdf',
    questionPaperUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Urdu.pdf',
    thumbnail: 'urdu_2024',
    published: true,
    createdAt: '2024-03-20T10:00:00.000Z',
    updatedAt: '2024-03-20T10:00:00.000Z',
    academicYear: '2023-2024',
    paperType: 'Public Exam Main'
  }
];

export function subscribeToPreviousPapers(
  callback: (papers: PreviousPaperDoc[]) => void,
  onlyPublished: boolean = false
) {
  const processAndCallback = (docs: PreviousPaperDoc[]) => {
    let result = docs;
    if (onlyPublished) {
      result = result.filter(p => p.published !== false);
    }
    // ensure pdfUrl & questionPaperUrl consistency
    result = result.map(p => ({
      ...p,
      pdfUrl: p.pdfUrl || p.questionPaperUrl || '',
      questionPaperUrl: p.questionPaperUrl || p.pdfUrl || ''
    }));
    callback(result);
  };

  const seedIfEmpty = async (docs: PreviousPaperDoc[]) => {
    if (docs.length === 0) {
      try {
        for (const p of INITIAL_GENUINE_PREVIOUS_PAPERS) {
          const docRef = doc(db, 'previous_papers', p.id);
          await setDoc(docRef, p, { merge: true });
        }
      } catch (err) {
        console.warn('Seeding initial genuine previous papers notice:', err);
      }
      processAndCallback(INITIAL_GENUINE_PREVIOUS_PAPERS);
    } else {
      processAndCallback(docs);
    }
  };

  const unsub = onSnapshot(
    collection(db, 'previous_papers'),
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PreviousPaperDoc));
      seedIfEmpty(docs);
    },
    (err) => {
      console.warn('Firestore previous_papers snapshot notice:', err);
      processAndCallback(INITIAL_GENUINE_PREVIOUS_PAPERS);
    }
  );

  return unsub;
}

export async function addPreviousPaper(paperData: Partial<PreviousPaperDoc>): Promise<PreviousPaperDoc> {
  const paperId = paperData.id || `pyq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const pdfUrl = paperData.pdfUrl || paperData.questionPaperUrl || '';

  const fullPaper: PreviousPaperDoc = {
    id: paperId,
    title: paperData.title || `SSC Board Examination Paper ${paperData.year || '2024'}`,
    subject: paperData.subject || 'Mathematics',
    board: paperData.board || 'Telangana SSC',
    year: paperData.year || '2024',
    medium: paperData.medium || 'English',
    totalMarks: paperData.totalMarks || 100,
    duration: paperData.duration || paperData.examDuration || '3 Hours 15 Mins',
    fileSize: paperData.fileSize || '2.2 MB',
    pdfUrl: pdfUrl,
    questionPaperUrl: pdfUrl,
    thumbnail: paperData.thumbnail || 'default_paper',
    published: paperData.published !== undefined ? paperData.published : true,
    createdAt: paperData.createdAt || now,
    updatedAt: now,
    academicYear: paperData.academicYear || `${paperData.year || '2024'}-Board`,
    answerKeyUrl: paperData.answerKeyUrl || '',
    teacherSolution: paperData.teacherSolution || '',
    uploadedBy: paperData.uploadedBy || 'Administrator'
  };

  try {
    const docRef = doc(db, 'previous_papers', paperId);
    await setDoc(docRef, fullPaper, { merge: true });
  } catch (err) {
    console.warn('Firestore addPreviousPaper notice:', err);
  }

  return fullPaper;
}

export async function updatePreviousPaper(
  paperId: string, 
  updateData: Partial<PreviousPaperDoc>
): Promise<void> {
  try {
    const docRef = doc(db, 'previous_papers', paperId);
    const updatedPayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    if (updateData.pdfUrl) {
      updatedPayload.questionPaperUrl = updateData.pdfUrl;
    }
    await updateDoc(docRef, updatedPayload);
  } catch (err) {
    console.warn('Firestore updatePreviousPaper notice:', err);
  }
}

export async function togglePublishPreviousPaper(
  paperId: string, 
  publishedStatus: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'previous_papers', paperId);
    await updateDoc(docRef, {
      published: publishedStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore togglePublishPreviousPaper notice:', err);
  }
}

export async function deletePreviousPaper(paperId: string): Promise<void> {
  try {
    const docRef = doc(db, 'previous_papers', paperId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deletePreviousPaper notice:', err);
  }
}

// ==========================================
// VIDEO WATCH PROGRESS & STUDY PLANNER HELPERS
// ==========================================

export interface VideoWatchProgressDoc {
  videoId: string;
  userId: string;
  title: string;
  subject?: string;
  chapter?: string;
  lessonName?: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  bookmarked?: boolean;
  lastWatchedAt: string;
}

export async function saveVideoWatchProgress(
  userId: string,
  videoId: string,
  data: {
    title: string;
    subject?: string;
    chapter?: string;
    lessonName?: string;
    positionSeconds: number;
    durationSeconds: number;
    completed: boolean;
    bookmarked?: boolean;
  }
) {
  const path = `students/${userId}/videoProgress/${videoId}`;
  const now = new Date().toISOString();
  const docData: VideoWatchProgressDoc = {
    videoId,
    userId,
    title: data.title,
    subject: data.subject || 'General',
    chapter: data.chapter || '',
    lessonName: data.lessonName || '',
    positionSeconds: Math.round(data.positionSeconds || 0),
    durationSeconds: Math.round(data.durationSeconds || 0),
    completed: Boolean(data.completed),
    bookmarked: Boolean(data.bookmarked),
    lastWatchedAt: now
  };

  try {
    try {
      localStorage.setItem(`fs_vid_prog_${userId}_${videoId}`, JSON.stringify(docData));
    } catch (e) {}

    const docRef = doc(db, 'students', userId, 'videoProgress', videoId);
    await setDoc(docRef, docData, { merge: true });

    const rootRef = doc(db, 'video_progress', `${userId}_${videoId}`);
    await setDoc(rootRef, docData, { merge: true });

    if (data.completed) {
      const actRef = doc(collection(db, 'students', userId, 'activity'));
      await setDoc(actRef, {
        id: actRef.id,
        action: 'video_completed',
        title: `Watched Video: ${data.title}`,
        subject: data.subject || 'General',
        timestamp: 'Just now',
        xpGained: 25
      });
    }
  } catch (err) {
    console.warn(`Firestore saveVideoWatchProgress warning at ${path}:`, err);
  }
}

export function subscribeToVideoWatchProgress(
  userId: string,
  videoId: string,
  callback: (prog: VideoWatchProgressDoc | null) => void
) {
  if (!userId || !videoId) return () => {};
  return onSnapshot(
    doc(db, 'students', userId, 'videoProgress', videoId),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as VideoWatchProgressDoc);
      } else {
        try {
          const cached = localStorage.getItem(`fs_vid_prog_${userId}_${videoId}`);
          if (cached) callback(JSON.parse(cached));
          else callback(null);
        } catch (e) {
          callback(null);
        }
      }
    },
    (err) => {
      console.warn('Video progress snapshot warning:', err);
      try {
        const cached = localStorage.getItem(`fs_vid_prog_${userId}_${videoId}`);
        if (cached) callback(JSON.parse(cached));
        else callback(null);
      } catch (e) {
        callback(null);
      }
    }
  );
}

export function subscribeAllVideoProgress(
  userId: string,
  callback: (map: Record<string, VideoWatchProgressDoc>) => void
) {
  if (!userId) return () => {};
  return onSnapshot(
    collection(db, 'students', userId, 'videoProgress'),
    (snap) => {
      const map: Record<string, VideoWatchProgressDoc> = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data() as VideoWatchProgressDoc;
      });
      callback(map);
    },
    (err) => {
      console.warn('All video progress snapshot warning:', err);
      callback({});
    }
  );
}

export interface GenerateStudyPlanOptions {
  examDate?: string;
  dailyHours?: number;
  selectedSubjects?: string[];
  weakSubjects?: string[];
  classGrade?: string;
  goal?: 'balanced' | 'homework_focus' | 'exam_prep' | 'speed_catchup' | 'weak_focus' | 'exam_revision' | 'homework_first';
  feedbackNote?: string;
  preferredStartHour?: number;
}

export async function generateAndSaveStudyPlan(
  userId: string,
  options: GenerateStudyPlanOptions
): Promise<StudyPlanDoc[]> {
  const { 
    examDate = '2026-04-15', 
    dailyHours = 2, 
    selectedSubjects = [], 
    weakSubjects = [],
    classGrade,
    goal = 'balanced',
    preferredStartHour
  } = options;

  // 1. Determine active grade from options or student profile
  let targetGradeKey: OfficialClassGrade = 'Class 5';
  try {
    const userDocSnap = await getDoc(doc(db, 'users', userId));
    if (userDocSnap.exists()) {
      const uData = userDocSnap.data();
      const rawGrade = classGrade || uData.grade || uData.class || 'Class 5';
      targetGradeKey = normalizeGradeKey(rawGrade);
    } else if (classGrade) {
      targetGradeKey = normalizeGradeKey(classGrade);
    }
  } catch (err) {
    if (classGrade) targetGradeKey = normalizeGradeKey(classGrade);
  }

  // 2. Persist updated study preferences to student profile
  await updateStudentProfile(userId, {
    boardExamDate: examDate,
    dailyStudyHours: dailyHours,
    weakSubjects: weakSubjects.join(', '),
    grade: targetGradeKey
  });

  // 3. Fetch official syllabus for this grade
  const officialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[targetGradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'];
  const allSubjectNames = officialSubjects.map(s => s.name);

  // 4. Fetch real student learning progress from Firestore
  const completedLessonIdSet = new Set<string>();
  const completedChapterIdSet = new Set<string>();
  try {
    const lessonsProgRef = collection(db, 'progress', userId, 'lessons');
    const progSnap = await getDocs(lessonsProgRef);
    progSnap.forEach(d => {
      const data = d.data();
      if (data.completed) {
        completedLessonIdSet.add(d.id);
        if (data.chapterId) completedChapterIdSet.add(data.chapterId);
      }
    });

    // Also check student_progress collection
    const legacyProgRef = collection(db, 'students', userId, 'student_progress');
    const legacySnap = await getDocs(legacyProgRef);
    legacySnap.forEach(d => {
      const data = d.data();
      if (data.completed) {
        completedLessonIdSet.add(d.id);
      }
    });
  } catch (progErr) {
    console.warn("Notice: could not query completed lessons:", progErr);
  }

  // 5. Fetch real pending homework from Firestore
  interface PendingHomeworkInfo {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
  }
  const pendingHomeworkList: PendingHomeworkInfo[] = [];
  try {
    // Check student-specific homework
    const hwSnap = await getDocs(collection(db, 'students', userId, 'homework'));
    hwSnap.forEach(d => {
      const hw = d.data() as HomeworkDoc;
      if (hw.status !== 'submitted' && hw.status !== 'graded') {
        pendingHomeworkList.push({
          id: d.id,
          title: hw.title || 'Homework Assignment',
          subject: hw.subject || 'General Studies',
          dueDate: hw.dueDate || new Date().toISOString().split('T')[0]
        });
      }
    });

    // Also check teacher published homework for this class
    const globalHwSnap = await getDocs(collection(db, 'homeworks'));
    globalHwSnap.forEach(d => {
      const gHw = d.data();
      const hwClass = normalizeGradeKey(gHw.targetClass || gHw.class || gHw.classId);
      if (hwClass === targetGradeKey && !pendingHomeworkList.some(p => p.id === d.id)) {
        pendingHomeworkList.push({
          id: d.id,
          title: gHw.title || 'Homework Assignment',
          subject: gHw.subject || 'General Studies',
          dueDate: gHw.dueDate || new Date().toISOString().split('T')[0]
        });
      }
    });
  } catch (hwErr) {
    console.warn("Notice: could not query pending homework:", hwErr);
  }

  // 6. Fetch practice performance to detect real weak subjects & chapters
  const subjectScores: Record<string, { total: number; count: number }> = {};
  try {
    const practiceSnap = await getDocs(collection(db, 'students', userId, 'practice_attempts'));
    practiceSnap.forEach(d => {
      const att = d.data();
      const sName = att.subjectName || att.subjectId;
      if (sName && typeof att.percentage === 'number') {
        if (!subjectScores[sName]) subjectScores[sName] = { total: 0, count: 0 };
        subjectScores[sName].total += att.percentage;
        subjectScores[sName].count += 1;
      }
    });
  } catch (attErr) {
    console.warn("Notice: could not query practice attempts:", attErr);
  }

  // Auto-detect weak subjects if score average < 65%
  const computedWeakSubjects = new Set<string>(weakSubjects);
  Object.keys(subjectScores).forEach(sName => {
    const avg = subjectScores[sName].total / subjectScores[sName].count;
    if (avg < 65) {
      computedWeakSubjects.add(sName);
    }
  });

  // Filter or prioritize subjects
  const focusSubjects = (selectedSubjects && selectedSubjects.length > 0)
    ? officialSubjects.filter(s => selectedSubjects.includes(s.name) || selectedSubjects.includes(s.id))
    : officialSubjects;

  const activeSubjectList = focusSubjects.length > 0 ? focusSubjects : officialSubjects;

  // 7. Calculate time slots
  const startHour = preferredStartHour !== undefined 
    ? preferredStartHour 
    : (dailyHours >= 3 ? 16 : 17); // 4:00 PM or 5:00 PM
  let currentOffsetMins = 0;

  const getTimeSlotStr = (offsetMins: number) => {
    const total = startHour * 60 + offsetMins;
    const h24 = Math.floor(total / 60) % 24;
    const m = total % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${h12}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  };

  // Determine target tasks count based on daily study hours
  // 1 hour: 2 tasks (30m each)
  // 2 hours: 3-4 tasks
  // 3 hours: 4-5 tasks
  // 4+ hours: 5-7 tasks
  const maxTasksCount = Math.min(8, Math.max(2, Math.round(dailyHours * 1.5)));
  const generatedPlans: Omit<StudyPlanDoc, 'id' | 'createdAt'>[] = [];

  // TASK 1: Real Pending Homework (if exists)
  if (pendingHomeworkList.length > 0 && (goal === 'homework_focus' || goal === 'balanced' || goal === 'speed_catchup')) {
    const topHw = pendingHomeworkList[0];
    const estMins = 30;
    const timeSlot = getTimeSlotStr(currentOffsetMins);

    generatedPlans.push({
      title: `Homework: ${topHw.title}`,
      subject: topHw.subject,
      classGrade: targetGradeKey,
      timeSlot,
      estMinutes: estMins,
      completed: false,
      dueDate: topHw.dueDate,
      type: 'Homework',
      priority: 'High',
      reasoning: `Teacher Assignment: Pending official ${targetGradeKey} homework due on ${topHw.dueDate}`,
      actionType: 'homework',
      status: 'active'
    });
    currentOffsetMins += estMins + 10;
  }

  // Helper to pick next pending chapter & lesson for a given official subject
  const getNextPendingLessonForSubject = (subj: typeof officialSubjects[0]) => {
    for (const ch of subj.chapters) {
      for (const les of ch.lessons) {
        if (!completedLessonIdSet.has(les.id)) {
          return { chapter: ch, lesson: les };
        }
      }
    }
    // If all completed or none found, return first chapter for revision
    const fallbackCh = subj.chapters[0];
    const fallbackLes = fallbackCh?.lessons[0];
    return { chapter: fallbackCh, lesson: fallbackLes };
  };

  // Build weighted subject rotation (weak subjects get priority)
  const prioritizedSubjects: typeof officialSubjects = [];
  // First, add weak subjects
  activeSubjectList.forEach(s => {
    if (computedWeakSubjects.has(s.name) || computedWeakSubjects.has(s.id)) {
      prioritizedSubjects.push(s);
    }
  });
  // Then add remaining subjects
  activeSubjectList.forEach(s => {
    if (!prioritizedSubjects.some(p => p.id === s.id)) {
      prioritizedSubjects.push(s);
    }
  });

  // TASK 2..N: Core Lessons, Practice Drills, Language Fluency & Mock Assessments
  let subjIndex = 0;
  while (generatedPlans.length < maxTasksCount && subjIndex < prioritizedSubjects.length * 2) {
    const currentSubj = prioritizedSubjects[subjIndex % prioritizedSubjects.length];
    const isWeak = computedWeakSubjects.has(currentSubj.name) || computedWeakSubjects.has(currentSubj.id);
    const nextItem = getNextPendingLessonForSubject(currentSubj);

    if (nextItem.chapter) {
      const chTitle = nextItem.chapter.title;
      const lesTitle = nextItem.lesson ? nextItem.lesson.title : `Key Concepts of ${chTitle}`;
      const estMins = isWeak ? 40 : 30;
      const timeSlot = getTimeSlotStr(currentOffsetMins);

      // Determine task type based on index and subject
      let taskType: string = 'Core Concept';
      let actionType: StudyPlanDoc['actionType'] = 'lesson';
      let taskTitle = `${currentSubj.name}: ${chTitle} - ${lesTitle}`;
      let reasoning = `Syllabus Progression: Next scheduled lesson in ${targetGradeKey} ${currentSubj.name}`;

      if (isWeak && generatedPlans.length % 2 === 1) {
        taskType = 'Practice Drill';
        actionType = 'practice';
        taskTitle = `${currentSubj.name} Practice Drill: ${chTitle}`;
        reasoning = `Targeted Booster: Interactive practice drill to master concepts in identified weak subject (${currentSubj.name})`;
      } else if (generatedPlans.length === maxTasksCount - 1 && dailyHours >= 3) {
        taskType = 'Mock Test';
        actionType = 'mock_test';
        taskTitle = `${targetGradeKey} Mock Test Prep: ${currentSubj.name} (${chTitle})`;
        reasoning = `Exam Readiness: Timed unit assessment to evaluate chapter understanding and problem-solving speed`;
      } else if (currentSubj?.name && (currentSubj.name.includes('Telugu') || currentSubj.name.includes('English') || currentSubj.name.includes('Hindi'))) {
        taskType = 'Reading';
        actionType = 'lesson';
        taskTitle = `${currentSubj.name}: Reading & Vocabulary - ${chTitle}`;
        reasoning = `Language Fluency: Daily reading comprehension, vocabulary, and grammar practice`;
      }

      generatedPlans.push({
        title: taskTitle,
        subject: currentSubj.name,
        subjectId: currentSubj.id,
        chapterId: nextItem.chapter.id,
        chapterName: chTitle,
        lessonId: nextItem.lesson?.id,
        lessonName: nextItem.lesson?.title,
        classGrade: targetGradeKey,
        timeSlot,
        estMinutes: estMins,
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        type: taskType,
        priority: isWeak ? 'High' : 'Medium',
        reasoning,
        actionType,
        status: 'active'
      });

      currentOffsetMins += estMins + 10;
    }

    subjIndex++;
  }

  // 8. Replace existing study plans for student in Firestore
  const plansCollRef = collection(db, 'students', userId, 'studyPlans');
  
  // Clear previous plans for clean synchronization
  try {
    const existingSnap = await getDocs(plansCollRef);
    for (const docSnap of existingSnap.docs) {
      await deleteDoc(docSnap.ref);
    }
  } catch (delErr) {
    console.warn("Notice: clearing old study plans:", delErr);
  }

  // 9. Save new generated study plans to Firestore
  const finalTasks: StudyPlanDoc[] = [];
  for (const plan of generatedPlans) {
    const newRef = doc(plansCollRef);
    const docItem: StudyPlanDoc = {
      ...plan,
      id: newRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newRef, docItem);
    finalTasks.push(docItem);
  }

  // 10. Record activity in student activity log
  try {
    const actRef = doc(collection(db, 'students', userId, 'activity'));
    await setDoc(actRef, {
      id: actRef.id,
      action: 'study_plan_generated',
      title: `Generated Personalized ${dailyHours}-Hour ${targetGradeKey} Study Schedule (${finalTasks.length} Tasks)`,
      subject: 'AI Study Planner',
      timestamp: 'Just now',
      xpGained: 30
    });
  } catch (actErr) {
    console.warn("Notice: could not log activity:", actErr);
  }

  return finalTasks;
}

// ====================================================================
// REAL STUDENT TRACKING (Teacher Portal)
// ====================================================================

export interface RealStudentProfile {
  uid: string;
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'student';
  board: string;
  class: number | string | null;
  grade: string | null;
  preferredLanguage?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  lastLogin?: string;
  lastLogout?: string;
  status?: 'Online' | 'Offline' | 'Idle';
  isRecentlyActive?: boolean;
  device?: string;
  lastActiveTime?: string;
  lessonsCompleted?: number;
  videosWatched?: number;
  practiceCompleted?: number;
  mockTestsCompleted?: number;
  homeworkSubmitted?: number;
  quizScoreAvg?: number;
  studyTime?: string;
  recentActivity?: string;
  currentActivity?: string;
  currentSubject?: string;
  currentChapter?: string;
  currentLesson?: string;
  currentVideo?: string;
  homeworkStatus?: string;
  mockTestStatus?: string;
  aiTutorStatus?: 'Active' | 'Inactive';
  studyTimeTodayMinutes?: number;
  progressPercentage?: number;
  averageMockTestScore?: number;
  doubtsAsked?: number;
  xp?: number;
  coins?: number;
  phone?: string;
  rollNumber?: string;
  schoolName?: string;
  medium?: string;
  isDemo?: boolean;
  demoStudent?: boolean;
  hasDemoActivity?: boolean;
  demoActivitySource?: string | null;
}

export type RealStudentRecord = RealStudentProfile;

export function extractClassNumber(val: any): number | null {
  if (typeof val === 'number') return val;
  if (!val) return null;
  const str = String(val).trim();
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function isMatchingBoard(board: string | undefined, targetBoard: string = 'AP_SSC'): boolean {
  if (!board) return true;
  const b = board.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const t = targetBoard.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (b.includes(t) || t.includes(b)) return true;
  if (b.includes('AP') && (b.includes('SSC') || b.includes('SCERT') || b.includes('BOARD') || b.includes('STATE'))) return true;
  return false;
}

function formatRelativeTime(isoString: string): string {
  if (!isoString) return 'Never';
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (isNaN(diffMs)) return 'Never';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Updates lastLoginAt in Firestore when a real student successfully logs in.
 */
export async function recordStudentLogin(
  uid: string,
  additionalData?: Partial<UserAuthProfile>
): Promise<void> {
  if (!uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      uid,
      id: uid,
      role: 'student',
      lastLoginAt: nowIso,
      lastActiveAt: nowIso,
      lastLogin: nowIso,
      lastActiveTime: 'Just now',
      status: 'Online',
      updatedAt: nowIso
    };

    if (additionalData) {
      if (additionalData.name) updatePayload.name = additionalData.name;
      if (additionalData.email) updatePayload.email = additionalData.email;
      if (additionalData.board) updatePayload.board = additionalData.board;
      if (additionalData.preferredLanguage || additionalData.preferredLang) {
        updatePayload.preferredLanguage = additionalData.preferredLanguage || additionalData.preferredLang;
      }
      const rawClass = additionalData.class || additionalData.grade;
      const classNum = extractClassNumber(rawClass);
      if (classNum) {
        updatePayload.class = classNum;
        updatePayload.grade = `Class ${classNum}`;
      }
    }

    await setDoc(userDocRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn("Could not record student login in Firestore:", err);
  }
}

/**
 * Updates lastActiveAt and current activity in Firestore when a student performs a learning action.
 */
export async function recordStudentActivity(
  uid: string,
  activityDescription: string
): Promise<void> {
  if (!uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    const nowIso = new Date().toISOString();
    await updateDoc(userDocRef, {
      lastActiveAt: nowIso,
      lastActiveTime: 'Just now',
      currentActivity: activityDescription,
      status: 'Online',
      updatedAt: nowIso
    });
  } catch (err) {
    console.warn("Could not record student activity:", err);
  }
}

/**
 * Queries Firestore for real student profiles where:
 * role == "student", class == targetClass, and board == "AP_SSC"
 * Returns real student profiles and count.
 */
export async function queryRealStudentsByClassAndBoard(
  targetClass: number | string,
  targetBoard: string = 'AP_SSC'
): Promise<RealStudentProfile[]> {
  try {
    const targetNum = extractClassNumber(targetClass);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    const results: RealStudentProfile[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const studentClassNum = extractClassNumber(data.class || data.grade);
      const matchesClass = targetNum ? studentClassNum === targetNum : true;
      const matchesBoard = isMatchingBoard(data.board, targetBoard);

      if (matchesClass && matchesBoard) {
        const lastActiveIso = data.lastActiveAt || data.lastActiveTime || '';
        const lastLoginIso = data.lastLoginAt || data.lastLogin || '';
        const activeTime = lastActiveIso ? new Date(lastActiveIso).getTime() : (lastLoginIso ? new Date(lastLoginIso).getTime() : 0);
        const minutesAgo = activeTime ? (Date.now() - activeTime) / (1000 * 60) : 999999;
        const realStatus: 'Online' | 'Offline' | 'Idle' = 
          minutesAgo <= 15 ? 'Online' : (minutesAgo <= 60 ? 'Idle' : 'Offline');

        results.push({
          uid: data.uid || docSnap.id,
          id: docSnap.id,
          name: data.name || data.displayName || data.email?.split('@')[0] || 'Student',
          email: data.email || 'student@school.gov.in',
          photoURL: data.photoURL || '',
          role: 'student',
          board: data.board || 'AP_SSC',
          class: studentClassNum || (targetNum || 5),
          grade: `Class ${studentClassNum || targetNum || 5}`,
          preferredLanguage: data.preferredLanguage || data.preferredLang || 'te',
          phone: data.phone || data.phoneNumber || '',
          rollNumber: data.rollNumber || `STU-${docSnap.id.substring(0, 4).toUpperCase()}`,
          schoolName: data.schoolName || 'Government High School',
          medium: data.medium || 'Telugu Medium',
          lastLoginAt: lastLoginIso,
          lastActiveAt: lastActiveIso,
          lastLogin: lastLoginIso,
          lastLogout: data.lastLogout || '',
          status: realStatus,
          device: data.device || 'Web Browser',
          lastActiveTime: lastActiveIso ? formatRelativeTime(lastActiveIso) : 'Never',
          lessonsCompleted: data.lessonsCompleted || 0,
          videosWatched: data.videosWatched || 0,
          practiceCompleted: data.practiceCompleted || 0,
          mockTestsCompleted: data.mockTestsCompleted || 0,
          homeworkSubmitted: data.homeworkSubmitted || 0,
          quizScoreAvg: data.quizScoreAvg ?? Math.round(data.averageMockTestScore || data.progressPercentage || 0),
          studyTime: data.studyTime || (data.studyTimeTodayMinutes ? `${data.studyTimeTodayMinutes} mins` : '0 hrs'),
          recentActivity: data.currentActivity || data.recentActivity || 'No recent activity',
          currentActivity: data.currentActivity || '',
          currentSubject: data.currentSubject || '',
          currentChapter: data.currentChapter || '',
          currentLesson: data.currentLesson || '',
          currentVideo: data.currentVideo || '',
          homeworkStatus: data.homeworkStatus || 'None',
          mockTestStatus: data.mockTestStatus || 'None',
          aiTutorStatus: realStatus === 'Online' && data.aiTutorStatus === 'Active' ? 'Active' : 'Inactive',
          studyTimeTodayMinutes: data.studyTimeTodayMinutes || 0,
          progressPercentage: data.progressPercentage || 0,
          averageMockTestScore: data.averageMockTestScore || 0,
          xp: data.xp ?? (data.lessonsCompleted ? data.lessonsCompleted * 50 : 0),
          coins: data.coins ?? 0,
          createdAt: data.createdAt || '',
          isDemo: Boolean(data.isDemo || data.demoStudent || docSnap.id.startsWith('demo_student_')),
          demoStudent: Boolean(data.isDemo || data.demoStudent || docSnap.id.startsWith('demo_student_'))
        });
      }
    });

    return results;
  } catch (err) {
    console.warn("Error querying real students by class and board:", err);
    return [];
  }
}

/**
 * Real-time Firestore listener for all enrolled students.
 * Updates instantly when any student registers, logs in, or engages in learning.
 */
export function subscribeToRealStudents(
  callback: (students: RealStudentProfile[]) => void,
  filterGrade?: string,
  authorizedClasses?: string[]
): () => void {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const list: RealStudentProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.role === 'student' || (!data.role && data.email && !data.email.includes('teacher') && !data.email.includes('admin'))) {
        const rawGrade = data.grade || (data.class ? (typeof data.class === 'number' || !String(data.class).toLowerCase().includes('class') ? `Class ${data.class}` : String(data.class)) : '');
        const studentGrade = rawGrade ? normalizeGradeKey(rawGrade) : '';
        const studentClassNum = rawGrade ? extractClassNumber(rawGrade) : null;
        const normFilter = filterGrade && filterGrade !== 'All' ? normalizeGradeKey(filterGrade) : null;
        const filterNum = filterGrade && filterGrade !== 'All' ? extractClassNumber(filterGrade) : null;

        // Check if teacher is authorized for this class (if restrictions apply)
        if (authorizedClasses && authorizedClasses.length > 0) {
          const isAuthorized = authorizedClasses.some(ac => {
            const acNum = extractClassNumber(ac);
            return acNum === studentClassNum || normalizeGradeKey(ac) === studentGrade;
          });
          if (!isAuthorized) return;
        }

        const matchesClassFilter = !normFilter || 
          studentGrade === normFilter || 
          rawGrade === filterGrade || 
          (filterNum !== null && studentClassNum === filterNum);

        if (matchesClassFilter) {
          const lastActiveIso = data.lastActiveAt || data.lastActiveTime || '';
          const lastLoginIso = data.lastLoginAt || data.lastLogin || '';
          const activeTime = lastActiveIso ? new Date(lastActiveIso).getTime() : (lastLoginIso ? new Date(lastLoginIso).getTime() : 0);
          const minutesAgo = activeTime ? (Date.now() - activeTime) / (1000 * 60) : 999999;
          const isRecentlyActive = minutesAgo <= 15;
          const realStatus: 'Online' | 'Offline' | 'Idle' = 
            isRecentlyActive ? 'Online' : (minutesAgo <= 60 ? 'Idle' : 'Offline');

          list.push({
            uid: data.uid || docSnap.id,
            id: docSnap.id,
            name: data.name || data.displayName || data.email?.split('@')[0] || 'Student',
            email: data.email || 'student@school.gov.in',
            photoURL: data.photoURL || '',
            role: 'student',
            board: data.board || 'AP_SSC',
            class: studentClassNum !== null ? studentClassNum : null,
            grade: studentClassNum !== null ? `Class ${studentClassNum}` : (studentGrade || null),
            preferredLanguage: data.preferredLanguage || data.preferredLang || 'te',
            phone: data.phone || data.phoneNumber || '',
            rollNumber: data.rollNumber || `STU-${docSnap.id.substring(0, 4).toUpperCase()}`,
            schoolName: data.schoolName || 'Government High School',
            medium: data.medium || 'Telugu Medium',
            lastLoginAt: lastLoginIso,
            lastActiveAt: lastActiveIso,
            lastLogin: lastLoginIso,
            lastLogout: data.lastLogout || '',
            status: realStatus,
            isRecentlyActive,
            device: data.device || 'Web Browser',
            lastActiveTime: lastActiveIso ? formatRelativeTime(lastActiveIso) : 'Never',
            lessonsCompleted: data.lessonsCompleted || 0,
            videosWatched: data.videosWatched || 0,
            practiceCompleted: data.practiceCompleted || 0,
            mockTestsCompleted: data.mockTestsCompleted || 0,
            homeworkSubmitted: data.homeworkSubmitted || 0,
            quizScoreAvg: data.quizScoreAvg ?? Math.round(data.averageMockTestScore || data.progressPercentage || 0),
            studyTime: data.studyTime || (data.studyTimeTodayMinutes ? `${data.studyTimeTodayMinutes} mins` : '0 hrs'),
            recentActivity: data.currentActivity || data.recentActivity || 'No recent activity',
            currentActivity: data.currentActivity || '',
            currentSubject: data.currentSubject || '',
            currentChapter: data.currentChapter || '',
            currentLesson: data.currentLesson || '',
            currentVideo: data.currentVideo || '',
            homeworkStatus: data.homeworkStatus || 'None',
            mockTestStatus: data.mockTestStatus || 'None',
            aiTutorStatus: realStatus === 'Online' && data.aiTutorStatus === 'Active' ? 'Active' : 'Inactive',
            studyTimeTodayMinutes: data.studyTimeTodayMinutes || 0,
            progressPercentage: data.progressPercentage || 0,
            averageMockTestScore: data.averageMockTestScore || 0,
            xp: data.xp ?? (data.lessonsCompleted ? data.lessonsCompleted * 50 : 0),
            coins: data.coins ?? 0,
            createdAt: data.createdAt || '',
            isDemo: Boolean(data.isDemo || data.demoStudent || docSnap.id.startsWith('demo_student_')),
            demoStudent: Boolean(data.isDemo || data.demoStudent || docSnap.id.startsWith('demo_student_'))
          });
        }
      }
    });
    callback(list);
  }, (err) => {
    console.warn("Firestore users collection snapshot warning:", err);
    callback([]);
  });
}

/**
 * Create a real test student profile in Firestore to verify teacher portal analytics and class counts.
 * Uses Firestore users collection as source of truth.
 */
export async function createRealTestStudent(params: {
  name: string;
  email?: string;
  class: number | string; // 5, 6, 7, 8, 9, 10
  board?: string; // "AP_SSC"
  preferredLanguage?: string;
  isOnlineNow?: boolean;
}): Promise<string> {
  const classNum = typeof params.class === 'number' ? params.class : (parseInt(String(params.class).replace(/\D/g, ''), 10) || 5);
  const studentUid = `test_stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();
  const cleanName = params.name.trim();
  const email = params.email || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now().toString().slice(-4)}@student.apssc.edu.in`;
  const board = params.board || 'AP_SSC';
  const preferredLanguage = params.preferredLanguage || 'te';

  const studentDocRef = doc(db, 'users', studentUid);
  const studentData = {
    uid: studentUid,
    name: cleanName,
    displayName: cleanName,
    email,
    role: 'student',
    board,
    class: classNum,
    grade: `Class ${classNum}`,
    preferredLanguage,
    createdAt: nowIso,
    lastLoginAt: nowIso,
    lastActiveAt: nowIso,
    lastLogin: nowIso,
    status: params.isOnlineNow !== false ? 'Online' : 'Offline',
    schoolName: 'Zilla Parishad High School (AP State Board)',
    medium: preferredLanguage === 'te' ? 'Telugu Medium' : 'English Medium',
    rollNumber: `AP-${classNum}-${Math.floor(1000 + Math.random() * 9000)}`,
    progressPercentage: Math.floor(Math.random() * 40) + 45,
    averageMockTestScore: Math.floor(Math.random() * 30) + 65,
    quizScoreAvg: Math.floor(Math.random() * 30) + 65,
    currentActivity: `Studying Class ${classNum} Physical Science Chapter 1`,
    lessonsCompleted: Math.floor(Math.random() * 6) + 2,
    videosWatched: Math.floor(Math.random() * 4) + 1,
    practiceCompleted: Math.floor(Math.random() * 10) + 3,
    mockTestsCompleted: Math.floor(Math.random() * 3) + 1,
    homeworkSubmitted: Math.floor(Math.random() * 4) + 1,
    doubtsAsked: Math.floor(Math.random() * 2) + 1,
    isTestUser: true
  };

  await setDoc(studentDocRef, studentData, { merge: true });
  return studentUid;
}

/**
 * Delete a student profile from Firestore
 */
export async function deleteRealStudent(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Error deleting student from Firestore:', err);
  }
}

/**
 * Simulates a student login in real Firestore, updating lastLoginAt and lastActiveAt.
 */
export async function simulateRealStudentLogin(uid: string): Promise<void> {
  if (!uid) return;
  const userDocRef = doc(db, 'users', uid);
  const nowIso = new Date().toISOString();
  await updateDoc(userDocRef, {
    lastLoginAt: nowIso,
    lastActiveAt: nowIso,
    lastLogin: nowIso,
    lastActiveTime: 'Just now',
    status: 'Online',
    updatedAt: nowIso
  });
}

/**
 * Simulates a learning activity in real Firestore (e.g. Chapter Opened, Mock Test Taken).
 */
export async function simulateRealStudentActivity(
  uid: string,
  activityDescription: string
): Promise<void> {
  if (!uid) return;
  const userDocRef = doc(db, 'users', uid);
  const nowIso = new Date().toISOString();
  await updateDoc(userDocRef, {
    lastActiveAt: nowIso,
    lastActiveTime: 'Just now',
    currentActivity: activityDescription,
    recentActivity: activityDescription,
    status: 'Online',
    updatedAt: nowIso
  });
}

/**
 * Updates a teacher's assigned classes in Firestore.
 */
export async function updateTeacherAssignedClasses(
  teacherUid: string,
  assignedClasses: string[]
): Promise<void> {
  if (!teacherUid) return;
  const userDocRef = doc(db, 'users', teacherUid);
  await updateDoc(userDocRef, {
    assignedClasses,
    updatedAt: new Date().toISOString()
  });
}

// ====================================================================
// TEACHER & SCHOOL ANNOUNCEMENTS (PRODUCTION-READY REAL-TIME SYSTEM)
// ====================================================================

export type AnnouncementType =
  | 'General'
  | 'Academic'
  | 'Homework'
  | 'Exam'
  | 'Event'
  | 'Important'
  | 'Holiday'
  | 'Notice';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';

export interface AnnouncementDoc {
  id: string;
  title: string;
  message: string;
  content?: string; // fallback alias for message
  announcement?: string; // legacy fallback alias
  type: AnnouncementType;
  targetClass: string; // 'All Students' | 'Class 5' | 'Class 6' | ... | 'All'
  targetSection: string; // 'All Sections' | '5A' | '5B' | '6A' | ... | 'All' | 'A' | 'B'
  targetAudience?: 'All' | 'Students' | 'Parents' | 'Teachers';
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  createdBy: string;
  authorName: string;
  authorRole: 'teacher' | 'admin' | 'principal' | string;
  publishDate?: string;
  scheduledFor?: string | null;
  expiresAt?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  classId?: string; // legacy alias
}

export type AnnouncementItem = AnnouncementDoc;

export interface AnnouncementReadDoc {
  id: string; // `${studentId}_${announcementId}`
  studentId: string;
  announcementId: string;
  readAt: string;
}

/**
 * Normalizes class strings (e.g. "Class 5", "5", "5th Grade" -> "class 5")
 */
function normalizeClassGrade(cls?: string): string {
  if (!cls) return '';
  const match = cls.match(/\d+/);
  return match ? `class ${match[0]}` : cls.trim().toLowerCase();
}

/**
 * Matches target class and target section against student credentials
 */
export function isAnnouncementTargetedToStudent(
  announcement: Partial<AnnouncementDoc>,
  studentClassGrade?: string,
  studentSection?: string
): boolean {
  // 1. Check Class Match
  const targetCls = (announcement.targetClass || announcement.classId || '').trim();
  const isTargetAllClass =
    !targetCls ||
    targetCls.toLowerCase() === 'all' ||
    targetCls.toLowerCase() === 'all students' ||
    targetCls.toLowerCase() === 'all classes';

  if (!isTargetAllClass && studentClassGrade) {
    const normTarget = normalizeClassGrade(targetCls);
    const normStudent = normalizeClassGrade(studentClassGrade);
    if (normTarget !== normStudent) {
      return false;
    }
  }

  // 2. Check Section Match
  const targetSec = (announcement.targetSection || '').trim();
  const isTargetAllSection =
    !targetSec ||
    targetSec.toLowerCase() === 'all' ||
    targetSec.toLowerCase() === 'all sections';

  if (!isTargetAllSection && studentSection) {
    const studentSecClean = studentSection.replace(/class\s*\d+/i, '').trim().toLowerCase();
    const targetSecClean = targetSec.replace(/class\s*\d+/i, '').trim().toLowerCase();
    // e.g. "5A" or "A"
    if (
      targetSecClean !== studentSecClean &&
      targetSec.toLowerCase() !== `${studentClassGrade || ''}${studentSection}`.replace(/\s+/g, '').toLowerCase() &&
      targetSec.toLowerCase() !== studentSection.toLowerCase()
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Real-time subscription to active, published, targeted announcements for a student.
 * Integrates per-student read status via `announcement_reads` collection.
 */
export function subscribeToStudentAnnouncements(
  studentClassGrade: string,
  studentSection: string | undefined,
  studentId: string,
  callback: (announcements: AnnouncementDoc[], unreadCount: number, readIds: Set<string>) => void
): () => void {
  const announcementsRef = collection(db, 'announcements');
  const readsRef = collection(db, 'announcement_reads');

  let allAnnouncements: AnnouncementDoc[] = [];
  let readIdsSet = new Set<string>();

  const recomputeAndEmit = () => {
    const now = Date.now();

    // Filter valid published announcements for this student
    const validAnnouncements = allAnnouncements.filter((item) => {
      // 1. Must be PUBLISHED (strictly no drafts or deleted/archived)
      const status = item.status || 'PUBLISHED';
      if (status !== 'PUBLISHED') return false;

      // 2. Expiry check
      if (item.expiresAt) {
        const expTime = new Date(item.expiresAt).getTime();
        if (!isNaN(expTime) && expTime <= now) {
          return false;
        }
      }

      // 3. Scheduled check (not visible before scheduled time)
      const scheduledTime = item.scheduledFor || item.publishDate;
      if (scheduledTime) {
        const schedTime = new Date(scheduledTime).getTime();
        if (!isNaN(schedTime) && schedTime > now) {
          return false;
        }
      }

      // 4. Target Class & Section match
      return isAnnouncementTargetedToStudent(item, studentClassGrade, studentSection);
    });

    // Sort: Urgent first, then Important, then Normal, then by publishedAt/createdAt descending
    validAnnouncements.sort((a, b) => {
      const priorityOrder: Record<string, number> = { Urgent: 3, Important: 2, Normal: 1 };
      const prioDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      if (prioDiff !== 0) return prioDiff;

      const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // Compute true unread count
    const unreadCount = validAnnouncements.filter((a) => !readIdsSet.has(a.id)).length;

    callback(validAnnouncements, unreadCount, readIdsSet);
  };

  // 1. Subscribe to announcements collection
  const unsubAnnouncements = onSnapshot(
    query(announcementsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const list: AnnouncementDoc[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Announcement',
          message: d.message || d.content || d.announcement || '',
          content: d.content || d.message || d.announcement || '',
          announcement: d.announcement || d.message || d.content || '',
          type: (d.type as AnnouncementType) || 'General',
          targetClass: d.targetClass || d.classId || 'All Students',
          targetSection: d.targetSection || 'All Sections',
          targetAudience: d.targetAudience || 'All',
          priority: (d.priority as AnnouncementPriority) || 'Normal',
          status: (d.status as AnnouncementStatus) || 'PUBLISHED',
          createdBy: d.createdBy || '',
          authorName: d.authorName || 'Teacher',
          authorRole: d.authorRole || 'teacher',
          publishDate: d.publishDate || d.publishedAt || d.createdAt,
          scheduledFor: d.scheduledFor || null,
          expiresAt: d.expiresAt || null,
          attachmentUrl: d.attachmentUrl || null,
          attachmentName: d.attachmentName || null,
          createdAt: d.createdAt || new Date().toISOString(),
          publishedAt: d.publishedAt || d.createdAt || null,
          updatedAt: d.updatedAt || null,
          classId: d.targetClass || d.classId || 'All Students'
        });
      });
      allAnnouncements = list;
      recomputeAndEmit();
    },
    (err) => {
      console.warn("Firestore student announcements snapshot warning:", err);
      callback([], 0, new Set());
    }
  );

  // 2. Subscribe to this student's read receipts
  let unsubReads: (() => void) | null = null;
  if (studentId) {
    try {
      const qReads = query(readsRef, where('studentId', '==', studentId));
      unsubReads = onSnapshot(
        qReads,
        (snap) => {
          const set = new Set<string>();
          snap.forEach((docSnap) => {
            const data = docSnap.data() as AnnouncementReadDoc;
            if (data.announcementId) {
              set.add(data.announcementId);
            }
          });
          readIdsSet = set;
          recomputeAndEmit();
        },
        (err) => {
          console.warn("Firestore student announcement reads snapshot warning:", err);
        }
      );
    } catch (readErr) {
      console.warn("Could not attach reads query listener:", readErr);
    }
  }

  return () => {
    unsubAnnouncements();
    if (unsubReads) unsubReads();
  };
}

/**
 * Marks an announcement as read for a specific student in Firestore
 */
export async function markAnnouncementAsRead(
  studentId: string,
  announcementId: string
): Promise<void> {
  if (!studentId || !announcementId) return;
  try {
    const readDocId = `${studentId}_${announcementId}`;
    const readRef = doc(db, 'announcement_reads', readDocId);
    await setDoc(
      readRef,
      {
        id: readDocId,
        studentId,
        announcementId,
        readAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'announcement_reads');
  }
}

/**
 * Teacher management subscription: Loads all announcements (Drafts, Published, Expired, Archived)
 */
export function subscribeToTeacherAnnouncements(
  callback: (announcements: AnnouncementDoc[]) => void,
  _teacherUid?: string
): () => void {
  const announcementsRef = collection(db, 'announcements');
  return onSnapshot(
    query(announcementsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const list: AnnouncementDoc[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Untitled Announcement',
          message: d.message || d.content || d.announcement || '',
          content: d.content || d.message || d.announcement || '',
          announcement: d.announcement || d.message || d.content || '',
          type: (d.type as AnnouncementType) || 'General',
          targetClass: d.targetClass || d.classId || 'All Students',
          targetSection: d.targetSection || 'All Sections',
          targetAudience: d.targetAudience || 'All',
          priority: (d.priority as AnnouncementPriority) || 'Normal',
          status: (d.status as AnnouncementStatus) || 'PUBLISHED',
          createdBy: d.createdBy || '',
          authorName: d.authorName || 'Teacher',
          authorRole: d.authorRole || 'teacher',
          publishDate: d.publishDate || d.publishedAt || d.createdAt,
          scheduledFor: d.scheduledFor || null,
          expiresAt: d.expiresAt || null,
          attachmentUrl: d.attachmentUrl || null,
          attachmentName: d.attachmentName || null,
          createdAt: d.createdAt || new Date().toISOString(),
          publishedAt: d.publishedAt || d.createdAt || null,
          updatedAt: d.updatedAt || null,
          classId: d.targetClass || d.classId || 'All Students'
        });
      });
      callback(list);
    },
    (err) => {
      console.warn("Firestore teacher announcements snapshot warning:", err);
      callback([]);
    }
  );
}

/**
 * Create or Update Teacher Announcement (Draft or Published)
 */
export async function saveTeacherAnnouncement(
  announcementData: {
    id?: string;
    title: string;
    message: string;
    type: AnnouncementType;
    targetClass: string;
    targetSection?: string;
    targetAudience?: 'All' | 'Students' | 'Parents' | 'Teachers';
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
    createdBy?: string;
    authorName?: string;
    authorRole?: 'teacher' | 'admin' | 'principal';
    scheduledFor?: string | null;
    expiresAt?: string | null;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
  }
): Promise<string> {
  try {
    const isNew = !announcementData.id;
    const docRef = isNew
      ? doc(collection(db, 'announcements'))
      : doc(db, 'announcements', announcementData.id!);

    const now = new Date().toISOString();
    const docId = docRef.id;

    const payload: AnnouncementDoc = {
      id: docId,
      title: announcementData.title.trim(),
      message: announcementData.message.trim(),
      content: announcementData.message.trim(),
      announcement: announcementData.message.trim(),
      type: announcementData.type,
      targetClass: announcementData.targetClass || 'All Students',
      targetSection: announcementData.targetSection || 'All Sections',
      targetAudience: announcementData.targetAudience || 'All',
      priority: announcementData.priority,
      status: announcementData.status,
      createdBy: announcementData.createdBy || 'teacher_uid',
      authorName: announcementData.authorName || 'Class Teacher',
      authorRole: announcementData.authorRole || 'teacher',
      scheduledFor: announcementData.scheduledFor || null,
      expiresAt: announcementData.expiresAt || null,
      attachmentUrl: announcementData.attachmentUrl || null,
      attachmentName: announcementData.attachmentName || null,
      createdAt: isNew ? now : (announcementData as any).createdAt || now,
      publishedAt:
        announcementData.status === 'PUBLISHED'
          ? (announcementData.scheduledFor || now)
          : null,
      updatedAt: now,
      classId: announcementData.targetClass || 'All Students'
    };

    await setDoc(docRef, payload, { merge: true });

    // If published and target students exist, push notifications if permitted
    if (announcementData.status === 'PUBLISHED') {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(async (uDoc) => {
          const uData = uDoc.data();
          if (
            uData.role === 'student' &&
            isAnnouncementTargetedToStudent(payload, uData.grade || uData.class, uData.section)
          ) {
            const notifRef = doc(collection(db, 'students', uDoc.id, 'notifications'));
            await setDoc(notifRef, {
              id: notifRef.id,
              title: `📢 ${announcementData.title}`,
              message: announcementData.message,
              type: 'system',
              date: now,
              read: false
            });
          }
        });
      } catch (usersErr) {
        console.warn("Could not dispatch notifications to students collection:", usersErr);
      }
    }

    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'announcements');
    return '';
  }
}

/**
 * Delete Announcement permanently from Firestore
 */
export async function deleteAnnouncementDoc(announcementId: string): Promise<void> {
  if (!announcementId) return;
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${announcementId}`);
  }
}

/**
 * Archive Announcement
 */
export async function archiveAnnouncementDoc(announcementId: string): Promise<void> {
  if (!announcementId) return;
  try {
    await updateDoc(doc(db, 'announcements', announcementId), {
      status: 'ARCHIVED',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `announcements/${announcementId}`);
  }
}

// Backward Compatibility Aliases
export function subscribeToClassAnnouncements(
  studentClassGrade: string,
  callback: (announcements: AnnouncementItem[]) => void
): () => void {
  return subscribeToStudentAnnouncements(
    studentClassGrade,
    undefined,
    'anonymous_listener',
    (items) => callback(items)
  );
}

export async function publishClassAnnouncement(
  announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>
): Promise<string> {
  return saveTeacherAnnouncement({
    title: announcement.title,
    message: announcement.content || (announcement as any).message || '',
    type: (announcement as any).type || 'General',
    targetClass: announcement.classId || (announcement as any).targetClass || 'All Students',
    targetSection: (announcement as any).targetSection || 'All Sections',
    priority: (announcement as any).priority || 'Normal',
    status: (announcement as any).status || 'PUBLISHED',
    createdBy: (announcement as any).createdBy || 'teacher_uid',
    authorName: announcement.authorName || 'Class Teacher',
    authorRole: (announcement.authorRole as any) || 'teacher',
    attachmentUrl: announcement.attachmentUrl || null
  });
}

// ====================================================================
// CLASS-WISE DISCUSSION ROOMS
// ====================================================================

export interface DiscussionPost {
  id: string;
  classId: string; // 'Class 5', 'Class 6', ..., 'Class 10'
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  authorPhoto?: string;
  likes: number;
  isPinned: boolean;
  isClosed: boolean;
  repliesCount: number;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export function subscribeToClassDiscussions(
  classId: string,
  callback: (posts: DiscussionPost[]) => void
): () => void {
  const discussionsRef = collection(db, 'discussions');
  return onSnapshot(query(discussionsRef, orderBy('createdAt', 'desc')), (snapshot) => {
    const list: DiscussionPost[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DiscussionPost;
      if (!classId || classId === 'All' || data.classId === classId) {
        list.push({ ...data, id: docSnap.id });
      }
    });
    callback(list);
  }, (err) => {
    console.warn("Firestore discussions snapshot warning:", err);
    callback([]);
  });
}

export async function createDiscussionPost(
  postData: Omit<DiscussionPost, 'id' | 'createdAt' | 'likes' | 'repliesCount' | 'isPinned' | 'isClosed'>
): Promise<string> {
  try {
    const newRef = doc(collection(db, 'discussions'));
    const docItem: DiscussionPost = {
      ...postData,
      id: newRef.id,
      likes: 0,
      repliesCount: 0,
      isPinned: false,
      isClosed: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(newRef, docItem);
    return newRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'discussions');
    return '';
  }
}

export function subscribeToDiscussionReplies(
  discussionId: string,
  callback: (replies: DiscussionReply[]) => void
): () => void {
  const repliesRef = collection(db, 'discussions', discussionId, 'replies');
  return onSnapshot(query(repliesRef, orderBy('createdAt', 'asc')), (snapshot) => {
    const list: DiscussionReply[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as DiscussionReply), id: docSnap.id });
    });
    callback(list);
  }, (err) => {
    console.warn("Firestore discussion replies snapshot warning:", err);
    callback([]);
  });
}

export async function addDiscussionReply(
  discussionId: string,
  replyData: Omit<DiscussionReply, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const replyRef = doc(collection(db, 'discussions', discussionId, 'replies'));
    const docData: DiscussionReply = {
      ...replyData,
      id: replyRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(replyRef, docData);

    // Update reply count on parent discussion
    const parentRef = doc(db, 'discussions', discussionId);
    const parentSnap = await getDoc(parentRef);
    if (parentSnap.exists()) {
      const currentCount = parentSnap.data().repliesCount || 0;
      await updateDoc(parentRef, { repliesCount: currentCount + 1 });
    }
    return replyRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `discussions/${discussionId}/replies`);
    return '';
  }
}

export async function likeDiscussionPost(discussionId: string): Promise<void> {
  try {
    const parentRef = doc(db, 'discussions', discussionId);
    const parentSnap = await getDoc(parentRef);
    if (parentSnap.exists()) {
      const currentLikes = parentSnap.data().likes || 0;
      await updateDoc(parentRef, { likes: currentLikes + 1 });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `discussions/${discussionId}`);
  }
}

export async function togglePinDiscussionPost(discussionId: string, isPinned: boolean): Promise<void> {
  try {
    const parentRef = doc(db, 'discussions', discussionId);
    await updateDoc(parentRef, { isPinned: !isPinned });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `discussions/${discussionId}`);
  }
}

export async function toggleCloseDiscussionPost(discussionId: string, isClosed: boolean): Promise<void> {
  try {
    const parentRef = doc(db, 'discussions', discussionId);
    await updateDoc(parentRef, { isClosed: !isClosed });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `discussions/${discussionId}`);
  }
}

export async function deleteDiscussionPost(discussionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'discussions', discussionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `discussions/${discussionId}`);
  }
}

// ====================================================================
// REAL LMS HOMEWORK & SUBMISSIONS (Teacher & Student)
// ====================================================================

export interface TeacherHomeworkItem {
  id: string;
  targetGrade: string; // 'Class 5' | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10';
  subject: string;
  chapter: string;
  lesson: string;
  title: string;
  instructions: string;
  description?: string;
  dueDate: string;
  totalMarks?: number;
  attachments?: string[];
  attachedPdfUrl?: string;
  attachedImages?: string[];
  createdAt: string;
  teacherId?: string;
  teacherName?: string;
  classId?: string;
  studentClass?: string;
  section?: string;
  status?: string;
}

export interface HomeworkSubmissionDoc {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentGrade: string;
  classId?: string;
  submissionTime: string;
  submittedAt?: string;
  submissionUrl?: string;
  status: 'Submitted' | 'Graded' | 'Pending';
  answersText?: string;
  attachedPdfUrl?: string;
  attachedImages?: string[];
  marks?: number;
  maxMarks?: number;
  remarks?: string;
  gradedAt?: string;
  teacherName?: string;
}

export interface TeacherNotificationItem {
  id: string;
  type: 'login' | 'homework_submission' | 'mock_test' | 'student_doubt' | 'new_student';
  title: string;
  message: string;
  studentName?: string;
  studentGrade?: string;
  createdAt: string;
  read?: boolean;
}

export function getDefaultSyllabusHomeworks(targetGrade?: string): TeacherHomeworkItem[] {
  // Pure real-data: Return empty array. Never return fake/mock homework.
  return [];
}

export async function publishTeacherHomework(homework: Omit<TeacherHomeworkItem, 'id' | 'createdAt'>): Promise<string> {
  try {
    const hwRef = doc(collection(db, 'homeworks'));
    const docId = hwRef.id;
    const targetGradeNorm = homework.targetGrade ? normalizeGradeKey(homework.targetGrade) : (homework as any).classId ? normalizeGradeKey((homework as any).classId) : 'Class 5';
    const descriptionText = homework.instructions || homework.description || '';
    
    const docData: Record<string, any> = {
      id: docId,
      homeworkId: docId,
      classId: targetGradeNorm,
      targetGrade: targetGradeNorm,
      targetClass: targetGradeNorm,
      studentClass: targetGradeNorm,
      grade: targetGradeNorm,
      class: targetGradeNorm,
      section: (homework as any).section || 'All',
      teacherId: (homework as any).teacherId || 't_school_faculty',
      teacherName: homework.teacherName || 'Teacher',
      description: descriptionText,
      instructions: descriptionText,
      title: homework.title || 'Homework Assignment',
      subject: homework.subject || 'Mathematics',
      subjectId: ((homework as any).subjectId || homework.subject || 'mathematics').toLowerCase().replace(/\s+/g, '_'),
      chapter: homework.chapter || 'Chapter 1',
      chapterId: ((homework as any).chapterId || homework.chapter || 'ch1').toLowerCase().replace(/\s+/g, '_'),
      lesson: homework.lesson || 'General',
      dueDate: homework.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      totalMarks: Number(homework.totalMarks) || 20,
      attachments: homework.attachments || [],
      attachedPdfUrl: homework.attachedPdfUrl || '',
      attachedImages: homework.attachedImages || [],
      source: 'TEACHER',
      published: true,
      status: 'Published',
      createdAt: new Date().toISOString()
    };

    // Dual-write to homeworks and homework collections in Firestore
    await setDoc(doc(db, 'homeworks', docId), docData);
    await setDoc(doc(db, 'homework', docId), docData);

    // Notify Teacher
    await addTeacherNotification({
      type: 'new_student',
      title: `Homework Published: ${homework.title || 'Assignment'}`,
      message: `Assigned to ${targetGradeNorm} (${homework.subject || 'Subject'} - ${homework.chapter || 'Chapter'})`,
      studentGrade: targetGradeNorm
    });

    // Notify Students of this class
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      id: notifRef.id,
      title: `New Homework Assigned - ${homework.subject || 'Homework'}`,
      message: `Teacher ${homework.teacherName || ''} assigned new homework for ${targetGradeNorm}: ${homework.title || 'Assignment'}`,
      type: 'homework_assigned',
      targetGrade: targetGradeNorm,
      createdAt: new Date().toISOString(),
      read: false
    }).catch(() => {});

    return docId;
  } catch (err) {
    console.warn("Error publishing teacher homework:", err);
    return '';
  }
}

export function subscribeToTeacherHomework(
  targetGrade: string | undefined,
  callback: (homeworkList: TeacherHomeworkItem[]) => void
): () => void {
  let list1: TeacherHomeworkItem[] = [];
  let list2: TeacherHomeworkItem[] = [];

  const updateAndEmit = () => {
    const combinedMap = new Map<string, TeacherHomeworkItem>();
    
    // Pure real data: only include items saved in Firestore
    list2.forEach(item => combinedMap.set(item.id, item));
    list1.forEach(item => combinedMap.set(item.id, item));

    const result = Array.from(combinedMap.values());
    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(result);
  };

  const processSnapshot = (snapshot: any) => {
    const res: TeacherHomeworkItem[] = [];
    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (data.source && data.source !== 'TEACHER') {
        return;
      }
      const hwGrade = data.targetGrade || data.targetClass || data.classId || data.studentClass || data.grade || data.class || '';
      const hwGradeNorm = normalizeGradeKey(hwGrade);
      const targetGradeNorm = targetGrade && targetGrade !== 'All' ? normalizeGradeKey(targetGrade) : null;

      const targetNum = targetGradeNorm ? targetGradeNorm.match(/\d+/)?.[0] : null;
      const hwNum = hwGradeNorm ? hwGradeNorm.match(/\d+/)?.[0] : null;

      const matchesGrade = !targetGradeNorm || 
        hwGradeNorm === targetGradeNorm || 
        hwGrade === targetGrade || 
        (targetNum && hwNum && targetNum === hwNum) ||
        (targetGrade && hwGrade && (hwGrade.includes(targetGrade) || targetGrade.includes(hwGrade)));

      if (matchesGrade) {
        const desc = data.instructions || data.description || '';
        res.push({
          ...data,
          id: docSnap.id,
          targetGrade: hwGradeNorm || 'Class 5',
          classId: hwGradeNorm || 'Class 5',
          title: data.title || 'Homework',
          subject: data.subject || 'General',
          chapter: data.chapter || 'Chapter 1',
          lesson: data.lesson || 'General',
          instructions: desc,
          description: desc,
          teacherName: data.teacherName || 'Subject Teacher',
          dueDate: data.dueDate || 'Upcoming',
          status: data.status || 'Published',
          source: 'TEACHER',
          createdAt: data.createdAt || new Date().toISOString()
        } as TeacherHomeworkItem);
      }
    });
    return res;
  };

  const unsub1 = onSnapshot(collection(db, 'homeworks'), (snap) => {
    list1 = processSnapshot(snap);
    updateAndEmit();
  }, (err) => {
    console.warn("Firestore homeworks subscription warning:", err);
  });

  const unsub2 = onSnapshot(collection(db, 'homework'), (snap) => {
    list2 = processSnapshot(snap);
    updateAndEmit();
  }, (err) => {
    console.warn("Firestore homework subscription warning:", err);
  });

  return () => {
    unsub1();
    unsub2();
  };
}

export async function deleteTeacherHomework(homeworkId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'homeworks', homeworkId)).catch(() => {});
    await deleteDoc(doc(db, 'homework', homeworkId)).catch(() => {});
  } catch (err) {
    console.warn("Error deleting homework:", err);
  }
}

export async function submitStudentHomework(submission: Omit<HomeworkSubmissionDoc, 'id' | 'submissionTime' | 'status'>): Promise<string> {
  try {
    const subRef = doc(collection(db, 'homework_submissions'));
    const docData: Record<string, any> = {
      id: subRef.id,
      homeworkId: submission.homeworkId || '',
      homeworkTitle: submission.homeworkTitle || 'Homework Assignment',
      studentId: submission.studentId || 's_demo',
      studentName: submission.studentName || 'Student',
      studentGrade: submission.studentGrade || 'Class 10',
      classId: (submission as any).classId || submission.studentGrade || 'Class 10',
      answersText: submission.answersText || '',
      submissionUrl: (submission as any).submissionUrl || submission.attachedPdfUrl || (submission.attachedImages && submission.attachedImages[0]) || '',
      attachedPdfUrl: submission.attachedPdfUrl || '',
      attachedImages: submission.attachedImages || [],
      submissionTime: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      maxMarks: Number(submission.maxMarks) || 20,
      teacherName: submission.teacherName || 'Teacher'
    };
    await setDoc(subRef, docData);

    await addTeacherNotification({
      type: 'homework_submission',
      title: `Homework Submitted by ${submission.studentName || 'Student'}`,
      message: `${submission.studentGrade || 'Class'} • ${submission.homeworkTitle || 'Assignment'}`,
      studentName: submission.studentName || 'Student',
      studentGrade: submission.studentGrade || 'Class 10'
    });

    const actRef = doc(collection(db, 'students', submission.studentId || 's_demo', 'activity'));
    await setDoc(actRef, {
      id: actRef.id,
      action: 'assignment_submitted',
      title: `Submitted Homework: ${submission.homeworkTitle || 'Assignment'}`,
      subject: submission.studentGrade || 'Class 10',
      timestamp: new Date().toISOString(),
      xpGained: 40
    }).catch(() => {});

    return subRef.id;
  } catch (err) {
    console.warn("Error submitting student homework:", err);
    return '';
  }
}

export function subscribeToHomeworkSubmissions(
  arg1: ((submissions: HomeworkSubmissionDoc[]) => void) | string,
  arg2?: ((submissions: HomeworkSubmissionDoc[]) => void) | string
): () => void {
  let callback: (submissions: HomeworkSubmissionDoc[]) => void;
  let filterId: string | undefined;

  if (typeof arg1 === 'function') {
    callback = arg1;
    filterId = typeof arg2 === 'string' ? arg2 : undefined;
  } else {
    filterId = typeof arg1 === 'string' ? arg1 : undefined;
    callback = typeof arg2 === 'function' ? arg2 : () => {};
  }

  const subRef = collection(db, 'homework_submissions');
  return onSnapshot(subRef, (snapshot) => {
    const list: HomeworkSubmissionDoc[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as HomeworkSubmissionDoc;
      if (!filterId || data.homeworkId === filterId || data.studentId === filterId) {
        list.push({
          ...data,
          id: docSnap.id
        });
      }
    });
    list.sort((a, b) => new Date(b.submissionTime || (b as any).submittedAt || 0).getTime() - new Date(a.submissionTime || (a as any).submittedAt || 0).getTime());
    if (typeof callback === 'function') {
      callback(list);
    }
  }, (err) => {
    console.warn("Firestore homework submissions subscription warning:", err);
    if (typeof callback === 'function') {
      callback([]);
    }
  });
}

export async function gradeHomeworkSubmission(
  submissionId: string,
  marks: number,
  maxMarks: number,
  remarks: string,
  teacherName: string = 'Teacher'
): Promise<void> {
  try {
    const subRef = doc(db, 'homework_submissions', submissionId);
    await setDoc(subRef, {
      marks,
      maxMarks,
      remarks,
      status: 'Graded',
      gradedAt: new Date().toISOString(),
      teacherName
    }, { merge: true });
  } catch (err) {
    console.warn("Error grading homework submission:", err);
  }
}

export async function updateStudentCurrentActivity(
  userId: string,
  activityName: string,
  status: 'Online' | 'Idle' | 'Offline' = 'Online'
): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      currentActivity: activityName,
      status,
      lastActiveTime: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Silent catch
  }
}

export async function addTeacherNotification(notif: Omit<TeacherNotificationItem, 'id' | 'createdAt'>): Promise<void> {
  try {
    const nRef = doc(collection(db, 'teacher_notifications'));
    await setDoc(nRef, {
      ...notif,
      id: nRef.id,
      createdAt: new Date().toISOString(),
      read: false
    });
  } catch (err) {
    console.warn("Error adding teacher notification:", err);
  }
}

export function subscribeToTeacherNotifications(
  callback: (notifications: TeacherNotificationItem[]) => void
): () => void {
  const nRef = collection(db, 'teacher_notifications');
  return onSnapshot(nRef, (snapshot) => {
    const list: TeacherNotificationItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as TeacherNotificationItem);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn("Firestore teacher notifications subscription warning:", err);
    callback([]);
  });
}

// ====================================================================
// STUDENT DOUBT CENTER (Realtime Ask, Attach, Reply, AI, Resolve)
// ====================================================================

export interface DoubtAttachment {
  type: 'image' | 'pdf' | 'audio' | 'screenshot';
  url: string;
  name?: string;
}

export interface DoubtThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
  senderPhoto?: string;
  text: string;
  attachments?: DoubtAttachment[];
  createdAt: string;
}

export interface DoubtTeacherReply {
  explanation: string;
  notesUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  voiceRecordingUrl?: string;
  aiExplanation?: string;
  repliedAt: string;
  teacherName: string;
  teacherId?: string;
}

export interface StudentDoubtDoc {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  class?: string; // e.g. 'Class 10'
  studentClass: string; // 'Class 5', ..., 'Class 10'
  section?: string;
  subject: string;
  chapter: string;
  lesson: string;
  title?: string;
  description?: string;
  question: string;
  priority?: 'Low' | 'Medium' | 'High';
  attachments?: DoubtAttachment[];
  voiceUrl?: string;
  status: 'Pending' | 'Answered' | 'Resolved';
  readStatus?: 'Unread' | 'Viewed' | 'Replied' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
  teacherReply?: DoubtTeacherReply | any;
  teacherReplyTime?: string;
  teacherName?: string;
  messages?: DoubtThreadMessage[];
  resolvedAt?: string;
  upvotesCount?: number;
  upvotedBy?: string[];
}

function parseTimestampToIso(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'number') return new Date(ts).toISOString();
  if (typeof ts === 'object') {
    if (typeof ts.toDate === 'function') {
      try { return ts.toDate().toISOString(); } catch (e) { return new Date().toISOString(); }
    }
    if (typeof ts.seconds === 'number') {
      return new Date(ts.seconds * 1000).toISOString();
    }
  }
  return new Date().toISOString();
}

import { 
  postDoubt, 
  subscribeToDoubts, 
  replyToDoubt, 
  resolveDoubt, 
  addDoubtThreadMessage as serviceAddThreadMsg, 
  upvoteDoubt as serviceUpvote 
} from './doubtService';

export function subscribeToStudentDoubts(
  callback: (doubts: StudentDoubtDoc[]) => void,
  filterClass?: string,
  filterStudentId?: string
): () => void {
  return subscribeToDoubts(filterClass, callback, filterStudentId);
}

export async function askStudentDoubt(
  doubt: Omit<StudentDoubtDoc, 'id' | 'createdAt' | 'status'> & { status?: 'Pending' | 'Answered' | 'Resolved', section?: string }
): Promise<string> {
  return postDoubt(doubt as any);
}

export async function addDoubtThreadMessage(
  doubtId: string,
  message: Omit<DoubtThreadMessage, 'id' | 'createdAt'>
): Promise<void> {
  return serviceAddThreadMsg(doubtId, message as any);
}

export async function replyToStudentDoubt(
  doubtId: string,
  reply: Omit<DoubtTeacherReply, 'repliedAt'>
): Promise<void> {
  return replyToDoubt(doubtId, reply);
}

export async function resolveStudentDoubt(doubtId: string): Promise<void> {
  return resolveDoubt(doubtId);
}

export async function upvoteStudentDoubt(doubtId: string, studentId: string): Promise<void> {
  return serviceUpvote(doubtId, studentId);
}

// ====================================================================
// CLASS GROUP MESSAGES (Class 5 to Class 10 Realtime Chat)
// ====================================================================

export interface ClassGroupMessageDoc {
  id: string;
  classId: string; // 'Class 5', 'Class 6', ..., 'Class 10'
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'admin';
  senderPhoto?: string;
  text: string;
  type?: 'text' | 'notes' | 'homework' | 'announcement' | 'video' | 'pdf' | 'worksheet';
  attachmentUrl?: string;
  attachmentName?: string;
  isPinned?: boolean;
  createdAt: string;
}

export function subscribeToClassGroupMessages(
  classId: string,
  callback: (messages: ClassGroupMessageDoc[]) => void
): () => void {
  const msgsRef = collection(db, 'groups', `group_${classId}`, 'messages');
  return onSnapshot(msgsRef, (snapshot) => {
    const list: ClassGroupMessageDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as ClassGroupMessageDoc), id: docSnap.id });
    });
    list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.warn("Firestore group messages subscription warning:", err);
    callback([]);
  });
}

export async function sendClassGroupMessage(
  msg: Omit<ClassGroupMessageDoc, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const mRef = doc(collection(db, 'groups', `group_${msg.classId}`, 'messages'));
    const docData: ClassGroupMessageDoc = {
      ...msg,
      id: mRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(mRef, docData);

    // Also copy to root messages collection for audit
    const rootRef = doc(db, 'messages', mRef.id);
    await setDoc(rootRef, docData);

    return mRef.id;
  } catch (err) {
    console.warn("Error sending class group message:", err);
    return '';
  }
}

export async function togglePinClassGroupMessage(classId: string, messageId: string, isPinned: boolean): Promise<void> {
  try {
    const mRef = doc(db, 'groups', `group_${classId}`, 'messages', messageId);
    await updateDoc(mRef, { isPinned });
  } catch (err) {
    console.warn("Error toggling message pin:", err);
  }
}








