import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PracticeAttemptDoc, QuestionResultItem } from './practiceService';
import { QuizAttemptDoc, QuestionResult } from '../types/quiz';
import { RealHomeworkSubmissionDoc, StudentAnswerItem } from './realHomeworkService';

// ---------------------------------------------------------------------------
// REAL FIREBASE STUDENT ACCOUNTS CONFIGURATION (MDM DEMONSTRATION)
// ---------------------------------------------------------------------------
export interface RealMdmStudentDef {
  targetUid: string;
  name: string;
  email: string;
  rollNumber: string;
  class: number;
  grade: string;
  board: string;
  targetPracticeScore: number; // e.g. 9 / 10
  targetMockScore: number;     // e.g. 23 / 25
  homeworkStatus: 'submitted' | 'in_progress' | 'not_started';
  homeworkScore: number;
  homeworkFeedback: string;
  performanceTier: 'High Achiever' | 'Consistent Performer' | 'Needs Support';
}

export const REAL_MDM_STUDENTS: RealMdmStudentDef[] = [
  {
    targetUid: 'user_24331a4202_mvgrce_edu_in',
    name: 'Adduri Surendra',
    email: '24331A4202@mvgrce.edu.in',
    rollNumber: 'AP-10-4202',
    class: 10,
    grade: 'Class 10',
    board: 'AP_SSC',
    targetPracticeScore: 9, // 9/10 (90%)
    targetMockScore: 23,    // 23/25 (92%)
    homeworkStatus: 'submitted',
    homeworkScore: 18,      // 18/20
    homeworkFeedback: 'Outstanding step-by-step factorization and discriminant analysis. Very clear presentation of quadratic roots.',
    performanceTier: 'High Achiever'
  },
  {
    targetUid: 'user_24331a4260_mvgrce_edu_in',
    name: 'Make Praveen',
    email: '24331A4260@mvgrce.edu.in',
    rollNumber: 'AP-10-4260',
    class: 10,
    grade: 'Class 10',
    board: 'AP_SSC',
    targetPracticeScore: 7, // 7/10 (70%)
    targetMockScore: 17,    // 17/25 (68%)
    homeworkStatus: 'in_progress',
    homeworkScore: 0,
    homeworkFeedback: '',
    performanceTier: 'Consistent Performer'
  },
  {
    targetUid: 'user_24331a4264_mvgrce_edu_in',
    name: 'Marpina Yukthanjali',
    email: '24331A4264@mvgrce.edu.in',
    rollNumber: 'AP-10-4264',
    class: 10,
    grade: 'Class 10',
    board: 'AP_SSC',
    targetPracticeScore: 5, // 5/10 (50%)
    targetMockScore: 12,    // 12/25 (48%)
    homeworkStatus: 'not_started',
    homeworkScore: 0,
    homeworkFeedback: '',
    performanceTier: 'Needs Support'
  }
];

// Published resource identifiers for Class 10 AP SSC
export const MDM_PRACTICE_SET_ID = 'pset_1789895080123'; // Class 10 Mathematics - Real Numbers Practice Set
export const MDM_QUIZ_MOCK_ID = 'ap_ssc_10_math_mock_1';  // AP SSC Class 10 Mathematics Board Mock Test
export const MDM_HOMEWORK_ID = 'hw_ap_ssc_10_math_quad';  // Class 10 Mathematics: Quadratic Equations & Factorization

// Tag identifier constants
export const MDM_ACTIVITY_SOURCE = 'MDM_DEMONSTRATION';

/**
 * Checks whether an attempt, submission, or activity record is demonstration data.
 */
export function isDemoActivityRecord(record: any): boolean {
  if (!record) return false;
  return Boolean(
    record.isDemoActivity === true ||
    record.activitySource === MDM_ACTIVITY_SOURCE ||
    record.isDemo === true ||
    record.demoStudent === true
  );
}

/**
 * Checks whether MDM demonstration activity has already been seeded in Firestore.
 */
