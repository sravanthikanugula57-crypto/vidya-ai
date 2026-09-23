import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type RealEventType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CHAPTER_OPENED'
  | 'RESOURCE_OPENED'
  | 'TEXTBOOK_OPENED'
  | 'NOTES_OPENED'
  | 'FORMULA_SHEET_OPENED'
  | 'WORKSHEET_OPENED'
  | 'VIDEO_STARTED'
  | 'VIDEO_PROGRESS'
  | 'VIDEO_COMPLETED'
  | 'PRACTICE_STARTED'
  | 'PRACTICE_PROGRESS'
  | 'PRACTICE_COMPLETED'
  | 'QUIZ_STARTED'
  | 'QUIZ_SUBMITTED'
  | 'MOCK_STARTED'
  | 'MOCK_SUBMITTED'
  | 'ASSIGNMENT_STARTED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'DOUBT_CREATED'
  | 'TEACHER_REPLY_RECEIVED';

export interface StudentActivityDoc {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  class: string;
  subject?: string;
  chapter?: string;
  eventType: RealEventType;
  eventDetails: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

export interface GrandMockResult {
  testId: string;
  testTitle: string;
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  class: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeTakenMinutes: number;
  subjectBreakdown: {
    mathematics: { score: number; max: number; correct: number; wrong: number; unattempted: number };
    physicalScience: { score: number; max: number; correct: number; wrong: number; unattempted: number };
    biologicalScience: { score: number; max: number; correct: number; wrong: number; unattempted: number };
    socialStudies: { score: number; max: number; correct: number; wrong: number; unattempted: number };
  };
  submittedAt: string;
}

/**
 * Record a real student event in Firestore `studentActivity` collection
 * and update the student's status and last active timestamp in `users/{studentUid}`.
 */
export async function recordRealStudentEvent(payload: {
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  class?: string;
  subject?: string;
  chapter?: string;
  eventType: RealEventType;
  eventDetails: string;
  metadata?: Record<string, any>;
}): Promise<string> {
  if (!payload.studentUid) return '';
  const now = new Date().toISOString();
  const eventId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanClass = payload.class || 'Class 10';

  const activityDoc: StudentActivityDoc = {
    id: eventId,
    studentUid: payload.studentUid,
    studentName: payload.studentName || 'Student',
    studentEmail: payload.studentEmail || '',
    class: cleanClass,
    subject: payload.subject || '',
    chapter: payload.chapter || '',
    eventType: payload.eventType,
    eventDetails: payload.eventDetails,
    metadata: payload.metadata || {},
    timestamp: now,
    createdAt: now
  };

  try {
    // 1. Write to studentActivity collection
    const actRef = doc(db, 'studentActivity', eventId);
    await setDoc(actRef, activityDoc);

    // 2. Update users/{studentUid}
    const userRef = doc(db, 'users', payload.studentUid);
    const userUpdates: Record<string, any> = {
      lastActiveAt: now,
      status: payload.eventType === 'LOGOUT' ? 'Offline' : 'Online',
      currentActivity: payload.eventDetails,
      recentActivity: payload.eventDetails,
      updatedAt: now
    };

    if (payload.eventType === 'LOGIN') {
      userUpdates.lastLoginAt = now;
      userUpdates.status = 'Online';
    } else if (payload.eventType === 'LOGOUT') {
      userUpdates.lastLogoutAt = now;
      userUpdates.status = 'Offline';
    }

    if (payload.subject) userUpdates.currentSubject = payload.subject;
    if (payload.chapter) userUpdates.currentChapter = payload.chapter;

    await updateDoc(userRef, userUpdates).catch(async () => {
      // If user doc didn't exist yet, create with merge
      await setDoc(userRef, {
        uid: payload.studentUid,
        name: payload.studentName,
        email: payload.studentEmail || '',
        class: cleanClass,
        role: 'student',
        ...userUpdates
      }, { merge: true }).catch(() => {});
    });

    return eventId;
  } catch (err) {
    console.warn('Could not record student activity in Firestore:', err);
    return '';
  }
}

/**
 * Log student login
 */
export async function logStudentLogin(studentUid: string, name: string, email: string, studentClass = 'Class 10'): Promise<void> {
  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    studentEmail: email,
    class: studentClass,
    eventType: 'LOGIN',
    eventDetails: `Logged in to Vidya AI Student Portal`
  });
}

/**
 * Log student logout
 */
