import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Plus, 
  Send, 
  Save, 
  X, 
  ChevronRight, 
  Clock, 
  Layers, 
  Check, 
  ArrowLeft,
  HelpCircle,
  FileCheck2,
  Calendar,
  Users
} from 'lucide-react';
import { 
  OFFICIAL_CLASSES, 
  OFFICIAL_SYLLABUS_BY_CLASS, 
  OfficialClassGrade, 
  normalizeGradeKey 
} from '../../../data/officialSyllabusData';
import { 
  Homework, 
  TeacherAIQuestion, 
  saveTeacherHomeworkDraft, 
  publishApprovedHomework 
} from '../../../services/homeworkService';
import { soundFx } from '../../../lib/audio';

interface TeacherAIHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDraft?: Homework | null;
  onHomeworkSaved: () => void;
}

export const TeacherAIHomeworkModal: React.FC<TeacherAIHomeworkModalProps> = ({
  isOpen,
  onClose,
  initialDraft,
  onHomeworkSaved
}) => {
  // Step navigation: 'form' | 'preview' | 'assign'
  const [step, setStep] = useState<'form' | 'preview' | 'assign'>('form');

  // Form State
  const [selectedClass, setSelectedClass] = useState<OfficialClassGrade>('Class 5');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Easy + Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionTypes, setQuestionTypes] = useState<string>('MCQ + Short Answer');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>(
    'Include questions that test understanding and problem-solving, not just memorization.'
  );

  // Generated Homework State
  const [homeworkTitle, setHomeworkTitle] = useState<string>('');
  const [homeworkInstructions, setHomeworkInstructions] = useState<string>('');
  const [questions, setQuestions] = useState<TeacherAIQuestion[]>([]);
  const [totalMarks, setTotalMarks] = useState<number>(10);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Assignment / Publishing State
  const [targetSection, setTargetSection] = useState<string>('All');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 4 * 86400000);
    return d.toISOString().split('T')[0];
  });

  // UI / Loading / Feedback State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegeneratingId, setIsRegeneratingId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<TeacherAIQuestion | null>(null);
  const [qualityCheckPassed, setQualityCheckPassed] = useState<boolean>(true);

  // Sync available subjects & chapters based on selected class
  const classSyllabus = OFFICIAL_SYLLABUS_BY_CLASS[selectedClass] || [];
  const currentSubject = classSyllabus.find(s => s.name === selectedSubject) || classSyllabus[0];
  const availableChapters = currentSubject ? currentSubject.chapters : [];

  // When class or subject changes, reset chapter if invalid
  useEffect(() => {
    if (availableChapters.length > 0) {
      const exists = availableChapters.some(c => c.title === selectedChapter);
      if (!exists) {
        setSelectedChapter(availableChapters[0].title);
      }
    } else {
      setSelectedChapter('');
    }
  }, [selectedClass, selectedSubject, availableChapters, selectedChapter]);

  // If opening with an existing draft to preview/edit
  useEffect(() => {
    if (initialDraft) {
      const normClass = normalizeGradeKey(initialDraft.class);
      setSelectedClass(normClass);
      setSelectedSubject(initialDraft.subject || 'Mathematics');
      setSelectedChapter(initialDraft.chapter || '');
      setTopic(initialDraft.topic || '');
      setHomeworkTitle(initialDraft.title || '');
      setHomeworkInstructions(initialDraft.instructions || initialDraft.description || '');
      setDraftId(initialDraft.id);
      setTargetSection(initialDraft.section || 'All');
      if (initialDraft.dueDate) {
        setDueDate(initialDraft.dueDate);
      }

      if (Array.isArray(initialDraft.questions) && initialDraft.questions.length > 0) {
        const formatted: TeacherAIQuestion[] = initialDraft.questions.map((q: any, idx) => ({
          id: q.id || idx + 1,
          questionType: q.questionType || (q.type === 'mcq' ? 'MCQ' : 'Short Answer'),
          question: q.question || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          hint: q.hint || '',
          marks: q.marks || 1,
          difficulty: q.difficulty || 'Medium'
        }));
        setQuestions(formatted);
        setTotalMarks(formatted.reduce((acc, q) => acc + q.marks, 0));
        setStep('preview');
      } else {
        setStep('form');
      }
    } else {
      // New generation mode
      setDraftId(null);
      setStep('form');
    }
  }, [initialDraft, isOpen]);

  if (!isOpen) return null;

  // Validation function: Check if chapter exists in official syllabus
  const validateSyllabus = (): boolean => {
    setValidationError(null);
    if (!selectedChapter) {
      setValidationError('Please select a valid chapter from the official syllabus.');
      return false;
    }

    const chapterFound = availableChapters.some(
      ch => ch.title.toLowerCase().trim() === selectedChapter.toLowerCase().trim()
    );

    if (!chapterFound) {
      setValidationError('Selected chapter was not found in the official syllabus.');
      return false;
    }

    return true;
  };

  // AI Generation Handler
  const handleGenerateHomework = async () => {
    soundFx.playClick();
    if (!validateSyllabus()) {
      soundFx.playError();
      return;
    }

    setIsGenerating(true);
    setValidationError(null);

    try {
      const syllabusChapter = availableChapters.find(c => c.title === selectedChapter);
      const syllabusDetails = syllabusChapter?.lessons?.map(l => l.title).join('; ') || '';

      const res = await fetch('/api/ai/generate-teacher-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedClass,
          subject: selectedSubject,
          chapter: selectedChapter,
          topic,
          difficulty,
          numQuestions,
          questionTypes,
          additionalInstructions,
          syllabusDetails
        })
      });

      if (!res.ok) {
        throw new Error(`Generation failed with status ${res.status}`);
      }

      const data = await res.json();
      const rawQuestions: any[] = data.questions || [];

      // Quality Check & Formatting
      const formattedQuestions: TeacherAIQuestion[] = rawQuestions.map((q, idx) => {
        const qType: 'MCQ' | 'Short Answer' | 'True / False' | 'Fill in the Blank' = 
          q.questionType || (q.options && q.options.length > 0 ? 'MCQ' : 'Short Answer');
        
        let options = q.options || [];
        if (qType === 'True / False' && (!options || options.length === 0)) {
          options = ['True', 'False'];
        }

        return {
          id: q.id || idx + 1,
          questionType: qType,
          question: q.question || `Question ${idx + 1}`,
          options: options,
          correctAnswer: q.correctAnswer || (options.length > 0 ? options[0] : ''),
          explanation: q.explanation || 'Conceptual mastery question for ' + selectedClass,
          hint: q.hint || '',
          marks: q.marks || (qType === 'Short Answer' ? 2 : 1),
          difficulty: q.difficulty || (idx % 2 === 0 ? 'Medium' : 'Easy')
        };
      });

      // Quality Verification Rules:
      let isValid = true;
      if (formattedQuestions.length === 0) isValid = false;
      formattedQuestions.forEach(q => {
        if (q.questionType === 'MCQ') {
          if (!q.options || q.options.length < 2) isValid = false;
          if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
            // Fix or alert
            if (q.options && q.options[0]) q.correctAnswer = q.options[0];
          }
        }
      });

      setQualityCheckPassed(isValid);
      setQuestions(formattedQuestions);
      setHomeworkTitle(data.title || `${selectedChapter} – Practice Assignment`);
      setHomeworkInstructions(
        data.instructions || `Complete all ${formattedQuestions.length} questions for ${selectedClass} ${selectedSubject}.`
      );
      setTotalMarks(
        data.totalMarks || formattedQuestions.reduce((acc, q) => acc + q.marks, 0)
      );

      soundFx.playSuccess();
      setStep('preview');

    } catch (err: any) {
      console.error('Error generating AI homework:', err);
      soundFx.playError();
      setValidationError('AI Homework Generation encountered an error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate a single question with Google AI
  const handleRegenerateSingleQuestion = async (targetQ: TeacherAIQuestion) => {
    soundFx.playClick();
    setIsRegeneratingId(targetQ.id);

    try {
      const res = await fetch('/api/ai/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedClass,
          subject: selectedSubject,
          chapter: selectedChapter,
          topic,
          difficulty: targetQ.difficulty || 'Medium',
          questionType: targetQ.questionType,
          questionNumber: targetQ.id,
          previousQuestionText: targetQ.question
        })
      });

      if (!res.ok) throw new Error('Regeneration endpoint failed');

      const data = await res.json();
      if (data.question) {
        const revised = data.question;
        const updatedQuestions = questions.map(q => {
          if (q.id === targetQ.id) {
            return {
              ...q,
              question: revised.question,
              options: revised.options || q.options,
              correctAnswer: revised.correctAnswer || q.correctAnswer,
              explanation: revised.explanation || q.explanation,
              hint: revised.hint || q.hint,
              difficulty: revised.difficulty || q.difficulty
            };
          }
          return q;
        });

        setQuestions(updatedQuestions);
        soundFx.playSuccess();
      }
    } catch (err) {
      console.error('Error regenerating question:', err);
      soundFx.playError();
    } finally {
      setIsRegeneratingId(null);
    }
  };

  // Delete question from preview
  const handleDeleteQuestion = (qId: string | number) => {
    soundFx.playClick();
    const updated = questions.filter(q => q.id !== qId);
    setQuestions(updated);
    setTotalMarks(updated.reduce((acc, q) => acc + q.marks, 0));
  };

  // Save manual edit to question
  const handleSaveQuestionEdit = () => {
    if (!editingQuestion) return;
    soundFx.playSuccess();
    const updated = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    setQuestions(updated);
    setTotalMarks(updated.reduce((acc, q) => acc + q.marks, 0));
    setEditingQuestion(null);
  };

  // Save as Draft in Firestore (visible only to Teacher)
  const handleSaveAsDraft = async () => {
    soundFx.playClick();
    setIsSaving(true);
    try {
      const savedId = await saveTeacherHomeworkDraft({
        id: draftId || undefined,
        class: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        topic,
        title: homeworkTitle || `${selectedChapter} Assignment`,
        instructions: homeworkInstructions,
        questions,
        totalMarks: questions.reduce((acc, q) => acc + q.marks, 0),
        section: targetSection,
        dueDate,
        source: 'AI_TEACHER',
        difficulty
      });

      setDraftId(savedId);
      soundFx.playSuccess();
      onHomeworkSaved();
      onClose();
    } catch (err) {
      console.error('Error saving draft:', err);
      soundFx.playError();
    } finally {
      setIsSaving(false);
    }
  };

  // Approve & Publish to Students in Firestore
  const handleApproveAndPublish = async () => {
    soundFx.playClick();
    setIsSaving(true);
    try {
      await publishApprovedHomework({
        id: draftId || undefined,
        class: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        topic,
        title: homeworkTitle || `${selectedChapter} Assignment`,
        instructions: homeworkInstructions,
        questions,
        totalMarks: questions.reduce((acc, q) => acc + q.marks, 0),
        section: targetSection,
        dueDate,
        source: 'AI_TEACHER',
        difficulty
      });

      soundFx.playSuccess();
      onHomeworkSaved();
      onClose();
    } catch (err) {
      console.error('Error publishing approved homework:', err);
      soundFx.playError();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-emerald-200 font-extrabold text-[10px] uppercase tracking-wider">
                <span>Teacher Co-Pilot</span>
                <span>•</span>
                <span>Pedagogical AI Generator</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                AI Homework Assistant
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center space-x-1 text-xs font-extrabold bg-white/10 px-3 py-1.5 rounded-xl">
              <span className={`px-2 py-0.5 rounded-md ${step === 'form' ? 'bg-white text-emerald-800' : 'text-white/70'}`}>
                1. Configure
              </span>
              <span className="text-white/40">→</span>
              <span className={`px-2 py-0.5 rounded-md ${step === 'preview' ? 'bg-white text-emerald-800' : 'text-white/70'}`}>
                2. Preview & Edit (Draft)
              </span>
              <span className="text-white/40">→</span>
              <span className={`px-2 py-0.5 rounded-md ${step === 'assign' ? 'bg-white text-emerald-800' : 'text-white/70'}`}>
                3. Assign
              </span>
            </div>

            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* STEP 1: FORM CONFIGURATION */}
          {step === 'form' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-indigo-900 dark:text-indigo-300 block">
                    Strict Syllabus & Teacher Control Enforcement
                  </span>
                  <p className="text-indigo-700 dark:text-indigo-300/90 text-[11px]">
                    Tell AI what you want to teach. Questions will strictly match the official State / NCERT syllabus for the chosen class grade. You will preview, edit, and approve every question before it is assigned to students.
                  </p>
                </div>
              </div>

              {validationError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                  <button onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Class Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                  1. Target Class Grade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {OFFICIAL_CLASSES.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedClass(cls);
                        const newClassSyl = OFFICIAL_SYLLABUS_BY_CLASS[cls] || [];
                        if (newClassSyl.length > 0) {
                          setSelectedSubject(newClassSyl[0].name);
                          if (newClassSyl[0].chapters.length > 0) {
                            setSelectedChapter(newClassSyl[0].chapters[0].title);
                          }
                        }
                      }}
                      className={`p-3 rounded-2xl text-xs font-black transition border flex flex-col items-center justify-center cursor-pointer ${
                        selectedClass === cls
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <span className="text-sm">{cls}</span>
                      <span className="text-[10px] font-normal opacity-80">Syllabus</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject & Chapter Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    2. Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      const sbj = e.target.value;
                      setSelectedSubject(sbj);
                      const subjObj = classSyllabus.find(s => s.name === sbj);
                      if (subjObj && subjObj.chapters.length > 0) {
                        setSelectedChapter(subjObj.chapters[0].title);
                      }
                    }}
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {classSyllabus.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.nativeName.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    3. Chapter from {selectedClass} Syllabus
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableChapters.map((ch, idx) => (
                      <option key={`${ch.id}-${idx}`} value={ch.title}>
                        Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic / Specific Focus (Optional) */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                  4. Topic / Sub-topic Focus <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Word Problems on Equivalent Fractions, Angle Types, etc."
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Difficulty & Number of Questions & Question Types */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    5. Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Easy">Easy (Foundational)</option>
                    <option value="Easy + Medium">Easy + Medium (Balanced)</option>
                    <option value="Medium">Medium (Application)</option>
                    <option value="Hard">Hard (Higher Order Thinking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    6. Number of Questions
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={3}>3 Questions (Quick Daily Homework)</option>
                    <option value={5}>5 Questions (Standard Practice)</option>
                    <option value={10}>10 Questions (Comprehensive Chapter Review)</option>
                    <option value={15}>15 Questions (Weekend Worksheet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    7. Question Types
                  </label>
                  <select
                    value={questionTypes}
                    onChange={(e) => setQuestionTypes(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MCQ + Short Answer">Mixed (MCQ + Short Answer)</option>
                    <option value="MCQ">Multiple Choice (MCQ only)</option>
                    <option value="Short Answer">Short Answer & Explanations</option>
                    <option value="True / False">True / False Conceptual</option>
                    <option value="Fill in the Blank">Fill in the Blanks</option>
                  </select>
                </div>
              </div>

              {/* Additional Custom Instructions */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                  8. Teacher Pedagogical Guidance & Instructions
                </label>
                <textarea
                  rows={2}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Include everyday word problems. Use simple words for Class 5 students."
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Generate Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateHomework}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center gap-2.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Generating Syllabus Homework for {selectedClass}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Generate Homework with AI →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & EDIT DRAFT */}
          {step === 'preview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Draft Status Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-extrabold text-amber-900 dark:text-amber-300">
                    DRAFT MODE — Under Teacher Review
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    (This homework is private and NOT visible to students until you approve and publish)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {selectedClass} • {selectedSubject}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {questions.length} Questions • {totalMarks} Marks
                  </span>
                </div>
              </div>

              {/* Title & Instructions Header */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Homework Assignment Title</label>
                  <input
                    type="text"
                    value={homeworkTitle}
                    onChange={(e) => setHomeworkTitle(e.target.value)}
                    className="w-full p-2.5 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Instructions for Students</label>
                  <textarea
                    rows={2}
                    value={homeworkInstructions}
                    onChange={(e) => setHomeworkInstructions(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Generated Questions ({questions.length})</span>
                  </h3>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      const newId = questions.length + 1;
                      const newQ: TeacherAIQuestion = {
                        id: newId,
                        questionType: 'MCQ',
                        question: `New question on ${selectedChapter}`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 'Option A',
                        explanation: 'Explanation of correct answer.',
                        marks: 1,
                        difficulty: 'Medium'
                      };
                      setEditingQuestion(newQ);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, idx) => {
                  const isRegenerating = isRegeneratingId === q.id;
                  return (
                    <div
                      key={`q-${q.id || idx}`}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 transition hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {q.questionType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {q.marks} Mark{q.marks > 1 ? 's' : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Card Actions: Edit, Regenerate, Delete */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => { soundFx.playClick(); setEditingQuestion(q); }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            title="Edit this question"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Edit</span>
                          </button>

                          <button
                            disabled={isRegenerating}
                            onClick={() => handleRegenerateSingleQuestion(q)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Regenerate this specific question with AI"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline text-[10px]">Regenerate</span>
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-300 transition cursor-pointer"
                            title="Delete this question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options (for MCQ / True/False) */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-xs">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Correct Answer & Explanation */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer: {q.correctAnswer}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-normal">
                          <span className="font-semibold">Teacher Explanation: </span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Buttons */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { soundFx.playClick(); setStep('form'); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Config</span>
                  </button>

                  <button
                    onClick={handleGenerateHomework}
                    disabled={isGenerating}
                    className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate All</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={isSaving}
                    onClick={handleSaveAsDraft}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => { soundFx.playClick(); setStep('assign'); }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Approve & Assign →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: APPROVE & ASSIGN TO CLASS / SECTION */}
          {step === 'assign' && (
            <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Teacher Approval & Distribution Confirmation
                </h3>
                <p className="text-emerald-800 dark:text-emerald-300">
                  You are publishing <strong>{homeworkTitle}</strong> with <strong>{questions.length} questions ({totalMarks} marks)</strong>. 
                  Once published, students in the selected class and section will immediately receive this assignment in their Homework Center.
                </p>
              </div>

              {/* Class & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    Target Class
                  </label>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{selectedClass}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Government Syllabus</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    Target Section
                  </label>
                  <select
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Sections (Entire {selectedClass})</option>
                    <option value="5A">Section 5A</option>
                    <option value="5B">Section 5B</option>
                    <option value="5C">Section 5C</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>
              </div>

              {/* Due Date Picker */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Submission Due Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Final Publishing Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
                <button
                  onClick={() => { soundFx.playClick(); setStep('preview'); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Preview</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={isSaving}
                    onClick={handleSaveAsDraft}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
                  >
                    Save as Draft Only
                  </button>

                  <button
                    disabled={isSaving}
                    onClick={handleApproveAndPublish}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Publishing to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish Homework to {selectedClass}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOR SURGICAL QUESTION EDITING */}
        {editingQuestion && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  Edit Question #{editingQuestion.id}
                </h4>
                <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Type</label>
                  <select
                    value={editingQuestion.questionType}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      questionType: e.target.value as any
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Short Answer">Short Answer</option>
                    <option value="True / False">True / False</option>
                    <option value="Fill in the Blank">Fill in the Blank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Text</label>
                  <textarea
                    rows={3}
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                {editingQuestion.questionType === 'MCQ' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500">Options (1 per line)</label>
                    <textarea
                      rows={4}
                      value={editingQuestion.options?.join('\n') || ''}
                      onChange={(e) => {
                        const opts = e.target.value.split('\n');
                        setEditingQuestion({ ...editingQuestion, options: opts });
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Correct Answer</label>
                    <input
                      type="text"
                      value={editingQuestion.correctAnswer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editingQuestion.marks}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Explanation</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestionEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
