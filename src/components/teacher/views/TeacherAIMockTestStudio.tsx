import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Clock,
  Award,
  ShieldAlert,
  Send,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Check,
  FileSpreadsheet,
  X,
  Layers,
  Zap,
  HelpCircle
} from 'lucide-react';
import { QuizDoc, QuizQuestion } from '../../../types/quiz';
import { MockTestDoc, MockQuestion } from '../../../types/mockTest';
import { createAndPublishQuiz, QUIZZES_COLLECTION, parseClassNumber } from '../../../services/quizService';
import { saveTeacherMockTest } from '../../../services/mockTestService';
import { saveTeacherAnnouncement } from '../../../services/studentFirestoreService';
import { OFFICIAL_SYLLABUS_BY_CLASS, OFFICIAL_CLASSES } from '../../../data/officialSyllabusData';
import { soundFx } from '../../../lib/audio';
import { db } from '../../../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { UserAuthProfile } from '../../../types';

interface TeacherAIMockTestStudioProps {
  currentUser?: UserAuthProfile | null;
  onNavigateToMonitoring?: () => void;
}

const BOARDS = [
  'AP State Board (AP SSC)',
  'Telangana Board (TG SSC)',
  'CBSE National Board'
];

const SUBJECTS = [
  'Mathematics',
  'Physical Science',
  'Biological Science',
  'Social Studies',
  'English',
  'Telugu'
];

const QUESTION_COUNT_PRESETS = [
  { count: 10, label: '10 Qs (Quick Drill)', duration: 15, desc: 'Classroom spot-check & formative assessment' },
  { count: 25, label: '25 Qs (Standard Sectional)', duration: 45, desc: 'Weekly/Monthly high-yield practice' },
  { count: 50, label: '50 Qs (Half Mock Exam)', duration: 90, desc: 'Mid-term & pre-final simulation' },
  { count: 100, label: '100 Qs (Grand Board Mock)', duration: 180, desc: 'Complete SSC Public Exam pattern test' }
];

const DIFFICULTIES = [
  { id: 'Board Exam Standard', label: 'Board Exam Standard (Medium)', desc: 'Balanced 40% easy, 40% medium, 20% analytical' },
  { id: 'Advanced / High Yield', label: 'Advanced / High Yield (Hard)', desc: 'Deep problem-solving & tricky conceptual bits' },
  { id: 'Foundational', label: 'Foundational (Easy)', desc: 'Core definitions, formulas, and fundamental recall' }
];

