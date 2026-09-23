import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, Clock, Sparkles, FileText, ArrowRight, Download, Brain, Code, Play, Layers } from 'lucide-react';
import { Subject, Chapter, LanguageCode } from '../../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey } from '../../data/officialSyllabusData';
import { soundFx } from '../../lib/audio';
import { ChapterLearningHub } from './ChapterLearningHub';

interface ChapterExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  selectedLang?: LanguageCode;
  onLaunchTutorForTopic: (topic: string) => void;
  onLaunchWhiteboardForTopic: (topic: string) => void;
  onAddXp?: (xp: number) => void;
  onAddCoins?: (coins: number) => void;
}

export const ChapterExplorerModal: React.FC<ChapterExplorerModalProps> = ({
  isOpen,
  onClose,
  subject,
  selectedLang = 'en',
  onLaunchTutorForTopic,
  onLaunchWhiteboardForTopic,
  onAddXp = () => {},
  onAddCoins = () => {},
}) => {
  const [isHubOpen, setIsHubOpen] = useState(false);

  if (!isOpen || !subject) return null;

  const gradeKey = normalizeGradeKey(subject.classId || 'Class 10');
  const classSyllabus = OFFICIAL_SYLLABUS_BY_CLASS[gradeKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];
  const matchedSub = classSyllabus.find(s => 
    s.id === subject.id || 
    s.name.toLowerCase().includes(subject.name.toLowerCase()) || 
    subject.name.toLowerCase().includes(s.name.toLowerCase())
  );

  const subjectChapters: Chapter[] = matchedSub?.chapters?.map(ch => ({
    id: ch.id,
    chapterNumber: ch.chapterNumber,
    title: ch.title,
    nativeTitle: ch.nativeTitle,
    topicsCount: ch.lessonsCount || ch.lessons?.length || 4,
    estimatedMinutes: (ch.lessonsCount || 4) * 12,
    completed: false,
    keyFormulas: ch.lessons?.slice(0, 3).map(l => l.title) || []
  })) || [];

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(subjectChapters[0] || null);

  // If student launches the Chapter Learning Hub
  if (isHubOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto animate-fade-in">
        <ChapterLearningHub
          subject={subject}
          chapter={selectedChapter}
          selectedLang={selectedLang}
          onBack={() => setIsHubOpen(false)}
          onAddXp={onAddXp}
          onAddCoins={onAddCoins}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row max-h-[85vh]">
        {/* Left Sidebar: Chapters List */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-3 rounded-xl text-white shadow-md"
                style={{ backgroundColor: subject.color }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  {subject.name}
                </h2>
                {subject.nativeName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subject.nativeName}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Chapters ({subjectChapters.length})
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {subjectChapters.map((ch) => {
                const isSelected = selectedChapter?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedChapter(ch);
                    }}
                    className={`w-full p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-md text-blue-900 dark:text-blue-200'
                        : 'bg-transparent border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>Chapter {ch.chapterNumber}</span>
                      {ch.completed ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ch.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-xs leading-snug line-clamp-2">
                      {ch.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close Explorer
          </button>
        </div>

        {/* Right Main Content: Chapter Deep Dive */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          {!selectedChapter ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Chapters Published Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Chapters for this subject are being published according to the official State Board SSC syllabus.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Chapter {selectedChapter.chapterNumber} Deep Dive
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedChapter.title}
                  </h3>
                  {selectedChapter.nativeTitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedChapter.nativeTitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Banner button to open Chapter Learning Hub */}
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-400 text-slate-900 uppercase tracking-wider">
                    Complete Learning Hub
                  </span>
                  <h4 className="font-black text-base text-white">
                    Open Chapter Digital Classroom
                  </h4>
                  <p className="text-xs text-indigo-100">
                    Includes Videos, SCERT Notes, Slides, Worksheets, PYQs, Flashcards, Mind Maps, Formula Sheets & AI Tutor on one page!
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsHubOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-black shadow-lg shrink-0 flex items-center gap-1.5 cursor-pointer transform hover:scale-105 transition"
                >
                  <span>Launch Chapter Hub</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">Estimated Time</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" /> {selectedChapter.estimatedMinutes} Minutes
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">Topics Covered</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-500" /> {selectedChapter.topicsCount} Key Topics
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">Status</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                    {selectedChapter.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Mastered
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Formulas & Board Exam Cheat-Sheet */}
              {selectedChapter.keyFormulas && selectedChapter.keyFormulas.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-600" /> High-Yield Board Exam Topics & Concepts
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-100 font-mono">
                    {selectedChapter.keyFormulas.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-white/60 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Launchers */}
          {selectedChapter && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Launch AI Learning Tools for this Chapter:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onLaunchTutorForTopic(`${subject.name}: ${selectedChapter.title}`);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Ask Socratic AI Tutor</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onLaunchWhiteboardForTopic(`${subject.name}: ${selectedChapter.title}`);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-200" />
                    <span>AI Interactive Whiteboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

