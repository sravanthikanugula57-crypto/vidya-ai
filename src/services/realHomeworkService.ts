import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addTeacherNotification } from './studentFirestoreService';

export const ASSIGNMENTS_COLLECTION = 'assignments';
export const SUBMISSIONS_COLLECTION = 'assignmentSubmissions';

export interface HomeworkQuestion {
  id: string;
  type: 'objective' | 'subjective';
  question: string;
  options?: string[]; // For objective MCQ
  correctAnswer?: string; // Answer key for objective questions
  maxMarks: number;
  explanation?: string;
}

export type HomeworkStatus = 'draft' | 'published' | 'closed';

export interface RealHomeworkDoc {
  id: string;
  assignmentId?: string; // Standardized assignment ID
  title: string;
  description: string;
  instructions?: string;
  board: string;
  class: string; // e.g., "Class 5", "Class 6", "Class 10"
  classGrade?: string;
  classNum?: number;
  subject: string;
  chapterId: string;
  chapterName: string;
  questions: HomeworkQuestion[];
  totalMarks: number;
  attachmentUrl?: string;
  attachmentName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  publishedAt?: string;
  dueDate: string;
  status: HomeworkStatus;
}

export interface StudentAnswerItem {
  questionId: string;
  questionText: string;
  type: 'objective' | 'subjective';
  studentAnswer: string;
  options?: string[];
  correctAnswer?: string;
  isCorrect?: boolean;
  marksAwarded: number;
  maxMarks: number;
  autoEvaluated: boolean;
  teacherRemarks?: string;
}

export type SubmissionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'submitted' 
  | 'graded' 
  | 'late' 
  | 'Not Started' 
  | 'In Progress' 
  | 'Submitted' 
  | 'Reviewed';

export interface RealHomeworkSubmissionDoc {
  id: string; // Typically `${homeworkId}_${studentId}`
  submissionId?: string;
  assignmentId?: string;
  homeworkId: string;
  assignmentTitle?: string;
  homeworkTitle?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  class: string;
  subject?: string;
  chapterId?: string;
  chapterName?: string;
  answers: Record<string, StudentAnswerItem>;
  startedAt: string;
  submittedAt?: string;
  status: SubmissionStatus;
  score: number;
  totalMarks?: number;
  maxScore: number;
  percentage?: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  hasSubjectivePending?: boolean;
  teacherFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export function normalizeSubmissionStatus(status?: string | null): 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'late' {
  if (!status) return 'not_started';
  const clean = status.trim().toLowerCase().replace(/\s+/g, '_');
  if (clean === 'submitted') return 'submitted';
  if (clean === 'in_progress' || clean === 'started') return 'in_progress';
  if (clean === 'graded' || clean === 'reviewed' || clean === 'completed') return 'graded';
  if (clean === 'late' || clean === 'overdue') return 'late';
  return 'not_started';
}

export function displaySubmissionStatus(status?: string | null): string {
  const norm = normalizeSubmissionStatus(status);
  switch (norm) {
    case 'submitted': return 'Submitted';
    case 'in_progress': return 'In Progress';
    case 'graded': return 'Graded';
    case 'late': return 'Late';
    case 'not_started':
    default: return 'Not Started';
  }
}

export function formatSubmissionStatusBadge(status?: string | null): { label: string; badgeClass: string } {
  const norm = normalizeSubmissionStatus(status);
  switch (norm) {
    case 'submitted':
      return {
        label: 'Submitted',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    case 'graded':
      return {
        label: 'Graded',
        badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
      };
    case 'late':
      return {
        label: 'Late',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      };
    case 'not_started':
    default:
      return {
        label: 'Not Started',
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      };
  }
}

/**
 * Standardize class identifier (e.g. 6 -> "Class 6", "class 6" -> "Class 6")
 */
export function normalizeClass(val?: string | number | null): string {
  if (!val) return 'Class 5';
  const str = String(val).trim();
  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (num >= 1 && num <= 12) {
    return `Class ${num}`;
  }
  return str.startsWith('Class') ? str : `Class ${str}`;
}

export function extractGradeNum(val?: string | number | null): number {
  if (!val) return 5;
  const num = parseInt(String(val).replace(/\D/g, ''), 10);
  return isNaN(num) ? 5 : num;
}

/**
 * Create or save Homework/Assignment in Firestore: assignments/{assignmentId}
 * Also syncs with homework/{homeworkId} for complete compatibility
 */
export async function saveHomework(data: Partial<RealHomeworkDoc> & {
  title: string;
  class: string;
  subject: string;
  chapterName: string;
  questions: HomeworkQuestion[];
}): Promise<string> {
  const colRef = collection(db, ASSIGNMENTS_COLLECTION);
  const homeworkId = data.id || data.assignmentId || doc(colRef).id;
  const assignmentDocRef = doc(db, ASSIGNMENTS_COLLECTION, homeworkId);
  const homeworkDocRef = doc(db, 'homework', homeworkId);

  const totalMarks = data.totalMarks ?? (Array.isArray(data.questions) ? data.questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 1), 0) : 10);
  const normClass = normalizeClass(data.class);
  const gradeNum = extractGradeNum(normClass);
  const now = new Date().toISOString();

