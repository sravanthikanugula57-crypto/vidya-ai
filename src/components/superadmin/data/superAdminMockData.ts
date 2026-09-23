export interface SuperAdminSchool {
  id: string;
  udiseCode: string;
  name: string;
  district: string;
  state: string;
  board: string;
  medium: string;
  principalName: string;
  contactPhone: string;
  contactEmail: string;
  totalStudents: number;
  totalTeachers: number;
  activeTabletLabs: number;
  status: 'Active' | 'Maintenance' | 'Onboarding' | 'Suspended';
  licenseTier: 'Government Enterprise' | 'Model School Grant' | 'Pilot Edition';
  aiQuotaLimit: number; // daily queries
  aiQuotaUsed: number;
  establishedYear: number;
  lastAuditDate: string;
}

export interface SuperAdminDistrict {
  id: string;
  name: string;
  state: string;
  deoName: string;
  deoEmail: string;
  deoPhone: string;
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  allocatedBudget: string; // in Lakhs/Crores
  avgPassRate: number; // %
  aiUsageRank: number;
  status: 'Optimal' | 'Requires Attention' | 'High Performance';
}

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'District DEO' | 'School Principal' | 'Lead Teacher' | 'Content Moderator' | 'Support Engineer';
  district: string;
  schoolName?: string;
  status: 'Active' | 'Suspended' | 'Pending Approval';
  lastLogin: string;
  mfaEnabled: boolean;
  avatar: string;
}

export interface SuperAdminRole {
  id: string;
  name: string;
  level: 'Platform' | 'District' | 'School' | 'Moderation';
  description: string;
  usersCount: number;
  permissionsCount: number;
  isSystemRole: boolean;
}

