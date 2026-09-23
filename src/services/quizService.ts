import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizDoc, QuizQuestion, QuizAttemptDoc, QuestionResult } from '../types/quiz';
import { GRAND_MOCK_100_QUESTIONS } from '../data/grandMockTestData';
import { recordRealStudentEvent } from './studentActivityService';

export const QUIZZES_COLLECTION = 'quizzes';
export const QUIZ_ATTEMPTS_COLLECTION = 'quizAttempts';

/**
 * Maps raw mock question dataset to strictly formatted QuizQuestion items
 */
function mapQuestionsToQuizQuestions(questions: typeof GRAND_MOCK_100_QUESTIONS, idPrefix = 'q'): QuizQuestion[] {
  return questions.map((q, idx) => {
    const qNum = idx + 1;
    const paddedId = `${idPrefix}_${String(qNum).padStart(3, '0')}`;
    const correctOpt = q.options[q.correctAnswer] || q.options[0];
    return {
      questionId: paddedId,
      questionText: q.question,
      options: [q.options[0], q.options[1], q.options[2], q.options[3]],
      correctAnswer: correctOpt,
      marks: q.marks || 1,
      explanation: q.explanation || 'Refer to AP SCERT standard syllabus and textbook.'
    };
  });
}

/**
 * Seed authentic AP SSC Class 10 Quizzes and 100-Question Mock Test into Firestore if empty
 */