  const payload: RealHomeworkDoc = {
    id: homeworkId,
    assignmentId: homeworkId,
    title: data.title.trim(),
    description: (data.description || data.instructions || '').trim(),
    instructions: (data.instructions || data.description || '').trim(),
    board: data.board || 'AP_SSC',
    class: normClass,
    classGrade: normClass,
    classNum: gradeNum,
    subject: data.subject.trim(),
    chapterId: data.chapterId || data.chapterName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    chapterName: data.chapterName.trim(),
    questions: data.questions || [],
    totalMarks,
    attachmentUrl: data.attachmentUrl || '',
    attachmentName: data.attachmentName || '',
    createdBy: data.createdBy || 'teacher_portal',
    createdByName: data.createdByName || 'Faculty Teacher',
    createdAt: data.createdAt || now,
    publishedAt: data.status === 'published' ? (data.publishedAt || now) : undefined,
    dueDate: data.dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: data.status || 'draft'
  };

  // Write to assignments/{assignmentId}
  await setDoc(assignmentDocRef, payload, { merge: true });

  // Dual-write to homework/{homeworkId} for full backwards compatibility
  try {
    await setDoc(homeworkDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Sync to homework collection:', err);
  }

  // Dual-write to legacy homeworks collection for cross-compatibility
  try {
    const legacyRef = doc(db, 'homeworks', homeworkId);
    await setDoc(legacyRef, {
      ...payload,
      targetGrade: normClass,
      targetClass: normClass,
      chapter: payload.chapterName,
      instructions: payload.description,
      published: payload.status === 'published'
    }, { merge: true });
  } catch (err) {
    console.warn('Silent legacy dual-write warning:', err);
  }

  return homeworkId;
}

/**
 * Update homework/assignment status (e.g. publish or close)
 */
export async function setHomeworkStatus(homeworkId: string, status: HomeworkStatus): Promise<void> {
  const assignRef = doc(db, ASSIGNMENTS_COLLECTION, homeworkId);
  const hwRef = doc(db, 'homework', homeworkId);
  const now = new Date().toISOString();
  const updateData: any = { status };
  if (status === 'published') {
    updateData.publishedAt = now;
  }
  
  await setDoc(assignRef, updateData, { merge: true });
  try {
    await setDoc(hwRef, updateData, { merge: true });
  } catch (e) {
    // ignore
  }

  // Update legacy collection
  try {
    const legacyRef = doc(db, 'homeworks', homeworkId);
    await setDoc(legacyRef, { 
      status: status === 'published' ? 'PUBLISHED' : status.toUpperCase(), 
      published: status === 'published' 
    }, { merge: true });
  } catch (e) {
    // ignore
  }
}

/**
 * Delete homework/assignment from Firestore
 */
export async function deleteHomework(homeworkId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, homeworkId));
  } catch (e) {
    // ignore
  }
  try {
    await deleteDoc(doc(db, 'homework', homeworkId));
  } catch (e) {
    // ignore
  }
  try {
    await deleteDoc(doc(db, 'homeworks', homeworkId));
  } catch (e) {
    // ignore
  }
}

