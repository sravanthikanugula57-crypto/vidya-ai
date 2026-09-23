import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeGradeKey } from '../data/officialSyllabusData';

export interface TopicProgressDoc {
  studentUid: string;
  class: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  completed: boolean;
  completedAt: string;
  practiceScore?: number;
  mockTestScore?: number;
}

export interface LessonProgressDoc {
  studentUid: string;
  class: string;
  subjectId: string;
  chapterId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
}

export interface StudentProgressSummaryDoc {
  studentUid: string;
  class: string;
  completedTopicsCount: number;
  completedLessonsCount?: number;
  lastUpdated: string;
}

/**
 * Saves or updates a student's lesson completion status in Firestore under progress/{studentUid}/lessons/{lessonId}.
 */
export async function setLessonCompletionInFirestore(
  studentUid: string,
  rawClass: string,
  subjectId: string,
  chapterId: string,
  lessonId: string,
  completed: boolean
): Promise<void> {
  const normClass = normalizeGradeKey(rawClass);
  const lessonProgRef = doc(db, 'progress', studentUid, 'lessons', lessonId);
  const summaryRef = doc(db, 'progress', studentUid);

  const payload: LessonProgressDoc = {
    studentUid,
    class: normClass,
    subjectId,
    chapterId,
    lessonId,
    completed,
    completedAt: new Date().toISOString()
  };

  try {
    // 1. Write individual lesson progress
    await setDoc(lessonProgRef, payload, { merge: true });

    // 2. Mirror into topics collection for backwards-compatible topic progress
    const topicProgRef = doc(db, 'progress', studentUid, 'topics', lessonId);
    await setDoc(topicProgRef, {
      studentUid,
      class: normClass,
      subjectId,
      chapterId,
      topicId: lessonId,
      completed,
      completedAt: new Date().toISOString()
    }, { merge: true });

    // 3. Fetch total completed lessons for summary count
    const lessonsCollRef = collection(db, 'progress', studentUid, 'lessons');
    const qCompleted = query(lessonsCollRef, where('completed', '==', true));
    const snap = await getDocs(qCompleted);

    await setDoc(summaryRef, {
      studentUid,
      class: normClass,
      completedLessonsCount: snap.size,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error(`Error saving lesson completion for ${lessonId} in Firestore:`, err);
    throw err;
  }
}

/**
 * Real-time listener for a student's lesson progress across all subjects and chapters.
 */
export function subscribeToStudentLessonProgress(
  studentUid: string,
  callback: (progressMap: Record<string, LessonProgressDoc>) => void,
  onError?: (err: Error) => void
): () => void {
  const lessonsCollRef = collection(db, 'progress', studentUid, 'lessons');

  return onSnapshot(
    lessonsCollRef,
    (snapshot) => {
      const map: Record<string, LessonProgressDoc> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as LessonProgressDoc;
        map[docSnap.id] = data;
      });
      callback(map);
    },
    (error) => {
      console.warn(`Error subscribing to student lesson progress for ${studentUid}:`, error);
      if (onError) onError(error);
      else callback({});
    }
  );
}


/**
 * Saves or updates a student's topic completion status in Firestore.
 */
export async function setTopicCompletionInFirestore(
  studentUid: string,
  rawClass: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  completed: boolean,
  practiceScore: number = 0,
  mockTestScore: number = 0
): Promise<void> {
  const normClass = normalizeGradeKey(rawClass);
  const topicProgRef = doc(db, 'progress', studentUid, 'topics', topicId);
  const summaryRef = doc(db, 'progress', studentUid);

  const payload: TopicProgressDoc = {
    studentUid,
    class: normClass,
    subjectId,
    chapterId,
    topicId,
    completed,
    completedAt: new Date().toISOString(),
    practiceScore,
    mockTestScore
  };

  try {
    // 1. Write individual topic progress
    await setDoc(topicProgRef, payload, { merge: true });

    // 2. Fetch all completed topics for summary update
    const topicsCollRef = collection(db, 'progress', studentUid, 'topics');
    const qCompleted = query(topicsCollRef, where('completed', '==', true));
    const snap = await getDocs(qCompleted);

    const summaryPayload: StudentProgressSummaryDoc = {
      studentUid,
      class: normClass,
      completedTopicsCount: snap.size,
      lastUpdated: new Date().toISOString()
    };

    await setDoc(summaryRef, summaryPayload, { merge: true });
  } catch (err) {
    console.error(`Error saving topic completion for ${topicId} in Firestore:`, err);
    throw err;
  }
}

/**
 * Real-time listener for a student's topic progress across all subjects.
 */
export function subscribeToStudentTopicProgress(
  studentUid: string,
  callback: (progressMap: Record<string, TopicProgressDoc>) => void,
  onError?: (err: Error) => void
): () => void {
  const topicsCollRef = collection(db, 'progress', studentUid, 'topics');

  return onSnapshot(
    topicsCollRef,
    (snapshot) => {
      const map: Record<string, TopicProgressDoc> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TopicProgressDoc;
        map[docSnap.id] = data;
      });
      callback(map);
    },
    (error) => {
      console.warn(`Error subscribing to student topic progress for ${studentUid}:`, error);
      if (onError) onError(error);
      else callback({});
    }
  );
}

/**
 * Real-time listener for a student's overall progress summary.
 */
export function subscribeToStudentProgressSummary(
  studentUid: string,
  callback: (summary: StudentProgressSummaryDoc | null) => void,
  onError?: (err: Error) => void
): () => void {
  const summaryRef = doc(db, 'progress', studentUid);

  return onSnapshot(
    summaryRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as StudentProgressSummaryDoc);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn(`Error subscribing to progress summary for ${studentUid}:`, error);
      if (onError) onError(error);
      else callback(null);
    }
  );
}
