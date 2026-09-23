import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCode,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Upload,
  Sparkles,
  Search,
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  Award,
  AlertCircle,
  X,
  FileSpreadsheet,
  Download,
  Eye,
  Send,
  Zap,
  Globe,
  RefreshCw,
  Check
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  PracticeSetDoc, 
  PracticeQuestionItem, 
  fetchPublishedPracticeSets, 
  publishPracticeSet, 
  deletePracticeSetFromFirestore 
} from '../../../services/practiceService';

interface TeacherPracticeSetManagerProps {
  teacherName?: string;
  onSuccessNotice?: (msg: string) => void;
}

export const TeacherPracticeSetManager: React.FC<TeacherPracticeSetManagerProps> = ({
  teacherName = 'Senior Faculty',
  onSuccessNotice
}) => {
  const [practiceSets, setPracticeSets] = useState<PracticeSetDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectingSet, setInspectingSet] = useState<PracticeSetDoc | null>(null);
  const [showImportModal, setShowImportModal] = useState<PracticeSetDoc | null>(null);
  const [importJsonText, setImportJsonText] = useState('');

  // Form State for creating a real practice set
  const [setForm, setSetForm] = useState({
    title: 'Real Numbers Mastery Set 1',
    board: 'State Board (TG/AP)',
    class: 'Class 10',
    subject: 'Mathematics',
    chapterId: 'chap_math_1',
    chapterName: 'Real Numbers',
    category: 'practice',
    difficulty: 'Medium',
    marksPerQuestion: 1,
    duration: 30,
    description: 'Curriculum-aligned practice set covering fundamental concepts, numerical problems, and objective questions.'
  });

  // Questions to attach to the new practice set
  const [formQuestions, setFormQuestions] = useState<PracticeQuestionItem[]>([
    {
      questionId: 'q1',
      questionText: 'If two positive integers a and b are written as a = x³y² and b = xy³, where x, y are prime numbers, then HCF(a, b) is:',
      options: ['xy', 'xy²', 'x³y³', 'x²y²'],
      correctAnswer: 1,
      explanation: 'HCF is the product of the smallest power of each common prime factor involved in the numbers. Common factors are x (power 1) and y (power 2), so HCF = xy².',
      marks: 1
    },
    {
      questionId: 'q2',
      questionText: 'Which of the following numbers has a terminating decimal expansion?',
      options: ['17 / 90', '13 / 3125', '77 / 210', '129 / (2² × 5⁷ × 7⁵)'],
      correctAnswer: 1,
      explanation: 'A rational number p/q has a terminating decimal expansion if the prime factorization of q is of the form 2^n × 5^m. 3125 = 5⁵, so 13/3125 is terminating.',
      marks: 1
    },
    {
      questionId: 'q3',
      questionText: 'According to Euclid’s Division Lemma, for any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where r must satisfy:',
      options: ['1 < r < b', '0 ≤ r < b', '0 < r ≤ b', '0 ≤ r ≤ b'],
      correctAnswer: 1,
      explanation: 'In Euclid’s Division Lemma, the remainder r is non-negative and strictly less than the divisor b, which is written as 0 ≤ r < b.',
      marks: 1
    }
  ]);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    setLoading(true);
    try {
      // Query real published practice sets from Firestore
      const dbSets = await fetchPublishedPracticeSets();
      setPracticeSets(dbSets || []);
    } catch (err) {
      console.warn('Error loading practice sets:', err);
      setPracticeSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setLoading(true);

    try {
      const setId = `pset_${Date.now()}`;
      const now = new Date().toISOString();

      const newSet: PracticeSetDoc = {
        id: setId,
        practiceSetId: setId,
        board: setForm.board,
        class: setForm.class,
        subject: setForm.subject,
        subjectName: setForm.subject,
        chapterId: setForm.chapterId,
        chapterName: setForm.chapterName,
        title: setForm.title,
        description: setForm.description,
        difficulty: setForm.difficulty,
        category: setForm.category,
        duration: Number(setForm.duration) || 30,
        questions: formQuestions,
        totalQuestions: formQuestions.length,
        marksPerQuestion: Number(setForm.marksPerQuestion) || 1,
        totalMarks: formQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
        createdBy: teacherName,
        createdAt: now,
        publishedAt: now,
        status: 'published'
      };

      await publishPracticeSet(newSet);

      setPracticeSets(prev => [newSet, ...prev]);
      setShowCreateModal(false);
      soundFx.playSuccess();
      if (onSuccessNotice) {
        onSuccessNotice(`Practice Set "${newSet.title}" published to ${newSet.class} students!`);
      }
    } catch (err) {
      console.error('Error creating set:', err);
      alert('Failed to publish practice set to Firestore. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async (setId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete Practice Set "${title}" from Firestore?`)) return;
    soundFx.playPop();
    setLoading(true);

    try {
      await deletePracticeSetFromFirestore(setId);
      setPracticeSets(prev => prev.filter(s => s.id !== setId && s.practiceSetId !== setId));
      if (onSuccessNotice) onSuccessNotice(`Practice Set "${title}" deleted.`);
    } catch (err) {
      console.error('Error deleting practice set:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToForm = () => {
    const nextIdx = formQuestions.length + 1;
    setFormQuestions(prev => [
      ...prev,
      {
        questionId: `q_${Date.now()}_${nextIdx}`,
        questionText: `Sample question ${nextIdx} for ${setForm.chapterName}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Curriculum explanation for this problem.',
        marks: 1
      }
    ]);
  };

  const handleUpdateQuestion = (index: number, field: keyof PracticeQuestionItem, value: any) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      const opts = [...(copy[qIdx].options || [])];
      opts[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setFormQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleImportJsonQuestions = async () => {
    if (!showImportModal || !importJsonText.trim()) return;
    soundFx.playClick();
    setLoading(true);

    try {
      const parsed = JSON.parse(importJsonText);
      const questionsArray: PracticeQuestionItem[] = Array.isArray(parsed) ? parsed : [parsed];

      const updatedQuestions = [...(showImportModal.questions || []), ...questionsArray];
      const updatedSet: PracticeSetDoc = {
        ...showImportModal,
        questions: updatedQuestions,
        totalQuestions: updatedQuestions.length,
        totalMarks: updatedQuestions.reduce((acc, q) => acc + (q.marks || 1), 0),
        publishedAt: new Date().toISOString()
      };

      await publishPracticeSet(updatedSet);
      setPracticeSets(prev => prev.map(s => (s.id === updatedSet.id ? updatedSet : s)));
      setShowImportModal(null);
      setImportJsonText('');
      soundFx.playSuccess();
      if (onSuccessNotice) onSuccessNotice(`Imported ${questionsArray.length} questions into "${updatedSet.title}"!`);
    } catch (err) {
      alert('Invalid JSON format. Please provide a valid array of question objects.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSets = practiceSets.filter(s => {
    if (filterClass !== 'All') {
      const sCls = String(s.class || '').toLowerCase();
      const fCls = filterClass.toLowerCase();
      if (!sCls.includes(fCls) && !fCls.includes(sCls)) return false;
    }

    if (filterSubject !== 'All') {
      const sSub = (s.subject || s.subjectName || '').toLowerCase();
      const fSub = filterSubject.toLowerCase();
      if (!sSub.includes(fSub)) return false;
    }

    if (searchQuery.trim()) {
      const text = `${s.title} ${s.subject} ${s.chapterName} ${s.description}`.toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar & Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase">
              Vidya AI Practice System
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
              Live Firestore Sync
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Practice Set Creator & Publisher</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Publish real curriculum questions and chapter practice sets. All changes stream live to student dashboards in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSets}
            disabled={loading}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowCreateModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Practice Set</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sets by title, chapter or subject..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 5">Class 5</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physical Science">Physical Science</option>
            <option value="Biological Science">Biological Science</option>
            <option value="Environmental Studies">Environmental Studies</option>
            <option value="Social Studies">Social Studies</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      {/* Practice Sets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Loading Firestore practice sets...</p>
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 p-6">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white">No practice sets available yet.</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create and publish your first practice set to Firestore using the button above.
            </p>
          </div>
        ) : (
          filteredSets.map((pset) => (
            <div
              key={pset.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500 transition relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase">
                      {pset.class || 'Class 10'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                      {pset.subject || pset.subjectName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase">
                    {pset.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{pset.title}</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    Chapter: {pset.chapterName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium line-clamp-2">
                    {pset.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Questions</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {pset.questions?.length || pset.totalQuestions || 0} Qs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Total Marks</span>
                    <span className="font-black text-blue-600 dark:text-blue-400">{pset.totalMarks || 0} M</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Duration</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{pset.duration || 30}m</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInspectingSet(pset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Questions</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowImportModal(pset);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Qs</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteSet(pset.id, pset.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                  title="Delete Practice Set"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INSPECT QUESTIONS MODAL */}
      {inspectingSet && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">{inspectingSet.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {inspectingSet.class} • {inspectingSet.subject} • {inspectingSet.chapterName} ({inspectingSet.questions?.length || 0} Questions)
                </p>
              </div>
              <button
                onClick={() => setInspectingSet(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {inspectingSet.questions && inspectingSet.questions.length > 0 ? (
                inspectingSet.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Question {idx + 1}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">+{q.marks || 1} Mark</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{q.questionText || q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = Number(q.correctAnswer) === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrect && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-xs">
                        <strong className="text-amber-700 dark:text-amber-300 block">Explanation:</strong>
                        <p className="text-amber-900 dark:text-amber-100 mt-0.5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No questions in this practice set.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingSet(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRACTICE SET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create & Publish Practice Set</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Build structured practice sets with real curriculum questions saved to Firestore.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSet} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Board *</label>
                  <select
                    value={setForm.board}
                    onChange={(e) => setSetForm({ ...setForm, board: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="State Board (TG/AP)">State Board (TG/AP)</option>
                    <option value="CBSE">CBSE</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Class Grade *</label>
                  <select
                    value={setForm.class}
                    onChange={(e) => setSetForm({ ...setForm, class: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 5">Class 5</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Subject *</label>
                  <select
                    value={setForm.subject}
                    onChange={(e) => setSetForm({ ...setForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physical Science">Physical Science</option>
                    <option value="Biological Science">Biological Science</option>
                    <option value="Environmental Studies">Environmental Studies</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    required
                    value={setForm.chapterName}
                    onChange={(e) => setSetForm({ 
                      ...setForm, 
                      chapterName: e.target.value,
                      chapterId: `chap_${e.target.value.toLowerCase().replace(/\s+/g, '_')}`
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1">Practice Set Title *</label>
                  <input
                    type="text"
                    required
                    value={setForm.title}
                    onChange={(e) => setSetForm({ ...setForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={setForm.description}
                  onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Questions Builder Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    Questions ({formQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestionToForm}
                    className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-extrabold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {formQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Q{qIdx + 1}</span>
                        {formQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-500 hover:text-rose-600 text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Question text..."
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center space-x-1">
                            <span className="text-[10px] font-bold text-slate-400 w-4">
                              {String.fromCharCode(65 + oIdx)}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Correct Option</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Explanation</label>
                          <input
                            type="text"
                            placeholder="Explanation..."
                            value={q.explanation}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formQuestions.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
                >
                  {loading ? 'Publishing...' : 'Publish to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT JSON MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Questions to "{showImportModal.title}"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste an array of question JSON objects to append to this practice set.
                </p>
              </div>
              <button onClick={() => setShowImportModal(null)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`[
  {
    "questionText": "What is the HCF of 12 and 18?",
    "options": ["2", "3", "6", "12"],
    "correctAnswer": 2,
    "explanation": "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Highest common factor is 6.",
    "marks": 1
  }
]`}
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJsonQuestions}
                disabled={loading || !importJsonText.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                Import to Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