/**
 * Real-time listener for Teacher's Homework list (filtered optionally by class)
 * Listens to both assignments and homework collections seamlessly.
 */
export function subscribeTeacherHomeworkList(
  classFilter?: string,
  onUpdate?: (homeworkList: RealHomeworkDoc[]) => void
): () => void {
  const colRef = collection(db, ASSIGNMENTS_COLLECTION);
  
  return onSnapshot(colRef, (snapshot) => {
    const allHomework: RealHomeworkDoc[] = [];
    const seenIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as RealHomeworkDoc;
      const id = data.id || data.assignmentId || docSnap.id;
      seenIds.add(id);
      allHomework.push({
        ...data,
        id,
        assignmentId: id
      });
    });

    // Sort descending by createdAt
    allHomework.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Filter by class if specified and not 'All'
    if (classFilter && classFilter !== 'All') {
      const targetGradeNum = extractGradeNum(classFilter);
      const filtered = allHomework.filter((h) => extractGradeNum(h.class) === targetGradeNum);
      onUpdate?.(filtered);
    } else {
      onUpdate?.(allHomework);
    }
  }, (err) => {
    console.warn('Teacher assignments subscription error, trying fallback:', err);
    // Fallback to homework collection
    const fallbackCol = collection(db, 'homework');
    return onSnapshot(fallbackCol, (snap) => {
      const list: RealHomeworkDoc[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as RealHomeworkDoc));
      onUpdate?.(list);
    });
  });
}

/**
 * Real-time listener for Student Homework list.
 * STRICT SECURITY & SCOPE:
 * - Only returns status === 'published'
 * - Strictly matches student's class (no other classes visible)
 */
export function subscribeStudentHomeworkList(
  studentClass: string | number,
  onUpdate: (homeworkList: RealHomeworkDoc[]) => void
): () => void {
  const colRef = collection(db, ASSIGNMENTS_COLLECTION);
  const targetGradeNum = extractGradeNum(studentClass);

  return onSnapshot(colRef, (snapshot) => {
    const publishedHomework: RealHomeworkDoc[] = [];
    const seenIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as RealHomeworkDoc;
      const hwGradeNum = extractGradeNum(data.class);
      const id = data.id || data.assignmentId || docSnap.id;
      
      // MUST belong strictly to the student's class and be published
      if (hwGradeNum === targetGradeNum && data.status === 'published' && !seenIds.has(id)) {
        seenIds.add(id);
        publishedHomework.push({
          ...data,
          id,
          assignmentId: id
        });
      }
    });

    publishedHomework.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(publishedHomework);
  }, (err) => {
    console.warn('Student assignments subscription error, trying fallback:', err);
    const fallbackCol = collection(db, 'homework');
    return onSnapshot(fallbackCol, (snap) => {
      const fallbackList: RealHomeworkDoc[] = [];
      snap.forEach(d => {
        const dData = d.data() as RealHomeworkDoc;
        if (extractGradeNum(dData.class) === targetGradeNum && dData.status === 'published') {
          fallbackList.push({ ...dData, id: d.id });
        }
      });
      onUpdate(fallbackList);
    });
  });
}

/**
 * Real-time listener for Student Assignments for a specific chapter.
 * Used inside ChapterLearningHub.
 */
