export type QuestionType = 'mcq' | 'fill_in_blank' | 'true_false' | 'short_answer' | 'long_answer';

export interface PreviousPaperSection {
  id: string;
  name: string;
  instructions?: string;
  marksPerQuestion: number;
  questionCount: number;
}

export interface PreviousPaperQuestion {
  id: string;
  qNo: number;
  sectionId: string;
  sectionName?: string;
  type: QuestionType;
  question: string;
  questionTe?: string;
  options?: string[]; // for MCQ (A, B, C, D)
  correctAnswer: string | number; // index (0-3) for MCQ, or text for fill in blank / short answer, or 'True'/'False'
  marks: number;
  explanation?: string;
  explanationTe?: string;
  chapter?: string;
}

export interface PreviousPaper {
  id: string;
  title: string;
  class: number | string; // e.g. 5 or "Class 5"
  classGrade: string; // e.g. "Class 5"
  subjectId: string; // e.g. "mathematics", "science", "english", "telugu", "social"
  subject: string; // e.g. "Mathematics", "Environmental Studies (EVS)", "General English", "First Language Telugu"
  board: string; // e.g. "AP & Telangana State Board (SCERT)" / "CBSE"
  year: string; // e.g. "2025", "2024", "2023", "2022"
  examType: string; // "Annual Examination" | "Summative Assessment (SA-2)" | "Summative Assessment (SA-1)" | "Mid-Term Examination"
  medium: string; // "English" | "Telugu" | "Urdu"
  totalMarks: number;
  durationMinutes: number;
  duration: string; // e.g. "2 Hours 30 Mins"
  fileSize?: string;
  pageCount?: number;
  pdfUrl: string;
  questionPaperUrl?: string;
  answerKeyUrl?: string;
  published: boolean;
  hasPractice: boolean;
  isOfficial?: boolean;
  instructions?: string[];
  sections?: PreviousPaperSection[];
  questions?: PreviousPaperQuestion[];
  downloadCount?: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
}

export interface PreviousPaperAttempt {
  id: string;
  studentId: string;
  studentName?: string;
  paperId: string;
  paperTitle: string;
  class: number | string;
  classGrade: string;
  subjectId: string;
  subject: string;
  year: string;
  examType: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  answers: Record<string, any>;
  attemptedAt: string;
  status: 'completed';
}
