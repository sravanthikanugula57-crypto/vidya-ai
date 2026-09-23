import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Send,
  Eye,
  FileCheck,
  Save,
  Check,
  X,
  Search,
  ChevronDown,
  Filter,
  ArrowRight,
  GraduationCap,
  Globe,
  Sliders
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  OFFICIAL_CLASSES, 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OfficialClassGrade,
  OfficialSubject,
  OfficialChapter 
} from '../../../data/officialSyllabusData';
import { 
  PracticeSetDoc, 
  PracticeQuestionItem, 
  publishPracticeSet, 
  savePracticeSetDraft,
  subscribeToAllPracticeSets,
  deletePracticeSetFromFirestore 
} from '../../../services/practiceService';

interface TeacherAIPracticeSetStudioProps {
  currentUser?: any;
  onNavigateToMonitoring?: () => void;
}

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'Physical Science',
  'Biological Science',
  'Social Science',
  'English',
  'Hindi',
  'Telugu'
];

const BOARD_OPTIONS = [
  'State Board (AP/TS SCERT)',
  'CBSE',
  'ICSE'
];

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Mixed'];
const QUESTION_TYPES = [
  'Multiple Choice Questions (MCQ)',
  'True / False',
  'Fill in the Blank',
  'Mixed'
];
const LANGUAGE_OPTIONS = ['English', 'Telugu', 'Hindi'];
const QUESTION_COUNTS: (number | 'Custom')[] = [10, 20, 30, 50, 'Custom'];

