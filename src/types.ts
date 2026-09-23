export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin' | 'guest' | 'design_system';

export type LanguageCode = 'en' | 'te' | 'hi';

export interface UserAuthProfile {
  id: string;
  uid?: string;
  name: string;
  email?: string;
  phone?: string;
  mobileNumber?: string;
  role: UserRole;
  grade?: GradeLevel;
  class?: string | number;
  subject?: string;
  board?: string;
  medium?: string;
  schoolName?: string;
  district?: string;
  state?: string;
  preferredLang?: LanguageCode;
  preferredLanguage?: LanguageCode;
  avatar?: string;
  photoURL?: string;
  isVerified: boolean;
  profileCompleted?: boolean;
  xp?: number;
  coins?: number;
  streakDays?: number;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
}

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export type GradeLevel = 'Class 5' | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

export interface Subject {
  id: string;
  name: string;
  nativeName?: string;
  icon: string;
  color?: string;
  bgGradient?: string;
  chaptersCount: number;
  completedPercent: number;
  grade?: GradeLevel;
  classId?: string;
  topics?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language?: LanguageCode;
  audioUrl?: string;
  hints?: string[];
  currentHintIndex?: number;
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
  mindmap?: MindMapNode[];
  whiteboardDiagram?: WhiteboardData;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  chapter: string;
  mastered?: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  description?: string;
}

export interface WhiteboardData {
  title: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    svgGraphic?: string;
    formula?: string;
  }[];
}

export interface StudentProfile {
  id: string;
  name: string;
  schoolName: string;
  district: string;
  state: string;
  grade: GradeLevel;
  board?: string;
  medium: string;
  avatar: string;
  xp: number;
  coins: number;
  streakDays: number;
  dailyGoalMinutes: number;
  todayMinutesStudied: number;
  weakSubjects: string[];
  strongSubjects: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  amount: string;
  eligibility: string;
  deadline: string;
  category: 'Government' | 'Merit' | 'STEM Girls' | 'Need-Based';
  applyUrl: string;
  matchPercentage: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  district: string;
  xp: number;
  avatar: string;
  badgeTitle?: string;
}

export interface ClassAnalytics {
  className: string;
  totalStudents: number;
  averageAttendance: number;
  averageScore: number;
  weakTopics: { topic: string; subject: string; strugglingStudentsCount: number }[];
  recentAssignments: { title: string; subject: string; dueDate: string; submissionRate: number }[];
}

export interface ParentReport {
  studentName: string;
  weeklyMinutes: number;
  attendancePercent: number;
  strongSubject: string;
  focusArea: string;
  teacherNote: string;
  audioSummaryUrl?: string;
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'Badge' | 'Theme' | 'Formula Sheet' | 'Certificate';
  icon: string;
  unlocked: boolean;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  nativeTitle?: string;
  topicsCount: number;
  estimatedMinutes: number;
  completed: boolean;
  keyFormulas: string[];
}

export type AdaptiveStepType = 'concept' | 'example' | 'diagnostic' | 'guided' | 'adaptive_challenge' | 'misconception' | 'mastery';
export type AdaptiveDifficulty = 'Foundation' | 'Standard' | 'Advanced';

export interface AdaptiveStep {
  id: string;
  stepNumber: number;
  type: AdaptiveStepType;
  title: string;
  subtitle: string;
  difficulty: AdaptiveDifficulty;
  completed: boolean;
  content: {
    text?: string;
    keyTakeaway?: string;
    visualGraphic?: string;
    interactivePrompt?: string;
    question?: {
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hint: string;
    };
    misconceptionText?: string;
    correctMentalModel?: string;
  };
}

export interface SubjectAdaptivePath {
  subjectName: string;
  currentDifficulty: AdaptiveDifficulty;
  steps: AdaptiveStep[];
}

export type QuestionType =
  | 'mcq'
  | 'fill_in_blank'
  | 'true_false'
  | 'one_mark'
  | 'two_mark'
  | 'four_mark'
  | 'case_study'
  | 'hots'
  | 'numerical';

export interface PracticeQuestion {
  id: string;
  setId: string;
  subjectId?: string;
  chapterId?: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  topic: string;
  type: QuestionType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  questionText: string;
  nativeQuestionText?: string;
  imageUrl?: string;
  passageText?: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  hint: string;
  explanation: string;
  teacherSolution?: string;
  relatedConcept?: string;
  suggestedLessonId?: string;
  pyqYear?: string;
  isImportant?: boolean;
}

export interface PracticeSet {
  id: string;
  title: string;
  subject: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  description: string;
  questionCount: number;
  totalMarks: number;
  timeLimitMinutes: number;
  category: 'practice' | 'important' | 'board_level' | 'pyq' | 'challenge' | 'mixed';
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
  questions?: PracticeQuestion[];
}

export interface PracticeAttemptState {
  id: string;
  userId: string;
  setId: string;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  markedForRevision: Record<string, boolean>;
  bookmarked: Record<string, boolean>;
  timeSpentSeconds: number;
  startedAt: string;
  lastSavedAt: string;
  isCompleted: boolean;
}

export interface PracticeResult {
  id: string;
  userId: string;
  setId: string;
  setTitle: string;
  subject: string;
  chapterTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTakenSeconds: number;
  accuracyPercentage: number;
  weakTopics: string[];
  strongTopics: string[];
  suggestedRevision: string;
  completedAt: string;
  answersSummary?: Record<string, { userAnswer: any; correctAnswer: any; isCorrect: boolean }>;
}


