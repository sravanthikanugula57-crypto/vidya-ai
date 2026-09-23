import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addTeacherNotification } from './studentFirestoreService';

export interface DoubtAttachment {
  id?: string;
  name?: string;
  url: string;
  type: 'image' | 'pdf' | 'audio' | 'video' | 'screenshot' | 'note';
  size?: string;
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

export interface TeacherReplyData {
  replyText: string;
  teacherId?: string;
  teacherName: string;
  audioUrl?: string;
  attachments?: DoubtAttachment[];
  repliedAt?: string;
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

export interface DoubtData {
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  class?: string;
  studentClass?: string;
  classId?: string;
  section?: string;
  subject: string;
  chapter: string;
  lesson?: string;
  title?: string;
  description?: string;
  question: string;
  priority?: 'Low' | 'Medium' | 'High';
  attachments?: DoubtAttachment[];
  voiceUrl?: string;
  status?: 'Pending' | 'Answered' | 'Resolved';
  teacherReply?: string | TeacherReplyData | DoubtTeacherReply | any;
  teacherReplyTime?: string;
  teacherName?: string;
  messages?: DoubtThreadMessage[];
  upvotesCount?: number;
  upvotedBy?: string[];
}

export interface StudentDoubt extends DoubtData {
  id: string;
  class: string;
  studentClass: string;
  description: string;
  question: string;
  status: 'Pending' | 'Answered' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export type StudentDoubtDoc = StudentDoubt;

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

function normalizeClassKey(cls?: string): string {
  if (!cls) return '';
  const match = cls.toString().match(/\d+/);
  return match ? match[0] : cls.toString().trim().toLowerCase();
}

// Initial default sample doubts array (empty to ensure real data from Firestore)
const initialSampleDoubts: StudentDoubt[] = [];

// Global in-memory doubt storage
let cachedDoubtsList: StudentDoubt[] = [...initialSampleDoubts];

// Active subscriber list
type DoubtSubscriber = {
  id: string;
  filterClass?: string;
  filterStudentId?: string;
  callback: (doubts: StudentDoubt[]) => void;
};

const subscribers = new Set<DoubtSubscriber>();

function emitToSubscribers() {
  cachedDoubtsList.sort((a, b) => {
    const timeA = new Date(parseTimestampToIso(a.createdAt)).getTime();
    const timeB = new Date(parseTimestampToIso(b.createdAt)).getTime();
    return timeB - timeA;
  });

  subscribers.forEach(sub => {
    let filtered = [...cachedDoubtsList];
    
    if (sub.filterClass && sub.filterClass !== 'All') {
      const fNorm = normalizeClassKey(sub.filterClass);
      filtered = filtered.filter(d => {
        const cNorm = normalizeClassKey(d.studentClass || d.class);
        return cNorm === fNorm || d.studentClass === sub.filterClass || d.class === sub.filterClass;
      });
    }

    if (sub.filterStudentId) {
      filtered = filtered.filter(d => d.studentId === sub.filterStudentId);
    }

    sub.callback(filtered);
  });
}

// Setup background realtime listeners on Firestore
let isFirestoreListenerActive = false;

function initFirestoreListeners() {
  if (isFirestoreListenerActive) return;
  isFirestoreListenerActive = true;

  const processSnapshot = (snap: any) => {
    snap.forEach((docSnap: any) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const questionText = data.question || data.description || data.title || '';
      const normClass = data.class || data.studentClass || 'Class 10';

      const doubtObj: StudentDoubt = {
        id: docId,
        studentId: data.studentId || 'std_demo_101',
        studentName: data.studentName || 'Student',
        studentPhoto: data.studentPhoto || '',
        class: normClass,
        studentClass: normClass,
        section: data.section || 'A',
        subject: data.subject || 'General',
        chapter: data.chapter || 'Chapter 1',
        lesson: data.lesson || 'Lesson 1',
        title: data.title || data.chapter || 'Doubt',
        description: questionText,
        question: questionText,
        priority: data.priority || 'Medium',
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        voiceUrl: data.voiceUrl || '',
        status: data.status || (data.teacherReply ? 'Answered' : 'Pending'),
        teacherReply: data.teacherReply || '',
        teacherName: data.teacherName || (typeof data.teacherReply === 'object' ? data.teacherReply.teacherName : ''),
        teacherReplyTime: parseTimestampToIso(data.teacherReplyTime),
        messages: Array.isArray(data.messages) ? data.messages : [],
        createdAt: parseTimestampToIso(data.createdAt),
        updatedAt: parseTimestampToIso(data.updatedAt),
        resolvedAt: data.resolvedAt ? parseTimestampToIso(data.resolvedAt) : undefined,
        upvotesCount: data.upvotesCount || 1,
        upvotedBy: Array.isArray(data.upvotedBy) ? data.upvotedBy : []
      };

      const existingIndex = cachedDoubtsList.findIndex(d => d.id === docId);
      if (existingIndex >= 0) {
        cachedDoubtsList[existingIndex] = doubtObj;
      } else {
        cachedDoubtsList.unshift(doubtObj);
      }
    });

    emitToSubscribers();
  };

