export interface AdminStudent {
  id: string;
  rollNo: string;
  name: string;
  grade: string;
  section: string;
  gender: 'Female' | 'Male' | 'Other';
  guardianName: string;
  guardianPhone: string;
  attendancePercent: number;
  academicAverage: number;
  status: 'Active' | 'On Leave' | 'Transferred';
  casteCategory?: string;
  scholarshipEligible: boolean;
}

export interface AdminTeacher {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  subjects: string[];
  classTeacherOf?: string;
  phone: string;
  email: string;
  qualification: string;
  experienceYears: number;
  attendanceStatus: 'Present' | 'On Leave' | 'Late';
  assignedPeriodsPerWeek: number;
}

export interface AdminClass {
  id: string;
  name: string; // e.g. "Class 9-A"
  grade: string;
  section: string;
  roomNumber: string;
  classTeacher: string;
  studentCount: number;
  capacity: number;
  attendanceToday: number;
  averageGpa: number;
}

export interface AdminSubject {
  id: string;
  code: string; // e.g. "MATH-09"
  name: string;
  grade: string;
  departmentHead: string;
  weeklyPeriods: number;
  curriculumBoard: 'SCERT AP SSC' | 'SCERT Telangana' | 'NCERT (Mapped to SSC)';
  teachersAssigned: number;
}