export interface SuperAdminPermission {
  resource: string;
  description: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  exportData: boolean;
  audit: boolean;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  schoolName: string;
  district: string;
  subject: string;
  category: 'Hardware & Labs' | 'AI Tutor Errors' | 'Teacher Accounts' | 'Curriculum Sync' | 'Network & Bandwidth';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CMSContentItem {
  id: string;
  title: string;
  category: 'Curriculum Update' | 'Exam Notification' | 'AI Prompt KB' | 'Govt Circular' | 'Teacher Guide';
  targetGrades: string[];
  languages: string[];
  status: 'Published' | 'Draft' | 'Under Review' | 'Archived';
  author: string;
  publishDate: string;
  viewsCount: number;
  downloadsCount: number;
}

export interface AIModelConfig {
  id: string;
  modelAlias: string;
  modelCode: string;
  provider: 'Google Gemini (Official)' | 'Custom Fine-Tuned';
  primaryRole: string;
  temperature: number;
  maxOutputTokens: number;
  dailyRequestsLimit: number;
  currentDailyRequests: number;
  avgLatencyMs: number;
  status: 'Active' | 'Degraded' | 'Standby';
  safetyLevel: 'Strict' | 'Standard' | 'Custom';
}

export interface FlaggedContentItem {
  id: string;
  studentId: string;
  schoolName: string;
  district: string;
  querySnippet: string;
  aiResponseSnippet: string;
  flagReason: 'Harmful Content' | 'Exam Cheating Request' | 'Inappropriate Language' | 'Personal Data Exposure';
  severity: 'High' | 'Medium' | 'Low';
  status: 'Pending Review' | 'Blocked & Warned' | 'Auto-Dismissed' | 'Escalated to Principal';
  flaggedAt: string;
  language: string;
}

export interface SuperAdminAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  targetResource: string;
  ipAddress: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface PlatformHealthService {
  name: string;
  category: 'Compute' | 'Database' | 'AI Pipeline' | 'Edge & Network' | 'Auth & Security';
  status: 'Healthy' | 'Degraded' | 'Maintenance' | 'Down';
  uptimePercent: number;
  latencyMs: number;
  cpuLoadPercent: number;
  memoryUsagePercent: number;
  lastIncident?: string;
}

export interface SystemSettingsData {
  platformName: string;
  governmentAgency: string;
  portalVersion: string;
  maintenanceMode: boolean;
  lowBandwidthDefault: boolean;
  autoBackupDaily: boolean;
  maxSchoolAIQuota: number;
  supportEmail: string;
  supportPhone: string;
  smsGatewayStatus: 'Connected' | 'Disconnected';
  whatsappGatewayStatus: 'Connected' | 'Disconnected';
  securityEnforceMFA: boolean;
  sessionTimeoutMinutes: number;
}

// Initial Mock Data Sets

export const INITIAL_SUPERADMIN_SCHOOLS: SuperAdminSchool[] = [
  {
    id: 'sch-101',
    udiseCode: '36140100201',
    name: 'ZPHS Medak (Boys High School)',
    district: 'Medak',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'Telugu & English Medium',
    principalName: 'K. Rajendra Prasad',
    contactPhone: '+91 94401 22331',
    contactEmail: 'zphs.medak@telangana.gov.in',
    totalStudents: 840,
    totalTeachers: 28,
    activeTabletLabs: 2,
    status: 'Active',
    licenseTier: 'Government Enterprise',
    aiQuotaLimit: 15000,
    aiQuotaUsed: 11240,
    establishedYear: 1968,
    lastAuditDate: '2026-06-15',
  },
  {
    id: 'sch-102',
    udiseCode: '36140100504',
    name: 'ZPHS Narsapur Government High School',
    district: 'Medak',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'Telugu Medium',
    principalName: 'M. Shobha Rani',
    contactPhone: '+91 98480 33442',
    contactEmail: 'zphs.narsapur@telangana.gov.in',
    totalStudents: 620,
    totalTeachers: 22,
    activeTabletLabs: 1,
    status: 'Active',
    licenseTier: 'Model School Grant',
    aiQuotaLimit: 10000,
    aiQuotaUsed: 7850,
    establishedYear: 1974,
    lastAuditDate: '2026-05-20',
  },
  {
    id: 'sch-103',
    udiseCode: '36140100812',
    name: 'Government High School Tupran',
    district: 'Medak',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'English & Urdu Medium',
    principalName: 'Syed Abdul Rahim',
    contactPhone: '+91 99123 44556',
    contactEmail: 'ghs.tupran@telangana.gov.in',
    totalStudents: 950,
    totalTeachers: 34,
    activeTabletLabs: 3,
    status: 'Active',
    licenseTier: 'Government Enterprise',
    aiQuotaLimit: 20000,
    aiQuotaUsed: 16800,
    establishedYear: 1982,
    lastAuditDate: '2026-07-02',
  },
  {
    id: 'sch-104',
    udiseCode: '36150200110',
    name: 'ZPHS Sangareddy Model School',
    district: 'Sangareddy',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'English Medium',
    principalName: 'P. Venkateshwarlu',
    contactPhone: '+91 97012 88990',
    contactEmail: 'zphs.sangareddy@telangana.gov.in',
    totalStudents: 1120,
    totalTeachers: 41,
    activeTabletLabs: 4,
    status: 'Active',
    licenseTier: 'Government Enterprise',
    aiQuotaLimit: 25000,
    aiQuotaUsed: 21300,
    establishedYear: 1962,
    lastAuditDate: '2026-06-28',
  },
  {
    id: 'sch-105',
    udiseCode: '36160300405',
    name: 'Govt High School Siddipet Urban',
    district: 'Siddipet',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'Telugu & English Medium',
    principalName: 'G. Sujatha',
    contactPhone: '+91 96521 77112',
    contactEmail: 'ghs.siddipet@telangana.gov.in',
    totalStudents: 780,
    totalTeachers: 26,
    activeTabletLabs: 2,
    status: 'Maintenance',
    licenseTier: 'Model School Grant',
    aiQuotaLimit: 12000,
    aiQuotaUsed: 4200,
    establishedYear: 1991,
    lastAuditDate: '2026-04-10',
  },
  {
    id: 'sch-106',
    udiseCode: '36170400902',
    name: 'ZPHS Nizamabad Model Girls High School',
    district: 'Nizamabad',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'Telugu & English Medium',
    principalName: 'Dr. V. Lalitha',
    contactPhone: '+91 94900 11223',
    contactEmail: 'zphs.nizamabad@telangana.gov.in',
    totalStudents: 1350,
    totalTeachers: 48,
    activeTabletLabs: 4,
    status: 'Active',
    licenseTier: 'Government Enterprise',
    aiQuotaLimit: 30000,
    aiQuotaUsed: 26400,
    establishedYear: 1958,
    lastAuditDate: '2026-07-18',
  },
  {
    id: 'sch-107',
    udiseCode: '36180500301',
    name: 'Government High School Warangal Urban',
    district: 'Warangal',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'English Medium',
    principalName: 'B. Ramesh Chandra',
    contactPhone: '+91 98491 55667',
    contactEmail: 'ghs.warangal@telangana.gov.in',
    totalStudents: 1050,
    totalTeachers: 38,
    activeTabletLabs: 3,
    status: 'Active',
    licenseTier: 'Government Enterprise',
    aiQuotaLimit: 22000,
    aiQuotaUsed: 19100,
    establishedYear: 1970,
    lastAuditDate: '2026-07-01',
  },
  {
    id: 'sch-108',
    udiseCode: '36190600108',
    name: 'ZPHS Karimnagar Town School',
    district: 'Karimnagar',
    state: 'Telangana',
    board: 'Telangana State Board (SSC)',
    medium: 'Telugu Medium',
    principalName: 'N. Sammaiah',
    contactPhone: '+91 99890 66778',
    contactEmail: 'zphs.karimnagar@telangana.gov.in',
    totalStudents: 580,
    totalTeachers: 20,
    activeTabletLabs: 1,
    status: 'Onboarding',
    licenseTier: 'Pilot Edition',
    aiQuotaLimit: 8000,
    aiQuotaUsed: 1200,
    establishedYear: 1988,
    lastAuditDate: '2026-07-25',
  }
];

export const INITIAL_SUPERADMIN_DISTRICTS: SuperAdminDistrict[] = [
  {
    id: 'dist-1',
    name: 'Medak',
    state: 'Telangana',
    deoName: 'Sravanthi Kanugula',
    deoEmail: 'deo.medak@telangana.gov.in',
    deoPhone: '+91 94400 11001',
    totalSchools: 184,
    totalStudents: 42100,
    totalTeachers: 1420,
    allocatedBudget: '₹ 14.8 Cr',
    avgPassRate: 88.5,
    aiUsageRank: 1,
    status: 'High Performance',
  },
  {
    id: 'dist-2',
    name: 'Sangareddy',
    state: 'Telangana',
    deoName: 'Ch. Madhusudhan Rao',
    deoEmail: 'deo.sangareddy@telangana.gov.in',
    deoPhone: '+91 94400 11002',
    totalSchools: 210,
    totalStudents: 54300,
    totalTeachers: 1850,
    allocatedBudget: '₹ 18.2 Cr',
    avgPassRate: 86.2,
    aiUsageRank: 2,
    status: 'Optimal',
  },
  {
    id: 'dist-3',
    name: 'Siddipet',
    state: 'Telangana',
    deoName: 'K. Srinivasa Chary',
    deoEmail: 'deo.siddipet@telangana.gov.in',
    deoPhone: '+91 94400 11003',
    totalSchools: 165,
    totalStudents: 38200,
    totalTeachers: 1290,
    allocatedBudget: '₹ 12.5 Cr',
    avgPassRate: 82.1,
    aiUsageRank: 5,
    status: 'Requires Attention',
  },
  {
    id: 'dist-4',
    name: 'Nizamabad',
    state: 'Telangana',
    deoName: 'Dr. G. Prabhakar',
    deoEmail: 'deo.nizamabad@telangana.gov.in',
    deoPhone: '+91 94400 11004',
    totalSchools: 240,
    totalStudents: 61800,
    totalTeachers: 2100,
    allocatedBudget: '₹ 21.0 Cr',
    avgPassRate: 89.1,
    aiUsageRank: 3,
    status: 'High Performance',
  },
  {
    id: 'dist-5',
    name: 'Warangal',
    state: 'Telangana',
    deoName: 'M. Anuradha',
    deoEmail: 'deo.warangal@telangana.gov.in',
    deoPhone: '+91 94400 11005',
    totalSchools: 225,
    totalStudents: 58900,
    totalTeachers: 1980,
    allocatedBudget: '₹ 19.5 Cr',
    avgPassRate: 87.4,
    aiUsageRank: 4,
    status: 'Optimal',
  },
  {
    id: 'dist-6',
    name: 'Karimnagar',
    state: 'Telangana',
    deoName: 'V. Laxman',
    deoEmail: 'deo.karimnagar@telangana.gov.in',
    deoPhone: '+91 94400 11006',
    totalSchools: 190,
    totalStudents: 46800,
    totalTeachers: 1560,
    allocatedBudget: '₹ 15.0 Cr',
    avgPassRate: 84.0,
    aiUsageRank: 6,
    status: 'Optimal',
  }
];

export const INITIAL_SUPERADMIN_USERS: SuperAdminUser[] = [
  {
    id: 'usr-001',
    name: 'Sravanthi Kanugula',
    email: 'sravanthikanugula57@gmail.com',
    phone: '+91 94401 99887',
    role: 'Super Admin',
    district: 'State HQ (Hyderabad)',
    status: 'Active',
    lastLogin: '2026-07-30 09:42 AM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-002',
    name: 'K. Rajendra Prasad',
    email: 'zphs.medak@telangana.gov.in',
    phone: '+91 94401 22331',
    role: 'School Principal',
    district: 'Medak',
    schoolName: 'ZPHS Medak (Boys High School)',
    status: 'Active',
    lastLogin: '2026-07-30 08:15 AM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-003',
    name: 'Ch. Madhusudhan Rao',
    email: 'deo.sangareddy@telangana.gov.in',
    phone: '+91 94400 11002',
    role: 'District DEO',
    district: 'Sangareddy',
    status: 'Active',
    lastLogin: '2026-07-29 05:20 PM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-004',
    name: 'R. Nageshwar Rao',
    email: 'nageshwar.ai@telangana.edu.in',
    phone: '+91 98480 12345',
    role: 'Content Moderator',
    district: 'State HQ (Hyderabad)',
    status: 'Active',
    lastLogin: '2026-07-30 10:05 AM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-005',
    name: 'Dr. V. Lalitha',
    email: 'zphs.nizamabad@telangana.gov.in',
    phone: '+91 94900 11223',
    role: 'School Principal',
    district: 'Nizamabad',
    schoolName: 'ZPHS Nizamabad Model Girls High School',
    status: 'Active',
    lastLogin: '2026-07-28 02:40 PM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr-006',
    name: 'P. Vikram Varma',
    email: 'support.eng@vidya.ai',
    phone: '+91 91212 33445',
    role: 'Support Engineer',
    district: 'State HQ (Hyderabad)',
    status: 'Active',
    lastLogin: '2026-07-30 09:10 AM',
    mfaEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  }
];

export const INITIAL_SUPERADMIN_ROLES: SuperAdminRole[] = [
  {
    id: 'role-1',
    name: 'Super Admin (State Level)',
    level: 'Platform',
    description: 'Full unrestricted control across all districts, schools, security policies, AI model configs, and financials.',
    usersCount: 3,
    permissionsCount: 28,
    isSystemRole: true,
  },
  {
    id: 'role-2',
    name: 'District DEO Officer',
    level: 'District',
    description: 'Administrative control over all government schools within an assigned district, budget, and performance reports.',
    usersCount: 33,
    permissionsCount: 20,
    isSystemRole: true,
  },
  {
    id: 'role-3',
    name: 'School Principal / HM',
    level: 'School',
    description: 'School-level administration, teacher assignments, student rosters, timetable, and school performance stats.',
    usersCount: 1248,
    permissionsCount: 14,
    isSystemRole: true,
  },
  {
    id: 'role-4',
    name: 'AI & Safety Moderator',
    level: 'Moderation',
    description: 'Monitors student-AI tutor chat logs, flags harmful queries, manages vernacular AI guardrails.',
    usersCount: 12,
    permissionsCount: 8,
    isSystemRole: false,
  },
  {
    id: 'role-5',
    name: 'Platform Support Engineer',
    level: 'Platform',
    description: 'Handles multi-school helpdesk tickets, tablet lab network configs, system diagnostics, and server alerts.',
    usersCount: 8,
    permissionsCount: 11,
    isSystemRole: false,
  }
];

export const INITIAL_SUPERADMIN_PERMISSIONS: SuperAdminPermission[] = [
  { resource: 'Schools Directory & UDISE', description: 'Create, edit, suspend, and configure school profiles', read: true, write: true, delete: true, approve: true, exportData: true, audit: true },
  { resource: 'District Budgets & Grants', description: 'Manage district financial allocations and equipment grants', read: true, write: true, delete: false, approve: true, exportData: true, audit: true },
  { resource: 'User Accounts & RBAC', description: 'Provision users, assign roles, reset passwords, enforce MFA', read: true, write: true, delete: true, approve: true, exportData: true, audit: true },
  { resource: 'Gemini AI Model Governance', description: 'Configure model prompts, temperature, safety thresholds, and token limits', read: true, write: true, delete: false, approve: true, exportData: true, audit: true },
  { resource: 'Content Management (CMS)', description: 'Publish State Syllabus updates, AI Knowledge Base PDFs, and circulars', read: true, write: true, delete: true, approve: true, exportData: true, audit: true },
  { resource: 'Content Safety & Moderation', description: 'Review flagged queries, block abusive prompts, update word filters', read: true, write: true, delete: true, approve: true, exportData: true, audit: true },
  { resource: 'System Audit & Logs', description: 'Access immutable system audit trails and export compliance reports', read: true, write: false, delete: false, approve: false, exportData: true, audit: true },
  { resource: 'Infrastructure & Security', description: 'Cloud Run settings, Firestore backups, IP Whitelists, and maintenance mode', read: true, write: true, delete: false, approve: true, exportData: true, audit: true },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    ticketCode: 'TKT-2026-881',
    schoolName: 'ZPHS Tupran',
    district: 'Medak',
    subject: 'Tablet Lab Router IP conflict causing offline sync delay',
    category: 'Network & Bandwidth',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'P. Vikram Varma',
    createdAt: '2026-07-29 11:30 AM',
    updatedAt: '2026-07-30 08:15 AM',
  },
  {
    id: 'tkt-102',
    ticketCode: 'TKT-2026-882',
    schoolName: 'Govt High School Siddipet',
    district: 'Siddipet',
    subject: 'Request to increase daily Gemini AI token quota for Class 10 Board exam prep',
    category: 'AI Tutor Errors',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Unassigned',
    createdAt: '2026-07-30 07:45 AM',
    updatedAt: '2026-07-30 07:45 AM',
  },
  {
    id: 'tkt-103',
    ticketCode: 'TKT-2026-883',
    schoolName: 'ZPHS Karimnagar Town',
    district: 'Karimnagar',
    subject: 'Batch onboarding error for 12 new teacher accounts',
    category: 'Teacher Accounts',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'P. Vikram Varma',
    createdAt: '2026-07-27 03:20 PM',
    updatedAt: '2026-07-28 10:10 AM',
  },
  {
    id: 'tkt-104',
    ticketCode: 'TKT-2026-884',
    schoolName: 'ZPHS Nizamabad Model Girls',
    district: 'Nizamabad',
    subject: 'Class 9 Telugu medium Physical Science AI diagram rendering issue',
    category: 'Curriculum Sync',
    priority: 'Low',
    status: 'In Progress',
    assignedTo: 'R. Nageshwar Rao',
    createdAt: '2026-07-29 02:15 PM',
    updatedAt: '2026-07-30 09:00 AM',
  }
];

