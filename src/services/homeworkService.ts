import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeGradeKey } from '../data/officialSyllabusData';

export interface AIQuestionItem {
  id: string | number;
  question: string;
  type?: 'mcq' | 'short_answer' | 'problem';
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
  marks?: number;
}

export interface TeacherAIQuestion {
  id: number | string;
  questionType: 'MCQ' | 'Short Answer' | 'True / False' | 'Fill in the Blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Homework {
  id: string;
  homeworkId?: string;
  teacherId?: string;
  teacherName?: string;
  title: string;
  description?: string;
  instructions?: string;
  class: string;
  classId?: string;
  targetGrade?: string;
  targetClass?: string;
  studentClass?: string;
  section?: string;
  subject: string;
  subjectId?: string;
  chapter: string;
  chapterId?: string;
  lesson?: string;
  topic?: string;
  questions?: (TeacherAIQuestion | AIQuestionItem)[] | string[];
  dueDate: string;
  totalMarks?: number;
  pdfUrl?: string;
  imageUrl?: string;
  attachedPdfUrl?: string;
  attachedImages?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'COMPLETED' | 'Published' | string;
  published?: boolean;
  approvedByTeacher?: boolean;
  source: 'TEACHER' | 'AI_TEACHER' | 'AI';
  studentId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  createdAt?: string;
  updatedAt?: string;
  scheduledFor?: string;
}

/**
 * Save a teacher homework as DRAFT (not visible to students until approved & published).
 */
export async function saveTeacherHomeworkDraft(
  draftData: Partial<Homework> & { class: string; subject: string; chapter: string; title: string }
): Promise<string> {
  const normClass = normalizeGradeKey(draftData.class || draftData.classId || draftData.targetGrade || 'Class 5');
  const hwCol = collection(db, 'homeworks');
  const docId = draftData.id || doc(hwCol).id;
  const docRef = doc(db, 'homeworks', docId);

  const payload: Homework = {
    id: docId,
    homeworkId: docId,
    teacherId: draftData.teacherId || 't_school_faculty',
    teacherName: draftData.teacherName || 'Faculty Teacher',
    title: draftData.title,
    description: draftData.description || draftData.instructions || '',
    instructions: draftData.instructions || draftData.description || '',
    class: normClass,
    classId: normClass,
    targetGrade: normClass,
    targetClass: normClass,
    studentClass: normClass,
    section: draftData.section || 'All',
    subject: draftData.subject,
    subjectId: (draftData.subjectId || draftData.subject).toLowerCase().replace(/\s+/g, '_'),
    chapter: draftData.chapter,
    chapterId: (draftData.chapterId || draftData.chapter).toLowerCase().replace(/\s+/g, '_'),
    topic: draftData.topic || '',
    lesson: draftData.lesson || draftData.topic || 'General',
    questions: draftData.questions || [],
    dueDate: draftData.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    totalMarks: Number(draftData.totalMarks) || (Array.isArray(draftData.questions) ? draftData.questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0) : 10),
    pdfUrl: draftData.pdfUrl || draftData.attachedPdfUrl || '',
    imageUrl: draftData.imageUrl || '',
    attachedPdfUrl: draftData.attachedPdfUrl || draftData.pdfUrl || '',
    attachedImages: draftData.attachedImages || [],
    status: 'DRAFT',
    published: false,
    approvedByTeacher: false,
    source: draftData.source || 'AI_TEACHER',
    difficulty: draftData.difficulty || 'Medium',
    createdAt: draftData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return docId;
}

/**
 * Approve & Publish a Teacher Homework assignment (visible to target students).
 */
