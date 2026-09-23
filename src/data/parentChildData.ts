export interface ParentChildProfile {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  section: string;
  school: string;
  avatar?: string;
  weeklyMinutes: number;
  attendancePercent: number;
  districtRank: number;
  strongSubject: string;
  focusArea: string;
  teacherNote: string;
}

export const DEFAULT_PARENT_CHILDREN: ParentChildProfile[] = [
  {
    id: 'c1',
    name: 'Ananya Sharma',
    grade: 'Class 9',
    rollNo: '24',
    section: 'A',
    school: 'ZPHS Government High School, Medak',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    weeklyMinutes: 240,
    attendancePercent: 98,
    districtRank: 4,
    strongSubject: 'Biological Sciences & English Speaking',
    focusArea: 'Quadratic Equations (Math Chapter 5)',
    teacherNote: 'Ananya is very curious and asks thoughtful questions in class. Practicing 10 minutes of math daily will help her excel in the district exam!',
  },
  {
    id: 'c2',
    name: 'Kumar Sharma',
    grade: 'Class 6',
    rollNo: '18',
    section: 'B',
    school: 'ZPHS Government Primary School, Medak',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    weeklyMinutes: 180,
    attendancePercent: 96,
    districtRank: 9,
    strongSubject: 'Mathematics & Environmental Science',
    focusArea: 'English Reading & Pronunciation',
    teacherNote: 'Kumar is very enthusiastic in science activities! Daily 10-minute English book reading will boost his reading fluency.',
  },
];
