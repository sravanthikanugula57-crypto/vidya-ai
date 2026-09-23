import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Robust presence manager for students.
 * Maintains heartbeat and disconnect status in Firestore users/{uid}.
 */
export function initStudentPresence(uid: string, studentName?: string): () => void {
  if (!uid) return () => {};

  const userDocRef = doc(db, 'users', uid);

  // Set initial online status
  const markOnline = async () => {
    const nowIso = new Date().toISOString();
    try {
      await updateDoc(userDocRef, {
        status: 'Online',
        lastActiveAt: nowIso,
        lastSeen: nowIso
      }).catch(async () => {
        // Doc might not exist yet
        await setDoc(userDocRef, {
          uid,
          name: studentName || 'Student',
          status: 'Online',
          lastActiveAt: nowIso,
          lastSeen: nowIso
        }, { merge: true }).catch(() => {});
      });
    } catch (e) {
      // Non-blocking
    }
  };

  const markOffline = async () => {
    const nowIso = new Date().toISOString();
    try {
      await updateDoc(userDocRef, {
        status: 'Offline',
        lastActiveAt: nowIso,
        lastSeen: nowIso
      }).catch(() => {});
    } catch (e) {
      // Non-blocking
    }
  };

  // Immediate mark online
  markOnline();

  // Heartbeat interval (every 45 seconds)
  const intervalId = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      markOnline();
    }
  }, 45000);

  // Activity debounce tracker for user interactions
  let lastRecordedAction = Date.now();
  const handleUserAction = () => {
    const now = Date.now();
    // Only send heartbeat update at most once every 30 seconds on interaction
    if (now - lastRecordedAction > 30000) {
      lastRecordedAction = now;
      markOnline();
    }
  };

  window.addEventListener('click', handleUserAction, { passive: true });
  window.addEventListener('keydown', handleUserAction, { passive: true });
  window.addEventListener('touchstart', handleUserAction, { passive: true });

  // Page visibility / unload handlers
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Tab is in background / closed
      markOffline();
    } else {
      markOnline();
    }
  };

  const handleBeforeUnload = () => {
    markOffline();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Cleanup on unmount / session switch
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('click', handleUserAction);
    window.removeEventListener('keydown', handleUserAction);
    window.removeEventListener('touchstart', handleUserAction);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    markOffline();
  };
}

/**
 * Determine if a student is genuinely online based on their Firestore document status
 * and their lastActiveAt timestamp.
 */
export function checkIsOnline(status?: string, lastActiveAt?: string): boolean {
  if (status === 'Offline') return false;
  if (!lastActiveAt) return status === 'Online';
  
  const lastActiveMs = new Date(lastActiveAt).getTime();
  if (isNaN(lastActiveMs)) return status === 'Online';

  const diffMinutes = (Date.now() - lastActiveMs) / (1000 * 60);
  // Considered online if status is Online and active within last 3 minutes
  return status === 'Online' && diffMinutes <= 3;
}