export async function publishApprovedHomework(
  hwData: Partial<Homework> & { class: string; subject: string; chapter: string; title: string }
): Promise<string> {
  const normClass = normalizeGradeKey(hwData.class || hwData.classId || hwData.targetGrade || 'Class 5');
  const hwCol = collection(db, 'homeworks');
  const docId = hwData.id || doc(hwCol).id;
  const docRef = doc(db, 'homeworks', docId);

  const payload: Homework = {
    id: docId,
    homeworkId: docId,
    teacherId: hwData.teacherId || 't_school_faculty',
    teacherName: hwData.teacherName || 'Faculty Teacher',
    title: hwData.title || 'Homework Assignment',
    description: hwData.description || hwData.instructions || '',
    instructions: hwData.instructions || hwData.description || '',
    class: normClass,
    classId: normClass,
    targetGrade: normClass,
    targetClass: normClass,
    studentClass: normClass,
    section: hwData.section || 'All',
    subject: hwData.subject,
    subjectId: (hwData.subjectId || hwData.subject).toLowerCase().replace(/\s+/g, '_'),
    chapter: hwData.chapter,
    chapterId: (hwData.chapterId || hwData.chapter).toLowerCase().replace(/\s+/g, '_'),
    topic: hwData.topic || '',
    lesson: hwData.lesson || hwData.topic || 'General',
    questions: hwData.questions || [],
    dueDate: hwData.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    totalMarks: Number(hwData.totalMarks) || (Array.isArray(hwData.questions) ? hwData.questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0) : 10),
    pdfUrl: hwData.pdfUrl || hwData.attachedPdfUrl || '',
    imageUrl: hwData.imageUrl || '',
    attachedPdfUrl: hwData.attachedPdfUrl || hwData.pdfUrl || '',
    attachedImages: hwData.attachedImages || [],
    status: 'PUBLISHED',
    published: true,
    approvedByTeacher: true,
    source: hwData.source || 'AI_TEACHER',
    difficulty: hwData.difficulty || 'Medium',
    createdAt: hwData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Write to both homeworks and homework collections
  await setDoc(docRef, payload, { merge: true });
  await setDoc(doc(db, 'homework', docId), payload, { merge: true });

  return docId;
}

/**
 * Publish teacher homework assignment directly into Firestore 'homeworks' collection.
 */
export async function publishHomework(
  homeworkData: Omit<Homework, 'id'> & { id?: string }
): Promise<string> {
  return publishApprovedHomework(homeworkData);
}

/**
 * Delete a homework assignment or draft from Firestore.
 */
export async function deleteTeacherHomework(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'homeworks', id)).catch(() => {});
    await deleteDoc(doc(db, 'homework', id)).catch(() => {});
  } catch (err) {
    console.warn("Error deleting teacher homework:", err);
  }
}

/**
 * Subscribe in real-time to ALL Teacher homework assignments (including drafts) for the Teacher Portal.
 */
export function subscribeToTeacherHomeworksWithDrafts(
  targetClass?: string,
  callback?: (homeworks: Homework[]) => void
): () => void {
  const normClass = targetClass && targetClass !== 'All' ? normalizeGradeKey(targetClass) : null;
  const hwCollectionRef = collection(db, 'homeworks');

  return onSnapshot(
    hwCollectionRef,
    (snapshot) => {
      const list: Homework[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        
        // Exclude purely student-generated practice from teacher assignments view
        if (data.source === 'AI' && data.studentId && !data.approvedByTeacher) {
          return;
        }

        const hwClass = data.class || data.classId || data.targetGrade || data.targetClass || '';
        const hwNorm = hwClass ? normalizeGradeKey(hwClass) : '';

        const matchesClass = !normClass || 
          hwNorm === normClass || 
          hwClass.toLowerCase() === normClass.toLowerCase() ||
          (normClass.match(/\d+/) && hwClass.match(/\d+/) && normClass.match(/\d+/)?.[0] === hwClass.match(/\d+/)?.[0]);

        if (!matchesClass) return;

        list.push({
          id: docSnap.id,
          homeworkId: data.homeworkId || docSnap.id,
          teacherId: data.teacherId || 't_school_faculty',
          teacherName: data.teacherName || 'Faculty Teacher',
          title: data.title || 'Homework',
          description: data.instructions || data.description || '',
          instructions: data.instructions || data.description || '',
          class: hwNorm || normClass || 'Class 5',
          classId: hwNorm || normClass || 'Class 5',
          targetGrade: hwNorm || normClass || 'Class 5',
          targetClass: hwNorm || normClass || 'Class 5',
          studentClass: hwNorm || normClass || 'Class 5',
          section: data.section || 'All',
          subject: data.subject || 'General',
          subjectId: data.subjectId || 'general',
          chapter: data.chapter || 'Chapter 1',
          chapterId: data.chapterId || 'ch1',
          topic: data.topic || '',
          lesson: data.lesson || 'General',
          questions: data.questions || [],
          dueDate: data.dueDate || 'Upcoming',
          totalMarks: Number(data.totalMarks) || 10,
          pdfUrl: data.pdfUrl || data.attachedPdfUrl || '',
          imageUrl: data.imageUrl || '',
          attachedPdfUrl: data.attachedPdfUrl || data.pdfUrl || '',
          attachedImages: data.attachedImages || [],
          status: data.status || (data.published === false ? 'DRAFT' : 'PUBLISHED'),
          published: data.published ?? (data.status !== 'DRAFT'),
          approvedByTeacher: data.approvedByTeacher ?? (data.status === 'PUBLISHED'),
          source: data.source || 'TEACHER',
          difficulty: data.difficulty || 'Medium',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        });
      });

      // Sort newest created first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      if (callback) {
        callback(list);
      }
    },
    (error) => {
      console.warn('Firestore teacher homeworks subscription error:', error);
      if (callback) callback([]);
    }
  );
}