export async function logStudentLogout(studentUid: string, name: string): Promise<void> {
  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    eventType: 'LOGOUT',
    eventDetails: `Logged out of Vidya AI Student Portal`
  });
}

/**
 * Log chapter opened
 */
export async function logChapterOpened(studentUid: string, name: string, studentClass: string, subject: string, chapter: string): Promise<void> {
  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType: 'CHAPTER_OPENED',
    eventDetails: `Opened ${subject} • ${chapter}`
  });

  // Also record chapter progress record in chapterProgress/{id}
  try {
    const progId = `chp_${studentUid}_${subject.replace(/\s+/g, '_')}_${chapter.replace(/\s+/g, '_')}`;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'chapterProgress', progId), {
      id: progId,
      studentUid,
      studentName: name,
      class: studentClass,
      subject,
      chapter,
      lastAccessedAt: now,
      status: 'in_progress',
      updatedAt: now
    }, { merge: true });
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Log resource opened (Textbook, Notes, Formula Sheet, Worksheet, etc.)
 */
export async function logResourceOpened(
  studentUid: string, 
  name: string, 
  studentClass: string, 
  subject: string, 
  chapter: string,
  resourceId: string,
  resourceTitle: string,
  resourceType: string
): Promise<void> {
  const normType = resourceType.toLowerCase();
  let eventType: RealEventType = 'RESOURCE_OPENED';
  if (normType.includes('textbook')) eventType = 'TEXTBOOK_OPENED';
  else if (normType.includes('note')) eventType = 'NOTES_OPENED';
  else if (normType.includes('formula')) eventType = 'FORMULA_SHEET_OPENED';
  else if (normType.includes('worksheet') || normType.includes('practice')) eventType = 'WORKSHEET_OPENED';

  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType,
    eventDetails: `Opened ${resourceType}: "${resourceTitle}"`,
    metadata: { resourceId, resourceTitle, resourceType }
  });

  // Also write to resourceAccess collection
  try {
    const accessId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'resourceAccess', accessId), {
      id: accessId,
      resourceId,
      resourceTitle,
      resourceType,
      studentUid,
      studentName: name,
      class: studentClass,
      subject,
      chapter,
      accessedAt: now
    });
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Log video playback progress (start, 25%, 50%, 75%, completed)
 */
