import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PreviousPaper, PreviousPaperAttempt } from '../types/previousPaper';
import { logStudentActivity } from './studentFirestoreService';

const PREVIOUS_PAPERS_COLLECTION = 'previous_papers';
const ATTEMPTS_COLLECTION = 'previous_paper_attempts';

/**
 * Realtime subscriber for Previous Papers filtered by class & published status.
 * Relies strictly on Firestore source of truth.
 */
export function subscribeToClassPreviousPapers(
  classGrade: string,
  callback: (papers: PreviousPaper[]) => void,
  onlyPublished: boolean = true
) {
  const targetClassNum = classGrade ? classGrade.replace(/\D/g, '') : '';

  const unsub = onSnapshot(
    collection(db, PREVIOUS_PAPERS_COLLECTION),
    (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PreviousPaper));

      // Filter strictly by class (e.g. Class 5, Class 6, etc.)
      let filtered = docs.filter(p => {
        if (!classGrade) return true;
        const pClassStr = String(p.class || p.classGrade || '');
        const pClassNum = pClassStr.replace(/\D/g, '');
        if (targetClassNum && pClassNum) {
          return targetClassNum === pClassNum;
        }
        return pClassStr.toLowerCase() === classGrade.toLowerCase();
      });

      if (onlyPublished) {
        filtered = filtered.filter(p => p.published !== false);
      }

      // Sort by newest year, then creation date
      filtered.sort((a, b) => {
        const yA = parseInt(String(a.year), 10) || 0;
        const yB = parseInt(String(b.year), 10) || 0;
        if (yB !== yA) return yB - yA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      callback(filtered);
    },
    (err) => {
      console.warn('Firestore previous_papers listener notice:', err);
      callback([]);
    }
  );

  return unsub;
}

/**
 * Teacher/Admin: Subscribe to ALL previous papers across all classes for management.
 */
export function subscribeToAllPreviousPapers(
  callback: (papers: PreviousPaper[]) => void
) {
  const unsub = onSnapshot(
    collection(db, PREVIOUS_PAPERS_COLLECTION),
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PreviousPaper));
      docs.sort((a, b) => {
        const yA = parseInt(String(a.year), 10) || 0;
        const yB = parseInt(String(b.year), 10) || 0;
        if (yB !== yA) return yB - yA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      callback(docs);
    },
    (err) => {
      console.warn('Firestore subscribeToAllPreviousPapers notice:', err);
      callback([]);
    }
  );

  return unsub;
}

/**
 * Add a new previous paper to Firestore.
 */
