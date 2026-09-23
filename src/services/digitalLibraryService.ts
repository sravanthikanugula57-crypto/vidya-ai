import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc, 
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  FirestoreLibraryResource, 
  DigitalLibraryResource, 
  OfficialResourceType, 
  OfficialResourceStatus,
  OfficialResourceLanguage,
  OfficialResourceSourceType,
  ResourceUploader,
  SavedResourceRecord
} from '../types/library';

export type { FirestoreLibraryResource, DigitalLibraryResource };

export const RESOURCES_COLLECTION = 'resources';

// Verified AP State Board / SSC / NCERT Government Domains
export const VERIFIED_OFFICIAL_DOMAINS = [
  'ap.gov.in',
  'cse.ap.gov.in',
  'scert.ap.gov.in',
  'bse.ap.gov.in',
  'ncert.nic.in',
  'apschooledu.in',
  'telangana.gov.in',
  'bse.telangana.gov.in',
  'scert.telangana.gov.in'
];

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Extracts digits from a class identifier e.g. "Class 10" -> 10, "10" -> 10
 */
export function extractClassNumber(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Strict class matching: prevents cross-class leakage.
 * "Class 10" matches "10" and "Class 10", but NEVER matches "Class 9" or "Class 8".
 */
export function isClassMatch(
  resourceClass: string | number | undefined | null,
  targetClass: string | number | undefined | null
): boolean {
  if (!resourceClass || !targetClass) return false;
  const targetStr = String(targetClass).trim().toLowerCase();
  if (targetStr === 'all' || targetStr === 'all classes') return true;

  const resNum = extractClassNumber(resourceClass);
  const targetNum = extractClassNumber(targetClass);

  if (resNum !== null && targetNum !== null) {
    return resNum === targetNum;
  }

  return String(resourceClass).trim().toLowerCase() === targetStr;
}

/**
 * Robust subject matching
 */
export function isSubjectMatch(
  resSubj: string | undefined | null,
  targetSubj: string | undefined | null
): boolean {
  if (!targetSubj || targetSubj === 'All' || targetSubj === 'All Subjects') return true;
  if (!resSubj) return false;
  const s1 = resSubj.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = targetSubj.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return s1 === s2;
}

/**
 * Robust chapter matching by ID or Title
 */
export function isChapterMatch(
  resChapterId: string | undefined | null,
  resChapterName: string | undefined | null,
  targetChapterId: string | undefined | null,
  targetChapterName: string | undefined | null
): boolean {
  if (!targetChapterId && !targetChapterName) return true;
  if (targetChapterName === 'All' || targetChapterName === 'All Chapters') return true;

  // Check ID match if provided
  if (targetChapterId && resChapterId) {
    const id1 = targetChapterId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const id2 = resChapterId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (id1 === id2) return true;
  }

  // Check Name match
  if (targetChapterName && resChapterName) {
    const tn = targetChapterName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const rn = resChapterName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rn === tn || rn.includes(tn) || tn.includes(rn)) return true;
    
    // Check significant word match (e.g. "Light" or "Reflection")
    const tWords = targetChapterName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const rWords = resChapterName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (tWords.some(tw => rWords.includes(tw))) return true;
  }

  return false;
}

/**
 * Validates if an external URL originates from a verified AP State Board or NCERT government portal
 */
export function isVerifiedOfficialUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return VERIFIED_OFFICIAL_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Upload a real file to Firebase Storage
 * Files are partitioned under /resources/{class}/{subject}/{chapter}/
 */