/**
 * Save student-requested AI homework into Firestore 'ai_homework' collection.
 */
export async function saveAIHomework(aiHwData: {
  studentId: string;
  studentName?: string;
  class: string;
  subject: string;
  subjectId?: string;
  chapter: string;
  chapterId?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  title: string;
  instructions?: string;
  questions: AIQuestionItem[];
  totalMarks?: number;
}): Promise<string> {
  const normClass = normalizeGradeKey(aiHwData.class || 'Class 5');
  const aiCol = collection(db, 'ai_homework');
  const newDocRef = doc(aiCol);

  const payload = {
    id: newDocRef.id,
    homeworkId: newDocRef.id,
    studentId: aiHwData.studentId,
    studentName: aiHwData.studentName || 'Student',
    class: normClass,
    classId: normClass,
    targetGrade: normClass,
    subject: aiHwData.subject,
    subjectId: (aiHwData.subjectId || aiHwData.subject).toLowerCase().replace(/\s+/g, '_'),
    chapter: aiHwData.chapter,
    chapterId: (aiHwData.chapterId || aiHwData.chapter).toLowerCase().replace(/\s+/g, '_'),
    topic: aiHwData.topic || '',
    difficulty: aiHwData.difficulty || 'Medium',
    title: aiHwData.title,
    instructions: aiHwData.instructions || 'Answer all practice questions to strengthen your understanding.',
    questions: aiHwData.questions,
    totalMarks: aiHwData.totalMarks || (aiHwData.questions.length * 2),
    source: 'AI',
    status: 'Not Started',
    createdAt: new Date().toISOString()
  };

  await setDoc(newDocRef, payload);
  return newDocRef.id;
}

/**
 * Subscribe in real-time to Teacher-assigned homework from Firestore.
 * Strictly queries real data and returns [] when none exists (NO FAKE DATA).
 */
