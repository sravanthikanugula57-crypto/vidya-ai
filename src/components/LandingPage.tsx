import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, LanguageCode } from '../types';
import { Floating3DEducationalHero } from './common/3d/Floating3DEducationalHero';
import { Modern3DCard } from './common/3d/Modern3DCard';
import { ThreeDAssistantOrb } from './common/3d/ThreeDAssistantOrb';
import { ThreeDSubjectIcon } from './common/3d/ThreeDSubjectIcon';
import { 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  Bot, 
  Volume2, 
  Camera, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  HeartHandshake, 
  Languages, 
  BrainCircuit, 
  Compass, 
  Zap,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  FileText,
  Smartphone,
  Trophy,
  MessageSquare,
  Flame,
  Clock,
  Lightbulb,
  ShieldCheck,
  Star,
  Layers,
  ArrowDown,
  X,
  Play,
  Share2,
  BarChart3,
  Search,
  BookCheck,
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  selectedLang: LanguageCode;
}

export interface ModalData {
  title: string;
  category: string;
  badge: string;
  description: string;
  diagramType: 'socratic' | 'refraction' | 'datasaver' | 'leaderboard' | 'blooms' | 'whatsapp' | 'network' | 'timeline' | 'ai_engine';
  details: string[];
  roleTarget?: UserRole;
  samplePrompt?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, selectedLang }) => {
  const [demoPrompt, setDemoPrompt] = useState('');
  const [demoResponse, setDemoResponse] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeModal, setActiveModal] = useState<ModalData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleRunDemo = async (queryText?: string) => {
    const query = queryText || demoPrompt || 'Explain why the sky is blue using a simple cricket or village example.';
    setDemoLoading(true);
    setDemoResponse(null);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, language: selectedLang, grade: 'Class 9', subject: 'Science' })
      });
      const data = await res.json();
      setDemoResponse(data.text);
    } catch (e) {
      setDemoResponse("Namaste! Imagine sunlight like a bowler throwing multi-colored cricket balls (colors of rainbow). The blue light balls are tiny and scatter easily off air particles, filling the sky with blue color!");
    } finally {
      setDemoLoading(false);
    }
  };

  const sampleQuestions = [
    "Explain Refraction of Light with a glass of water",
    "What is Quadratic Equation formula?",
    "How does Photosynthesis make oxygen?",
    "How to prepare for Class 10 Board Exam?"
  ];

  // Diagrams Renderer
  const renderDiagram = (type: ModalData['diagramType']) => {
    switch (type) {
      case 'refraction':
        return (
          <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Interactive Ray Optics Diagram</span>
              <span className="text-xs text-slate-400 font-mono">Snell's Law: n₁ sin(θ₁) = n₂ sin(θ₂)</span>
            </div>
            <div className="relative h-56 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Air medium top */}
                <rect x="0" y="0" width="400" height="100" fill="#0f172a" />
                <text x="15" y="25" fill="#94a3b8" fontSize="12" fontWeight="bold">Medium 1: Air (n₁ = 1.00)</text>
                
                {/* Glass medium bottom */}
                <rect x="0" y="100" width="400" height="100" fill="#1e293b" />
                <text x="15" y="185" fill="#38bdf8" fontSize="12" fontWeight="bold">Medium 2: Glass Slab / Water (n₂ = 1.52)</text>

                {/* Interface line */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />

                {/* Normal line */}
                <line x1="200" y1="10" x2="200" y2="190" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x="205" y="30" fill="#64748b" fontSize="10">Normal Line</text>

                {/* Incident ray */}
                <line x1="60" y1="20" x2="200" y2="100" stroke="#f59e0b" strokeWidth="3" className="animate-pulse" />
                <circle cx="60" cy="20" r="4" fill="#f59e0b" />
                <text x="70" y="35" fill="#f59e0b" fontSize="11" fontWeight="bold">Incident Light Ray (θ₁ = 50°)</text>

                {/* Refracted ray */}
                <line x1="200" y1="100" x2="290" y2="180" stroke="#06b6d4" strokeWidth="3" />
                <circle cx="290" cy="180" r="4" fill="#06b6d4" />
                <text x="210" y="150" fill="#06b6d4" fontSize="11" fontWeight="bold">Refracted Ray (θ₂ = 30°)</text>

                {/* Point of Incidence */}
                <circle cx="200" cy="100" r="6" fill="#ef4444" />
              </svg>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              <b>Physics Principle:</b> When light passes from a rarer medium (Air) into a denser medium (Glass), its speed slows down and bends <i>towards the normal</i>.
            </p>
          </div>
        );

      case 'socratic':
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Socratic Voice Learning Tree</span>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border-l-4 border-blue-500">
                <span className="text-blue-400 font-bold block">🎙️ Student Telugu Voice Input:</span>
                "అక్కా! కిరణజన్య సంయోగ క్రియ (Photosynthesis) అంటే ఏమిటి?"
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border-l-4 border-amber-500">
                <span className="text-amber-400 font-bold block">💡 VidyaAI Socratic Hint #1:</span>
                "మంచి ప్రశ్న! మన ఇంట్లో వంట వండడానికి బియ్యం, నీళ్లు, పొయ్యి వేడి కావాలి కదా. అలాగే మొక్క ఆకు తన ఆహారం వండడానికి ఏమేమి తీసుకుంటుందో చెప్పు?"
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border-l-4 border-emerald-500">
                <span className="text-emerald-400 font-bold block">✨ Student Eureka Answer:</span>
                "సూర్యరశ్మి, గాలిలోని కార్బన్ డైయాక్సైడ్, వేర్ల ద్వారా నీరు!"
              </div>
            </div>
          </div>
        );

      case 'datasaver':
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">2G Packet Compression Pipeline</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <div className="font-bold text-slate-300">Textbook Image</div>
                <div className="text-[10px] text-red-400">4.2 MB (Raw)</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800">
                <div className="font-bold text-emerald-300">Gemini OCR + Vector</div>
                <div className="text-[10px] text-emerald-400">Compressed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <div className="font-bold text-sky-300">2G Mobile Sync</div>
                <div className="text-[10px] text-emerald-400">18 KB (Ultra-fast)</div>
              </div>
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block">Mandal & District Hierarchy</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/80 border border-amber-800">
                <span className="font-bold text-amber-300">🥇 AP SSC State Rank #1</span>
                <span className="font-black text-amber-400">12,450 XP</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="font-bold text-sky-300">🏅 Medak District Rank #3</span>
                <span className="font-black text-sky-400">9,820 XP</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="font-bold text-slate-300">🏫 ZPHS Medak High School</span>
                <span className="font-black text-slate-400">4,150 XP</span>
              </div>
            </div>
          </div>
        );

      case 'blooms':
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Bloom's Taxonomy Assessment Weights</span>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-indigo-900/80 font-bold text-indigo-200 flex justify-between">
                <span>1. Creating & Evaluating</span>
                <span>20% Marks</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-900/80 font-bold text-blue-200 flex justify-between">
                <span>2. Analyzing & Applying</span>
                <span>40% Marks</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-900/80 font-bold text-emerald-200 flex justify-between">
                <span>3. Understanding & Remembering</span>
                <span>40% Marks</span>
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">WhatsApp Native Voice Audio Visualizer</span>
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 space-y-3">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition"
                >
                  {isPlayingAudio ? <Activity className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="h-2 bg-emerald-900 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-400 ${isPlayingAudio ? 'w-3/4 transition-all duration-3000' : 'w-1/4'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-300 mt-1 font-mono">
                    <span>{isPlayingAudio ? '0:28' : '0:00'}</span>
                    <span>0:45</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-100 italic">
                "నమస్తే! మీ కుమార్తె ఈ వారం గణితంలో 94% మార్కులు సాధించింది."
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
            <div className="text-xs font-bold text-slate-200">Interactive VidyaAI Module Active</div>
            <p className="text-[11px] text-slate-400">Integrated directly with Gemini 3.6 Socratic Intelligence Engine.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
          <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-blue-500 blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-sky-400 blur-[140px] animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-indigo-500 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm cursor-pointer hover:bg-blue-100 transition"
              onClick={() => setActiveModal({
                title: "National Mission for Rural AI Literacy",
                category: "Government Mission",
                badge: "State Level Initiative",
                description: "Delivering free, equal, high-quality Socratic AI tutoring to every ZPHS and government school child in Telangana, Andhra Pradesh, and across India.",
                diagramType: "network",
                details: [
                  "100% Free with zero subscription charges for government school children",
                  "8 Indian regional language support with voice synthesizer",
                  "Optimized for 2G network bandwidth & low-tier Android phones"
                ]
              })}
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>National Mission: Free AI Education for Every Government School Child (Click for Details)</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]">
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Learn Smarter. Grow Further.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              The modern Socratic learning platform built for <b>State Board & Government School Students</b>. Real-time homework assistance, syllabus-aligned chapter mastery, interactive practice sets, and AI-assisted doubt solving in regional languages.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectRole('student')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-2xl transition duration-300 flex items-center space-x-2 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const exploreSection = document.getElementById('curriculum-explorer');
                  if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onSelectRole('student');
                  }
                }}
                className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Explore Learning</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectRole('teacher')}
                className="px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Faculty Portal</span>
              </motion.button>
            </div>

            {/* 3D Floating Educational Environment Canvas */}
            <div className="pt-6 relative">
              <Floating3DEducationalHero onInteract={() => onSelectRole('student')} />
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600" onClick={() => onSelectRole('student')}><CheckCircle className="w-4 h-4 text-emerald-500" /> 100% Free Forever</span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600" onClick={() => setActiveModal({
                title: "2G Bandwidth Data Saver Engine",
                category: "Technology",
                badge: "Rural Connectivity",
                description: "Ensures seamless learning in remote villages with low internet connection.",
                diagramType: "datasaver",
                details: ["Reduces data consumption by 85%", "Caches textbook pages locally", "Voice packet optimization"]
              })}><CheckCircle className="w-4 h-4 text-emerald-500" /> Low 2G Bandwidth Saver</span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600" onClick={() => onSelectRole('student')}><CheckCircle className="w-4 h-4 text-emerald-500" /> 8 Indian Regional Languages</span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600" onClick={() => onSelectRole('student')}><CheckCircle className="w-4 h-4 text-emerald-500" /> State Syllabus Aligned</span>
            </div>
          </div>

          {/* Interactive AI Tutor Preview Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="mt-12 max-w-3xl mx-auto rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl shadow-blue-500/10"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    Try VidyaAI Live Demo
                    <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
                      Socratic Tutor
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ask any question in Science, Math, or English in your language
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400">
                <Languages className="w-4 h-4 text-blue-500" />
                <span>English • తెలుగు • हिन्दी</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDemoPrompt(q);
                    handleRunDemo(q);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  💡 {q}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Ask Vidya Teacher e.g. How does photosynthesis work?"
                value={demoPrompt}
                onChange={(e) => setDemoPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunDemo()}
                className="w-full pl-4 pr-32 py-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <button
                onClick={() => handleRunDemo()}
                disabled={demoLoading}
                className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                {demoLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Teaching...
                  </span>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Zap className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {demoResponse && (
              <div className="mt-6 p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-blue-200/40 dark:border-slate-700">
                  <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Vidya Teacher Explanation:
                  </span>
                  <button 
                    onClick={() => onSelectRole('student')}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    Open Full Chat in Portal →
                  </button>
                </div>
                <p className="whitespace-pre-line font-medium text-xs sm:text-sm">
                  {demoResponse}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. TRUSTED BY SCHOOLS */}
      <section className="py-12 bg-slate-100/80 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
            TRUSTED & ALIGNED WITH GOVERNMENT SCHOOL NETWORKS (CLICK ANY CARD FOR DIAGRAM & SPECS)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center justify-center">
            {[
              { name: "ZPHS High Schools", desc: "Zilla Parishad Network", badge: "Primary Partner" },
              { name: "Government High Schools", desc: "GHS AP & SSC Board", badge: "State Board" },
              { name: "PM SHRI Schools", desc: "Excellence Initiative", badge: "Central Govt" },
              { name: "Model Schools", desc: "State Model Network", badge: "Model Curriculum" },
              { name: "KGBV Schools", desc: "Kasturba Vidyalayas", badge: "Empowerment" },
              { name: "SCERT / NCERT", desc: "State Curriculum Aligned", badge: "Syllabus Aligned" }
            ].map((school, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveModal({
                  title: `${school.name} AI Integration`,
                  category: "School Network",
                  badge: school.badge,
                  description: `Full integration for ${school.name} across State Board syllabus modules, digital classrooms, and teacher co-pilot suites.`,
                  diagramType: "network",
                  details: [
                    "Direct alignment with SCERT Telangana & Andhra Pradesh textbooks",
                    "Localized dialect tuning for rural student comprehension",
                    "Classroom question bank & test paper auto-generator"
                  ],
                  roleTarget: 'teacher'
                })}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-blue-500 hover:shadow-lg transition cursor-pointer shadow-sm"
              >
                <div className="font-black text-xs text-slate-800 dark:text-slate-200">{school.name}</div>
                <div className="text-[10px] text-slate-500">{school.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES WITH INTERACTIVE DIAGRAMS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Purpose-Built Features for Rural & State Board Education
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            Click any feature card below to open its interactive visual diagram & full specifications!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Bot className="w-6 h-6 text-blue-600" />,
              bg: "bg-blue-50 dark:bg-blue-950/50",
              title: "Multilingual Socratic Voice Tutor",
              desc: "Students speak doubts directly in Telugu, Hindi, or English. Vidya Teacher guides with progressive hints and simple village analogies.",
              modal: {
                title: "Multilingual Socratic Voice Tutor",
                category: "AI Pedagogy",
                badge: "Voice Enabled",
                description: "Uses Socratic scaffolding to guide students to answers through interactive dialogue in Telugu, Hindi, and English.",
                diagramType: "socratic" as const,
                details: [
                  "Supports real-time Telugu, Hindi, and English speech recognition",
                  "Generates real-life village analogies (cricket, farming, cooking)",
                  "Never reveals direct homework answers — builds critical thinking"
                ],
                roleTarget: 'student' as UserRole
              }
            },
            {
              icon: <Camera className="w-6 h-6 text-sky-600" />,
              bg: "bg-sky-50 dark:bg-sky-950/50",
              title: "Photo Homework Camera Scan",
              desc: "Snap a photo of handwritten math equations or textbook diagrams like Refraction of Light to get instant step-by-step ray optic visualizers.",
              modal: {
                title: "Photo Homework Optics & Diagram Scanner",
                category: "Vision AI",
                badge: "Gemini Vision",
                description: "Scans textbook equations and physics diagrams to output clear, labeled Snell's law ray optic diagrams.",
                diagramType: "refraction" as const,
                details: [
                  "Recognizes Telugu & English printed textbook diagrams",
                  "Computes Snell's law angle calculations automatically",
                  "Generates interactive step-by-step vector ray diagrams"
                ],
                roleTarget: 'student' as UserRole
              }
            },
            {
              icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
              bg: "bg-emerald-50 dark:bg-emerald-950/50",
              title: "2G Low Bandwidth Data Saver",
              desc: "Optimized for rural connectivity. Compresses audio data and caches core textbook diagrams locally on basic Android smartphones.",
              modal: {
                title: "2G Rural Bandwidth Compression Engine",
                category: "Infrastructure",
                badge: "Data Saver",
                description: "Optimized engine that compresses vector diagrams and audio speech streams for 2G network stability.",
                diagramType: "datasaver" as const,
                details: [
                  "Compresses 4MB textbook images down to 18KB vector graphics",
                  "Local offline caching for previously opened textbook topics",
                  "Zero delay audio playback on basic 2G/3G mobile networks"
                ],
                roleTarget: 'student' as UserRole
              }
            },
            {
              icon: <Flame className="w-6 h-6 text-amber-600" />,
              bg: "bg-amber-50 dark:bg-amber-950/50",
              title: "Gamified Village Leaderboards",
              desc: "Earn daily streak flames, XP points, and coins. Unlock badges and compare ranks on school, Mandal, District, and State leaderboards.",
              modal: {
                title: "Village & State Gamified Leaderboard",
                category: "Gamification",
                badge: "Rankings",
                description: "Encourages daily practice with XP rewards, village badges, and healthy competition across Mandal and District ranks.",
                diagramType: "leaderboard" as const,
                details: [
                  "Tracks school, Mandal, District, and State leaderboard positions",
                  "Earn XP coins for completing daily SCERT textbook quizzes",
                  "Maintain daily learning streak flames"
                ],
                roleTarget: 'student' as UserRole
              }
            },
            {
              icon: <FileText className="w-6 h-6 text-indigo-600" />,
              bg: "bg-indigo-50 dark:bg-indigo-950/50",
              title: "10-Second Question Paper Generator",
              desc: "Teachers generate 20-mark unit test papers aligned strictly with Bloom's Taxonomy ready for instant printing.",
              modal: {
                title: "Bloom's Taxonomy Test Paper Generator",
                category: "Teacher Suite",
                badge: "20 Marks Paper",
                description: "Generates balanced unit test papers categorized by Remembering, Applying, and Analyzing sections.",
                diagramType: "blooms" as const,
                details: [
                  "Generates 20-mark unit test papers in under 10 seconds",
                  "Strict compliance with State Board & SCERT standards",
                  "Includes answer keys and marking rubrics for teachers"
                ],
                roleTarget: 'teacher' as UserRole
              }
            },
            {
              icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
              bg: "bg-purple-50 dark:bg-purple-950/50",
              title: "WhatsApp Native Voice Reports",
              desc: "Parents with low literacy tap one button to hear weekly student progress audio updates in Telugu, Hindi, or their regional language.",
              modal: {
                title: "WhatsApp Native Voice Progress Reports",
                category: "Parent Portal",
                badge: "Audio Report",
                description: "Delivers weekly voice audio updates in Telugu, Hindi, or English directly to parent mobile numbers.",
                diagramType: "whatsapp" as const,
                details: [
                  "Requires zero reading literacy for parents",
                  "Tracks daily study hours & subject-wise test percentages",
                  "Alerts parents regarding government NMMS scholarship eligibility"
                ],
                roleTarget: 'parent' as UserRole
              }
            }
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveModal(f.modal)}
              className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-blue-500 transition duration-300 space-y-4 cursor-pointer relative group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                  Click for Diagram 📊
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. HOW AI WORKS */}
      <section className="py-20 bg-slate-100/90 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Socratic AI Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How VidyaAI Guides Students in 4 Simple Steps
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              Click any step below to explore its interactive workflow diagram!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: "01",
                title: "Ask Any Doubt",
                desc: "Type, speak in Telugu/Hindi, or snap a photo of textbook math or science homework.",
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                diagramType: "socratic" as const
              },
              {
                step: "02",
                title: "Curriculum Context",
                desc: "Gemini 3.6 AI matches the question against State Board syllabus standards and grade level.",
                icon: <Layers className="w-6 h-6 text-sky-600" />,
                diagramType: "blooms" as const
              },
              {
                step: "03",
                title: "Guided Socratic Hints",
                desc: "AI gives step-by-step hints and real-world analogies (e.g., cricket, farming, glass of water).",
                icon: <Lightbulb className="w-6 h-6 text-amber-600" />,
                diagramType: "refraction" as const
              },
              {
                step: "04",
                title: "Concept Mastery & XP",
                desc: "Student solves the problem independently, earns XP coins, and builds lasting confidence.",
                icon: <Trophy className="w-6 h-6 text-emerald-600" />,
                diagramType: "leaderboard" as const
              }
            ].map((s, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveModal({
                  title: `Step ${s.step}: ${s.title}`,
                  category: "Socratic AI Engine",
                  badge: `Step ${s.step}`,
                  description: s.desc,
                  diagramType: s.diagramType,
                  details: [
                    "Contextualized for Class 6 to 12 State Syllabus",
                    "Voice-first speech recognition and synthesis",
                    "Promotes independent problem-solving skills"
                  ],
                  roleTarget: 'student'
                })}
                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 cursor-pointer hover:border-emerald-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                    {s.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700">{s.step}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STUDENT JOURNEY */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Daily Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            A Day in the Life of a VidyaAI Student
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            Click any timeline card below to open its detailed schedule & features!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              time: "7:30 AM",
              label: "Morning Prep",
              title: "Bite-Sized Review",
              desc: "5-minute audio overview of today's Science topic before boarding the school bus.",
              color: "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30",
              diagramType: "socratic" as const
            },
            {
              time: "1:00 PM",
              label: "School Lab",
              title: "Classroom Companion",
              desc: "Interactive experiment guide using local materials (glass, leaf, coin) during lab hour.",
              color: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30",
              diagramType: "refraction" as const
            },
            {
              time: "5:30 PM",
              label: "Homework Time",
              title: "Photo Doubt Solver",
              desc: "Snap a photo of Class 9 Math homework to get progressive hints and step explanations.",
              color: "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30",
              diagramType: "refraction" as const
            },
            {
              time: "8:00 PM",
              label: "Night Review",
              title: "District Streak & Rank",
              desc: "Review daily mistakes, check village leaderboard rank, and maintain 12-day streak flame.",
              color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30",
              diagramType: "leaderboard" as const
            }
          ].map((j, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveModal({
                title: `${j.time} - ${j.title}`,
                category: j.label,
                badge: j.time,
                description: j.desc,
                diagramType: j.diagramType,
                details: [
                  "Designed for rural student morning and evening routines",
                  "Zero data latency with cached audio and diagrams",
                  "Encourages habit-forming daily learning streaks"
                ],
                roleTarget: 'student'
              })}
              className={`p-6 rounded-3xl border-2 ${j.color} shadow-sm space-y-3 relative cursor-pointer hover:shadow-xl transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{j.label}</span>
                <span className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-[10px] font-black text-slate-800 dark:text-slate-200 shadow-sm">{j.time}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{j.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{j.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. TEACHER SECTION */}
      <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Empowering Educators</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Save 10+ Hours Every Week on Question Papers & Lesson Plans
              </h2>

              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                VidyaAI gives government school teachers an intelligent co-pilot. Instantly generate Bloom's Taxonomy test papers, zero-cost lab experiment plans, and track class weak areas automatically.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "10-second printable 20-mark unit test question paper generator",
                  "Classroom zero-cost lab guides using locally available materials",
                  "Automated weak-area diagnosis flagging difficult sub-topics"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectRole('teacher')}
                  className="px-8 py-4 rounded-2xl bg-white text-emerald-950 font-extrabold text-sm shadow-xl hover:bg-emerald-50 transition flex items-center space-x-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Launch Teacher Portal</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </motion.button>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveModal({
                title: "Bloom's Taxonomy Test Generator Suite",
                category: "Teacher Co-Pilot",
                badge: "20 Marks Unit Test",
                description: "Generates SCERT aligned 20-mark unit test papers with question distribution across Remembering, Applying, and Analyzing sections.",
                diagramType: "blooms",
                details: [
                  "Instant 10-second PDF export ready for printing",
                  "Auto-generates marking rubric and answer keys",
                  "Diagnoses weak sub-topics across Class 6 to 10"
                ],
                roleTarget: 'teacher'
              })}
              className="p-8 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-6 shadow-2xl cursor-pointer hover:border-emerald-400 transition"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Bloom's Taxonomy Test Generator</h4>
                    <p className="text-[11px] text-emerald-300">ZPHS Class 9 Science • 20 Marks Paper (Click to Inspect)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-full font-bold">Ready to Print</span>
              </div>

              <div className="space-y-3 text-xs text-emerald-100">
                <div className="p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-800">
                  <div className="font-bold text-emerald-200 mb-1">Section A: Remembering (4 Marks)</div>
                  <p>1. Define Refraction of light and give one example observed in daily life.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-800">
                  <div className="font-bold text-emerald-200 mb-1">Section B: Application (8 Marks)</div>
                  <p>2. A pencil placed in a glass of water appears bent. Draw ray diagram and explain using Snell's Law.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. PARENT SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveModal({
              title: "WhatsApp Native Voice Progress Reports",
              category: "Parent Portal",
              badge: "Telugu Audio Report",
              description: "Sends weekly spoken audio progress reports directly to WhatsApp so parents don't need to read English or complex charts.",
              diagramType: "whatsapp",
              details: [
                "Spoken in Telugu, Hindi, or English regional accents",
                "Monitors study hours and attendance",
                "Informs parents regarding NMMS scholarship eligibility"
              ],
              roleTarget: 'parent'
            })}
            className="p-8 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-6 shadow-lg order-2 lg:order-1 cursor-pointer hover:border-purple-500 transition"
          >
            <div className="flex items-center space-x-3 pb-4 border-b border-purple-200 dark:border-purple-900">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-purple-900 dark:text-purple-100">WhatsApp Native Voice Report</h4>
                <p className="text-xs text-purple-700 dark:text-purple-300">Telugu / Hindi Audio Summaries for Parents (Click to Inspect)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🔊 Progress Audio Message</span>
                <span className="text-[10px] text-emerald-600 font-bold">0:45 min</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "నమస్తే! మీ కుమార్తె ఈ వారం సైన్స్ లో 3 గంటలు చదివింది. క్లాస్ 9 మ్యాథ్స్ లో 94% మార్కులు సాధించింది."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-center">
                <div className="text-2xl font-black text-purple-600">45 Mins</div>
                <div className="text-[10px] text-slate-500 font-semibold">Today's Study Time</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-center">
                <div className="text-2xl font-black text-emerald-600">NMMS Alert</div>
                <div className="text-[10px] text-slate-500 font-semibold">Scholarship Eligible</div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Parent Inclusion</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              No Language or Literacy Barriers Between Parents & Education
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Parents don't need to read English to guide their child. VidyaAI sends audio summaries in Telugu, Hindi, or local dialect directly to WhatsApp or app.
            </p>

            <div className="space-y-3">
              {[
                "One-tap voice audio reports spoken in native regional languages",
                "Daily study time meter & school attendance monitoring",
                "Automated government scholarship notifications (NMMS, PM YASASVI)"
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectRole('parent')}
                className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 transition flex items-center space-x-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Launch Parent Portal</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. STATISTICS */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-sky-100">
              NATIONAL MISSION IMPACT AT A GLANCE (CLICK FOR DISTRICT SPECS)
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "1,200+", label: "Government Schools Onboarded", badge: "ZPHS Network" },
              { num: "450,000+", label: "Active Student Learners", badge: "Class 6-12" },
              { num: "8", label: "Indian Regional Languages", badge: "Voice Enabled" },
              { num: "100%", label: "Free & Equal Access", badge: "Non-Profit" }
            ].map((st, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal({
                  title: `${st.num} ${st.label}`,
                  category: "Impact Metric",
                  badge: st.badge,
                  description: `Real-time analytics across District Educational Officer (DEO) dashboards and school networks.`,
                  diagramType: "network",
                  details: [
                    "Monitored by District Educational Officers (DEO)",
                    "SCERT curriculum alignment verified",
                    "100% data privacy compliance"
                  ],
                  roleTarget: 'admin'
                })}
                className="space-y-1 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 cursor-pointer hover:bg-white/20 transition"
              >
                <div className="text-3xl sm:text-5xl font-black tracking-tight">{st.num}</div>
                <div className="text-sky-100 text-xs sm:text-sm font-semibold">{st.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is VidyaAI really 100% free for government school students?",
              a: "Yes! VidyaAI is built as a non-profit government & edtech initiative. Every student, teacher, and parent from ZPHS, GHS, and government schools across India can access it free with zero subscription fees."
            },
            {
              q: "Does it work in remote villages with weak 2G/3G mobile internet?",
              a: "Yes. VidyaAI includes a dedicated Low Bandwidth Data Saver Mode. It compresses voice data and caches core diagrams so it loads smoothly even on low-end Android phones and basic connectivity."
            },
            {
              q: "Which subjects and state board syllabi are covered?",
              a: "Mathematics, Physical & Biological Sciences, English, Telugu, Hindi, Social Studies, Computer Science, Python Coding, AI Basics, and Financial Literacy for Classes 6 to 12."
            },
            {
              q: "Does the AI Tutor give away direct homework answers?",
              a: "No! Vidya Teacher is trained on Socratic pedagogy. It guides students step-by-step with progressive hints, real-life analogies, and practice questions so they genuinely learn instead of copying."
            },
            {
              q: "How do teachers register their government school or district?",
              a: "Teachers and District Educational Officers can click the 'Teacher & Officer Login' button to automatically verify their UDISE school code and access class analytics immediately."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>VidyaAI Portal</span>
            </div>
            <p className="text-xs text-slate-500">
              Transforming Indian Government School Education through accessible, equal AI technology.
            </p>
          </div>

          <div className="flex flex-wrap items-center space-x-6 text-xs font-medium">
            <button onClick={() => onSelectRole('student')} className="hover:text-white transition cursor-pointer">Student Portal</button>
            <button onClick={() => onSelectRole('teacher')} className="hover:text-white transition cursor-pointer">Teacher Portal</button>
          </div>

          <div className="text-xs text-slate-500">
            © 2026 VidyaAI National Mission • Powered by Gemini 3.6 AI & Firebase
          </div>
        </div>
      </footer>

      {/* DETAILED INTERACTIVE DIAGRAM & SPECS MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto p-6 sm:p-8 space-y-6"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {activeModal.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeModal.badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {activeModal.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModal.description}
                </p>
              </div>

              {/* Dynamic Diagram Render */}
              <div className="mt-4">
                {renderDiagram(activeModal.diagramType)}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Key Capabilities & Standards</h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {activeModal.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const role = activeModal.roleTarget || 'student';
                    setActiveModal(null);
                    onSelectRole(role);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Launch Module in {activeModal.roleTarget ? activeModal.roleTarget.toUpperCase() : 'STUDENT'} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition cursor-pointer"
                >
                  Close Diagram
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
