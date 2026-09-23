import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Recursively strips undefined fields from an object so Firestore setDoc/updateDoc never rejects it.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

export interface DiscussionGroupDoc {
  groupId: string;
  board: string;
  class: string | number;
  subject: string;
  chapterId?: string;
  chapterName?: string;
  groupName: string;
  description: string;
  createdBy: string;
  createdByRole: 'teacher' | 'mdm' | 'admin';
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed';
  pinnedPostCount?: number;
  totalPostsCount?: number;
}

export interface DiscussionPostDoc {
  postId: string;
  groupId: string;
  createdBy: string;
  createdByRole: 'mdm' | 'teacher' | 'student';
  createdByName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  status: 'active' | 'closed' | 'deleted';
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file' | 'link';
  replyCount?: number;
}

export interface DiscussionReplyDoc {
  replyId: string;
  postId?: string;
  groupId?: string;
  createdBy: string;
  createdByRole: 'mdm' | 'teacher' | 'student';
  createdByName: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DiscussionNotificationDoc {
  id: string;
  recipientId: string; // Target student UID or teacher UID
  title: string;
  message: string;
  groupId: string;
  groupName: string;
  postId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'mdm' | 'teacher' | 'student';
  type: 'discussion_post' | 'discussion_reply';
  createdAt: string;
  isRead: boolean;
  readAt?: string;
}

// ---------------------------------------------------------------------------
// GROUP CREATION & MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * Creates a real classroom discussion group in Firestore
 */
export async function createDiscussionGroup(params: {
  board?: string;
  class: string | number;
  subject: string;
  chapterId?: string;
  chapterName?: string;
  groupName: string;
  description: string;
  createdBy: string;
  createdByRole: 'teacher' | 'mdm' | 'admin';
  createdByName?: string;
}): Promise<DiscussionGroupDoc> {
  const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Normalize class representation
  const cls = typeof params.class === 'number' 
    ? params.class 
    : (params.class.replace(/\D/g, '') ? parseInt(params.class.replace(/\D/g, ''), 10) : params.class);

  const groupDoc: DiscussionGroupDoc = {
    groupId,
    board: params.board || 'AP_SSC',
    class: cls,
    subject: params.subject || 'General',
    chapterId: params.chapterId || '',
    chapterName: params.chapterName || '',
    groupName: (params.groupName || '').trim(),
    description: (params.description || '').trim(),
    createdBy: params.createdBy || 'user_1',
    createdByRole: params.createdByRole || 'teacher',
    createdByName: params.createdByName || (params.createdByRole === 'mdm' ? 'District Educational Officer (MDM)' : 'Course Instructor'),
    createdAt: now,
    updatedAt: now,
    status: 'active',
    pinnedPostCount: 0,
    totalPostsCount: 0
  };

  await setDoc(doc(db, 'discussionGroups', groupId), cleanFirestoreData(groupDoc));
  return groupDoc;
}

/**
 * Update discussion group status ('active' | 'closed')
 */
export async function updateDiscussionGroupStatus(groupId: string, status: 'active' | 'closed'): Promise<void> {
  await updateDoc(doc(db, 'discussionGroups', groupId), {
    status,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Delete a discussion group
 */
export async function deleteDiscussionGroup(groupId: string): Promise<void> {
  await deleteDoc(doc(db, 'discussionGroups', groupId));
}

// ---------------------------------------------------------------------------
// REALTIME GROUP SUBSCRIPTIONS
// ---------------------------------------------------------------------------

/**
 * Subscribe to all discussion groups (for Teachers and MDM)
 */
export function subscribeToAllDiscussionGroups(
  callback: (groups: DiscussionGroupDoc[]) => void
): () => void {
  const q = query(collection(db, 'discussionGroups'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: DiscussionGroupDoc[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        list.push({
          groupId: raw.groupId || d.id,
          board: raw.board || 'AP_SSC',
          class: raw.class,
          subject: raw.subject || 'General',
          chapterId: raw.chapterId || '',
          chapterName: raw.chapterName || '',
          groupName: raw.groupName || raw.name || 'Class Discussion Room',
          description: raw.description || '',
          createdBy: raw.createdBy || '',
          createdByRole: raw.createdByRole || 'teacher',
          createdByName: raw.createdByName || raw.authorName || 'Teacher',
          createdAt: raw.createdAt
            ? (typeof raw.createdAt?.toDate === 'function'
                ? raw.createdAt.toDate().toISOString()
                : (typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()))
            : new Date().toISOString(),
          updatedAt: raw.updatedAt
            ? (typeof raw.updatedAt?.toDate === 'function'
                ? raw.updatedAt.toDate().toISOString()
                : (typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()))
            : new Date().toISOString(),
          status: raw.status || 'active',
          totalPostsCount: typeof raw.totalPostsCount === 'number' ? raw.totalPostsCount : 0
        });
      });
      callback(list);
    },
    (err) => {
      console.warn('Error subscribing to all discussion groups:', err);
      callback([]);
    }
  );
}

/**
 * Helper to normalize class identifiers (e.g. 10, '10', 'Class 10')
 */
function normalizeClassVal(val: any): number | string {
  if (typeof val === 'number') return val;
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : String(val).trim();
}

/**
 * Subscribe to groups visible to a specific student based on their board, class, and optional subject
 * Rules from requirements:
 * Only students matching board and class (and subject when filtered) should see that group.
 * Class 10 Physical Science MUST NOT appear for Class 9, Class 8, or Class 10 Mathematics (unless all subjects).
 */
export function subscribeToStudentDiscussionGroups(
  studentProfile: {
    uid: string;
    board?: string;
    class?: string | number | null;
    grade?: string | null;
  },
  callback: (groups: DiscussionGroupDoc[]) => void
): () => void {
  const studentBoard = (studentProfile.board || 'AP_SSC').toUpperCase();
  const studentCls = normalizeClassVal(studentProfile.class || studentProfile.grade || 10);

  const q = query(
    collection(db, 'discussionGroups'),
    where('status', '==', 'active')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const matched: DiscussionGroupDoc[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        const grp: DiscussionGroupDoc = {
          groupId: raw.groupId || d.id,
          board: raw.board || 'AP_SSC',
          class: raw.class,
          subject: raw.subject || 'General',
          chapterId: raw.chapterId || '',
          chapterName: raw.chapterName || '',
          groupName: raw.groupName || raw.name || 'Class Discussion Room',
          description: raw.description || '',
          createdBy: raw.createdBy || '',
          createdByRole: raw.createdByRole || 'teacher',
          createdByName: raw.createdByName || raw.authorName || 'Teacher',
          createdAt: raw.createdAt
            ? (typeof raw.createdAt?.toDate === 'function'
                ? raw.createdAt.toDate().toISOString()
                : (typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()))
            : new Date().toISOString(),
          updatedAt: raw.updatedAt
            ? (typeof raw.updatedAt?.toDate === 'function'
                ? raw.updatedAt.toDate().toISOString()
                : (typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()))
            : new Date().toISOString(),
          status: raw.status || 'active',
          totalPostsCount: typeof raw.totalPostsCount === 'number' ? raw.totalPostsCount : 0
        };
        const grpBoard = (grp.board || 'AP_SSC').toUpperCase();
        const grpCls = normalizeClassVal(grp.class);

        // Strict board and class matching
        const boardMatch = !grp.board || grpBoard === studentBoard || grpBoard === 'ALL';
        const classMatch = grpCls === studentCls || String(grpCls) === String(studentCls);

        if (boardMatch && classMatch) {
          matched.push(grp);
        }
      });
      // Sort in-memory by updatedAt / createdAt desc
      matched.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      callback(matched);
    },
    (err) => {
      console.warn('Error subscribing to student discussion groups:', err);
      callback([]);
    }
  );
}

// ---------------------------------------------------------------------------
// REALTIME POSTS (discussionGroups/{groupId}/posts/{postId})
// ---------------------------------------------------------------------------

/**
 * Subscribe to all posts within a discussion group in real-time
 */
export function subscribeToGroupPosts(
  groupId: string,
  callback: (posts: DiscussionPostDoc[]) => void
): () => void {
  const postsRef = collection(db, 'discussionGroups', groupId, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: DiscussionPostDoc[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        const post: DiscussionPostDoc = {
          postId: raw.postId || d.id,
          groupId: raw.groupId || groupId,
          createdBy: raw.createdBy || raw.authorId || '',
          createdByRole: raw.createdByRole || raw.authorRole || 'student',
          createdByName: raw.createdByName || raw.authorName || raw.name || raw.author || 'Member',
          message: raw.message || raw.content || '',
          createdAt: raw.createdAt
            ? (typeof raw.createdAt?.toDate === 'function'
                ? raw.createdAt.toDate().toISOString()
                : (typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()))
            : new Date().toISOString(),
          updatedAt: raw.updatedAt
            ? (typeof raw.updatedAt?.toDate === 'function'
                ? raw.updatedAt.toDate().toISOString()
                : (typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()))
            : new Date().toISOString(),
          pinned: Boolean(raw.pinned),
          status: raw.status || 'active',
          attachmentUrl: raw.attachmentUrl,
          attachmentName: raw.attachmentName,
          attachmentType: raw.attachmentType,
          replyCount: typeof raw.replyCount === 'number' ? raw.replyCount : 0
        };

        // Do not display hard deleted posts
        if (post.status !== 'deleted') {
          posts.push(post);
        }
      });

      // Pinned posts float to top
      posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      callback(posts);
    },
    (err) => {
      console.warn(`Error subscribing to posts for group ${groupId}:`, err);
      callback([]);
    }
  );
}