export function subscribeToHomeworks(
  studentClass?: string,
  sectionOrCallback?: string | ((homeworks: Homework[]) => void),
  maybeCallback?: (homeworks: Homework[]) => void
): () => void {
  const callback = typeof sectionOrCallback === 'function' ? sectionOrCallback : maybeCallback;
  const section = typeof sectionOrCallback === 'string' ? sectionOrCallback : undefined;

  const normClass = studentClass && studentClass !== 'All' ? normalizeGradeKey(studentClass) : null;
  const hwCollectionRef = collection(db, 'homeworks');

  return onSnapshot(
    hwCollectionRef,
    (snapshot) => {
      const list: Homework[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        
        // Match only teacher-published assignments (and strictly exclude drafts)
        if (data.status === 'DRAFT' || data.published === false) {
          return;
        }

        if (data.source !== 'TEACHER' && data.source !== 'AI_TEACHER') {
          return;
        }

        const hwClass = data.class || data.classId || data.targetGrade || data.targetClass || '';
        const hwNorm = hwClass ? normalizeGradeKey(hwClass) : '';

        // Class matching: If specific class is selected/assigned, enforce match
        const matchesClass = !normClass || 
          hwNorm === normClass || 
          hwClass.toLowerCase() === normClass.toLowerCase() ||
          (normClass.match(/\d+/) && hwClass.match(/\d+/) && normClass.match(/\d+/)?.[0] === hwClass.match(/\d+/)?.[0]);

        if (!matchesClass) return;

        // Section matching: If student has a specific section and homework is section-scoped
        if (section && section !== 'All' && data.section && data.section !== 'All' && data.section !== section) {
          return;
        }

        list.push({
          id: docSnap.id,
          homeworkId: data.homeworkId || docSnap.id,
          teacherId: data.teacherId || 't_school_faculty',
          teacherName: data.teacherName || 'Faculty Teacher',
          title: data.title || 'Homework',
          description: data.instructions || data.description || '',
          instructions: data.instructions || data.description || '',
          class: hwNorm || normClass || 'Class 5',
          classId: hwNorm || normClass || 'Class 5',
          targetGrade: hwNorm || normClass || 'Class 5',
          targetClass: hwNorm || normClass || 'Class 5',
          studentClass: hwNorm || normClass || 'Class 5',
          section: data.section || 'All',
          subject: data.subject || 'General',
          subjectId: data.subjectId || 'general',
          chapter: data.chapter || 'Chapter 1',
          chapterId: data.chapterId || 'ch1',
          topic: data.topic || '',
          lesson: data.lesson || 'General',
          questions: data.questions || [],
          dueDate: data.dueDate || 'Upcoming',
          totalMarks: Number(data.totalMarks) || 10,
          pdfUrl: data.pdfUrl || data.attachedPdfUrl || '',
          imageUrl: data.imageUrl || '',
          attachedPdfUrl: data.attachedPdfUrl || data.pdfUrl || '',
          attachedImages: data.attachedImages || [],
          status: data.status || 'PUBLISHED',
          published: true,
          approvedByTeacher: data.approvedByTeacher ?? true,
          source: data.source || 'TEACHER',
          createdAt: data.createdAt || ''
        });
      });

      // Sort newest created first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      if (callback) {
        callback(list);
      }
    },
    (error) => {
      console.warn('Firestore homeworks subscription error:', error);
      if (callback) callback([]);
    }
  );
}

/**
 * Direct Async Fetch: Queries only homework assigned to the authenticated user's class and section.
 * Returns only real data from Firestore (NO fake/mock data).
 */