export async function checkMdmDemoSeeded(): Promise<{
  isSeeded: boolean;
  seededCount: number;
  message: string;
}> {
  try {
    const qPractice = query(
      collection(db, 'practiceAttempts'),
      where('activitySource', '==', MDM_ACTIVITY_SOURCE)
    );
    const snap = await getDocs(qPractice);
    if (!snap.empty) {
      return {
        isSeeded: true,
        seededCount: snap.size,
        message: 'MDM demonstration data already seeded.'
      };
    }
    return {
      isSeeded: false,
      seededCount: 0,
      message: 'No demonstration activity currently seeded.'
    };
  } catch (err) {
    console.warn('Error checking MDM demo seeded status:', err);
    return { isSeeded: false, seededCount: 0, message: '' };
  }
}

/**
 * Resolves the real Firebase student accounts from Firestore.
 * Ensures the real student user profiles are properly initialized with roll numbers and AP SSC Class 10 metadata.
 */
export async function resolveRealStudentAccounts(): Promise<Array<RealMdmStudentDef & { resolvedUid: string }>> {
  const resolvedList: Array<RealMdmStudentDef & { resolvedUid: string }> = [];

  for (const student of REAL_MDM_STUDENTS) {
    let resolvedUid = student.targetUid;

    // Check if doc exists by targetUid
    const userDocRef = doc(db, 'users', student.targetUid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      resolvedUid = data.uid || student.targetUid;
      // Ensure user profile metadata is up-to-date and clean of fake demo student flags
      await setDoc(
        userDocRef,
        {
          uid: resolvedUid,
          name: student.name,
          displayName: student.name,
          email: student.email,
          role: 'student',
          class: student.class,
          grade: student.grade,
          board: student.board,
          rollNumber: student.rollNumber,
          schoolName: 'Zilla Parishad High School (AP State Board)',
          status: 'Online',
          isDemo: false, // REAL STUDENT ACCOUNT
          demoStudent: false
        },
        { merge: true }
      );
    } else {
      // Create clean student document for the real user account
      await setDoc(userDocRef, {
        uid: resolvedUid,
        name: student.name,
        displayName: student.name,
        email: student.email,
        role: 'student',
        class: student.class,
        grade: student.grade,
        board: student.board,
        rollNumber: student.rollNumber,
        schoolName: 'Zilla Parishad High School (AP State Board)',
        status: 'Online',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isDemo: false,
        demoStudent: false
      });
    }

    resolvedList.push({
      ...student,
      resolvedUid
    });
  }

  return resolvedList;
}

/**
 * ONE-TIME DEMONSTRATION DATA SEEDING SYSTEM
 * Creates realistic Firestore activity records for the three REAL Firebase student UIDs.
 * Uses published AP SSC Class 10 resources and genuine schemas.
 */