export const INITIAL_CMS_CONTENT: CMSContentItem[] = [
  {
    id: 'cms-1',
    title: 'AP SSC Class 10 Science Model Papers 2026 (Telugu & English)',
    category: 'Curriculum Update',
    targetGrades: ['Class 10'],
    languages: ['Telugu', 'English'],
    status: 'Published',
    author: 'State SCERT Andhra Pradesh',
    publishDate: '2026-07-15',
    viewsCount: 42800,
    downloadsCount: 18500,
  },
  {
    id: 'cms-2',
    title: 'NMMS (National Means-cum-Merit Scholarship) Prep Guide & AI Quiz Bank',
    category: 'Exam Notification',
    targetGrades: ['Class 8'],
    languages: ['Telugu', 'English', 'Urdu'],
    status: 'Published',
    author: 'State SCERT Andhra Pradesh',
    publishDate: '2026-07-01',
    viewsCount: 31200,
    downloadsCount: 12400,
  },
  {
    id: 'cms-3',
    title: 'Class 9 Mathematics Trigonometry Visual AI Prompt Manual',
    category: 'AI Prompt KB',
    targetGrades: ['Class 9'],
    languages: ['English'],
    status: 'Under Review',
    author: 'R. Nageshwar Rao',
    publishDate: '2026-07-28',
    viewsCount: 120,
    downloadsCount: 15,
  },
  {
    id: 'cms-4',
    title: 'Government School Digital Tablet Lab Standard Operating Procedure',
    category: 'Teacher Guide',
    targetGrades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    languages: ['Telugu', 'English'],
    status: 'Published',
    author: 'DEO Education Cell',
    publishDate: '2026-06-20',
    viewsCount: 8900,
    downloadsCount: 3200,
  }
];