export async function logVideoProgress(
  studentUid: string,
  name: string,
  studentClass: string,
  subject: string,
  chapter: string,
  videoId: string,
  videoTitle: string,
  percentage: number
): Promise<void> {
  let eventType: RealEventType = 'VIDEO_PROGRESS';
  let desc = `Watched ${percentage}% of Video: "${videoTitle}"`;

  if (percentage <= 5) {
    eventType = 'VIDEO_STARTED';
    desc = `Started watching Video: "${videoTitle}"`;
  } else if (percentage >= 95) {
    eventType = 'VIDEO_COMPLETED';
    desc = `Completed watching Video: "${videoTitle}" (100%)`;
  }

  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType,
    eventDetails: desc,
    metadata: { videoId, videoTitle, percentage }
  });

  // Track in videoProgress/{id}
  try {
    const vProgId = `vp_${studentUid}_${videoId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'videoProgress', vProgId), {
      id: vProgId,
      studentUid,
      studentName: name,
      class: studentClass,
      subject,
      chapter,
      videoId,
      videoTitle,
      progressPercent: percentage,
      completed: percentage >= 90,
      lastWatchedAt: now
    }, { merge: true });

    // Update video watched count on user doc
    if (percentage >= 90) {
      const userRef = doc(db, 'users', studentUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentCount = userSnap.data().videosWatched || 0;
        await updateDoc(userRef, { videosWatched: currentCount + 1 }).catch(() => {});
      }
    }
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Log Practice Set progress & completion
 */
export async function logPracticeAttempt(
  studentUid: string,
  name: string,
  studentClass: string,
  subject: string,
  chapter: string,
  score: number,
  total: number,
  topic = 'General Practice'
): Promise<void> {
  const pct = Math.round((score / Math.max(1, total)) * 100);
  const now = new Date().toISOString();
  const attemptId = `prac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType: 'PRACTICE_COMPLETED',
    eventDetails: `Completed Practice Set in ${subject} • Score: ${score}/${total} (${pct}%)`,
    metadata: { score, total, percentage: pct, topic }
  });

  try {
    // Save to practiceAttempts collection
    await setDoc(doc(db, 'practiceAttempts', attemptId), {
      id: attemptId,
      studentUid,
      studentName: name,
      class: studentClass,
      subject,
      chapter,
      topic,
      score,
      totalQuestions: total,
      percentage: pct,
      attemptedAt: now
    });

    // Update user stats
    const userRef = doc(db, 'users', studentUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const curr = userSnap.data().practiceCompleted || 0;
      await updateDoc(userRef, { practiceCompleted: curr + 1 }).catch(() => {});
    }
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Log Quiz progress & completion
 */
export async function logQuizAttempt(
  studentUid: string,
  name: string,
  studentClass: string,
  subject: string,
  chapter: string,
  quizTitle: string,
  score: number,
  maxScore: number
): Promise<void> {
  const pct = Math.round((score / Math.max(1, maxScore)) * 100);
  const now = new Date().toISOString();
  const attemptId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType: 'QUIZ_SUBMITTED',
    eventDetails: `Submitted Quiz "${quizTitle}" • Score: ${score}/${maxScore} (${pct}%)`,
    metadata: { quizTitle, score, maxScore, percentage: pct }
  });

  try {
    // Save to quizAttempts collection
    await setDoc(doc(db, 'quizAttempts', attemptId), {
      id: attemptId,
      studentUid,
      studentName: name,
      class: studentClass,
      subject,
      chapter,
      quizTitle,
      score,
      maxScore,
      percentage: pct,
      submittedAt: now
    });
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Log 100-Question Grand Mock Test attempt & score
 */
export async function logGrandMockAttempt(result: GrandMockResult): Promise<string> {
  const attemptId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  await recordRealStudentEvent({
    studentUid: result.studentUid,
    studentName: result.studentName,
    studentEmail: result.studentEmail,
    class: result.class,
    eventType: 'MOCK_SUBMITTED',
    eventDetails: `Completed 100-Q Grand Mock Test • Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%) [Math: ${result.subjectBreakdown.mathematics.score}/25, PS: ${result.subjectBreakdown.physicalScience.score}/25, BS: ${result.subjectBreakdown.biologicalScience.score}/25, SS: ${result.subjectBreakdown.socialStudies.score}/25]`,
    metadata: { ...result, attemptId }
  });

  try {
    // Write full record to quizAttempts and mock_test_attempts
    await setDoc(doc(db, 'quizAttempts', attemptId), {
      ...result,
      id: attemptId,
      type: '100_Q_GRAND_MOCK',
      submittedAt: now
    });

    await setDoc(doc(db, 'mock_test_attempts', attemptId), {
      ...result,
      id: attemptId,
      submittedAt: now
    });

    // Update user profile with latest mock test score
    const userRef = doc(db, 'users', result.studentUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentCompleted = userSnap.data().mockTestsCompleted || 0;
      await updateDoc(userRef, {
        mockTestsCompleted: currentCompleted + 1,
        averageMockTestScore: result.percentage,
        quizScoreAvg: result.percentage,
        mockTestStatus: `Scored ${result.totalScore}/100 (${result.percentage}%)`,
        lastMockTestAt: now
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Error saving Grand Mock attempt in Firestore:', e);
  }

  return attemptId;
}

/**
 * Log Homework submission
 */
export async function logHomeworkSubmission(
  studentUid: string,
  name: string,
  studentClass: string,
  homeworkId: string,
  homeworkTitle: string,
  subject: string,
  submissionText: string,
  attachments: string[] = []
): Promise<string> {
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    eventType: 'ASSIGNMENT_SUBMITTED',
    eventDetails: `Submitted homework assignment: "${homeworkTitle}" (${subject})`,
    metadata: { homeworkId, homeworkTitle, submissionId }
  });

  try {
    // Write to homeworkSubmissions
    const subDoc = {
      id: submissionId,
      submissionId,
      homeworkId,
      homeworkTitle,
      studentUid,
      studentId: studentUid,
      studentName: name,
      class: studentClass,
      studentGrade: studentClass,
      subject,
      submissionText,
      attachments,
      status: 'submitted',
      score: null,
      feedback: '',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(db, 'homeworkSubmissions', submissionId), subDoc);
    await setDoc(doc(db, 'homework_submissions', submissionId), subDoc);

    // Update student's homework count
    const userRef = doc(db, 'users', studentUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const curr = userSnap.data().homeworkSubmitted || 0;
      await updateDoc(userRef, { homeworkSubmitted: curr + 1 }).catch(() => {});
    }
  } catch (e) {
    console.warn('Error saving homework submission in Firestore:', e);
  }

  return submissionId;
}

/**
 * Log Doubt Creation
 */
export async function logDoubtCreated(
  studentUid: string,
  name: string,
  studentClass: string,
  subject: string,
  chapter: string,
  doubtId: string,
  question: string
): Promise<void> {
  await recordRealStudentEvent({
    studentUid,
    studentName: name,
    class: studentClass,
    subject,
    chapter,
    eventType: 'DOUBT_CREATED',
    eventDetails: `Asked a doubt in ${subject} • ${chapter}: "${question.length > 50 ? question.substring(0, 50) + '...' : question}"`,
    metadata: { doubtId, question }
  });
}

/**
 * Log Teacher Reply Received
 */
export async function logTeacherReply(
  doubtId: string,
  teacherUid: string,
  teacherName: string,
  studentUid: string,
  studentName: string,
  replyText: string
): Promise<void> {
  if (studentUid) {
    await recordRealStudentEvent({
      studentUid,
      studentName,
      eventType: 'TEACHER_REPLY_RECEIVED',
      eventDetails: `Received reply from ${teacherName} for doubt: "${replyText.length > 50 ? replyText.substring(0, 50) + '...' : replyText}"`,
      metadata: { doubtId, teacherUid, teacherName, replyText }
    });
  }
}

/**
 * Real-time listener for a specific student's activity timeline
 * Used by Teacher Performance View & Student Profile
 */
export function subscribeStudentTimeline(
  studentUid: string,
  callback: (activities: StudentActivityDoc[]) => void
): () => void {
  const actRef = collection(db, 'studentActivity');
  const q = query(
    actRef, 
    where('studentUid', '==', studentUid)
  );

  return onSnapshot(q, (snapshot) => {
    const list: StudentActivityDoc[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StudentActivityDoc);
    });
    // Sort descending by timestamp in memory to avoid requiring complex composite index
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list);
  }, (err) => {
    console.warn('Student timeline listener warning:', err);
    callback([]);
  });
}

