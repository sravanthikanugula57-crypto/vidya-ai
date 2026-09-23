export type CareerCategory = 
  | 'science' 
  | 'technology' 
  | 'creative' 
  | 'healthcare' 
  | 'environment' 
  | 'education' 
  | 'governance' 
  | 'engineering';

export interface CareerPathStep {
  stage: string;
  duration: string;
  description: string;
  milestone: string;
}

export interface CareerItem {
  id: string;
  title: string;
  category: CareerCategory;
  emoji: string;
  tagline: string;
  description: string;
  suitableSubjects: string[];
  keySkills: string[];
  educationPath: string[];
  recommendedStream: 'MPC' | 'BiPC' | 'CEC' | 'HEC' | 'Vocational' | 'Any';
  salaryRange: string;
  jobDemand: 'Very High' | 'High' | 'Growing' | 'Stable';
  entranceExams: string[];
  govtScholarships: string[];
  topRoles: string[];
  dayInTheLife: string;
  iconBg: string;
}

export interface CareerQuizQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    text: string;
    category: CareerCategory;
    icon: string;
    points: number;
  }[];
}

export interface GuessCareerGameItem {
  id: string;
  careerTitle: string;
  category: CareerCategory;
  emoji: string;
  hints: string[];
  tools: string[];
  options: string[];
  funFact: string;
}

export interface SkillChallengeItem {
  id: string;
  careerTitle: string;
  careerCategory: CareerCategory;
  title: string;
  scenario: string;
  challengeType: 'mcq' | 'code' | 'calculation' | 'decision';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  skillTested: string;
}
