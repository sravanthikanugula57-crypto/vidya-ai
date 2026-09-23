import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, normalizeGradeKey } from '../data/officialSyllabusData';

export interface FirestoreSubject {
  subjectId: string;
  subjectName: string;
  nativeName?: string;
  class: string;
  displayOrder: number;
  color?: string;
  icon?: string;
  code?: string;
  chaptersCount?: number;
}

export interface FirestoreChapter {
  chapterId: string;
  chapterName: string;
  nativeTitle?: string;
  subjectId: string;
  class: string;
  displayOrder: number;
  chapterNumber?: number;
  lessonsCount?: number;
}

export interface FirestoreTopic {
  topicId: string;
  topicName: string;
  nativeTitle?: string;
  chapterId: string;
  subjectId?: string;
  class: string;
  displayOrder: number;
  summary?: string;
  nativeSummary?: string;
  videoUrl?: string;
}

export interface FirestoreLesson {
  lessonId: string;
  title: string;
  description?: string;
  class: string;
  subjectId: string;
  chapterId: string;
  topicId?: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  order: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeClassDocKey(rawClass: string): string {
  if (!rawClass) return 'class5';
  const norm = normalizeGradeKey(rawClass); // e.g. 'Class 6'
  const match = norm.match(/\d+/);
  return match ? `class${match[0]}` : 'class5';
}

/**
 * Automatically seeds syllabus data and lessons into Firestore for any grade if not already present.
 */
export async function seedClassSyllabusIfEmpty(rawClass: string = 'Class 5'): Promise<boolean> {
  try {
    const targetGrade = normalizeGradeKey(rawClass);
    const classDocKey = normalizeClassDocKey(targetGrade);
    const subjectsRef = collection(db, 'classes', classDocKey, 'subjects');
    const snapshot = await getDocs(subjectsRef);

    if (!snapshot.empty) {
      // Already seeded
      return false;
    }

    console.log(`Seeding ${targetGrade} syllabus and lessons into Firestore...`);
    const classOfficialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[targetGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'];
    if (!classOfficialSubjects || classOfficialSubjects.length === 0) return false;

    for (let sIdx = 0; sIdx < classOfficialSubjects.length; sIdx++) {
      const subj = classOfficialSubjects[sIdx];
      const subjDocRef = doc(db, 'classes', classDocKey, 'subjects', subj.id);

      const subjData: FirestoreSubject = {
        subjectId: subj.id,
        subjectName: subj.name,
        nativeName: subj.nativeName,
        class: targetGrade,
        displayOrder: sIdx + 1,
        color: subj.color,
        icon: subj.icon,
        code: subj.code,
        chaptersCount: subj.chapters.length
      };

      await setDoc(subjDocRef, subjData);

      // Seed chapters and lessons
      for (let cIdx = 0; cIdx < subj.chapters.length; cIdx++) {
        const ch = subj.chapters[cIdx];
        const chDocRef = doc(db, 'classes', classDocKey, 'subjects', subj.id, 'chapters', ch.id);

        const chData: FirestoreChapter = {
          chapterId: ch.id,
          chapterName: ch.title,
          nativeTitle: ch.nativeTitle,
          subjectId: subj.id,
          class: targetGrade,
          displayOrder: cIdx + 1,
          chapterNumber: ch.chapterNumber,
          lessonsCount: ch.lessons.length
        };

        await setDoc(chDocRef, chData);

        // Seed topics & lessons
        for (let tIdx = 0; tIdx < ch.lessons.length; tIdx++) {
          const topic = ch.lessons[tIdx];
          const topicDocRef = doc(db, 'classes', classDocKey, 'subjects', subj.id, 'chapters', ch.id, 'topics', topic.id);

          const topicData: FirestoreTopic = {
            topicId: topic.id,
            topicName: topic.title,
            nativeTitle: topic.nativeTitle,
            chapterId: ch.id,
            subjectId: subj.id,
            class: targetGrade,
            displayOrder: tIdx + 1,
            summary: topic.summary,
            nativeSummary: topic.nativeSummary,
            videoUrl: topic.videoUrl || ''
          };

          await setDoc(topicDocRef, topicData);

          // Seed real lesson
          const lessonId = `l_${subj.id}_${ch.id}_${tIdx + 1}`;
          const lessonDocRef = doc(db, 'classes', classDocKey, 'subjects', subj.id, 'chapters', ch.id, 'lessons', lessonId);

          const lessonData: FirestoreLesson = {
            lessonId,
            title: topic.title,
            description: topic.summary || `${targetGrade} ${subj.name} lesson on ${topic.title}.`,
            class: targetGrade,
            subjectId: subj.id,
            chapterId: ch.id,
            topicId: topic.id,
            content: topic.summary 
              ? `${topic.summary}\n\nKey Concepts:\n1. Introduction to ${topic.title}.\n2. Real-world SCERT & NCERT application.\n3. Practice exercises and recap.`
              : `Core study module for ${topic.title}.`,
            videoUrl: topic.videoUrl || '',
            pdfUrl: '',
            duration: '15 mins',
            order: tIdx + 1,
            published: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(lessonDocRef, lessonData);
        }
      }
    }

    console.log(`${targetGrade} syllabus and lessons successfully seeded to Firestore!`);
    return true;
  } catch (err) {
    console.warn(`Error seeding ${rawClass} syllabus:`, err);
    return false;
  }
}

/**
 * Automatically seeds Class 5 syllabus data and lessons into Firestore if not already present.
 */
export async function seedClass5SyllabusIfEmpty(): Promise<boolean> {
  return seedClassSyllabusIfEmpty('Class 5');
}

/**
 * Subscribe in real-time to Class Subjects from Firestore.
 */
export function subscribeToClassSubjects(
  rawClass: string,
  callback: (subjects: FirestoreSubject[]) => void,
  onError?: (err: Error) => void
): () => void {
  const classKey = normalizeClassDocKey(rawClass);
  const subjectsRef = collection(db, 'classes', classKey, 'subjects');
  const q = query(subjectsRef, orderBy('displayOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreSubject[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FirestoreSubject);
      });
      callback(list);
    },
    (error) => {
      console.warn(`Error subscribing to subjects for ${classKey}:`, error);
      if (onError) onError(error);
      else callback([]);
    }
  );
}

/**
 * Subscribe in real-time to Chapter list for a specific subject from Firestore.
 */
export function subscribeToSubjectChapters(
  rawClass: string,
  subjectId: string,
  callback: (chapters: FirestoreChapter[]) => void,
  onError?: (err: Error) => void
): () => void {
  const classKey = normalizeClassDocKey(rawClass);
  const chaptersRef = collection(db, 'classes', classKey, 'subjects', subjectId, 'chapters');
  const q = query(chaptersRef, orderBy('displayOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreChapter[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FirestoreChapter);
      });
      callback(list);
    },
    (error) => {
      console.warn(`Error subscribing to chapters for ${subjectId}:`, error);
      if (onError) onError(error);
      else callback([]);
    }
  );
}

