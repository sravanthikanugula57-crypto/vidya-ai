export type VisualSceneType = 
  | 'concept_intro' 
  | 'diagram' 
  | 'formula' 
  | 'fraction_pizza' 
  | 'fraction_bar'
  | 'number_line'
  | 'steps' 
  | 'real_world' 
  | 'mistake_alert' 
  | 'recap' 
  | 'quiz_question';

export interface VisualDiagramData {
  type: 'circle_pie' | 'bar_model' | 'number_line' | 'geometric_shape' | 'flowchart' | 'balance_scale' | 'formula_breakdown';
  numerator?: number;
  denominator?: number;
  totalParts?: number;
  filledParts?: number;
  items?: { label: string; value: string | number; color?: string; active?: boolean }[];
  labels?: string[];
  unit?: string;
  mathExpression?: string;
  comparison?: {
    correctTitle: string;
    correctSteps: string[];
    wrongTitle: string;
    wrongSteps: string[];
    explanation: string;
  };
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  narration: string;
  caption: string;
  visualType: VisualSceneType;
  visualData: {
    headline: string;
    subheading?: string;
    badge?: string;
    bullets?: string[];
    formula?: string;
    mathLatex?: string;
    fractionNumerator?: number;
    fractionDenominator?: number;
    fractionColor?: string;
    steps?: { stepNumber: number; text: string; highlight?: boolean }[];
    diagramData?: VisualDiagramData;
    realWorldScenario?: {
      title: string;
      story: string;
      visualObject: string;
      takeaway: string;
    };
    commonMistake?: {
      mistake: string;
      whyWrong: string;
      correctWay: string;
    };
    accentColor?: string;
  };
  audioBase64?: string;
}

export interface AIVideoQuizItem {
  id: string;
  question: string;
  nativeQuestion?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timestampSeconds?: number;
}

export interface AIVideoPracticeItem {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solutionSteps: string[];
  finalAnswer: string;
  tip?: string;
}

export interface AIVideoLesson {
  id: string;
  title: string;
  nativeTitle?: string;
  class: string;
  subject: string;
  subjectId: string;
  chapter: string;
  chapterId: string;
  topic: string;
  topicId: string;
  language: 'en' | 'te' | 'hi';
  videoUrl: string;
  videoBlobKey?: string;
  totalDurationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string;
  teacherName: string;
  teacherRole: string;
  scenes: VideoScene[];
  summary: string;
  keyTakeaways: string[];
  interactiveQuiz: AIVideoQuizItem[];
  practiceQuestions: AIVideoPracticeItem[];
  createdAt: string;
  viewsCount: number;
  likesCount: number;
  status: 'completed' | 'processing' | 'failed';
  isOfficialScertApproved?: boolean;
}

export type VideoJobStage = 
  | 'queued' 
  | 'generating_script' 
  | 'synthesizing_audio' 
  | 'rendering_visuals' 
  | 'assembling_video' 
  | 'completed' 
  | 'failed';

export interface AIVideoGenerationJob {
  id: string;
  class: string;
  subject: string;
  chapter: string;
  topic: string;
  language: string;
  status: VideoJobStage;
  progressPercent: number;
  statusMessage: string;
  currentStageIndex: number;
  totalStages: number;
  videoId?: string;
  videoLesson?: AIVideoLesson;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