export function subscribeStudentAssignmentsForChapter(
  studentClass: string | number,
  subject: string,
  chapterId: string,
  chapterName: string,
  onUpdate: (assignments: RealHomeworkDoc[]) => void
): () => void {
  const colRef = collection(db, ASSIGNMENTS_COLLECTION);
  const targetGradeNum = extractGradeNum(studentClass);
  const cleanSubject = (subject || '').trim().toLowerCase();
  const cleanChapterName = (chapterName || '').trim().toLowerCase();
  const cleanChapterId = (chapterId || '').trim().toLowerCase();

  return onSnapshot(colRef, (snapshot) => {
    const matchedAssignments: RealHomeworkDoc[] = [];
    const seenIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as RealHomeworkDoc;
      const hwGradeNum = extractGradeNum(data.class);
      const id = data.id || data.assignmentId || docSnap.id;

      if (hwGradeNum !== targetGradeNum || data.status !== 'published' || seenIds.has(id)) {
        return;
      }

      // Subject check
      const docSubj = (data.subject || '').trim().toLowerCase();
      const subjectMatches = !cleanSubject || docSubj.includes(cleanSubject) || cleanSubject.includes(docSubj);

      // Chapter check
      const docChId = (data.chapterId || '').trim().toLowerCase();
      const docChName = (data.chapterName || '').trim().toLowerCase();
      const chapterMatches = !cleanChapterName || 
        docChId === cleanChapterId || 
        docChName.includes(cleanChapterName) || 
        cleanChapterName.includes(docChName);

      if (subjectMatches && chapterMatches) {
        seenIds.add(id);
        matchedAssignments.push({
          ...data,
          id,
          assignmentId: id
        });
      }
    });

    matchedAssignments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(matchedAssignments);
  }, (err) => {
    console.warn('Student chapter assignments subscription error:', err);
    onUpdate([]);
  });
}

/**
 * Real-time listener for all submissions of a specific homework
 */
export function subscribeSubmissionsForHomework(
  homeworkId: string,
  onUpdate: (submissions: RealHomeworkSubmissionDoc[]) => void
): () => void {
  const colRef = collection(db, SUBMISSIONS_COLLECTION);
  const q = query(colRef, where('homeworkId', '==', homeworkId));

  return onSnapshot(q, (snapshot) => {
    const list: RealHomeworkSubmissionDoc[] = [];
    snapshot.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Submissions for homework subscription error, fallback:', err);
    const fallbackCol = collection(db, 'homeworkSubmissions');
    const fallbackQ = query(fallbackCol, where('homeworkId', '==', homeworkId));
    return onSnapshot(fallbackQ, (snap) => {
      const fbList: RealHomeworkSubmissionDoc[] = [];
      snap.forEach(d => fbList.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc));
      onUpdate(fbList);
    });
  });
}

/**
 * Real-time listener for all submissions across teacher's classes
 */
export function subscribeAllHomeworkSubmissions(
  onUpdate: (submissions: RealHomeworkSubmissionDoc[]) => void
): () => void {
  const colRef = collection(db, SUBMISSIONS_COLLECTION);

  return onSnapshot(colRef, (snapshot) => {
    const list: RealHomeworkSubmissionDoc[] = [];
    snapshot.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('All submissions subscription error, fallback:', err);
    const fallbackCol = collection(db, 'homeworkSubmissions');
    return onSnapshot(fallbackCol, (snap) => {
      const fbList: RealHomeworkSubmissionDoc[] = [];
      snap.forEach(d => fbList.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc));
      onUpdate(fbList);
    });
  });
}

/**
 * Real-time listener for a single student's submissions
 */
export function subscribeStudentSubmissions(
  studentId: string,
  onUpdate: (submissions: RealHomeworkSubmissionDoc[]) => void
): () => void {
  const colRef = collection(db, SUBMISSIONS_COLLECTION);
  const q = query(colRef, where('studentId', '==', studentId));

  return onSnapshot(q, (snapshot) => {
    const list: RealHomeworkSubmissionDoc[] = [];
    snapshot.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Student submissions subscription error, fallback:', err);
    const fallbackCol = collection(db, 'homeworkSubmissions');
    const fallbackQ = query(fallbackCol, where('studentId', '==', studentId));
    return onSnapshot(fallbackQ, (snap) => {
      const fbList: RealHomeworkSubmissionDoc[] = [];
      snap.forEach(d => fbList.push({ ...d.data(), id: d.id } as RealHomeworkSubmissionDoc));
      onUpdate(fbList);
    });
  });
}

/**
 * Record student opening / starting homework (Status -> 'in_progress')
 */