export async function seedMdmDemonstrationData(): Promise<{
  success: boolean;
  message: string;
  seededCount: number;
}> {
  try {
    // 1. Check if already seeded to prevent duplicate creation
    const currentStatus = await checkMdmDemoSeeded();
    if (currentStatus.isSeeded) {
      return {
        success: true,
        message: 'MDM demonstration data already seeded.',
        seededCount: currentStatus.seededCount
      };
    }

    // 2. Resolve real student accounts
    const students = await resolveRealStudentAccounts();

    // 3. Load actual published AP SSC Class 10 resources
    const psetSnap = await getDoc(doc(db, 'practiceSets', MDM_PRACTICE_SET_ID));
    const quizSnap = await getDoc(doc(db, 'quizzes', MDM_QUIZ_MOCK_ID));
    const hwSnap = await getDoc(doc(db, 'assignments', MDM_HOMEWORK_ID));

    const psetData = psetSnap.exists() ? psetSnap.data() : null;
    const quizData = quizSnap.exists() ? quizSnap.data() : null;
    const hwData = hwSnap.exists() ? hwSnap.data() : null;

    const psetQuestions = psetData?.questions || [];
    const quizQuestions = quizData?.questions || [];
    const hwQuestions = hwData?.questions || [];

    const now = new Date();

    // 4. Seed records for each real student
    for (let sIdx = 0; sIdx < students.length; sIdx++) {
      const student = students[sIdx];
      const uid = student.resolvedUid;
      const startedTime = new Date(now.getTime() - (2 + sIdx * 3) * 60 * 60 * 1000).toISOString();
      const submittedTime = new Date(now.getTime() - (1 + sIdx * 3) * 60 * 60 * 1000).toISOString();

      // ---------------------------------------------------------------------
      // 1. PRACTICE CENTER ATTEMPT: practiceAttempts/{attemptId}
      // ---------------------------------------------------------------------
      const psetAttemptId = `practice_demo_${uid}_math`;
      const psetAnswers: Record<string, any> = {};
      const psetQuestionResults: QuestionResultItem[] = [];

      let psetCorrectCount = 0;
      let psetWrongCount = 0;
      const totalPsetQ = psetQuestions.length > 0 ? psetQuestions.length : 10;
      const targetCorrectPset = Math.min(student.targetPracticeScore, totalPsetQ);

      psetQuestions.forEach((q: any, idx: number) => {
        const qId = q.questionId || q.id || `q_${idx}`;
        const shouldBeCorrect = idx < targetCorrectPset;
        let selectedAns: any = q.correctAnswer;

        if (!shouldBeCorrect) {
          // Select wrong option
          if (typeof q.correctAnswer === 'number') {
            selectedAns = (q.correctAnswer + 1) % (q.options?.length || 4);
          } else {
            const wrongOpts = (q.options || []).filter((opt: string) => opt !== q.correctAnswer);
            selectedAns = wrongOpts.length > 0 ? wrongOpts[0] : 'Incorrect Option';
          }
        }

        psetAnswers[qId] = selectedAns;

        if (shouldBeCorrect) {
          psetCorrectCount++;
        } else {
          psetWrongCount++;
        }

        const isCorrect = shouldBeCorrect;
        psetQuestionResults.push({
          questionId: qId,
          questionText: q.questionText || q.question || `Question ${idx + 1}`,
          selectedAnswer: selectedAns,
          selectedOptionText: Array.isArray(q.options) && typeof selectedAns === 'number' ? q.options[selectedAns] : String(selectedAns),
          correctAnswer: q.correctAnswer,
          correctOptionText: Array.isArray(q.options) && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : String(q.correctAnswer),
          isCorrect,
          explanation: q.explanation || 'Refer to AP SSC Class 10 Real Numbers curriculum concepts.',
          marks: isCorrect ? (q.marks || 1) : 0
        });
      });

      const psetScore = psetCorrectCount;
      const psetTotalMarks = totalPsetQ;
      const psetPercentage = Math.round((psetScore / psetTotalMarks) * 100);

      const practiceAttemptDoc: PracticeAttemptDoc & {
        isDemoActivity: boolean;
        activitySource: string;
      } = {
        id: psetAttemptId,
        attemptId: psetAttemptId,
        practiceSetId: MDM_PRACTICE_SET_ID,
        practiceSetTitle: psetData?.title || 'Class 10 Mathematics - Real Numbers Practice Set',
        studentId: uid,
        studentName: student.name,
        studentEmail: student.email,
        class: 10,
        subject: 'Mathematics',
        subjectName: 'Mathematics',
        chapterId: 'real_numbers_10',
        chapterName: 'Real Numbers',
        startedAt: startedTime,
        submittedAt: submittedTime,
        answers: psetAnswers,
        questionResults: psetQuestionResults,
        correctCount: psetCorrectCount,
        wrongCount: psetWrongCount,
        unansweredCount: 0,
        score: psetScore,
        totalMarks: psetTotalMarks,
        percentage: psetPercentage,
        status: 'submitted',
        isDemoActivity: true,
        activitySource: MDM_ACTIVITY_SOURCE
      };

      await setDoc(doc(db, 'practiceAttempts', psetAttemptId), practiceAttemptDoc, { merge: true });

      // ---------------------------------------------------------------------
      // 2. MOCK TEST ATTEMPT: quizAttempts/{attemptId}
      // ---------------------------------------------------------------------
      const quizAttemptId = `quiz_demo_${uid}_math_mock`;
      const quizAnswers: Record<string, string> = {};
      const quizQuestionResults: QuestionResult[] = [];

      let quizCorrectCount = 0;
      let quizWrongCount = 0;
      const totalQuizQ = quizQuestions.length > 0 ? quizQuestions.length : 25;
      const targetCorrectQuiz = Math.min(student.targetMockScore, totalQuizQ);

      quizQuestions.forEach((q: any, idx: number) => {
        const qId = q.questionId || `math_${idx + 1}`;
        const shouldBeCorrect = idx < targetCorrectQuiz;
        let selectedAns: string = String(q.correctAnswer);

        if (!shouldBeCorrect) {
          const wrongOpts = (q.options || []).filter((opt: string) => opt !== q.correctAnswer);
          selectedAns = wrongOpts.length > 0 ? wrongOpts[0] : 'Incorrect Answer';
        }

        quizAnswers[qId] = selectedAns;

        if (shouldBeCorrect) {
          quizCorrectCount++;
        } else {
          quizWrongCount++;
        }

        const isCorrect = shouldBeCorrect;
        const marks = isCorrect ? (q.marks || 1) : 0;

        quizQuestionResults.push({
          questionId: qId,
          questionText: q.questionText || `Mock Question ${idx + 1}`,
          options: q.options || [],
          studentAnswer: selectedAns,
          correctAnswer: String(q.correctAnswer),
          isCorrect,
          marksAwarded: marks,
          maxMarks: q.marks || 1,
          explanation: q.explanation || 'Refer to AP SSC Mathematics Board exam guidelines.'
        });
      });

      const quizScore = quizCorrectCount;
      const quizTotalMarks = totalQuizQ;
      const quizPercentage = Math.round((quizScore / quizTotalMarks) * 100);

      const quizAttemptDoc: QuizAttemptDoc & {
        isDemoActivity: boolean;
        activitySource: string;
      } = {
        id: quizAttemptId,
        attemptId: quizAttemptId,
        quizId: MDM_QUIZ_MOCK_ID,
        quizTitle: quizData?.title || 'AP SSC Class 10 Mathematics Board Mock Test',
        studentId: uid,
        studentName: student.name,
        studentEmail: student.email,
        class: 10,
        board: 'AP_SSC',
        subject: 'Mathematics',
        startedAt: new Date(now.getTime() - (4 + sIdx * 2) * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(now.getTime() - (3 + sIdx * 2) * 60 * 60 * 1000).toISOString(),
        answers: quizAnswers,
        questionResults: quizQuestionResults,
        correctCount: quizCorrectCount,
        wrongCount: quizWrongCount,
        unansweredCount: 0,
        score: quizScore,
        totalMarks: quizTotalMarks,
        percentage: quizPercentage,
        status: 'submitted',
        isDemoActivity: true,
        activitySource: MDM_ACTIVITY_SOURCE
      };

      await setDoc(doc(db, 'quizAttempts', quizAttemptId), quizAttemptDoc, { merge: true });

      // ---------------------------------------------------------------------
      // 3. HOMEWORK SUBMISSION: assignmentSubmissions/{submissionId}
      // ---------------------------------------------------------------------
      const submissionId = `${MDM_HOMEWORK_ID}_${uid}`;
      const hwAnswers: Record<string, StudentAnswerItem> = {};

      if (student.homeworkStatus === 'submitted') {
        hwQuestions.forEach((q: any, idx: number) => {
          const qId = q.id || `q_${idx + 1}`;
          const isCorrect = idx < 4;
          hwAnswers[qId] = {
            questionId: qId,
            questionText: q.question || `Homework Question ${idx + 1}`,
            type: q.type || 'objective',
            studentAnswer: String(q.correctAnswer || (idx === 3 ? '(x - 5)(x + 2) = 0' : '24/(18 - x) - 24/(18 + x) = 1')),
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            isCorrect,
            marksAwarded: isCorrect ? (q.maxMarks || 4) : 2,
            maxMarks: q.maxMarks || 4,
            autoEvaluated: true,
            teacherRemarks: isCorrect ? 'Correct application of quadratic formula.' : 'Check factoring sign.'
          };
        });
      } else if (student.homeworkStatus === 'in_progress') {
        if (hwQuestions.length > 0) {
          const q = hwQuestions[0];
          const qId = q.id || 'q1';
          hwAnswers[qId] = {
            questionId: qId,
            questionText: q.question || 'Find the discriminant (Δ)',
            type: q.type || 'objective',
            studentAnswer: '-8',
            options: q.options || [],
            correctAnswer: q.correctAnswer || '-8',
            isCorrect: true,
            marksAwarded: 0,
            maxMarks: q.maxMarks || 4,
            autoEvaluated: false
          };
        }
      }

      const submissionDoc: RealHomeworkSubmissionDoc & {
        isDemoActivity: boolean;
        activitySource: string;
      } = {
        id: submissionId,
        submissionId,
        assignmentId: MDM_HOMEWORK_ID,
        homeworkId: MDM_HOMEWORK_ID,
        studentId: uid,
        studentName: student.name,
        studentEmail: student.email,
        class: 'Class 10',
        subject: 'Mathematics',
        chapterId: 'quadratic_equations_10',
        chapterName: 'Quadratic Equations',
        assignmentTitle: hwData?.title || 'Class 10 Mathematics: Quadratic Equations & Factorization',
        homeworkTitle: hwData?.title || 'Class 10 Mathematics: Quadratic Equations & Factorization',
        answers: hwAnswers,
        startedAt: new Date(now.getTime() - (5 + sIdx) * 60 * 60 * 1000).toISOString(),
        submittedAt: student.homeworkStatus === 'submitted' ? submittedTime : '',
        status: student.homeworkStatus,
        score: student.homeworkScore,
        maxScore: hwData?.totalMarks || 20,
        totalMarks: hwData?.totalMarks || 20,
        percentage: student.homeworkStatus === 'submitted' ? Math.round((student.homeworkScore / (hwData?.totalMarks || 20)) * 100) : 0,
        teacherFeedback: student.homeworkFeedback || '',
        isDemoActivity: true,
        activitySource: MDM_ACTIVITY_SOURCE
      };

      await setDoc(doc(db, 'assignmentSubmissions', submissionId), submissionDoc, { merge: true });

      // ---------------------------------------------------------------------
      // 4. STUDENT PROGRESS: studentProgress/{studentId} & progress/{studentId}
      // ---------------------------------------------------------------------
      const topicsCompleted = sIdx === 0 ? 18 : sIdx === 1 ? 12 : 7;
      const lessonsCompleted = sIdx === 0 ? 14 : sIdx === 1 ? 9 : 5;

      const progressDoc = {
        id: uid,
        studentId: uid,
        studentUid: uid,
        studentName: student.name,
        studentEmail: student.email,
        class: 'Class 10',
        completedTopicsCount: topicsCompleted,
        completedLessonsCount: lessonsCompleted,
        practiceCompletedCount: 1,
        mockTestsCompletedCount: 1,
        homeworkCompletedCount: student.homeworkStatus === 'submitted' ? 1 : 0,
        averagePracticeScore: psetPercentage,
        averageMockTestScore: quizPercentage,
        lastActivity: `Completed ${psetData?.title || 'Real Numbers Practice'} (${psetPercentage}%)`,
        lastUpdated: submittedTime,
        isDemoActivity: true,
        activitySource: MDM_ACTIVITY_SOURCE
      };

      await setDoc(doc(db, 'studentProgress', uid), progressDoc, { merge: true });
      await setDoc(doc(db, 'progress', uid), progressDoc, { merge: true });

      // Seed topic completions in progress/{uid}/topics/
      await setDoc(
        doc(db, 'progress', uid, 'topics', 'real_numbers_intro'),
        {
          studentUid: uid,
          class: 'Class 10',
          subjectId: 'mathematics',
          chapterId: 'real_numbers_10',
          topicId: 'real_numbers_intro',
          completed: true,
          completedAt: submittedTime,
          practiceScore: psetPercentage,
          mockTestScore: quizPercentage,
          isDemoActivity: true,
          activitySource: MDM_ACTIVITY_SOURCE
        },
        { merge: true }
      );

      // ---------------------------------------------------------------------
      // 5. STUDENT ACTIVITY EVENTS: studentActivity/{eventId}
      // ---------------------------------------------------------------------
      const eventsToSeed = [
        {
          eventType: 'LOGIN',
          details: 'Student logged in to AP SSC Portal',
          timestamp: startedTime
        },
        {
          eventType: 'CHAPTER_OPENED',
          details: 'Opened Chapter: Real Numbers (Mathematics)',
          timestamp: new Date(new Date(startedTime).getTime() + 5 * 60 * 1000).toISOString()
        },
        {
          eventType: 'PRACTICE_COMPLETED',
          details: `Completed Practice Set: Real Numbers (${psetScore}/${psetTotalMarks} - ${psetPercentage}%)`,
          timestamp: submittedTime
        },
        {
          eventType: 'MOCK_SUBMITTED',
          details: `Submitted AP SSC Mathematics Board Mock Test (${quizScore}/${quizTotalMarks} - ${quizPercentage}%)`,
          timestamp: quizAttemptDoc.submittedAt
        }
      ];

      if (student.homeworkStatus === 'submitted') {
        eventsToSeed.push({
          eventType: 'ASSIGNMENT_SUBMITTED',
          details: 'Submitted Homework: Quadratic Equations & Factorization',
          timestamp: submittedTime
        });
      }

      for (const ev of eventsToSeed) {
        const evId = `act_demo_${uid}_${ev.eventType.toLowerCase()}`;
        await setDoc(
          doc(db, 'studentActivity', evId),
          {
            id: evId,
            studentUid: uid,
            studentName: student.name,
            studentEmail: student.email,
            class: 'Class 10',
            subject: 'Mathematics',
            chapter: 'Real Numbers',
            eventType: ev.eventType,
            eventDetails: ev.details,
            timestamp: ev.timestamp,
            createdAt: ev.timestamp,
            isDemoActivity: true,
            activitySource: MDM_ACTIVITY_SOURCE
          },
          { merge: true }
        );
      }

      // ---------------------------------------------------------------------
      // 6. UPDATE REAL USER PROFILE: users/{uid}
      // ---------------------------------------------------------------------
      const hwStatusDisplay = student.homeworkStatus === 'submitted' ? 'Submitted' : student.homeworkStatus === 'in_progress' ? 'In Progress' : 'Not Submitted';
      const mockStatusDisplay = `Completed (${quizPercentage}%)`;
      const practiceStatusDisplay = `Completed (${psetPercentage}%)`;

      await updateDoc(doc(db, 'users', uid), {
        status: 'Online',
        lastLoginAt: startedTime,
        lastActiveAt: submittedTime,
        practiceCompleted: 1,
        mockTestsCompleted: 1,
        homeworkStatus: hwStatusDisplay,
        mockTestStatus: mockStatusDisplay,
        practiceStatus: practiceStatusDisplay,
        recentActivity: `Scored ${quizPercentage}% in AP SSC Mathematics Mock Test`,
        currentActivity: student.homeworkStatus === 'in_progress' ? 'Solving Quadratic Equations Homework' : 'Reviewing Real Numbers Syllabus',
        averageMockTestScore: quizPercentage,
        quizScoreAvg: quizPercentage,
        progressPercentage: Math.round((topicsCompleted / 25) * 100),
        hasDemoActivity: true,
        demoActivitySource: MDM_ACTIVITY_SOURCE,
        updatedAt: new Date().toISOString()
      }).catch(async () => {
        // Fallback setDoc if document structure needed it
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: student.name,
          displayName: student.name,
          email: student.email,
          role: 'student',
          class: 10,
          grade: 'Class 10',
          board: 'AP_SSC',
          rollNumber: student.rollNumber,
          status: 'Online',
          lastLoginAt: startedTime,
          lastActiveAt: submittedTime,
          practiceCompleted: 1,
          mockTestsCompleted: 1,
          homeworkStatus: hwStatusDisplay,
          mockTestStatus: mockStatusDisplay,
          recentActivity: `Scored ${quizPercentage}% in AP SSC Mathematics Mock Test`,
          averageMockTestScore: quizPercentage,
          hasDemoActivity: true,
          demoActivitySource: MDM_ACTIVITY_SOURCE
        }, { merge: true });
      });
    }

    return {
      success: true,
      message: 'Successfully seeded MDM demonstration activity for 3 real Firebase students using published AP SSC Class 10 content.',
      seededCount: students.length
    };
  } catch (err: any) {
    console.error('Error seeding MDM demonstration data:', err);
    throw new Error(err.message || 'Failed to seed MDM demonstration data');
  }
}

