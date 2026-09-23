import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  Lock, 
  Sparkles, 
  Award, 
  BookOpen, 
  HelpCircle, 
  Bot, 
  Zap, 
  FileText, 
  ChevronRight, 
  Clock, 
  Star,
  FolderTree,
  Upload,
  Check
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { DetailedChapterData } from './SyllabusView';
import { InteractiveLessonRunnerModal, RoadmapStepNode } from './InteractiveLessonRunnerModal';
import { CMSItem } from '../../cms/cmsData';
import { setTopicCompletionInFirestore } from '../../../services/studentProgressService';

interface ChapterSubRoadmapViewProps {
  userId?: string;
  subjectName: string;
  chapter: DetailedChapterData;
  studentClassGrade?: string;
  cmsItems?: CMSItem[];
  onBack: () => void;
  onCompleteChapter: () => void;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
  onLaunchTutor?: (subjectName: string, query?: string) => void;
}

export const ChapterSubRoadmapView: React.FC<ChapterSubRoadmapViewProps> = ({
  userId,
  subjectName,
  chapter,
  studentClassGrade = 'Class 5',
  cmsItems = [],
  onBack,
  onCompleteChapter,
  onAddXp,
  onAddCoins,
  onLaunchTutor
}) => {
  const [activeStepNode, setActiveStepNode] = useState<RoadmapStepNode | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'node_1': true, // Introduction
    'node_2': chapter.lessonProgress >= 20, // Objectives
    'node_3': chapter.lessonProgress >= 40, // Topic 1
    'node_4': chapter.lessonProgress >= 60, // Topic 2
    'node_5': chapter.lessonProgress >= 80, // Topic 3
    'node_6': chapter.lessonProgress >= 90, // Worked Examples
    'node_7': chapter.practiceSolved > 0, // Exercise 1
    'node_8': chapter.practiceSolved > 2, // Exercise 2
    'node_9': chapter.notesRead > 0, // Important Questions
    'node_10': chapter.notesRead > 1, // PYQs
    'node_11': chapter.quizScore > 0, // Chapter Quiz
    'node_12': chapter.aiRevisionStatus === 'Mastered', // AI Revision
    'node_13': chapter.completionStatus === 'completed' // Chapter Complete
  });

  // Build the 13 required standard sub-roadmap nodes for this chapter
  const subRoadmapNodes: RoadmapStepNode[] = [
    {
      id: 'node_1',
      type: 'intro',
      stepNumber: 1,
      title: 'Introduction to Chapter',
      nativeTitle: 'అధ్యాయం పరిచయం',
      description: `Overview and real-world applications of ${chapter.title} in daily life and modern technology.`,
      estimatedMinutes: 5,
      completed: !!completedSteps['node_1'],
      content: {
        explanation: `${chapter.title} is one of the fundamental pillars of Class 10 ${subjectName}. In this chapter, we discover how core concepts are applied to solve complex problems and model real-world phenomena.`,
        summaryPoints: [
          'Understand the foundational definitions and scope.',
          'Identify key variables and standard representations.',
          'Connect concepts to State Board examination questions.'
        ]
      }
    },
    {
      id: 'node_2',
      type: 'objectives',
      stepNumber: 2,
      title: 'Learning Objectives & Syllabus Scope',
      description: 'Official AP SSC Board curriculum goals, weightage, and mark distribution.',
      estimatedMinutes: 5,
      completed: !!completedSteps['node_2'],
      content: {
        explanation: 'State Board Syllabus Breakdown:\n• Section A (1-Mark Questions): Definitions & True/False\n• Section B (2-Mark Questions): Short proofs and formula application\n• Section C (4-Mark Questions): Detailed step-by-step derivations & graph problems',
        summaryPoints: [
          'Target total mark weightage: 8 to 12 marks.',
          'Focus on formula memorization and diagram neatness.'
        ]
      }
    },
    {
      id: 'node_3',
      type: 'topic',
      stepNumber: 3,
      title: 'Topic 1: Core Definitions & Fundamental Axioms',
      description: 'First core concept, essential rules, and basic properties.',
      estimatedMinutes: 15,
      completed: !!completedSteps['node_3'],
      content: {
        explanation: `Topic 1 introduces the mathematical/scientific definitions governing ${chapter.title}.\n\nFormulas and key laws must be stated precisely with standard units.`,
        keyFormulas: chapter.keyFormulas || ['Standard Equation: ax² + bx + c = 0', 'Discriminant: D = b² - 4ac'],
        videoUrl: '',
        videoDuration: '10:15 Mins'
      }
    },
    {
      id: 'node_4',
      type: 'topic',
      stepNumber: 4,
      title: 'Topic 2: Standard Methods & Algebraic / Graphical Solutions',
      description: 'Step-by-step techniques to evaluate and simplify equations or reactions.',
      estimatedMinutes: 20,
      completed: !!completedSteps['node_4'],
      content: {
        explanation: 'When applying standard methods:\n1. Factorization Method: Split middle terms systematically.\n2. Quadratic Formula Method: Evaluate discriminant D first.\n3. Graphical Representation: Plot points accurately on graph paper.',
        keyFormulas: ['Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)'],
        summaryPoints: ['Check if discriminant D >= 0 for real roots before proceeding.']
      }
    },
    {
      id: 'node_5',
      type: 'topic',
      stepNumber: 5,
      title: 'Topic 3: Advanced Applications & Word Problems',
      description: 'Translating real-world word problems into formal mathematical equations.',
      estimatedMinutes: 25,
      completed: !!completedSteps['node_5'],
      content: {
        explanation: 'Word Problem Solving Framework:\n• Assign variables (e.g. Let x = speed of train in km/h).\n• Formulate equation based on given physical condition.\n• Reject non-physical roots (e.g., negative time or negative distance).',
        workedExamples: [
          {
            question: 'A motorboat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than downstream. Find the speed of the stream.',
            solution: 'Let speed of stream = x km/h.\nUpstream speed = (18 - x) km/h; Downstream speed = (18 + x) km/h.\nTime diff = 24/(18 - x) - 24/(18 + x) = 1.\nSolving: x² + 48x - 324 = 0 => (x + 54)(x - 6) = 0.\nSince speed cannot be negative, speed of stream = 6 km/h.',
            tip: 'Always state speed units (km/h) clearly in final statement!'
          }
        ]
      }
    },
    {
      id: 'node_6',
      type: 'worked_examples',
      stepNumber: 6,
      title: 'Worked Examples & Step Marking Guide',
      description: 'Handcrafted board exam solutions with official step-wise mark distribution.',
      estimatedMinutes: 15,
      completed: !!completedSteps['node_6'],
      content: {
        workedExamples: [
          {
            question: `Solve for x in ${chapter.title} using the standard board steps.`,
            solution: `Step 1: Given equation simplified.\nStep 2: Formula substituted.\nStep 3: Discriminant computed.\nStep 4: Final roots calculated.`,
            tip: 'Drawing a box around the final answer helps board evaluators award full marks quickly!'
          }
        ]
      }
    },
    {
      id: 'node_7',
      type: 'exercise',
      stepNumber: 7,
      title: 'Exercise 1: Basic Concept Drills',
      description: 'Fundamental practice questions for instant concept reinforcement.',
      estimatedMinutes: 15,
      completed: !!completedSteps['node_7'],
      content: {
        exerciseQuestions: [
          {
            id: 101,
            question: 'Which of the following is the discriminant formula?',
            options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', 'a² + b²'],
            answerIndex: 0,
            explanation: 'Discriminant D = b² - 4ac determines the nature of roots.'
          },
          {
            id: 102,
            question: 'If D = 0, what is the nature of the roots?',
            options: ['Real & Equal', 'Real & Distinct', 'No Real Roots', 'Imaginary'],
            answerIndex: 0,
            explanation: 'When D = 0, both roots are real and equal to -b/(2a).'
          }
        ]
      }
    },
    {
      id: 'node_8',
      type: 'exercise',
      stepNumber: 8,
      title: 'Exercise 2: Advanced Board Level Drills',
      description: 'High-difficulty practice problems frequently asked in State Board Exams.',
      estimatedMinutes: 20,
      completed: !!completedSteps['node_8'],
      content: {
        exerciseQuestions: [
          {
            id: 201,
            question: 'Find the nature of roots for 2x² - 4x + 3 = 0.',
            options: ['No real roots (D < 0)', 'Two equal real roots', 'Two distinct real roots', 'Infinite roots'],
            answerIndex: 0,
            explanation: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8 < 0, hence no real roots.'
          }
        ]
      }
    },
    {
      id: 'node_9',
      type: 'important_questions',
      stepNumber: 9,
      title: 'Important Board Questions & Hints',
      description: 'High-yield questions curated by State Board paper setters.',
      estimatedMinutes: 15,
      completed: !!completedSteps['node_9'],
      content: {
        importantQuestions: [
          {
            id: 301,
            question: 'Prove that the roots of a quadratic equation are real if D >= 0.',
            answer: 'State quadratic formula x = (-b ± √D)/(2a). Since √D is real when D >= 0, roots are real.',
            marks: 4
          }
        ]
      }
    },
    {
      id: 'node_10',
      type: 'pyq',
      stepNumber: 10,
      title: 'Previous Year Questions (PYQs 2018 - 2025)',
      description: 'Actual Class 10 State Board questions from previous exam papers.',
      estimatedMinutes: 20,
      completed: !!completedSteps['node_10'],
      content: {
        pyqs: [
          {
            id: 401,
            year: '2024',
            question: `Find two consecutive odd positive integers, sum of whose squares is 290 (${chapter.title}).`,
            answer: 'Let integers be x and x+2. x² + (x+2)² = 290 => x² + 2x - 143 = 0 => (x+13)(x-11) = 0. Integers are 11 and 13.',
            marks: 4
          },
          {
            id: 402,
            year: '2023',
            question: 'Write the condition for quadratic equation ax² + bx + c = 0 to have equal roots.',
            answer: 'Discriminant b² - 4ac must equal 0.',
            marks: 2
          }
        ]
      }
    },
    {
      id: 'node_11',
      type: 'quiz',
      stepNumber: 11,
      title: 'Chapter Mastery Assessment Quiz',
      description: 'Comprehensive 10-minute quiz to test entire chapter mastery.',
      estimatedMinutes: 10,
      completed: !!completedSteps['node_11'],
      content: {
        quizQuestions: [
          {
            id: 501,
            question: `What is the maximum number of roots for a quadratic polynomial in ${chapter.title}?`,
            options: ['1', '2', '3', 'Infinite'],
            answerIndex: 1,
            explanation: 'Degree of quadratic polynomial is 2, so maximum number of roots is 2.'
          }
        ]
      }
    },
    {
      id: 'node_12',
      type: 'ai_revision',
      stepNumber: 12,
      title: 'AI Socratic Smart Revision & Memory Drill',
      description: 'AI powered adaptive flashcards and active recall drill.',
      estimatedMinutes: 10,
      completed: !!completedSteps['node_12'],
      content: {
        summaryPoints: [
          'Flashcard 1: Discriminant D = b² - 4ac',
          'Flashcard 2: D > 0 => 2 distinct real roots',
          'Flashcard 3: D = 0 => 2 equal real roots',
          'Flashcard 4: D < 0 => No real roots'
        ]
      }
    },
    {
      id: 'node_13',
      type: 'completion',
      stepNumber: 13,
      title: 'Chapter Complete & Mastery Badge Unlocked',
      description: 'Congratulations! You have mastered this chapter for Board Exams.',
      estimatedMinutes: 0,
      completed: !!completedSteps['node_13'],
      content: {
        summaryPoints: [
          'Mastery Badge Earned: Gold Scholar',
          '+100 XP & +25 Coins Awarded to Profile',
          'Chapter added to Board Exam Revision Queue'
        ]
      }
    }
  ];

  const handleCompleteStepNode = (stepId: string, _score?: number) => {
    soundFx.playSuccess();
    onAddXp?.(50);
    onAddCoins?.(15);
    setCompletedSteps(prev => ({ ...prev, [stepId]: true }));

    if (userId) {
      setTopicCompletionInFirestore(
        userId,
        studentClassGrade,
        subjectName,
        chapter.id,
        stepId,
        true,
        50,
        100
      ).catch(err => console.warn('Error saving roadmap step completion to Firestore:', err));
    }

    // Check if all steps completed
    const totalComp = Object.values({ ...completedSteps, [stepId]: true }).filter(Boolean).length;
    if (totalComp >= 10) {
      onCompleteChapter();
    }
  };

  // Filter Teacher CMS files for this chapter
  const relevantCms = cmsItems.filter(
    (i) => i.status === 'Published' && (i.subject === subjectName || subjectName.toLowerCase().includes(i.subject.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 font-black text-xs rounded-2xl backdrop-blur transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subject Roadmap</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold bg-amber-400 text-slate-950 px-3 py-1 rounded-xl">
              Chapter {chapter.chapterNumber} Sub-Roadmap
            </span>
            <span className="text-xs font-extrabold bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl">
              13 Step Sequence
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {chapter.title}
            </h1>
            {chapter.nativeTitle && (
              <p className="text-sm font-extrabold text-sky-200 mt-1">
                {chapter.nativeTitle}
              </p>
            )}
            <p className="text-xs text-slate-200 mt-2 max-w-2xl font-medium">
              Follow the 13-step structured learning pathway from Introduction to Chapter Mastery. Complete each node to earn XP, unlock badges, and guarantee board examination readiness!
            </p>
          </div>

          {/* Quick Progress Circle */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[160px]">
            <span className="text-[10px] font-extrabold text-sky-200 uppercase block">Chapter Progress</span>
            <span className="text-3xl font-black text-amber-300">
              {Math.round((Object.values(completedSteps).filter(Boolean).length / 13) * 100)}%
            </span>
            <span className="text-[10px] text-emerald-300 block font-bold mt-1">
              {Object.values(completedSteps).filter(Boolean).length} / 13 Steps Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Structured Chapter Sub-Roadmap Vertical Path */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <span>Chapter {chapter.chapterNumber} Sequential Sub-Roadmap</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchy: Chapter → Introduction → Learning Objectives → Topics 1-3 → Worked Examples → Exercises → PYQs → Quiz → AI Revision → Complete
          </p>
        </div>

        {/* Snake / Vertical Curved Connected Node Pathway */}
        <div className="relative max-w-3xl mx-auto py-4">
          {/* Central Connecting Vertical Line */}
          <div className="absolute left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 -translate-x-1/2 hidden sm:block rounded-full opacity-30" />

          <div className="space-y-8 relative z-10">
            {subRoadmapNodes.map((node, index) => {
              const isCompleted = completedSteps[node.id];
              const isUnlocked = index === 0 || completedSteps[subRoadmapNodes[index - 1].id];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={node.id}
                  className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* Node Action Card */}
                  <div className={`w-full sm:w-[45%] p-5 rounded-3xl border transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-700 shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                          : isUnlocked
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        Step {node.stepNumber} • {node.type.replace('_', ' ')}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {node.estimatedMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-black text-sm text-slate-900 dark:text-white mt-2">
                      {node.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {node.description}
                    </p>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {isCompleted ? (
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Cleared (+50 XP)
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Play className="w-3.5 h-3.5 fill-current" /> Ready to Launch
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Complete Previous Step
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            soundFx.playClick();
                            setActiveStepNode(node);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
                          isUnlocked
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? 'Review' : 'Launch'}
                      </button>
                    </div>
                  </div>

                  {/* Central Node Visual Icon Circle */}
                  <div className="relative shrink-0 z-20">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-base shadow-xl border-4 transition-transform duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 border-white dark:border-slate-900 shadow-emerald-500/30'
                        : isUnlocked
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-white dark:border-slate-900 shadow-blue-500/30 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-7 h-7 stroke-[3]" />
                      ) : isUnlocked ? (
                        <span>#{node.stepNumber}</span>
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Spacer for opposite side alignment */}
                  <div className="hidden sm:block w-[45%]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teacher CMS Uploads linked to this chapter */}
      {relevantCms.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Teacher CMS Materials for Chapter {chapter.chapterNumber}
              </h3>
            </div>
            <span className="text-xs font-black text-emerald-600">
              {relevantCms.length} Files Attached
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relevantCms.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.type}
                </span>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Lesson Runner Modal */}
      {activeStepNode && (
        <InteractiveLessonRunnerModal
          subjectName={subjectName}
          chapterNumber={chapter.chapterNumber}
          chapterTitle={chapter.title}
          stepNode={activeStepNode}
          cmsItems={relevantCms}
          onClose={() => setActiveStepNode(null)}
          onCompleteStep={handleCompleteStepNode}
          onLaunchTutor={onLaunchTutor}
        />
      )}

    </div>
  );
};