export async function seedAuthoritativeQuizzesIfEmpty(): Promise<void> {
  try {
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const checkGrandMock = await getDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_grand_mock_1'));
    
    if (checkGrandMock.exists()) {
      return; // Already seeded
    }

    console.log('Seeding authentic AP SSC Class 10 Mock Tests to Firestore...');
    const nowIso = new Date().toISOString();

    // 1. 100-Question Grand Board Mock Test (All 4 core subjects)
    const grand100Questions = mapQuestionsToQuizQuestions(GRAND_MOCK_100_QUESTIONS, 'grand');
    if (grand100Questions.length === 100) {
      const grandMockDoc: QuizDoc = {
        quizId: 'ap_ssc_10_grand_mock_1',
        board: 'AP SSC',
        class: 10,
        subject: 'All Subjects',
        chapterId: 'comprehensive',
        chapterName: 'Full Board Syllabus Grand Mock Test',
        quizType: 'Mock Test',
        title: 'AP SSC Class 10 State Board Grand Mock Examination (100 Questions)',
        durationMinutes: 180,
        totalQuestions: 100,
        totalMarks: 100,
        questions: grand100Questions,
        createdBy: 'AP SCERT Academic Directorate',
        createdAt: nowIso,
        publishedAt: nowIso,
        status: 'published'
      };
      await setDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_grand_mock_1'), grandMockDoc);
    }

    // 2. Mathematics Board Mock Test (25 Questions)
    const mathRaw = GRAND_MOCK_100_QUESTIONS.filter(q => q.subject === 'Mathematics');
    const mathQuestions = mapQuestionsToQuizQuestions(mathRaw, 'math');
    const mathMockDoc: QuizDoc = {
      quizId: 'ap_ssc_10_math_mock_1',
      board: 'AP SSC',
      class: 10,
      subject: 'Mathematics',
      chapterId: 'math_all',
      chapterName: 'Real Numbers, Sets, Polynomials & Trigonometry',
      quizType: 'Mock Test',
      title: 'AP SSC Class 10 Mathematics Board Mock Test',
      durationMinutes: 45,
      totalQuestions: mathQuestions.length,
      totalMarks: mathQuestions.length,
      questions: mathQuestions,
      createdBy: 'AP SCERT Mathematics Board Committee',
      createdAt: nowIso,
      publishedAt: nowIso,
      status: 'published'
    };
    await setDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_math_mock_1'), mathMockDoc);

    // 3. Physical Science Board Mock Test (25 Questions)
    const physicsRaw = GRAND_MOCK_100_QUESTIONS.filter(q => q.subject === 'Physical Science');
    const physicsQuestions = mapQuestionsToQuizQuestions(physicsRaw, 'phys');
    const physicsMockDoc: QuizDoc = {
      quizId: 'ap_ssc_10_physical_science_mock_1',
      board: 'AP SSC',
      class: 10,
      subject: 'Physical Science',
      chapterId: 'phys_all',
      chapterName: 'Heat, Light Refraction, Electric Current & Carbon Compounds',
      quizType: 'Mock Test',
      title: 'AP SSC Class 10 Physical Science Board Mock Test',
      durationMinutes: 45,
      totalQuestions: physicsQuestions.length,
      totalMarks: physicsQuestions.length,
      questions: physicsQuestions,
      createdBy: 'AP SCERT Science Faculty Council',
      createdAt: nowIso,
      publishedAt: nowIso,
      status: 'published'
    };
    await setDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_physical_science_mock_1'), physicsMockDoc);

    // 4. Biological Science Board Mock Test (25 Questions)
    const bioRaw = GRAND_MOCK_100_QUESTIONS.filter(q => q.subject === 'Biological Science');
    const bioQuestions = mapQuestionsToQuizQuestions(bioRaw, 'bio');
    const bioMockDoc: QuizDoc = {
      quizId: 'ap_ssc_10_biological_science_mock_1',
      board: 'AP SSC',
      class: 10,
      subject: 'Biological Science',
      chapterId: 'bio_all',
      chapterName: 'Nutrition, Respiration, Excretion & Heredity',
      quizType: 'Mock Test',
      title: 'AP SSC Class 10 Biological Science Board Mock Test',
      durationMinutes: 45,
      totalQuestions: bioQuestions.length,
      totalMarks: bioQuestions.length,
      questions: bioQuestions,
      createdBy: 'AP SCERT Biological Sciences Division',
      createdAt: nowIso,
      publishedAt: nowIso,
      status: 'published'
    };
    await setDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_biological_science_mock_1'), bioMockDoc);

    // 5. Social Studies Board Mock Test (25 Questions)
    const socialRaw = GRAND_MOCK_100_QUESTIONS.filter(q => q.subject === 'Social Studies');
    const socialQuestions = mapQuestionsToQuizQuestions(socialRaw, 'soc');
    const socialMockDoc: QuizDoc = {
      quizId: 'ap_ssc_10_social_studies_mock_1',
      board: 'AP SSC',
      class: 10,
      subject: 'Social Studies',
      chapterId: 'soc_all',
      chapterName: 'India Relief Features, National Movement & Climate',
      quizType: 'Mock Test',
      title: 'AP SSC Class 10 Social Studies Board Mock Test',
      durationMinutes: 45,
      totalQuestions: socialQuestions.length,
      totalMarks: socialQuestions.length,
      questions: socialQuestions,
      createdBy: 'AP SCERT Social Studies Committee',
      createdAt: nowIso,
      publishedAt: nowIso,
      status: 'published'
    };
    await setDoc(doc(db, QUIZZES_COLLECTION, 'ap_ssc_10_social_studies_mock_1'), socialMockDoc);

    console.log('Seeded 5 authentic AP SSC Class 10 mock tests to Firestore quizzes collection.');
  } catch (err) {
    console.error('Error seeding authoritative quizzes:', err);
  }
}

/**
 * Parse numeric class from any grade representation e.g. "Class 10" -> 10, 10 -> 10
 * Returns null if missing or invalid - NEVER defaults to 5!
 */