/**
 * Real-time listener for all recent activity across the platform
 * Used by Teacher CMS Live Activity Feed
 */
export function subscribeAllStudentActivities(
  callback: (activities: StudentActivityDoc[]) => void,
  limitCount = 30
): () => void {
  const actRef = collection(db, 'studentActivity');

  return onSnapshot(actRef, (snapshot) => {
    const list: StudentActivityDoc[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StudentActivityDoc);
    });
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list.slice(0, limitCount));
  }, (err) => {
    console.warn('All activity listener warning:', err);
    callback([]);
  });
}

/**
 * Real-time listener for student's assessments (Grand Mock & Quizzes)
 */
export function subscribeStudentAssessments(
  studentUid: string,
  callback: (attempts: any[]) => void
): () => void {
  const qRef = collection(db, 'quizAttempts');
  const q = query(qRef, where('studentUid', '==', studentUid));

  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push(d.data());
    });
    list.sort((a, b) => new Date(b.submittedAt || b.timestamp).getTime() - new Date(a.submittedAt || a.timestamp).getTime());
    callback(list);
  }, (err) => {
    console.warn('Student assessments listener warning:', err);
    callback([]);
  });
}

/**
 * Real-time listener for student's practice attempts
 */
export function subscribeStudentPracticeAttempts(
  studentUid: string,
  callback: (attempts: any[]) => void
): () => void {
  const pRef = collection(db, 'practiceAttempts');
  const q = query(pRef, where('studentUid', '==', studentUid));

  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push(d.data());
    });
    list.sort((a, b) => new Date(b.attemptedAt || b.timestamp).getTime() - new Date(a.attemptedAt || a.timestamp).getTime());
    callback(list);
  }, (err) => {
    console.warn('Student practice listener warning:', err);
    callback([]);
  });
}

/**
 * Real-time listener for student's homework submissions
 */
export function subscribeStudentHomeworkSubmissions(
  studentUid: string,
  callback: (submissions: any[]) => void
): () => void {
  const subRef = collection(db, 'homeworkSubmissions');
  const q = query(subRef, where('studentUid', '==', studentUid));

  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push(d.data());
    });
    list.sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime());
    callback(list);
  }, (err) => {
    console.warn('Student homework submissions listener warning:', err);
    callback([]);
  });
}
