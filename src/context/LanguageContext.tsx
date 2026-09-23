import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, UserAuthProfile } from '../types';
import { translations, TranslationKey, SUPPORTED_LANGUAGES, LanguageInfo } from '../i18n/translations';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface LanguageContextType {
  language: LanguageCode;
  selectedLang: LanguageCode;
  setLanguage: (lang: LanguageCode, userOrId?: UserAuthProfile | string | null) => Promise<void>;
  setSelectedLang: (lang: LanguageCode, userOrId?: UserAuthProfile | string | null) => Promise<void>;
  t: (key: TranslationKey | string, fallback?: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageInfo[];
  isSavingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'vidya_ai_preferred_language';

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  currentUser: UserAuthProfile | null;
  onUpdateUser?: (updated: UserAuthProfile) => void;
}> = ({ children, currentUser, onUpdateUser }) => {
  // Determine initial language:
  // 1. currentUser?.preferredLanguage or currentUser?.preferredLang
  // 2. localStorage saved language
  // 3. Default to 'en' only if user has never selected a language
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
      if (stored && (stored === 'en' || stored === 'te' || stored === 'hi')) {
        return stored;
      }
    }
    if (currentUser?.preferredLanguage && (currentUser.preferredLanguage === 'en' || currentUser.preferredLanguage === 'te' || currentUser.preferredLanguage === 'hi')) {
      return currentUser.preferredLanguage;
    }
    if (currentUser?.preferredLang && (currentUser.preferredLang === 'en' || currentUser.preferredLang === 'te' || currentUser.preferredLang === 'hi')) {
      return currentUser.preferredLang;
    }
    return 'en';
  });

  const [isSavingLanguage, setIsSavingLanguage] = useState<boolean>(false);

  // Sync state if currentUser changes and has an explicit preferredLanguage
  useEffect(() => {
    if (currentUser?.preferredLanguage && (currentUser.preferredLanguage === 'en' || currentUser.preferredLanguage === 'te' || currentUser.preferredLanguage === 'hi')) {
      setLanguageState(currentUser.preferredLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentUser.preferredLanguage);
      }
    } else if (currentUser?.preferredLang && (currentUser.preferredLang === 'en' || currentUser.preferredLang === 'te' || currentUser.preferredLang === 'hi')) {
      setLanguageState(currentUser.preferredLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentUser.preferredLang);
      }
    }
  }, [currentUser?.id, currentUser?.preferredLanguage, currentUser?.preferredLang]);

  /**
   * setSelectedLang:
   * Sets the user's preferred language, updates local state & storage, and
   * persists preferredLanguage to the student's Firestore document in users/{userId}.
   */
  const setSelectedLang = useCallback(async (newLang: LanguageCode, userOrId?: UserAuthProfile | string | null) => {
    if (newLang !== 'en' && newLang !== 'te' && newLang !== 'hi') {
      console.warn(`Unsupported language requested: ${newLang}. Supported languages: en, te, hi.`);
      return;
    }

    // 1. Update UI state immediately without page reload
    setLanguageState(newLang);

    // 2. Persist in local storage so it survives refresh, logout/login, and navigation
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    }

    // 3. Resolve target user and student userId
    let uid: string | null = null;
    let targetUser: UserAuthProfile | null = null;

    if (typeof userOrId === 'string' && userOrId.trim()) {
      uid = userOrId.trim();
    } else if (userOrId && typeof userOrId === 'object') {
      targetUser = userOrId;
      uid = userOrId.id || (userOrId as any).uid || null;
    }

    if (!uid && currentUser) {
      targetUser = currentUser;
      uid = currentUser.id || (currentUser as any).uid || null;
    }

    if (!uid && auth.currentUser?.uid) {
      uid = auth.currentUser.uid;
    }

    if (!uid && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vidya_ai_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id || parsed?.uid) {
            uid = parsed.id || parsed.uid;
            if (!targetUser) targetUser = parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // 4. Persist preferredLanguage to the student's Firestore document in users/{userId}
    if (uid) {
      setIsSavingLanguage(true);
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(
          userDocRef,
          {
            preferredLanguage: newLang,
            preferredLang: newLang,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Update local user profile cache
        if (targetUser) {
          const updated: UserAuthProfile = {
            ...targetUser,
            preferredLanguage: newLang,
            preferredLang: newLang,
            updatedAt: new Date().toISOString(),
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('vidya_ai_current_user', JSON.stringify(updated));
          }
          if (onUpdateUser) {
            onUpdateUser(updated);
          }
        }
      } catch (err) {
        console.warn('Firestore user preferredLanguage update notice:', err);
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      } finally {
        setIsSavingLanguage(false);
      }
    }
  }, [currentUser, onUpdateUser]);

  // Alias setLanguage to setSelectedLang for backward and contextual compatibility
  const setLanguage = setSelectedLang;

  /**
   * Universal translation helper with fallback hierarchy:
   * 1. User selected language
   * 2. Available translated content
   * 3. Original content language
   * 4. English as final fallback
   * Never returns undefined/null.
   */
  const t = useCallback((key: TranslationKey | string, fallback?: string, params?: Record<string, string | number>): string => {
    if (!key) return fallback || '';

    const langDict = translations[language] as Record<string, string> | undefined;
    const enDict = translations.en as Record<string, string>;

    let result: string | undefined = langDict?.[key];

    if (!result) {
      // Fallback to English dictionary
      result = enDict[key];
    }

    if (!result) {
      // Fallback to custom provided fallback or string key
      result = fallback || key;
    }

    // Parameter interpolation if provided, e.g. {name} or {count}
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result || fallback || key;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        selectedLang: language,
        setLanguage,
        setSelectedLang,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isSavingLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  return useLanguage();
};