export const INITIAL_AI_MODELS: AIModelConfig[] = [
  {
    id: 'aimod-1',
    modelAlias: 'VidyaAI Primary Tutor',
    modelCode: 'gemini-2.0-flash',
    provider: 'Google Gemini (Official)',
    primaryRole: 'Real-time multi-lingual tutoring, interactive step-by-step problem solving, and instant hints.',
    temperature: 0.3,
    maxOutputTokens: 2048,
    dailyRequestsLimit: 5000000,
    currentDailyRequests: 1842900,
    avgLatencyMs: 280,
    status: 'Active',
    safetyLevel: 'Strict',
  },
  {
    id: 'aimod-2',
    modelAlias: 'VidyaAI Advanced Reasoning & Math',
    modelCode: 'gemini-1.5-pro',
    provider: 'Google Gemini (Official)',
    primaryRole: 'Complex Physics & Math derivation verification, deep conceptual explanations, and SCERT syllabus validation.',
    temperature: 0.2,
    maxOutputTokens: 4096,
    dailyRequestsLimit: 1000000,
    currentDailyRequests: 312000,
    avgLatencyMs: 640,
    status: 'Active',
    safetyLevel: 'Strict',
  },
  {
    id: 'aimod-3',
    modelAlias: 'VidyaVernacular Telugu/Urdu Engine',
    modelCode: 'gemini-1.5-flash-vernacular',
    provider: 'Custom Fine-Tuned',
    primaryRole: 'Native voice synthesis, hyper-local Telugu/Urdu idiom adaptation, low-literacy student support.',
    temperature: 0.4,
    maxOutputTokens: 2048,
    dailyRequestsLimit: 2000000,
    currentDailyRequests: 890000,
    avgLatencyMs: 310,
    status: 'Active',
    safetyLevel: 'Strict',
  }
];

