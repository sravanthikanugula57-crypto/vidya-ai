import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OfficialClassGrade, OFFICIAL_CLASSES, normalizeGradeKey } from '../data/officialSyllabusData';
import { UserAuthProfile } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ensureStudentDataInitialized } from '../services/studentFirestoreService';

interface StudentClassContextType {
  selectedClass: OfficialClassGrade | null;
  isLoadingClass: boolean;
  selectClass: (grade: OfficialClassGrade, user?: UserAuthProfile | null) => Promise<void>;
  clearClass: () => void;
  isClassSwitcherOpen: boolean;
  openClassSwitcher: () => void;
  closeClassSwitcher: () => void;
}

const StudentClassContext = createContext<StudentClassContextType | undefined>(undefined);

const SESSION_CLASS_KEY = 'vidya_ai_active_session_class';
const STORAGE_KEY = 'vidya_ai_selected_class';

export const StudentClassProvider: React.FC<{
  children: React.ReactNode;
  currentUser: UserAuthProfile | null;
  onUpdateUser?: (updated: UserAuthProfile) => void;
}> = ({ children, currentUser, onUpdateUser }) => {
  // selectedClass must start as null on fresh login.
  // Only restore if this active browser session already chose a class and was refreshed.
  const [selectedClass, setSelectedClassState] = useState<OfficialClassGrade | null>(() => {
    if (typeof window !== 'undefined') {
      const sessionClass = sessionStorage.getItem(SESSION_CLASS_KEY);
      if (sessionClass && (OFFICIAL_CLASSES as readonly string[]).includes(sessionClass)) {
        return sessionClass as OfficialClassGrade;
      }
    }
    return null;
  });

  const [isLoadingClass, setIsLoadingClass] = useState<boolean>(false);
  const [isClassSwitcherOpen, setIsClassSwitcherOpen] = useState<boolean>(false);

  // When currentUser becomes null (logged out), clear selectedClass
  useEffect(() => {
    if (!currentUser) {
      setSelectedClassState(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_CLASS_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [currentUser]);

  const selectClass = useCallback(async (grade: OfficialClassGrade, user?: UserAuthProfile | null) => {
    setIsLoadingClass(true);
    try {
      const targetUser = user || currentUser;
      setSelectedClassState(grade);
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_CLASS_KEY, grade);
        localStorage.setItem(STORAGE_KEY, grade);
      }

      const uid = targetUser?.id || auth.currentUser?.uid;

      if (uid) {
        // Save selected class directly to Firestore users/{uid}
        try {
          const classNum = parseInt(grade.replace(/\D/g, ''), 10);
          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, {
            uid: uid,
            id: uid,
            role: 'student',
            grade: grade,
            class: !isNaN(classNum) ? classNum : grade,
            board: targetUser?.board || 'AP State Board / SSC',
            preferredLanguage: targetUser?.preferredLanguage || 'te',
            updatedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
          }, { merge: true });

          // Also ensure student data collection is initialized with the selected class
          await ensureStudentDataInitialized(
            uid,
            targetUser?.email || auth.currentUser?.email || 'student@vidyaai.org',
            targetUser?.name || auth.currentUser?.displayName || 'Student',
            targetUser?.schoolName || 'Government School',
            grade,
            targetUser?.medium || 'Telugu Medium',
            targetUser?.board || 'AP State Board / SSC'
          ).catch((e) => console.warn('Non-blocking class seed notice:', e));
        } catch (fbErr) {
          console.warn('Firestore user grade update notice:', fbErr);
        }

        // Update local user profile cache
        if (targetUser) {
          const updated: UserAuthProfile = {
            ...targetUser,
            grade: grade,
            class: grade,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('vidya_ai_current_user', JSON.stringify(updated));
          if (onUpdateUser) {
            onUpdateUser(updated);
          }
        }
      }
    } finally {
      setIsLoadingClass(false);
      setIsClassSwitcherOpen(false);
    }
  }, [currentUser, onUpdateUser]);

  const clearClass = useCallback(() => {
    setSelectedClassState(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_CLASS_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const openClassSwitcher = useCallback(() => {
    setIsClassSwitcherOpen(true);
  }, []);

  const closeClassSwitcher = useCallback(() => {
    setIsClassSwitcherOpen(false);
  }, []);

  return (
    <StudentClassContext.Provider
      value={{
        selectedClass,
        isLoadingClass,
        selectClass,
        clearClass,
        isClassSwitcherOpen,
        openClassSwitcher,
        closeClassSwitcher,
      }}
    >
      {children}
    </StudentClassContext.Provider>
  );
};

export const useStudentClass = () => {
  const context = useContext(StudentClassContext);
  if (!context) {
    throw new Error('useStudentClass must be used within a StudentClassProvider');
  }
  return context;
};
