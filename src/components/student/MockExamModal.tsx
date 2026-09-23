import React, { useState, useEffect } from 'react';
import { X, Clock, Award, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RotateCcw, Sparkles, Brain, Trophy } from 'lucide-react';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';

interface MockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteExam: (score: number, total: number, xpGained: number, coinsGained: number) => void;
}

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Mathematics',
    question: 'If the roots of quadratic equation x² - kx + 16 = 0 are real and equal, what is the value of k?',
    options: ['k = ± 8', 'k = ± 4', 'k = ± 16', 'k = ± 2'],
    correctIndex: 0,
    explanation: 'For real and equal roots, Discriminant D = b² - 4ac = 0. So (-k)² - 4(1)(16) = 0 => k² = 64 => k = ± 8.',
    hint: 'Recall that equal roots mean Discriminant D = b² - 4ac equals zero.'
  },
  {
    id: 2,
    subject: 'Physics',
    question: 'A convex lens of focal length 20 cm forms a real image. What is the power of this lens in Dioptres?',
    options: ['+5 D', '-5 D', '+0.05 D', '+20 D'],
    correctIndex: 0,
    explanation: 'Power of lens P = 1 / f (in meters). Focal length f = 20 cm = 0.2 m. So P = 1 / 0.2 = +5 D.',
    hint: 'Power P = 1/f where f is converted into meters!'
  },
  {
    id: 3,
    subject: 'Biology',
    question: 'Which organelle is known as the "Powerhouse of the Cell" because it produces ATP energy?',
    options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Golgi Complex'],
    correctIndex: 0,
    explanation: 'Mitochondria perform cellular respiration to release ATP energy molecules.',
    hint: 'Think about where ATP energy packets are synthesized during respiration.'
  },
  {
    id: 4,
    subject: 'Chemistry',
    question: 'What is the pH value of pure distilled water at 25°C?',
    options: ['pH = 7 (Neutral)', 'pH = 0 (Acidic)', 'pH = 14 (Basic)', 'pH = 5 (Mild Acid)'],
    correctIndex: 0,
    explanation: 'Pure water has equal concentrations of H+ and OH- ions, making it neutral at pH 7.',
    hint: 'Neutral solutions lie exactly in the middle of the 0-14 pH scale.'
  },
  {
    id: 5,
    subject: 'English & Grammar',
    question: 'Choose the correct indirect speech for: She said, "I am studying for my board exam."',
    options: [
      'She said that she was studying for her board exam.',
      'She said that I am studying for my board exam.',
      'She tells that she is studying for her board exam.',
      'She asked if she studied for her board exam.'
    ],
    correctIndex: 0,
    explanation: 'In indirect speech, present continuous "am studying" shifts to past continuous "was studying".',
    hint: 'Present continuous tense shifts back to past continuous in reported speech.'
  }
];

export const MockExamModal: React.FC<MockExamModalProps> = ({
  isOpen,
  onClose,
  onCompleteExam,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isOpen || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, examSubmitted]);

  if (!isOpen) return null;

  const currentQ = SAMPLE_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (examSubmitted) return;
    soundFx.playClick();
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIndex });
  };

  const handleSubmitExam = () => {
    soundFx.playSuccess();
    let calculatedScore = 0;
    SAMPLE_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setExamSubmitted(true);

    const xp = calculatedScore * 50 + 50; // Bonus XP
    const coins = calculatedScore * 10 + 20; // Bonus Coins

    onCompleteExam(calculatedScore, SAMPLE_QUESTIONS.length, xp, coins);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const resetExam = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowHint(false);
    setTimeLeft(300);
    setExamSubmitted(false);
    setScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Class 9 State Board Exam Drill
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20">
                  Timed Simulator
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Practice 5 quick high-yield board exam questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!examSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/20 text-xs font-mono font-bold text-yellow-300 shadow-inner">
                <Clock className="w-4 h-4 animate-spin text-yellow-300" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exam Running Body */}
        {!examSubmitted ? (
          <div className="p-6">
            {/* Question Progress bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentQ.subject}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-900 dark:text-blue-100 font-semibold shadow-md shadow-blue-500/10'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </button>
                );
              })}
            </div>

            {/* Hint Trigger */}
            <div className="mb-6">
              {showHint ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                  <Brain className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Socratic Hint:</span> {currentQ.hint}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowHint(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  <HelpCircle className="w-4 h-4" /> Need a Socratic hint?
                </button>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                  setShowHint(false);
                }}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Previous
              </button>

              {currentQuestionIndex < SAMPLE_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentQuestionIndex((prev) => prev + 1);
                    setShowHint(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Practice Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result Screen */
          <div className="p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Practice Drill Complete!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Great effort, Ananya! Keep doing daily 5-minute drills to boost your board exam confidence.
            </p>

            {/* Scorecard */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {score}/{SAMPLE_QUESTIONS.length}
                </div>
                <div className="text-[11px] font-medium text-slate-400 uppercase">Score</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                  +{score * 50 + 50}
                </div>
                <div className="text-[11px] font-medium text-slate-400 uppercase">XP Gained</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-amber-500">
                  +{score * 10 + 20}
                </div>
                <div className="text-[11px] font-medium text-slate-400 uppercase">Coins Earned</div>
              </div>
            </div>

            {/* Detailed Answer Review */}
            <div className="text-left space-y-3 mb-8 max-h-60 overflow-y-auto pr-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Detailed Solutions Breakdown:
              </h4>
              {SAMPLE_QUESTIONS.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                      <span>
                        Q{idx + 1}: {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Correct</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">✗ Missed</span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetExam}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