export const TeacherAIPracticeSetStudio: React.FC<TeacherAIPracticeSetStudioProps> = ({
  currentUser,
  onNavigateToMonitoring
}) => {
  // Views: 'generator' | 'review' | 'manage'
  const [activeSubView, setActiveSubView] = useState<'generator' | 'review' | 'manage'>('generator');

  // Generator Form State
  const [selectedBoard, setSelectedBoard] = useState('State Board (AP/TS SCERT)');
  const [selectedClass, setSelectedClass] = useState<OfficialClassGrade>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [topicFocus, setTopicFocus] = useState('');
  const [numQuestionsChoice, setNumQuestionsChoice] = useState<number | 'Custom'>(10);
  const [customNumQuestions, setCustomNumQuestions] = useState(15);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedQuestionType, setSelectedQuestionType] = useState('Multiple Choice Questions (MCQ)');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [customInstructions, setCustomInstructions] = useState('');

  // Generation Loading State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Review Screen State (The in-progress generated Practice Set)
  const [reviewSet, setReviewSet] = useState<PracticeSetDoc | null>(null);
  const [regeneratingQId, setRegeneratingQId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving_draft' | 'publishing' | 'saved'>('idle');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Manage / Library State
  const [existingSets, setExistingSets] = useState<PracticeSetDoc[]>([]);
  const [manageFilterClass, setManageFilterClass] = useState('All');
  const [manageFilterStatus, setManageFilterStatus] = useState<'All' | 'published' | 'draft'>('All');
  const [manageSearch, setManageSearch] = useState('');
  const [inspectingSet, setInspectingSet] = useState<PracticeSetDoc | null>(null);

  // Subscribe to real Firestore practice sets
  useEffect(() => {
    const unsub = subscribeToAllPracticeSets((sets) => {
      setExistingSets(sets);
    });
    return () => unsub();
  }, []);

  // Compute available chapters dynamically based on selectedClass and selectedSubject
  // Strictly respects rule: NEVER show Class 10 chapters for Class 5, never use fallback chapter data.
  const availableChapters: OfficialChapter[] = useMemo(() => {
    const classSyllabus = OFFICIAL_SYLLABUS_BY_CLASS[selectedClass] || [];
    const normSubject = selectedSubject.toLowerCase();

    // Match official subject
    let matchedSubject: OfficialSubject | undefined;

    if (normSubject.includes('math')) {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('math'));
    } else if (normSubject === 'physical science') {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('physical') || s.name.toLowerCase().includes('physics'));
    } else if (normSubject === 'biological science') {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('bio'));
    } else if (normSubject === 'science') {
      // Could be general science or EVS in lower classes
      matchedSubject = classSyllabus.find(s => 
        s.name.toLowerCase().includes('general science') || 
        s.name.toLowerCase().includes('environmental') ||
        s.name.toLowerCase().includes('evs') ||
        s.name.toLowerCase().includes('science')
      );
    } else if (normSubject.includes('social')) {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('social'));
    } else if (normSubject.includes('english')) {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('english'));
    } else if (normSubject.includes('hindi')) {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('hindi'));
    } else if (normSubject.includes('telugu')) {
      matchedSubject = classSyllabus.find(s => s.name.toLowerCase().includes('telugu'));
    }

    return matchedSubject?.chapters || [];
  }, [selectedClass, selectedSubject]);

  // Update selectedChapterId automatically when availableChapters change
  useEffect(() => {
    if (availableChapters.length > 0) {
      // If current selected chapter is not in the list, default to first available
      if (!availableChapters.some(c => c.id === selectedChapterId)) {
        setSelectedChapterId(availableChapters[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [availableChapters, selectedChapterId]);

  const selectedChapterObj = useMemo(() => {
    return availableChapters.find(c => c.id === selectedChapterId);
  }, [availableChapters, selectedChapterId]);

  // Handle AI Practice Set Generation
  const handleGenerateAI = async () => {
    soundFx.playClick();
    if (!selectedChapterObj) {
      setGenerationError('Please select an official curriculum chapter.');
      return;
    }

    const count = numQuestionsChoice === 'Custom' ? customNumQuestions : numQuestionsChoice;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const payload = {
        board: selectedBoard,
        class: selectedClass,
        subject: selectedSubject,
        chapterId: selectedChapterObj.id,
        chapterName: selectedChapterObj.title,
        topic: topicFocus.trim(),
        numQuestions: count,
        difficulty: selectedDifficulty,
        questionType: selectedQuestionType,
        language: selectedLanguage,
        customInstructions: customInstructions.trim()
      };

      const res = await fetch('/api/ai/generate-practice-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const newPracticeSetId = `pset_${Date.now()}`;
      const now = new Date().toISOString();

      const newSet: PracticeSetDoc = {
        id: newPracticeSetId,
        practiceSetId: newPracticeSetId,
        board: selectedBoard,
        class: selectedClass,
        subject: selectedSubject,
        chapterId: selectedChapterObj.id,
        chapterName: selectedChapterObj.title,
        title: data.title || `${selectedChapterObj.title} - AI Practice Set`,
        description: data.description || `Curriculum-aligned practice set generated by Vidya AI for ${selectedClass} ${selectedSubject}.`,
        language: selectedLanguage,
        isAiGenerated: true,
        questions: data.questions || [],
        totalQuestions: (data.questions || []).length,
        marksPerQuestion: 1,
        totalMarks: (data.questions || []).length,
        createdBy: currentUser?.name || currentUser?.displayName || 'Faculty Instructor',
        createdAt: now,
        updatedAt: now,
        publishedAt: '',
        status: 'draft',
        published: false,
        difficulty: selectedDifficulty,
        questionType: selectedQuestionType
      };

      setReviewSet(newSet);
      setActiveSubView('review');
      soundFx.playSuccess();
      setNoticeMessage('AI Practice Set generated! Review and customize the questions below.');
    } catch (err: any) {
      console.error('Practice Set Generation failed:', err);
      setGenerationError(err.message || 'Failed to generate practice set. Please try again.');
      soundFx.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate a single question with AI
  const handleRegenerateQuestion = async (qIndex: number) => {
    if (!reviewSet) return;
    const targetQ = reviewSet.questions[qIndex];
    if (!targetQ) return;

    soundFx.playClick();
    setRegeneratingQId(targetQ.questionId);

    try {
      const res = await fetch('/api/ai/regenerate-practice-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: reviewSet.board,
          class: reviewSet.class,
          subject: reviewSet.subject,
          chapterName: reviewSet.chapterName,
          difficulty: reviewSet.difficulty || 'Medium',
          questionType: reviewSet.questionType || 'MCQ',
          language: reviewSet.language || 'English',
          questionNumber: qIndex + 1,
          previousQuestionText: targetQ.questionText
        })
      });

      if (!res.ok) throw new Error('Regeneration request failed');
      const data = await res.json();
      if (data.question) {
        const updatedQuestions = [...reviewSet.questions];
        updatedQuestions[qIndex] = {
          ...data.question,
          questionId: targetQ.questionId // Keep same or updated id
        };
        setReviewSet({
          ...reviewSet,
          questions: updatedQuestions
        });
        soundFx.playSuccess();
      }
    } catch (err) {
      console.error('Error regenerating question:', err);
      soundFx.playError();
    } finally {
      setRegeneratingQId(null);
    }
  };

  // Add a blank question for teacher to customize
  const handleAddQuestion = () => {
    if (!reviewSet) return;
    soundFx.playClick();
    const newQNumber = reviewSet.questions.length + 1;
    const newQ: PracticeQuestionItem = {
      questionId: `q_${Date.now()}_${newQNumber}`,
      questionText: `New Question ${newQNumber} on ${reviewSet.chapterName}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: `Explanation for question ${newQNumber}.`,
      marks: 1,
      difficulty: reviewSet.difficulty || 'Medium',
      questionType: 'MCQ'
    };

    const updated = [...reviewSet.questions, newQ];
    setReviewSet({
      ...reviewSet,
      questions: updated,
      totalQuestions: updated.length,
      totalMarks: updated.length
    });
  };

  // Delete a question from review set
  const handleDeleteQuestion = (qIndex: number) => {
    if (!reviewSet) return;
    if (reviewSet.questions.length <= 1) {
      alert('A practice set must contain at least 1 question.');
      return;
    }
    soundFx.playClick();
    const updated = reviewSet.questions.filter((_, idx) => idx !== qIndex);
    setReviewSet({
      ...reviewSet,
      questions: updated,
      totalQuestions: updated.length,
      totalMarks: updated.length
    });
  };

  // Update question text, option, correct answer, or explanation
  const handleUpdateQuestionField = (
    qIndex: number, 
    field: 'questionText' | 'explanation' | 'correctAnswer', 
    value: any
  ) => {
    if (!reviewSet) return;
    const updated = [...reviewSet.questions];
    updated[qIndex] = {
      ...updated[qIndex],
      [field]: value
    };
    setReviewSet({ ...reviewSet, questions: updated });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, val: string) => {
    if (!reviewSet) return;
    const updated = [...reviewSet.questions];
    const newOpts = [...updated[qIndex].options];
    newOpts[optIndex] = val;
    updated[qIndex] = {
      ...updated[qIndex],
      options: newOpts
    };
    setReviewSet({ ...reviewSet, questions: updated });
  };

  // Save as Draft (Hidden from students)
  const handleSaveDraft = async () => {
    if (!reviewSet) return;
    soundFx.playClick();
    setSavingStatus('saving_draft');
    try {
      await savePracticeSetDraft(reviewSet);
      soundFx.playSuccess();
      setSavingStatus('saved');
      setNoticeMessage('Practice Set saved as DRAFT in Firestore. It is hidden from students.');
      setTimeout(() => {
        setSavingStatus('idle');
        setActiveSubView('manage');
      }, 1200);
    } catch (e: any) {
      console.error('Failed to save draft:', e);
      soundFx.playError();
      setSavingStatus('idle');
      alert('Failed to save draft: ' + e.message);
    }
  };

  // Publish Practice Set (Instantly visible to students of that class/board/subject/chapter)
  const handlePublish = async () => {
    if (!reviewSet) return;
    soundFx.playClick();
    setSavingStatus('publishing');
    try {
      await publishPracticeSet(reviewSet);
      soundFx.playSuccess();
      setSavingStatus('saved');
      setNoticeMessage(`Practice Set PUBLISHED successfully! Students of ${reviewSet.class} in ${reviewSet.subject} -> "${reviewSet.chapterName}" can now start practicing immediately.`);
      setTimeout(() => {
        setSavingStatus('idle');
        setActiveSubView('manage');
      }, 1500);
    } catch (e: any) {
      console.error('Failed to publish practice set:', e);
      soundFx.playError();
      setSavingStatus('idle');
      alert('Failed to publish practice set: ' + e.message);
    }
  };

  // Delete Practice Set from Firestore
  const handleDeleteSet = async (setId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this practice set from Firestore?')) {
      return;
    }
    soundFx.playClick();
    try {
      await deletePracticeSetFromFirestore(setId);
      soundFx.playSuccess();
      setNoticeMessage('Practice set deleted from Firestore.');
    } catch (e) {
      console.error('Failed to delete practice set:', e);
    }
  };

  // Filtered practice sets in Manage tab
  const filteredSets = useMemo(() => {
    return existingSets.filter(s => {
      if (manageFilterClass !== 'All' && s.class !== manageFilterClass) return false;
      if (manageFilterStatus === 'published' && s.status !== 'published') return false;
      if (manageFilterStatus === 'draft' && s.status !== 'draft') return false;
      if (manageSearch.trim()) {
        const q = manageSearch.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchChap = s.chapterName.toLowerCase().includes(q);
        const matchSubj = s.subject.toLowerCase().includes(q);
        if (!matchTitle && !matchChap && !matchSubj) return false;
      }
      return true;
    });
  }, [existingSets, manageFilterClass, manageFilterStatus, manageSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12" id="teacher-ai-practice-studio">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-blue-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>AI-Powered Curriculum Question Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              AI Practice Set Generator
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Generate curriculum-aligned practice questions for Classes 5 to 10. Review, edit, test, and publish directly to the Student Practice Center in real-time.
            </p>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => { soundFx.playClick(); setActiveSubView('generator'); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'generator'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            {reviewSet && (
              <button
                onClick={() => { soundFx.playClick(); setActiveSubView('review'); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubView === 'review'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-amber-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Review & Publish ({reviewSet.questions.length})</span>
              </button>
            )}

            <button
              onClick={() => { soundFx.playClick(); setActiveSubView('manage'); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'manage'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Library ({existingSets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Message Toast */}
      {noticeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button 
            onClick={() => setNoticeMessage(null)}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: GENERATOR FORM                                                   */}
      {/* ========================================================================= */}
      {activeSubView === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Configuration Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Curriculum & Configuration Parameters</span>
              </h2>

              {/* 1. Board Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Academic Curriculum Board
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BOARD_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedBoard(b); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border text-center ${
                        selectedBoard === b
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Class Selection (Classes 5 to 10) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  1. Target Grade Level
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {OFFICIAL_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedClass(cls); }}
                      className={`py-3 px-2 rounded-2xl text-xs font-extrabold transition border text-center flex flex-col items-center gap-1 ${
                        selectedClass === cls
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 opacity-70" />
                      <span>{cls}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  2. Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUBJECT_OPTIONS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedSubject(subj); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border text-center ${
                        selectedSubject === subj
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Dynamic Chapter Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    3. Chapter / Topic (Dynamic Syllabus for {selectedClass})
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {availableChapters.length} chapters found
                  </span>
                </div>

                {availableChapters.length > 0 ? (
                  <div className="space-y-3">
                    <select
                      value={selectedChapterId}
                      onChange={(e) => setSelectedChapterId(e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {availableChapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          Chapter {ch.chapterNumber}: {ch.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Optional: Sub-topic or focus concept (e.g. Fundamental Theorem of Arithmetic)"
                      value={topicFocus}
                      onChange={(e) => setTopicFocus(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>No chapters available for this class and subject.</span>
                  </div>
                )}
              </div>

              {/* 5. Number of Questions */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  4. Number of Questions
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {QUESTION_COUNTS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => { soundFx.playClick(); setNumQuestionsChoice(cnt); }}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold transition border ${
                        numQuestionsChoice === cnt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {cnt === 'Custom' ? 'Custom' : `${cnt} Questions`}
                    </button>
                  ))}

                  {numQuestionsChoice === 'Custom' && (
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="number"
                        min={3}
                        max={50}
                        value={customNumQuestions}
                        onChange={(e) => setCustomNumQuestions(Math.max(3, Math.min(50, Number(e.target.value) || 10)))}
                        className="w-20 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">questions (3 - 50)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Difficulty & Question Type Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    5. Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => { soundFx.playClick(); setSelectedDifficulty(diff); }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition border text-center ${
                          selectedDifficulty === diff
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    6. Output Language
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => { soundFx.playClick(); setSelectedLanguage(lang); }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition border text-center flex items-center justify-center gap-1 ${
                          selectedLanguage === lang
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        <span>{lang}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. Question Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  7. Question Type Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedQuestionType(qt); }}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition border text-center ${
                        selectedQuestionType === qt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {qt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. Additional Teacher Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Special Examiner Directives (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Include real-world word problems, focus on theorems, avoid complex trigonometry"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Error Display */}
              {generationError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || availableChapters.length === 0}
                className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isGenerating || availableChapters.length === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 active:scale-[0.99]'
                }`}
                id="generate-practice-set-ai-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Analyzing Curriculum & Generating Practice Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span>Generate Practice Set with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Summary & Curriculum Verification Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Curriculum Verification
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Board:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedBoard}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{selectedClass}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedSubject}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Selected Chapter:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-right max-w-[180px] truncate">
                    {selectedChapterObj ? selectedChapterObj.title : 'None'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Language:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedLanguage}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">Question Volume:</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">
                    {numQuestionsChoice === 'Custom' ? customNumQuestions : numQuestionsChoice} Questions
                  </span>
                </div>
              </div>

              {/* Strict AI Label Notice Requirement */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>AI Labeling Transparency</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Generated sets will be tagged as <span className="font-extrabold text-blue-700 dark:text-blue-300">"AI-Generated Practice Set"</span>. They are never falsely labeled as official SCERT or textbook questions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Publishing</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  When you click <span className="font-bold text-emerald-700 dark:text-emerald-300">"Publish Practice Set"</span>, enrolled students of {selectedClass} see it live in their Practice Center immediately without refreshing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEACHER REVIEW & EDIT SCREEN                                     */}
      {/* ========================================================================= */}
      {activeSubView === 'review' && reviewSet && (
        <div className="space-y-6">
          {/* Review Header Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold border border-amber-300 dark:border-amber-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI-Generated Practice Set • Teacher Review Mode</span>
                </div>
                <input
                  type="text"
                  value={reviewSet.title}
                  onChange={(e) => setReviewSet({ ...reviewSet, title: e.target.value })}
                  className="text-xl md:text-2xl font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingStatus !== 'idle'}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>{savingStatus === 'saving_draft' ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={savingStatus !== 'idle'}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                  id="teacher-publish-practice-set-btn"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingStatus === 'publishing' ? 'Publishing Live...' : 'Publish Practice Set'}</span>
                </button>
              </div>
            </div>

            {/* Set Meta Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Class</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{reviewSet.class}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Subject</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{reviewSet.subject}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Chapter</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block" title={reviewSet.chapterName}>
                  {reviewSet.chapterName}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Language</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{reviewSet.language || 'English'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Difficulty</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">{reviewSet.difficulty || 'Medium'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-bold">Total Questions</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{reviewSet.questions.length}</span>
              </div>
            </div>
          </div>

          {/* Questions Review List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Generated Questions ({reviewSet.questions.length})</span>
              </h3>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {reviewSet.questions.map((q, qIdx) => {
              const isRegenerating = regeneratingQId === q.questionId;
              const corrIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;

              return (
                <div
                  key={q.questionId || qIdx}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative"
                >
                  {/* Question Header & Controls */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                        Q{qIdx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {q.questionType || 'MCQ'} • {q.marks || 1} mark
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Regenerate Single Question */}
                      <button
                        type="button"
                        onClick={() => handleRegenerateQuestion(qIdx)}
                        disabled={isRegenerating}
                        title="Regenerate this question with AI"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : ''}`} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>

                      {/* Delete Question */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        title="Delete question"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Textarea */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Question Text
                    </label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'questionText', e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Options (4 options) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Options & Correct Answer (Click radio to set correct answer)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = corrIdx === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleUpdateQuestionField(qIdx, 'correctAnswer', optIdx)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 ring-1 ring-emerald-400'
                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${qIdx}_correct`}
                              checked={isCorrect}
                              onChange={() => handleUpdateQuestionField(qIdx, 'correctAnswer', optIdx)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-bold text-xs text-slate-500 dark:text-slate-400 w-5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none flex-1"
                            />
                            {isCorrect && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step-by-step Explanation */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Curriculum Explanation (Pedagogical justification)
                    </label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'explanation', e.target.value)}
                      placeholder="Explain why this answer is correct according to the textbook..."
                      className="w-full p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs font-medium text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              );
            })}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingStatus !== 'idle'}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={savingStatus !== 'idle'}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Practice Set</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: PRACTICE SETS LIBRARY & MANAGEMENT                               */}
      {/* ========================================================================= */}
      {activeSubView === 'manage' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sets by chapter or title..."
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class Filter */}
              <select
                value={manageFilterClass}
                onChange={(e) => setManageFilterClass(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Classes</option>
                {OFFICIAL_CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={manageFilterStatus}
                onChange={(e) => setManageFilterStatus(e.target.value as any)}
                className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <button
              onClick={() => { soundFx.playClick(); setActiveSubView('generator'); }}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-sm self-stretch md:self-auto justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Practice Set</span>
            </button>
          </div>

          {/* Practice Sets List */}
          {filteredSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSets.map((pset) => {
                const isPub = pset.status === 'published' || pset.published;

                return (
                  <div
                    key={pset.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          isPub 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{isPub ? 'Published' : 'Draft'}</span>
                        </span>

                        {pset.isAiGenerated && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span>AI-Generated</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {pset.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {pset.chapterName} • {pset.subject}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{pset.class}</span>
                        <span>•</span>
                        <span>{pset.totalQuestions || pset.questions?.length || 0} Questions</span>
                        <span>•</span>
                        <span>{pset.difficulty || 'Medium'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setReviewSet(pset);
                          setActiveSubView('review');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Set</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {!isPub ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              publishPracticeSet(pset);
                              soundFx.playSuccess();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              savePracticeSetDraft({ ...pset, status: 'draft' });
                              soundFx.playSuccess();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 text-[11px] font-bold cursor-pointer"
                            title="Unpublish (move back to draft)"
                          >
                            Unpublish
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteSet(pset.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                No practice sets available yet.
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the AI Practice Set Generator to create your first curriculum-aligned practice questions set.
              </p>
              <button
                type="button"
                onClick={() => { soundFx.playClick(); setActiveSubView('generator'); }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 transition"
              >
                Launch Generator
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
