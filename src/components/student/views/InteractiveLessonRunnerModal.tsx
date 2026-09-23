import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { CMSItem } from '../../cms/cmsData';
import { LessonLearningSystem, LessonData } from './LessonLearningSystem';

export interface RoadmapStepNode {
  id: string;
  type: 'intro' | 'objectives' | 'topic' | 'worked_examples' | 'exercise' | 'important_questions' | 'pyq' | 'quiz' | 'ai_revision' | 'completion';
  stepNumber: number;
  title: string;
  nativeTitle?: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  score?: number;
  content: {
    explanation?: string;
    diagramUrl?: string;
    videoUrl?: string;
    videoDuration?: string;
    keyFormulas?: string[];
    workedExamples?: { question: string; solution: string; tip?: string }[];
    exerciseQuestions?: { id: number; question: string; options: string[]; answerIndex: number; explanation: string }[];
    importantQuestions?: { id: number; question: string; answer: string; marks: number }[];
    pyqs?: { id: number; year: string; question: string; answer: string; marks: number }[];
    quizQuestions?: { id: number; question: string; options: string[]; answerIndex: number; explanation: string }[];
    summaryPoints?: string[];
  };
}

interface InteractiveLessonRunnerModalProps {
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  stepNode: RoadmapStepNode;
  cmsItems?: CMSItem[];
  onClose: () => void;
  onCompleteStep: (stepId: string, score?: number) => void;
  onLaunchTutor?: (subjectName: string, query?: string) => void;
}

export const InteractiveLessonRunnerModal: React.FC<InteractiveLessonRunnerModalProps> = ({
  subjectName,
  chapterNumber,
  chapterTitle,
  stepNode,
  cmsItems = [],
  onClose,
  onCompleteStep,
  onLaunchTutor
}) => {
  // Construct dynamic LessonData from stepNode
  const customLesson: LessonData = {
    id: stepNode.id,
    subject: subjectName,
    chapterNumber,
    chapterTitle,
    lessonName: stepNode.title,
    nativeLessonName: stepNode.nativeTitle,
    teacherName: 'Sri M. Ramesh (PGT Master Trainer)',
    teacherRole: 'AP SCERT Expert',
    durationMinutes: stepNode.estimatedMinutes || 45,
    language: 'Bilingual',
    lastUpdated: 'August 2026',
    videoUrl: stepNode.content?.videoUrl || '',
    videoType: 'youtube',
    overview: stepNode.description || 'Comprehensive Class 10 Board exam targeted interactive lesson with step-by-step guidance.',
    objectives: [
      `Understand core concepts of ${stepNode.title}`,
      'Solve worked examples step-by-step for Board Examination',
      'Attempt practice drills and evaluate quiz performance',
      'Review previous year questions and AI doubt resolutions'
    ],
    concepts: [
      {
        heading: `1. Core Concept: ${stepNode.title}`,
        content: stepNode.content?.explanation || 'Detailed concept explanation derived from Class 10 SCERT prescribed curriculum.',
        formula: stepNode.content?.keyFormulas?.[0]
      }
    ],
    diagrams: [
      {
        title: `${stepNode.title} Concept Flowchart`,
        imageUrl: stepNode.content?.diagramUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
        caption: 'Visual representation and flowchart for Class 10 Board Preparation.',
        type: 'PNG'
      }
    ],
    workedExamples: (stepNode.content?.workedExamples || []).map((ex, idx) => ({
      id: idx + 1,
      question: ex.question,
      solutionSteps: ex.solution.split('\n'),
      finalAnswer: 'Follow board marking steps as shown above.',
      tip: ex.tip
    })),
    keyFormulas: (stepNode.content?.keyFormulas || []).map((f, idx) => ({
      title: `Formula ${idx + 1}`,
      formula: f,
      explanation: 'Key memory equation for exams'
    })),
    practiceQuestions: (stepNode.content?.exerciseQuestions || []).map((q) => ({
      id: q.id,
      type: 'mcq' as const,
      question: q.question,
      options: q.options,
      correctAnswer: q.answerIndex,
      explanation: q.explanation
    })),
    quizQuestions: (stepNode.content?.quizQuestions || []).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.answerIndex,
      explanation: q.explanation
    })),
    pyqs: (stepNode.content?.pyqs || []).map((p) => ({
      id: p.id,
      year: p.year,
      marks: p.marks,
      question: p.question,
      solution: p.answer
    })),
    summaryPoints: stepNode.content?.summaryPoints || [
      `Mastered key principles of ${stepNode.title}.`,
      'Review formulas and practice solved examples before board exams.'
    ]
  };

  const handleFinishStep = () => {
    soundFx.playSuccess();
    onCompleteStep(stepNode.id, 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden relative">
        
        {/* Modal Floating Close Bar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0 px-6">
          <span className="text-xs font-bold text-sky-300">Class 10 Classroom Runner: {stepNode.title}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFinishStep}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Mark Completed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lesson Learning System Body */}
        <div className="flex-1 overflow-y-auto">
          <LessonLearningSystem
            lesson={customLesson}
            onBack={onClose}
            onNextLesson={handleFinishStep}
          />
        </div>

      </div>
    </div>
  );
};
