import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  X,
  RotateCw,
  ExternalLink,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Award,
  Clock,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { REAL_PREVIOUS_QUESTION_PAPERS, DetailedPreviousPaper, ExamQuestion } from '../../data/realPreviousPapersData';

export interface PDFViewerPaperInfo {
  id?: string;
  title: string;
  subject: string;
  board: string;
  year: string;
  medium: string;
  totalMarks?: number;
  duration?: string;
  fileSize?: string;
  pdfUrl: string;
  answerKeyUrl?: string;
}

interface IntegratedPDFViewerModalProps {
  paper: PDFViewerPaperInfo;
  onClose: () => void;
}

export const IntegratedPDFViewerModal: React.FC<IntegratedPDFViewerModalProps> = ({
  paper,
  onClose
}) => {
  // Try finding detailed question structure if matching ID exists
  const detailedPaper: DetailedPreviousPaper | undefined = REAL_PREVIOUS_QUESTION_PAPERS.find(
    p => p.id === paper.id
  );

  // Mode: 'interactive_paper' | 'model_answers' | 'pdf_frame'
  const [viewMode, setViewMode] = useState<'interactive_paper' | 'model_answers' | 'pdf_frame'>(
    detailedPaper ? 'interactive_paper' : 'pdf_frame'
  );
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    soundFx.playSuccess();
    window.print();
  };

  const handleDownload = () => {
    soundFx.playSuccess();
    const downloadUrl = paper.pdfUrl || detailedPaper?.pdfUrl || 'https://bse.telangana.gov.in';
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Section Filters
  const sections = ['All', 'Part A - Section I', 'Part A - Section II', 'Part A - Section III', 'Part B - Bit Paper (MCQ)'];

  const filteredQuestions = (detailedPaper?.questions || []).filter(q => {
    if (selectedSection === 'All') return true;
    return q.section === selectedSection;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-white"
      >
        {/* 1. TOP TITLE BAR */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-black text-[10px] uppercase">
                  {paper.year} SSC Board Paper
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                  {paper.board}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                  {paper.medium} Medium
                </span>
                <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Genuine Board Release</span>
                </span>
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate max-w-xl mt-0.5">
                {paper.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. MODE NAVIGATION & TOOLBAR */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold shrink-0">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => { soundFx.playClick(); setViewMode('interactive_paper'); }}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'interactive_paper' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Question Paper</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setViewMode('model_answers'); }}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'model_answers' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Official Answer Key & Solutions</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setViewMode('pdf_frame'); }}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'pdf_frame' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Direct Board Link</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { soundFx.playClick(); setShowAnswerKeys(!showAnswerKeys); }}
              className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                showAnswerKeys ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAnswerKeys ? 'Hide Hints/Answers' : 'Show Answers'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Paper</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>

        </div>

        {/* 3. MAIN WORKSPACE / VIEWER BODY */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {viewMode === 'pdf_frame' || !detailedPaper ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8 bg-slate-900/60 rounded-3xl border border-slate-800">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-black text-white">Official Board Paper Mirror</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct official government link to the Directorate of Government Examinations repository ({paper.board}). Click below to download or view the original PDF document.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Open Official Document PDF</span>
                </button>
                <button
                  onClick={() => setViewMode('interactive_paper')}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Switch to Clean Interactive View</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* EXAM PAPER HEADER SHEET */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl space-y-6 font-serif">
                
                {/* Official Exam Header */}
                <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-600">
                    {detailedPaper.board} • PUBLIC EXAMINATIONS {detailedPaper.year}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-950">
                    {detailedPaper.title}
                  </h1>
                  <div className="flex flex-wrap items-center justify-between text-xs font-black pt-3 text-slate-800">
                    <span>Time Allowed: {detailedPaper.duration}</span>
                    <span>Instruction Medium: {detailedPaper.medium}</span>
                    <span>Max Marks: {detailedPaper.totalMarks}</span>
                  </div>
                </div>

                {/* Exam Instructions List */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-sans">
                  <span className="font-extrabold uppercase text-slate-700 block tracking-wider text-[11px]">
                    General Instructions (సాధారణ సూచనలు):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                    {detailedPaper.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Section Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 font-sans text-xs">
                  {sections.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSection(s)}
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold transition cursor-pointer shrink-0 ${
                        selectedSection === s
                          ? 'bg-slate-900 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Questions List */}
                <div className="space-y-6 font-sans">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.qNo}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 relative group hover:border-cyan-500/50 transition"
                    >
                      {/* Question Top Badges */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                            Q{q.qNo}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-900 font-extrabold text-[11px]">
                            {q.section}
                          </span>
                          {q.chapter && (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-extrabold text-[11px]">
                              {q.chapter}
                            </span>
                          )}
                        </div>
                        <span className="font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
                          [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                        </span>
                      </div>

                      {/* Question Text (Bilingual) */}
                      <div className="space-y-2 pt-1">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {q.questionTextEn}
                        </p>
                        {q.questionTextTe && (
                          <p className="text-xs font-medium text-slate-700 leading-relaxed font-serif bg-white p-2.5 rounded-xl border border-slate-200">
                            {q.questionTextTe}
                          </p>
                        )}
                      </div>

                      {/* Options (If Part B MCQ) */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.key}
                              className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-900 font-black flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <span>{opt.textEn}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Model Solution / Answer Key Toggle */}
                      {(showAnswerKeys || viewMode === 'model_answers') && q.modelAnswerEn && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in">
                          <div className="font-black text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Official Marking Scheme Solution:</span>
                          </div>
                          <p className="font-semibold">{q.modelAnswerEn}</p>
                          {q.modelAnswerTe && (
                            <p className="text-emerald-800 font-serif text-[11px] pt-1">{q.modelAnswerTe}</p>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