export async function fetchHomeworkByClassAndSection(
  studentClass: string,
  section?: string
): Promise<Homework[]> {
  try {
    const normClass = studentClass && studentClass !== 'All' ? normalizeGradeKey(studentClass) : null;
    const hwCollectionRef = collection(db, 'homeworks');
    const snapshot = await getDocs(hwCollectionRef);
    const list: Homework[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;

      // Match only teacher-published assignments (and strictly exclude drafts)
      if (data.status === 'DRAFT' || data.published === false) {
        return;
      }

      if (data.source !== 'TEACHER' && data.source !== 'AI_TEACHER') {
        return;
      }

      const hwClass = data.class || data.classId || data.targetGrade || data.targetClass || '';
      const hwNorm = hwClass ? normalizeGradeKey(hwClass) : '';

      // Match class
      const matchesClass = !normClass || 
        hwNorm === normClass || 
        hwClass.toLowerCase() === normClass.toLowerCase() ||
        (normClass.match(/\d+/) && hwClass.match(/\d+/) && normClass.match(/\d+/)?.[0] === hwClass.match(/\d+/)?.[0]);

      if (!matchesClass) return;

      // Match section
      if (section && section !== 'All' && data.section && data.section !== 'All' && data.section !== section) {
        return;
      }

      list.push({
        id: docSnap.id,
        homeworkId: data.homeworkId || docSnap.id,
        teacherId: data.teacherId || 't_school_faculty',
        teacherName: data.teacherName || 'Faculty Teacher',
        title: data.title || 'Homework',
        description: data.instructions || data.description || '',
        instructions: data.instructions || data.description || '',
        class: hwNorm || normClass || 'Class 5',
        classId: hwNorm || normClass || 'Class 5',
        targetGrade: hwNorm || normClass || 'Class 5',
        targetClass: hwNorm || normClass || 'Class 5',
        studentClass: hwNorm || normClass || 'Class 5',
        section: data.section || 'All',
        subject: data.subject || 'General',
        subjectId: data.subjectId || 'general',
        chapter: data.chapter || 'Chapter 1',
        chapterId: data.chapterId || 'ch1',
        topic: data.topic || '',
        lesson: data.lesson || 'General',
        questions: data.questions || [],
        dueDate: data.dueDate || 'Upcoming',
        totalMarks: Number(data.totalMarks) || 10,
        pdfUrl: data.pdfUrl || data.attachedPdfUrl || '',
        imageUrl: data.imageUrl || '',
        attachedPdfUrl: data.attachedPdfUrl || data.pdfUrl || '',
        attachedImages: data.attachedImages || [],
        status: data.status || 'PUBLISHED',
        published: true,
        approvedByTeacher: data.approvedByTeacher ?? true,
        source: data.source || 'TEACHER',
        createdAt: data.createdAt || ''
      });
    });

    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching homework by class and section:', err);
    return [];
  }
}

/**
 * Fetch all AI generated homeworks for a student from Firestore.
 */
export async function fetchStudentAIHomework(
  studentId: string,
  studentClass?: string
): Promise<Homework[]> {
  if (!studentId) return [];
  try {
    const normClass = studentClass && studentClass !== 'All' ? normalizeGradeKey(studentClass) : null;
    const aiColRef = collection(db, 'ai_homework');
    const snapshot = await getDocs(aiColRef);
    const list: Homework[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (data.studentId !== studentId) return;

      const hwClass = data.class || data.classId || data.targetGrade || '';
      const hwNorm = hwClass ? normalizeGradeKey(hwClass) : '';

      if (normClass && hwNorm && hwNorm !== normClass) {
        return;
      }

      list.push({
        id: docSnap.id,
        homeworkId: data.homeworkId || docSnap.id,
        studentId: data.studentId,
        title: data.title || 'AI Practice Homework',
        description: data.instructions || data.description || '',
        instructions: data.instructions || data.description || '',
        class: hwNorm || normClass || 'Class 5',
        classId: hwNorm || normClass || 'Class 5',
        targetGrade: hwNorm || normClass || 'Class 5',
        subject: data.subject || 'General',
        subjectId: data.subjectId || 'general',
        chapter: data.chapter || 'Chapter 1',
        chapterId: data.chapterId || 'ch1',
        difficulty: data.difficulty || 'Medium',
        questions: data.questions || [],
        dueDate: data.dueDate || 'Self-Paced Practice',
        totalMarks: Number(data.totalMarks) || (data.questions?.length * 2) || 20,
        status: data.status || 'Not Started',
        source: 'AI',
        createdAt: data.createdAt || ''
      });
    });

    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching student AI homework:', err);
    return [];
  }
}

/**
 * Unified fetch for an authenticated student: gets class/section teacher assignments + student AI homeworks.
 */
export async function fetchHomeworkForStudent(params: {
  studentClass?: string;
  studentSection?: string;
  studentId?: string;
}): Promise<{
  teacherHomeworks: Homework[];
  aiHomeworks: Homework[];
  all: Homework[];
}> {
  const { studentClass = 'Class 5', studentSection, studentId } = params;
  const teacherHomeworks = await fetchHomeworkByClassAndSection(studentClass, studentSection);
  const aiHomeworks = studentId ? await fetchStudentAIHomework(studentId, studentClass) : [];

  const all = [...teacherHomeworks, ...aiHomeworks].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return {
    teacherHomeworks,
    aiHomeworks,
    all
  };
}

/**
 * Triggers an AI generation prompt for a specific chapter and saves generated data to Firestore under 'AI' source.
 */
