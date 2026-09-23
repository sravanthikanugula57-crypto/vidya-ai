import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Calendar, 
  HelpCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Paperclip,
  FileText,
  Upload
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade, OFFICIAL_CLASSES } from '../../../data/officialSyllabusData';
import { HomeworkQuestion, saveHomework, normalizeClass } from '../../../services/realHomeworkService';

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string;
  teacherName?: string;
  initialClass?: string;
  onSuccess?: (homeworkId: string) => void;
}

export const CreateHomeworkModal: React.FC<CreateHomeworkModalProps> = ({
  isOpen,
  onClose,
  teacherId = 't_faculty',
  teacherName = 'Faculty Teacher',
  initialClass = 'Class 6',
  onSuccess
}) => {
  // Class selection (Never hardcoded to Class 5)
  const [selectedClass, setSelectedClass] = useState<OfficialClassGrade>(
    (OFFICIAL_CLASSES.includes(initialClass as any) ? initialClass : 'Class 6') as OfficialClassGrade
  );
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedChapterName, setSelectedChapterName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [questions, setQuestions] = useState<HomeworkQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available subjects for the selected class
  const classSyllabus = OFFICIAL_SYLLABUS_BY_CLASS[selectedClass] || [];
  
  // When class changes, reset subject & chapter
  useEffect(() => {
    if (classSyllabus.length > 0) {
      const firstSubj = classSyllabus[0];
      setSelectedSubject(firstSubj.name);
      if (firstSubj.chapters.length > 0) {
        setSelectedChapterId(firstSubj.chapters[0].id);
        setSelectedChapterName(firstSubj.chapters[0].title);
      }
    }
  }, [selectedClass]);

  // When subject changes, reset chapter
  const currentSubjectObj = classSyllabus.find(s => s.name === selectedSubject) || classSyllabus[0];
  const availableChapters = currentSubjectObj ? currentSubjectObj.chapters : [];

  useEffect(() => {
    if (availableChapters.length > 0) {
      setSelectedChapterId(availableChapters[0].id);
      setSelectedChapterName(availableChapters[0].title);
      if (!title) {
        setTitle(`${availableChapters[0].title} - Homework 1`);
      }
    }
  }, [selectedSubject]);

  // Set default chapter change
  const handleChapterChange = (chapterTitle: string) => {
    const ch = availableChapters.find(c => c.title === chapterTitle);
    if (ch) {
      setSelectedChapterId(ch.id);
      setSelectedChapterName(ch.title);
      setTitle(`${ch.title} - Homework`);
    }
  };

  // Add Question handlers
  const handleAddObjectiveMCQ = () => {
    soundFx.playClick();
    const newQ: HomeworkQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      type: 'objective',
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      maxMarks: 1,
      explanation: ''
    };
    setQuestions([...questions, newQ]);
  };

  const handleAddObjectiveTrueFalse = () => {
    soundFx.playClick();
    const newQ: HomeworkQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      type: 'objective',
      question: '',
      options: ['True', 'False'],
      correctAnswer: 'True',
      maxMarks: 1,
      explanation: ''
    };
    setQuestions([...questions, newQ]);
  };

  const handleAddSubjective = () => {
    soundFx.playClick();
    const newQ: HomeworkQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      type: 'subjective',
      question: '',
      maxMarks: 3,
      explanation: 'Step-by-step reasoning or mathematical proof.'
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    soundFx.playClick();
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<HomeworkQuestion>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || [])];
    opts[optIdx] = val;
    updated[qIdx].options = opts;
    // If the correct answer matched the previous text, update it too
    if (updated[qIdx].correctAnswer === (questions[qIdx].options || [])[optIdx]) {
      updated[qIdx].correctAnswer = val;
    }
    setQuestions(updated);
  };

  // Quick helper: Load syllabus chapter starter questions
  const handleLoadChapterSampleQuestions = () => {
    soundFx.playSuccess();
    const chName = selectedChapterName || 'Chapter';
    const sampleQuestions: HomeworkQuestion[] = [
      {
        id: `q_${Date.now()}_1`,
        type: 'objective',
        question: `Which of the following statements is correct regarding concepts in ${chName}?`,
        options: ['Statement 1 (Fundamental theorem holds true)', 'Statement 2 (Magnitude is zero)', 'Statement 3 (Reciprocal of unity)', 'None of the above'],
        correctAnswer: 'Statement 1 (Fundamental theorem holds true)',
        maxMarks: 1,
        explanation: 'Follows directly from the syllabus definition.'
      },
      {
        id: `q_${Date.now()}_2`,
        type: 'objective',
        question: `In standard notation for ${selectedSubject}, the primary constant or base unit is represented by:`,
        options: ['Standard Unit A', 'Standard Unit B', 'Standard Unit C', 'Standard Unit D'],
        correctAnswer: 'Standard Unit A',
        maxMarks: 1,
        explanation: 'Standard convention as per AP SSC state curriculum.'
      },
      {
        id: `q_${Date.now()}_3`,
        type: 'subjective',
        question: `Explain in detail the main steps to solve or analyze problems in "${chName}". Provide at least one illustrative example with clear steps.`,
        maxMarks: 3,
        explanation: 'Award 1 mark for correct definition, 1 mark for steps, and 1 mark for the example.'
      }
    ];

    setQuestions(sampleQuestions);
    if (!instructions) {
      setInstructions('Answer all questions carefully. Objective questions will be auto-evaluated immediately upon submission. Subjective questions will be evaluated by your teacher with feedback.');
    }
  };

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.maxMarks) || 1), 0);

  // Submit Handler: draft or published
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setErrorMsg('Please enter an assignment title.');
      soundFx.playError();
      return;
    }

    if (questions.length === 0) {
      setErrorMsg('Please add at least one question before saving.');
      soundFx.playError();
      return;
    }

    // Validate that questions have text
    const emptyQ = questions.find(q => !q.question.trim());
    if (emptyQ) {
      setErrorMsg('Please ensure all questions have text filled in.');
      soundFx.playError();
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);
    soundFx.playClick();

    try {
      const hwId = await saveHomework({
        title: title.trim(),
        description: instructions.trim() || 'Complete all questions.',
        board: 'AP_SSC',
        class: selectedClass,
        subject: selectedSubject,
        chapterId: selectedChapterId || selectedChapterName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        chapterName: selectedChapterName,
        questions,
        totalMarks,
        dueDate,
        attachmentUrl: attachmentUrl.trim() || undefined,
        attachmentName: attachmentName.trim() || (attachmentUrl.trim() ? 'Attached Reference Material' : undefined),
        createdBy: teacherId,
        createdByName: teacherName,
        status
      });

      soundFx.playSuccess();
      setIsSaving(false);
      onSuccess?.(hwId);
      onClose();
    } catch (err: any) {
      console.error('Error saving homework:', err);
      setErrorMsg(err.message || 'Failed to save homework to Firestore.');
      setIsSaving(false);
      soundFx.playError();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Create Real Homework Assignment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firestore-persisted. Visible strictly to enrolled students of the selected class.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-900 dark:text-slate-100">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Class, Subject, Chapter (Teacher Flow step 1, 2, 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Step 1: Select Assigned Class */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Class (Required)
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as OfficialClassGrade)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                {OFFICIAL_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Only students in this class will see this homework.
              </span>
            </div>

            {/* Step 2: Select Subject */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                {classSyllabus.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Step 3: Select Chapter/Topic */}
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Chapter / Topic
              </label>
              <select
                value={selectedChapterName}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                {availableChapters.map(c => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Homework Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Real Numbers - Problem Set 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Row 3: Instructions */}
          <div>
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Teacher Instructions / Description
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Answer all objective questions. Show full working steps for the subjective problem."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Row 4: Optional File Attachment */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                <span>Optional File Attachment (PDF, Document or Reference Link)</span>
              </label>
              {attachmentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl('');
                    setAttachmentName('');
                  }}
                  className="text-[11px] text-rose-500 hover:underline font-bold"
                >
                  Remove Attachment
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Upload Document or Problem Sheet:
                </label>
                <label className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-900 cursor-pointer text-xs transition">
                  <Upload className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate text-slate-600 dark:text-slate-300 font-medium">
                    {attachmentName ? attachmentName : 'Choose file (PDF, image, doc)...'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachmentName(file.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setAttachmentUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Or Paste Resource / Drive URL:
                </label>
                <input
                  type="url"
                  value={attachmentUrl.startsWith('data:') ? '' : attachmentUrl}
                  disabled={attachmentUrl.startsWith('data:')}
                  onChange={(e) => {
                    setAttachmentUrl(e.target.value);
                    if (e.target.value && !attachmentName) {
                      setAttachmentName('Reference Material Link');
                    }
                  }}
                  placeholder={attachmentUrl.startsWith('data:') ? 'File uploaded above' : 'https://drive.google.com/... or resource link'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            </div>

            {attachmentName && (
              <div className="mt-2.5 flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold truncate">{attachmentName} attached</span>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Questions ({questions.length})</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold">
                    Total: {totalMarks} Marks
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Objective questions are auto-evaluated by stored answer key. Subjective questions are flagged for teacher review.
                </p>
              </div>

              {/* Action buttons to add questions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadChapterSampleQuestions}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-amber-100 transition cursor-pointer"
                  title="Populate syllabus-aligned starter questions for this chapter"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Populate Syllabus Questions</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddObjectiveMCQ}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center space-x-1 hover:bg-blue-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ MCQ</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddObjectiveTrueFalse}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center space-x-1 hover:bg-teal-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ True/False</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddSubjective}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center space-x-1 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Subjective Problem</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold">No questions added yet.</p>
                <p className="text-[11px] text-slate-500">
                  Click "+ MCQ", "+ True/False", or "+ Subjective Problem" above, or use "Auto-Populate Syllabus Questions" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          q.type === 'objective' 
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}>
                          {q.type === 'objective' ? 'Objective (Auto-Graded)' : 'Subjective (Teacher Reviewed)'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-slate-500 font-bold">Marks:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={q.maxMarks}
                          onChange={(e) => handleUpdateQuestion(idx, { maxMarks: parseInt(e.target.value, 10) || 1 })}
                          className="w-14 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                        placeholder={`Enter question ${idx + 1} statement...`}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* If Objective MCQ: Options & Correct Answer Key */}
                    {q.type === 'objective' && q.options && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          Options & Correct Answer Key (Click radio to mark correct answer):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div 
                              key={optIdx}
                              className={`flex items-center space-x-2 p-2 rounded-xl border transition ${
                                q.correctAnswer === opt 
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct_${q.id}`}
                                checked={q.correctAnswer === opt}
                                onChange={() => handleUpdateQuestion(idx, { correctAnswer: opt })}
                                className="w-4 h-4 text-emerald-600 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 dark:text-slate-200"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              {q.correctAnswer === opt && (
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  ✓ Key
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subjective rubric / explanation */}
                    {q.type === 'subjective' && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          Teacher Marking Rubric / Model Answer (Optional for review):
                        </span>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                          placeholder="e.g. Full marks if theorem formula is stated and correct numerical steps shown."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Publishing stores this homework in Firestore and notifies <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedClass}</span> students.
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('draft')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('published')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Publish to Class'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
