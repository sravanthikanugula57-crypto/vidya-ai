import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Play, 
  FileText, 
  HelpCircle, 
  Bot, 
  Sparkles, 
  Award, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Video, 
  Download, 
  Zap, 
  RotateCcw, 
  Star, 
  MessageSquare, 
  Clock, 
  Check, 
  AlertCircle,
  FolderTree,
  Eye,
  FileCode,
  Share2,
  Bookmark,
  Search,
  Maximize2,
  Sliders,
  Send,
  Globe,
  Layers,
  ChevronRight,
  ListOrdered,
  FileSpreadsheet,
  Brain,
  ChevronDown
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { formatYouTubeEmbedUrl, isYouTubeUrl, getYouTubeWatchUrl } from '../../../lib/videoUtils';
import { saveLessonProgressAndQuizScore } from '../../../services/studentFirestoreService';
import { setTopicCompletionInFirestore } from '../../../services/studentProgressService';

export interface LessonData {
  id: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  lessonName: string;
  nativeLessonName?: string;
  teacherName: string;
  teacherRole?: string;
  durationMinutes: number;
  language: 'English' | 'Telugu' | 'Bilingual';
  lastUpdated: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'mp4';
  objectives: string[];
  overview: string;
  concepts: {
    heading: string;
    content: string;
    formula?: string;
    tableData?: { headers: string[]; rows: string[][] };
  }[];
  diagrams: {
    title: string;
    imageUrl: string;
    caption: string;
    type: 'PNG' | 'SVG' | 'JPG';
  }[];
  workedExamples: {
    id: number;
    question: string;
    solutionSteps: string[];
    finalAnswer: string;
    tip?: string;
  }[];
  keyFormulas: {
    title: string;
    formula: string;
    explanation: string;
  }[];
  practiceQuestions: {
    id: number;
    type: 'mcq' | 'fill_in_blank' | 'numerical' | 'short_answer';
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
  }[];
  quizQuestions: {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  pyqs: {
    id: number;
    year: string;
    marks: number;
    question: string;
    solution: string;
  }[];
  summaryPoints: string[];
  nextLessonTitle?: string;
  prevLessonTitle?: string;
}

// Default Rich Class 10 SCERT Lesson Data (Real Numbers)
const DEFAULT_LESSON: LessonData = {
  id: 'lesson_math_101',
  subject: 'Mathematics',
  chapterNumber: 1,
  chapterTitle: 'Real Numbers',
  lessonName: 'Euclid\'s Division Lemma & Fundamental Theorem of Arithmetic',
  nativeLessonName: 'యుక్లిడ్ భాగాహార నియమం మరియు అంకగణిత ప్రాథమిక సిద్ధాంతం',
  teacherName: 'Sri M. Ramesh (PGT Mathematics)',
  teacherRole: 'State Level Master Trainer (SCERT Telangana)',
  durationMinutes: 45,
  language: 'Bilingual',
  lastUpdated: 'August 2026',
  videoUrl: '',
  videoType: 'youtube',
  overview: 'This lesson establishes the foundation of Class 10 Number Systems. Students master Euclid\'s Division Lemma to calculate Highest Common Factor (HCF) and apply the Fundamental Theorem of Arithmetic to prove the irrationality of numbers like √2, √3, and 2 + √5.',
  objectives: [
    'Understand and apply Euclid\'s Division Lemma (a = bq + r, 0 ≤ r < b).',
    'Compute HCF of large integers using Euclid\'s Division Algorithm.',
    'State and apply the Fundamental Theorem of Arithmetic for Prime Factorisation.',
    'Prove irrationality of real numbers using proof by contradiction.',
    'Determine the terminating or non-terminating decimal expansions of rational numbers.'
  ],
  concepts: [
    {
      heading: '1. Euclid\'s Division Lemma (EDL)',
      content: 'Euclid\'s Division Lemma states that for any two positive integers a and b, there exist unique integers q and r satisfying: a = bq + r where 0 ≤ r < b. Here, "a" is the Dividend, "b" is the Divisor, "q" is the Quotient, and "r" is the Remainder.',
      formula: 'a = bq + r \\quad (0 \\le r < b)',
      tableData: {
        headers: ['Dividend (a)', 'Divisor (b)', 'Quotient (q)', 'Remainder (r)', 'Relation'],
        rows: [
          ['17', '5', '3', '2', '17 = 5 × 3 + 2 (r = 2 < 5)'],
          ['45', '6', '7', '3', '45 = 6 × 7 + 3 (r = 3 < 6)'],
          ['24', '8', '3', '0', '24 = 8 × 3 + 0 (HCF = Divisor 8)']
        ]
      }
    },
    {
      heading: '2. The Fundamental Theorem of Arithmetic (FTA)',
      content: 'Every composite number can be expressed (factorised) as a product of primes, and this factorisation is unique, apart from the order in which the prime factors occur. For any two positive integers a and b: HCF(a, b) × LCM(a, b) = a × b.',
      formula: 'HCF(a, b) \\times LCM(a, b) = a \\times b'
    }
  ],
  diagrams: [
    {
      title: 'Euclid Division Algorithm Step Flowchart',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      caption: 'Iterative division process until remainder becomes zero (r = 0). The final divisor is the HCF.',
      type: 'PNG'
    }
  ],
  workedExamples: [
    {
      id: 1,
      question: 'Use Euclid\'s Division Algorithm to find the HCF of 4052 and 12576.',
      solutionSteps: [
        'Step 1: Since 12576 > 4052, apply EDL: 12576 = 4052 × 3 + 420 (Remainder r = 420 ≠ 0).',
        'Step 2: Apply EDL to divisor 4052 and remainder 420: 4052 = 420 × 9 + 272 (Remainder r = 272 ≠ 0).',
        'Step 3: Apply EDL to 420 and 272: 420 = 272 × 1 + 148 (r = 148 ≠ 0).',
        'Step 4: 272 = 148 × 1 + 124 (r = 124 ≠ 0).',
        'Step 5: 148 = 124 × 1 + 24 (r = 24 ≠ 0).',
        'Step 6: 124 = 24 × 5 + 4 (r = 4 ≠ 0).',
        'Step 7: 24 = 4 × 6 + 0 (Remainder is now 0!).'
      ],
      finalAnswer: 'HCF(12576, 4052) = 4',
      tip: 'In Board Exams, write all steps clearly. The divisor at the final step where remainder = 0 is the required HCF.'
    },
    {
      id: 2,
      question: 'Prove that √2 is an irrational number.',
      solutionSteps: [
        'Assume on the contrary that √2 is rational. Therefore, √2 = a / b where a and b are co-prime integers (b ≠ 0).',
        'Squaring both sides: 2 = a² / b²  ⇒  a² = 2b².',
        'This means 2 divides a². By theorem, 2 also divides a. Let a = 2c for some integer c.',
        'Substitute a = 2c into a² = 2b²: (2c)² = 2b²  ⇒  4c² = 2b²  ⇒  b² = 2c².',
        'This means 2 divides b², so 2 divides b.',
        'Therefore, 2 is a common factor of both a and b. This contradicts our assumption that a and b are co-prime.'
      ],
      finalAnswer: 'Hence, √2 is irrational (Proof by Contradiction).',
      tip: 'This is a guaranteed 4-mark Board Exam question!'
    }
  ],
  keyFormulas: [
    {
      title: 'Euclid Division Relation',
      formula: 'a = bq + r \\quad (0 \\le r < b)',
      explanation: 'Dividend = Divisor × Quotient + Remainder'
    },
    {
      title: 'HCF and LCM Product Theorem',
      formula: 'HCF(a, b) \\times LCM(a, b) = a \\times b',
      explanation: 'Valid for any two positive integers'
    },
    {
      title: 'Logarithm Product Rule',
      formula: '\\log_b(m \\cdot n) = \\log_b(m) + \\log_b(n)',
      explanation: 'Converts multiplication inside logarithm into addition'
    }
  ],
  practiceQuestions: [
    {
      id: 101,
      type: 'mcq',
      question: 'What is the HCF of two prime numbers p and q?',
      options: ['p × q', '1', 'p + q', '0'],
      correctAnswer: 1,
      explanation: 'Prime numbers have no common factors other than 1. Therefore, their HCF is always 1.'
    },
    {
      id: 102,
      type: 'fill_in_blank',
      question: 'If a = bq + r, the possible values of remainder r when divisor b = 4 are r = _____',
      correctAnswer: '0, 1, 2, 3',
      explanation: 'Since 0 ≤ r < b and b = 4, the remainder r can take values 0, 1, 2, or 3.'
    },
    {
      id: 103,
      type: 'numerical',
      question: 'Given HCF(306, 657) = 9, find LCM(306, 657).',
      correctAnswer: '22338',
      explanation: 'LCM = (306 × 657) / HCF = 201042 / 9 = 22338.'
    }
  ],
  quizQuestions: [
    {
      id: 1,
      question: 'According to Fundamental Theorem of Arithmetic, every composite number can be uniquely factorised into prime factors irrespective of their order.',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'Yes, prime factorisation is unique apart from the order of factors.'
    },
    {
      id: 2,
      question: 'The exponent of 2 in the prime factorisation of 144 is:',
      options: ['2', '3', '4', '6'],
      correctIndex: 2,
      explanation: '144 = 2⁴ × 3². The exponent of 2 is 4.'
    },
    {
      id: 3,
      question: 'If log₁₀(x) = 3, then the value of x is:',
      options: ['30', '100', '1000', '300'],
      correctIndex: 2,
      explanation: 'log₁₀(x) = 3  ⇒  x = 10³ = 1000.'
    }
  ],
  pyqs: [
    {
      id: 201,
      year: '2025 Board Exam',
      marks: 4,
      question: 'Use Euclid\'s Division Lemma to show that the square of any positive integer is either of the form 3m or 3m + 1 for some integer m.',
      solution: 'Let a be any positive integer and b = 3. By EDL, a = 3q + r where r = 0, 1, 2. Squaring a = 3q gives 9q² = 3(3q²) = 3m. Squaring a = 3q + 1 gives 9q² + 6q + 1 = 3(3q² + 2q) + 1 = 3m + 1.'
    },
    {
      id: 202,
      year: '2024 Board Exam',
      marks: 2,
      question: 'Find the HCF and LCM of 12, 15 and 21 using prime factorisation method.',
      solution: '12 = 2² × 3, 15 = 3 × 5, 21 = 3 × 7. Common prime factor with smallest exponent is 3, so HCF = 3. LCM = 2² × 3 × 5 × 7 = 420.'
    }
  ],
  summaryPoints: [
    'a = bq + r where 0 ≤ r < b (Dividend = Divisor × Quotient + Remainder).',
    'HCF × LCM = Product of two positive integers.',
    'Prime factorisation of any composite number is unique.',
    'Proof by contradiction is used to prove √p is irrational for any prime p.',
    'Rational numbers p/q have terminating decimals if q = 2ⁿ × 5ᵐ.'
  ],
  nextLessonTitle: 'Lesson 5: Polynomials & Geometrical Meaning of Zeroes',
  prevLessonTitle: 'Lesson 3: Revision of Sets & Number Systems'
};

interface LessonLearningSystemProps {
  userId?: string;
  lesson?: LessonData;
  studentClassGrade?: string;
  onBack?: () => void;
  onNextLesson?: () => void;
}

export const LessonLearningSystem: React.FC<LessonLearningSystemProps> = ({
  userId = 'std_101',
  lesson = DEFAULT_LESSON,
  studentClassGrade = 'Class 5',
  onBack,
  onNextLesson
}) => {
  // Navigation Section Anchors
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  // Search state inside lesson
  const [searchQuery, setSearchQuery] = useState('');
  
  // Header Actions
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Video State
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [videoQuality, setVideoQuality] = useState('1080p HD');
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Diagram Zoom Modal
  const [activeDiagramZoom, setActiveDiagramZoom] = useState<any | null>(null);

  // Worked Examples State
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({ 1: true });

  // Practice Questions User Inputs & Instant Validation State
  const [practiceInputs, setPracticeInputs] = useState<Record<number, any>>({});
  const [practiceFeedback, setPracticeFeedback] = useState<Record<number, { isCorrect: boolean; message: string }>>({});

  // Quiz State
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // AI Doubt Chat Assistant State
  const [aiLanguage, setAiLanguage] = useState<'English' | 'Telugu'>('English');
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: `Hello! I am your Class 10 AI Doubt Assistant for ${lesson.subject}. Ask me any question specifically about "${lesson.lessonName}"!`,
      time: 'Just now'
    }
  ]);

  const toggleBookmark = () => {
    soundFx.playCheck();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    soundFx.playPop();
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handlePracticeSubmit = (q: LessonData['practiceQuestions'][0]) => {
    soundFx.playClick();
    const userVal = practiceInputs[q.id];
    let isCorrect = false;

    if (q.type === 'mcq') {
      isCorrect = Number(userVal) === Number(q.correctAnswer);
    } else {
      isCorrect = String(userVal || '').trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) soundFx.playSuccess();
    else soundFx.playPop();

    setPracticeFeedback(prev => ({
      ...prev,
      [q.id]: {
        isCorrect,
        message: isCorrect ? '🎉 Correct! Well done.' : `❌ Incorrect. Correct Answer: ${q.options ? q.options[Number(q.correctAnswer)] : q.correctAnswer}`
      }
    }));
  };

  const handleQuizSubmit = async () => {
    soundFx.playSuccess();
    let correct = 0;
    lesson.quizQuestions.forEach(q => {
      if (quizUserAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    setQuizScore(correct);
    setQuizSubmitted(true);

    // Save to Firestore
    await saveLessonProgressAndQuizScore(
      userId,
      lesson.subject,
      `Chapter_${lesson.chapterNumber}`,
      lesson.id,
      correct,
      lesson.quizQuestions.length
    );

    try {
      await setTopicCompletionInFirestore(
        userId,
        studentClassGrade,
        lesson.subject,
        `ch_${lesson.chapterNumber}`,
        lesson.id,
        true,
        correct,
        correct
      );
    } catch (e) {
      console.warn('setTopicCompletionInFirestore warning:', e);
    }
  };

  const handleSendAiDoubt = (textToSend?: string) => {
    const text = textToSend || aiChatInput;
    if (!text.trim()) return;

    soundFx.playClick();
    const userMsg = { sender: 'user' as const, text, time: 'Just now' };
    setAiChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setAiChatInput('');

    // Generate contextual response
    setTimeout(() => {
      let aiReply = '';
      if (aiLanguage === 'Telugu') {
        aiReply = `సమాధానం (${lesson.lessonName}): యుక్లిడ్ భాగాహార నియమం a = bq + r (0 ≤ r < b) ప్రకారంగా ప్రతీ ధన పూర్ణసంఖ్యను సూచించవచ్చు. ఇందులో ${text} కు సంబంధించి స్పష్టమైన వివరణ ఇచ్చాము.`;
      } else {
        aiReply = `For ${lesson.subject} - ${lesson.lessonName}: Great question regarding "${text}". Remember that Euclid's Division Lemma states a = bq + r where 0 ≤ r < b. You can apply this step-by-step in your board exam answer!`;
      }
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiReply, time: 'Just now' }]);
    }, 800);
  };

  // Section List for Sticky Sidebar
  const sectionsList = [
    { id: 'overview', label: '1. Overview & Objectives', icon: BookOpen },
    { id: 'video', label: '2. Video Tutorial', icon: Video },
    { id: 'concepts', label: '3. Concept Explanation', icon: FileText },
    { id: 'diagrams', label: '4. Diagrams & Flowcharts', icon: Eye },
    { id: 'worked_examples', label: '5. Solved Examples', icon: HelpCircle },
    { id: 'formulas', label: '6. Key Formulas', icon: FileSpreadsheet },
    { id: 'practice', label: '7. Practice Questions', icon: Zap },
    { id: 'quiz', label: '8. Lesson Quiz', icon: Award },
    { id: 'pyqs', label: '9. Previous Year Questions', icon: ListOrdered },
    { id: 'summary', label: '10. Lesson Summary', icon: CheckCircle2 },
    { id: 'ai_doubt', label: '11. AI Doubt Assistant', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* ---------------------------------------------------- */}
      {/* 1. LESSON HEADER & TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">
                <span>{lesson.subject}</span>
                <span>•</span>
                <span>Chapter {lesson.chapterNumber}: {lesson.chapterTitle}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                {lesson.lessonName}
              </h1>
            </div>
          </div>

          {/* Search & Header Actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this lesson..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={toggleBookmark}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer relative"
            >
              <Share2 className="w-4 h-4" />
              {isShared && (
                <span className="absolute -bottom-8 right-0 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap shadow-lg">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* METADATA SUB-BAR */}
        <div className="bg-slate-100/60 dark:bg-slate-800/40 border-t border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            <span>👨‍🏫 Teacher: <strong className="text-slate-900 dark:text-slate-200">{lesson.teacherName}</strong></span>
            <span>⏱️ Duration: <strong>{lesson.durationMinutes} Mins</strong></span>
            <span>🌐 Language: <strong>{lesson.language}</strong></span>
            <span>📅 Updated: <strong>{lesson.lastUpdated}</strong></span>
          </div>

          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
            TS SCERT SSC Class 10 Syllabus
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN TWO-COLUMN LAYOUT WITH STICKY NAVIGATION */}
      {/* ---------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* STICKY SIDEBAR INDEX */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-28 space-y-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider px-2">
              Lesson Sections
            </h3>

            <nav className="space-y-1">
              {sectionsList.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN LESSON CONTENT BODY */}
        <main className="lg:col-span-9 space-y-10">
          
          {/* SECTION 1: OVERVIEW & OBJECTIVES */}
          <section id="overview" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Lesson Overview</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{lesson.lessonName}</h2>
              {lesson.nativeLessonName && (
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{lesson.nativeLessonName}</p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {lesson.overview}
            </p>

            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 space-y-3">
              <h4 className="font-extrabold text-xs text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Learning Objectives</span>
              </h4>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 2: VIDEO TUTORIAL */}
          <section id="video" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Video Tutorial</h3>
              </div>

              {/* Video Settings Toolbar */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <option value="0.75x">0.75x Speed</option>
                  <option value="1.0x">1.0x Speed</option>
                  <option value="1.25x">1.25x Speed</option>
                  <option value="1.5x">1.5x Speed</option>
                  <option value="2.0x">2.0x Speed</option>
                </select>

                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <option value="1080p HD">1080p HD</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
            </div>

            {/* Embedded Video Box */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden shadow-lg border border-slate-800">
              {lesson.videoUrl ? (
                lesson.videoType === 'youtube' || isYouTubeUrl(lesson.videoUrl) ? (
                  <iframe
                    src={`${formatYouTubeEmbedUrl(lesson.videoUrl)}${formatYouTubeEmbedUrl(lesson.videoUrl).includes('?') ? '&' : '?'}autoplay=0&rel=0&enablejsapi=1`}
                    title={lesson.lessonName}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    src={lesson.videoUrl}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Video className="w-12 h-12 opacity-40" />
                  <span className="text-xs font-semibold">No video source provided for this lesson</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-2 font-bold">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Resume Watching saved at 12:40</span>
                {(lesson.videoType === 'youtube' || isYouTubeUrl(lesson.videoUrl)) && (
                  <a
                    href={getYouTubeWatchUrl(lesson.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-[11px] font-bold ml-2"
                  >
                    Watch on YouTube ↗
                  </a>
                )}
              </span>

              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={autoplayNext}
                  onChange={(e) => setAutoplayNext(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Autoplay Next Lesson</span>
              </label>
            </div>
          </section>

          {/* SECTION 3: CONCEPT EXPLANATION */}
          <section id="concepts" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Concept Explanation & Theorems</h3>
            </div>

            <div className="space-y-6">
              {lesson.concepts.map((concept, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{concept.heading}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {concept.content}
                  </p>

                  {concept.formula && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-sky-300 font-mono text-center text-sm font-bold shadow-inner border border-slate-800">
                      {concept.formula}
                    </div>
                  )}

                  {concept.tableData && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 mt-3">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black">
                          <tr>
                            {concept.tableData.headers.map((h, i) => (
                              <th key={i} className="p-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {concept.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-slate-600 dark:text-slate-300">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: DIAGRAMS & ILLUSTRATIONS */}
          <section id="diagrams" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Illustrations & Flowcharts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.diagrams.map((diag, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="relative aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden group">
                    {diag.imageUrl ? (
                      <img
                        src={diag.imageUrl}
                        alt={diag.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <FileText className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <button
                      onClick={() => setActiveDiagramZoom(diag)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-extrabold text-xs gap-1.5 cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Click to Zoom Diagram</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{diag.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{diag.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: WORKED EXAMPLES */}
          <section id="worked_examples" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Worked Examples (Step-by-Step)</h3>
            </div>

            <div className="space-y-4">
              {lesson.workedExamples.map((ex) => {
                const isExpanded = !!expandedSolutions[ex.id];
                return (
                  <div key={ex.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-amber-50/30 dark:bg-amber-950/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black">
                          Example #{ex.id}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ex.question}</h4>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setExpandedSolutions(prev => ({ ...prev, [ex.id]: !prev[ex.id] }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition shrink-0 cursor-pointer"
                      >
                        {isExpanded ? 'Hide Solution' : 'View Solved Steps'}
                      </button>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40"
                      >
                        <div className="space-y-2">
                          {ex.solutionSteps.map((step, sIdx) => (
                            <p key={sIdx} className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {step}
                            </p>
                          ))}
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-black">
                          Final Answer: {ex.finalAnswer}
                        </div>

                        {ex.tip && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 italic font-semibold">
                            💡 Teacher Tip: {ex.tip}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 6: IMPORTANT FORMULA / KEY POINTS */}
          <section id="formulas" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-sky-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Key Formulas & Memory Cards</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lesson.keyFormulas.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/50 space-y-2">
                  <h4 className="font-bold text-xs text-sky-900 dark:text-sky-200">{f.title}</h4>
                  <p className="font-mono font-black text-sm text-sky-950 dark:text-sky-100 bg-white dark:bg-slate-900 p-2 rounded-xl text-center shadow-inner">
                    {f.formula}
                  </p>
                  <p className="text-[10px] text-sky-700 dark:text-sky-300">{f.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7: PRACTICE QUESTIONS */}
          <section id="practice" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">In-Lesson Practice Drills</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">{lesson.practiceQuestions.length} Questions</span>
            </div>

            <div className="space-y-6">
              {lesson.practiceQuestions.map((q) => {
                const feedback = practiceFeedback[q.id];
                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{q.question}</h4>

                    {/* MCQ Type */}
                    {q.type === 'mcq' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setPracticeInputs(prev => ({ ...prev, [q.id]: oIdx }))}
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                              practiceInputs[q.id] === oIdx
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Text / Numerical Type */}
                    {q.type !== 'mcq' && (
                      <input
                        type="text"
                        value={practiceInputs[q.id] || ''}
                        onChange={(e) => setPracticeInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Type your numerical answer or value here..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handlePracticeSubmit(q)}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                      >
                        Check Answer
                      </button>

                      {feedback && (
                        <span className={`text-xs font-bold ${feedback.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {feedback.message}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 8: INTERACTIVE LESSON QUIZ */}
          <section id="quiz" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Lesson Evaluation Quiz</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-black">
                Auto Evaluated • Saved to Firestore
              </span>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-6">
                {lesson.quizQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.question}
                    </h4>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setQuizUserAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                            quizUserAnswers[q.id] === oIdx
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {quizUserAnswers[q.id] === oIdx && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleQuizSubmit}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer"
                >
                  Submit Quiz & Store Results
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto text-xl font-black shadow-lg">
                  {quizScore}/{lesson.quizQuestions.length}
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-lg text-indigo-950 dark:text-indigo-100">
                    Quiz Completed! Accuracy: {Math.round((quizScore / lesson.quizQuestions.length) * 100)}%
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Your evaluation score has been recorded in your Student Progress database on Firestore.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizUserAnswers({});
                  }}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </section>

          {/* SECTION 9: PREVIOUS YEAR QUESTIONS */}
          <section id="pyqs" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-rose-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Board Exam Previous Year Questions (PYQs)</h3>
            </div>

            <div className="space-y-3">
              {lesson.pyqs.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 bg-rose-50/20 dark:bg-rose-950/10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black">
                      {p.year} • {p.marks} Marks
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{p.question}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">Model Answer: {p.solution}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 10: LESSON SUMMARY */}
          <section id="summary" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Lesson Summary & Quick Revision</h3>
            </div>

            <ul className="space-y-2">
              {lesson.summaryPoints.map((pt, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 text-xs font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* SECTION 11: AI DOUBT ASSISTANT */}
          <section id="ai_doubt" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">AI Contextual Doubt Assistant</h3>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['English', 'Telugu'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setAiLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      aiLanguage === lang ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat History Box */}
            <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              {aiChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                `Explain Lemma vs Theorem in ${aiLanguage}`,
                `Give real life application of Fundamental Theorem`,
                `How to get full 4 marks in √2 proof?`
              ].map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => handleSendAiDoubt(chip)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiDoubt()}
                placeholder={`Ask a doubt about ${lesson.lessonName}...`}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSendAiDoubt()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* SECTION 12: NEXT LESSON ROADMAP NAV */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-sky-400">Up Next in Chapter {lesson.chapterNumber}</span>
              <h4 className="font-extrabold text-sm text-white mt-0.5">{lesson.nextLessonTitle || 'Next Chapter Lesson'}</h4>
            </div>

            <button
              onClick={onNextLesson || onBack}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <span>Proceed to Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>

      {/* DIAGRAM ZOOM FULLSCREEN MODAL */}
      {activeDiagramZoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">{activeDiagramZoom.title}</h3>
              <button
                onClick={() => setActiveDiagramZoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-[60vh] flex items-center justify-center bg-black">
              {activeDiagramZoom.imageUrl ? (
                <img
                  src={activeDiagramZoom.imageUrl}
                  alt={activeDiagramZoom.title}
                  className="max-h-[60vh] object-contain"
                />
              ) : null}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{activeDiagramZoom.caption}</p>
          </div>
        </div>
      )}

    </div>
  );
};