export async function generateAIHomeworkForChapter(params: {
  grade: string;
  subject: string;
  chapter: string;
  topic?: string;
  studentId: string;
  studentName?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  numQuestions?: number;
  language?: string;
}): Promise<Homework> {
  const {
    grade,
    subject,
    chapter,
    topic = '',
    studentId,
    studentName = 'Student',
    difficulty = 'Easy',
    numQuestions = 5,
    language = 'English'
  } = params;

  // Call the server generation endpoint
  const res = await fetch('/api/ai/generate-homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grade,
      subject,
      chapter,
      topic,
      difficulty,
      numQuestions,
      language
    })
  });

  if (!res.ok) {
    throw new Error(`AI generation failed with status ${res.status}`);
  }

  const data = await res.json();
  const questions: AIQuestionItem[] = data.questions || [];

  // Save to Firestore under the 'AI' source category
  const docId = await saveAIHomework({
    studentId,
    studentName,
    class: grade,
    subject,
    chapter,
    topic,
    difficulty,
    title: data.title || `${chapter} – AI Practice Homework`,
    instructions: data.instructions || 'Answer all questions to master this chapter.',
    questions,
    totalMarks: data.totalMarks || (questions.length * 2) || 10
  });

  return {
    id: docId,
    homeworkId: docId,
    studentId,
    class: normalizeGradeKey(grade),
    subject,
    chapter,
    difficulty,
    title: data.title || `${chapter} – AI Practice Homework`,
    instructions: data.instructions || 'Answer all questions to master this chapter.',
    questions,
    totalMarks: data.totalMarks || (questions.length * 2) || 10,
    dueDate: 'Self-Paced Practice',
    status: 'Not Started',
    source: 'AI',
    createdAt: new Date().toISOString()
  };
}

/**
 * Subscribe in real-time to AI-generated homework for a specific student.
 * Returns only real generated AI homeworks requested by this student.
 */
export function subscribeToStudentAIHomework(
  studentId: string,
  classOrCallback?: string | ((aiHomeworks: Homework[]) => void),
  maybeCallback?: (aiHomeworks: Homework[]) => void
): () => void {
  const callback = typeof classOrCallback === 'function' ? classOrCallback : maybeCallback;
  const studentClass = typeof classOrCallback === 'string' ? classOrCallback : undefined;

  if (!studentId) {
    if (callback) callback([]);
    return () => {};
  }

  const normClass = studentClass && studentClass !== 'All' ? normalizeGradeKey(studentClass) : null;
  const aiColRef = collection(db, 'ai_homework');

  return onSnapshot(
    aiColRef,
    (snapshot) => {
      const list: Homework[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        if (data.studentId !== studentId) return;

        const hwClass = data.class || data.classId || data.targetGrade || '';
        const hwNorm = hwClass ? normalizeGradeKey(hwClass) : '';

        if (normClass && hwNorm && hwNorm !== normClass) {
          return;
        }

        list.push({
          id: docSnap.id,
          homeworkId: data.homeworkId || docSnap.id,
          studentId: data.studentId,
          title: data.title || 'AI Practice Homework',
          description: data.instructions || data.description || '',
          instructions: data.instructions || data.description || '',
          class: hwNorm || normClass || 'Class 5',
          classId: hwNorm || normClass || 'Class 5',
          targetGrade: hwNorm || normClass || 'Class 5',
          subject: data.subject || 'General',
          subjectId: data.subjectId || 'general',
          chapter: data.chapter || 'Chapter 1',
          chapterId: data.chapterId || 'ch1',
          difficulty: data.difficulty || 'Medium',
          questions: data.questions || [],
          dueDate: data.dueDate || 'Self-Paced Practice',
          totalMarks: Number(data.totalMarks) || (data.questions?.length * 2) || 20,
          status: data.status || 'Not Started',
          source: 'AI',
          createdAt: data.createdAt || ''
        });
      });

      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      if (callback) callback(list);
    },
    (error) => {
      console.warn('Firestore ai_homework subscription error:', error);
      if (callback) callback([]);
    }
  );
}