export interface TimetableSlot {
  id: string;
  periodNumber: number;
  timeSlot: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface DayTimetable {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  slots: TimetableSlot[];
}

export interface SchoolReport {
  id: string;
  title: string;
  category: 'Academic' | 'Attendance' | 'Compliance' | 'DEO Government' | 'Financial/Grant';
  generatedDate: string;
  generatedBy: string;
  status: 'Ready' | 'Processing';
  fileFormat: 'PDF' | 'EXCEL' | 'CSV';
  description: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'Urgent' | 'Academic' | 'Holiday' | 'DEO Circular' | 'Event';
  targetAudience: 'All' | 'Teachers' | 'Students' | 'Parents';
  publishedBy: string;
  date: string;
  priority: 'High' | 'Medium' | 'Normal';
  status: 'Published' | 'Draft' | 'Archived';
}

export interface CalendarEventItem {
  id: string;
  title: string;
  type: 'Exam' | 'Holiday' | 'Sports' | 'Meeting' | 'Inspection';
  startDate: string;
  endDate: string;
  description: string;
  applicableGrades: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface PermissionRole {
  roleId: string;
  roleName: string;
  description: string;
  userCount: number;
  permissions: {
    studentRead: boolean;
    studentWrite: boolean;
    teacherManage: boolean;
    gradeEdit: boolean;
    timetableManage: boolean;
    financeRead: boolean;
    settingsManage: boolean;
    broadcastPublish: boolean;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface SchoolSettingsData {
  schoolName: string;
  schoolCode: string;
  affiliationNumber: string;
  board: string;
  district: string;
  state: string;
  principalName: string;
  phone: string;
  email: string;
  address: string;
  academicYear: string;
  workingDaysPerWeek: number;
  startTime: string;
  endTime: string;
}

// Mock Data Sets
export const INITIAL_SCHOOL_SETTINGS: SchoolSettingsData = {
  schoolName: 'Zilla Parishad High School (ZPHS), Vijayawada',
  schoolCode: 'AP-NTR-ZPHS-1042',
  affiliationNumber: 'AP-SSC-2026-984',
  board: 'Andhra Pradesh State Board of Secondary Education (AP SSC / SCERT AP)',
  district: 'NTR Vijayawada',
  state: 'Andhra Pradesh',
  principalName: 'Ramesh Sharma (M.Sc, B.Ed)',
  phone: '+91 866 220192',
  email: 'zphs.vijayawada@ap.gov.in',
  address: 'Main Road, Near Bus Station, Vijayawada, NTR District - 520001',
  academicYear: '2026 - 2027',
  workingDaysPerWeek: 6,
  startTime: '08:45 AM',
  endTime: '04:15 PM',
};

export const INITIAL_STUDENTS: AdminStudent[] = [
  {
    id: 'STU-001',
    rollNo: '24',
    name: 'Ananya Sharma',
    grade: 'Class 9',
    section: 'A',
    gender: 'Female',
    guardianName: 'Savitri Devi Sharma',
    guardianPhone: '+91 98765 43210',
    attendancePercent: 98,
    academicAverage: 92,
    status: 'Active',
    casteCategory: 'OBC',
    scholarshipEligible: true,
  },
  {
    id: 'STU-002',
    rollNo: '18',
    name: 'Kumar Sharma',
    grade: 'Class 6',
    section: 'B',
    gender: 'Male',
    guardianName: 'Savitri Devi Sharma',
    guardianPhone: '+91 98765 43210',
    attendancePercent: 96,
    academicAverage: 88,
    status: 'Active',
    casteCategory: 'OBC',
    scholarshipEligible: true,
  },
  {
    id: 'STU-003',
    rollNo: '01',
    name: 'Aarav Reddy',
    grade: 'Class 10',
    section: 'A',
    gender: 'Male',
    guardianName: 'Venkat Reddy',
    guardianPhone: '+91 91234 56789',
    attendancePercent: 94,
    academicAverage: 95,
    status: 'Active',
    casteCategory: 'General',
    scholarshipEligible: false,
  },
  {
    id: 'STU-004',
    rollNo: '12',
    name: 'Bhavani Devi',
    grade: 'Class 9',
    section: 'B',
    gender: 'Female',
    guardianName: 'Narayana Rao',
    guardianPhone: '+91 99887 76655',
    attendancePercent: 99,
    academicAverage: 91,
    status: 'Active',
    casteCategory: 'SC',
    scholarshipEligible: true,
  },
  {
    id: 'STU-005',
    rollNo: '08',
    name: 'Chaitanya Varma',
    grade: 'Class 8',
    section: 'A',
    gender: 'Male',
    guardianName: 'Srinivas Varma',
    guardianPhone: '+91 94401 23456',
    attendancePercent: 91,
    academicAverage: 84,
    status: 'Active',
    casteCategory: 'General',
    scholarshipEligible: false,
  },
  {
    id: 'STU-006',
    rollNo: '15',
    name: 'Divya Sri',
    grade: 'Class 10',
    section: 'B',
    gender: 'Female',
    guardianName: 'Mallesh Goud',
    guardianPhone: '+91 98490 11223',
    attendancePercent: 97,
    academicAverage: 94,
    status: 'Active',
    casteCategory: 'OBC',
    scholarshipEligible: true,
  },
  {
    id: 'STU-007',
    rollNo: '30',
    name: 'Eshwar Naidu',
    grade: 'Class 7',
    section: 'A',
    gender: 'Male',
    guardianName: 'Krishna Naidu',
    guardianPhone: '+91 97012 33445',
    attendancePercent: 88,
    academicAverage: 79,
    status: 'On Leave',
    casteCategory: 'ST',
    scholarshipEligible: true,
  },
  {
    id: 'STU-008',
    rollNo: '05',
    name: 'Farhan Ali',
    grade: 'Class 9',
    section: 'A',
    gender: 'Male',
    guardianName: 'Yousuf Ali',
    guardianPhone: '+91 96521 88776',
    attendancePercent: 95,
    academicAverage: 89,
    status: 'Active',
    casteCategory: 'Minority',
    scholarshipEligible: true,
  }
];

export const INITIAL_TEACHERS: AdminTeacher[] = [
  {
    id: 'TCH-101',
    employeeId: 'EMP-2021-042',
    name: 'Ramesh Sharma',
    designation: 'Headmaster & PGT Mathematics',
    subjects: ['Mathematics', 'Physical Science'],
    classTeacherOf: 'Class 9-A',
    phone: '+91 94411 22334',
    email: 'ramesh.sharma@telangana.gov.in',
    qualification: 'M.Sc (Maths), B.Ed, M.Ed',
    experienceYears: 18,
    attendanceStatus: 'Present',
    assignedPeriodsPerWeek: 22,
  },
  {
    id: 'TCH-102',
    employeeId: 'EMP-2019-018',
    name: 'Dr. Sunitha Rao',
    designation: 'Senior TGT Biological Science',
    subjects: ['Biological Science', 'Environmental Education'],
    classTeacherOf: 'Class 10-A',
    phone: '+91 98480 33445',
    email: 'sunitha.rao@telangana.gov.in',
    qualification: 'Ph.D (Botany), M.Sc, B.Ed',
    experienceYears: 14,
    attendanceStatus: 'Present',
    assignedPeriodsPerWeek: 26,
  },
  {
    id: 'TCH-103',
    employeeId: 'EMP-2022-089',
    name: 'K. Venkatswamy',
    designation: 'School Assistant Social Studies',
    subjects: ['Social Studies', 'Telangana History'],
    classTeacherOf: 'Class 8-A',
    phone: '+91 97001 55667',
    email: 'venkatswamy.k@telangana.gov.in',
    qualification: 'M.A (History), B.Ed',
    experienceYears: 11,
    attendanceStatus: 'Present',
    assignedPeriodsPerWeek: 24,
  },
  {
    id: 'TCH-104',
    employeeId: 'EMP-2023-012',
    name: 'Priyanka N.',
    designation: 'Language Pandit (English)',
    subjects: ['English Language', 'Communicative English'],
    classTeacherOf: 'Class 9-B',
    phone: '+91 91212 66778',
    email: 'priyanka.n@telangana.gov.in',
    qualification: 'M.A (English Lit), B.Ed',
    experienceYears: 8,
    attendanceStatus: 'Present',
    assignedPeriodsPerWeek: 28,
  },
  {
    id: 'TCH-105',
    employeeId: 'EMP-2018-005',
    name: 'G. Srinivas',
    designation: 'Telugu Bhasha Pandit',
    subjects: ['Telugu Literature', 'Vernacular Grammar'],
    classTeacherOf: 'Class 7-A',
    phone: '+91 96522 77889',
    email: 'srinivas.g@telangana.gov.in',
    qualification: 'M.A (Telugu), TPT',
    experienceYears: 15,
    attendanceStatus: 'On Leave',
    assignedPeriodsPerWeek: 24,
  },
  {
    id: 'TCH-106',
    employeeId: 'EMP-2024-003',
    name: 'Mohammed Rizwan',
    designation: 'Physical Education Director (PET)',
    subjects: ['Physical Education', 'Yoga & Sports'],
    phone: '+91 98499 88990',
    email: 'rizwan.pet@telangana.gov.in',
    qualification: 'M.P.Ed, NIS Coach',
    experienceYears: 6,
    attendanceStatus: 'Present',
    assignedPeriodsPerWeek: 20,
  }
];

export const INITIAL_CLASSES: AdminClass[] = [
  { id: 'CLS-001', name: 'Class 9-A', grade: 'Class 9', section: 'A', roomNumber: 'Room 102', classTeacher: 'Ramesh Sharma', studentCount: 42, capacity: 45, attendanceToday: 98, averageGpa: 8.8 },
  { id: 'CLS-002', name: 'Class 9-B', grade: 'Class 9', section: 'B', roomNumber: 'Room 103', classTeacher: 'Priyanka N.', studentCount: 40, capacity: 45, attendanceToday: 95, averageGpa: 8.4 },
  { id: 'CLS-003', name: 'Class 10-A', grade: 'Class 10', section: 'A', roomNumber: 'Room 201', classTeacher: 'Dr. Sunitha Rao', studentCount: 44, capacity: 45, attendanceToday: 97, averageGpa: 9.1 },
  { id: 'CLS-004', name: 'Class 10-B', grade: 'Class 10', section: 'B', roomNumber: 'Room 202', classTeacher: 'T. Mallesh', studentCount: 41, capacity: 45, attendanceToday: 93, averageGpa: 8.2 },
  { id: 'CLS-005', name: 'Class 8-A', grade: 'Class 8', section: 'A', roomNumber: 'Room 101', classTeacher: 'K. Venkatswamy', studentCount: 38, capacity: 45, attendanceToday: 96, averageGpa: 8.5 },
  { id: 'CLS-006', name: 'Class 7-A', grade: 'Class 7', section: 'A', roomNumber: 'Room 004', classTeacher: 'G. Srinivas', studentCount: 39, capacity: 45, attendanceToday: 92, averageGpa: 8.1 },
  { id: 'CLS-007', name: 'Class 6-B', grade: 'Class 6', section: 'B', roomNumber: 'Room 002', classTeacher: 'M. Saritha', studentCount: 36, capacity: 40, attendanceToday: 96, averageGpa: 8.6 },
];

export const INITIAL_SUBJECTS: AdminSubject[] = [
  { id: 'SUB-01', code: 'MATH-09', name: 'Mathematics', grade: 'Class 9', departmentHead: 'Ramesh Sharma', weeklyPeriods: 7, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 3 },
  { id: 'SUB-02', code: 'PSCI-09', name: 'Physical Science', grade: 'Class 9', departmentHead: 'Ramesh Sharma', weeklyPeriods: 5, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 2 },
  { id: 'SUB-03', code: 'BSCI-09', name: 'Biological Science', grade: 'Class 9', departmentHead: 'Dr. Sunitha Rao', weeklyPeriods: 5, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 2 },
  { id: 'SUB-04', code: 'SOC-09', name: 'Social Studies', grade: 'Class 9', departmentHead: 'K. Venkatswamy', weeklyPeriods: 6, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 3 },
  { id: 'SUB-05', code: 'ENG-09', name: 'English Language', grade: 'Class 9', departmentHead: 'Priyanka N.', weeklyPeriods: 6, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 3 },
  { id: 'SUB-06', code: 'TEL-09', name: 'Telugu First Language', grade: 'Class 9', departmentHead: 'G. Srinivas', weeklyPeriods: 6, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 3 },
  { id: 'SUB-07', code: 'HIN-09', name: 'Hindi Second Language', grade: 'Class 9', departmentHead: 'S. K. Fatima', weeklyPeriods: 4, curriculumBoard: 'SCERT AP SSC', teachersAssigned: 2 },
];

export const INITIAL_TIMETABLE: DayTimetable[] = [
  {
    day: 'Monday',
    slots: [
      { id: 's1', periodNumber: 1, timeSlot: '09:00 - 09:45 AM', subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 102' },
      { id: 's2', periodNumber: 2, timeSlot: '09:45 - 10:30 AM', subject: 'Physical Science', teacher: 'Ramesh Sharma', room: 'Room 102' },
      { id: 's3', periodNumber: 3, timeSlot: '10:45 - 11:30 AM', subject: 'English Language', teacher: 'Priyanka N.', room: 'Room 102' },
      { id: 's4', periodNumber: 4, timeSlot: '11:30 - 12:15 PM', subject: 'Telugu Language', teacher: 'G. Srinivas', room: 'Room 102' },
      { id: 's5', periodNumber: 5, timeSlot: '01:00 - 01:45 PM', subject: 'Biological Science', teacher: 'Dr. Sunitha Rao', room: 'Biology Lab' },
      { id: 's6', periodNumber: 6, timeSlot: '01:45 - 02:30 PM', subject: 'Social Studies', teacher: 'K. Venkatswamy', room: 'Room 102' },
      { id: 's7', periodNumber: 7, timeSlot: '02:40 - 03:25 PM', subject: 'AI Digital Lab', teacher: 'S. K. Fatima', room: 'Computer Lab' },
      { id: 's8', periodNumber: 8, timeSlot: '03:25 - 04:10 PM', subject: 'Sports & Games', teacher: 'Mohammed Rizwan', room: 'Playground' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { id: 's21', periodNumber: 1, timeSlot: '09:00 - 09:45 AM', subject: 'English Language', teacher: 'Priyanka N.', room: 'Room 102' },
      { id: 's22', periodNumber: 2, timeSlot: '09:45 - 10:30 AM', subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 102' },
      { id: 's23', periodNumber: 3, timeSlot: '10:45 - 11:30 AM', subject: 'Social Studies', teacher: 'K. Venkatswamy', room: 'Room 102' },
      { id: 's24', periodNumber: 4, timeSlot: '11:30 - 12:15 PM', subject: 'Biological Science', teacher: 'Dr. Sunitha Rao', room: 'Room 102' },
      { id: 's25', periodNumber: 5, timeSlot: '01:00 - 01:45 PM', subject: 'Physical Science', teacher: 'Ramesh Sharma', room: 'Physics Lab' },
      { id: 's26', periodNumber: 6, timeSlot: '01:45 - 02:30 PM', subject: 'Telugu Language', teacher: 'G. Srinivas', room: 'Room 102' },
      { id: 's27', periodNumber: 7, timeSlot: '02:40 - 03:25 PM', subject: 'Hindi Language', teacher: 'S. K. Fatima', room: 'Room 102' },
      { id: 's28', periodNumber: 8, timeSlot: '03:25 - 04:10 PM', subject: 'Library & Reading', teacher: 'Priyanka N.', room: 'Library' },
    ]
  }
];

export const INITIAL_REPORTS: SchoolReport[] = [
  {
    id: 'REP-101',
    title: 'Class 9 & 10 Formative Assessment (FA-1) Progress Summary',
    category: 'Academic',
    generatedDate: 'July 28, 2026',
    generatedBy: 'Ramesh Sharma (Headmaster)',
    status: 'Ready',
    fileFormat: 'PDF',
    description: 'Detailed student marksheets, subject pass percentages, and top district rankers for Class 9 and 10.',
  },
  {
    id: 'REP-102',
    title: 'Monthly Gate Attendance & Midday Meal (MDM) Compliance Report',
    category: 'DEO Government',
    generatedDate: 'July 25, 2026',
    generatedBy: 'System Auto Generator',
    status: 'Ready',
    fileFormat: 'EXCEL',
    description: 'Government compliance document verifying 96.8% monthly attendance and Midday Meal meal counts.',
  },
  {
    id: 'REP-103',
    title: 'AI Vernacular Socratic Learning Analytics & Data Saver Log',
    category: 'Compliance',
    generatedDate: 'July 20, 2026',
    generatedBy: 'VidyaAI Analytics Engine',
    status: 'Ready',
    fileFormat: 'CSV',
    description: 'Metrics showing 32,400 offline AI doubts answered with 82.4 TB bandwidth saved via low bandwidth mode.',
  },
  {
    id: 'REP-104',
    title: 'SCERT AP SSC Board Exam Readiness & Remedial Cohort Report',
    category: 'Academic',
    generatedDate: 'July 15, 2026',
    generatedBy: 'Dr. Sunitha Rao',
    status: 'Ready',
    fileFormat: 'PDF',
    description: 'List of 18 students enrolled in special evening Socratic coaching for Mathematics and Physics.',
  }
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ANC-001',
    title: 'NMMS & NTSE State Scholarship Registration Window Extended',
    content: 'All Class 8 and 10 government school students are advised that the state scholarship portal application deadline is extended to Sept 15. Contact school administrator for assistance.',
    category: 'DEO Circular',
    targetAudience: 'All',
    publishedBy: 'District Educational Officer (DEO Medak)',
    date: 'July 29, 2026',
    priority: 'High',
    status: 'Published'
  },
  {
    id: 'ANC-002',
    title: 'Formative Assessment (FA-2) Timetable & Syllabus Declaration',
    content: 'FA-2 examinations will commence from August 18, 2026. Teachers must complete portion revision by August 12.',
    category: 'Academic',
    targetAudience: 'Teachers',
    publishedBy: 'Headmaster Ramesh Sharma',
    date: 'July 26, 2026',
    priority: 'High',
    status: 'Published'
  },
  {
    id: 'ANC-003',
    title: 'Independence Day Cultural Rehearsals Schedule',
    content: 'Flag hoisting and cultural assembly on August 15. Student dance & speech groups report to Auditorium at 3:30 PM daily.',
    category: 'Event',
    targetAudience: 'Students',
    publishedBy: 'Cultural Committee',
    date: 'July 22, 2026',
    priority: 'Medium',
    status: 'Published'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  { id: 'EV-101', title: 'FA-1 Results Announcement & PTA Meeting', type: 'Meeting', startDate: '2026-08-02', endDate: '2026-08-02', description: 'Parent Teacher Association gathering to review student progress cards.', applicableGrades: 'All Classes', status: 'Upcoming' },
  { id: 'EV-102', title: 'District Level STEM Science Fair 2026', type: 'Inspection', startDate: '2026-08-10', endDate: '2026-08-11', description: 'ZPHS Medak hosting 40 district government school science projects.', applicableGrades: 'Class 8 to 10', status: 'Upcoming' },
  { id: 'EV-103', title: 'Independence Day National Holiday', type: 'Holiday', startDate: '2026-08-15', endDate: '2026-08-15', description: 'Official Government Holiday and Ceremonial Flag Hoisting.', applicableGrades: 'All Classes', status: 'Upcoming' },
  { id: 'EV-104', title: 'Formative Assessment (FA-2) Examinations', type: 'Exam', startDate: '2026-08-18', endDate: '2026-08-22', description: 'Unit testing across core languages, math, sciences, and social studies.', applicableGrades: 'Class 6 to 10', status: 'Upcoming' },
];

export const INITIAL_PERMISSIONS: PermissionRole[] = [
  {
    roleId: 'ROLE-ADMIN',
    roleName: 'School Principal / Headmaster',
    description: 'Full administrative override across student records, teacher allocations, timetables, logs, and school settings.',
    userCount: 2,
    permissions: {
      studentRead: true, studentWrite: true, teacherManage: true, gradeEdit: true, timetableManage: true, financeRead: true, settingsManage: true, broadcastPublish: true
    }
  },
  {
    roleId: 'ROLE-TEACHER',
    roleName: 'Class Teacher & Subject Faculty',
    description: 'Manage class attendance, enter assessment marks, view timetables, issue homework, and communicate with parents.',
    userCount: 24,
    permissions: {
      studentRead: true, studentWrite: false, teacherManage: false, gradeEdit: true, timetableManage: false, financeRead: false, settingsManage: false, broadcastPublish: false
    }
  },
  {
    roleId: 'ROLE-STAFF',
    roleName: 'Office Superintendent & Data Clerk',
    description: 'Student admission forms, fee/grant register maintenance, attendance report compilation, and DEO portal submission.',
    userCount: 5,
    permissions: {
      studentRead: true, studentWrite: true, teacherManage: false, gradeEdit: false, timetableManage: false, financeRead: true, settingsManage: false, broadcastPublish: true
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'LOG-801', timestamp: '2026-07-30 09:42:10', user: 'Ramesh Sharma (Headmaster)', userRole: 'Admin', action: 'Approved FA-1 Class 9 Grade Sheet', module: 'Student Marks', ipAddress: '10.240.12.89', severity: 'Info' },
  { id: 'LOG-802', timestamp: '2026-07-30 08:50:04', user: 'Priyanka N. (TGT)', userRole: 'Teacher', action: 'Recorded Class 9-A Gate Attendance', module: 'Attendance', ipAddress: '10.240.12.102', severity: 'Info' },
  { id: 'LOG-803', timestamp: '2026-07-29 16:15:22', user: 'DEO Medak Inspector', userRole: 'External Auditor', action: 'Downloaded MDM Midday Meal Compliance Log', module: 'Government Reports', ipAddress: '14.139.60.18', severity: 'Warning' },
  { id: 'LOG-804', timestamp: '2026-07-29 11:30:00', user: 'System Auto Guardian', userRole: 'Security Bot', action: 'Triggered Low Bandwidth Data Compression (Saved 2.4 GB)', module: 'System Network', ipAddress: '127.0.0.1', severity: 'Info' },
];
