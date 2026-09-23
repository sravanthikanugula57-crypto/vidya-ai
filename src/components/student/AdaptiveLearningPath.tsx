import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Award, 
  HelpCircle, 
  RotateCcw, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Flame, 
  Coins, 
  Lightbulb, 
  Layers, 
  Check, 
  ChevronRight,
  Sliders,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { AdaptiveStep, AdaptiveDifficulty, SubjectAdaptivePath } from '../../types';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';

interface AdaptiveLearningPathProps {
  onRewardStudent?: (xp: number, coins: number) => void;
}

const SAMPLE_PATHS: Record<string, SubjectAdaptivePath> = {
  Mathematics: {
    subjectName: 'Mathematics',
    currentDifficulty: 'Standard',
    steps: [
      {
        id: 'math_step_1',
        stepNumber: 1,
        type: 'concept',
        title: 'Concept Breakdown: Quadratic Discriminant',
        subtitle: 'Understanding the Nature of Roots',
        difficulty: 'Foundation',
        completed: true,
        content: {
          text: 'The Discriminant formula D = b² - 4ac determines whether a quadratic equation has real, equal, or complex roots without full factorization.',
          keyTakeaway: 'D > 0 → 2 Real & Distinct Roots | D = 0 → 2 Equal Real Roots | D < 0 → No Real Roots',
          visualGraphic: 'x² - 6x + 9 = 0  =>  a=1, b=-6, c=9  =>  D = (-6)² - 4(1)(9) = 36 - 36 = 0'
        }
      },
      {
        id: 'math_step_2',
        stepNumber: 2,
        type: 'example',
        title: 'Real-World Visual Application',
        subtitle: 'Satellite Dish Focal Point & Trajectory',
        difficulty: 'Foundation',
        completed: true,
        content: {
          text: 'Architects and engineers use quadratic equations to model parabolic satellite dishes and radar reflectors. The vertex of the parabolic arc represents the focal receiver point!',
          interactivePrompt: 'Adjust curvature coefficient "a" to see parabola shape change in real time.',
          keyTakeaway: 'Higher "a" values produce narrower parabolas; negative "a" opens downward (like a throwing arc).'
        }
      },
      {
        id: 'math_step_3',
        stepNumber: 3,
        type: 'diagnostic',
        title: 'Diagnostic AI Difficulty Evaluator',
        subtitle: 'Quick Check to Calibrate Your Path',
        difficulty: 'Standard',
        completed: false,
        content: {
          question: {
            text: 'What is the Discriminant value for the quadratic equation 2x² - 4x + 3 = 0?',
            options: ['D = -8 (No Real Roots)', 'D = +8 (2 Real Roots)', 'D = 0 (Equal Roots)', 'D = -16'],
            correctIndex: 0,
            explanation: 'D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, the equation has no real roots.',
            hint: 'Identify a = 2, b = -4, c = 3 and calculate (-4)² - 4(2)(3).'
          }
        }
      },
      {
        id: 'math_step_4',
        stepNumber: 4,
        type: 'guided',
        title: 'Step-by-Step Guided Worked Problem',
        subtitle: 'Finding k for Equal Roots',
        difficulty: 'Standard',
        completed: false,
        content: {
          question: {
            text: 'Find the value of k if quadratic equation x² - kx + 25 = 0 has equal real roots.',
            options: ['k = ± 10', 'k = ± 5', 'k = ± 20', 'k = 0'],
            correctIndex: 0,
            explanation: 'For equal roots, D = b² - 4ac = 0. (-k)² - 4(1)(25) = 0 => k² = 100 => k = ± 10.',
            hint: 'Set Discriminant D = 0 and solve for k² = 4ac.'
          }
        }
      },
      {
        id: 'math_step_5',
        stepNumber: 5,
        type: 'adaptive_challenge',
        title: 'Adaptive Board Exam Challenge',
        subtitle: 'High-Yield State District Level Question',
        difficulty: 'Advanced',
        completed: false,
        content: {
          question: {
            text: 'If one root of quadratic equation 3x² - kx + 12 = 0 is 2, find the value of k and the second root.',
            options: [
              'k = 10, second root = 2',
              'k = 10, second root = 2/3',
              'k = 12, second root = 1',
              'k = 8, second root = 3'
            ],
            correctIndex: 1,
            explanation: 'Substitute x = 2: 3(2)² - k(2) + 12 = 0 => 12 - 2k + 12 = 0 => 2k = 24 => k = 10. Product of roots α·β = c/a => 2·β = 12/3 = 4 => β = 2.',
            hint: 'First plug in x = 2 to solve for k. Then use product of roots formula α·β = c/a.'
          }
        }
      },
      {
        id: 'math_step_6',
        stepNumber: 6,
        type: 'misconception',
        title: 'Common Misconception Buster',
        subtitle: 'Avoid Common Marks Penalties in Board Exams',
        difficulty: 'Standard',
        completed: false,
        content: {
          misconceptionText: 'Misconception: √64 is always ±8.',
          correctMentalModel: 'Correct Model: The principal square root √64 is strictly +8. When solving x² = 64, x = ±√64 = ±8.',
          keyTakeaway: 'Always include ± only when taking square roots on both sides of an algebraic equation!'
        }
      },
      {
        id: 'math_step_7',
        stepNumber: 7,
        type: 'mastery',
        title: 'Quadratic Discriminant Mastery Certification',
        subtitle: 'Claim Your XP & Vidya Coins',
        difficulty: 'Advanced',
        completed: false,
        content: {
          text: 'Congratulations! You have mastered the Discriminant & Nature of Roots chapter with a Standard/Advanced difficulty rating.',
          keyTakeaway: 'Topic Mastery Level: 96% | Ready for Board Exams'
        }
      }
    ]
  },
  'Physical Science': {
    subjectName: 'Physical Science',
    currentDifficulty: 'Standard',
    steps: [
      {
        id: 'sci_step_1',
        stepNumber: 1,
        type: 'concept',
        title: 'Concept Breakdown: Snell\'s Law of Refraction',
        subtitle: 'Refractive Index & Light Bending',
        difficulty: 'Foundation',
        completed: true,
        content: {
          text: 'When light travels from an optically rarer medium (air) to a denser medium (glass/water), it bends towards the normal line.',
          keyTakeaway: 'Snell\'s Law: n1·sin(i) = n2·sin(r)  |  Refractive Index n = c / v',
          visualGraphic: 'n1 (Air = 1.0)  --->  n2 (Glass = 1.5)  => Angle of refraction r < Angle of incidence i'
        }
      },
      {
        id: 'sci_step_2',
        stepNumber: 2,
        type: 'example',
        title: 'Real-World Visual Application',
        subtitle: 'Apparent Depth of Coin in Water Glass',
        difficulty: 'Foundation',
        completed: true,
        content: {
          text: 'A coin placed at the bottom of a water bucket appears raised due to refraction of light rays coming from water into air.',
          interactivePrompt: 'Apparent Depth = Real Depth / Refractive Index of Water (1.33).',
          keyTakeaway: 'Swimming pools always appear shallower than their actual depth due to light refraction!'
        }
      },
      {
        id: 'sci_step_3',
        stepNumber: 3,
        type: 'diagnostic',
        title: 'Diagnostic AI Evaluator',
        subtitle: 'Quick Check on Refractive Index',
        difficulty: 'Standard',
        completed: false,
        content: {
          question: {
            text: 'If the speed of light in water is 2.25 × 10⁸ m/s and in vacuum is 3 × 10⁸ m/s, what is the refractive index of water?',
            options: ['1.33', '1.50', '1.20', '2.00'],
            correctIndex: 0,
            explanation: 'Refractive Index n = Speed in vacuum / Speed in medium = (3 × 10⁸) / (2.25 × 10⁸) = 1.33.',
            hint: 'Use formula n = c / v.'
          }
        }
      },
      {
        id: 'sci_step_4',
        stepNumber: 4,
        type: 'guided',
        title: 'Step-by-Step Guided Lens Formula Problem',
        subtitle: 'Convex Lens Image Formation',
        difficulty: 'Standard',
        completed: false,
        content: {
          question: {
            text: 'A convex lens of focal length 15 cm forms an image at 30 cm from the lens. Find the object distance u.',
            options: ['u = -30 cm', 'u = -15 cm', 'u = -10 cm', 'u = -45 cm'],
            correctIndex: 0,
            explanation: 'Lens formula: 1/f = 1/v - 1/u => 1/15 = 1/30 - 1/u => 1/u = 1/30 - 1/15 = -1/30 => u = -30 cm.',
            hint: 'Lens formula is 1/f = 1/v - 1/u. Remember Cartesian sign convention for real images.'
          }
        }
      },
      {
        id: 'sci_step_5',
        stepNumber: 5,
        type: 'adaptive_challenge',
        title: 'Adaptive Challenge: Critical Angle & Total Internal Reflection',
        subtitle: 'Optical Fiber Light Propagation',
        difficulty: 'Advanced',
        completed: false,
        content: {
          question: {
            text: 'What happens when light travels from glass to air at an angle of incidence greater than the critical angle?',
            options: [
              'Total Internal Reflection occurs (Light reflects 100% back)',
              'Light refracts completely into air at 90 degrees',
              'Light is absorbed by the medium',
              'Light slows down'
            ],
            correctIndex: 0,
            explanation: 'When angle of incidence i > Critical Angle C, light cannot refract into air and undergoes Total Internal Reflection.',
            hint: 'Think about how high-speed fiber optic broadband cables carry internet signals without light loss.'
          }
        }
      },
      {
        id: 'sci_step_6',
        stepNumber: 6,
        type: 'misconception',
        title: 'Misconception Buster: Convex vs Concave Lenses',
        subtitle: 'Ray Diagram Traps',
        difficulty: 'Standard',
        completed: false,
        content: {
          misconceptionText: 'Misconception: Lenses always magnify objects.',
          correctMentalModel: 'Correct Model: Convex lenses can form diminished real images when the object is beyond 2F, and concave lenses always form diminished virtual images.',
          keyTakeaway: 'Image size depends on object position relative to focal length F and 2F!'
        }
      },
      {
        id: 'sci_step_7',
        stepNumber: 7,
        type: 'mastery',
        title: 'Refraction & Optics Mastery Certification',
        subtitle: 'Claim Your XP & Vidya Coins',
        difficulty: 'Advanced',
        completed: false,
        content: {
          text: 'You have mastered Light Refraction, Lens Formulas, and Critical Angles!',
          keyTakeaway: 'Optics Mastery Level: 98% | Board Exam Ready'
        }
      }
    ]
  }
};

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  onRewardStudent,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [currentPath, setCurrentPath] = useState<SubjectAdaptivePath>(
    SAMPLE_PATHS['Mathematics']
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Start at Diagnostic step
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [interactiveSliderValue, setInteractiveSliderValue] = useState<number>(50);
  const [pathCompleted, setPathCompleted] = useState<boolean>(false);

  const handleSubjectChange = (subject: string) => {
    soundFx.playClick();
    setSelectedSubject(subject);
    const path = SAMPLE_PATHS[subject] || SAMPLE_PATHS['Mathematics'];
    setCurrentPath(path);
    setActiveStepIndex(2);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowHint(false);
    setPathCompleted(false);
  };

  const activeStep = currentPath.steps[activeStepIndex];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null && showExplanation) return;
    soundFx.playClick();
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === activeStep.content.question?.correctIndex;

    if (isCorrect) {
      soundFx.playCoin();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      soundFx.playFlip();
    }

    setShowExplanation(true);

    // Update difficulty dynamically
    if (activeStep.type === 'diagnostic') {
      const newDiff: AdaptiveDifficulty = isCorrect ? 'Advanced' : 'Foundation';
      setCurrentPath((prev) => ({
        ...prev,
        currentDifficulty: newDiff,
      }));
    }

    // Mark current step completed
    setCurrentPath((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[activeStepIndex] = {
        ...updatedSteps[activeStepIndex],
        completed: true
      };
      return {
        ...prev,
        steps: updatedSteps
      };
    });
  };

  const handleNextStep = () => {
    soundFx.playClick();
    if (activeStepIndex < currentPath.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      // Completed entire path!
      soundFx.playSuccess();
      setPathCompleted(true);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
      if (onRewardStudent) {
        onRewardStudent(100, 30);
      }
    }
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setShowHint(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      {/* Top Header & Adaptive Difficulty Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Brain className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                Real-Time AI Personalization
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              Adaptive Learning Path
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              7-Step sequence that continuously adjusts difficulty based on your speed & answers
            </p>
          </div>
        </div>

        {/* Current Difficulty Status Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Adaptive Level</div>
              <div className="text-xs font-black text-indigo-600 dark:text-indigo-300">
                {currentPath.currentDifficulty} Level
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-300 text-xs font-extrabold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>+100 XP Goal</span>
          </div>
        </div>
      </div>

      {/* Subject Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Object.keys(SAMPLE_PATHS).map((sub) => (
          <button
            key={sub}
            onClick={() => handleSubjectChange(sub)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSubject === sub
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {sub === 'Mathematics' ? '📐 Math Chapter 4' : '🔬 Science Refraction'}
          </button>
        ))}
      </div>

      {/* 7-Step Sequence Timeline Bar */}
      <div className="relative pt-2 pb-4">
        <div className="flex items-center justify-between relative z-10">
          {currentPath.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = step.completed;

            return (
              <button
                key={step.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveStepIndex(idx);
                  setSelectedOption(null);
                  setShowExplanation(false);
                  setShowHint(false);
                }}
                className={`flex flex-col items-center gap-1.5 group focus:outline-none ${
                  idx <= activeStepIndex ? 'cursor-pointer' : 'opacity-70'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-xs font-bold flex items-center justify-center transition-all border ${
                    isActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/80 border-indigo-600 scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold hidden md:block max-w-[70px] text-center truncate ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.type.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress connecting line */}
        <div className="absolute top-7 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{
              width: `${(activeStepIndex / (currentPath.steps.length - 1)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Main Active Step Content Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-6 animate-fade-in">
        {/* Step Header info */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
                Step {activeStep.stepNumber} of {currentPath.steps.length} • {activeStep.type.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Difficulty: {activeStep.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {activeStep.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeStep.subtitle}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {activeStep.type === 'concept' && <BookOpen className="w-6 h-6 text-indigo-500" />}
            {activeStep.type === 'example' && <Sliders className="w-6 h-6 text-sky-500" />}
            {activeStep.type === 'diagnostic' && <Activity className="w-6 h-6 text-amber-500" />}
            {activeStep.type === 'guided' && <Lightbulb className="w-6 h-6 text-purple-500" />}
            {activeStep.type === 'adaptive_challenge' && <Zap className="w-6 h-6 text-rose-500" />}
            {activeStep.type === 'misconception' && <ShieldAlert className="w-6 h-6 text-orange-500" />}
            {activeStep.type === 'mastery' && <Award className="w-6 h-6 text-emerald-500 animate-bounce" />}
          </div>
        </div>

        {/* Step Body rendering based on Step Type */}

        {/* 1. CONCEPT BREAKDOWN */}
        {activeStep.type === 'concept' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {activeStep.content.text}
            </div>

            {activeStep.content.visualGraphic && (
              <div className="p-4 rounded-2xl bg-indigo-950 text-indigo-200 font-mono text-xs border border-indigo-800/80 shadow-inner">
                <span className="text-indigo-400 font-bold block mb-1">📐 Formula & Example:</span>
                {activeStep.content.visualGraphic}
              </div>
            )}

            {activeStep.content.keyTakeaway && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="uppercase text-[10px] font-black text-amber-600 block">Socratic Key Takeaway:</span>
                  {activeStep.content.keyTakeaway}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. REAL-WORLD EXAMPLE WITH INTERACTIVE SIMULATOR SLIDER */}
        {activeStep.type === 'example' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {activeStep.content.text}
            </p>

            {/* Interactive Visual Slider Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Interactive Curve & Parameter Simulator:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">Value: {interactiveSliderValue}%</span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={interactiveSliderValue}
                onChange={(e) => setInteractiveSliderValue(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />

              <div className="p-4 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs flex items-center justify-between">
                <span>Computed Focal Length:</span>
                <span className="font-bold text-emerald-400">{(interactiveSliderValue * 0.45).toFixed(2)} cm</span>
              </div>
            </div>

            {activeStep.content.keyTakeaway && (
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs font-semibold">
                💡 <span className="font-bold">Real-World Application:</span> {activeStep.content.keyTakeaway}
              </div>
            )}
          </div>
        )}

        {/* 3, 4, 5. QUIZ / DIAGNOSTIC / GUIDED / ADAPTIVE CHALLENGE */}
        {(activeStep.type === 'diagnostic' || activeStep.type === 'guided' || activeStep.type === 'adaptive_challenge') && activeStep.content.question && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-relaxed">
                {activeStep.content.question.text}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {activeStep.content.question.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === activeStep.content.question?.correctIndex;

                let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400';

                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 font-bold';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-bold';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm transition-all border flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Socratic Hint Toggle */}
            {!showExplanation && (
              <div>
                {showHint ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <Brain className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Socratic AI Hint:</span> {activeStep.content.question.hint}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowHint(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    <HelpCircle className="w-4 h-4" /> Need a Socratic hint before answering?
                  </button>
                )}
              </div>
            )}

            {/* Explanation box */}
            {showExplanation && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> AI Solution Breakdown:
                </div>
                <p>{activeStep.content.question.explanation}</p>
              </div>
            )}

            {/* Check Answer Button */}
            {!showExplanation && (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                Evaluate Answer
              </button>
            )}
          </div>
        )}

        {/* 6. MISCONCEPTION BUSTER */}
        {activeStep.type === 'misconception' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Common Student Trap
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-200 font-medium">
                  {activeStep.content.misconceptionText}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct Mental Model
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  {activeStep.content.correctMentalModel}
                </p>
              </div>
            </div>

            {activeStep.content.keyTakeaway && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-200">
                💡 {activeStep.content.keyTakeaway}
              </div>
            )}
          </div>
        )}

        {/* 7. MASTERY CERTIFICATION */}
        {activeStep.type === 'mastery' && (
          <div className="text-center p-6 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Award className="w-10 h-10 animate-bounce" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Adaptive Mastery Achieved!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {activeStep.content.text}
            </p>

            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 font-bold text-xs text-amber-700 dark:text-amber-300">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> +100 XP Earned
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" /> +30 Vidya Coins
              </span>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-700">
          <button
            onClick={handlePrevStep}
            disabled={activeStepIndex === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          >
            Back Step
          </button>

          <button
            onClick={handleNextStep}
            disabled={
              (activeStep.type === 'diagnostic' || activeStep.type === 'guided' || activeStep.type === 'adaptive_challenge') &&
              !showExplanation
            }
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>
              {activeStepIndex === currentPath.steps.length - 1
                ? 'Complete Adaptive Path 🎉'
                : 'Continue to Next Step'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