export async function recordStudentHomeworkStart(params: {
  homeworkId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentClass: string;
  maxScore?: number;
  subject?: string;
  chapterId?: string;
  chapterName?: string;
  assignmentTitle?: string;
}): Promise<void> {
  const submissionId = `${params.homeworkId}_${params.studentId}`;
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  const existingSnap = await getDoc(docRef);
  if (existingSnap.exists()) {
    const existing = existingSnap.data() as RealHomeworkSubmissionDoc;
    // Don't downgrade submitted or reviewed status
    const norm = normalizeSubmissionStatus(existing.status);
    if (norm === 'submitted' || norm === 'graded') {
      return;
    }
  }

  const existingData = existingSnap.exists() ? existingSnap.data() : {};
  const totalMarks = params.maxScore || existingData.totalMarks || existingData.maxScore || 10;
  const currentScore = existingData.score || 0;

  const payload: RealHomeworkSubmissionDoc = {
    id: submissionId,
    submissionId,
    assignmentId: params.homeworkId,
    homeworkId: params.homeworkId,
    assignmentTitle: params.assignmentTitle || existingData.assignmentTitle || existingData.homeworkTitle || '',
    homeworkTitle: params.assignmentTitle || existingData.assignmentTitle || existingData.homeworkTitle || '',
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail || existingData.studentEmail || '',
    class: normalizeClass(params.studentClass),
    subject: params.subject || existingData.subject || '',
    chapterId: params.chapterId || existingData.chapterId || '',
    chapterName: params.chapterName || existingData.chapterName || '',
    startedAt: existingData.startedAt || new Date().toISOString(),
    status: 'in_progress',
    score: currentScore,
    totalMarks,
    maxScore: totalMarks,
    percentage: Math.round((currentScore / (totalMarks || 1)) * 100),
    answers: existingData.answers || {}
  };

  await setDoc(docRef, payload, { merge: true });
  try {
    const hwSubRef = doc(db, 'homeworkSubmissions', submissionId);
    await setDoc(hwSubRef, payload, { merge: true });
  } catch (e) {
    // ignore
  }
}

/**
 * Save Student Homework In-Progress Answers without final submit
 */
