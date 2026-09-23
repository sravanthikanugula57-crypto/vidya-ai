import React, { useState } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  GraduationCap,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  Loader2,
  ListOrdered,
  Building2,
  HelpCircle
} from 'lucide-react';
import { MockTestDoc, MockQuestion } from '../../../types/mockTest';
import { soundFx } from '../../../lib/audio';
import { saveTeacherMockTest } from '../../../services/mockTestService';
import { createAndPublishQuiz, parseClassNumber } from '../../../services/quizService';
import { saveTeacherAnnouncement } from '../../../services/studentFirestoreService';
import { QuizQuestion } from '../../../types/quiz';

interface AIMockTestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestGenerated: (test: MockTestDoc, questions: MockQuestion[]) => void;
  defaultClassGrade?: string;
}

const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SUBJECTS = [
  'Mathematics',
  'Physical Science',
  'Biological Science',
  'General Science',
  'Social Studies',
  'English',
  'Telugu'
];
const BOARDS = [
  'Telangana Board (TG SSC)',
  'AP State Board (AP SSC)'
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [10, 25, 50, 100];

export const AIMockTestGeneratorModal: React.FC<AIMockTestGeneratorModalProps> = ({
  isOpen,
  onClose,
  onTestGenerated,
  defaultClassGrade = 'Class 10'
}) => {
  const [selectedClass, setSelectedClass] = useState(defaultClassGrade || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState('All Chapters (Full Syllabus)');
  const [selectedBoard, setSelectedBoard] = useState('Telangana Board (TG SSC)');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState<number>(25);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepText, setGenStepText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    soundFx.playClick();
    setIsGenerating(true);
    setErrorText(null);
    setGenStepText(`⚡ Generating ${selectedClass} ${selectedSubject} AI Board Test...`);

    try {
      const res = await fetch('/api/ai/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedClass,
          subject: selectedSubject,
          chapter: selectedChapter,
          difficulty: selectedDifficulty,
          board: selectedBoard,
          questionCount
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error generating mock test.');
      }

      const data = await res.json();
      const testDoc: MockTestDoc = data.test;
      const questionsList: MockQuestion[] = data.questions || [];

      // Save to mockTests collection asynchronously
      saveTeacherMockTest(testDoc, questionsList).catch((e) =>
        console.warn('Background saving generated AI test to Firestore error:', e)
      );

      // Also publish to quizzes collection so it appears in student Quizzes and Mock Tests lists
      try {
        const numericClass = parseClassNumber(selectedClass) || 10;
        const quizQuestions: QuizQuestion[] = questionsList.map((q, idx) => {
          let opts: [string, string, string, string] = ['A', 'B', 'C', 'D'];
          if (Array.isArray(q.options) && q.options.length >= 4) {
            opts = [String(q.options[0]), String(q.options[1]), String(q.options[2]), String(q.options[3])];
          } else if (Array.isArray(q.options) && q.options.length > 0) {
            opts = [
              String(q.options[0] || 'A'),
              String(q.options[1] || 'B'),
              String(q.options[2] || 'C'),
              String(q.options[3] || 'D')
            ];
          }
          let correctStr = opts[0];
          if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < opts.length) {
            correctStr = opts[q.correctAnswer];
          } else if (typeof q.correctAnswer === 'string' && opts.includes(q.correctAnswer)) {
            correctStr = q.correctAnswer;
          }

          return {
            questionId: `ai_q_${idx + 1}`,
            questionText: q.question,
            options: opts,
            correctAnswer: correctStr,
            marks: q.marks || 1,
            explanation: q.explanation || 'Official SCERT marking scheme explanation.'
          };
        });

        createAndPublishQuiz({
          board: selectedBoard,
          class: numericClass,
          subject: selectedSubject,
          chapterId: selectedChapter.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          chapterName: selectedChapter,
          quizType: 'Mock Test',
          title: testDoc.title || `${selectedClass} ${selectedSubject} AI Board Mock Test`,
          durationMinutes: testDoc.durationMinutes || 45,
          totalQuestions: quizQuestions.length,
          totalMarks: quizQuestions.reduce((s, q) => s + (q.marks || 1), 0),
          questions: quizQuestions,
          createdBy: 'AI Master Examiner',
          status: 'published'
        }).catch((e) => console.warn('Could not mirror to quizzes collection:', e));

        saveTeacherAnnouncement({
          title: `🚨 New AI Mock Test: ${testDoc.title}`,
          message: `A new ${selectedSubject} Mock Test (${questionsList.length} Questions, ${testDoc.durationMinutes || 45} Mins) has been published for ${selectedClass}.`,
          type: 'Exam',
          targetClass: selectedClass,
          priority: 'Urgent',
          status: 'PUBLISHED',
          authorName: 'AI Faculty',
          authorRole: 'teacher'
        }).catch(console.warn);
      } catch (mirrorErr) {
        console.warn('Error creating quiz and announcement mirror:', mirrorErr);
      }

      soundFx.playSuccess();
      setIsGenerating(false);
      onTestGenerated(testDoc, questionsList);
    } catch (err: any) {
      console.error('AI Mock Test Generator error:', err);
      setErrorText(err.message || 'Failed to generate test. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-yellow-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                VIDYA AI Exam Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Generate AI Mock Test
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 space-y-5 text-slate-900 dark:text-slate-100 max-h-[75vh] overflow-y-auto">
          
          {errorText && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold">
              {errorText}
            </div>
          )}

          {/* 1. Class & Subject Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Select Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-500" />
                Select Class / Grade
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Select Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-rose-500" />
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Board Level & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Board Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-500" />
                Board Pattern
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {BOARDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      disabled={isGenerating}
                      className={`py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer border ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Chapter Focus (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rose-500" />
                Chapter Focus
              </span>
              <span className="text-[10px] text-rose-500 font-extrabold">(Optional)</span>
            </label>
            <input
              type="text"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. Quadratic Equations or All Chapters"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* 4. Question Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-rose-500" />
              Question Count (Total Questions)
            </label>

            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((cnt) => {
                const isSelected = questionCount === cnt;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    disabled={isGenerating}
                    className={`py-3 rounded-2xl font-black text-xs transition cursor-pointer flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/25 ring-2 ring-rose-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                    }`}
                  >
                    <span className="text-base">{cnt} Qs</span>
                    <span className="text-[9px] opacity-80 font-normal">
                      {cnt === 100 ? 'Full Grand Board' : cnt === 75 ? 'Standard Paper' : cnt === 50 ? 'Medium Test' : 'Quick Drill'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Breakdown Preview Pill */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 text-xs space-y-1.5">
            <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
              <span>Expected Pattern Breakdown ({questionCount} Questions):</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black flex items-center gap-1 border border-emerald-300/40">
                <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Turbo AI Engine (1-2s)</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              • {Math.round(questionCount * 0.4)} MCQs • {Math.round(questionCount * 0.2)} Fill in Blanks • {Math.round(questionCount * 0.1)} True/False • {Math.round(questionCount * 0.1)} 1-Mark • {Math.round(questionCount * 0.1)} 2-Mark • {Math.round(questionCount * 0.05)} 4-Mark Essay • Board PYQs
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 max-w-xs py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{genStepText || 'Generating AI Mock Test...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
                <span>Fast Generate {questionCount} Qs AI Test</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