export const TeacherAIMockTestStudio: React.FC<TeacherAIMockTestStudioProps> = ({
  currentUser,
  onNavigateToMonitoring
}) => {
  // Form Configuration State
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedBoard, setSelectedBoard] = useState<string>('AP State Board (AP SSC)');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState<string>('All Chapters (Full Syllabus)');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Board Exam Standard');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Generation Process State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [genError, setGenError] = useState<string | null>(null);

  // Generated Test Review & Edit State
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [editableQuestions, setEditableQuestions] = useState<QuizQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Published Tests Feed from Firestore
  const [publishedQuizzes, setPublishedQuizzes] = useState<QuizDoc[]>([]);
  const [filterClass, setFilterClass] = useState<string>('All');
  const [previewQuiz, setPreviewQuiz] = useState<QuizDoc | null>(null);

  // Dynamic syllabus chapters based on selected class & subject
  const availableChapters = useMemo(() => {
    const classData = OFFICIAL_SYLLABUS_BY_CLASS[selectedClass];
    if (!classData || !classData.subjects) return ['All Chapters (Full Syllabus)'];
    
    const subjectData = classData.subjects.find(
      (s) => s.name.toLowerCase().includes(selectedSubject.toLowerCase()) || 
             selectedSubject.toLowerCase().includes(s.name.toLowerCase())
    );

    if (!subjectData || !subjectData.chapters) {
      return ['All Chapters (Full Syllabus)'];
    }

    return ['All Chapters (Full Syllabus)', ...subjectData.chapters.map(c => c.title)];
  }, [selectedClass, selectedSubject]);

  // Adjust recommended duration when question count changes
  const handlePresetSelect = (preset: typeof QUESTION_COUNT_PRESETS[0]) => {
    soundFx.playClick();
    setQuestionCount(preset.count);
    setDurationMinutes(preset.duration);
  };

  // Subscribe to real published quizzes in Firestore
  useEffect(() => {
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const unsub = onSnapshot(
      quizzesRef,
      (snapshot) => {
        const list: QuizDoc[] = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          quizId: docSnap.id,
          id: docSnap.id
        } as QuizDoc));

        // Filter for mock tests or created quizzes, sorted by newest
        const mocks = list.filter(q => q.quizType === 'Mock Test' || !q.quizType);
        mocks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setPublishedQuizzes(mocks);
      },
      (err) => {
        console.warn('Firestore published quizzes snapshot error:', err);
      }
    );

    return () => unsub();
  }, []);

  // AI Mock Test Generation Handler
  const handleGenerateAIMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setIsGenerating(true);
    setGenError(null);
    setPublishSuccessMsg(null);

    // Step-by-step progress simulation for user clarity
    setGenerationStep('1/4 Connecting to Gemini AI engine & syllabus database...');
    const t1 = setTimeout(() => setGenerationStep('2/4 Calibrating AP/TS Board blueprint & Bloom\'s taxonomy...'), 800);
    const t2 = setTimeout(() => setGenerationStep('3/4 Formulating authentic MCQs with 4 distinct options and answer keys...'), 1600);
    const t3 = setTimeout(() => setGenerationStep('4/4 Synthesizing official step-by-step solutions and scoring guides...'), 2400);

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

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!res.ok) {
        throw new Error('Server returned an error generating mock test.');
      }

      const data = await res.json();
      const testMeta = data.test;
      const rawQuestions: any[] = data.questions || [];

      // Format questions into strict QuizQuestion format
      const formatted: QuizQuestion[] = rawQuestions.map((q, idx) => {
        const qNum = idx + 1;
        const paddedId = `ai_q_${String(qNum).padStart(3, '0')}`;

        // Ensure 4 valid options
        let opts: [string, string, string, string] = [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ];

        if (Array.isArray(q.options) && q.options.length >= 4) {
          opts = [String(q.options[0]), String(q.options[1]), String(q.options[2]), String(q.options[3])];
        } else if (Array.isArray(q.options) && q.options.length > 0) {
          opts = [
            String(q.options[0] || 'Correct concept representation'),
            String(q.options[1] || 'Inverse parameter variation'),
            String(q.options[2] || 'Unrelated physical quantity'),
            String(q.options[3] || 'None of the above')
          ];
        }

        // Determine correct answer string
        let correctStr = opts[0];
        if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < opts.length) {
          correctStr = opts[q.correctAnswer];
        } else if (typeof q.correctAnswer === 'string' && q.correctAnswer.trim() !== '') {
          // If the string is one of the options, use it; else make it option 0
          if (opts.includes(q.correctAnswer)) {
            correctStr = q.correctAnswer;
          } else {
            opts[0] = q.correctAnswer;
            correctStr = q.correctAnswer;
          }
        }

        return {
          questionId: paddedId,
          questionText: q.question || `Question ${qNum} on ${selectedSubject}`,
          options: opts,
          correctAnswer: correctStr,
          marks: Number(q.marks) || 1,
          explanation: q.explanation || 'Refer to official SCERT textbook chapter definitions and formulas.'
        };
      });

      const autoTitle = testMeta?.title || `${selectedClass} ${selectedSubject} AI Grand Board Mock Test (${formatted.length} Qs)`;
      setGeneratedTitle(autoTitle);
      setEditableQuestions(formatted);
      setExpandedQuestionIndex(0);
      soundFx.playSuccess();
    } catch (err: any) {
      console.error('Error in handleGenerateAIMockTest:', err);
      setGenError(err.message || 'Failed to generate AI mock test. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Publish to Students Handler (writes directly to Firestore quizzes, mockTests, and notifies class)
  const handlePublishToStudents = async () => {
    if (editableQuestions.length === 0) return;

    soundFx.playClick();
    setIsPublishing(true);
    setGenError(null);

    try {
      const numericClass = parseClassNumber(selectedClass) || 10;
      const nowIso = new Date().toISOString();
      const totalMarks = editableQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);

      // 1. Create QuizDoc payload for quizzes collection
      const quizPayload = {
        board: selectedBoard,
        class: numericClass,
        subject: selectedSubject,
        chapterId: selectedChapter.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        chapterName: selectedChapter,
        quizType: 'Mock Test' as const,
        title: generatedTitle,
        durationMinutes: Number(durationMinutes) || 45,
        totalQuestions: editableQuestions.length,
        totalMarks,
        questions: editableQuestions,
        createdBy: currentUser?.name || 'Faculty Member',
        status: 'published' as const
      };

      const publishedQuizId = await createAndPublishQuiz(quizPayload);

      // 2. Also save into mockTests collection so it syncs with existing mock tests repository
      const mockTestDoc: MockTestDoc = {
        id: publishedQuizId,
        title: generatedTitle,
        subject: selectedSubject as any,
        testNumber: Math.floor(Date.now() / 1000) % 1000,
        durationMinutes: Number(durationMinutes) || 45,
        totalQuestions: editableQuestions.length,
        totalMarks,
        questionDistribution: {
          mcq: editableQuestions.length,
          fillInBlank: 0,
          trueFalse: 0,
          oneMark: 0,
          twoMark: 0,
          fourMark: 0,
          previousBoard: 0,
          total: editableQuestions.length
        },
        isPublished: true,
        board: selectedBoard,
        createdAt: nowIso
      };

      const mockQuestions: MockQuestion[] = editableQuestions.map((eq, idx) => ({
        id: `${publishedQuizId}_q${idx + 1}`,
        testId: publishedQuizId,
        questionNumber: idx + 1,
        subject: selectedSubject,
        chapter: selectedChapter,
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions (1 Mark Each)',
        question: eq.questionText,
        options: [...eq.options],
        correctAnswer: eq.options.indexOf(eq.correctAnswer) >= 0 ? eq.options.indexOf(eq.correctAnswer) : 0,
        explanation: eq.explanation,
        hint: 'Apply textbook rules and formulas.',
        marks: eq.marks || 1
      }));

      saveTeacherMockTest(mockTestDoc, mockQuestions).catch(console.warn);

      // 3. Broadcast Announcement to students of this class
      saveTeacherAnnouncement({
        title: `🚨 New AI Mock Test: ${generatedTitle}`,
        message: `Your teacher published a new ${selectedSubject} Mock Test (${editableQuestions.length} Questions, ${durationMinutes} Mins) for ${selectedClass}. Open your Mock Tests tab to take this test now!`,
        type: 'Exam',
        targetClass: selectedClass,
        priority: 'Urgent',
        status: 'PUBLISHED',
        authorName: currentUser?.name || 'Teacher',
        authorRole: 'teacher'
      }).catch(console.warn);

      soundFx.playSuccess();
      setPublishSuccessMsg(`Successfully published "${generatedTitle}" to all ${selectedClass} students in Firestore!`);
      
      // Reset editor after short delay
      setTimeout(() => {
        setEditableQuestions([]);
        setGeneratedTitle('');
      }, 3000);

    } catch (err: any) {
      console.error('Error publishing mock test to students:', err);
      setGenError(err.message || 'Failed to publish mock test to students.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete / Unpublish Quiz Handler
  const handleDeleteQuiz = async (quizId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete and unpublish "${title}" from students?`)) {
      return;
    }
    soundFx.playClick();
    try {
      await deleteDoc(doc(db, QUIZZES_COLLECTION, quizId));
      soundFx.playSuccess();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Failed to delete quiz.');
    }
  };

  // Filtered published quizzes
  const filteredPublishedQuizzes = useMemo(() => {
    if (filterClass === 'All') return publishedQuizzes;
    const num = parseClassNumber(filterClass);
    return publishedQuizzes.filter(q => q.class === num);
  }, [publishedQuizzes, filterClass]);

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 text-white border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>Gemini AI Test Generator & Publisher • ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ మాక్ టెస్ట్ స్టూడియో</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Mock Test Studio & Instant Student Publisher
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Generate syllabus-aligned, board exam standard mock tests with Gemini AI in seconds. 
              Review questions, edit options, and publish directly to your students' portal with real-time surveillance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToMonitoring && (
              <button
                onClick={() => { soundFx.playClick(); onNavigateToMonitoring(); }}
                className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-blue-200" />
                <span>Live MDM Monitoring</span>
              </button>
            )}
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
              <div className="text-xl font-black text-yellow-300">{publishedQuizzes.length}</div>
              <div className="text-[10px] text-purple-200 font-semibold uppercase">Published Tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Generator Controls & Preview/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Test Configuration Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Test Calibration Parameters
                </h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                SCERT Aligned
              </span>
            </div>

            <form onSubmit={handleGenerateAIMockTest} className="space-y-4">
              {/* Target Class Grade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  Target Class Grade:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OFFICIAL_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedClass(cls); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selectedClass === cls
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Board */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  Educational Board:
                </label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  Subject:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedChapter('All Chapters (Full Syllabus)');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Chapter Scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Chapter Scope:
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {availableChapters.map((chap) => (
                    <option key={chap} value={chap}>{chap}</option>
                  ))}
                </select>
              </div>

              {/* Number of Questions & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Questions Count:</span>
                  <span className="text-purple-600 font-extrabold">{questionCount} Questions</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_COUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        questionCount === preset.count
                          ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 ring-2 ring-purple-400/30'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-black text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{preset.label}</span>
                        {questionCount === preset.count && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 fill-purple-100" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Time Allowed (Minutes):
                  </span>
                  <span className="text-purple-600 font-extrabold">{durationMinutes} Mins ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={180}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Difficulty Calibration:
                </label>
                <div className="space-y-1.5">
                  {DIFFICULTIES.map((diff) => (
                    <label
                      key={diff.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        selectedDifficulty === diff.id
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 ring-1 ring-purple-400/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={diff.id}
                        checked={selectedDifficulty === diff.id}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="mt-0.5 accent-purple-600 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{diff.label}</div>
                        <div className="text-[10px] text-slate-400">{diff.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Prompt / Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Specific Focus / Instructions (Optional):
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Include previous SSC exam models, 4-mark trigonometry numericals, and diagram-based questions..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit / Generate Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs text-white shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  isGenerating
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                }`}
                id="generate-ai-mock-test-btn"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span>⚡ Generate Mock Test with Gemini AI</span>
                  </>
                )}
              </button>
            </form>

            {/* In-Flight Status Animation */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{generationStep || 'Processing educational blueprint...'}</span>
                </div>
                <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full animate-indeterminate" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {genError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{genError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Generated Questions Review, Edit & Publish (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Generated Test Card */}
          {editableQuestions.length > 0 ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800/80 shadow-xl space-y-5">
              {/* Header with Title & Publish Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {selectedClass} • {selectedSubject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {editableQuestions.length} Questions • {durationMinutes} Mins
                    </span>
                  </div>
                  <input
                    type="text"
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-purple-500 w-full"
                    title="Click to rename test title"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePublishToStudents}
                    disabled={isPublishing}
                    className={`px-5 py-3 rounded-2xl font-black text-xs text-white shadow-xl transition flex items-center gap-2 cursor-pointer ${
                      isPublishing
                        ? 'bg-emerald-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 animate-pulse'
                    }`}
                    id="publish-ai-mock-test-btn"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>🚀 Publish to {selectedClass} Students</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Publish Success Notice */}
              {publishSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{publishSuccessMsg}</span>
                  </div>
                  {onNavigateToMonitoring && (
                    <button
                      onClick={onNavigateToMonitoring}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold hover:bg-emerald-500 transition cursor-pointer whitespace-nowrap"
                    >
                      Watch Live in MDM
                    </button>
                  )}
                </div>
              )}

              {/* Questions List & Accordion */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                  <span>Questions Preview ({editableQuestions.length} Items):</span>
                  <span>Click question to expand / edit answers</span>
                </div>

                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {editableQuestions.map((q, idx) => {
                    const isExpanded = expandedQuestionIndex === idx;
                    return (
                      <div
                        key={q.questionId || idx}
                        className={`rounded-2xl border transition ${
                          isExpanded
                            ? 'bg-slate-50/90 dark:bg-slate-800/80 border-purple-400 dark:border-purple-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {/* Summary Bar */}
                        <div
                          onClick={() => setExpandedQuestionIndex(isExpanded ? null : idx)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {q.questionText}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              {q.marks || 1}M
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Question Details & Option Editor */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                            {/* Edit Question Text */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Question Text:
                              </label>
                              <textarea
                                value={q.questionText}
                                onChange={(e) => {
                                  const updated = [...editableQuestions];
                                  updated[idx].questionText = e.target.value;
                                  setEditableQuestions(updated);
                                }}
                                rows={2}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            {/* Options Grid (4 Options) */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Options (Select radio to set correct answer key):
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect = q.correctAnswer === opt;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                                        isCorrect
                                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`correct_key_${idx}`}
                                        checked={isCorrect}
                                        onChange={() => {
                                          const updated = [...editableQuestions];
                                          updated[idx].correctAnswer = opt;
                                          setEditableQuestions(updated);
                                        }}
                                        className="accent-emerald-600 cursor-pointer"
                                        title="Mark as correct answer"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const updated = [...editableQuestions];
                                          const wasCorrect = updated[idx].correctAnswer === opt;
                                          updated[idx].options[optIdx] = e.target.value;
                                          if (wasCorrect) {
                                            updated[idx].correctAnswer = e.target.value;
                                          }
                                          setEditableQuestions(updated);
                                        }}
                                        className="w-full text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
                                      />
                                      {isCorrect && (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                SCERT Marking Scheme / Solution Step:
                              </label>
                              <textarea
                                value={q.explanation}
                                onChange={(e) => {
                                  const updated = [...editableQuestions];
                                  updated[idx].explanation = e.target.value;
                                  setEditableQuestions(updated);
                                }}
                                rows={2}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            {/* Delete Question Action */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove question ${idx + 1}?`)) {
                                    setEditableQuestions(editableQuestions.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete this question</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State: Call to Action */
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 text-purple-500 fill-purple-500 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Ready to Generate AI Mock Test
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configure the target class, board syllabus, and question count on the left, then click 
                  <strong className="text-purple-600"> "Generate Mock Test with Gemini AI"</strong> to preview and publish.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Published Mock Tests Manager Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Currently Published Mock Tests in Student Portals
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live in Firestore. Enrolled students can open, attempt, and submit these tests right now.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Filter Class:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              {OFFICIAL_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredPublishedQuizzes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            No published mock tests found for {filterClass}. Generate your first test above to publish!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublishedQuizzes.map((quiz) => (
              <div
                key={quiz.quizId || quiz.id}
                className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      Class {quiz.class} • {quiz.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {quiz.title}
                  </h4>

                  <div className="grid grid-cols-3 gap-2 py-2 text-center text-[11px] font-bold border-y border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="text-slate-900 dark:text-white font-black">{quiz.totalQuestions || (quiz.questions?.length ?? 0)}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Questions</div>
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white font-black">{quiz.durationMinutes || 45}m</div>
                      <div className="text-[9px] text-slate-400 uppercase">Time</div>
                    </div>
                    <div>
                      <div className="text-emerald-600 font-black">{quiz.totalMarks || quiz.totalQuestions || 0}M</div>
                      <div className="text-[9px] text-slate-400 uppercase">Marks</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => { soundFx.playClick(); setPreviewQuiz(quiz); }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>Questions</span>
                  </button>

                  {onNavigateToMonitoring && (
                    <button
                      onClick={() => { soundFx.playClick(); onNavigateToMonitoring(); }}
                      className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Monitor Student Attempts in Live MDM"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      <span>MDM</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteQuiz(quiz.quizId || quiz.id!, quiz.title)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition cursor-pointer"
                    title="Unpublish / Delete from students"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Previewing Questions of a Published Quiz */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
                  Class {previewQuiz.class} • {previewQuiz.subject}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {previewQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {previewQuiz.questions && previewQuiz.questions.length > 0 ? (
                previewQuiz.questions.map((q, idx) => (
                  <div
                    key={q.questionId || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {q.questionText}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md shrink-0">
                        {q.marks || 1} Mark
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer === opt;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full border border-current text-[9px] flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-8 italic border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                        💡 <strong>Answer Key / Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No question details embedded in this record.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewQuiz(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