  onSnapshot(collection(db, 'student_doubts'), processSnapshot, err => {
    console.warn('Firestore student_doubts listener warning:', err);
  });

  onSnapshot(collection(db, 'doubts'), processSnapshot, err => {
    console.warn('Firestore doubts listener warning:', err);
  });
}

/**
 * Saves a new doubt document to memory and Firestore collections.
 */
export async function postDoubt(doubtData: DoubtData): Promise<string> {
  initFirestoreListeners();

  const newDocRef = doc(collection(db, 'student_doubts'));
  const docId = newDocRef.id;

  const normClass = doubtData.studentClass || doubtData.class || doubtData.classId || 'Class 10';
  const mainQuestion = doubtData.question || doubtData.description || doubtData.title || '';
  const nowIso = new Date().toISOString();

  const initialMsg: DoubtThreadMessage = {
    id: `msg_${Date.now()}`,
    senderId: doubtData.studentId || 'std_demo_101',
    senderName: doubtData.studentName || 'Class Student',
    senderRole: 'student',
    text: mainQuestion,
    attachments: doubtData.attachments,
    createdAt: nowIso
  };

  const newDoubt: StudentDoubt = {
    id: docId,
    studentId: doubtData.studentId || 'std_demo_101',
    studentName: doubtData.studentName || 'Class Student',
    studentPhoto: doubtData.studentPhoto || '',
    class: normClass,
    studentClass: normClass,
    section: doubtData.section || 'A',
    subject: doubtData.subject,
    chapter: doubtData.chapter,
    lesson: doubtData.lesson || 'General',
    title: doubtData.title || doubtData.chapter,
    description: mainQuestion,
    question: mainQuestion,
    priority: doubtData.priority || 'Medium',
    attachments: doubtData.attachments || [],
    voiceUrl: doubtData.voiceUrl || (doubtData.attachments?.find(a => a.type === 'audio')?.url || ''),
    status: doubtData.status || (doubtData.teacherReply ? 'Answered' : 'Pending'),
    teacherReply: typeof doubtData.teacherReply === 'string'
      ? doubtData.teacherReply 
      : (doubtData.teacherReply?.explanation || doubtData.teacherReply?.replyText || ''),
    teacherName: doubtData.teacherName || (typeof doubtData.teacherReply === 'object' ? doubtData.teacherReply.teacherName : ''),
    messages: doubtData.messages || [initialMsg],
    createdAt: nowIso,
    updatedAt: nowIso,
    upvotesCount: doubtData.upvotesCount || 1,
    upvotedBy: doubtData.upvotedBy || [doubtData.studentId || 'std_demo_101']
  };

  // 1. Instantly push to memory & update all subscribers live
  cachedDoubtsList.unshift(newDoubt);
  emitToSubscribers();

  // 2. Persist asynchronously to Firestore
  try {
    await setDoc(newDocRef, newDoubt);
    await setDoc(doc(db, 'doubts', docId), newDoubt);

    // Notify Teacher
    await addTeacherNotification({
      type: 'student_doubt',
      title: 'New Doubt Received',
      message: `New doubt from ${newDoubt.studentName} (${normClass}) in ${newDoubt.subject}: ${mainQuestion.substring(0, 50)}...`,
      studentName: newDoubt.studentName,
      studentGrade: normClass
    }).catch(() => {});

    const globalNotifRef = doc(collection(db, 'teacher_notifications'));
    await setDoc(globalNotifRef, {
      id: globalNotifRef.id,
      type: 'student_doubt',
      title: 'New Doubt Received',
      message: `New doubt from ${newDoubt.studentName} (${normClass}) in ${newDoubt.subject}`,
      studentName: newDoubt.studentName,
      studentGrade: normClass,
      createdAt: nowIso,
      read: false
    }).catch(() => {});
  } catch (error) {
    console.warn('Firestore write warning for doubt:', error);
  }

  return docId;
}

/**
 * Subscribes in real-time using onSnapshot() and in-memory broadcaster to doubts.
 * Flexible parameters handle:
 * - subscribeToDoubts('Class 10', callback)
 * - subscribeToDoubts(callback, 'Class 10')
 * - subscribeToDoubts(callback, 'Class 10', 'std_demo_101')
 */
export function subscribeToDoubts(
  arg1: any,
  arg2?: any,
  arg3?: string
): () => void {
  initFirestoreListeners();

  let callback: (doubts: StudentDoubt[]) => void;
  let filterClass: string | undefined;
  let filterStudentId: string | undefined;

  if (typeof arg1 === 'function') {
    callback = arg1;
    filterClass = typeof arg2 === 'string' ? arg2 : undefined;
    filterStudentId = arg3;
  } else {
    filterClass = typeof arg1 === 'string' ? arg1 : undefined;
    callback = arg2;
    filterStudentId = arg3;
  }

  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subObj: DoubtSubscriber = {
    id: subId,
    filterClass,
    filterStudentId,
    callback
  };

  subscribers.add(subObj);

  // Trigger callback immediately with initial data
  let filtered = [...cachedDoubtsList];
  if (filterClass && filterClass !== 'All') {
    const fNorm = normalizeClassKey(filterClass);
    filtered = filtered.filter(d => {
      const cNorm = normalizeClassKey(d.studentClass || d.class);
      return cNorm === fNorm || d.studentClass === filterClass || d.class === filterClass;
    });
  }
  if (filterStudentId) {
    filtered = filtered.filter(d => d.studentId === filterStudentId);
  }

  callback(filtered);

  return () => {
    subscribers.delete(subObj);
  };
}

/**
 * Teacher replies to a doubt.
 */
export async function replyToDoubt(
  doubtId: string, 
  replyData: TeacherReplyData | DoubtTeacherReply | any
): Promise<void> {
  const nowIso = new Date().toISOString();
  const text = replyData.explanation || replyData.replyText || 'Teacher explanation provided.';
  const tName = replyData.teacherName || 'Mr. Ramesh Sharma';

  // Update memory
  const idx = cachedDoubtsList.findIndex(d => d.id === doubtId);
  if (idx >= 0) {
    cachedDoubtsList[idx].status = 'Answered';
    cachedDoubtsList[idx].teacherReply = replyData;
    cachedDoubtsList[idx].teacherName = tName;
    cachedDoubtsList[idx].teacherReplyTime = nowIso;
    cachedDoubtsList[idx].updatedAt = nowIso;
  }
  emitToSubscribers();

  try {
    const sRef = doc(db, 'student_doubts', doubtId);
    const dRef = doc(db, 'doubts', doubtId);

    const updatePayload = {
      teacherReply: replyData,
      teacherReplyTime: nowIso,
      teacherName: tName,
      status: 'Answered' as const,
      updatedAt: nowIso
    };

    await updateDoc(sRef, updatePayload).catch(() => {});
    await updateDoc(dRef, updatePayload).catch(() => {});
  } catch (err) {
    console.warn('Error replying to doubt:', err);
  }
}

/**
 * Marks doubt as resolved.
 */
export async function resolveDoubt(doubtId: string): Promise<void> {
  const nowIso = new Date().toISOString();

  const idx = cachedDoubtsList.findIndex(d => d.id === doubtId);
  if (idx >= 0) {
    cachedDoubtsList[idx].status = 'Resolved';
    cachedDoubtsList[idx].resolvedAt = nowIso;
    cachedDoubtsList[idx].updatedAt = nowIso;
  }
  emitToSubscribers();

  try {
    const sRef = doc(db, 'student_doubts', doubtId);
    const dRef = doc(db, 'doubts', doubtId);
    const updatePayload = {
      status: 'Resolved' as const,
      resolvedAt: nowIso,
      updatedAt: nowIso
    };

    await updateDoc(sRef, updatePayload).catch(() => {});
    await updateDoc(dRef, updatePayload).catch(() => {});
  } catch (err) {
    console.warn('Error resolving doubt:', err);
  }
}

/**
 * Appends a thread message to a doubt conversation.
 */
export async function addDoubtThreadMessage(
  doubtId: string,
  message: Omit<DoubtThreadMessage, 'id' | 'createdAt'>
): Promise<void> {
  const nowIso = new Date().toISOString();
  const newMsg: DoubtThreadMessage = {
    ...message,
    id: `msg_${Date.now()}`,
    createdAt: nowIso
  };

  const idx = cachedDoubtsList.findIndex(d => d.id === doubtId);
  if (idx >= 0) {
    const existing = cachedDoubtsList[idx].messages || [];
    cachedDoubtsList[idx].messages = [...existing, newMsg];
    cachedDoubtsList[idx].updatedAt = nowIso;
    if (message.senderRole === 'teacher') {
      cachedDoubtsList[idx].status = 'Answered';
      cachedDoubtsList[idx].teacherName = message.senderName;
      cachedDoubtsList[idx].teacherReply = message.text;
      cachedDoubtsList[idx].teacherReplyTime = nowIso;
    } else {
      cachedDoubtsList[idx].status = 'Pending';
    }
  }
  emitToSubscribers();

  try {
    const sRef = doc(db, 'student_doubts', doubtId);
    const dRef = doc(db, 'doubts', doubtId);

    let snap = await getDoc(sRef);
    if (!snap.exists()) {
      snap = await getDoc(dRef);
    }

    if (snap.exists()) {
      const data = snap.data();
      const existingMsgs = data.messages || [];
      const updatedMessages = [...existingMsgs, newMsg];
      const newStatus = message.senderRole === 'student' ? 'Pending' : 'Answered';

      const updateData: any = {
        messages: updatedMessages,
        status: newStatus,
        updatedAt: nowIso
      };

      if (message.senderRole === 'teacher') {
        updateData.teacherReply = {
          explanation: message.text,
          repliedAt: nowIso,
          teacherName: message.senderName,
          teacherId: message.senderId
        };
        updateData.teacherName = message.senderName;
        updateData.teacherReplyTime = nowIso;
      }

      await updateDoc(sRef, updateData).catch(() => {});
      await updateDoc(dRef, updateData).catch(() => {});
    }
  } catch (err) {
    console.warn('Error adding thread message:', err);
  }
}

/**
 * Upvotes a doubt.
 */
export async function upvoteDoubt(doubtId: string, userId: string): Promise<void> {
  const idx = cachedDoubtsList.findIndex(d => d.id === doubtId);
  if (idx >= 0) {
    const d = cachedDoubtsList[idx];
    const upvotedBy = d.upvotedBy || [];
    if (!upvotedBy.includes(userId)) {
      d.upvotedBy = [...upvotedBy, userId];
      d.upvotesCount = (d.upvotesCount || 0) + 1;
    }
  }
  emitToSubscribers();
}