export async function uploadResourceFileToStorage(
  file: File,
  classGrade: string,
  subject: string,
  chapter: string
): Promise<{ downloadUrl: string; storagePath: string }> {
  const sanitize = (str: string) => (str || 'general').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const classSlug = sanitize(classGrade);
  const subjectSlug = sanitize(subject);
  const chapterSlug = sanitize(chapter);
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  
  const storagePath = `resources/${classSlug}/${subjectSlug}/${chapterSlug}/${timestamp}_${cleanFileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return { downloadUrl, storagePath };
  } catch (err) {
    console.error('Firebase Storage upload error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to upload file to Firebase Storage');
  }
}

/**
 * Normalize and map a Firestore resource doc ensuring all required fields
 * and backward compatibility properties exist.
 */
export function mapFirestoreResource(data: any, docId: string): FirestoreLibraryResource {
  const resourceId = data.resourceId || docId;
  const className = data.class || data.classGrade || 'Class 10';
  const chapterTitle = data.chapterName || data.chapter || 'Chapter 1';
  const typeVal: OfficialResourceType = data.type || data.resourceType || 'Study Material';

  return {
    resourceId,
    id: resourceId, // compatibility alias
    board: data.board || 'AP State Board',
    class: className,
    classGrade: className, // compatibility alias
    subject: data.subject || 'General',
    chapterId: data.chapterId || 'ch_1',
    chapterName: chapterTitle,
    chapter: chapterTitle, // compatibility alias
    type: typeVal,
    resourceType: typeVal, // compatibility alias
    title: data.title || 'Untitled Resource',
    description: data.description || '',
    language: (data.language as OfficialResourceLanguage) || 'English',
    sourceType: (data.sourceType as OfficialResourceSourceType) || (data.fileUrl ? 'file' : 'url'),
    sourceUrl: data.sourceUrl || '',
    storagePath: data.storagePath || '',
    fileUrl: data.fileUrl || data.sourceUrl || '',
    license: data.license || 'Educational Use Only',
    attribution: data.attribution || (data.isOfficial ? 'AP SCERT / SSC Board' : 'Teacher Authored'),
    uploadedBy: data.uploadedBy || {
      uid: 'auth_teacher',
      name: 'Faculty',
      role: 'teacher'
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    status: (data.status as OfficialResourceStatus) || 'published',
    isAiGenerated: !!data.isAiGenerated,
    isOfficial: !!data.isOfficial,
    verifiedOfficialSource: !!data.verifiedOfficialSource,
    fileSize: data.fileSize || '1.0 MB',
    fileType: data.fileType || 'pdf',
    viewsCount: Number(data.viewsCount || 0),
    downloadCount: Number(data.downloadCount || 0),
    adminReviewNotes: data.adminReviewNotes || '',
    reviewedBy: data.reviewedBy || '',
    reviewedAt: data.reviewedAt || ''
  };
}

export interface CreateResourcePayload {
  title: string;
  description: string;
  type: OfficialResourceType;
  class: string;
  subject: string;
  chapterId: string;
  chapterName: string;
  language: OfficialResourceLanguage;
  sourceType: OfficialResourceSourceType;
  sourceUrl?: string;
  file?: File | null;
  board?: string;
  license?: string;
  attribution?: string;
  isAiGenerated?: boolean;
  status?: OfficialResourceStatus; // defaults to 'draft' or 'pending'
  uploadedBy?: ResourceUploader | string;
}

/**
 * Create a new Resource in Firestore (resources/{resourceId}) + Firebase Storage
 */
export async function createLibraryResource(
  payload: CreateResourcePayload
): Promise<FirestoreLibraryResource> {
  const resourceId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // Validate Official Textbook source constraints
  let isOfficial = false;
  let verifiedOfficialSource = false;
  if (payload.type === 'Official Textbook') {
    if (payload.isAiGenerated) {
      throw new Error('AI-generated content can NEVER be labelled as Official Textbook.');
    }
    if (payload.sourceType === 'file') {
      isOfficial = true;
      verifiedOfficialSource = true;
    } else {
      const urlToCheck = payload.sourceUrl || '';
      if (isVerifiedOfficialUrl(urlToCheck)) {
        isOfficial = true;
        verifiedOfficialSource = true;
      } else {
        throw new Error(
          'Only verified official AP State Board / SCERT / NCERT sources (e.g. ap.gov.in, ncert.nic.in) may be labelled as "Official Textbook".'
        );
      }
    }
  }

  // Validate AI-Generated constraints
  if (payload.isAiGenerated) {
    if (
      payload.type === 'Official Textbook' ||
      payload.type === 'Previous / Model Papers'
    ) {
      throw new Error('AI-generated content cannot be labelled as Official Textbook or Previous / Model Papers.');
    }
  }

  let fileUrl = payload.sourceUrl || '';
  let storagePath = '';
  let fileSize = '1.0 MB';
  let fileType = 'pdf';

  if (payload.sourceType === 'file' && payload.file) {
    fileSize = formatBytes(payload.file.size);
    const ext = payload.file.name.split('.').pop()?.toLowerCase() || 'pdf';
    fileType = ext;

    const uploaded = await uploadResourceFileToStorage(
      payload.file,
      payload.class,
      payload.subject,
      payload.chapterName
    );
    fileUrl = uploaded.downloadUrl;
    storagePath = uploaded.storagePath;
  } else if (payload.sourceType === 'url') {
    fileUrl = (payload.sourceUrl || '').trim();
    if (!fileUrl) {
      throw new Error('A valid source URL is required when choosing external URL source.');
    }
    if (payload.type === 'Video Lesson' || fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be')) {
      fileType = 'video';
    } else if (fileUrl.endsWith('.pdf')) {
      fileType = 'pdf';
    } else {
      fileType = 'link';
    }
  }

  const currentAuthUser = auth.currentUser;
  const uploaderInfo: ResourceUploader = typeof payload.uploadedBy === 'object' && payload.uploadedBy !== null
    ? payload.uploadedBy
    : {
        uid: currentAuthUser?.uid || 'teacher_local',
        name: currentAuthUser?.displayName || (typeof payload.uploadedBy === 'string' ? payload.uploadedBy : 'Teacher'),
        email: currentAuthUser?.email || '',
        role: 'teacher'
      };

  const initialStatus: OfficialResourceStatus = payload.status || 'pending';

  const resourceDoc: FirestoreLibraryResource = {
    resourceId,
    board: payload.board || 'AP State Board',
    class: payload.class,
    classGrade: payload.class,
    subject: payload.subject,
    chapterId: payload.chapterId || 'ch_1',
    chapterName: payload.chapterName,
    chapter: payload.chapterName,
    type: payload.type,
    resourceType: payload.type,
    title: payload.title.trim(),
    description: (payload.description || '').trim(),
    language: payload.language,
    sourceType: payload.sourceType,
    sourceUrl: (payload.sourceUrl || fileUrl).trim(),
    storagePath,
    fileUrl,
    license: payload.license || 'Educational License',
    attribution: payload.attribution || (isOfficial ? 'AP SCERT / AP State Board' : uploaderInfo.name),
    uploadedBy: uploaderInfo,
    createdAt: now,
    updatedAt: now,
    publishedAt: initialStatus === 'published' ? now : '',
    status: initialStatus,
    isAiGenerated: !!payload.isAiGenerated,
    isOfficial,
    verifiedOfficialSource,
    fileSize,
    fileType,
    viewsCount: 0,
    downloadCount: 0
  };

  try {
    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    await setDoc(docRef, resourceDoc);

    // Sync to legacy collection mirrors for seamless cross-component viewing
    const typeToColMap: Record<string, string> = {
      'Official Textbook': 'textbooks',
      'Chapter Notes': 'notes',
      'Study Material': 'notes',
      'Formula / Key Facts': 'formula_sheets',
      'Practice Material': 'worksheets',
      'Previous / Model Papers': 'previous_papers',
      'Video Lesson': 'videos'
    };
    const colName = typeToColMap[resourceDoc.type];
    if (colName) {
      setDoc(doc(db, colName, resourceId), {
        ...resourceDoc,
        id: resourceId,
        published: resourceDoc.status === 'published'
      }, { merge: true }).catch(() => {});
    }

    return resourceDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${RESOURCES_COLLECTION}/${resourceId}`);
    throw error;
  }
}

