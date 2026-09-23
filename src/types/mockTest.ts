export type MockQuestionType = 
  | 'mcq' 
  | 'fill_in_blank' 
  | 'true_false' 
  | 'one_mark' 
  | 'two_mark' 
  | 'four_mark' 
  | 'previous_board';

export interface MockQuestion {
  id: string;
  testId: string;
  questionNumber: number; // 1 to 100
  subject: string;
  chapter: string;
  type: MockQuestionType;
  section: string; // e.g. "Section A: Multiple Choice Questions (40 Marks)"
  question: string;
  options?: string[]; // 4 choices for MCQ
  correctAnswer: string | number; // index (0-3) for MCQ, text for fill-in-blank/true_false/essay
  explanation: string;
  hint?: string;
  marks: number; // 1, 2, or 4
}

export interface QuestionDistribution {
  mcq: number; // 40
  fillInBlank: number; // 20
  trueFalse: number; // 10
  oneMark: number; // 10
  twoMark: number; // 10
  fourMark: number; // 5
  previousBoard: number; // 5
  total: number; // 100
}

export interface MockTestDoc {
  id: string;
  classId?: string; // 'Class 5', 'Class 6', ..., 'Class 10'
  class?: number | string; // 5 or 'Class 5'
  title: string;
  description?: string;
  subject: string;
  subjectId?: string;
  testNumber: number; // 1 to 20
  durationMinutes: number; // e.g. 30 or 180
  duration?: number; // duration in minutes
  totalQuestions: number;
  totalMarks: number;
  questionDistribution?: QuestionDistribution;
  isPublished?: boolean;
  published?: boolean;
  instructions?: string[] | string;
  board?: string;
  createdAt: string;
  createdBy?: string;
  questions?: MockQuestion[];
}

export type QuestionAnswerStatus = 'not_visited' | 'unanswered' | 'answered' | 'review' | 'answered_review';

export interface UserAnswerState {
  userAnswer: any;
  status: QuestionAnswerStatus;
  bookmarked?: boolean;
  timeSpentSeconds?: number;
}

export interface MockAttempt {
  id: string;
  userId: string;
  studentId?: string;
  userName?: string;
  testId: string;
  mockTestId?: string;
  class?: number | string;
  testTitle: string;
  subject: string;
  subjectId?: string;
  testNumber: number;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  timeTaken?: string;
  answers: Record<number | string, UserAnswerState>; // questionNumber -> UserAnswerState
  correctCount: number;
  correctAnswers?: number;
  wrongCount: number;
  incorrectAnswers?: number;
  skippedCount: number;
  unanswered?: number;
  accuracy: number;
  estimatedRank?: number;
  weakChapters?: string[];
  strongChapters?: string[];
  startedAt?: string;
  completedAt: string;
  submittedAt?: string;
  status?: 'in_progress' | 'submitted';
}
