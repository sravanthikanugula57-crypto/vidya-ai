import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, ChatMessage, QuizQuestion, Flashcard, MindMapNode } from '../../types';
import { ThreeDAssistantOrb } from '../common/3d/ThreeDAssistantOrb';
import { 
  X, 
  Send, 
  Bot, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Lightbulb, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  GitFork, 
  CheckCircle2, 
  RotateCcw,
  BookOpen,
  Play,
  Pause,
  RefreshCw,
  Flame,
  AlertTriangle,
  GraduationCap,
  FileText,
  ArrowRight,
  Check,
  Languages,
  Copy,
  Download,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../lib/audio';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLang: LanguageCode;
  selectedSubject?: string;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  initialTopic?: string;
  studentClassGrade?: string;
}

// Classroom Teaching Stages
type TeachingStage = 
  | 'greeting'
  | 'importance'
  | 'concept'
  | 'analogy'
  | 'trick_mistakes'
  | 'worked_example'
  | 'practice_check'
  | 'lesson_summary';

interface TeachingLessonData {
  topicTitle: string;
  subject: string;
  boardWeightage: string;
  greetingText: string;
  importanceText: string;
  definition: string;
  formula: string;
  realLifeAnalogy: string;
  memoryTrick: string;
  commonMistakes: string;
  workedExample: {
    question: string;
    step1: string;
    step2: string;
    finalAnswer: string;
  };
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  teluguTranslation?: {
    greetingText: string;
    importanceText: string;
    definition: string;
    realLifeAnalogy: string;
    memoryTrick: string;
  };
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  selectedLang: initialLang,
  selectedSubject = 'Mathematics',
  addXp,
  addCoins,
  initialTopic = 'Quadratic Equations & Discriminant Rules',
  studentClassGrade = 'Class 10'
}) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang || 'en');
  const [activeTab, setActiveTab] = useState<'classroom' | 'summary' | 'quiz' | 'flashcards' | 'mindmap'>('classroom');
  
  // Teaching Stage Pipeline
  const [currentStage, setCurrentStage] = useState<TeachingStage>('greeting');
  const [speechRate, setSpeechRate] = useState<number>(0.9); // 0.8 slow, 0.9 normal teacher, 1.1 fast
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [studentUnderstood, setStudentUnderstood] = useState<boolean | null>(null);

  // Lesson Interactive Data
  const [lessonData, setLessonData] = useState<TeachingLessonData>({
    topicTitle: initialTopic || 'Quadratic Equations & Roots',
    subject: selectedSubject,
    boardWeightage: `Important Topic in ${studentClassGrade}`,
    greetingText: currentLang === 'te' 
      ? `నమస్తే! నేను మీ విద్యా AI ఉపాధ్యాయుడిని. ఈ రోజు మనం ${studentClassGrade} ${selectedSubject} లో అత్యంత ముఖ్యమైన పాఠం నేర్చుకోబోతున్నాం. మీరు సిద్ధంగా ఉన్నారా?`
      : `Namaste! I am your Vidya AI Teacher. Today we are going to master "${initialTopic}" in ${studentClassGrade} ${selectedSubject}. Are you ready to begin?`,
    importanceText: currentLang === 'te'
      ? `ఈ పాఠం మీ ${studentClassGrade} పరీక్షల్లో చాలా ముఖ్యమైనది.`
      : `This topic forms an important foundation for your ${studentClassGrade} examinations and future concepts!`,
    definition: `A Quadratic Equation in variable x is an equation of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0.`,
    formula: `Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a  |  Discriminant D = b² - 4ac`,
    realLifeAnalogy: `🌾 Real World Analogy: Imagine throwing a cricket ball up into the air. The path of the ball forms a curved arch (parabola). The height of the ball at any time t is given by a quadratic equation!`,
    memoryTrick: `⚡ Memory Trick: Remember "B-M-D-A-S" & "D Rule": If D > 0, you get 2 Real & Distinct Roots. If D = 0, you get 2 Equal Roots. If D < 0, Roots are Imaginary!`,
    commonMistakes: `🚨 Common Student Mistake: Students often forget the ± sign when taking square roots, or make sign mistakes with negative values of -b and (-4ac).`,
    workedExample: {
      question: `Solve the quadratic equation: 2x² - 7x + 3 = 0 using Quadratic Formula.`,
      step1: `Identify a, b, c: a = 2, b = -7, c = 3. Calculate Discriminant D = b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25.`,
      step2: `Since D = 25 > 0, roots are real and distinct. Apply formula: x = (-(-7) ± √25) / (2 * 2) = (7 ± 5) / 4.`,
      finalAnswer: `Case 1: x = (7 + 5) / 4 = 12/4 = 3. Case 2: x = (7 - 5) / 4 = 2/4 = 1/2. Therefore, roots are x = 3 and x = 1/2.`
    },
    practiceQuestion: {
      question: `What is the nature of roots for the quadratic equation x² - 6x + 9 = 0?`,
      options: [
        'Two Real and Equal Roots (D = 0)',
        'Two Real and Distinct Roots (D > 0)',
        'No Real Roots (D < 0)',
        'Infinite Roots'
      ],
      correctIndex: 0,
      explanation: `Here a = 1, b = -6, c = 9. Discriminant D = b² - 4ac = (-6)² - 4(1)(9) = 36 - 36 = 0. Since D = 0, the equation has two real and equal roots (x = 3, 3)!`
    }
  });

  // Interactive Quiz state inside classroom
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [showPracticeResult, setShowPracticeResult] = useState<boolean>(false);

  // Messages Thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: lessonData.greetingText,
      timestamp: 'Just now',
      hints: [
        'Ask Vidya Teacher to explain with another real-life example anytime!',
        'Click "Explain in Telugu" to switch language instantly.',
        'Use shortcut buttons below to interrupt or ask practice questions.'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Flashcards & Mindmap
  const [activeFlashcards, setActiveFlashcards] = useState<Flashcard[]>([
    { id: 'f1', front: 'What is Quadratic Formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a', chapter: selectedSubject },
    { id: 'f2', front: 'What is Discriminant D?', back: 'D = b² - 4ac. Determines nature of roots (D > 0 real distinct, D = 0 real equal, D < 0 complex).', chapter: selectedSubject },
    { id: 'f3', front: 'What is Snell\'s Law?', back: 'sin(i) / sin(r) = Refractive Index (n)', chapter: 'Physical Science' },
  ]);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const [activeMindmap, setActiveMindmap] = useState<MindMapNode>({
    id: 'root',
    label: initialTopic,
    description: 'Mastery Concept Hierarchy',
    children: [
      { id: 'n1', label: '1. Standard Form', description: 'ax² + bx + c = 0 (a ≠ 0)' },
      { id: 'n2', label: '2. Solution Methods', description: 'Factorization, Completing Square, Quadratic Formula' },
      { id: 'n3', label: '3. Discriminant Rules', description: 'D = b² - 4ac (Nature of roots)' },
      { id: 'n4', label: '4. Real-World Applications', description: 'Projectile motion, profit optimization, geometry areas' }
    ]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, currentStage]);

  // Speech Output Function with Natural Teacher Voice
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown asterisks or code formatting for clear speech
    const cleanSpeechText = text.replace(/\*/g, '').replace(/#/g, '').replace(/`/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText.slice(0, 450));
    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    if (currentLang === 'te') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  // Auto Speak on Stage Change
  const advanceToStage = (stage: TeachingStage) => {
    soundFx.playClick();
    setCurrentStage(stage);
    setStudentUnderstood(null);

    let stagePromptText = '';
    if (stage === 'greeting') {
      stagePromptText = lessonData.greetingText;
    } else if (stage === 'importance') {
      stagePromptText = `🎯 **Topic Importance & Exam Strategy**:\n\n${lessonData.importanceText}\n\nShall we look at the core definition now?`;
    } else if (stage === 'concept') {
      stagePromptText = `📘 **Core Concept & Formula**:\n\n**Definition**: ${lessonData.definition}\n\n**Formula**: ${lessonData.formula}\n\nDid you understand this definition?`;
    } else if (stage === 'analogy') {
      stagePromptText = `🌾 **Everyday Real-Life Analogy**:\n\n${lessonData.realLifeAnalogy}\n\nIs this analogy clear to you?`;
    } else if (stage === 'trick_mistakes') {
      stagePromptText = `⚡ **Memory Trick & Exam Warning**:\n\n${lessonData.memoryTrick}\n\n${lessonData.commonMistakes}\n\nShall we solve a worked example together?`;
    } else if (stage === 'worked_example') {
      stagePromptText = `✏️ **Step-by-Step Solved Worked Example**:\n\n**Question**: ${lessonData.workedExample.question}\n\n**Step 1**: ${lessonData.workedExample.step1}\n**Step 2**: ${lessonData.workedExample.step2}\n**Final Answer**: ${lessonData.workedExample.finalAnswer}\n\nNow, are you ready to try 1 practice question yourself?`;
    } else if (stage === 'practice_check') {
      stagePromptText = `❓ **Practice Question for You**:\n\n${lessonData.practiceQuestion.question}\n\nSelect your answer on the classroom board to verify!`;
    } else if (stage === 'lesson_summary') {
      stagePromptText = `🎓 **Lesson Mastered! Full Summary & Homework Generated**:\n\nGreat job! You have completed the classroom lesson on ${lessonData.topicTitle}. View your full summary notes, revision cards, and homework packet!`;
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      addXp(60);
      addCoins(15);
    }

    const aiMsg: ChatMessage = {
      id: 'm_stage_' + Date.now(),
      sender: 'ai',
      text: stagePromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, aiMsg]);
    speakText(stagePromptText);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = customPrompt || inputPrompt;
    if (!query.trim() || loading) return;

    soundFx.playClick();
    const userMsg: ChatMessage = {
      id: 'm_usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language: currentLang,
          grade: studentClassGrade,
          subject: selectedSubject,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      const replyText = data.text || 'Great question! Let\'s break this down step by step.';

      const aiReply: ChatMessage = {
        id: 'm_ai_' + Date.now(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hints: data.hints || []
      };

      setMessages((prev) => [...prev, aiReply]);
      speakText(replyText);
      addXp(15);

    } catch (e) {
      console.error(e);
      const fallbackReply = currentLang === 'te'
        ? `చాలా మంచి ప్రశ్న! ఈ అంశాన్ని మరింత సులభంగా అర్థం చేసుకోవడానికి మరొక ఉదాహరణ చూద్దాం.`
        : `Great question! To understand "${query}", let's look at another simple real-life example from our school laboratory.`;

      setMessages((prev) => [...prev, {
        id: 'm_fallback_' + Date.now(),
        sender: 'ai',
        text: fallbackReply,
        timestamp: 'Just now'
      }]);
      speakText(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  const handleInterruptAction = (actionType: string) => {
    soundFx.playClick();
    let promptText = '';
    if (actionType === 'explain_again') promptText = 'Please explain this concept again in simple steps.';
    if (actionType === 'another_example') promptText = 'Can you give me another real-life village/school example?';
    if (actionType === 'explain_telugu') {
      setCurrentLang('te');
      promptText = 'దయచేసి దీనిని తెలుగులో వివరించండి (Explain in Telugu).';
    }
    if (actionType === 'explain_slowly') {
      setSpeechRate(0.8);
      promptText = 'Please explain slowly step-by-step.';
    }
    if (actionType === 'simple_words') promptText = 'Please explain in very simple words as if to a beginner.';
    if (actionType === 'shortcut_trick') promptText = 'Is there any shortcut memory trick or mnemonic for this for board exams?';
    if (actionType === 'practice_question') promptText = 'Please give me 1 practice question with step-by-step solution.';

    handleSendMessage(promptText);
  };

  const handleCheckAnswer = (optIndex: number) => {
    soundFx.playCheck();
    setPracticeAnswer(optIndex);
    setShowPracticeResult(true);
    if (optIndex === lessonData.practiceQuestion.correctIndex) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      addXp(30);
      addCoins(5);
    }
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'te' ? 'en' : 'te';
    setCurrentLang(nextLang);
    soundFx.playClick();
    const langMsg = nextLang === 'te'
      ? `తెలుగు భాషా మోడ్ ఆన్ చేయబడింది. ఇప్పుడు విద్యా AI మాస్టార్ మీకు సహజమైన తెలుగులో వివరిస్తారు!`
      : `English language mode active. Vidya AI Teacher is ready to guide you in English!`;
    
    setMessages((prev) => [...prev, {
      id: 'm_lang_' + Date.now(),
      sender: 'ai',
      text: langMsg,
      timestamp: 'Just now'
    }]);
    speakText(langMsg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden font-sans text-slate-100">
        
        {/* HEADER & TEACHER STATUS BAR */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative shrink-0 flex items-center justify-center">
              <ThreeDAssistantOrb
                size="sm"
                theme="amber"
                state={isSpeaking ? 'speaking' : loading ? 'thinking' : 'idle'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">VIDYA AI Classroom Teacher</h3>
                <span className="text-[10px] bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Classroom Mode
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                {selectedSubject} • {lessonData.topicTitle} ({lessonData.boardWeightage})
              </p>
            </div>
          </div>

          {/* AUDIO & LANGUAGE CONTROLS */}
          <div className="flex items-center space-x-2">
            {/* Speed selector */}
            <div className="bg-white/10 backdrop-blur px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10">
              <span className="text-[10px] text-sky-200 uppercase">Voice Speed:</span>
              <button 
                onClick={() => setSpeechRate(0.8)} 
                className={`px-1.5 py-0.5 rounded text-[10px] ${speechRate === 0.8 ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-white/20'}`}
              >
                0.8x
              </button>
              <button 
                onClick={() => setSpeechRate(0.9)} 
                className={`px-1.5 py-0.5 rounded text-[10px] ${speechRate === 0.9 ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-white/20'}`}
              >
                1.0x
              </button>
              <button 
                onClick={() => setSpeechRate(1.1)} 
                className={`px-1.5 py-0.5 rounded text-[10px] ${speechRate === 1.1 ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-white/20'}`}
              >
                1.2x
              </button>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentLang === 'te' ? 'తెలుగు Active' : 'English Active'}</span>
            </button>

            {/* Audio Voice Speak / Stop */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  const lastAi = [...messages].reverse().find(m => m.sender === 'ai');
                  if (lastAi) speakText(lastAi.text);
                }
              }}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                isSpeaking ? 'bg-amber-400 text-slate-950 shadow-md animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSpeaking ? 'Stop Teacher Voice' : 'Play Teacher Voice'}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 font-bold" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TEACHING STAGE PIPELINE PIPES */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-bold shrink-0">
          {[
            { stage: 'greeting', label: '1. Greeting', icon: Sparkles },
            { stage: 'importance', label: '2. Board Exam Importance', icon: Target },
            { stage: 'concept', label: '3. Core Concept', icon: BookOpen },
            { stage: 'analogy', label: '4. Village Analogy', icon: Flame },
            { stage: 'trick_mistakes', label: '5. Tricks & Warnings', icon: AlertTriangle },
            { stage: 'worked_example', label: '6. Worked Example', icon: CheckCircle2 },
            { stage: 'practice_check', label: '7. Practice Check', icon: HelpCircle },
            { stage: 'lesson_summary', label: '8. Complete Summary', icon: GraduationCap }
          ].map((item, idx) => {
            const IconComp = item.icon;
            const isActive = currentStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => advanceToStage(item.stage as TeachingStage)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'classroom' ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Classroom</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'summary' ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>End of Lesson Summary Packet</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'quiz' ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Practice Checkpoint</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'flashcards' ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Formula Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'mindmap' ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-rose-400" />
            <span>Concept Map</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/60">
          
          {/* TAB 1: INTERACTIVE CLASSROOM (BOARD + DIALOGUE) */}
          {activeTab === 'classroom' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* LEFT 5 COLS: DIGITAL CLASSROOM CHALKBOARD */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider">Teacher Digital Board</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedSubject}</span>
                  </div>

                  {/* Dynamic Visual Content according to current stage */}
                  {currentStage === 'greeting' && (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-3">
                      <h4 className="text-sm font-black text-blue-300">👋 Welcome to {studentClassGrade} {selectedSubject}!</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Today Vidya Teacher will guide you step-by-step through <strong>{lessonData.topicTitle}</strong>. We will use real-world village analogies, solve 1 worked example, and test your understanding!
                      </p>
                      <button
                        onClick={() => advanceToStage('importance')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Yes, I am Ready! Begin Topic →</span>
                      </button>
                    </div>
                  )}

                  {(currentStage === 'importance' || currentStage === 'concept') && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-400">Board Exam Importance</span>
                        <p className="font-semibold text-amber-200">{lessonData.importanceText}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase text-blue-400">Core Definition</span>
                        <p className="text-xs font-serif text-slate-200 leading-relaxed">{lessonData.definition}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 font-mono text-xs text-emerald-300 text-center font-bold">
                        {lessonData.formula}
                      </div>
                    </div>
                  )}

                  {currentStage === 'analogy' && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-3">
                      <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Everyday Village & School Analogy
                      </span>
                      <p className="text-xs text-amber-100 leading-relaxed font-medium">
                        {lessonData.realLifeAnalogy}
                      </p>
                    </div>
                  )}

                  {currentStage === 'trick_mistakes' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                        <span className="text-[10px] font-black uppercase text-purple-300 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                          Memory Trick & Shortcut Rule
                        </span>
                        <p className="text-xs text-purple-100 font-medium">{lessonData.memoryTrick}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                        <span className="text-[10px] font-black uppercase text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Common Student Mistake to Avoid
                        </span>
                        <p className="text-xs text-rose-100 font-medium">{lessonData.commonMistakes}</p>
                      </div>
                    </div>
                  )}

                  {currentStage === 'worked_example' && (
                    <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-800/60 space-y-3">
                      <span className="text-[10px] font-black uppercase text-blue-300">Worked Step-by-Step Example</span>
                      <p className="text-xs font-bold text-white">{lessonData.workedExample.question}</p>
                      
                      <div className="space-y-2 text-[11px] text-slate-300 font-mono bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <p><strong>Step 1:</strong> {lessonData.workedExample.step1}</p>
                        <p><strong>Step 2:</strong> {lessonData.workedExample.step2}</p>
                        <p className="text-emerald-400 font-bold"><strong>Final Answer:</strong> {lessonData.workedExample.finalAnswer}</p>
                      </div>
                    </div>
                  )}

                  {currentStage === 'practice_check' && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <span className="text-[10px] font-black uppercase text-sky-400">Interactive Student Practice Check</span>
                      <p className="text-xs font-bold text-white">{lessonData.practiceQuestion.question}</p>

                      <div className="space-y-2">
                        {lessonData.practiceQuestion.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleCheckAnswer(idx)}
                            className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              practiceAnswer === idx
                                ? idx === lessonData.practiceQuestion.correctIndex
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-rose-600 text-white border-rose-500'
                                : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </button>
                        ))}
                      </div>

                      {showPracticeResult && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          <strong className="text-emerald-400">Explanation:</strong> {lessonData.practiceQuestion.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStage === 'lesson_summary' && (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2 text-center">
                      <GraduationCap className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="font-black text-sm text-emerald-300">Lesson Mastered Successfully!</h4>
                      <p className="text-xs text-slate-300">Check the "Summary Packet" tab to view complete homework & revision notes.</p>
                    </div>
                  )}

                  {/* CHECK UNDERSTANDING PROMPT BAR */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 font-bold">Did you understand this point?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setStudentUnderstood(true);
                          soundFx.playCheck();
                          const checkReply = `Wonderful! Let's advance to the next key teaching step.`;
                          setMessages((prev) => [...prev, { id: 'm_' + Date.now(), sender: 'ai', text: checkReply, timestamp: 'Just now' }]);
                          speakText(checkReply);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                          studentUnderstood === true ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        👍 Yes!
                      </button>
                      <button
                        onClick={() => {
                          setStudentUnderstood(false);
                          soundFx.playClick();
                          handleInterruptAction('explain_again');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                          studentUnderstood === false ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        🤔 Explain Again
                      </button>
                    </div>
                  </div>
                </div>

                {/* STUDENT INTERRUPT & QUICK TEACHING CONTROLS */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Student Controls (Interrupt Vidya Teacher Anytime):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleInterruptAction('explain_again')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      🔄 Explain Again
                    </button>
                    <button
                      onClick={() => handleInterruptAction('another_example')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      🌾 Give Another Example
                    </button>
                    <button
                      onClick={() => handleInterruptAction('explain_telugu')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      🗣️ Explain in Telugu
                    </button>
                    <button
                      onClick={() => handleInterruptAction('explain_slowly')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      🐢 Explain Slowly
                    </button>
                    <button
                      onClick={() => handleInterruptAction('simple_words')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      🧩 Simple Words
                    </button>
                    <button
                      onClick={() => handleInterruptAction('shortcut_trick')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      ⚡ Shortcut Trick
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT 7 COLS: LIVE CLASSROOM TEACHING CHAT DIALOGUE */}
              <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                
                {/* Dialogue Header */}
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <span className="font-black text-xs text-white">Vidya Teacher Live Classroom Stream</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Socratic Dialogue Active
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] rounded-3xl p-4 shadow-sm text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none font-semibold'
                          : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none font-sans'
                      }`}>
                        <div className="font-black text-[10px] opacity-75 mb-1.5 flex items-center justify-between border-b border-white/10 pb-1">
                          <span>{m.sender === 'user' ? 'You (Ananya)' : 'Vidya AI Teacher (విద్యా మాస్టార్)'}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed font-medium">{m.text}</p>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 p-4 rounded-3xl text-xs text-amber-300 flex items-center space-x-2 border border-slate-800">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Vidya Teacher is crafting a step-by-step simple explanation...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Vidya Teacher e.g. How to find discriminant when b = 0?"
                    className="flex-1 px-4 py-3 text-xs rounded-2xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputPrompt.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl shadow-md transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: END OF LESSON SUMMARY PACKET */}
          {activeTab === 'summary' && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-black text-base text-white">Complete Lesson Summary Packet</h3>
                    <p className="text-xs text-slate-400">{studentClassGrade} {selectedSubject} • {lessonData.topicTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playCheck();
                      navigator.clipboard.writeText(`LESSON SUMMARY: ${lessonData.topicTitle}\nDefinition: ${lessonData.definition}\nFormula: ${lessonData.formula}\nMemory Trick: ${lessonData.memoryTrick}`);
                      alert('Lesson Summary copied to clipboard!');
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      alert('Downloading PDF Study Notes...');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Notes</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Key Summary & Definition */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-400">1. Core Concept Summary</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{lessonData.definition}</p>
                  <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 font-bold border border-slate-800 mt-2">
                    {lessonData.formula}
                  </div>
                </div>

                {/* 2. Board Exam Questions */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400">2. Important Board Exam Questions</span>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>Find the discriminant D for 2x² - 4x + 3 = 0 and state nature of roots. (2 Marks)</li>
                    <li>Solve x² - 7x + 12 = 0 by quadratic formula with step-by-step proof. (5 Marks)</li>
                  </ul>
                </div>

                {/* 3. Revision Notes & Tricks */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-purple-400">3. Quick Revision Notes & Memory Trick</span>
                  <p className="text-xs text-purple-200">{lessonData.memoryTrick}</p>
                  <p className="text-xs text-rose-300 font-semibold mt-2">{lessonData.commonMistakes}</p>
                </div>

                {/* 4. Homework & Next Lesson */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-400">4. Homework Assignment & Next Steps</span>
                  <p className="text-xs text-slate-300">Homework: Solve Exercise 5.2 Questions 1 to 5 in your homework notebook.</p>
                  <div className="p-3 bg-blue-950/50 rounded-xl text-xs text-blue-300 font-bold border border-blue-800/60 mt-2">
                    🚀 Next Recommended Lesson: "Arithmetic Progressions & Nth Term Formula"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ CHECKPOINT */}
          {activeTab === 'quiz' && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="text-xs text-amber-300 font-black flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Practice Checkpoint Question generated by Vidya AI Teacher:</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">{lessonData.practiceQuestion.question}</h4>
                <div className="space-y-2">
                  {lessonData.practiceQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCheckAnswer(idx)}
                      className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        practiceAnswer === idx
                          ? idx === lessonData.practiceQuestion.correctIndex
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>

                {showPracticeResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <strong className="text-emerald-400">Vidya Teacher Explanation:</strong> {lessonData.practiceQuestion.explanation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
              {activeFlashcards.map((card) => {
                const isFlipped = flippedCard === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => setFlippedCard(isFlipped ? null : card.id)}
                    className="h-48 p-6 rounded-3xl bg-slate-950 text-white cursor-pointer shadow-lg flex flex-col justify-between hover:scale-[1.02] transition border border-slate-800"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-sky-400 font-extrabold flex items-center justify-between">
                      <span>{card.chapter}</span>
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-center font-bold text-sm text-amber-300 my-auto">
                      {isFlipped ? card.back : card.front}
                    </div>
                    <div className="text-[10px] text-center text-slate-500 font-semibold">
                      {isFlipped ? 'Tap to view Question' : 'Tap to flip & reveal Answer'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: CONCEPT MINDMAP */}
          {activeTab === 'mindmap' && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 animate-in fade-in space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-400 tracking-wider">Concept Hierarchy Map</span>
                <h3 className="text-base font-black text-white">{activeMindmap.label}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {activeMindmap.children?.map((child) => (
                  <div key={child.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
                    <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {child.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {child.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