export const INITIAL_FLAGGED_CONTENT: FlaggedContentItem[] = [
  {
    id: 'flg-101',
    studentId: 'STU-MED-8812',
    schoolName: 'ZPHS Medak',
    district: 'Medak',
    querySnippet: 'How to bypass online exam timer in VidyaAI app?',
    aiResponseSnippet: 'I cannot help with cheating or altering exam timers. Please focus on answering your test questions honestly.',
    flagReason: 'Exam Cheating Request',
    severity: 'Medium',
    status: 'Pending Review',
    flaggedAt: '2026-07-30 08:42 AM',
    language: 'English',
  },
  {
    id: 'flg-102',
    studentId: 'STU-TUP-4410',
    schoolName: 'ZPHS Tupran',
    district: 'Medak',
    querySnippet: 'నా ఫోన్ నంబర్ మరియు ఆధార్ నంబర్ 98480xxxxx',
    aiResponseSnippet: 'దయచేసి మీ వ్యక్తిగత సమాచారం (ఆధార్, ఫోన్ నంబర్) ఎవరితోనూ పంచుకోవద్దు.',
    flagReason: 'Personal Data Exposure',
    severity: 'Low',
    status: 'Auto-Dismissed',
    flaggedAt: '2026-07-29 04:15 PM',
    language: 'Telugu',
  },
  {
    id: 'flg-103',
    studentId: 'STU-SAN-9901',
    schoolName: 'ZPHS Sangareddy',
    district: 'Sangareddy',
    querySnippet: 'Give me exact solved answer key for Class 10 Midterm Physics Paper',
    aiResponseSnippet: 'I can guide you through the principles of Physics to solve the questions yourself, but I cannot give direct leak answers.',
    flagReason: 'Exam Cheating Request',
    severity: 'High',
    status: 'Blocked & Warned',
    flaggedAt: '2026-07-29 11:20 AM',
    language: 'English',
  }
];

