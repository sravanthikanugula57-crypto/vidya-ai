import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  Award,
  BookOpen,
  ListOrdered,
  Search,
  Save,
  Loader2,
  X
} from 'lucide-react';
import { MockTestDoc, MockQuestion, MockQuestionType } from '../../../types/mockTest';
import { CORE_SUBJECTS, CoreSubject, generate100QuestionsForTest } from '../../../services/mockTestGenerator';
import { subscribeToMockTests, saveTeacherMockTest, deleteMockQuestion, deleteMockTest, fetchMockTestWithQuestions } from '../../../services/mockTestService';
import { AIMockTestGeneratorModal } from '../../student/mockTest/AIMockTestGeneratorModal';

export const TeacherMockTestManager: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<CoreSubject>('Mathematics');
  const [mockTests, setMockTests] = useState<MockTestDoc[]>([]);
  const [selectedTest, setSelectedTest] = useState<MockTestDoc | null>(null);
  const [testQuestions, setTestQuestions] = useState<MockQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // New Test Form state
  const [newTestForm, setNewTestForm] = useState({
    subject: 'Mathematics' as CoreSubject,
    testNumber: 1,
    title: 'Mathematics Grand Board Mock Test #1',
    board: 'Telangana & AP SSC Board Class 10',
    durationMinutes: 180,
    totalMarks: 140
  });

  // Single Question Form state for adding/editing
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<MockQuestion> | null>(null);

  // Subscribe to mock tests list
  useEffect(() => {
    const unsub = subscribeToMockTests(selectedSubject, (tests) => {
      const sorted = [...tests].sort((a, b) => a.testNumber - b.testNumber);
      setMockTests(sorted);
      if (sorted.length > 0 && !selectedTest) {
        handleSelectTest(sorted[0]);
      }
    });

    return () => unsub();
  }, [selectedSubject]);

  const handleSelectTest = async (test: MockTestDoc) => {
    setSelectedTest(test);
    setLoadingQuestions(true);

    try {
      const { questions } = await fetchMockTestWithQuestions(test.id, test.subject, test.testNumber);
      setTestQuestions(questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Create & Publish new Mock Test with 100 questions
  const handleCreateMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const testId = `${newTestForm.subject.toLowerCase().replace(/\s+/g, '_')}_mock_${newTestForm.testNumber}`;
      const questions = generate100QuestionsForTest(
        newTestForm.subject,
        newTestForm.testNumber,
        testId
      );

      const createdTest: MockTestDoc = {
        id: testId,
        title: newTestForm.title,
        subject: newTestForm.subject,
        testNumber: Number(newTestForm.testNumber),
        durationMinutes: Number(newTestForm.durationMinutes),
        totalQuestions: questions.length,
        totalMarks: Number(newTestForm.totalMarks),
        questionDistribution: {
          mcq: 40,
          fillInBlank: 20,
          trueFalse: 10,
          oneMark: 10,
          twoMark: 10,
          fourMark: 5,
          previousBoard: 5,
          total: questions.length
        },
        isPublished: true,
        board: newTestForm.board,
        createdAt: new Date().toISOString()
      };

      await saveTeacherMockTest(createdTest, questions);

      alert(`Mock Test "${newTestForm.title}" published with 100 Board questions to Firestore!`);
      setShowCreateTestModal(false);
      handleSelectTest(createdTest);
    } catch (err) {
      console.error(err);
      alert('Failed to publish test.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Bulk Uploading Questions via JSON or Text format
  const handleBulkUpload = async () => {
    if (!selectedTest || !bulkInput) return;
    setIsSaving(true);

    try {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(bulkInput);
      } catch (err) {
        alert('Invalid JSON format. Please format as an array of question objects.');
        setIsSaving(false);
        return;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('Please provide an array of question objects.');
        setIsSaving(false);
        return;
      }

      const formattedQuestions: MockQuestion[] = parsed.map((q, idx) => ({
        id: `${selectedTest.id}_q${idx + 1}`,
        testId: selectedTest.id,
        questionNumber: idx + 1,
        subject: selectedTest.subject,
        chapter: q.chapter || 'General',
        type: q.type || 'mcq',
        section: q.section || 'SECTION A: Multiple Choice Questions',
        question: q.question || 'Untitled Question',
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || 'Detailed solution step.',
        hint: q.hint || '',
        marks: q.marks || 1
      }));

      await saveTeacherMockTest(selectedTest, formattedQuestions);
      setTestQuestions(formattedQuestions);
      setShowBulkUploadModal(false);
      setBulkInput('');
      alert(`Bulk uploaded ${formattedQuestions.length} questions successfully!`);
    } catch (err) {
      console.error(err);
      alert('Bulk upload failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save single question edit
  const handleSaveSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest || !editingQuestion || !editingQuestion.question) return;

    setIsSaving(true);
    try {
      const qNum = editingQuestion.questionNumber || testQuestions.length + 1;
      const qId = editingQuestion.id || `${selectedTest.id}_q${qNum}`;

      const updatedQ: MockQuestion = {
        id: qId,
        testId: selectedTest.id,
        questionNumber: qNum,
        subject: selectedTest.subject,
        chapter: editingQuestion.chapter || 'General',
        type: (editingQuestion.type as MockQuestionType) || 'mcq',
        section: editingQuestion.section || 'SECTION A',
        question: editingQuestion.question,
        options: editingQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: editingQuestion.correctAnswer ?? 0,
        explanation: editingQuestion.explanation || '',
        hint: editingQuestion.hint || '',
        marks: Number(editingQuestion.marks) || 1
      };

      const newQuestionsList = testQuestions.some((q) => q.id === qId)
        ? testQuestions.map((q) => (q.id === qId ? updatedQ : q))
        : [...testQuestions, updatedQ];

      await saveTeacherMockTest(selectedTest, newQuestionsList);
      setTestQuestions(newQuestionsList);
      setShowQuestionModal(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    await deleteMockQuestion(qId);
    setTestQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CMS Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
              Teacher Assessment Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              Firestore Sync
            </span>
          </div>
          <h1 className="text-2xl font-black">SSC Board Mock Test Manager</h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Create 100-question grand mock exams, bulk upload question sets, and manage exact board marking schemes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIGeneratorModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-900/40 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>⚡ AI Mock Test Generator</span>
          </button>

          <button
            onClick={() => setShowCreateTestModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create 100-Q Mock Test</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CORE_SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedSubject === subject
                ? 'bg-indigo-600 text-white font-black shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Mock Test Selector & Right Question Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Test Selection List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>{selectedSubject} Tests ({mockTests.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Realtime</span>
          </h2>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {mockTests.map((t) => {
              const isSelected = selectedTest?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTest(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
                      Mock Test #{t.testNumber}
                    </span>
                    <span className="text-slate-400">100 Questions</span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {t.board} • {t.totalMarks} Marks
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Question Management Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {selectedTest ? (
            <>
              {/* Test Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px]">
                      Published
                    </span>
                    <span className="text-xs font-bold text-slate-500">{selectedTest.subject}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {selectedTest.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bulk Upload Qs</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingQuestion({
                        questionNumber: testQuestions.length + 1,
                        type: 'mcq',
                        marks: 1
                      });
                      setShowQuestionModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Single Question</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {loadingQuestions ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs font-bold">Loading 100 questions from Firestore...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {testQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px]">
                              Q{q.questionNumber}
                            </span>
                            <span className="font-extrabold uppercase text-[10px] text-indigo-600 dark:text-indigo-400">
                              {q.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">• {q.chapter}</span>
                            <span className="text-amber-600 font-bold">• [{q.marks} Marks]</span>
                          </div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            {q.question}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setShowQuestionModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 text-rose-700 dark:text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {q.options && (
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-1.5 rounded-lg border ${
                                Number(q.correctAnswer) === optIdx
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 font-bold text-emerald-900 dark:text-emerald-200'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <span className="mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a Mock Test from the left panel to manage questions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW 100-QUESTION MOCK TEST MODAL */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>Create & Seed 100-Question Board Mock Test</span>
              </h3>
              <button onClick={() => setShowCreateTestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMockTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Subject *</label>
                <select
                  value={newTestForm.subject}
                  onChange={(e) => setNewTestForm({ ...newTestForm, subject: e.target.value as CoreSubject })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {CORE_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Test Number (1 - 20) *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newTestForm.testNumber}
                    onChange={(e) => setNewTestForm({ ...newTestForm, testNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Time Duration (Mins) *</label>
                  <input
                    type="number"
                    value={newTestForm.durationMinutes}
                    onChange={(e) => setNewTestForm({ ...newTestForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={newTestForm.title}
                  onChange={(e) => setNewTestForm({ ...newTestForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-1 text-indigo-900 dark:text-indigo-200">
                <span className="font-extrabold text-[11px]">Automatic Board Distribution (100 Questions):</span>
                <p className="text-[10px]">
                  40 MCQs • 20 Fill Blanks • 10 True/False • 10 1-Mark • 10 2-Mark • 5 4-Mark Essay • 5 Board PYQs
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold shadow cursor-pointer"
                >
                  {isSaving ? 'Seeding to Firestore...' : 'Publish Mock Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                <span>Bulk Upload Questions (JSON)</span>
              </h3>
              <button onClick={() => setShowBulkUploadModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste an array of question JSON objects to bulk populate questions into this mock test.
            </p>

            <textarea
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder='[{"question": "What is...", "options": ["A","B","C","D"], "correctAnswer": 0, "type": "mcq", "marks": 1}]'
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow cursor-pointer"
              >
                {isSaving ? 'Uploading...' : 'Import Questions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE QUESTION EDIT MODAL */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base">Edit Question #{editingQuestion.questionNumber}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Question Statement *</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Question Type</label>
                  <select
                    value={editingQuestion.type || 'mcq'}
                    onChange={(e) => {
                      const newType = e.target.value as MockQuestionType;
                      const defaultOpts = newType === 'mcq' ? (editingQuestion.options && editingQuestion.options.length === 4 ? editingQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D']) : undefined;
                      setEditingQuestion({ 
                        ...editingQuestion, 
                        type: newType,
                        options: defaultOpts,
                        correctAnswer: newType === 'mcq' ? (Number(editingQuestion.correctAnswer) || 0) : (editingQuestion.correctAnswer ?? '')
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="mcq">MCQ (Multiple Choice)</option>
                    <option value="fill_in_blank">Fill in Blank</option>
                    <option value="true_false">True / False</option>
                    <option value="one_mark">1 Mark</option>
                    <option value="two_mark">2 Mark</option>
                    <option value="four_mark">4 Mark Essay</option>
                    <option value="previous_board">Previous Board</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Marks</label>
                  <input
                    type="number"
                    value={editingQuestion.marks || 1}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* OPTIONS & CORRECT ANSWER INPUTS */}
              {(!editingQuestion.type || editingQuestion.type === 'mcq') && (
                <div className="space-y-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-indigo-900 dark:text-indigo-200">
                      Options & Correct Answer Key (Bits)
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      Select radio for the correct option
                    </span>
                  </div>

                  <div className="space-y-2">
                    {([0, 1, 2, 3]).map((idx) => {
                      const currentOpts = editingQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                      const isCorrect = Number(editingQuestion.correctAnswer) === idx;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name="correctAnswerRadio"
                              checked={isCorrect}
                              onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: idx })}
                              className="accent-indigo-600 w-4 h-4"
                            />
                            <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                          </label>

                          <input
                            type="text"
                            required
                            value={currentOpts[idx] || ''}
                            onChange={(e) => {
                              const newOpts = [...currentOpts];
                              newOpts[idx] = e.target.value;
                              setEditingQuestion({ ...editingQuestion, options: newOpts });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className={`flex-1 p-2 rounded-xl border text-xs ${
                              isCorrect
                                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 font-bold'
                                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {editingQuestion.type === 'true_false' && (
                <div className="space-y-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                  <label className="block font-black text-indigo-900 dark:text-indigo-200">
                    Correct Answer (Key)
                  </label>
                  <div className="flex gap-4">
                    {['True', 'False'].map((tf) => (
                      <label key={tf} className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="tfRadio"
                          checked={String(editingQuestion.correctAnswer).toLowerCase() === tf.toLowerCase()}
                          onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: tf })}
                          className="accent-indigo-600 w-4 h-4"
                        />
                        <span>{tf}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(editingQuestion.type === 'fill_in_blank' || editingQuestion.type === 'one_mark' || editingQuestion.type === 'two_mark' || editingQuestion.type === 'four_mark' || editingQuestion.type === 'previous_board') && (
                <div className="space-y-1.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                  <label className="block font-black text-indigo-900 dark:text-indigo-200">
                    Correct Answer / Model Answer Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={String(editingQuestion.correctAnswer ?? '')}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer or key text..."
                    className="w-full p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">Explanation / Examiner Notes</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold shadow cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Mock Test Generator Modal */}
      <AIMockTestGeneratorModal
        isOpen={showAIGeneratorModal}
        onClose={() => setShowAIGeneratorModal(false)}
        onTestGenerated={(test) => {
          setShowAIGeneratorModal(false);
          handleSelectTest(test);
        }}
        defaultClassGrade="Class 10"
      />

    </div>
  );
};