export async function addPreviousPaperDoc(paperData: Partial<PreviousPaper>): Promise<PreviousPaper> {
  const paperId = paperData.id || `pyq_c5_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullPaper: PreviousPaper = {
    id: paperId,
    title: paperData.title || `Class 5 ${paperData.subject || 'Mathematics'} Examination Paper ${paperData.year || '2025'}`,
    class: paperData.class || 5,
    classGrade: paperData.classGrade || `Class ${paperData.class || 5}`,
    subjectId: paperData.subjectId || (paperData.subject?.toLowerCase().replace(/\s+/g, '_') || 'mathematics'),
    subject: paperData.subject || 'Mathematics',
    board: paperData.board || 'AP & Telangana State Board (SCERT)',
    year: String(paperData.year || '2025'),
    examType: paperData.examType || 'Annual Examination',
    medium: paperData.medium || 'English',
    totalMarks: paperData.totalMarks || 50,
    durationMinutes: paperData.durationMinutes || 120,
    duration: paperData.duration || '2 Hours',
    fileSize: paperData.fileSize || '2.0 MB',
    pageCount: paperData.pageCount || 4,
    pdfUrl: paperData.pdfUrl || paperData.questionPaperUrl || '',
    questionPaperUrl: paperData.questionPaperUrl || paperData.pdfUrl || '',
    answerKeyUrl: paperData.answerKeyUrl || '',
    published: paperData.published !== undefined ? paperData.published : true,
    hasPractice: Boolean(paperData.hasPractice && paperData.questions && paperData.questions.length > 0),
    isOfficial: paperData.isOfficial !== undefined ? paperData.isOfficial : true,
    instructions: paperData.instructions || [
      'All questions are compulsory.',
      'Read every question carefully before answering.'
    ],
    sections: paperData.sections || [],
    questions: paperData.questions || [],
    downloadCount: paperData.downloadCount || 0,
    createdAt: paperData.createdAt || now,
    updatedAt: now,
    uploadedBy: paperData.uploadedBy || 'Senior Faculty'
  };

  const docRef = doc(db, PREVIOUS_PAPERS_COLLECTION, paperId);
  await setDoc(docRef, fullPaper, { merge: true });

  return fullPaper;
}

/**
 * Update an existing previous paper in Firestore.
 */
export async function updatePreviousPaperDoc(
  paperId: string,
  updateData: Partial<PreviousPaper>
): Promise<void> {
  const docRef = doc(db, PREVIOUS_PAPERS_COLLECTION, paperId);
  const payload = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  if (updateData.questions) {
    payload.hasPractice = updateData.questions.length > 0;
  }
  await updateDoc(docRef, payload);
}

/**
 * Toggle publish status of a previous paper in Firestore.
 */
export async function togglePublishPreviousPaperDoc(
  paperId: string,
  publishedStatus: boolean
): Promise<void> {
  const docRef = doc(db, PREVIOUS_PAPERS_COLLECTION, paperId);
  await updateDoc(docRef, {
    published: publishedStatus,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Delete a previous paper from Firestore.
 */
export async function deletePreviousPaperDoc(paperId: string): Promise<void> {
  const docRef = doc(db, PREVIOUS_PAPERS_COLLECTION, paperId);
  await deleteDoc(docRef);
}

/**
 * Save student attempt when practicing a previous paper.
 * Also logs to student's activity feed and updates recent learning history.
 */
export async function savePreviousPaperAttempt(
  attempt: Omit<PreviousPaperAttempt, 'id' | 'attemptedAt' | 'status'>
): Promise<PreviousPaperAttempt> {
  const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullAttempt: PreviousPaperAttempt = {
    ...attempt,
    id: attemptId,
    attemptedAt: now,
    status: 'completed'
  };

  try {
    // 1. Save to previous_paper_attempts collection
    const docRef = doc(db, ATTEMPTS_COLLECTION, attemptId);
    await setDoc(docRef, fullAttempt, { merge: true });

    // 2. Log in student activity logs so it displays in "My Learning" and dashboard
    await logStudentActivity(
      attempt.studentId,
      'exam_completed',
      `Completed ${attempt.paperTitle} (${attempt.year}) - Score: ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`,
      attempt.subject || 'Previous Paper',
      50
    );
  } catch (err) {
    console.warn('Notice saving previous paper attempt:', err);
  }

  return fullAttempt;
}

/**
 * Subscribe to student's previous paper attempts.
 */
export function subscribeToStudentPaperAttempts(
  studentId: string,
  callback: (attempts: PreviousPaperAttempt[]) => void
) {
  if (!studentId) {
    callback([]);
    return () => {};
  }

  const unsub = onSnapshot(
    collection(db, ATTEMPTS_COLLECTION),
    (snap) => {
      const allAttempts = snap.docs.map(d => ({ id: d.id, ...d.data() } as PreviousPaperAttempt));
      const studentAttempts = allAttempts.filter(a => a.studentId === studentId);
      studentAttempts.sort((a, b) => new Date(b.attemptedAt || 0).getTime() - new Date(a.attemptedAt || 0).getTime());
      callback(studentAttempts);
    },
    (err) => {
      console.warn('Firestore subscribeToStudentPaperAttempts notice:', err);
      callback([]);
    }
  );

  return unsub;
}