export const INITIAL_SUPERADMIN_AUDIT_LOGS: SuperAdminAuditLog[] = [
  {
    id: 'aud-801',
    actorName: 'Sravanthi Kanugula',
    actorRole: 'Super Admin',
    action: 'Updated District Budget Allocation',
    module: 'Districts',
    targetResource: 'Medak District (₹ 14.8 Cr)',
    ipAddress: '103.21.126.44 (Hyd Govt Net)',
    timestamp: '2026-07-30 09:30 AM',
    status: 'Success',
  },
  {
    id: 'aud-802',
    actorName: 'Sravanthi Kanugula',
    actorRole: 'Super Admin',
    action: 'Modified Gemini AI Safety Threshold',
    module: 'AI Models',
    targetResource: 'Gemini 2.0 Flash (Strict Mode Enforced)',
    ipAddress: '103.21.126.44 (Hyd Govt Net)',
    timestamp: '2026-07-29 04:10 PM',
    status: 'Success',
  },
  {
    id: 'aud-803',
    actorName: 'System Gateway',
    actorRole: 'Automated Bot',
    action: 'Daily Firestore Backup Triggered',
    module: 'System Settings',
    targetResource: 'Firestore Cloud Storage (Asia-South1)',
    ipAddress: '10.128.0.2',
    timestamp: '2026-07-29 02:00 AM',
    status: 'Success',
  },
  {
    id: 'aud-804',
    actorName: 'Ch. Madhusudhan Rao',
    actorRole: 'District DEO',
    action: 'Added New School Profile',
    module: 'Schools',
    targetResource: 'ZPHS Sangareddy Model School',
    ipAddress: '183.82.110.12',
    timestamp: '2026-07-28 01:45 PM',
    status: 'Success',
  },
  {
    id: 'aud-805',
    actorName: 'Security Engine',
    actorRole: 'Security Bot',
    action: 'Failed Super Admin Login Attempt',
    module: 'Security Dashboard',
    targetResource: 'Admin IP 182.72.11.9',
    ipAddress: '182.72.11.9',
    timestamp: '2026-07-27 11:12 PM',
    status: 'Warning',
  }
];