export async function saveStudentHomeworkProgress(params: {
  homework: RealHomeworkDoc;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentClass: string;
  rawAnswers: Record<string, string>;
}): Promise<void> {
  const { homework, studentId, studentName, studentEmail, studentClass, rawAnswers } = params;
  const submissionId = `${homework.id}_${studentId}`;
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  const existingSnap = await getDoc(docRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : {};
  const startedAt = existingData.startedAt || new Date().toISOString();

  let partialScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const processedAnswers: Record<string, StudentAnswerItem> = {};

  (homework.questions || []).forEach((q) => {
    const studentAns = (rawAnswers[q.id] || '').trim();
    const qMaxMarks = Number(q.maxMarks) || 1;
    maxScore += qMaxMarks;

    if (q.type === 'objective') {
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      const givenAns = studentAns.toLowerCase();
      const isAnswered = studentAns.length > 0;

      const isCorrect = isAnswered && !!correctAns && (
        correctAns === givenAns ||
        (givenAns.length === 1 && correctAns.startsWith(givenAns))
      );

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      const marksAwarded = isCorrect ? qMaxMarks : 0;
      partialScore += marksAwarded;

      processedAnswers[q.id] = {
        questionId: q.id,
        questionText: q.question,
        type: 'objective',
        studentAnswer: studentAns,
        options: q.options,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        maxMarks: qMaxMarks,
        autoEvaluated: true
      };
    } else {
      if (!studentAns) unansweredCount++;
      processedAnswers[q.id] = {
        questionId: q.id,
        questionText: q.question,
        type: 'subjective',
        studentAnswer: studentAns,
        marksAwarded: 0,
        maxMarks: qMaxMarks,
        autoEvaluated: false
      };
    }
  });

  const totalMarks = maxScore || homework.totalMarks || 10;
  const percentage = Math.round((partialScore / (totalMarks || 1)) * 100);

  const progressData: RealHomeworkSubmissionDoc = {
    id: submissionId,
    submissionId,
    assignmentId: homework.id,
    homeworkId: homework.id,
    assignmentTitle: homework.title,
    homeworkTitle: homework.title,
    studentId,
    studentName,
    studentEmail: studentEmail || existingData.studentEmail || '',
    class: normalizeClass(studentClass),
    subject: homework.subject,
    chapterId: homework.chapterId,
    chapterName: homework.chapterName,
    answers: processedAnswers,
    startedAt,
    status: 'in_progress',
    score: partialScore,
    totalMarks,
    maxScore: totalMarks,
    percentage,
    correctCount,
    wrongCount,
    unansweredCount,
    teacherFeedback: 'Draft answers saved.'
  };

  await setDoc(docRef, progressData, { merge: true });
  try {
    const hwSubRef = doc(db, 'homeworkSubmissions', submissionId);
    await setDoc(hwSubRef, progressData, { merge: true });
  } catch (e) {
    // ignore
  }
}

/**
 * Submit student homework with AUTO EVALUATION for objective questions
 */
export async function submitStudentHomeworkWithAutoEvaluation(params: {
  homework: RealHomeworkDoc;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentClass: string;
  rawAnswers: Record<string, string>; // questionId -> studentAnswer text
}): Promise<{ score: number; maxScore: number; percentage: number; hasSubjectivePending: boolean; correctCount: number; wrongCount: number }> {
  const { homework, studentId, studentName, studentEmail, studentClass, rawAnswers } = params;
  const submissionId = `${homework.id}_${studentId}`;
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  const existingSnap = await getDoc(docRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : {};
  const startedAt = existingData.startedAt || new Date().toISOString();

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let hasSubjectivePending = false;
  const processedAnswers: Record<string, StudentAnswerItem> = {};

  // Auto-evaluation loop
  (homework.questions || []).forEach((q) => {
    const studentAns = (rawAnswers[q.id] || '').trim();
    const qMaxMarks = Number(q.maxMarks) || 1;
    maxScore += qMaxMarks;

    if (q.type === 'objective') {
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      const givenAns = studentAns.toLowerCase();
      const isAnswered = studentAns.length > 0;
      
      const isCorrect = isAnswered && !!correctAns && (
        correctAns === givenAns ||
        // Support matching option label like "A" or text value
        (givenAns.length === 1 && correctAns.startsWith(givenAns))
      );

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      const marksAwarded = isCorrect ? qMaxMarks : 0;
      totalScore += marksAwarded;

      processedAnswers[q.id] = {
        questionId: q.id,
        questionText: q.question,
        type: 'objective',
        studentAnswer: studentAns,
        options: q.options,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        maxMarks: qMaxMarks,
        autoEvaluated: true
      };
    } else {
      // Subjective: Short answer / Problem
      hasSubjectivePending = true;
      if (!studentAns) unansweredCount++;
      processedAnswers[q.id] = {
        questionId: q.id,
        questionText: q.question,
        type: 'subjective',
        studentAnswer: studentAns,
        marksAwarded: 0,
        maxMarks: qMaxMarks,
        autoEvaluated: false
      };
    }
  });

  const nowIso = new Date().toISOString();
  const totalMarks = maxScore || homework.totalMarks || 10;
  const percentage = Math.round((totalScore / (totalMarks || 1)) * 100);

  // Check if submitted after due date
  const isLate = homework.dueDate && new Date(homework.dueDate).getTime() < new Date(nowIso).getTime();
  const submissionStatus: SubmissionStatus = isLate ? 'late' : 'submitted';

  const submissionData: RealHomeworkSubmissionDoc = {
    id: submissionId,
    submissionId,
    assignmentId: homework.id,
    homeworkId: homework.id,
    assignmentTitle: homework.title,
    homeworkTitle: homework.title,
    studentId,
    studentName,
    studentEmail: studentEmail || existingData.studentEmail || '',
    class: normalizeClass(studentClass),
    subject: homework.subject,
    chapterId: homework.chapterId,
    chapterName: homework.chapterName,
    answers: processedAnswers,
    startedAt,
    submittedAt: nowIso,
    status: submissionStatus,
    score: totalScore,
    totalMarks,
    maxScore: totalMarks,
    percentage,
    correctCount,
    wrongCount,
    unansweredCount,
    hasSubjectivePending,
    teacherFeedback: hasSubjectivePending 
      ? 'Objective questions auto-evaluated. Subjective answers submitted for teacher review.'
      : 'Auto-evaluated with stored answer keys. Great job!'
  };

  await setDoc(docRef, submissionData, { merge: true });

  // Dual write to homeworkSubmissions and legacy homework_submissions collection
  try {
    const hwSubRef = doc(db, 'homeworkSubmissions', submissionId);
    await setDoc(hwSubRef, submissionData, { merge: true });
  } catch (e) {
    // ignore
  }

  try {
    const legacyRef = doc(db, 'homework_submissions', submissionId);
    await setDoc(legacyRef, {
      id: submissionId,
      homeworkId: homework.id,
      homeworkTitle: homework.title,
      studentId,
      studentName,
      studentGrade: normalizeClass(studentClass),
      answersText: JSON.stringify(rawAnswers),
      submissionTime: nowIso,
      submittedAt: nowIso,
      status: 'Submitted',
      marks: totalScore,
      maxMarks: totalMarks,
      score: totalScore,
      totalMarks,
      percentage
    }, { merge: true });

    // Send Teacher Notification
    await addTeacherNotification({
      type: 'homework_submission',
      title: `Homework Submitted: ${studentName}`,
      message: `${normalizeClass(studentClass)} • ${homework.title} • Score: ${totalScore}/${totalMarks} (${percentage}%)`,
      studentName,
      studentGrade: normalizeClass(studentClass)
    });
  } catch (err) {
    console.warn('Legacy homework_submissions dual-write note:', err);
  }

  return { score: totalScore, maxScore: totalMarks, percentage, hasSubjectivePending, correctCount, wrongCount };
}

/**
 * Teacher Reviews and Grades a Submission
 */
export async function teacherReviewHomeworkSubmission(params: {
  submissionId: string;
  subjectiveMarks: Record<string, number>; // questionId -> marks
  teacherFeedback: string;
  reviewerName?: string;
}): Promise<void> {
  const { submissionId, subjectiveMarks, teacherFeedback, reviewerName = 'Teacher' } = params;
  const assignSubRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  const hwSubRef = doc(db, 'homeworkSubmissions', submissionId);
  let snap = await getDoc(assignSubRef);
  if (!snap.exists()) {
    snap = await getDoc(hwSubRef);
  }

  if (!snap.exists()) {
    throw new Error(`Submission ${submissionId} not found in Firestore.`);
  }

  const data = snap.data() as RealHomeworkSubmissionDoc;
  const updatedAnswers = { ...data.answers };
  let newTotalScore = 0;

  // Recalculate score combining objective auto-marks and teacher's subjective marks
  Object.keys(updatedAnswers).forEach((qId) => {
    const item = updatedAnswers[qId];
    if (item.type === 'subjective') {
      const awarded = Math.min(
        Math.max(0, Number(subjectiveMarks[qId]) || 0),
        item.maxMarks
      );
      item.marksAwarded = awarded;
    }
    newTotalScore += (Number(item.marksAwarded) || 0);
  });

  const nowIso = new Date().toISOString();

  const reviewPayload = {
    answers: updatedAnswers,
    score: newTotalScore,
    status: 'Reviewed',
    hasSubjectivePending: false,
    teacherFeedback: teacherFeedback.trim(),
    reviewedAt: nowIso,
    reviewedBy: reviewerName
  };

  await setDoc(assignSubRef, reviewPayload, { merge: true });
  try {
    await setDoc(hwSubRef, reviewPayload, { merge: true });
  } catch (e) {
    // ignore
  }

  // Update legacy record
  try {
    const legacyRef = doc(db, 'homework_submissions', submissionId);
    await setDoc(legacyRef, {
      status: 'Graded',
      marks: newTotalScore,
      remarks: teacherFeedback,
      gradedAt: nowIso,
      teacherName: reviewerName
    }, { merge: true });
  } catch (err) {
    console.warn('Legacy grade sync note:', err);
  }
}
