import React, { useState, useEffect } from 'react';
import { Modern3DCard } from '../../common/3d/Modern3DCard';
import { ThreeDCareerIcon } from '../../common/3d/ThreeDCareerIcon';
import { 
  Compass, 
  GraduationCap, 
  Award, 
  Sparkles, 
  Briefcase, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Heart, 
  Gamepad2, 
  HelpCircle, 
  Lightbulb, 
  Filter, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Landmark,
  Layers,
  Database
} from 'lucide-react';
import { CAREER_DATABASE, CAREER_CATEGORIES } from '../../../data/careerData';
import { CareerCategory, CareerItem } from '../../../types/career';
import { CareerDetailModal } from '../career/CareerDetailModal';
import { CareerInterestModal } from '../career/CareerInterestModal';
import { GuessTheCareerModal } from '../career/GuessTheCareerModal';
import { CareerQuizModal } from '../career/CareerQuizModal';
import { SkillChallengeModal } from '../career/SkillChallengeModal';
import { soundFx } from '../../../lib/audio';

const STORAGE_SAVED_CAREERS_KEY = 'vidya_saved_career_interests';

export const CareerGuidanceView: React.FC = () => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | 'all'>('all');
  
  // Saved Careers (defaults to Scientist and Engineer as specified)
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_CAREERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return ['scientist', 'software_engineer'];
  });

  // Modals & Active Selections
  const [selectedCareerForModal, setSelectedCareerForModal] = useState<CareerItem | null>(null);
  const [activeActivityModal, setActiveActivityModal] = useState<'interest' | 'guess' | 'quiz' | 'skill' | null>(null);

  // Grade/Age level tab for tailored govt school stream guidance
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'1-5' | '6-8' | '9-10' | '11-12'>('9-10');

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_CAREERS_KEY, JSON.stringify(savedCareerIds));
    } catch {
      // ignore
    }
  }, [savedCareerIds]);

  const handleToggleSave = (careerId: string) => {
    soundFx.playClick();
    setSavedCareerIds((prev) => 
      prev.includes(careerId) ? prev.filter((id) => id !== careerId) : [...prev, careerId]
    );
  };

  // Filtered Careers
  const filteredCareers = CAREER_DATABASE.filter((career) => {
    const matchesCategory = selectedCategory === 'all' || career.category === selectedCategory;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (career.title || '').toLowerCase().includes(q) ||
      (career.description || '').toLowerCase().includes(q) ||
      (career.suitableSubjects || []).some((s) => (s || '').toLowerCase().includes(q)) ||
      (career.keySkills || []).some((k) => (k || '').toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Recommended careers (based on saved interests or popular STEM/Government tracks)
  const recommendedCareers = CAREER_DATABASE.filter((c) => 
    c.id === 'scientist' || c.id === 'software_engineer' || c.id === 'doctor' || c.id === 'agricultural_scientist'
  );

  // Saved career objects
  const savedCareers = CAREER_DATABASE.filter((c) => (savedCareerIds || []).includes(c.id));

  const guidanceData = {
    '1-5': {
      title: 'Classes 1 to 5: Learning Motivation & Curiosity Building',
      desc: 'Developing strong foundational reading, numeracy, spatial thinking, and problem-solving through play-based science experiments and story-based learning.',
      pathways: [
        { title: 'STEM Curiosity & Math Games', details: 'Interactive puzzles, mental arithmetic, nature science observation.' },
        { title: 'Language Fluency in Telugu & English', details: 'Phonetics, storytelling, reading aloud, basic sentence building.' },
        { title: 'Digital Literacy Basics', details: 'Learning typing, basic computer navigation, and safe technology habits.' }
      ]
    },
    '6-8': {
      title: 'Classes 6 to 8: Early Career & Skill Exploration',
      desc: 'Discovering interest areas across Science, Mathematics, Technology, Arts, Sports, and Agriculture through hands-on projects and Olympiad preparation.',
      pathways: [
        { title: 'National Means-cum-Merit Scholarship (NMMS)', details: 'Special coaching for Class 8 NMMS exam giving ₹12,000/year for Class 9-12.' },
        { title: 'Intro to Coding & Artificial Intelligence', details: 'Scratch block coding, Python fundamentals, logic building.' },
        { title: 'Vocational Skill Workshops', details: 'Electronics, carpentry basics, agriculture science, financial savings.' }
      ]
    },
    '9-10': {
      title: 'Classes 9 & 10: Stream Selection & Competitive Foundations',
      desc: 'Preparing for State Board SSC exams, choosing Senior Secondary streams (MPC, BiPC, CEC, HEC, Vocational), and applying for premier government institutions.',
      pathways: [
        { title: 'MPC Stream (Maths, Physics, Chemistry)', details: 'Pathways: IIT-JEE, Engineering, B.Sc Data Science, Defense (NDA), Architecture.' },
        { title: 'BiPC Stream (Biology, Physics, Chemistry)', details: 'Pathways: NEET Medical, Agricultural B.Sc, Biotechnology, Pharmacy, Nursing.' },
        { title: 'CEC / HEC Stream (Commerce & Humanities)', details: 'Pathways: Chartered Accountancy (CA), Civil Services (UPSC), Law (CLAT), Economics.' },
        { title: 'AP Model Schools & APRJC / AP-POLYCET Entrance', details: 'Free residential high-quality 11th & 12th coaching with hostel facilities.' }
      ]
    },
    '11-12': {
      title: 'Classes 11 & 12: Higher Education & Scholarship Guidance',
      desc: 'Targeted entrance exam preparation, government degree college applications, skills training, and central scholarship applications.',
      pathways: [
        { title: 'Central & State Govt Entrance Exams', details: 'AP EAPCET, JEE Main, NEET, CUET UG, NDA, Merchant Navy.' },
        { title: 'PM YASASVI & Post-Matric Scholarships', details: 'Full tuition fee reimbursement for government school graduates.' },
        { title: 'Skill Development & Poly-Technic Diplomas', details: '3-Year Polytechnic Engineering, ITI certification, Digital Marketing.' }
      ]
    }
  };

  const currentGroup = guidanceData[selectedAgeGroup];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      
      {/* 1. HERO SECTION: CAREER GUIDANCE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-yellow-300 text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>VidyaAI Career Compass</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            CAREER GUIDANCE
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed max-w-xl">
            Discover what you enjoy. <br />
            Explore different careers. <br />
            Learn the skills behind them.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveActivityModal('interest');
              }}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 hover:bg-yellow-300 hover:text-indigo-950 font-black text-sm transition shadow-lg flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Discover My Interests</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                const el = document.getElementById('explore-careers-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition cursor-pointer backdrop-blur"
            >
              Browse All Careers ({CAREER_DATABASE.length})
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-10 text-8xl opacity-20 pointer-events-none select-none hidden md:block">
          🚀
        </div>
      </div>

      {/* 2. 🎮 CAREER ACTIVITIES (Interactive Mini-Games) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-lg">
              🎮
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Career Activities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Engage in fun interactive challenges to test your career knowledge and aptitude
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Activity 1: Guess the Career */}
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveActivityModal('guess');
            }}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-left transition transform hover:-translate-y-1 shadow-lg shadow-orange-500/20 cursor-pointer space-y-3 relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              🔍
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">Mystery Detective</span>
              <h3 className="text-lg font-black mt-0.5 flex items-center justify-between">
                <span>Guess the Career</span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-xs text-amber-100/90 mt-1 line-clamp-2">
                Uncover mystery careers using daily workplace tools, secret clues, and dilemmas!
              </p>
            </div>
          </button>

          {/* Activity 2: Career Quiz */}
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveActivityModal('quiz');
            }}
            className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-left transition transform hover:-translate-y-1 shadow-lg shadow-indigo-500/20 cursor-pointer space-y-3 relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📝
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">Holland Aptitude</span>
              <h3 className="text-lg font-black mt-0.5 flex items-center justify-between">
                <span>Career Quiz</span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-xs text-blue-100/90 mt-1 line-clamp-2">
                Answer 5 holistic personality questions to find your exact career track match.
              </p>
            </div>
          </button>

          {/* Activity 3: Skill Challenge */}
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveActivityModal('skill');
            }}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-left transition transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20 cursor-pointer space-y-3 relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">Workplace Simulation</span>
              <h3 className="text-lg font-black mt-0.5 flex items-center justify-between">
                <span>Skill Challenge</span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1 line-clamp-2">
                Solve real micro-problems in coding, agronomy, structural design, and governance!
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* 3. 💡 RECOMMENDED FOR YOU */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 dark:from-slate-800/80 dark:to-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
              💡
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Recommended for You</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Curated
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Based on the subjects and activities you enjoy in school
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveActivityModal('interest');
              }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize Matches</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                const el = document.getElementById('explore-careers-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Careers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Recommendation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {recommendedCareers.map((c) => {
            const isSaved = savedCareerIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCareerForModal(c);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl group-hover:scale-110 transition">{c.emoji}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(c.id);
                      }}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title={isSaved ? 'Saved' : 'Save to Interests'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {c.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.recommendedStream} Stream</span>
                  <span className="text-slate-400 font-semibold flex items-center gap-0.5 group-hover:text-indigo-600">
                    Roadmap <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 🧠 MY INTERESTS (Saved Careers) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-lg">
              🧠
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>My Interests</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  {savedCareers.length} Saved
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Careers you've saved for future roadmap tracking and subject preparation
              </p>
            </div>
          </div>

          {savedCareers.length > 0 && (
            <button
              onClick={() => {
                soundFx.playClick();
                setSavedCareerIds([]);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {savedCareers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedCareers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCareerForModal(c);
                }}
                className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 hover:border-rose-400 transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition">{c.emoji}</span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-rose-500 text-xs">❤️</span>
                      <span>{c.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.salaryRange.split('–')[0]} entry | {c.recommendedStream}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(c.id);
                    }}
                    className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 transition cursor-pointer"
                    title="Remove from Saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-xs font-bold text-slate-500">No saved careers yet</div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Click the ❤️ heart icon on any career below to save it to your interest board.
            </p>
          </div>
        )}
      </div>

      {/* 5. 🌟 EXPLORE CAREERS (Search & Category Filter Grid) */}
      <div id="explore-careers-section" className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-lg">
              🌟
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Explore Careers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse detailed roadmaps, entrance exams, and scholarships across all career disciplines
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills, subjects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CAREER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                <span>{cat.iconEmoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Careers Grid */}
        {filteredCareers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCareers.map((career) => {
              const isSaved = savedCareerIds.includes(career.id);
              return (
                <Modern3DCard
                  key={career.id}
                  depth={15}
                  glare={true}
                  className="rounded-3xl"
                >
                  <div
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCareerForModal(career);
                    }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between group space-y-4 h-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <ThreeDCareerIcon careerId={career.id} size="md" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {career.category}
                            </span>
                            <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                              {career.title}
                            </h3>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(career.id);
                          }}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            isSaved
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-600'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                          }`}
                          title={isSaved ? 'Remove from Saved' : 'Save to Interests'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {career.description}
                      </p>

                      {/* Key skills pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {career.keySkills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Package</div>
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                          {career.salaryRange.split('–')[0]}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold group-hover:translate-x-1 transition">
                        <span>View Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Modern3DCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No careers found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or selecting "All Careers".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 6. AP GOVT SCHOOL AGE-APPROPRIATE STREAM & SCHOLARSHIP NAVIGATOR */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>AP Government School Stream & Scholarship Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grade-by-grade academic pathways, entrance exams (NMMS, POLYCET, APRJC), and central scholarships
            </p>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {[
              { id: '1-5', label: 'Primary (1–5)' },
              { id: '6-8', label: 'Middle (6–8)' },
              { id: '9-10', label: 'High School (9–10)' },
              { id: '11-12', label: 'Senior (11–12)' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedAgeGroup(btn.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedAgeGroup === btn.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Grade Guidance Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              {currentGroup.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentGroup.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentGroup.pathways.map((path, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {path.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {path.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Career Detail Roadmap Modal */}
      {selectedCareerForModal && (
        <CareerDetailModal
          career={selectedCareerForModal}
          isSaved={savedCareerIds.includes(selectedCareerForModal.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedCareerForModal(null)}
        />
      )}

      {/* 2. Discover My Interests Assessment Modal */}
      {activeActivityModal === 'interest' && (
        <CareerInterestModal
          onClose={() => setActiveActivityModal(null)}
          onSaveCareer={handleToggleSave}
          onSelectCareer={(career) => {
            setActiveActivityModal(null);
            setSelectedCareerForModal(career);
          }}
          savedCareerIds={savedCareerIds}
        />
      )}

      {/* 3. Guess the Career Activity Modal */}
      {activeActivityModal === 'guess' && (
        <GuessTheCareerModal
          onClose={() => setActiveActivityModal(null)}
        />
      )}

      {/* 4. Career Quiz Modal */}
      {activeActivityModal === 'quiz' && (
        <CareerQuizModal
          onClose={() => setActiveActivityModal(null)}
          onSelectCareer={(career) => {
            setActiveActivityModal(null);
            setSelectedCareerForModal(career);
          }}
          onSaveCareer={handleToggleSave}
          savedCareerIds={savedCareerIds}
        />
      )}

      {/* 5. Skill Challenge Modal */}
      {activeActivityModal === 'skill' && (
        <SkillChallengeModal
          onClose={() => setActiveActivityModal(null)}
        />
      )}

    </div>
  );
};
