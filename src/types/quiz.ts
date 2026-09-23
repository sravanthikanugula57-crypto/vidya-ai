export interface QuizQuestion {
  questionId: string;
  questionText: string;
  options: [string, string, string, string] | string[];
  correctAnswer: string; // The exact string of the correct option
  marks: number;
  explanation: string;
}

export type QuizType = 'Chapter Quiz' | 'Weekly Test' | 'Monthly Test' | 'Mock Test';

export interface QuizDoc {
  quizId: string;
  id?: string;
  board: string; // e.g. "AP SSC"
  class: number; // e.g. 10
  subject: string;
  chapterId?: string;
  chapterName?: string;
  quizType: QuizType;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  studentAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
}

export interface QuizAttemptDoc {
  attemptId: string;
  id?: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  class: number;
  board: string;
  subject: string;
  startedAt: string;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> option string
  questionResults: QuestionResult[];
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'submitted';
}
