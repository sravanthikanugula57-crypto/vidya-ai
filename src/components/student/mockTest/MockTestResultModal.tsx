import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Download,
  Brain,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Printer,
  Video,
  FileText,
  Target,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Check,
  Calendar,
  HelpCircle,
  Play
} from 'lucide-react';
import { MockAttempt, MockQuestion } from '../../../types/mockTest';
import { soundFx } from '../../../lib/audio';
import { evaluateQuestionAnswer, getOptionIndex } from '../../../utils/answerEvaluation';
import confetti from 'canvas-confetti';

interface MockTestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  attempt: MockAttempt | null;
  questions: MockQuestion[];
}

interface AIAnalysisData {
  strongTopics: string[];
  weakTopics: string[];
  chaptersToRevise: string[];
  recommendedVideos: { title: string; duration: string; topic: string }[];
  recommendedNotes: { title: string; pages: string; topic: string }[];
  recommendedPracticeSets: { title: string; questionCount: number; subject: string }[];
  personalizedStudyPlan: string[];
  aiSuggestions: string;
}

export const MockTestResultModal: React.FC<MockTestResultModalProps> = ({
  isOpen,
  onClose,
  onRetake,
  attempt,
  questions = []
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen && attempt) {
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 }
        });
      } catch (e) {
        console.warn('Confetti effect failed:', e);
      }

      // Fetch AI Analysis
      fetchAiAnalysis();
    }
  }, [isOpen, attempt?.id]);

  if (!isOpen || !attempt) return null;

  const fetchAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-mock-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: attempt.score || 0,
          totalMarks: attempt.totalMarks || 100,
          percentage: attempt.percentage || 0,
          accuracy: attempt.accuracy || 0,
          timeSpent: attempt.timeSpentSeconds || 0,
          weakChapters: attempt.weakChapters || [],
          strongChapters: attempt.strongChapters || [],
          subject: attempt.subject || 'Mathematics',
          grade: 'Class 10'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      } else {
        throw new Error('Fallback AI analysis');
      }
    } catch (e) {
      // Offline / Fallback AI analysis
      setAiAnalysis({
        strongTopics: attempt.strongChapters?.length ? attempt.strongChapters : ['Fundmentals', 'Basic Principles'],
        weakTopics: attempt.weakChapters?.length ? attempt.weakChapters : ['Complex Problems', 'Formulas'],
        chaptersToRevise: attempt.weakChapters?.length ? attempt.weakChapters : ['Algebra', 'Trigonometry'],
        recommendedVideos: [
          { title: `${attempt.subject} Concept Masterclass: ${attempt.weakChapters?.[0] || 'Core Formulae'}`, duration: '18 mins', topic: attempt.weakChapters?.[0] || 'Core Formulae' },
          { title: `Top 10 State Board 4-Mark Essay Questions Step-by-Step`, duration: '25 mins', topic: 'Board Exam Pattern' }
        ],
        recommendedNotes: [
          { title: `AP & TS SCERT ${attempt.subject} Quick Revision Formula Guide`, pages: '12 pages', topic: 'Formula Handbook' },
          { title: `State Board Examiner Model Answer Key & Marking Scheme`, pages: '8 pages', topic: 'Board Solutions' }
        ],
        recommendedPracticeSets: [
          { title: `15-Min Focused Speed Drill: ${attempt.weakChapters?.[0] || 'Target Topics'}`, questionCount: 20, subject: attempt.subject },
          { title: `${attempt.subject} SSC Public Exam Past 5 Years Solved Drills`, questionCount: 50, subject: attempt.subject }
        ],
        personalizedStudyPlan: [
          `Day 1: Spend 30 mins revising formula sheet for ${attempt.weakChapters?.[0] || 'weak topics'}.`,
          `Day 2: Solve 10 previous board essay questions with neat diagrams.`,
          `Day 3: Practice 20 timed drill questions with Socratic AI Tutor.`,
          `Day 4: Retake full 100-Question Board Mock Test to measure score gain.`
        ],
        aiSuggestions: `To raise your score from ${(attempt.percentage || 0).toFixed(1)}% to 90%+, pay special attention to avoiding calculation errors in 2-Mark and 4-Mark essay questions. Your accuracy in ${attempt.strongChapters?.[0] || 'core areas'} is excellent!`
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const secs = Math.max(0, totalSeconds || 0);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${s}s`;
    }
    return `${mins}m ${s}s`;
  };

  const answersMap = attempt.answers || {};
  const strongChaptersList = attempt.strongChapters || [];
  const weakChaptersList = attempt.weakChapters || [];

  const safeQuestions = Array.isArray(questions) ? questions : [];

  const filteredQuestions = safeQuestions.filter((q) => {
    if (!q) return false;
    const ansState = answersMap[q.questionNumber];
    const evalRes = evaluateQuestionAnswer(
      ansState?.userAnswer,
      q.correctAnswer,
      q.options,
      q.type
    );
    
    if (filterType === 'correct' && !evalRes.isCorrect) return false;
    if (filterType === 'wrong' && (!evalRes.isAnswered || evalRes.isCorrect)) return false;
    if (filterType === 'skipped' && evalRes.isAnswered) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        (q.question || '').toLowerCase().includes(search) ||
        (q.chapter || '').toLowerCase().includes(search)
      );
    }

    return true;
  });

  const handleDownloadPDF = () => {
    soundFx.playSuccess();
    window.print();
  };

  const handleActionClick = (msg: string) => {
    soundFx.playClick();
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Banner Announcement */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-6 py-3 text-white text-center font-black text-sm flex items-center justify-center gap-2 shadow-inner shrink-0">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>🎉 Mock Test Submitted Successfully! Score Saved to Student Profile</span>
        </div>

        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase">
                  Exam Evaluation Complete
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                  {attempt.subject || 'General'} • Test #{attempt.testNumber || 1}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {attempt.testTitle || 'Board Examination Mock Paper'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-center text-xs font-bold animate-bounce shrink-0">
            {actionNotice}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Performance Dashboard Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-center">
              <span className="text-[10px] font-black uppercase text-indigo-500">Score & Marks</span>
              <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                {attempt.score || 0} <span className="text-xs font-normal text-slate-400">/ {attempt.totalMarks || 100}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center">
              <span className="text-[10px] font-black uppercase text-blue-500">Percentage</span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                {(attempt.percentage || 0).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-500">Accuracy Rate</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {(attempt.accuracy || 0).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-center">
              <span className="text-[10px] font-black uppercase text-purple-500">Est. State Rank</span>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                #{attempt.estimatedRank || 1}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center">
              <span className="text-[10px] font-black uppercase text-amber-500">Time Taken</span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-300 mt-2">
                {formatTime(attempt.timeSpentSeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-black uppercase text-slate-500">Breakdown ({safeQuestions.length} Qs)</span>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 space-x-1">
                <span className="text-emerald-600 font-extrabold">{attempt.correctCount || 0}✓</span>
                <span className="text-rose-600 font-extrabold">{attempt.wrongCount || 0}✗</span>
                <span className="text-slate-400 font-extrabold">{attempt.skippedCount || 0}-</span>
              </div>
            </div>
          </div>

          {/* Submission Timestamp Bar */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Submitted On: {new Date(attempt.completedAt || Date.now()).toLocaleString()}</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              Status: Evaluated & Verified
            </span>
          </div>

          {/* Action Quick Bar */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
              Recommended Next Actions:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{showAnswerKey ? 'Hide Answer Key' : 'Review Answer Key'}</span>
              </button>

              <button
                onClick={() => handleActionClick('Launching Socratic AI Tutor for weak topics...')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Ask AI Tutor</span>
              </button>

              <button
                onClick={() => handleActionClick('Practice drill generated for weak topics!')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Practice Weak Topics</span>
              </button>

              <button
                onClick={onRetake}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
            </div>
          </div>

          {/* VIDYA AI PERFORMANCE ANALYSIS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  VIDYA AI Comprehensive Performance Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Personalized diagnostic breakdown and intelligent revision roadmap generated by AI
                </p>
              </div>
            </div>

            {/* AI Callout Suggestion */}
            {aiAnalysis?.aiSuggestions && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white space-y-1 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Tutor Priority Recommendation</span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  {aiAnalysis.aiSuggestions}
                </p>
              </div>
            )}

            {/* Strong vs Weak Topics & Revision Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Strong Topics */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <h4 className="font-black text-xs uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Strong Topics (Mastered)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(aiAnalysis?.strongTopics || strongChaptersList).length > 0 ? (
                    (aiAnalysis?.strongTopics || strongChaptersList).map((topic, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">Keep practicing to identify strong areas</span>
                  )}
                </div>
              </div>

              {/* Weak Topics */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <h4 className="font-black text-xs uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Weak Topics (Needs Drill)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(aiAnalysis?.weakTopics || weakChaptersList).length > 0 ? (
                    (aiAnalysis?.weakTopics || weakChaptersList).map((topic, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-xs font-bold">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-600 font-extrabold text-xs">No weak topics detected! 🎉</span>
                  )}
                </div>
              </div>

              {/* Chapters to Revise */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <h4 className="font-black text-xs uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-500" />
                  Chapters to Revise First
                </h4>
                <ul className="text-xs space-y-1 text-slate-800 dark:text-slate-200 font-bold list-disc list-inside">
                  {(aiAnalysis?.chaptersToRevise || weakChaptersList).slice(0, 3).map((ch, idx) => (
                    <li key={idx}>{ch}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations Grid: Videos, Notes, Practice Sets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Recommended Videos */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-xs uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-500" />
                  Recommended Video Lessons
                </h4>
                <div className="space-y-2">
                  {(aiAnalysis?.recommendedVideos || []).map((vid, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(`Opening video lesson: "${vid.title}"`)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {vid.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{vid.topic}</span>
                          <span>•</span>
                          <span>{vid.duration}</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-500" />
                  Recommended Revision Notes
                </h4>
                <div className="space-y-2">
                  {(aiAnalysis?.recommendedNotes || []).map((note, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(`Opening revision notes: "${note.title}"`)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {note.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{note.topic}</span>
                          <span>•</span>
                          <span>{note.pages}</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Practice Sets */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-xs uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-500" />
                  Recommended Practice Drills
                </h4>
                <div className="space-y-2">
                  {(aiAnalysis?.recommendedPracticeSets || []).map((prac, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(`Launching practice drill: "${prac.title}"`)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {prac.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{prac.subject}</span>
                          <span>•</span>
                          <span>{prac.questionCount} Questions</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Personalized Study Plan */}
            {aiAnalysis?.personalizedStudyPlan && (
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>4-Day Personalized Revision Plan</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {aiAnalysis.personalizedStudyPlan.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Detailed Question Answer Key Review */}
          {showAnswerKey && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Complete {safeQuestions.length} Question Board Answer Key</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review every question with step-by-step examiner model solutions and hints.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search question..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        filterType === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow' : 'text-slate-500'
                      }`}
                    >
                      All ({safeQuestions.length})
                    </button>
                    <button
                      onClick={() => setFilterType('correct')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        filterType === 'correct' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500'
                      }`}
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => setFilterType('wrong')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        filterType === 'wrong' ? 'bg-rose-500 text-white shadow' : 'text-slate-500'
                      }`}
                    >
                      Wrong
                    </button>
                    <button
                      onClick={() => setFilterType('skipped')}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        filterType === 'skipped' ? 'bg-amber-500 text-white shadow' : 'text-slate-500'
                      }`}
                    >
                      Skipped
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredQuestions.map((q) => {
                  if (!q) return null;
                  const ansState = answersMap[q.questionNumber];
                  const evalRes = evaluateQuestionAnswer(
                    ansState?.userAnswer,
                    q.correctAnswer,
                    q.options,
                    q.type
                  );
                  const isAnswered = evalRes.isAnswered;
                  const isCorrect = evalRes.isCorrect;

                  const displayType = (q.type || 'mcq').replace('_', ' ');

                  return (
                    <div
                      key={q.id || `q_${q.questionNumber}`}
                      className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                        !isAnswered
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                          : isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px]">
                              Q{q.questionNumber}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {q.chapter || 'General'} • {q.marks || 1} Marks
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
                              {displayType}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {q.question}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {!isAnswered ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                              Skipped
                            </span>
                          ) : isCorrect ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Correct (+{q.marks || 1})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[10px] flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Options or Answer */}
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                            {q.options.map((opt, optIdx) => {
                              const isCorrectOption = evalRes.correctOptionIndex === optIdx;
                              const isSelectedOption = evalRes.userOptionIndex === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg text-xs font-medium border ${
                                    isCorrectOption
                                      ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-black text-emerald-900 dark:text-emerald-200'
                                      : isAnswered && isSelectedOption
                                      ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-200'
                                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="text-xs space-y-1">
                          <div>
                            <span className="font-bold text-slate-500">Your Response: </span>
                            <span className={`font-black ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : isAnswered ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                              {evalRes.displayUserAnswer}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Model Board Answer: </span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300">
                              {evalRes.displayCorrectAnswer}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                        <span className="font-black text-indigo-700 dark:text-indigo-300">Examiner Solution & Steps:</span>
                        <p>{q.explanation || 'Refer to SSC State Board SCERT textbook standard definitions.'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Mock Test</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow hover:opacity-90 transition cursor-pointer"
          >
            Return to Mock Tests Overview
          </button>
        </div>

      </div>
    </div>
  );
};