export const INITIAL_PLATFORM_SERVICES: PlatformHealthService[] = [
  { name: 'Cloud Run Web Server Cluster', category: 'Compute', status: 'Healthy', uptimePercent: 99.99, latencyMs: 42, cpuLoadPercent: 28, memoryUsagePercent: 44 },
  { name: 'Firestore Multi-Region DB', category: 'Database', status: 'Healthy', uptimePercent: 99.98, latencyMs: 18, cpuLoadPercent: 32, memoryUsagePercent: 51 },
  { name: 'Gemini AI API Proxy Edge', category: 'AI Pipeline', status: 'Healthy', uptimePercent: 99.95, latencyMs: 240, cpuLoadPercent: 45, memoryUsagePercent: 62 },
  { name: 'Vernacular Speech & Audio CDN', category: 'Edge & Network', status: 'Healthy', uptimePercent: 99.92, latencyMs: 85, cpuLoadPercent: 22, memoryUsagePercent: 38 },
  { name: 'AP Govt OAuth & MFA', category: 'Auth & Security', status: 'Healthy', uptimePercent: 100.0, latencyMs: 25, cpuLoadPercent: 15, memoryUsagePercent: 29 },
  { name: 'Low-Bandwidth Offline Sync Gateway', category: 'Edge & Network', status: 'Healthy', uptimePercent: 99.90, latencyMs: 110, cpuLoadPercent: 30, memoryUsagePercent: 41 },
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettingsData = {
  platformName: 'VidyaAI Government Super Admin Portal',
  governmentAgency: 'Department of School Education, Govt. of Andhra Pradesh',
  portalVersion: 'v3.2.0-Enterprise',
  maintenanceMode: false,
  lowBandwidthDefault: true,
  autoBackupDaily: true,
  maxSchoolAIQuota: 30000,
  supportEmail: 'deo.support@ap.gov.in',
  supportPhone: '1800-425-3388 (Toll Free)',
  smsGatewayStatus: 'Connected',
  whatsappGatewayStatus: 'Connected',
  securityEnforceMFA: true,
  sessionTimeoutMinutes: 30,
};