/**
 * Subscribe in real-time to Topics list for a specific chapter from Firestore.
 */
export function subscribeToChapterTopics(
  rawClass: string,
  subjectId: string,
  chapterId: string,
  callback: (topics: FirestoreTopic[]) => void,
  onError?: (err: Error) => void
): () => void {
  const classKey = normalizeClassDocKey(rawClass);
  const topicsRef = collection(db, 'classes', classKey, 'subjects', subjectId, 'chapters', chapterId, 'topics');
  const q = query(topicsRef, orderBy('displayOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreTopic[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FirestoreTopic);
      });
      callback(list);
    },
    (error) => {
      console.warn(`Error subscribing to topics for ${chapterId}:`, error);
      if (onError) onError(error);
      else callback([]);
    }
  );
}

/**
 * Subscribe in real-time to published Lessons list for a specific chapter from Firestore.
 */
export function subscribeToChapterLessons(
  rawClass: string,
  subjectId: string,
  chapterId: string,
  callback: (lessons: FirestoreLesson[]) => void,
  onError?: (err: Error) => void
): () => void {
  const classKey = normalizeClassDocKey(rawClass);
  const lessonsRef = collection(db, 'classes', classKey, 'subjects', subjectId, 'chapters', chapterId, 'lessons');
  const q = query(lessonsRef, orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreLesson[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreLesson;
        // Filter published lessons only for student view
        if (data.published !== false) {
          list.push(data);
        }
      });
      callback(list);
    },
    (error) => {
      console.warn(`Error subscribing to lessons for chapter ${chapterId}:`, error);
      if (onError) onError(error);
      else callback([]);
    }
  );
}

