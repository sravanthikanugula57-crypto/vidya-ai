import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Search,
  BookOpen,
  Sparkles,
  Printer,
  Copy,
  Check,
  Award,
  Filter,
  Layers,
  HelpCircle,
  Download,
  Share2
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { ALL_CHAPTER_FORMULAS, ChapterFormulaSheet, FormulaItem } from '../../../data/allChapterFormulas';

interface FormulaSheetsViewProps {
  studentClassGrade?: string;
}

export const FormulaSheetsView: React.FC<FormulaSheetsViewProps> = ({ studentClassGrade = 'Class 5' }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);

  const cleanGradeNum = studentClassGrade.replace(/\D/g, '') || '5';
  const displayGrade = `Class ${cleanGradeNum}`;

  const subjects = [
    { id: 'All', name: 'All Subjects' },
    { id: `c${cleanGradeNum}_math`, name: 'Mathematics (గణితం)' },
    { id: `c${cleanGradeNum}_sci`, name: 'General Science (సామాన్య శాస్త్రం)' },
    { id: 'math', name: 'Mathematics' }
  ];

  const handleCopyFormula = (f: FormulaItem) => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(`${f.title}: ${f.formula}`);
    setCopiedFormulaId(f.id);
    setTimeout(() => setCopiedFormulaId(null), 2000);
  };

  const handlePrintFormulas = () => {
    soundFx.playSuccess();
    window.print();
  };

  // Filter sheets strictly by class first
  const classSheets = ALL_CHAPTER_FORMULAS.filter(sheet => {
    const sGrade = (sheet.classGrade || '').replace(/\D/g, '');
    return sGrade === cleanGradeNum;
  });

  const displaySheets = classSheets.length > 0 ? classSheets : ALL_CHAPTER_FORMULAS;

  // Filter sheets by subject & search query
  const filteredSheets = displaySheets.filter((sheet) => {
    const matchesSubject = selectedSubject === 'All' || sheet.subjectId === selectedSubject || Boolean(sheet.subjectId && sheet.subjectId.includes(selectedSubject));
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchesSubject;

    const matchesTitle = (sheet.chapterTitle || '').toLowerCase().includes(q) || (sheet.subjectName || '').toLowerCase().includes(q);
    const matchesFormulas = Array.isArray(sheet.formulas) && sheet.formulas.some(
      f => (f.title || '').toLowerCase().includes(q) || (f.formula || '').toLowerCase().includes(q) || (f.explanation || '').toLowerCase().includes(q)
    );

    return matchesSubject && (matchesTitle || matchesFormulas);
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* 1. HEADER HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>AP SCERT Board All-Chapter Formula Sheet Bank</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {displayGrade} Formula Sheets & Master Revision Handbook
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Real formulas, definitions, and key revision notes collected for every chapter of {displayGrade} according to Andhra Pradesh State Board (AP SCERT) curriculum. Includes variable definitions, step-by-step rules, board exam mark allocations, and bilingual Telugu explanations.
            </p>
          </div>

          <button
            onClick={handlePrintFormulas}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Handbook</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & SUBJECT FILTER BAR */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas (e.g. 'Euclid', 'Ohm', 'Quadratic', 'Snell')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedSubject(s.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                selectedSubject === s.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

      </div>

      {/* 3. CHAPTER FORMULA SHEETS LIST */}
      <div className="space-y-6">
        {filteredSheets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-black text-slate-800 dark:text-slate-200">No formula sheets found matching "{searchQuery}"</h3>
            <p className="text-xs text-slate-500">Try adjusting your search keyword or selecting All Subjects.</p>
          </div>
        ) : (
          filteredSheets.map((sheet) => (
            <div
              key={`${sheet.subjectId}_ch_${sheet.chapterNumber}`}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5"
            >
              {/* Chapter Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-sm shrink-0">
                    Ch.{sheet.chapterNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {sheet.subjectName} • Chapter {sheet.chapterNumber}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {sheet.chapterTitle}
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-extrabold">
                  {sheet.formulas.length} Real Formulas
                </span>
              </div>

              {/* Formulas Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sheet.formulas.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative flex flex-col justify-between hover:border-emerald-500 transition"
                  >
                    <div className="space-y-3">
                      
                      {/* Formula Title & Marks Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                          {f.title}
                        </h3>
                        {f.boardMarks && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] shrink-0 border border-amber-300">
                            {f.boardMarks}
                          </span>
                        )}
                      </div>

                      {/* Formula Box */}
                      <div className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm border border-slate-800 shadow-inner overflow-x-auto flex items-center justify-between gap-2">
                        <span>{f.formula}</span>
                        <button
                          onClick={() => handleCopyFormula(f)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                          title="Copy Formula"
                        >
                          {copiedFormulaId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Variable Glossary */}
                      {f.variables && f.variables.length > 0 && (
                        <div className="space-y-1 text-xs">
                          <span className="text-[10px] font-black uppercase text-slate-400">Where:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            {f.variables.map((v, vIdx) => (
                              <div key={vIdx} className="text-slate-700 dark:text-slate-300 font-medium">
                                <strong className="text-emerald-600 dark:text-emerald-400">{v.symbol}:</strong> {v.meaning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanations */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>{f.explanation}</p>
                        {f.teluguExplanation && (
                          <p className="text-slate-500 dark:text-slate-400 font-serif text-[11px] mt-1 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            {f.teluguExplanation}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Exam Tip Callout */}
                    {f.examTip && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Board Tip: {f.examTip}</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