/**
 * RESET DEMONSTRATION ACTIVITY
 * Deletes ONLY records where isDemoActivity == true AND activitySource == 'MDM_DEMONSTRATION'.
 * Does NOT delete Firebase users, real student profiles, published resources, or genuine student submissions.
 */
export async function resetMdmDemonstrationActivity(): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> {
  try {
    let deletedCount = 0;

    // 1. Delete tagged practiceAttempts
    const pSnap = await getDocs(
      query(collection(db, 'practiceAttempts'), where('activitySource', '==', MDM_ACTIVITY_SOURCE))
    );
    for (const d of pSnap.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }

    // 2. Delete tagged quizAttempts
    const qSnap = await getDocs(
      query(collection(db, 'quizAttempts'), where('activitySource', '==', MDM_ACTIVITY_SOURCE))
    );
    for (const d of qSnap.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }

    // 3. Delete tagged assignmentSubmissions
    const aSnap = await getDocs(
      query(collection(db, 'assignmentSubmissions'), where('activitySource', '==', MDM_ACTIVITY_SOURCE))
    );
    for (const d of aSnap.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }

    // 4. Delete tagged studentActivity
    const actSnap = await getDocs(
      query(collection(db, 'studentActivity'), where('activitySource', '==', MDM_ACTIVITY_SOURCE))
    );
    for (const d of actSnap.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }

    // 5. Delete tagged studentProgress records
    for (const student of REAL_MDM_STUDENTS) {
      const progDoc = await getDoc(doc(db, 'studentProgress', student.targetUid));
      if (progDoc.exists() && progDoc.data()?.activitySource === MDM_ACTIVITY_SOURCE) {
        await deleteDoc(progDoc.ref);
        deletedCount++;
      }
      const progAltDoc = await getDoc(doc(db, 'progress', student.targetUid));
      if (progAltDoc.exists() && progAltDoc.data()?.activitySource === MDM_ACTIVITY_SOURCE) {
        await deleteDoc(progAltDoc.ref);
        deletedCount++;
      }

      // Reset activity flags on real student user profile
      const userRef = doc(db, 'users', student.targetUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          practiceCompleted: 0,
          mockTestsCompleted: 0,
          homeworkStatus: 'Not Submitted',
          mockTestStatus: 'None',
          practiceStatus: 'Not Started',
          recentActivity: 'Enrolled in Class 10 AP SSC curriculum',
          currentActivity: 'Available',
          averageMockTestScore: 0,
          quizScoreAvg: 0,
          hasDemoActivity: false,
          demoActivitySource: null,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    }

    return {
      success: true,
      deletedCount,
      message: `Successfully reset MDM demonstration activity (${deletedCount} records cleaned). Real student profiles and accounts preserved.`
    };
  } catch (err: any) {
    console.error('Error resetting MDM demonstration activity:', err);
    throw new Error(err.message || 'Failed to reset demonstration activity');
  }
}
