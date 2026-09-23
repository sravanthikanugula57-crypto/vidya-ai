import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Upload,
  Sparkles,
  Search,
  BookOpen,
  Award,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  Globe,
  Check,
  RotateCcw,
  Layers,
  FileCheck,
  ShieldCheck,
  Calendar,
  GraduationCap,
  Play,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { PreviousPaper, PreviousPaperQuestion, PreviousPaperSection } from '../../../types/previousPaper';
import {
  subscribeToAllPreviousPapers,
  addPreviousPaperDoc,
  updatePreviousPaperDoc,
  deletePreviousPaperDoc,
  togglePublishPreviousPaperDoc
} from '../../../services/previousPaperService';
import { IntegratedPDFViewerModal } from '../../common/IntegratedPDFViewerModal';
import { PreviousPaperPracticeModal } from '../../student/views/PreviousPaperPracticeModal';

interface TeacherPreviousPapersManagerProps {
  teacherName?: string;
  onSuccessNotice?: (msg: string) => void;
}

export const TeacherPreviousPapersManager: React.FC<TeacherPreviousPapersManagerProps> = ({
  teacherName = 'Senior Faculty',
  onSuccessNotice
}) => {
  const [papers, setPapers] = useState<PreviousPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('Class 5');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPaper, setEditingPaper] = useState<PreviousPaper | null>(null);
  const [previewPaper, setPreviewPaper] = useState<PreviousPaper | null>(null);
  const [practicePreviewPaper, setPracticePreviewPaper] = useState<PreviousPaper | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    class: number;
    classGrade: string;
    board: string;
    year: string;
    examType: string;
    subject: string;
    medium: string;
    totalMarks: number;
    duration: string;
    durationMinutes: number;
    fileSize: string;
    pdfUrl: string;
    answerKeyUrl: string;
    published: boolean;
    hasPractice: boolean;
    questions: PreviousPaperQuestion[];
  }>({
    title: '',
    class: 5,
    classGrade: 'Class 5',
    board: 'AP & Telangana State Board (SCERT)',
    year: '2025',
    examType: 'Annual Examination',
    subject: 'Mathematics',
    medium: 'English',
    totalMarks: 50,
    duration: '2 Hours',
    durationMinutes: 120,
    fileSize: '2.0 MB',
    pdfUrl: '',
    answerKeyUrl: '',
    published: true,
    hasPractice: false,
    questions: []
  });

  // Question editing sub-state in modal
  const [activeQuestionTab, setActiveQuestionTab] = useState<'details' | 'questions'>('details');
  const [newQ, setNewQ] = useState<Partial<PreviousPaperQuestion>>({
    type: 'mcq',
    marks: 1,
    question: '',
    questionTe: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  // Subscribe to ALL previous papers
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToAllPreviousPapers((data) => {
      setPapers(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filtered Papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const q = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (q) {
        const text = `${paper.title} ${paper.subject} ${paper.board} ${paper.year} ${paper.examType} ${paper.medium}`.toLowerCase();
        matchesSearch = text.includes(q);
      }

      const pClassStr = String(paper.classGrade || `Class ${paper.class || ''}`);
      const matchesClass = filterClass === 'All' || pClassStr.includes(filterClass.replace(/\D/g, ''));
      const matchesSubject = filterSubject === 'All' || (paper.subject || '').toLowerCase() === (filterSubject || '').toLowerCase();
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Published' ? paper.published : !paper.published);

      return matchesSearch && matchesClass && matchesSubject && matchesStatus;
    });
  }, [papers, searchQuery, filterClass, filterSubject, filterStatus]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    soundFx.playClick();
    setEditingPaper(null);
    setActiveQuestionTab('details');
    setFormData({
      title: 'Class 5 Mathematics Annual Examination 2025',
      class: 5,
      classGrade: 'Class 5',
      board: 'AP & Telangana State Board (SCERT)',
      year: '2025',
      examType: 'Annual Examination',
      subject: 'Mathematics',
      medium: 'English',
      totalMarks: 50,
      duration: '2 Hours',
      durationMinutes: 120,
      fileSize: '2.0 MB',
      pdfUrl: 'https://bse.telangana.gov.in/pdf/Class5_Maths_2025.pdf',
      answerKeyUrl: '',
      published: true,
      hasPractice: false,
      questions: []
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (paper: PreviousPaper) => {
    soundFx.playClick();
    setEditingPaper(paper);
    setActiveQuestionTab('details');
    setFormData({
      title: paper.title,
      class: Number(paper.class) || 5,
      classGrade: paper.classGrade || `Class ${paper.class || 5}`,
      board: paper.board,
      year: String(paper.year),
      examType: paper.examType || 'Annual Examination',
      subject: paper.subject,
      medium: paper.medium,
      totalMarks: paper.totalMarks || 50,
      duration: paper.duration || '2 Hours',
      durationMinutes: paper.durationMinutes || 120,
      fileSize: paper.fileSize || '2.0 MB',
      pdfUrl: paper.pdfUrl || paper.questionPaperUrl || '',
      answerKeyUrl: paper.answerKeyUrl || '',
      published: paper.published,
      hasPractice: Boolean(paper.hasPractice),
      questions: paper.questions ? [...paper.questions] : []
    });
    setShowAddModal(true);
  };

  // Save Paper (Create or Update)
  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();

    try {
      if (editingPaper) {
        await updatePreviousPaperDoc(editingPaper.id, {
          ...formData,
          hasPractice: formData.questions.length > 0
        });
        if (onSuccessNotice) onSuccessNotice(`Updated "${formData.title}" successfully.`);
      } else {
        await addPreviousPaperDoc({
          ...formData,
          uploadedBy: teacherName,
          hasPractice: formData.questions.length > 0
        });
        if (onSuccessNotice) onSuccessNotice(`Published "${formData.title}" to student repository.`);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (paper: PreviousPaper) => {
    soundFx.playClick();
    try {
      await togglePublishPreviousPaperDoc(paper.id, !paper.published);
      if (onSuccessNotice) {
        onSuccessNotice(`Paper ${paper.published ? 'unpublished (draft)' : 'published to students'}.`);
      }
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    soundFx.playClick();
    try {
      await deletePreviousPaperDoc(paperId);
      if (onSuccessNotice) onSuccessNotice(`Paper "${title}" deleted.`);
    } catch (err) {
      console.error('Error deleting paper:', err);
    }
  };

  // Add question to paper questions array
  const handleAddQuestionToForm = () => {
    if (!newQ.question?.trim()) return;
    soundFx.playClick();

    const qNum = formData.questions.length + 1;
    const addedQuestion: PreviousPaperQuestion = {
      id: `q_${Date.now()}_${qNum}`,
      qNo: qNum,
      sectionId: newQ.marks && newQ.marks >= 4 ? 'sec_c' : newQ.type === 'mcq' ? 'sec_a' : 'sec_b',
      sectionName: newQ.marks && newQ.marks >= 4 ? 'Section C' : newQ.type === 'mcq' ? 'Section A: MCQs' : 'Section B',
      type: newQ.type || 'mcq',
      marks: newQ.marks || 1,
      question: newQ.question,
      questionTe: newQ.questionTe || '',
      options: newQ.type === 'mcq' ? (newQ.options || ['', '', '', '']) : undefined,
      correctAnswer: newQ.correctAnswer !== undefined ? newQ.correctAnswer : 0,
      explanation: newQ.explanation || ''
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, addedQuestion],
      hasPractice: true
    }));

    // Reset new question template
    setNewQ({
      type: 'mcq',
      marks: 1,
      question: '',
      questionTe: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleRemoveQuestionFromForm = (qId: string) => {
    soundFx.playClick();
    setFormData(prev => {
      const updated = prev.questions.filter(q => q.id !== qId).map((q, idx) => ({ ...q, qNo: idx + 1 }));
      return {
        ...prev,
        questions: updated,
        hasPractice: updated.length > 0
      };
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-cyan-950 text-white shadow-xl relative overflow-hidden border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Teacher CMS • Exam Papers Repository</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Previous Examination Papers Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload official previous board examination PDFs and digitize complete papers for student self-evaluation and interactive practice mode.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Upload & Publish Paper</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Class Filter */}
          <div>
            <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1">
              Class Grade
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="All">All Classes</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="All">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Environmental Studies (EVS)">Environmental Studies (EVS)</option>
              <option value="General English">General English</option>
              <option value="First Language Telugu (తెలుగు)">First Language Telugu (తెలుగు)</option>
              <option value="Social Studies">Social Studies</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1">
              Publish Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="All">All Papers</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Draft Only</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block font-extrabold text-slate-600 dark:text-slate-400 mb-1">
              Search Papers
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, year..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. PAPERS TABLE / LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-500" />
            <span>Repository Papers ({filteredPapers.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            Live Synchronized with Student Portal
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">Loading papers...</div>
        ) : filteredPapers.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPapers.map((paper) => {
              const qCount = paper.questions?.length || 0;
              return (
                <div
                  key={paper.id}
                  className="p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-black uppercase">
                        {paper.classGrade || `Class ${paper.class}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        {paper.subject} • Year {paper.year}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                        {paper.examType}
                      </span>
                      {paper.published ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-500 text-white text-[10px] font-black uppercase">
                          Draft
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {paper.board} • {paper.totalMarks} Marks • {paper.duration} • {qCount > 0 ? `${qCount} Digitized Qs (Practice Mode Active)` : 'PDF Document Only'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {qCount > 0 && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setPracticePreviewPaper(paper);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 hover:text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test Practice</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setPreviewPaper(paper);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>

                    <button
                      onClick={() => handleTogglePublish(paper)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        paper.published
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white'
                          : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{paper.published ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(paper)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="Edit Paper"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePaper(paper.id, paper.title)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-500 transition cursor-pointer"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-black text-slate-700 dark:text-slate-300">No papers found for this filter</h4>
            <p className="text-xs">Click "Upload & Publish Paper" to add a new previous year examination paper.</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PAPER WITH COMPLETE DETAILS & QUESTIONS DIGITIZER */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingPaper ? 'Edit Previous Examination Paper' : 'Upload & Publish Previous Paper'}
                  </h3>
                  <p className="text-xs text-slate-400">Class 5 Exam Preparation Portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: General Details vs Question Digitizer */}
            <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveQuestionTab('details')}
                className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                  activeQuestionTab === 'details'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                1. Paper Meta & PDF Details
              </button>
              <button
                onClick={() => setActiveQuestionTab('questions')}
                className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeQuestionTab === 'questions'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Digitize Questions ({formData.questions.length})</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSavePaper} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeQuestionTab === 'details' && (
                <div className="space-y-4">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                      Paper Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Class */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Class Grade *
                      </label>
                      <select
                        value={formData.class}
                        onChange={(e) => setFormData(prev => ({ ...prev, class: Number(e.target.value), classGrade: `Class ${e.target.value}` }))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value={5}>Class 5</option>
                        <option value={6}>Class 6</option>
                        <option value={7}>Class 7</option>
                        <option value={8}>Class 8</option>
                        <option value={9}>Class 9</option>
                        <option value={10}>Class 10</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g. Mathematics"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Exam Type */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Exam Type *
                      </label>
                      <select
                        value={formData.examType}
                        onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="Annual Examination">Annual Examination</option>
                        <option value="Summative Assessment (SA-2)">Summative Assessment (SA-2)</option>
                        <option value="Summative Assessment (SA-1)">Summative Assessment (SA-1)</option>
                        <option value="Pre-Final Board Examination">Pre-Final Board Examination</option>
                      </select>
                    </div>

                    {/* Board */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Board / Authority
                      </label>
                      <input
                        type="text"
                        value={formData.board}
                        onChange={(e) => setFormData(prev => ({ ...prev, board: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>

                    {/* Total Marks */}
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* PDF URL */}
                  <div>
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-1">
                      Official PDF Document URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                      placeholder="https://bse.telangana.gov.in/pdf/paper.pdf"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  {/* Publish checkbox */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="publishCheck"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-5 h-5 rounded text-cyan-600"
                    />
                    <label htmlFor="publishCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Publish immediately to students portal (If unchecked, saved as draft)
                    </label>
                  </div>

                </div>
              )}

              {activeQuestionTab === 'questions' && (
                <div className="space-y-6">
                  
                  {/* Add New Question Sub-form */}
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                        Add Digitized Question #{formData.questions.length + 1}
                      </h4>
                      <span className="text-[11px] text-slate-400">Complete Paper Practice Mode</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Type</label>
                        <select
                          value={newQ.type}
                          onChange={(e) => setNewQ(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border text-xs font-bold"
                        >
                          <option value="mcq">Multiple Choice Question (MCQ / Bits)</option>
                          <option value="fill_in_blank">Fill in the Blank</option>
                          <option value="short_answer">Short Answer Question</option>
                          <option value="long_answer">Long Answer / Problem Solving</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Marks</label>
                        <input
                          type="number"
                          value={newQ.marks}
                          onChange={(e) => setNewQ(prev => ({ ...prev, marks: Number(e.target.value) }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Text (English) *</label>
                      <textarea
                        rows={2}
                        value={newQ.question}
                        onChange={(e) => setNewQ(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter the official question text..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Text (Telugu Translation, Optional)</label>
                      <input
                        type="text"
                        value={newQ.questionTe || ''}
                        onChange={(e) => setNewQ(prev => ({ ...prev, questionTe: e.target.value }))}
                        placeholder="తెలుగు అనువాదం..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border text-xs"
                      />
                    </div>

                    {/* MCQ Options */}
                    {newQ.type === 'mcq' && (
                      <div className="space-y-2 pt-1">
                        <label className="block text-[11px] font-bold text-slate-500">4 Options & Correct Answer</label>
                        {[0, 1, 2, 3].map((optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-600 font-black text-xs flex items-center justify-center">
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <input
                              type="text"
                              value={(newQ.options && newQ.options[optIdx]) || ''}
                              onChange={(e) => {
                                const updated = [...(newQ.options || ['', '', '', ''])];
                                updated[optIdx] = e.target.value;
                                setNewQ(prev => ({ ...prev, options: updated }));
                              }}
                              placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]}`}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border text-xs"
                            />
                            <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <input
                                type="radio"
                                name="correctOpt"
                                checked={Number(newQ.correctAnswer) === optIdx}
                                onChange={() => setNewQ(prev => ({ ...prev, correctAnswer: optIdx }))}
                              />
                              <span>Correct</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {(newQ.type === 'fill_in_blank' || newQ.type === 'short_answer' || newQ.type === 'long_answer') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Model / Correct Answer *</label>
                        <input
                          type="text"
                          value={String(newQ.correctAnswer || '')}
                          onChange={(e) => setNewQ(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          placeholder="Correct numerical value or key phrase..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border text-xs font-medium"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Step-by-Step Solution / Explanation</label>
                      <input
                        type="text"
                        value={newQ.explanation || ''}
                        onChange={(e) => setNewQ(prev => ({ ...prev, explanation: e.target.value }))}
                        placeholder="Detailed explanation for student review..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border text-xs font-medium"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddQuestionToForm}
                        className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-black text-xs hover:bg-cyan-500 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {/* Digitized Questions List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Digitized Questions in this Paper ({formData.questions.length})
                    </h4>
                    {formData.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-black text-cyan-600">
                            Q{idx + 1}. ({q.type.toUpperCase()} • {q.marks}M)
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{q.question}</p>
                          <p className="text-[11px] text-slate-500">Correct: {String(q.correctAnswer)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromForm(q.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  {editingPaper ? 'Save Changes' : 'Save & Publish Paper'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTEGRATED PDF VIEWER */}
      {previewPaper && (
        <IntegratedPDFViewerModal
          paper={{
            id: previewPaper.id,
            title: previewPaper.title,
            subject: previewPaper.subject,
            year: previewPaper.year,
            board: previewPaper.board,
            medium: (previewPaper as any).medium || 'English / Telugu',
            totalMarks: previewPaper.totalMarks,
            duration: previewPaper.duration,
            pdfUrl: previewPaper.pdfUrl || (previewPaper as any).questionPaperUrl || ''
          }}
          onClose={() => setPreviewPaper(null)}
        />
      )}

      {/* MODAL: PRACTICE PREVIEW */}
      {practicePreviewPaper && (
        <PreviousPaperPracticeModal
          paper={practicePreviewPaper}
          userId="teacher_preview"
          studentName={teacherName}
          onClose={() => setPracticePreviewPaper(null)}
        />
      )}

    </div>
  );
};
