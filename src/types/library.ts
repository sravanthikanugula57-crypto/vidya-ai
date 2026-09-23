export type OfficialResourceType =
  | 'Official Textbook'
  | 'Chapter Notes'
  | 'Formula / Key Facts'
  | 'Study Material'
  | 'Practice Material'
  | 'Previous / Model Papers'
  | 'Video Lesson';

export type LibraryResourceType =
  | OfficialResourceType
  | 'Textbook'
  | 'Formula Sheet'
  | 'Practice Questions'
  | 'Practice Sets'
  | 'Previous / Model Paper'
  | 'Assessment / Previous Paper'
  | 'Revision Material'
  | 'Video'
  | 'Video Lessons'
  | 'Worksheet'
  | 'Mock Tests'
  | 'Reference Material';

export type OfficialResourceStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'published'
  | 'unpublished';

export type ResourceStatus = OfficialResourceStatus | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type OfficialResourceLanguage = 'English' | 'Telugu' | 'Hindi';

export type OfficialResourceSourceType = 'file' | 'url';

export type ResourceSourceType =
  | 'Official AP Government Resource'
  | 'Official TS SCERT Resource'
  | 'Teacher Uploaded'
  | 'Admin Uploaded'
  | 'AI Generated — Teacher Reviewed';

export interface FormulaRuleExample {
  question: string;
  solution: string;
}

export interface ResourceUploader {
  uid: string;
  name: string;
  email?: string;
  role: 'teacher' | 'admin' | 'super_admin';
}

export interface FirestoreLibraryResource {
  resourceId: string;
  board: string;
  class: string; // 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  subject: string;
  chapterId: string;
  chapterName: string;
  type: OfficialResourceType;
  title: string;
  description: string;
  language: OfficialResourceLanguage;
  sourceType: OfficialResourceSourceType;
  sourceUrl: string;
  storagePath: string;
  fileUrl: string;
  license: string;
  attribution: string;
  uploadedBy: ResourceUploader | string;
  createdAt: string;
  updatedAt: string;
  status: OfficialResourceStatus;

  // Additional metadata & validation guards
  isAiGenerated?: boolean;
  isOfficial?: boolean;
  verifiedOfficialSource?: boolean;
  fileSize?: string;
  fileType?: string; // 'pdf' | 'mp4' | 'doc' | 'link'
  viewsCount?: number;
  downloadCount?: number;
  adminReviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt?: string;

  // Optional legacy compatibility aliases
  id?: string;
  classGrade?: string;
  chapter?: string;
  resourceType?: LibraryResourceType;
}

export type DigitalLibraryResource = FirestoreLibraryResource;

export interface SavedResourceRecord {
  id: string; // resourceId
  resourceId: string;
  studentId: string;
  savedAt: string;
  resource: DigitalLibraryResource;
}

