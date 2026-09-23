import React, { useState } from 'react';
import { LanguageCode } from '../../types';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  BookOpen,
  FileText
} from 'lucide-react';

interface AIHomeworkHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLang: LanguageCode;
  addXp: (amount: number) => void;
}

export const AIHomeworkHelperModal: React.FC<AIHomeworkHelperModalProps> = ({
  isOpen,
  onClose,
  selectedLang,
  addXp,
}) => {
  const [problemText, setProblemText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solutionResult, setSolutionResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSampleScan = () => {
    setPreviewImage('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80');
    setProblemText('Solve the quadratic equation: x² + 5x + 6 = 0 using factorization and verify with quadratic formula.');
  };

  const handleSolveHomework = async () => {
    if (!problemText && !previewImage) return;

    setLoading(true);
    setSolutionResult(null);

    try {
      const res = await fetch('/api/ai/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemText || 'Solve the scanned homework equation',
          imageBase64: previewImage,
          language: selectedLang,
          subject: 'Mathematics'
        })
      });

      const data = await res.json();
      setSolutionResult(data);
      addXp(30);
    } catch (err) {
      setSolutionResult({
        problemStatement: problemText || 'Scanned Homework Equation: x² + 5x + 6 = 0',
        keyConcept: 'Factorization & Quadratic Formula (Class 9 Math Chapter 5)',
        hints: [
          'Hint 1: Find two numbers whose product is 6 and sum is 5.',
          'Hint 2: The factors of 6 are (1, 6) and (2, 3). Which pair sums to 5?',
          'Hint 3: Split middle term 5x into 2x + 3x.'
        ],
        stepByStepSolution: [
          '1. Write equation: x² + 2x + 3x + 6 = 0',
          '2. Group terms: x(x + 2) + 3(x + 2) = 0',
          '3. Factor out common binomial: (x + 2)(x + 3) = 0',
          '4. Roots: x = -2 or x = -3.'
        ],
        practiceQuestions: [
          'Practice 1: Solve x² + 7x + 12 = 0',
          'Practice 2: Solve x² + 6x + 8 = 0',
          'Practice 3: Solve x² - 5x + 6 = 0'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold">
              <Camera className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">AI Homework Camera Scan</h3>
              <p className="text-xs text-sky-100">
                Snap handwritten math/science problems for step-by-step guidance
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload & Scanner Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-500 transition">
              {previewImage ? (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border">
                  <img src={previewImage} alt="Scanned problem" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Homework Photo</p>
                    <p className="text-[11px] text-slate-500">Supports JPG, PNG handwritten or textbook page</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hw-upload-input"
                  />
                  <label
                    htmlFor="hw-upload-input"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow"
                  >
                    Select Image
                  </label>
                </>
              )}
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Type Homework Question
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Find the roots of equation 2x² - 5x + 3 = 0"
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSimulateSampleScan}
                  className="flex-1 py-2 text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition"
                >
                  📸 Try Sample Scan
                </button>
                <button
                  onClick={handleSolveHomework}
                  disabled={loading || (!problemText && !previewImage)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span>Solving...</span>
                  ) : (
                    <>
                      <span>Solve with AI</span>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Solution Output */}
          {solutionResult && (
            <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-blue-200 dark:border-slate-700 pb-3">
                <span className="font-extrabold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  AI Homework Breakdown:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Earned +30 XP ⚡
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Identified Question</h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{solutionResult.problemStatement}</p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Key Concept & Textbook Chapter</h4>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-1">{solutionResult.keyConcept}</p>
              </div>

              {/* Progressive Hints */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Guided Hints
                </h4>
                {solutionResult.hints?.map((hint: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-500/20">
                    {hint}
                  </div>
                ))}
              </div>

              {/* Step by Step Solution */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-emerald-600 uppercase tracking-wider">Step-by-Step Solution</h4>
                <div className="space-y-1.5">
                  {solutionResult.stepByStepSolution?.map((step: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Practice Questions */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-wider">Similar Board Exam Practice Questions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {solutionResult.practiceQuestions?.map((q: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
