export type CMSContentType =
  | 'class'
  | 'subject'
  | 'chapter'
  | 'lesson'
  | 'video'
  | 'pdf'
  | 'worksheet'
  | 'question_bank'
  | 'quiz'
  | 'announcement'
  | 'career'
  | 'scholarship';

export type CMSApprovalStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'
  | 'Rejected';

export interface CMSVersionRecord {
  version: string;
  updatedAt: string;
  author: string;
  summary: string;
  changesDiff: string[];
}

export interface CMSApprovalRecord {
  status: CMSApprovalStatus;
  timestamp: string;
  actor: string;
  comments: string;
}

export interface CMSScheduleConfig {
  publishDate?: string;
  expiryDate?: string;
  targetDistrict?: string;
  targetAudience?: string;
  autoUnpublish?: boolean;
}

export interface CMSItemMeta {
  durationMinutes?: number;
  fileSizeMb?: number;
  url?: string;
  questionsCount?: number;
  maxMarks?: number;
  viewsCount: number;
  downloadsCount: number;
  grantAmount?: string;
  eligibleCriteria?: string;
  careerPathDetails?: string;
  salaryPackage?: string;
}

export interface CMSItem {
  id: string;
  type: CMSContentType;
  title: string;
  code: string;
  classLevel: string;
  subject: string;
  chapter?: string;
  medium: 'Telugu' | 'English' | 'Urdu' | 'All';
  description: string;
  status: CMSApprovalStatus;
  version: string;
  author: {
    name: string;
    role: string;
  };
  approver?: {
    name: string;
    role: string;
    timestamp?: string;
  };
  versionHistory: CMSVersionRecord[];
  approvalHistory: CMSApprovalRecord[];
  schedule: CMSScheduleConfig;
  meta: CMSItemMeta;
  createdAt: string;
  updatedAt: string;
}

