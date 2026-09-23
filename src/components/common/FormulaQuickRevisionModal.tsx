import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  Copy,
  Check,
  BookOpen,
  Bookmark,
  Award,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { soundFx } from '../../lib/audio';
import { CLASS_5_MATH_FORMULAS, ChapterFormulaSheet, FormulaItem } from '../../data/allChapterFormulas';
import { DigitalLibraryResource } from '../../types/library';

interface FormulaQuickRevisionModalProps {
  resource?: DigitalLibraryResource | null;
  initialChapter?: string;
  onClose: () => void;
}

export const FormulaQuickRevisionModal: React.FC<FormulaQuickRevisionModalProps> = ({
  resource,
  initialChapter,
  onClose
}) => {
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(() => {
    if (resource?.chapter && resource.chapter !== 'All Chapters') {
      const targetChap = resource.chapter.toLowerCase();
      const idx = CLASS_5_MATH_FORMULAS.findIndex(
        f => (f.chapterTitle || '').toLowerCase().includes(targetChap)
      );
      if (idx >= 0) return idx;
    }
    if (initialChapter && initialChapter !== 'All Chapters') {
      const targetInit = initialChapter.toLowerCase();
      const idx = CLASS_5_MATH_FORMULAS.findIndex(
        f => (f.chapterTitle || '').toLowerCase().includes(targetInit)
      );
      if (idx >= 0) return idx;
    }
    return 0;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSheet = CLASS_5_MATH_FORMULAS[selectedChapterIdx] || CLASS_5_MATH_FORMULAS[0];

  const handleCopy = (f: FormulaItem) => {
    soundFx.playSuccess();
    const text = `${f.title}\nFormula: ${f.formula}\nExplanation: ${f.explanation}\nRules: ${f.rules?.join('; ') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(f.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    soundFx.playSuccess();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-sky-200 text-xs font-black uppercase">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Class 5 AP State Board • Mathematics Quick Revision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {resource?.title || 'Class 5 Mathematics Formula & Concept Bank'}
            </h2>
            <p className="text-xs text-sky-100 max-w-2xl">
              Official formulas, key concepts, rules, step-by-step examples, and bilingual explanations according to AP SCERT Class 5 Mathematics curriculum.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Print Sheet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* CHAPTER SELECTOR SIDEBAR */}
          <div className="lg:col-span-1 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-4 lg:pb-0 lg:pr-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Select Chapter (14):</span>
            </h4>
            <div className="space-y-1.5 max-h-60 lg:max-h-[58vh] overflow-y-auto pr-1">
              {CLASS_5_MATH_FORMULAS.map((sheet, idx) => (
                <button
                  key={sheet.chapterNumber}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedChapterIdx(idx);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-between gap-2 ${
                    selectedChapterIdx === idx
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">
                    {sheet.chapterNumber}. {sheet.chapterTitle}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedChapterIdx === idx ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {sheet.formulas.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FORMULAS & RULES DISPLAY */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase">
                  Chapter {activeSheet.chapterNumber}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeSheet.chapterTitle}
                </h3>
              </div>
              {activeSheet.topicSummary && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeSheet.topicSummary}
                </p>
              )}
            </div>

            {/* FORMULA CARDS */}
            <div className="space-y-4">
              {activeSheet.formulas.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {f.title}
                      </h4>
                      {f.teluguExplanation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          {f.teluguExplanation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {f.boardMarks && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                          {f.boardMarks}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(f)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer"
                        title="Copy Formula & Rules"
                      >
                        {copiedId === f.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* FORMULA HIGHLIGHT BOX */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 overflow-x-auto shadow-inner">
                    {f.formula}
                  </div>

                  {/* VARIABLES LIST */}
                  {f.variables && f.variables.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {f.variables.map((v, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">{v.symbol}:</span>
                          <span className="text-slate-500">{v.meaning} {v.unit ? `(${v.unit})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* RULES & EXPLANATION */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {f.explanation}
                    </p>

                    {f.rules && f.rules.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                          Key Rules:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                          {f.rules.map((rule, rIdx) => (
                            <li key={rIdx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* WORKED EXAMPLES */}
                  {f.examples && f.examples.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Example Problem & Solution:</span>
                      </span>
                      {f.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            Q: {ex.question}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                            Solution: {ex.solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* EXAM TIP */}
                  {f.examTip && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] font-medium text-purple-900 dark:text-purple-200 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>Exam Tip:</strong> {f.examTip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Official AP SCERT Curriculum Aligned</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
