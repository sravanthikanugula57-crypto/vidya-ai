import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Search,
  Download,
  Eye,
  Filter,
  CheckCircle2,
  Calendar,
  BookOpen,
  Award,
  Clock,
  ShieldCheck,
  X,
  Layers,
  RotateCcw,
  Sparkles,
  FileCheck,
  ExternalLink,
  GraduationCap,
  Play,
  Star,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { PreviousPaper, PreviousPaperAttempt } from '../../../types/previousPaper';
import {
  subscribeToClassPreviousPapers,
  subscribeToStudentPaperAttempts
} from '../../../services/previousPaperService';
import { IntegratedPDFViewerModal } from '../../common/IntegratedPDFViewerModal';
import { PreviousPaperPracticeModal } from './PreviousPaperPracticeModal';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey } from '../../../data/officialSyllabusData';

interface PreviousPapersViewProps {
  userId?: string;
  studentName?: string;
  onNavigateTab?: (tab: string) => void;
  studentClassGrade?: string;
}

export const PreviousPapersView: React.FC<PreviousPapersViewProps> = ({
  userId = 'student_demo',
  studentName = 'Student',
  onNavigateTab,
  studentClassGrade = 'Class 5'
}) => {
  const activeGrade = normalizeGradeKey(studentClassGrade);

  // Papers from Firestore
  const [papers, setPapers] = useState<PreviousPaper[]>([]);
  const [attempts, setAttempts] = useState<PreviousPaperAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedExamType, setSelectedExamType] = useState<string>('All');
  const [activeViewTab, setActiveViewTab] = useState<'papers' | 'my_attempts'>('papers');

  // Modals
  const [activeViewerPaper, setActiveViewerPaper] = useState<PreviousPaper | null>(null);
  const [practicePaper, setPracticePaper] = useState<PreviousPaper | null>(null);

  // Subscribe to real papers & student attempts from Firestore
  useEffect(() => {
    setLoading(true);

    // 1. Subscribe strictly to Active Grade Previous Papers
    const unsubPapers = subscribeToClassPreviousPapers(activeGrade, (data) => {
      setPapers(data);
      setLoading(false);
    }, true);

    // 2. Subscribe to Student Previous Paper Attempts
    const unsubAttempts = subscribeToStudentPaperAttempts(userId, (attList) => {
      setAttempts(attList);
    });

    return () => {
      unsubPapers();
      unsubAttempts();
    };
  }, [userId, activeGrade]);

  // Derived attempts map by paperId: { [paperId]: { bestScore, latestScore, attemptsCount, latestDate } }
  const paperStatsMap = useMemo(() => {
    const map: Record<string, { bestScore: number; bestPercentage: number; latestScore: number; latestPercentage: number; attemptsCount: number; latestDate: string }> = {};

    attempts.forEach((att) => {
      const pId = att.paperId;
      if (!map[pId]) {
        map[pId] = {
          bestScore: att.score,
          bestPercentage: att.percentage,
          latestScore: att.score,
          latestPercentage: att.percentage,
          attemptsCount: 1,
          latestDate: att.attemptedAt
        };
      } else {
        map[pId].attemptsCount += 1;
        if (att.percentage > map[pId].bestPercentage) {
          map[pId].bestScore = att.score;
          map[pId].bestPercentage = att.percentage;
        }
        // First in sorted list is latest
        if (new Date(att.attemptedAt).getTime() > new Date(map[pId].latestDate).getTime()) {
          map[pId].latestScore = att.score;
          map[pId].latestPercentage = att.percentage;
          map[pId].latestDate = att.attemptedAt;
        }
      }
    });

    return map;
  }, [attempts]);

  // Dynamic filter dropdown lists strictly from real available papers
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    papers.forEach(p => {
      if (p.year) yearsSet.add(String(p.year));
    });
    return ['All', ...Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a))];
  }, [papers]);

  const availableSubjects = useMemo(() => {
    const subSet = new Set<string>();
    papers.forEach(p => {
      if (p.subject) subSet.add(p.subject);
    });
    return ['All', ...Array.from(subSet).sort()];
  }, [papers]);

  const availableExamTypes = useMemo(() => {
    const typeSet = new Set<string>();
    papers.forEach(p => {
      if (p.examType) typeSet.add(p.examType);
    });
    return ['All', ...Array.from(typeSet).sort()];
  }, [papers]);

  // Filter Algorithm
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (q) {
        const tokens = q.split(/\s+/).filter(Boolean);
        const text = `${paper.title} ${paper.subject} ${paper.board} ${paper.year} ${paper.examType} ${paper.medium}`.toLowerCase();
        matchesSearch = tokens.every((token) => text.includes(token));
      }

      // 2. Subject Filter
      const matchesSubject = selectedSubject === 'All' || (paper.subject || '').toLowerCase() === (selectedSubject || '').toLowerCase();

      // 3. Year Filter
      const matchesYear = selectedYear === 'All' || String(paper.year || '') === selectedYear;

      // 4. Exam Type Filter
      const matchesExamType = selectedExamType === 'All' || (paper.examType || '').toLowerCase() === (selectedExamType || '').toLowerCase();

      return matchesSearch && matchesSubject && matchesYear && matchesExamType;
    });
  }, [papers, searchQuery, selectedSubject, selectedYear, selectedExamType]);

  const handleResetFilters = () => {
    soundFx.playClick();
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedYear('All');
    setSelectedExamType('All');
  };

  const handleOpenPdfViewer = (paper: PreviousPaper) => {
    soundFx.playClick();
    setActiveViewerPaper(paper);
  };

  const handleStartPractice = (paper: PreviousPaper) => {
    soundFx.playClick();
    setPracticePaper(paper);
  };

  const handleDownloadPdf = (paper: PreviousPaper) => {
    soundFx.playSuccess();
    const url = paper.pdfUrl || paper.questionPaperUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Color theme helper by Subject
  const getSubjectColor = (subj?: string) => {
    const s = (subj || '').toLowerCase();
    if (s.includes('math')) return { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', iconBg: 'bg-blue-500 text-white', icon: '📐' };
    if (s.includes('evs') || s.includes('science') || s.includes('environ')) return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', iconBg: 'bg-emerald-500 text-white', icon: '🌿' };
    if (s.includes('english')) return { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', iconBg: 'bg-indigo-500 text-white', icon: '📖' };
    if (s.includes('telugu')) return { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', iconBg: 'bg-rose-500 text-white', icon: '✍️' };
    if (s.includes('hindi')) return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', iconBg: 'bg-amber-500 text-white', icon: '🗣️' };
    return { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', iconBg: 'bg-cyan-500 text-white', icon: '📜' };
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. HEADER HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-cyan-950 text-white shadow-2xl relative overflow-hidden border border-cyan-500/30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Real {activeGrade} Examination Papers</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase">
                SCERT State Board Releases
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Previous Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Practice with real previous examination papers. Solve complete official question papers section-by-section with live timer, instant score calculation, and detailed step-by-step solutions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <div className="text-2xl font-black text-cyan-300">{papers.length}</div>
              <div className="text-[10px] text-cyan-200 uppercase font-black">Official Papers</div>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-cyan-600 text-white text-center shadow-lg shadow-cyan-600/30">
              <div className="text-2xl font-black">{attempts.length}</div>
              <div className="text-[10px] text-cyan-100 uppercase font-black">My Attempts</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP TABS: EXAM PAPERS vs MY ATTEMPTS */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundFx.playClick(); setActiveViewTab('papers'); }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'papers'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{activeGrade} Papers ({papers.length})</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveViewTab('my_attempts'); }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'my_attempts'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>My Practice Progress ({attempts.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-bold">
          <GraduationCap className="w-4 h-4 text-cyan-500" />
          <span>Curriculum: {activeGrade} (SCERT Board)</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PREVIOUS PAPERS CATALOG */}
      {/* ========================================================================= */}
      {activeViewTab === 'papers' && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeGrade} papers (e.g. "2025 Mathematics", "Annual", "Telugu")...`}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* Class Filter */}
              <div>
                <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Class Grade</span>
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{activeGrade} Only</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Subject</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => { soundFx.playClick(); setSelectedSubject(e.target.value); }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Examination Year</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => { soundFx.playClick(); setSelectedYear(e.target.value); }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>{yr === 'All' ? 'All Available Years' : `Year ${yr}`}</option>
                  ))}
                </select>
              </div>

              {/* Exam Type Filter */}
              <div>
                <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Exam Type</span>
                </label>
                <select
                  value={selectedExamType}
                  onChange={(e) => { soundFx.playClick(); setSelectedExamType(e.target.value); }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {availableExamTypes.map((et) => (
                    <option key={et} value={et}>{et === 'All' ? 'All Exam Types' : et}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Active filters pill display & reset */}
            {(searchQuery || selectedSubject !== 'All' || selectedYear !== 'All' || selectedExamType !== 'All') && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">Active filters:</span>
                  {selectedSubject !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-bold">
                      Subject: {selectedSubject}
                    </span>
                  )}
                  {selectedYear !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-bold">
                      Year: {selectedYear}
                    </span>
                  )}
                  {selectedExamType !== 'All' && (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-bold">
                      Exam: {selectedExamType}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* PAPERS GRID */}
          {loading ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-500">Loading authentic Class 5 examination papers...</p>
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPapers.map((paper) => {
                const colors = getSubjectColor(paper.subject);
                const stats = paperStatsMap[paper.id];
                const questionCount = paper.questions?.length || 0;
                const hasPractice = Boolean(paper.hasPractice && questionCount > 0);

                return (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500/50 shadow-xl transition flex flex-col justify-between space-y-5 group"
                  >
                    <div className="space-y-4">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${colors.bg}`}>
                          <span>{colors.icon}</span>
                          <span>{paper.subject}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                            {paper.year}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold text-[11px]">
                            {paper.medium || 'English'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Exam Board */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                          {paper.examType}
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition leading-snug">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {paper.board}
                        </p>
                      </div>

                      {/* Paper Specifications Grid */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs">
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-black">Marks</div>
                          <div className="font-black text-slate-800 dark:text-slate-200">{paper.totalMarks || 50}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-black">Duration</div>
                          <div className="font-black text-slate-800 dark:text-slate-200">{paper.duration || '2 Hours'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-black">Questions</div>
                          <div className="font-black text-slate-800 dark:text-slate-200">
                            {questionCount > 0 ? `${questionCount} Qs` : 'Full PDF'}
                          </div>
                        </div>
                      </div>

                      {/* Student's Practice Stats (if attempted) */}
                      {stats && (
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-500">Your Best Score</div>
                              <div className="font-black text-emerald-600 dark:text-emerald-400">
                                {stats.bestScore}/{paper.totalMarks || 50} ({stats.bestPercentage}%)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Attempts</div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{stats.attemptsCount} times</div>
                          </div>
                        </div>
                      )}

                      {/* Notice if practice not digitized yet */}
                      {!hasPractice && (
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 flex items-center gap-2">
                          <Info className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Complete official board paper available via PDF view & download.</span>
                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {hasPractice ? (
                        <button
                          onClick={() => handleStartPractice(paper)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{stats ? 'Practice Paper Again' : 'Start Practice (Complete Paper)'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPdfViewer(paper)}
                          className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Complete Question Paper PDF</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPdfViewer(paper)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(paper)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  No previous papers available for this filter
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  More papers will be available when teachers publish them. We do not display fake or demo questions.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-2xl bg-cyan-600 text-white font-black text-xs hover:bg-cyan-500 transition cursor-pointer shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* BOTTOM NOTICE */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>
                All papers in this repository are verified official releases from state educational directorates. More papers are synchronized automatically as uploaded by faculty.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY PRACTICE PROGRESS & ATTEMPTS HISTORY */}
      {/* ========================================================================= */}
      {activeViewTab === 'my_attempts' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-500" />
              <span>Your Previous Paper Practice History ({attempts.length})</span>
            </h3>
            <button
              onClick={() => setActiveViewTab('papers')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Explore More Papers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {attempts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attempts.map((att) => {
                const colors = getSubjectColor(att.subject);
                const matchedPaper = papers.find(p => p.id === att.paperId);

                return (
                  <div
                    key={att.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${colors.bg}`}>
                        {colors.icon} {att.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {new Date(att.attemptedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                        {att.paperTitle}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {att.examType} • Year {att.year}
                      </p>
                    </div>

                    {/* Result Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Score</div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {att.score}/{att.totalMarks}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Percentage</div>
                        <div className="font-black text-cyan-600 dark:text-cyan-400">{att.percentage}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Time Spent</div>
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {Math.round(att.timeSpentSeconds / 60)} mins
                        </div>
                      </div>
                    </div>

                    {matchedPaper && (
                      <button
                        onClick={() => handleStartPractice(matchedPaper)}
                        className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Practice Again</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-black text-slate-800 dark:text-slate-200">No attempts yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start practicing with authentic Class 5 previous papers to test your preparation and track your score improvement.
              </p>
              <button
                onClick={() => setActiveViewTab('papers')}
                className="px-6 py-2.5 rounded-2xl bg-cyan-600 text-white font-black text-xs hover:bg-cyan-500 transition cursor-pointer"
              >
                Browse Class 5 Papers
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTEGRATED FULL PDF VIEWER */}
      {/* ========================================================================= */}
      {activeViewerPaper && (
        <IntegratedPDFViewerModal
          paper={{
            id: activeViewerPaper.id,
            title: activeViewerPaper.title,
            subject: activeViewerPaper.subject,
            year: activeViewerPaper.year,
            board: activeViewerPaper.board,
            medium: (activeViewerPaper as any).medium || 'English / Telugu',
            totalMarks: activeViewerPaper.totalMarks,
            duration: activeViewerPaper.duration,
            pdfUrl: activeViewerPaper.pdfUrl || (activeViewerPaper as any).questionPaperUrl || ''
          }}
          onClose={() => setActiveViewerPaper(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COMPLETE INTERACTIVE PRACTICE EXAMINATION */}
      {/* ========================================================================= */}
      {practicePaper && (
        <PreviousPaperPracticeModal
          paper={practicePaper}
          userId={userId}
          studentName={studentName}
          onClose={() => setPracticePaper(null)}
          onAttemptSaved={() => {
            // refresh data
          }}
        />
      )}

    </div>
  );
};
