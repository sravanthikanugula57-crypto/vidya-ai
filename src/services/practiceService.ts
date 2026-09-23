import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export function handleFirestoreError(error: unknown, operation: OperationType, path: string): void {
  console.warn(`Firestore Notice [${operation}] at path '${path}':`, error);
}

// ---------------------------------------------------------------------------
// TYPES & INTERFACES (Strictly adhering to Requirements 2 & 8)
// ---------------------------------------------------------------------------

export interface PracticeQuestionItem {
  id?: string;
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number | string; // 0-indexed number or string matching option
  explanation: string;
  marks: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  questionType?: 'MCQ' | 'True / False' | 'Fill in the Blank' | string;
  // Compatibility alias
  question?: string;
}

export interface PracticeSetDoc {
  id: string;
  practiceSetId: string;
  board?: string;
  class: number | string; // e.g. 10 or "Class 10"
  subject: string;
  subjectId?: string;
  subjectName?: string;
  chapterId: string;
  chapterName: string;
  title: string;
  description: string;
  language?: string;
  isAiGenerated?: boolean;
  questions: PracticeQuestionItem[];
  totalQuestions: number;
  marksPerQuestion: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived' | string;
  // Backward compatibility optional fields
  published?: boolean;
  totalMarks?: number;
  category?: 'quick' | 'concept' | 'chapter' | 'revision' | 'challenge' | 'practice' | string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed' | 'Challenge' | string;
  questionType?: string;
  numberOfQuestions?: number;
  estimatedTime?: number;
  duration?: number;
  topicId?: string;
}

export interface QuestionResultItem {
  questionId: string;
  questionText: string;
  selectedAnswer: number | string | null;
  selectedOptionText?: string;
  correctAnswer: number | string;
  correctOptionText?: string;
  isCorrect: boolean;
  explanation: string;
  marks: number;
}

export interface PracticeAttemptDoc {
  id: string;
  attemptId: string;
  practiceSetId: string;
  practiceSetTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  class: number | string;
  subject: string;
  subjectId?: string;
  subjectName?: string;
  chapterId: string;
  chapterName: string;
  startedAt: string;
  submittedAt: string;
  answers: Record<string, number | string | null>;
  questionResults: QuestionResultItem[];
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'completed' | string;
  // Compatibility aliases
  correctAnswers?: number;
  incorrectAnswers?: number;
  unanswered?: number;
  timeSpentSeconds?: number;
}

// REMOVED FAKE DATA: No mock questions, dummy arrays, or hardcoded practice sets
export const DEFAULT_PRACTICE_SETS: PracticeSetDoc[] = [];

// Deprecated no-op: Seeding is completely disabled as per user instruction
export async function seedClass5PracticeSetsIfEmpty(): Promise<boolean> {
  return false;
}

// ---------------------------------------------------------------------------
// MATCHING & FILTERING UTILITIES (Strict class matching, no fallback)
// ---------------------------------------------------------------------------