export function parseClassNumber(cls: string | number | null | undefined): number | null {
  if (cls === null || cls === undefined) return null;
  if (typeof cls === 'number') return cls;
  const match = String(cls).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Subscribes to published quizzes for the student's exact class.
 * Never displays Class 10 tests to other classes or vice-versa.
 */
export function subscribeToClassQuizzes(
  studentClass: string | number | null | undefined,
  callback: (quizzes: QuizDoc[]) => void,
  subjectFilter?: string
) {
  const classNum = parseClassNumber(studentClass);
  if (!classNum) {
    // If class is missing, return empty array - do not assume Class 5!
    callback([]);
    return () => {};
  }

  // Ensure initial quizzes are seeded
  seedAuthoritativeQuizzesIfEmpty().catch(console.warn);

  const quizzesRef = collection(db, QUIZZES_COLLECTION);
  // Query quizzes for this class and status published
  const q = query(
    quizzesRef,
    where('class', '==', classNum),
    where('status', '==', 'published')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      let list: QuizDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          quizId: docSnap.id,
          id: docSnap.id
        } as QuizDoc;
      });

      // Filter by subject if specified and not 'All'
      if (subjectFilter && subjectFilter !== 'All' && subjectFilter !== 'All Subjects') {
        list = list.filter(
          (item) => item.subject === subjectFilter || item.subject === 'All Subjects'
        );
      }

      // Sort with 100-question grand mock test on top, then by title
      list.sort((a, b) => {
        if (a.totalQuestions === 100 && b.totalQuestions !== 100) return -1;
        if (b.totalQuestions === 100 && a.totalQuestions !== 100) return 1;
        return a.title.localeCompare(b.title);
      });

      callback(list);
    },
    (err) => {
      console.warn('Error subscribing to class quizzes:', err);
      callback([]);
    }
  );
}

/**
 * Fetch a single quiz by ID with full questions
 */
export async function fetchQuizById(quizId: string): Promise<QuizDoc | null> {
  try {
    const snap = await getDoc(doc(db, QUIZZES_COLLECTION, quizId));
    if (!snap.exists()) return null;
    return {
      ...snap.data(),
      quizId: snap.id,
      id: snap.id
    } as QuizDoc;
  } catch (err) {
    console.error(`Error fetching quiz ${quizId}:`, err);
    return null;
  }
}

/**
 * Calculates genuine score, generates QuestionResults, writes to quizAttempts in Firestore,
 * and records student activity.
 */