export const CMS_TYPE_LABELS: Record<CMSContentType, { label: string; icon: string; color: string }> = {
  class: { label: 'Classes', icon: 'School', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  subject: { label: 'Subjects', icon: 'BookOpen', color: 'bg-sky-500/10 text-sky-600 border-sky-200' },
  chapter: { label: 'Chapters', icon: 'Layers', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  lesson: { label: 'Lessons', icon: 'FileText', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  video: { label: 'Videos', icon: 'Video', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
  pdf: { label: 'PDFs', icon: 'FileCode', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  worksheet: { label: 'Worksheets', icon: 'FileSpreadsheet', color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
  question_bank: { label: 'Question Banks', icon: 'Database', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  quiz: { label: 'Quizzes', icon: 'HelpCircle', color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200' },
  announcement: { label: 'Announcements', icon: 'Megaphone', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  career: { label: 'Career Content', icon: 'Compass', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
  scholarship: { label: 'Scholarship Content', icon: 'Award', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
};

export const INITIAL_CMS_ITEMS: CMSItem[] = [
  // 1. Classes
  {
    id: 'cms-cls-10',
    type: 'class',
    title: 'Class 10 State Board Curriculum',
    code: 'CLS-10-TS',
    classLevel: 'Class 10',
    subject: 'All Subjects',
    medium: 'Telugu',
    description: 'SSC Board Exam Grade 10 Master Curriculum with SCERT 2026 guidelines.',
    status: 'Published',
    version: 'v2.1',
    author: { name: 'SCERT Education Board', role: 'State Curriculum Authority' },
    approver: { name: 'Dr. B. Venkat Reddy', role: 'Director SCERT', timestamp: '2026-06-15' },
    versionHistory: [
      { version: 'v2.1', updatedAt: '2026-06-15', author: 'SCERT Board', summary: 'Added 2026 blueprint changes for Physical Science.', changesDiff: ['Updated Chapter 4 weightage', 'Added Vernacular audio sync tags'] },
      { version: 'v2.0', updatedAt: '2026-01-10', author: 'SCERT Board', summary: 'Annual SSC curriculum sync.', changesDiff: ['Integrated Bloom taxonomy model'] }
    ],
    approvalHistory: [
      { status: 'Draft', timestamp: '2026-06-01', actor: 'SCERT Staff', comments: 'Initial revision draft prepared.' },
      { status: 'Pending Approval', timestamp: '2026-06-10', actor: 'SCERT Board', comments: 'Submitted for State Board approval.' },
      { status: 'Approved', timestamp: '2026-06-14', actor: 'Dr. B. Venkat Reddy', comments: 'Approved without objections.' },
      { status: 'Published', timestamp: '2026-06-15', actor: 'System Auto-Publisher', comments: 'Live across 1,248 schools.' }
    ],
    schedule: { publishDate: '2026-06-15', targetDistrict: 'All AP Districts', targetAudience: 'Grade 10 Students & Teachers' },
    meta: { viewsCount: 142000, downloadsCount: 28400 },
    createdAt: '2026-01-10',
    updatedAt: '2026-06-15'
  },

  // 2. Subjects
  {
    id: 'cms-subj-ps',
    type: 'subject',
    title: 'Physical Science (భౌతిక శాస్త్రం)',
    code: 'SUBJ-PHYSCI-10',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    medium: 'Telugu',
    description: '12 Chapters covering Optics, Electromagnetism, Chemical Bonding, and Atomic Structure.',
    status: 'Published',
    version: 'v1.4',
    author: { name: 'Ramesh Sharma', role: 'Senior Physics Master' },
    approver: { name: 'Sravanthi Kanugula', role: 'District Education Officer', timestamp: '2026-07-01' },
    versionHistory: [
      { version: 'v1.4', updatedAt: '2026-07-01', author: 'Ramesh Sharma', summary: 'Added Snell Law ray diagram animation references.', changesDiff: ['Added 3 new interactive diagrams'] }
    ],
    approvalHistory: [
      { status: 'Approved', timestamp: '2026-07-01', actor: 'DEO Officer', comments: 'Content matches state curriculum syllabus.' }
    ],
    schedule: { publishDate: '2026-07-01', targetAudience: 'Class 10 Physical Science Students' },
    meta: { viewsCount: 98500, downloadsCount: 18200 },
    createdAt: '2026-02-01',
    updatedAt: '2026-07-01'
  },

  // 3. Chapters
  {
    id: 'cms-chap-refract',
    type: 'chapter',
    title: 'Chapter 4: Refraction of Light at Curved Surfaces',
    code: 'CHAP-OPTICS-04',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    medium: 'Telugu',
    description: 'Convex and Concave lens formulae, focal length calculations, and real-life optical illusions.',
    status: 'Published',
    version: 'v1.2',
    author: { name: 'K. Srimannarayana', role: 'Subject Expert ZPHS' },
    versionHistory: [
      { version: 'v1.2', updatedAt: '2026-07-10', author: 'K. Srimannarayana', summary: 'Clarified Lensmaker formula derivation steps.', changesDiff: ['Replaced equation image with LaTeX text'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-10', actor: 'Admin Panel', comments: 'Published to student app.' }
    ],
    schedule: { publishDate: '2026-07-10' },
    meta: { durationMinutes: 180, viewsCount: 54300, downloadsCount: 9200 },
    createdAt: '2026-03-01',
    updatedAt: '2026-07-10'
  },

  // 4. Lessons
  {
    id: 'cms-lsn-snell',
    type: 'lesson',
    title: 'Lesson Plan: Snell\'s Law & Critical Angle Demonstration',
    code: 'LSN-PHY-4.2',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    medium: 'English',
    description: '50-Minute structured lesson plan with zero-cost lab experiment using water glass and laser pointer.',
    status: 'Published',
    version: 'v1.1',
    author: { name: 'Ramesh Sharma', role: 'Physics Master' },
    versionHistory: [
      { version: 'v1.1', updatedAt: '2026-07-12', author: 'Ramesh Sharma', summary: 'Added village lab experiment step.', changesDiff: ['Added Zero-Cost Glass Mug activity'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-12', actor: 'Ramesh Sharma', comments: 'Ready for classroom delivery.' }
    ],
    schedule: { publishDate: '2026-07-12' },
    meta: { durationMinutes: 50, viewsCount: 12400, downloadsCount: 3100 },
    createdAt: '2026-07-05',
    updatedAt: '2026-07-12'
  },

  // 5. Videos
  {
    id: 'cms-vid-lens',
    type: 'video',
    title: 'Interactive Video: Ray Diagrams for Convex Lenses in Telugu',
    code: 'VID-TEL-OPT-01',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    medium: 'Telugu',
    description: 'Step-by-step ray diagram animation with voiceover in native AP Telugu dialect.',
    status: 'Published',
    version: 'v1.0',
    author: { name: 'AP Education Digital Unit', role: 'State Digital Media Unit' },
    versionHistory: [
      { version: 'v1.0', updatedAt: '2026-07-01', author: 'MANA TV', summary: 'Initial HD video release.', changesDiff: ['1080p video uploaded'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-01', actor: 'MANA TV Admin', comments: 'Synced with YouTube & T-SAT channel.' }
    ],
    schedule: { publishDate: '2026-07-01' },
    meta: { durationMinutes: 18, fileSizeMb: 145, url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', viewsCount: 89000, downloadsCount: 22000 },
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01'
  },

  // 6. PDFs
  {
    id: 'cms-pdf-scert-ch4',
    type: 'pdf',
    title: 'SCERT Class 10 Physical Science Chapter 4 Solution PDF',
    code: 'PDF-SCERT-PHY-10-C4',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    medium: 'Telugu',
    description: 'Complete textbook back-questions solved with diagrammatic steps and formula summaries.',
    status: 'Published',
    version: 'v2.0',
    author: { name: 'State Academic Authority', role: 'SCERT Textbook Committee' },
    versionHistory: [
      { version: 'v2.0', updatedAt: '2026-06-20', author: 'SCERT Committee', summary: 'Revised solutions for 2026 SSC pattern.', changesDiff: ['Corrected Question 8 focal length calculation'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-06-20', actor: 'SCERT Admin', comments: 'Verified by senior board examiners.' }
    ],
    schedule: { publishDate: '2026-06-20' },
    meta: { fileSizeMb: 4.8, url: 'https://scert.telangana.gov.in/docs/phy_ch4.pdf', viewsCount: 112000, downloadsCount: 64000 },
    createdAt: '2026-06-01',
    updatedAt: '2026-06-20'
  },

  // 7. Worksheets
  {
    id: 'cms-ws-quad',
    type: 'worksheet',
    title: 'Class 9 Quadratic Equations Factorization Worksheet (20 Problems)',
    code: 'WS-MATH-9-QUAD',
    classLevel: 'Class 9',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    medium: 'English',
    description: 'Practice worksheet ranging from basic integer roots to real-life word problem scenarios.',
    status: 'Published',
    version: 'v1.0',
    author: { name: 'G. Radhika', role: 'Mathematics Lead' },
    versionHistory: [
      { version: 'v1.0', updatedAt: '2026-07-15', author: 'G. Radhika', summary: 'Created 20 problem sets with answer key.', changesDiff: ['Initial worksheet release'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-15', actor: 'G. Radhika', comments: 'Shared with Class 9 teachers.' }
    ],
    schedule: { publishDate: '2026-07-15' },
    meta: { questionsCount: 20, maxMarks: 40, viewsCount: 8400, downloadsCount: 3900 },
    createdAt: '2026-07-15',
    updatedAt: '2026-07-15'
  },

  // 8. Question Banks
  {
    id: 'cms-qb-ssc-math',
    type: 'question_bank',
    title: 'Master Question Bank: SSC Class 10 Mathematics (500 Questions)',
    code: 'QB-SSC-MATH-500',
    classLevel: 'Class 10',
    subject: 'Mathematics',
    medium: 'All',
    description: 'Categorized by Bloom\'s Taxonomy (Remembering, Understanding, Applying, Evaluating) with Telugu & English versions.',
    status: 'Approved',
    version: 'v3.1',
    author: { name: 'Andhra Pradesh Board Exam Council', role: 'Board Paper Setter Committee' },
    approver: { name: 'DEO Vijayawada Office', role: 'District Approval Panel', timestamp: '2026-07-18' },
    versionHistory: [
      { version: 'v3.1', updatedAt: '2026-07-18', author: 'Exam Council', summary: 'Added 50 new real-life application questions.', changesDiff: ['Added 50 questions under Polynomials & Coordinate Geometry'] }
    ],
    approvalHistory: [
      { status: 'Approved', timestamp: '2026-07-18', actor: 'DEO Officer', comments: 'High quality question bank approved for mock exams.' }
    ],
    schedule: { publishDate: '2026-08-01', targetDistrict: 'All Districts' },
    meta: { questionsCount: 500, viewsCount: 45000, downloadsCount: 12800 },
    createdAt: '2026-01-15',
    updatedAt: '2026-07-18'
  },

  // 9. Quizzes
  {
    id: 'cms-qz-optics-10',
    type: 'quiz',
    title: 'Interactive Quiz: Refraction & Lens Formula MCQ Test',
    code: 'QZ-OPT-MCQ-10',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    medium: 'Telugu',
    description: '10 Instant-feedback multiple choice questions with adaptive hints and AI explanation popups.',
    status: 'Published',
    version: 'v1.0',
    author: { name: 'AI Tutor Content Team', role: 'Vernacular Quiz Developer' },
    versionHistory: [
      { version: 'v1.0', updatedAt: '2026-07-20', author: 'AI Content Team', summary: 'Initial Telugu interactive quiz.', changesDiff: ['Created 10 MCQ nodes with hints'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-20', actor: 'Content Admin', comments: 'Active on student mobile portal.' }
    ],
    schedule: { publishDate: '2026-07-20' },
    meta: { questionsCount: 10, maxMarks: 10, durationMinutes: 15, viewsCount: 32000, downloadsCount: 0 },
    createdAt: '2026-07-20',
    updatedAt: '2026-07-20'
  },

  // 10. Announcements
  {
    id: 'cms-ann-ssc-2027',
    type: 'announcement',
    title: 'Government Circular: SSC Public Examinations 2027 Model Paper Release',
    code: 'CIRCULAR-2026-089',
    classLevel: 'Class 10',
    subject: 'General',
    medium: 'All',
    description: 'Official notice from Directorate of Government Examinations regarding 6-paper exam format and Internal Assessment guidelines.',
    status: 'Published',
    version: 'v1.0',
    author: { name: 'Directorate of Govt Examinations', role: 'State Authority' },
    versionHistory: [
      { version: 'v1.0', updatedAt: '2026-07-22', author: 'DGE AP', summary: 'Official government circular published.', changesDiff: ['PDF attached & text announcement broadcast'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-22', actor: 'DGE Admin', comments: 'Sent to all Headmasters & DEO portals.' }
    ],
    schedule: { publishDate: '2026-07-22', targetAudience: 'All Headmasters, Teachers & Class 10 Parents' },
    meta: { viewsCount: 215000, downloadsCount: 48000 },
    createdAt: '2026-07-22',
    updatedAt: '2026-07-22'
  },

  // 11. Career Content
  {
    id: 'cms-car-polycet',
    type: 'career',
    title: 'Career Guide: AP POLYCET & Engineering Diploma Pathways',
    code: 'CAREER-POLYCET-AP',
    classLevel: 'Class 10',
    subject: 'Career Guidance',
    medium: 'Telugu',
    description: 'Detailed roadmap for Class 10 graduates entering Polytechnic colleges in Electronics, Mechanical, Mining, and Computer Engineering in AP.',
    status: 'Published',
    version: 'v1.3',
    author: { name: 'AP State Skill Council', role: 'Career Advisory Wing' },
    versionHistory: [
      { version: 'v1.3', updatedAt: '2026-07-05', author: 'Skill Council', summary: 'Updated cutoff ranks & stipend figures for 2026.', changesDiff: ['Added list of Govt Polytechnic Colleges in AP'] }
    ],
    approvalHistory: [
      { status: 'Published', timestamp: '2026-07-05', actor: 'Career Wing Head', comments: 'Featured on student career tab.' }
    ],
    schedule: { publishDate: '2026-07-05' },
    meta: { careerPathDetails: '3-Year Polytechnic Diploma -> Direct 2nd Year B.Tech Entry via ECET', salaryPackage: '₹2.5L - ₹6.0L / annum initial packages', viewsCount: 68000, downloadsCount: 19500 },
    createdAt: '2026-03-10',
    updatedAt: '2026-07-05'
  },

  // 12. Scholarship Content
  {
    id: 'cms-sch-nmms',
    type: 'scholarship',
    title: 'National Means-cum-Merit Scholarship (NMMS) AP SSC Scheme',
    code: 'SCHOLAR-NMMS-2026',
    classLevel: 'Class 8',
    subject: 'Scholarships',
    medium: 'Telugu',
    description: '₹12,000/year financial aid for meritorious government school students from Class 9 to Class 12.',
    status: 'Scheduled',
    version: 'v2.0',
    author: { name: 'Social Welfare Education Dept', role: 'State Scholarship Officer' },
    approver: { name: 'Director SCERT', role: 'State Authority', timestamp: '2026-07-25' },
    versionHistory: [
      { version: 'v2.0', updatedAt: '2026-07-25', author: 'Scholarship Dept', summary: 'Updated income eligibility criteria to ₹3.5 Lakhs/year.', changesDiff: ['Updated online portal submission links'] }
    ],
    approvalHistory: [
      { status: 'Scheduled', timestamp: '2026-07-25', actor: 'Director SCERT', comments: 'Scheduled for statewide release on August 1st.' }
    ],
    schedule: { publishDate: '2026-08-01', expiryDate: '2026-10-31', targetAudience: 'Class 8 Government School Students' },
    meta: { grantAmount: '₹12,000 per year (₹1,000 / month)', eligibleCriteria: 'Class 8 Govt School Students with >55% marks & parental income < ₹3.5L', viewsCount: 42000, downloadsCount: 11200 },
    createdAt: '2026-07-01',
    updatedAt: '2026-07-25'
  }
];