/**
 * Create a new post in a discussion group.
 * Sends real notification to group participants.
 */
export async function createDiscussionPost(params: {
  groupId: string;
  message: string;
  createdBy: string;
  createdByRole: 'mdm' | 'teacher' | 'student';
  createdByName: string;
  pinned?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file' | 'link';
}): Promise<DiscussionPostDoc> {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const postDoc: DiscussionPostDoc = {
    postId,
    groupId: params.groupId,
    createdBy: params.createdBy,
    createdByRole: params.createdByRole,
    createdByName: params.createdByName,
    message: params.message.trim(),
    createdAt: now,
    updatedAt: now,
    pinned: Boolean(params.pinned),
    status: 'active',
    replyCount: 0
  };

  if (params.attachmentUrl && params.attachmentUrl.trim()) {
    postDoc.attachmentUrl = params.attachmentUrl.trim();
  }
  if (params.attachmentName && params.attachmentName.trim()) {
    postDoc.attachmentName = params.attachmentName.trim();
  }
  if (params.attachmentType) {
    postDoc.attachmentType = params.attachmentType;
  }

  const groupRef = doc(db, 'discussionGroups', params.groupId);
  const postRef = doc(db, 'discussionGroups', params.groupId, 'posts', postId);

  await setDoc(postRef, cleanFirestoreData(postDoc));

  // Update group's updatedAt
  await updateDoc(groupRef, {
    updatedAt: now
  }).catch(() => {});

  // Dispatch real Firestore notifications for matching class students (if posted by MDM/Teacher)
  if (params.createdByRole === 'mdm' || params.createdByRole === 'teacher') {
    notifyStudentsOfNewPost(params.groupId, postDoc).catch(console.warn);
  }

  return postDoc;
}