export async function submitQuizAttempt(
  quiz: QuizDoc,
  student: {
    id: string;
    name: string;
    email: string;
    class: number;
    board: string;
  },
  answers: Record<string, string>, // questionId -> studentAnswer string
  startedAt: string
): Promise<QuizAttemptDoc> {
  const submittedAt = new Date().toISOString();
  const attemptId = `att_${Date.now()}_${student.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;
  const quizQuestions = quiz?.questions || [];
  const totalMarks = quiz?.totalMarks || (quizQuestions.length > 0 ? quizQuestions.reduce((sum, q) => sum + (q.marks || 1), 0) : 100);

  const questionResults: QuestionResult[] = quizQuestions.map((q) => {
    const studentAns = answers[q.questionId] !== undefined ? answers[q.questionId] : null;
    const maxMarks = q.marks || 1;

    if (studentAns === null || studentAns.trim() === '') {
      unansweredCount++;
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        studentAnswer: null,
        correctAnswer: q.correctAnswer,
        isCorrect: false,
        marksAwarded: 0,
        maxMarks,
        explanation: q.explanation || 'Refer to AP SSC curriculum textbook.'
      };
    }

    const isMatch = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

    if (isMatch) {
      correctCount++;
      totalScore += maxMarks;
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect: true,
        marksAwarded: maxMarks,
        maxMarks,
        explanation: q.explanation || 'Correct solution.'
      };
    } else {
      wrongCount++;
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect: false,
        marksAwarded: 0,
        maxMarks,
        explanation: q.explanation || 'Refer to the correct formula and theory.'
      };
    }
  });

  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  const attemptDoc: QuizAttemptDoc = {
    attemptId,
    id: attemptId,
    quizId: quiz.quizId,
    quizTitle: quiz.title,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    class: student.class,
    board: student.board || 'AP SSC',
    subject: quiz.subject,
    startedAt,
    submittedAt,
    answers,
    questionResults,
    correctCount,
    wrongCount,
    unansweredCount,
    score: totalScore,
    totalMarks,
    percentage,
    status: 'submitted'
  };

  // 1. Direct Firestore write to quizAttempts collection
  try {
    await setDoc(doc(db, QUIZ_ATTEMPTS_COLLECTION, attemptId), attemptDoc);
  } catch (dbErr) {
    console.error('Error saving quiz attempt to Firestore:', dbErr);
  }

  // 2. Also attempt server-side verification endpoint if available
  try {
    await fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: quiz.quizId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentClass: student.class,
        board: student.board || 'AP SSC',
        answers,
        startedAt
      })
    }).catch(() => null);
  } catch (e) {
    // Non-blocking server sync
  }

  // 3. Log real student activity event
  try {
    await recordRealStudentEvent({
      studentUid: student.id,
      studentName: student.name,
      studentEmail: student.email,
      class: `Class ${student.class}`,
      subject: quiz.subject,
      chapter: quiz.chapterName,
      eventType: 'MOCK_SUBMITTED',
      eventDetails: `Submitted ${quiz.title}: Scored ${totalScore}/${totalMarks} (${percentage}%)`,
      metadata: {
        quizId: quiz.quizId,
        score: totalScore,
        totalMarks,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount
      }
    });
  } catch (e) {
    console.warn('Error recording student activity event:', e);
  }

  return attemptDoc;
}

/**
 * Real-time subscription to ALL quiz attempts for MDM and Teacher Monitoring.
 * Automatically updates without page refresh on every student submission!
 */
export function subscribeToAllQuizAttempts(callback: (attempts: QuizAttemptDoc[]) => void) {
  const attemptsRef = collection(db, QUIZ_ATTEMPTS_COLLECTION);
  const q = query(attemptsRef, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const attempts = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          attemptId: docSnap.id,
          id: docSnap.id
        } as QuizAttemptDoc;
      });
      callback(attempts);
    },
    (err) => {
      console.warn('Error subscribing to quiz attempts, falling back to unordered query:', err);
      // Fallback if composite index on submittedAt is building
      const fallbackQ = collection(db, QUIZ_ATTEMPTS_COLLECTION);
      return onSnapshot(fallbackQ, (snap) => {
        const attempts = snap.docs.map((d) => ({ ...d.data(), attemptId: d.id, id: d.id } as QuizAttemptDoc));
        attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        callback(attempts);
      });
    }
  );
}

/**
 * Real-time subscription to a single student's quiz attempts
 */
export function subscribeToStudentQuizAttempts(studentId: string, callback: (attempts: QuizAttemptDoc[]) => void) {
  const attemptsRef = collection(db, QUIZ_ATTEMPTS_COLLECTION);
  const q = query(attemptsRef, where('studentId', '==', studentId));

  return onSnapshot(
    q,
    (snapshot) => {
      const attempts = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          attemptId: docSnap.id,
          id: docSnap.id
        } as QuizAttemptDoc;
      });
      attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      callback(attempts);
    },
    (err) => {
      console.warn('Error subscribing to student quiz attempts:', err);
      callback([]);
    }
  );
}

/**
 * Save new teacher-created quiz to Firestore
 */
export async function createAndPublishQuiz(quizData: Omit<QuizDoc, 'quizId' | 'createdAt' | 'publishedAt'>): Promise<string> {
  const quizId = `quiz_${Date.now()}_${quizData.subject.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const nowIso = new Date().toISOString();

  // Validate Mock Test has required questions
  if (quizData.quizType === 'Mock Test' && quizData.totalQuestions === 100) {
    if (quizData.questions.length !== 100) {
      throw new Error(`A 100-Question Mock Test must contain exactly 100 real questions. Found ${quizData.questions.length}.`);
    }
  }

  const docData: QuizDoc = {
    ...quizData,
    quizId,
    id: quizId,
    createdAt: nowIso,
    publishedAt: nowIso
  };

  await setDoc(doc(db, QUIZZES_COLLECTION, quizId), docData);
  return quizId;
}