/**
 * Update an existing Resource in Firestore
 */
export async function updateLibraryResource(
  resourceId: string,
  updates: Partial<FirestoreLibraryResource>,
  newFile?: File | null
): Promise<void> {
  const path = `${RESOURCES_COLLECTION}/${resourceId}`;
  try {
    let extraFields: Partial<FirestoreLibraryResource> = {};
    if (newFile) {
      const cls = updates.class || 'general';
      const subj = updates.subject || 'general';
      const ch = updates.chapterName || 'general';
      const uploaded = await uploadResourceFileToStorage(newFile, cls, subj, ch);
      extraFields = {
        fileUrl: uploaded.downloadUrl,
        storagePath: uploaded.storagePath,
        fileSize: formatBytes(newFile.size),
        fileType: newFile.name.split('.').pop()?.toLowerCase() || 'pdf',
        sourceType: 'file'
      };
    }

    const payload = {
      ...updates,
      ...extraFields,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    await updateDoc(docRef, payload as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin Approval Workflow: Update Resource Status
 * Status transitions:
 * draft -> pending -> approved -> published -> unpublished
 */
export async function updateResourceApprovalStatus(
  resourceId: string,
  newStatus: OfficialResourceStatus,
  reviewerNotes?: string,
  reviewerName = 'Curriculum Admin'
): Promise<void> {
  const path = `${RESOURCES_COLLECTION}/${resourceId}`;
  try {
    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    const now = new Date().toISOString();
    const updates: Partial<FirestoreLibraryResource> = {
      status: newStatus,
      updatedAt: now,
      adminReviewNotes: reviewerNotes || '',
      reviewedBy: reviewerName,
      reviewedAt: now,
      ...(newStatus === 'published' ? { publishedAt: now } : {})
    };
    await updateDoc(docRef, updates as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a resource from Firestore and Firebase Storage
 */
export async function deleteLibraryResource(
  resourceId: string,
  storagePath?: string
): Promise<void> {
  const path = `${RESOURCES_COLLECTION}/${resourceId}`;
  try {
    // Delete from Storage if a path was stored
    if (storagePath) {
      try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn('Firebase storage file deletion skipped or not found:', err);
      }
    }

    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface ResourceSubscriptionOptions {
  isStudent?: boolean; // if true, strictly status === 'published' only
  classGrade?: string; // 'Class 5', 'Class 6', etc. (NO default to Class 5)
  subject?: string;
  chapterId?: string;
  chapterName?: string;
  language?: OfficialResourceLanguage | string;
  type?: OfficialResourceType | string;
  status?: OfficialResourceStatus | 'all';
  searchQuery?: string;
}

/**
 * Real-time Subscription to Digital Library Resources in Firestore
 * REAL DATA ONLY. NO MOCK SEEDS.
 */
export function subscribeToDigitalLibrary(
  options: ResourceSubscriptionOptions,
  callback: (resources: FirestoreLibraryResource[]) => void
) {
  const path = RESOURCES_COLLECTION;

  const unsub = onSnapshot(
    collection(db, RESOURCES_COLLECTION),
    (snapshot) => {
      let items: FirestoreLibraryResource[] = snapshot.docs.map((d) =>
        mapFirestoreResource(d.data(), d.id)
      );

      // 1. Role / Security Filter:
      // Students can ONLY read PUBLISHED resources.
      if (options.isStudent) {
        items = items.filter((r) => r.status === 'published');
      } else if (options.status && options.status !== 'all') {
        items = items.filter((r) => r.status === options.status);
      }

      // 2. Class Filter (DO NOT default to Class 5! Respect specified class)
      // Strictly prevent cross-class leaks: Class 10 never leaks to Class 9 or 8
      if (options.classGrade && options.classGrade !== 'All' && options.classGrade !== 'All Classes') {
        items = items.filter((r) => isClassMatch(r.class, options.classGrade));
      }

      // 3. Subject Filter
      if (options.subject && options.subject !== 'All' && options.subject !== 'All Subjects') {
        items = items.filter((r) => isSubjectMatch(r.subject, options.subject));
      }

      // 4. Chapter Filter (by ID or chapter name)
      if (options.chapterId || (options.chapterName && options.chapterName !== 'All' && options.chapterName !== 'All Chapters')) {
        items = items.filter((r) => isChapterMatch(r.chapterId, r.chapterName, options.chapterId, options.chapterName));
      }

      // 5. Language Filter
      if (options.language && options.language !== 'All' && options.language !== 'All Languages') {
        const targetLang = options.language.trim().toLowerCase();
        items = items.filter((r) => (r.language || '').trim().toLowerCase() === targetLang);
      }

      // 6. Type Filter
      if (options.type && options.type !== 'All' && options.type !== 'All Types') {
        const targetType = options.type.trim().toLowerCase();
        items = items.filter((r) => {
          const t1 = (r.type || '').trim().toLowerCase();
          const t2 = (r.resourceType || '').trim().toLowerCase();
          return t1 === targetType || t2 === targetType || (targetType === 'video lesson' && r.fileType === 'video');
        });
      }

      // 7. Search Filter
      if (options.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.trim().toLowerCase();
        items = items.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.subject.toLowerCase().includes(q) ||
            r.chapterName.toLowerCase().includes(q)
        );
      }

      // Sort by createdAt descending
      items.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsub;
}

/**
 * Fetch a single resource by ID
 */
export async function getLibraryResourceById(resourceId: string): Promise<FirestoreLibraryResource | null> {
  const path = `${RESOURCES_COLLECTION}/${resourceId}`;
  try {
    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapFirestoreResource(snap.data(), snap.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Student Saved / Bookmarked Resources in Firestore
 */
export async function toggleSaveResource(
  studentId: string,
  resource: FirestoreLibraryResource
): Promise<boolean> {
  const cleanStudentId = studentId || auth.currentUser?.uid || 'guest_student';
  const saveDocId = resource.resourceId;
  const path = `students/${cleanStudentId}/saved_resources/${saveDocId}`;

  try {
    const docRef = doc(db, 'students', cleanStudentId, 'saved_resources', saveDocId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await deleteDoc(docRef);
      return false; // Removed
    } else {
      const record: SavedResourceRecord = {
        id: saveDocId,
        resourceId: resource.resourceId,
        studentId: cleanStudentId,
        savedAt: new Date().toISOString(),
        resource
      };
      await setDoc(docRef, record);
      return true; // Added
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Subscribe to Student's Saved Resources from Firestore
 */
export function subscribeToSavedResources(
  studentId: string,
  callback: (records: SavedResourceRecord[]) => void
) {
  const cleanStudentId = studentId || auth.currentUser?.uid || 'guest_student';
  const path = `students/${cleanStudentId}/saved_resources`;

  const unsub = onSnapshot(
    collection(db, 'students', cleanStudentId, 'saved_resources'),
    (snap) => {
      const docs = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            resource: mapFirestoreResource(d.data().resource || {}, d.data().resourceId || d.id)
          } as SavedResourceRecord)
      );
      callback(docs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsub;
}

/**
 * Track Resource Download / View Counter in Firestore
 */
export async function trackResourceDownload(resourceId: string): Promise<void> {
  const path = `${RESOURCES_COLLECTION}/${resourceId}`;
  try {
    const docRef = doc(db, RESOURCES_COLLECTION, resourceId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const current = snap.data().downloadCount || 0;
      await updateDoc(docRef, {
        downloadCount: Number(current) + 1,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    // Silent metric increment error handling
    console.debug('trackResourceDownload note:', err);
  }
}

/**
 * Backward compatibility alias for saveOrPublishResource
 */
export const saveOrPublishResource = async (
  data: any,
  fileObj?: File | null
): Promise<DigitalLibraryResource> => {
  return createLibraryResource({
    title: data.title,
    description: data.description || '',
    type: data.type || data.resourceType || 'Study Material',
    class: data.class || data.classGrade || 'Class 10',
    subject: data.subject || 'Mathematics',
    chapterId: data.chapterId || 'ch_1',
    chapterName: data.chapterName || data.chapter || 'All Chapters',
    language: data.language || 'English',
    sourceType: fileObj ? 'file' : 'url',
    sourceUrl: data.sourceUrl || data.fileUrl || '',
    file: fileObj,
    board: data.board || 'AP State Board',
    license: data.license || 'Educational License',
    attribution: data.attribution || 'Teacher Uploaded',
    isAiGenerated: !!data.isAiGenerated,
    status: data.status || 'published'
  });
};