/**
 * Pin or Unpin a discussion post
 */
export async function togglePinDiscussionPost(
  groupId: string,
  postId: string,
  pinned: boolean
): Promise<void> {
  const postRef = doc(db, 'discussionGroups', groupId, 'posts', postId);
  await updateDoc(postRef, {
    pinned,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Close a discussion post (students can no longer reply)
 */
export async function closeDiscussionPost(groupId: string, postId: string): Promise<void> {
  const postRef = doc(db, 'discussionGroups', groupId, 'posts', postId);
  await updateDoc(postRef, {
    status: 'closed',
    updatedAt: new Date().toISOString()
  });
}

/**
 * Delete a discussion post (moderation)
 */
export async function deleteDiscussionPost(groupId: string, postId: string): Promise<void> {
  const postRef = doc(db, 'discussionGroups', groupId, 'posts', postId);
  await updateDoc(postRef, {
    status: 'deleted',
    updatedAt: new Date().toISOString()
  });
}

// ---------------------------------------------------------------------------
// REALTIME REPLIES (discussionGroups/{groupId}/posts/{postId}/replies/{replyId})
// ---------------------------------------------------------------------------

/**
 * Subscribe to all replies for a given post in real-time
 */
export function subscribeToPostReplies(
  groupId: string,
  postId: string,
  callback: (replies: DiscussionReplyDoc[]) => void
): () => void {
  const repliesRef = collection(db, 'discussionGroups', groupId, 'posts', postId, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const replies: DiscussionReplyDoc[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        replies.push({
          replyId: raw.replyId || d.id,
          postId: raw.postId || postId,
          groupId: raw.groupId || groupId,
          createdBy: raw.createdBy || raw.authorId || '',
          createdByRole: raw.createdByRole || raw.authorRole || 'student',
          createdByName: raw.createdByName || raw.authorName || raw.name || raw.author || 'Member',
          message: raw.message || raw.content || '',
          createdAt: raw.createdAt
            ? (typeof raw.createdAt?.toDate === 'function'
                ? raw.createdAt.toDate().toISOString()
                : (typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()))
            : new Date().toISOString(),
          updatedAt: raw.updatedAt
            ? (typeof raw.updatedAt?.toDate === 'function'
                ? raw.updatedAt.toDate().toISOString()
                : (typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()))
            : new Date().toISOString()
        });
      });
      callback(replies);
    },
    (err) => {
      console.warn(`Error subscribing to replies for post ${postId}:`, err);
      callback([]);
    }
  );
}

/**
 * Create a reply to a post.
 * Uses the REAL Firebase Authentication UID.
 */
export async function createPostReply(params: {
  groupId: string;
  postId: string;
  message: string;
  createdBy: string;
  createdByRole: 'mdm' | 'teacher' | 'student';
  createdByName: string;
}): Promise<DiscussionReplyDoc> {
  const replyId = `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const replyDoc: DiscussionReplyDoc = {
    replyId,
    postId: params.postId,
    groupId: params.groupId,
    createdBy: params.createdBy,
    createdByRole: params.createdByRole,
    createdByName: params.createdByName,
    message: params.message.trim(),
    createdAt: now,
    updatedAt: now
  };

  const replyRef = doc(db, 'discussionGroups', params.groupId, 'posts', params.postId, 'replies', replyId);
  await setDoc(replyRef, cleanFirestoreData(replyDoc));

  // Update post's replyCount and updatedAt
  const postRef = doc(db, 'discussionGroups', params.groupId, 'posts', params.postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const currCount = postSnap.data()?.replyCount || 0;
    await updateDoc(postRef, {
      replyCount: currCount + 1,
      updatedAt: now
    }).catch(() => {});
  }

  // Update group's updatedAt
  await updateDoc(doc(db, 'discussionGroups', params.groupId), {
    updatedAt: now
  }).catch(() => {});

  // If student replied, send real notification to the post author (MDM/Teacher)
  if (params.createdByRole === 'student' && postSnap.exists()) {
    const postData = postSnap.data() as DiscussionPostDoc;
    notifyAuthorOfStudentReply(params.groupId, postData, replyDoc).catch(console.warn);
  }

  return replyDoc;
}

// ---------------------------------------------------------------------------
// REAL FIRESTORE NOTIFICATIONS
// ---------------------------------------------------------------------------

/**
 * Notify all students matching class when MDM/Teacher posts
 */
async function notifyStudentsOfNewPost(groupId: string, post: DiscussionPostDoc): Promise<void> {
  try {
    const grpSnap = await getDoc(doc(db, 'discussionGroups', groupId));
    if (!grpSnap.exists()) return;
    const grpData = grpSnap.data() as DiscussionGroupDoc;

    // Find registered students in that class
    const usersSnap = await getDocs(
      query(
        collection(db, 'users'),
        where('role', '==', 'student')
      )
    );

    const now = new Date().toISOString();
    for (const uDoc of usersSnap.docs) {
      const u = uDoc.data();
      const uCls = normalizeClassVal(u.class || u.grade);
      const grpCls = normalizeClassVal(grpData.class);

      if (uCls === grpCls) {
        const notifId = `notif_${Date.now()}_${uDoc.id.substring(0, 6)}_${Math.random().toString(36).substring(2, 5)}`;
        const notif: DiscussionNotificationDoc = {
          id: notifId,
          recipientId: uDoc.id,
          title: `New Post: ${grpData.groupName}`,
          message: `${post.createdByName} posted: "${post.message.substring(0, 80)}${post.message.length > 80 ? '...' : ''}"`,
          groupId,
          groupName: grpData.groupName,
          postId: post.postId,
          senderId: post.createdBy,
          senderName: post.createdByName,
          senderRole: post.createdByRole,
          type: 'discussion_post',
          createdAt: now,
          isRead: false
        };
        await setDoc(doc(db, 'notifications', notifId), cleanFirestoreData(notif)).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Error sending post notifications:', err);
  }
}

/**
 * Notify MDM or Teacher when a student replies to their post
 */
async function notifyAuthorOfStudentReply(
  groupId: string,
  post: DiscussionPostDoc,
  reply: DiscussionReplyDoc
): Promise<void> {
  try {
    const grpSnap = await getDoc(doc(db, 'discussionGroups', groupId));
    const grpName = grpSnap.exists() ? grpSnap.data()?.groupName : 'Class Discussion';
    const now = new Date().toISOString();

    const notifId = `notif_${Date.now()}_${post.createdBy.substring(0, 6)}_${Math.random().toString(36).substring(2, 5)}`;
    const notif: DiscussionNotificationDoc = {
      id: notifId,
      recipientId: post.createdBy,
      title: `Student Reply in ${grpName}`,
      message: `${reply.createdByName} replied: "${reply.message.substring(0, 80)}${reply.message.length > 80 ? '...' : ''}"`,
      groupId,
      groupName: grpName,
      postId: post.postId,
      senderId: reply.createdBy,
      senderName: reply.createdByName,
      senderRole: reply.createdByRole,
      type: 'discussion_reply',
      createdAt: now,
      isRead: false
    };

    // Write to notifications and teacher_notifications for immediate reach
    await setDoc(doc(db, 'notifications', notifId), cleanFirestoreData(notif)).catch(() => {});
    await setDoc(doc(db, 'teacher_notifications', notifId), cleanFirestoreData(notif)).catch(() => {});
  } catch (err) {
    console.warn('Error sending reply notification:', err);
  }
}

/**
 * Subscribe to unread discussion notifications in real-time for any user UID
 */
export function subscribeToUserDiscussionNotifications(
  userUid: string,
  callback: (notifications: DiscussionNotificationDoc[], unreadCount: number) => void
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DiscussionNotificationDoc[] = [];
      let unread = 0;
      snapshot.forEach((d) => {
        const item = d.data() as DiscussionNotificationDoc;
        list.push(item);
        if (!item.isRead) unread++;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list, unread);
    },
    (err) => {
      console.warn(`Error subscribing to notifications for ${userUid}:`, err);
      callback([], 0);
    }
  );
}

/**
 * Mark a notification as read
 */
export async function markDiscussionNotificationAsRead(notificationId: string): Promise<void> {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'notifications', notificationId), {
    isRead: true,
    readAt: now
  }).catch(() => {});
  await updateDoc(doc(db, 'teacher_notifications', notificationId), {
    isRead: true,
    readAt: now
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// INITIAL GROUP SEEDER
// ---------------------------------------------------------------------------

/**
 * Seeds default classroom discussion groups if none exist yet.
 * Specifically seeds Class 10 Physical Science and Class 10 Mathematics
 * so teacher, MDM, and the three real Class 10 students can start discussing immediately!
 */
export async function ensureDefaultClassDiscussionGroups(): Promise<void> {
  try {
    const snap = await getDocs(query(collection(db, 'discussionGroups')));
    if (!snap.empty) return; // Already initialized

    console.log('Seeding initial official Class Discussion Groups...');
    const now = new Date().toISOString();

    // 1. Class 10 Physical Science Group
    const physSciGroup: DiscussionGroupDoc = {
      groupId: 'group_class10_physical_science',
      board: 'AP_SSC',
      class: 10,
      subject: 'Physical Science',
      chapterId: 'refraction_light',
      chapterName: 'Refraction of Light at Curved Surfaces',
      groupName: 'Class 10 Physical Science Discussion',
      description: 'Official interactive classroom discussion group for Class 10 AP SSC Physical Science students, teachers, and MDM observers.',
      createdBy: 'officer_mdm_state_01',
      createdByRole: 'mdm',
      createdByName: 'District Educational Officer (MDM)',
      createdAt: now,
      updatedAt: now,
      status: 'active',
      pinnedPostCount: 1,
      totalPostsCount: 1
    };
    await setDoc(doc(db, 'discussionGroups', physSciGroup.groupId), physSciGroup);

    // Initial pinned announcement from MDM
    const initialPost: DiscussionPostDoc = {
      postId: 'post_initial_ps_welcome',
      groupId: physSciGroup.groupId,
      createdBy: 'officer_mdm_state_01',
      createdByRole: 'mdm',
      createdByName: 'District Educational Officer (MDM)',
      message: 'Welcome students of Class 10! Tomorrow we will discuss Refraction of Light at Curved Surfaces and Snell’s Law. Feel free to post your questions and doubts here.',
      createdAt: now,
      updatedAt: now,
      pinned: true,
      status: 'active',
      replyCount: 0
    };
    await setDoc(doc(db, 'discussionGroups', physSciGroup.groupId, 'posts', initialPost.postId), initialPost);

    // 2. Class 10 Mathematics Group
    const mathGroup: DiscussionGroupDoc = {
      groupId: 'group_class10_mathematics',
      board: 'AP_SSC',
      class: 10,
      subject: 'Mathematics',
      chapterId: 'quadratic_equations_10',
      chapterName: 'Quadratic Equations',
      groupName: 'Class 10 Mathematics Discussion',
      description: 'Class 10 Mathematics board preparation, problem solving, and concept clarification group.',
      createdBy: 'teacher_ramesh_1',
      createdByRole: 'teacher',
      createdByName: 'Mr. Ramesh Sharma (Mathematics Faculty)',
      createdAt: now,
      updatedAt: now,
      status: 'active',
      pinnedPostCount: 1,
      totalPostsCount: 1
    };
    await setDoc(doc(db, 'discussionGroups', mathGroup.groupId), mathGroup);

    const mathPost: DiscussionPostDoc = {
      postId: 'post_initial_math_welcome',
      groupId: mathGroup.groupId,
      createdBy: 'teacher_ramesh_1',
      createdByRole: 'teacher',
      createdByName: 'Mr. Ramesh Sharma (Mathematics Faculty)',
      message: 'Notice to all Class 10 students: Homework on Quadratic Equations has been assigned. Please submit your step-by-step solutions by this Friday.',
      createdAt: now,
      updatedAt: now,
      pinned: true,
      status: 'active',
      replyCount: 0
    };
    await setDoc(doc(db, 'discussionGroups', mathGroup.groupId, 'posts', mathPost.postId), mathPost);

    console.log('Official Class Discussion Groups initialized.');
  } catch (err) {
    console.warn('Error seeding default discussion groups:', err);
  }
}