export function parseNumericClass(cls: any): number | null {
  if (cls === null || cls === undefined) return null;
  if (typeof cls === 'number' && !isNaN(cls)) return cls;
  const match = String(cls).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function isMatchingClass(itemClass: any, targetClass: any): boolean {
  if (targetClass === null || targetClass === undefined) return false;
  const targetNum = parseNumericClass(targetClass);
  const itemNum = parseNumericClass(itemClass);
  if (targetNum !== null && itemNum !== null) {
    return targetNum === itemNum;
  }
  const cleanTarget = String(targetClass).toLowerCase().replace(/\s+/g, '');
  const cleanItem = String(itemClass).toLowerCase().replace(/\s+/g, '');
  return cleanItem === cleanTarget;
}

export function isMatchingBoard(itemBoard: any, targetBoard: any): boolean {
  if (!targetBoard || !itemBoard) return true;
  const t = String(targetBoard).trim().toLowerCase();
  const i = String(itemBoard).trim().toLowerCase();
  if (t === 'all' || i === 'all' || !t || !i) return true;
  return i.includes(t) || t.includes(i);
}

export function isMatchingSubject(docSubjId: any, docSubjName: any, targetSubj: any): boolean {
  if (!targetSubj || targetSubj === 'all' || targetSubj === 'All' || targetSubj === 'All Subjects') return true;
  const normTarget = String(targetSubj).toLowerCase().replace(/^(subj_|c\d+_)/, '').trim();
  const normDocId = String(docSubjId || '').toLowerCase().replace(/^(subj_|c\d+_)/, '').trim();
  const normDocName = String(docSubjName || '').toLowerCase().trim();

  return (
    normDocId === normTarget ||
    normDocName === normTarget ||
    normDocId.includes(normTarget) ||
    normTarget.includes(normDocId) ||
    normDocName.includes(normTarget) ||
    normTarget.includes(normDocName)
  );
}

export function isMatchingChapter(docChapId: any, docChapName: any, targetChap: any): boolean {
  if (!targetChap || targetChap === 'all' || targetChap === 'All') return true;
  const normTarget = String(targetChap).toLowerCase().replace(/^(chap_|c\d+_[a-z]+_)/, '').trim();
  const normDocId = String(docChapId || '').toLowerCase().replace(/^(chap_|c\d+_[a-z]+_)/, '').trim();
  const normDocName = String(docChapName || '').toLowerCase().trim();

  return (
    normDocId === normTarget ||
    normDocName === normTarget ||
    normDocId.includes(normTarget) ||
    normTarget.includes(normDocId) ||
    normDocName.includes(normTarget) ||
    normTarget.includes(normDocName)
  );
}

// ---------------------------------------------------------------------------
// DATA NORMALIZER HELPER
// Ensures every PracticeSetDoc fetched from Firestore conforms to required structure
// ---------------------------------------------------------------------------

export function normalizePracticeSetDoc(docData: any, docId: string): PracticeSetDoc {
  const rawQuestions: any[] = Array.isArray(docData.questions) ? docData.questions : [];
  
  const normalizedQuestions: PracticeQuestionItem[] = rawQuestions.map((q, idx) => {
    const qId = q.questionId || q.id || `q_${docId}_${idx + 1}`;
    const qText = q.questionText || q.question || `Question ${idx + 1}`;
    const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
    const corrAns = q.correctAnswer !== undefined ? q.correctAnswer : 0;
    const expl = q.explanation || 'No explanation provided.';
    const marks = typeof q.marks === 'number' && q.marks > 0 ? q.marks : 1;

    return {
      id: qId,
      questionId: qId,
      questionText: qText,
      question: qText,
      options: opts,
      correctAnswer: corrAns,
      explanation: expl,
      marks: marks,
      difficulty: q.difficulty || 'Medium',
      questionType: q.questionType || 'MCQ'
    };
  });

  const subjectName = docData.subject || docData.subjectName || 'General';
  const chapterId = docData.chapterId || `chap_1`;
  const chapterName = docData.chapterName || docData.chapterTitle || 'Chapter 1';
  const marksPerQ = typeof docData.marksPerQuestion === 'number' ? docData.marksPerQuestion : 1;
  const totalQuestions = normalizedQuestions.length;
  const computedTotalMarks = normalizedQuestions.reduce((acc, q) => acc + (q.marks || marksPerQ), 0);

  const status = docData.status || (docData.published ? 'published' : 'draft');

  return {
    id: docId,
    practiceSetId: docData.practiceSetId || docId,
    board: docData.board || 'State Board (TG/AP)',
    class: docData.class !== undefined ? docData.class : (docData.grade || 10),
    subject: subjectName,
    subjectId: docData.subjectId || subjectName.toLowerCase(),
    subjectName: subjectName,
    chapterId: chapterId,
    chapterName: chapterName,
    title: docData.title || 'Practice Set',
    description: docData.description || '',
    language: docData.language || 'English',
    isAiGenerated: Boolean(docData.isAiGenerated),
    questions: normalizedQuestions,
    totalQuestions: totalQuestions,
    marksPerQuestion: marksPerQ,
    totalMarks: docData.totalMarks || computedTotalMarks,
    createdBy: docData.createdBy || docData.author || 'Senior Faculty',
    createdAt: docData.createdAt || new Date().toISOString(),
    updatedAt: docData.updatedAt || docData.createdAt || new Date().toISOString(),
    publishedAt: docData.publishedAt || (status === 'published' ? docData.createdAt || new Date().toISOString() : ''),
    status: status,
    published: status === 'published',
    category: docData.category || 'practice',
    difficulty: docData.difficulty || 'Medium',
    questionType: docData.questionType || 'MCQ',
    duration: docData.duration || docData.timeLimitMinutes || 20,
    estimatedTime: docData.estimatedTime || docData.duration || docData.timeLimitMinutes || 20
  };
}

// ---------------------------------------------------------------------------
// REAL FIRESTORE FETCHERS & LISTENERS (Source of Truth)
// ---------------------------------------------------------------------------

/**
 * Fetch all published practice sets strictly from Firestore.
 * If no documents exist in Firestore, returns an empty array.
 * Never loads fake or fallback questions.
 */
export async function fetchPublishedPracticeSets(
  classGrade?: string | number | null,
  board?: string | null,
  subjectId?: string,
  chapterId?: string
): Promise<PracticeSetDoc[]> {
  try {
    let rawDocs: { id: string; data: any }[] = [];

    // Query primary collection: practiceSets
    try {
      const snap = await getDocs(collection(db, 'practiceSets'));
      snap.docs.forEach(d => rawDocs.push({ id: d.id, data: d.data() }));
    } catch (e) {
      console.warn('Query practiceSets notice:', e);
    }

    // Also query alternate collection: practice_sets
    try {
      const altSnap = await getDocs(collection(db, 'practice_sets'));
      altSnap.docs.forEach(d => {
        if (!rawDocs.some(r => r.id === d.id)) {
          rawDocs.push({ id: d.id, data: d.data() });
        }
      });
    } catch (e) {
      console.warn('Query practice_sets notice:', e);
    }

    const normalized = rawDocs.map(r => normalizePracticeSetDoc(r.data, r.id));

    // Filter strictly by published status, class, board, subject, chapter
    const filtered = normalized.filter(set => {
      // 1. Must be published
      if (set.status !== 'published' && !set.published) return false;

      // 2. Class match (Strictly student's class, never fallback)
      if (classGrade && !isMatchingClass(set.class, classGrade)) return false;

      // 3. Board match
      if (board && !isMatchingBoard(set.board, board)) return false;

      // 4. Subject filter (if given)
      if (subjectId && subjectId !== 'all') {
        if (!isMatchingSubject(set.subjectId, set.subject, subjectId)) return false;
      }

      // 5. Chapter filter (if given)
      if (chapterId && chapterId !== 'all') {
        if (!isMatchingChapter(set.chapterId, set.chapterName, chapterId)) return false;
      }

      return true;
    });

    return filtered;
  } catch (error) {
    console.error('Error fetching real practice sets from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for published practice sets for a student's class.
 */
export function subscribeToPublishedPracticeSets(
  classGrade: string | number | null,
  board: string | null | undefined,
  onUpdate: (sets: PracticeSetDoc[]) => void
) {
  if (!classGrade) {
    onUpdate([]);
    return () => {};
  }

  const colRef = collection(db, 'practiceSets');

  return onSnapshot(colRef, (snap) => {
    const rawDocs = snap.docs.map(d => normalizePracticeSetDoc(d.data(), d.id));
    const filtered = rawDocs.filter(set => {
      if (set.status !== 'published' && !set.published) return false;
      if (!isMatchingClass(set.class, classGrade)) return false;
      if (board && !isMatchingBoard(set.board, board)) return false;
      return true;
    });
    onUpdate(filtered);
  }, (err) => {
    console.warn('subscribeToPublishedPracticeSets snapshot notice:', err);
  });
}

/**
 * Save practice attempt to Firestore (Requirement 8).
 * Stores complete attempt with answers and question results.
 */
export async function savePracticeAttemptToFirestore(
  attempt: PracticeAttemptDoc
): Promise<void> {
  const attemptId = attempt.attemptId || attempt.id || `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `practiceAttempts/${attemptId}`;

  const cleanDoc: PracticeAttemptDoc = {
    ...attempt,
    id: attemptId,
    attemptId: attemptId,
    submittedAt: attempt.submittedAt || new Date().toISOString(),
    status: attempt.status || 'completed',
    correctAnswers: attempt.correctCount,
    incorrectAnswers: attempt.wrongCount,
    unanswered: attempt.unansweredCount
  };

  try {
    const attemptRef = doc(db, 'practiceAttempts', attemptId);
    await setDoc(attemptRef, cleanDoc, { merge: true });

    // Dual-write to practice_attempts for compatibility
    try {
      const altRef = doc(db, 'practice_attempts', attemptId);
      await setDoc(altRef, cleanDoc, { merge: true });
    } catch (e) {}

    // Update student progress profile if studentId is present
    if (cleanDoc.studentId) {
      try {
        const progressRef = doc(db, 'progress', cleanDoc.studentId, 'practice_stats', cleanDoc.practiceSetId);
        await setDoc(progressRef, {
          practiceSetId: cleanDoc.practiceSetId,
          practiceSetTitle: cleanDoc.practiceSetTitle,
          class: cleanDoc.class,
          subject: cleanDoc.subject,
          chapterId: cleanDoc.chapterId,
          lastAttempt: cleanDoc.submittedAt,
          lastScore: cleanDoc.score,
          lastPercentage: cleanDoc.percentage,
          updatedAt: cleanDoc.submittedAt
        }, { merge: true });
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error saving real practice attempt to Firestore:', error);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to a specific student's practice attempts in real-time.
 */
export function subscribeToStudentPracticeAttempts(
  studentId: string,
  classGrade: string | number | null,
  onUpdate: (attempts: PracticeAttemptDoc[]) => void
) {
  if (!studentId) {
    onUpdate([]);
    return () => {};
  }

  const colRef = collection(db, 'practiceAttempts');

  return onSnapshot(colRef, (snap) => {
    let attempts = snap.docs.map(d => ({ id: d.id, ...d.data() } as PracticeAttemptDoc));
    
    // Filter by studentId and class if provided
    attempts = attempts.filter(att => {
      const matchesStudent = att.studentId === studentId || (att as any).userId === studentId;
      if (!matchesStudent) return false;
      if (classGrade && !isMatchingClass(att.class, classGrade)) return false;
      return true;
    });

    // Sort latest first
    attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    onUpdate(attempts);
  }, (err) => {
    console.warn('subscribeToStudentPracticeAttempts notice:', err);
    onUpdate([]);
  });
}

/**
 * Real-time listener for ALL practice attempts statewide / schoolwide (Requirement 9 & 10 for MDM/Teacher).
 */
export function subscribeToAllPracticeAttempts(
  onUpdate: (attempts: PracticeAttemptDoc[]) => void
) {
  const colRef = collection(db, 'practiceAttempts');

  return onSnapshot(colRef, (snap) => {
    const attempts = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        attemptId: data.attemptId || d.id,
        practiceSetId: data.practiceSetId || '',
        practiceSetTitle: data.practiceSetTitle || 'Practice Set',
        studentId: data.studentId || data.userId || 'Student',
        studentName: data.studentName || 'Student',
        studentEmail: data.studentEmail || '',
        class: data.class || 10,
        subject: data.subject || data.subjectName || 'General',
        chapterId: data.chapterId || '',
        chapterName: data.chapterName || '',
        startedAt: data.startedAt || data.submittedAt,
        submittedAt: data.submittedAt || new Date().toISOString(),
        answers: data.answers || {},
        questionResults: data.questionResults || [],
        correctCount: data.correctCount !== undefined ? data.correctCount : (data.correctAnswers || 0),
        wrongCount: data.wrongCount !== undefined ? data.wrongCount : (data.incorrectAnswers || 0),
        unansweredCount: data.unansweredCount !== undefined ? data.unansweredCount : (data.unanswered || 0),
        score: data.score || 0,
        totalMarks: data.totalMarks || 0,
        percentage: data.percentage || 0,
        status: data.status || 'completed'
      } as PracticeAttemptDoc;
    });

    attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    onUpdate(attempts);
  }, (err) => {
    console.warn('subscribeToAllPracticeAttempts notice:', err);
  });
}

/**
 * Teacher/Admin: Save a Practice Set as Draft in Firestore.
 * Drafts are strictly hidden from student views.
 */
export async function savePracticeSetDraft(
  practiceSet: Partial<PracticeSetDoc>
): Promise<PracticeSetDoc> {
  const setId = practiceSet.id || practiceSet.practiceSetId || `pset_${Date.now()}`;
  const now = new Date().toISOString();

  const questions: PracticeQuestionItem[] = (practiceSet.questions || []).map((q, idx) => ({
    id: q.questionId || q.id || `q_${setId}_${idx + 1}`,
    questionId: q.questionId || q.id || `q_${setId}_${idx + 1}`,
    questionText: q.questionText || q.question || `Question ${idx + 1}`,
    question: q.questionText || q.question || `Question ${idx + 1}`,
    options: q.options && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
    explanation: q.explanation || '',
    marks: q.marks || 1,
    difficulty: q.difficulty || practiceSet.difficulty || 'Medium',
    questionType: q.questionType || practiceSet.questionType || 'MCQ'
  }));

  const marksPerQ = practiceSet.marksPerQuestion || 1;
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || marksPerQ), 0);

  const cleanDoc: PracticeSetDoc = {
    id: setId,
    practiceSetId: setId,
    board: practiceSet.board || 'State Board (TG/AP)',
    class: practiceSet.class !== undefined ? practiceSet.class : 'Class 10',
    subject: practiceSet.subject || 'Mathematics',
    subjectId: practiceSet.subjectId || (practiceSet.subject || 'Mathematics').toLowerCase(),
    subjectName: practiceSet.subject || 'Mathematics',
    chapterId: practiceSet.chapterId || 'chap_1',
    chapterName: practiceSet.chapterName || 'Chapter 1',
    title: practiceSet.title || 'Draft Practice Set',
    description: practiceSet.description || '',
    language: practiceSet.language || 'English',
    isAiGenerated: practiceSet.isAiGenerated !== undefined ? practiceSet.isAiGenerated : true,
    questions: questions,
    totalQuestions: totalQuestions,
    marksPerQuestion: marksPerQ,
    totalMarks: totalMarks,
    createdBy: practiceSet.createdBy || 'Senior Faculty',
    createdAt: practiceSet.createdAt || now,
    updatedAt: now,
    publishedAt: '',
    status: 'draft',
    published: false,
    category: practiceSet.category || 'practice',
    difficulty: practiceSet.difficulty || 'Medium',
    questionType: practiceSet.questionType || 'MCQ',
    duration: practiceSet.duration || 20,
    estimatedTime: practiceSet.estimatedTime || 20
  };

  const setRef = doc(db, 'practiceSets', setId);
  await setDoc(setRef, cleanDoc, { merge: true });

  try {
    const altRef = doc(db, 'practice_sets', setId);
    await setDoc(altRef, cleanDoc, { merge: true });
  } catch (e) {}

  return cleanDoc;
}

/**
 * Teacher/Admin: Publish or update a Practice Set to Firestore.
 * Status becomes 'published' and publishedAt is stamped.
 * Real-time subscribers in Student Dashboard update immediately.
 */
export async function publishPracticeSet(
  practiceSet: Partial<PracticeSetDoc>
): Promise<PracticeSetDoc> {
  const setId = practiceSet.id || practiceSet.practiceSetId || `pset_${Date.now()}`;
  const now = new Date().toISOString();

  const questions: PracticeQuestionItem[] = (practiceSet.questions || []).map((q, idx) => ({
    id: q.questionId || q.id || `q_${setId}_${idx + 1}`,
    questionId: q.questionId || q.id || `q_${setId}_${idx + 1}`,
    questionText: q.questionText || q.question || `Question ${idx + 1}`,
    question: q.questionText || q.question || `Question ${idx + 1}`,
    options: q.options && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D'],
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
    explanation: q.explanation || '',
    marks: q.marks || 1,
    difficulty: q.difficulty || practiceSet.difficulty || 'Medium',
    questionType: q.questionType || practiceSet.questionType || 'MCQ'
  }));

  const marksPerQ = practiceSet.marksPerQuestion || 1;
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || marksPerQ), 0);

  const cleanDoc: PracticeSetDoc = {
    id: setId,
    practiceSetId: setId,
    board: practiceSet.board || 'State Board (TG/AP)',
    class: practiceSet.class !== undefined ? practiceSet.class : 'Class 10',
    subject: practiceSet.subject || 'Mathematics',
    subjectId: practiceSet.subjectId || (practiceSet.subject || 'Mathematics').toLowerCase(),
    subjectName: practiceSet.subject || 'Mathematics',
    chapterId: practiceSet.chapterId || 'chap_1',
    chapterName: practiceSet.chapterName || 'Chapter 1',
    title: practiceSet.title || 'New Practice Set',
    description: practiceSet.description || '',
    language: practiceSet.language || 'English',
    isAiGenerated: practiceSet.isAiGenerated !== undefined ? practiceSet.isAiGenerated : true,
    questions: questions,
    totalQuestions: totalQuestions,
    marksPerQuestion: marksPerQ,
    totalMarks: totalMarks,
    createdBy: practiceSet.createdBy || 'Senior Faculty',
    createdAt: practiceSet.createdAt || now,
    updatedAt: now,
    publishedAt: now,
    status: 'published',
    published: true,
    category: practiceSet.category || 'practice',
    difficulty: practiceSet.difficulty || 'Medium',
    questionType: practiceSet.questionType || 'MCQ',
    duration: practiceSet.duration || 20,
    estimatedTime: practiceSet.estimatedTime || 20
  };

  const setRef = doc(db, 'practiceSets', setId);
  await setDoc(setRef, cleanDoc, { merge: true });

  try {
    const altRef = doc(db, 'practice_sets', setId);
    await setDoc(altRef, cleanDoc, { merge: true });
  } catch (e) {}

  return cleanDoc;
}

/**
 * Teacher: Real-time listener for ALL practice sets (including drafts and published sets).
 */
export function subscribeToAllPracticeSets(
  onUpdate: (sets: PracticeSetDoc[]) => void
) {
  const colRef = collection(db, 'practiceSets');

  return onSnapshot(colRef, (snap) => {
    const sets = snap.docs.map(d => normalizePracticeSetDoc(d.data(), d.id));
    sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(sets);
  }, (err) => {
    console.warn('subscribeToAllPracticeSets notice:', err);
  });
}

/**
 * Teacher/Admin: Delete a practice set from Firestore
 */
export async function deletePracticeSetFromFirestore(setId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'practiceSets', setId));
  } catch (e) {}
  try {
    await deleteDoc(doc(db, 'practice_sets', setId));
  } catch (e) {}
}
