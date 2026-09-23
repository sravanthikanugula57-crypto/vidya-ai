import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Video,
  File,
  FileSpreadsheet,
  Bookmark,
  Award,
  HelpCircle,
  CheckSquare,
  Send,
  Users,
  BarChart3,
  Settings,
  Plus,
  Upload,
  CheckCircle,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Link as LinkIcon,
  X,
  Eye,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import {
  publishTeacherContent,
  subscribeToGenericCollection,
  uploadFileToFirebaseStorage,
  deletePreviousPaper,
  addPreviousPaper,
  subscribeToRealStudents,
  RealStudentProfile
} from '../../../services/studentFirestoreService';
import {
  formatYouTubeEmbedUrl,
  extractYouTubeId,
  getYouTubeThumbnail
} from '../../../lib/videoUtils';
import { createAndPublishQuiz, subscribeToClassQuizzes } from '../../../services/quizService';
import { QuizDoc, QuizQuestion } from '../../../types/quiz';
import { generate100QuestionsForTest } from '../../../services/mockTestGenerator';
import { VideoModalPlayer } from '../../common/VideoModalPlayer';
import { soundFx } from '../../../lib/audio';
import { TeacherPracticeSetManager } from './TeacherPracticeSetManager';
import { TeacherMockTestManager } from './TeacherMockTestManager';
import { TeacherPreviousPapersManager } from './TeacherPreviousPapersManager';
import { TeacherDigitalLibraryManager } from './TeacherDigitalLibraryManager';
import { AnnouncementsView } from './AnnouncementsView';

export type CMSTab =
  | 'dashboard'
  | 'subjects'
  | 'chapters'
  | 'lessons'
  | 'textbooks'
  | 'videos'
  | 'notes'
  | 'worksheets'
  | 'formula_sheets'
  | 'previous_papers'
  | 'question_bank'
  | 'practice_sets'
  | 'mock_tests'
  | 'quizzes'
  | 'assignments'
  | 'announcements'
  | 'students'
  | 'analytics'
  | 'settings';

interface TeacherCMSManagerProps {
  teacherName?: string;
  initialTab?: CMSTab;
}

const SIDEBAR_ITEMS: { id: CMSTab; label: string; icon: any; category?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Subjects', icon: BookOpen, category: 'Curriculum' },
  { id: 'chapters', label: 'Chapters', icon: Layers, category: 'Curriculum' },
  { id: 'lessons', label: 'Lessons', icon: FileText, category: 'Curriculum' },
  { id: 'textbooks', label: 'Textbooks (AP/TS SCERT SSC)', icon: BookOpen, category: 'Content' },
  { id: 'videos', label: 'Videos', icon: Video, category: 'Content' },
  { id: 'notes', label: 'Notes', icon: File, category: 'Content' },
  { id: 'worksheets', label: 'Worksheets', icon: FileSpreadsheet, category: 'Content' },
  { id: 'formula_sheets', label: 'Formula Sheets', icon: Bookmark, category: 'Content' },
  { id: 'previous_papers', label: 'Previous Papers', icon: Award, category: 'Content' },
  { id: 'question_bank', label: 'Question Bank', icon: HelpCircle, category: 'Assessments' },
  { id: 'practice_sets', label: 'Practice Sets (30-50 Qs)', icon: Zap, category: 'Assessments' },
  { id: 'mock_tests', label: '100-Q Grand Mock Tests', icon: Target, category: 'Assessments' },
  { id: 'quizzes', label: 'Quizzes', icon: CheckSquare, category: 'Assessments' },
  { id: 'assignments', label: 'Assignments', icon: FileText, category: 'Assessments' },
  { id: 'announcements', label: 'Announcements', icon: Send, category: 'Communication' },
  { id: 'students', label: 'Students', icon: Users, category: 'Management' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, category: 'Management' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'Management' }
];

const CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const BOARDS = ['Andhra Pradesh State Board (AP SSC)', 'Telangana State Board (TS SSC)'];
const SUBJECTS = ['Physical Science', 'Mathematics', 'Biological Science', 'Social Studies', 'English', 'Telugu'];
const LANGUAGES = ['Telugu', 'English', 'Urdu', 'Bilingual'];

export const TeacherCMSManager: React.FC<TeacherCMSManagerProps> = ({
  teacherName = 'Mr. Ramesh Sharma',
  initialTab = 'dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<CMSTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Live Firestore collections state
  const [textbooksList, setTextbooksList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [worksheetsList, setWorksheetsList] = useState<any[]>([]);
  const [formulaSheetsList, setFormulaSheetsList] = useState<any[]>([]);
  const [previousPapersList, setPreviousPapersList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [questionBankList, setQuestionBankList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [realStudentsList, setRealStudentsList] = useState<RealStudentProfile[]>([]);

  // Realtime Subscriptions
  useEffect(() => {
    const unsubTextbooks = subscribeToGenericCollection('textbooks', setTextbooksList);
    const unsubVideos = subscribeToGenericCollection('videos', setVideosList);
    const unsubNotes = subscribeToGenericCollection('notes', setNotesList);
    const unsubWorksheets = subscribeToGenericCollection('worksheets', setWorksheetsList);
    const unsubFormula = subscribeToGenericCollection('formula_sheets', setFormulaSheetsList);
    const unsubPapers = subscribeToGenericCollection('previous_papers', setPreviousPapersList);
    const unsubLessons = subscribeToGenericCollection('lessons', setLessonsList);
    const unsubQuizzes = subscribeToGenericCollection('quizzes', setQuizzesList);
    const unsubAssignments = subscribeToGenericCollection('assignments', setAssignmentsList);
    const unsubAnnouncements = subscribeToGenericCollection('announcements', setAnnouncementsList);
    const unsubQBank = subscribeToGenericCollection('question_bank', setQuestionBankList);
    const unsubSubjects = subscribeToGenericCollection('subjects', setSubjectsList);
    const unsubChapters = subscribeToGenericCollection('chapters', setChaptersList);
    const unsubStudents = subscribeToRealStudents(setRealStudentsList);

    return () => {
      unsubTextbooks();
      unsubVideos();
      unsubNotes();
      unsubWorksheets();
      unsubFormula();
      unsubPapers();
      unsubLessons();
      unsubQuizzes();
      unsubAssignments();
      unsubAnnouncements();
      unsubQBank();
      unsubSubjects();
      unsubChapters();
      unsubStudents();
    };
  }, []);

  const triggerSuccess = (msg: string) => {
    soundFx.playSuccess();
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Textbook Form State
  const [textbookForm, setTextbookForm] = useState({
    title: '',
    subject: 'Physical Science',
    class: 'Class 10',
    board: 'Andhra Pradesh State Board (AP SSC)',
    medium: 'Telugu',
    chapter: 'Full Textbook',
    description: '',
    fileSize: '15.4 MB',
    fileUrl: '',
    selectedFile: null as File | null
  });

  const handleUploadTextbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textbookForm.title) return;
    setLoading(true);
    try {
      let finalPdfUrl = textbookForm.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      if (textbookForm.selectedFile) {
        finalPdfUrl = await uploadFileToFirebaseStorage(textbookForm.selectedFile, 'textbooks');
      }

      await publishTeacherContent('textbooks', {
        title: textbookForm.title,
        subject: textbookForm.subject,
        class: textbookForm.class,
        board: textbookForm.board,
        medium: textbookForm.medium,
        chapter: textbookForm.chapter || 'Full Textbook',
        description: textbookForm.description,
        type: 'Textbook PDF',
        fileSize: textbookForm.selectedFile ? `${(textbookForm.selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : (textbookForm.fileSize || '12.5 MB'),
        fileUrl: finalPdfUrl,
        downloadUrl: finalPdfUrl,
        teacherName,
        teacher: teacherName,
        uploadedAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess(`Textbook "${textbookForm.title}" uploaded & synced to Student Digital Library!`);
      setTextbookForm({ ...textbookForm, title: '', description: '', fileUrl: '', selectedFile: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Video Form State
  const [videoForm, setVideoForm] = useState({
    class: 'Class 10',
    board: 'Andhra Pradesh State Board (AP SSC)',
    subject: 'Physical Science',
    chapter: 'Refraction of Light at Curved Surfaces',
    lesson: 'Snell\'s Law Derivation',
    title: '',
    description: '',
    duration: '15 mins',
    language: 'Telugu',
    thumbnail: '',
    videoType: 'link' as 'file' | 'link',
    youtubeLink: '',
    selectedFile: null as File | null
  });

  const [previewVideoModal, setPreviewVideoModal] = useState<any | null>(null);

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title) return;
    setLoading(true);
    try {
      let rawLink = videoForm.youtubeLink.trim();
      let ytId = extractYouTubeId(rawLink);
      let embedUrl = ytId ? formatYouTubeEmbedUrl(rawLink) : rawLink;
      let finalVideoUrl = embedUrl;
      let finalThumbUrl = videoForm.thumbnail || getYouTubeThumbnail(rawLink, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop');

      if (videoForm.videoType === 'file' && videoForm.selectedFile) {
        finalVideoUrl = await uploadFileToFirebaseStorage(videoForm.selectedFile, 'videos');
      }

      await publishTeacherContent('videos', {
        title: videoForm.title,
        description: videoForm.description,
        class: videoForm.class,
        board: videoForm.board,
        subject: videoForm.subject,
        chapter: videoForm.chapter,
        lesson: videoForm.lesson,
        teacherName,
        teacher: teacherName,
        thumbnail: finalThumbUrl,
        thumbnailUrl: finalThumbUrl,
        videoUrl: finalVideoUrl,
        fileUrl: finalVideoUrl,
        youtubeLink: rawLink || finalVideoUrl,
        youtubeId: ytId || '',
        duration: videoForm.duration,
        language: videoForm.language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess(`Video "${videoForm.title}" published! Automatically live across Student Dashboard.`);
      setVideoForm({ ...videoForm, title: '', description: '', youtubeLink: '', selectedFile: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Notes Form State
  const [notesForm, setNotesForm] = useState({
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    lesson: 'Lens Maker Formula',
    title: '',
    description: '',
    type: 'PDF Notes' as 'PDF Notes' | 'Revision Notes' | 'Formula Sheets' | 'Worksheets' | 'Mind Maps',
    selectedFile: null as File | null,
    fileUrl: ''
  });

  const handleUploadNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesForm.title) return;
    setLoading(true);
    try {
      let finalUrl = notesForm.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      if (notesForm.selectedFile) {
        finalUrl = await uploadFileToFirebaseStorage(notesForm.selectedFile, 'notes');
      }

      await publishTeacherContent('notes', {
        title: notesForm.title,
        description: notesForm.description,
        type: notesForm.type,
        subject: notesForm.subject,
        chapter: notesForm.chapter,
        lesson: notesForm.lesson,
        teacherName,
        teacher: teacherName,
        fileSize: notesForm.selectedFile ? `${(notesForm.selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB',
        downloadUrl: finalUrl,
        fileUrl: finalUrl,
        createdAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess(`Notes "${notesForm.title}" published to Digital Library!`);
      setNotesForm({ ...notesForm, title: '', description: '', selectedFile: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Worksheets Form State
  const [worksheetForm, setWorksheetForm] = useState({
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    lesson: 'Factorization Method',
    title: '',
    description: '',
    selectedFile: null as File | null,
    fileUrl: ''
  });

  const handleUploadWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worksheetForm.title) return;
    setLoading(true);
    try {
      let finalUrl = worksheetForm.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      if (worksheetForm.selectedFile) {
        finalUrl = await uploadFileToFirebaseStorage(worksheetForm.selectedFile, 'worksheets');
      }

      await publishTeacherContent('worksheets', {
        title: worksheetForm.title,
        description: worksheetForm.description,
        type: 'Worksheets',
        subject: worksheetForm.subject,
        chapter: worksheetForm.chapter,
        lesson: worksheetForm.lesson,
        teacherName,
        teacher: teacherName,
        fileSize: worksheetForm.selectedFile ? `${(worksheetForm.selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        downloadUrl: finalUrl,
        fileUrl: finalUrl,
        createdAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess(`Worksheet "${worksheetForm.title}" published!`);
      setWorksheetForm({ ...worksheetForm, title: '', description: '', selectedFile: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Formula Sheets Form State
  const [formulaForm, setFormulaForm] = useState({
    subject: 'Physical Science',
    chapter: 'Electricity & Circuits',
    title: '',
    description: '',
    selectedFile: null as File | null
  });

  const handleUploadFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulaForm.title) return;
    setLoading(true);
    try {
      let finalUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      if (formulaForm.selectedFile) {
        finalUrl = await uploadFileToFirebaseStorage(formulaForm.selectedFile, 'formula_sheets');
      }

      await publishTeacherContent('formula_sheets', {
        title: formulaForm.title,
        description: formulaForm.description,
        type: 'Formula Sheets',
        subject: formulaForm.subject,
        chapter: formulaForm.chapter,
        teacherName,
        teacher: teacherName,
        fileSize: formulaForm.selectedFile ? `${(formulaForm.selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        downloadUrl: finalUrl,
        createdAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess(`Formula Sheet "${formulaForm.title}" published!`);
      setFormulaForm({ ...formulaForm, title: '', description: '', selectedFile: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Previous Papers Form State
  const [paperForm, setPaperForm] = useState({
    year: '2025',
    subject: 'Mathematics',
    medium: 'English Medium' as 'English Medium' | 'Telugu Medium' | 'Dual Medium',
    paperType: 'Public Exam Main' as 'Public Exam Main' | 'Supplementary Exam' | 'Board Official Model Paper',
    totalMarks: 100,
    examDuration: '3 Hours 15 Mins',
    title: '',
    paperUrlInput: '',
    keyUrlInput: '',
    selectedPaperFile: null as File | null,
    selectedKeyFile: null as File | null,
    teacherSolution: '',
    board: 'Telangana SCERT (TS BSE)'
  });

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.title) return;
    setLoading(true);
    try {
      let paperUrl = paperForm.paperUrlInput || '';
      let keyUrl = paperForm.keyUrlInput || '';

      if (paperForm.selectedPaperFile) {
        paperUrl = await uploadFileToFirebaseStorage(paperForm.selectedPaperFile, 'previous_papers');
      }
      if (paperForm.selectedKeyFile) {
        keyUrl = await uploadFileToFirebaseStorage(paperForm.selectedKeyFile, 'previous_papers_keys');
      }

      if (!paperUrl) {
        paperUrl = 'https://bse.telangana.gov.in/pdf/SSC_2025_Maths_Model.pdf';
      }

      await addPreviousPaper({
        title: paperForm.title,
        year: paperForm.year,
        academicYear: `${paperForm.year}-Board`,
        subject: paperForm.subject,
        medium: paperForm.medium,
        paperType: paperForm.paperType,
        totalMarks: Number(paperForm.totalMarks) || 100,
        examDuration: paperForm.examDuration,
        questionPaperUrl: paperUrl,
        answerKeyUrl: keyUrl,
        board: paperForm.board,
        teacherSolution: paperForm.teacherSolution,
        uploadedBy: teacherName,
        fileSize: '2.8 MB',
        publishedAt: new Date().toISOString()
      });

      triggerSuccess(`Official Previous Paper "${paperForm.title}" published to Firestore!`);
      setPaperForm({
        ...paperForm,
        title: '',
        paperUrlInput: '',
        keyUrlInput: '',
        teacherSolution: '',
        selectedPaperFile: null,
        selectedKeyFile: null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Lesson Form State
  const [lessonForm, setLessonForm] = useState({
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    title: '',
    lessonNumber: 1,
    learningObjectives: '',
    summary: '',
    estimatedMinutes: 45
  });

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title) return;
    setLoading(true);
    try {
      await publishTeacherContent('lessons', {
        title: lessonForm.title,
        subject: lessonForm.subject,
        chapter: lessonForm.chapter,
        lessonNumber: lessonForm.lessonNumber,
        learningObjectives: lessonForm.learningObjectives,
        summary: lessonForm.summary,
        estimatedMinutes: lessonForm.estimatedMinutes,
        teacherName,
        uploadedAt: new Date().toISOString().split('T')[0],
        isNew: true,
        published: true
      });

      triggerSuccess(`Lesson "${lessonForm.title}" published!`);
      setLessonForm({ ...lessonForm, title: '', learningObjectives: '', summary: '', lessonNumber: lessonForm.lessonNumber + 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Quiz Form State
  const [quizForm, setQuizForm] = useState({
    class: 10,
    subject: 'Physical Science',
    chapter: 'Refraction of Light at Curved Surfaces',
    title: '',
    type: 'Chapter Quiz' as 'Chapter Quiz' | 'Weekly Test' | 'Monthly Test' | 'Mock Test',
    durationMinutes: 20,
    mcqQuestion: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'Option A',
    marks: 1,
    explanation: ''
  });

  const [quizQuestionsList, setQuizQuestionsList] = useState<QuizQuestion[]>([]);

  // Function to load 100 official questions for a Mock Test
  const handleLoad100MockQuestions = () => {
    soundFx.playClick();
    const generated = generate100QuestionsForTest(
      (quizForm.subject === 'Physical Science' || quizForm.subject === 'Biological Science' || quizForm.subject === 'Social Studies') 
        ? quizForm.subject 
        : 'Mathematics',
      1,
      `cms_${Date.now()}`
    );
    const converted: QuizQuestion[] = generated.map((g, idx) => {
      const ansStr = typeof g.correctAnswer === 'number'
        ? (g.options[g.correctAnswer] || String(g.correctAnswer))
        : String(g.correctAnswer);
      return {
        questionId: `q_${idx + 1}`,
        questionText: g.question,
        options: g.options,
        correctAnswer: ansStr,
        marks: g.marks || 1,
        explanation: g.explanation || 'SCERT AP State Board Reference.'
      };
    });
    setQuizQuestionsList(converted);
    setQuizForm((prev) => ({
      ...prev,
      durationMinutes: 180,
      title: prev.title || `${prev.subject} Class ${prev.class} 100-Question Grand Mock Examination`
    }));
    triggerSuccess(`Successfully loaded 100 authoritative board exam questions!`);
  };

  const handleAddQuestionToQuiz = () => {
    if (!quizForm.mcqQuestion.trim()) return;
    const ansKey = quizForm.correctAnswer === 'Option A' 
      ? quizForm.optionA 
      : quizForm.correctAnswer === 'Option B' 
      ? quizForm.optionB 
      : quizForm.correctAnswer === 'Option C' 
      ? quizForm.optionC 
      : quizForm.optionD;

    const newQ: QuizQuestion = {
      questionId: `q_${Date.now()}_${quizQuestionsList.length + 1}`,
      questionText: quizForm.mcqQuestion,
      options: [quizForm.optionA, quizForm.optionB, quizForm.optionC, quizForm.optionD],
      correctAnswer: ansKey || quizForm.optionA,
      marks: Number(quizForm.marks) || 1,
      explanation: quizForm.explanation || 'Refer to SCERT AP State Board Textbook.'
    };
    setQuizQuestionsList([...quizQuestionsList, newQ]);
    setQuizForm({
      ...quizForm,
      mcqQuestion: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      explanation: ''
    });
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title) return;

    let finalQuestions = [...quizQuestionsList];
    if (finalQuestions.length === 0 && quizForm.mcqQuestion.trim()) {
      const ansKey = quizForm.correctAnswer === 'Option A' 
        ? quizForm.optionA 
        : quizForm.correctAnswer === 'Option B' 
        ? quizForm.optionB 
        : quizForm.correctAnswer === 'Option C' 
        ? quizForm.optionC 
        : quizForm.optionD;

      finalQuestions.push({
        questionId: `q_1`,
        questionText: quizForm.mcqQuestion,
        options: [quizForm.optionA, quizForm.optionB, quizForm.optionC, quizForm.optionD],
        correctAnswer: ansKey || quizForm.optionA,
        marks: Number(quizForm.marks) || 1,
        explanation: quizForm.explanation || 'Refer to SCERT AP State Board Textbook.'
      });
    }

    // Strict 100-question validation for Mock Tests (Section 3 & 12)
    if (quizForm.type === 'Mock Test' && finalQuestions.length !== 100) {
      alert(`Validation Error: A Mock Test must contain exactly 100 questions before publishing. Current count: ${finalQuestions.length}. Please click "Load 100 Board Questions" or add 100 questions.`);
      return;
    }

    if (finalQuestions.length === 0) {
      alert('Please provide at least 1 question for the quiz.');
      return;
    }

    setLoading(true);
    try {
      await createAndPublishQuiz({
        title: quizForm.title,
        board: 'AP SSC',
        class: Number(quizForm.class) || 10,
        subject: quizForm.subject,
        chapterId: quizForm.chapter.toLowerCase().replace(/\s+/g, '_'),
        chapterName: quizForm.chapter,
        quizType: quizForm.type,
        status: 'published',
        durationMinutes: Number(quizForm.durationMinutes) || 20,
        totalQuestions: finalQuestions.length,
        totalMarks: finalQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
        questions: finalQuestions,
        createdBy: teacherName
      });

      triggerSuccess(`Published ${quizForm.type} "${quizForm.title}" for Class ${quizForm.class} (${finalQuestions.length} questions)!`);
      setQuizForm({
        class: 10,
        subject: 'Physical Science',
        chapter: 'Refraction of Light at Curved Surfaces',
        title: '',
        type: 'Chapter Quiz',
        durationMinutes: 20,
        mcqQuestion: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'Option A',
        marks: 1,
        explanation: ''
      });
      setQuizQuestionsList([]);
    } catch (err) {
      console.error(err);
      alert('Failed to publish quiz: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Create Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    subject: 'Physical Science',
    title: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalMarks: 20,
    instructions: '',
    attachmentUrl: ''
  });

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.title) return;
    setLoading(true);
    try {
      await publishTeacherContent('assignments', {
        title: assignmentForm.title,
        subject: assignmentForm.subject,
        dueDate: assignmentForm.dueDate,
        totalMarks: assignmentForm.totalMarks,
        instructions: assignmentForm.instructions,
        teacherName,
        submittedCount: 0,
        totalStudents: realStudentsList.length,
        createdAt: new Date().toISOString(),
        published: true
      });

      // Also sync to homework collection for Student Dashboard
      await publishTeacherContent('homework', {
        title: assignmentForm.title,
        subject: assignmentForm.subject,
        dueDate: assignmentForm.dueDate,
        submittedCount: 0,
        total: realStudentsList.length,
        teacherName,
        published: true
      });

      triggerSuccess(`Assignment "${assignmentForm.title}" published to student portal!`);
      setAssignmentForm({ ...assignmentForm, title: '', instructions: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    subject: 'Class 9 Physical Science',
    text: ''
  });

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.text) return;
    setLoading(true);
    try {
      await publishTeacherContent('announcements', {
        teacherName,
        teacherPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        announcement: announcementForm.text,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        subject: announcementForm.subject,
        createdAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess('Announcement broadcasted to all students!');
      setAnnouncementForm({ ...announcementForm, text: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Question Bank Form State
  const [qBankForm, setQBankForm] = useState({
    subject: 'Physical Science',
    chapter: 'Refraction of Light',
    topic: 'Snell\'s Law',
    type: 'MCQ' as 'MCQ' | 'Short' | 'Long',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
    explanation: '',
    hint: ''
  });

  const handleAddQuestionBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qBankForm.questionText) return;
    setLoading(true);
    try {
      await publishTeacherContent('question_bank', {
        subject: qBankForm.subject,
        chapter: qBankForm.chapter,
        topic: qBankForm.topic,
        type: qBankForm.type,
        difficulty: qBankForm.difficulty,
        questionText: qBankForm.questionText,
        options: [qBankForm.optionA, qBankForm.optionB, qBankForm.optionC, qBankForm.optionD],
        correctAnswer: qBankForm.correctAnswer,
        explanation: qBankForm.explanation,
        hint: qBankForm.hint,
        teacherName,
        createdAt: new Date().toISOString(),
        published: true
      });

      triggerSuccess('Question added to Question Bank & Practice Center!');
      setQBankForm({ ...qBankForm, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', explanation: '', hint: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Subject Form State
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    classLevel: 'Class 10',
    board: 'Andhra Pradesh State Board (AP SSC)',
    description: ''
  });

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name) return;
    setLoading(true);
    try {
      await publishTeacherContent('subjects', {
        name: subjectForm.name,
        code: subjectForm.code || subjectForm.name.slice(0, 3).toUpperCase(),
        classLevel: subjectForm.classLevel,
        board: subjectForm.board,
        description: subjectForm.description,
        teacherName,
        createdAt: new Date().toISOString()
      });
      triggerSuccess(`Subject "${subjectForm.name}" created!`);
      setSubjectForm({ name: '', code: '', classLevel: 'Class 10', board: 'Andhra Pradesh State Board (AP SSC)', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chapter Form State
  const [chapterForm, setChapterForm] = useState({
    subject: 'Physical Science',
    classLevel: 'Class 9',
    chapterNumber: 1,
    title: '',
    summary: ''
  });

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.title) return;
    setLoading(true);
    try {
      await publishTeacherContent('chapters', {
        subject: chapterForm.subject,
        classLevel: chapterForm.classLevel,
        chapterNumber: chapterForm.chapterNumber,
        title: chapterForm.title,
        summary: chapterForm.summary,
        teacherName,
        createdAt: new Date().toISOString()
      });
      triggerSuccess(`Chapter "${chapterForm.title}" added!`);
      setChapterForm({ ...chapterForm, title: '', summary: '', chapterNumber: chapterForm.chapterNumber + 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 flex-shrink-0">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Teacher CMS</h2>
            <p className="text-[11px] text-blue-600 font-semibold">Realtime LMS Portal</p>
          </div>
        </div>

        <nav className="space-y-1 max-h-[80vh] overflow-y-auto scrollbar-none pr-1">
          {SIDEBAR_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showCategory = idx === 0 || SIDEBAR_ITEMS[idx - 1].category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {showCategory && item.category && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-0.5">
              <span>ZPHS Faculty Portal</span>
              <span>•</span>
              <span>{teacherName}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 capitalize">
              {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label} Management
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Sync Active</span>
            </span>
          </div>
        </div>

        {/* Success Alert Toast */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-300" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <Video className="w-5 h-5" />
                  <span className="text-[11px] font-bold bg-blue-50 px-2 py-0.5 rounded-full text-blue-700">Live</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{videosList.length}</div>
                <div className="text-xs font-bold text-slate-500">Published Videos</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-indigo-600">
                  <File className="w-5 h-5" />
                  <span className="text-[11px] font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-700">Live</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{notesList.length + worksheetsList.length + formulaSheetsList.length}</div>
                <div className="text-xs font-bold text-slate-500">Digital Library PDFs</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-emerald-600">
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-emerald-700">Live</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{quizzesList.length + assignmentsList.length}</div>
                <div className="text-xs font-bold text-slate-500">Active Quizzes & Tests</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-amber-600">
                  <Users className="w-5 h-5" />
                  <span className="text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded-full text-amber-700">Active</span>
                </div>
                <div className="text-2xl font-black text-slate-900">42</div>
                <div className="text-xs font-bold text-slate-500">Enrolled Students</div>
              </div>
            </div>

            {/* Quick Upload Shortcuts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Quick Upload Shortcuts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('videos')}
                  className="p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition text-left cursor-pointer space-y-1"
                >
                  <Video className="w-5 h-5 text-blue-600" />
                  <div className="font-bold text-xs text-blue-900">Upload Video</div>
                  <div className="text-[10px] text-blue-600">MP4 or YouTube</div>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition text-left cursor-pointer space-y-1"
                >
                  <File className="w-5 h-5 text-indigo-600" />
                  <div className="font-bold text-xs text-indigo-900">Upload Notes</div>
                  <div className="text-[10px] text-indigo-600">PDF, PPT, Docx</div>
                </button>

                <button
                  onClick={() => setActiveTab('worksheets')}
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-left cursor-pointer space-y-1"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div className="font-bold text-xs text-emerald-900">Upload Worksheet</div>
                  <div className="text-[10px] text-emerald-600">Practice PDFs</div>
                </button>

                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="p-4 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition text-left cursor-pointer space-y-1"
                >
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <div className="font-bold text-xs text-purple-900">Create Quiz</div>
                  <div className="text-[10px] text-purple-600">MCQs & Tests</div>
                </button>
              </div>
            </div>

            {/* Recent Uploads Feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Recent Firestore Uploads (Realtime)</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {videosList.concat(notesList).concat(worksheetsList).slice(0, 8).map((doc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {doc.videoUrl ? <Video className="w-4 h-4" /> : <File className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-500">{doc.subject} • {doc.chapter}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Live on Portal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Create New Subject</h3>
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physical Science"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PHY-09"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Level</label>
                  <select
                    value={subjectForm.classLevel}
                    onChange={(e) => setSubjectForm({ ...subjectForm, classLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Education Board</label>
                  <select
                    value={subjectForm.board}
                    onChange={(e) => setSubjectForm({ ...subjectForm, board: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the subject curriculum..."
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    {loading ? 'Publishing...' : 'Publish Subject'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Configured Subjects ({subjectsList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjectsList.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                    <div className="font-black text-slate-900">{sub.name} ({sub.code})</div>
                    <div className="text-[11px] text-slate-500">{sub.classLevel} • {sub.board}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHAPTERS */}
        {activeTab === 'chapters' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Create New Chapter</h3>
              <form onSubmit={handleAddChapter} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={chapterForm.subject}
                    onChange={(e) => setChapterForm({ ...chapterForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Level</label>
                  <select
                    value={chapterForm.classLevel}
                    onChange={(e) => setChapterForm({ ...chapterForm, classLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Number</label>
                  <input
                    type="number"
                    value={chapterForm.chapterNumber}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refraction of Light at Plane Surfaces"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Chapter Summary / Learning Goals</label>
                  <textarea
                    rows={2}
                    placeholder="Learning outcomes for students..."
                    value={chapterForm.summary}
                    onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Publish Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: LESSONS */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Create New Lesson</h3>
              <form onSubmit={handleCreateLesson} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={lessonForm.subject}
                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refraction of Light"
                    value={lessonForm.chapter}
                    onChange={(e) => setLessonForm({ ...lessonForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Derivation of Snell's Law"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Order #</label>
                  <input
                    type="number"
                    value={lessonForm.lessonNumber}
                    onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Learning Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="What will students learn in this lesson?"
                    value={lessonForm.learningObjectives}
                    onChange={(e) => setLessonForm({ ...lessonForm, learningObjectives: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    {loading ? 'Publishing...' : 'Publish Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: TEXTBOOKS & DIGITAL LIBRARY RESOURCE MANAGEMENT */}
        {activeTab === 'textbooks' && (
          <TeacherDigitalLibraryManager teacherName={teacherName} />
        )}

        {/* TAB 5: UPLOAD VIDEO */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Video className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Upload Video & Sync to Student Portal</h3>
              </div>

              <form onSubmit={handleUploadVideo} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class *</label>
                  <select
                    value={videoForm.class}
                    onChange={(e) => setVideoForm({ ...videoForm, class: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Board *</label>
                  <select
                    value={videoForm.board}
                    onChange={(e) => setVideoForm({ ...videoForm, board: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={videoForm.subject}
                    onChange={(e) => setVideoForm({ ...videoForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language *</label>
                  <select
                    value={videoForm.language}
                    onChange={(e) => setVideoForm({ ...videoForm, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refraction of Light"
                    value={videoForm.chapter}
                    onChange={(e) => setVideoForm({ ...videoForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Snell's Law Derivation"
                    value={videoForm.lesson}
                    onChange={(e) => setVideoForm({ ...videoForm, lesson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Video Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Refraction Ray Diagram Explanation"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Detailed topic breakdown for students..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Video Source Type</label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="vtype"
                        checked={videoForm.videoType === 'link'}
                        onChange={() => setVideoForm({ ...videoForm, videoType: 'link' })}
                      />
                      <span>YouTube Link</span>
                    </label>
                    <label className="flex items-center space-x-2 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="vtype"
                        checked={videoForm.videoType === 'file'}
                        onChange={() => setVideoForm({ ...videoForm, videoType: 'file' })}
                      />
                      <span>Upload MP4 File</span>
                    </label>
                  </div>
                </div>

                <div>
                  {videoForm.videoType === 'link' ? (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">YouTube URL</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoForm.youtubeLink}
                        onChange={(e) => setVideoForm({ ...videoForm, youtubeLink: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Select MP4 File (Firebase Storage)</label>
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => setVideoForm({ ...videoForm, selectedFile: e.target.files?.[0] || null })}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{loading ? 'Uploading & Publishing...' : 'Publish Video to Student Dashboard'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* LIVE PUBLISHED VIDEOS LIST */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Published Video Tutorials ({videosList.length})</span>
                </h4>
                <span className="text-xs text-slate-500">Live Syncing to Student Dashboard</span>
              </div>

              {videosList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No videos published yet. Fill out the form above to add a video tutorial or YouTube link!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videosList.map((v: any, idx: number) => (
                    <div
                      key={v.id || idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-lg bg-black overflow-hidden group">
                          <img
                            src={v.thumbnail || v.thumbnailUrl || getYouTubeThumbnail(v.videoUrl || v.youtubeLink)}
                            alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setPreviewVideoModal(v);
                            }}
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 transition flex items-center justify-center text-white cursor-pointer"
                          >
                            <div className="p-3 rounded-full bg-purple-600/90 text-white shadow-xl hover:scale-110 transition">
                              <Eye className="w-5 h-5" />
                            </div>
                          </button>
                          {v.duration && (
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-extrabold">
                              {v.duration}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {v.subject || 'Physical Science'}
                          </span>
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 mt-1">
                            {v.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {v.chapter ? `Chapter: ${v.chapter}` : ''} {v.teacher ? `• ${v.teacher}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setPreviewVideoModal(v);
                        }}
                        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview / Play Video</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <File className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Upload Revision Notes & PDF Materials</h3>
              </div>

              <form onSubmit={handleUploadNotes} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={notesForm.subject}
                    onChange={(e) => setNotesForm({ ...notesForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={notesForm.type}
                    onChange={(e) => setNotesForm({ ...notesForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PDF Notes">PDF Notes</option>
                    <option value="Revision Notes">Revision Notes</option>
                    <option value="Formula Sheets">Formula Sheets</option>
                    <option value="Worksheets">Worksheets</option>
                    <option value="Mind Maps">Mind Maps</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refraction of Light"
                    value={notesForm.chapter}
                    onChange={(e) => setNotesForm({ ...notesForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical Angle & Total Internal Reflection"
                    value={notesForm.title}
                    onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Upload File (PDF, DOCX, PPT, Image)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.ppt,.pptx,image/*"
                    onChange={(e) => setNotesForm({ ...notesForm, selectedFile: e.target.files?.[0] || null })}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow-md transition cursor-pointer flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{loading ? 'Publishing Notes...' : 'Publish to Digital Library'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: WORKSHEETS */}
        {activeTab === 'worksheets' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Upload Printable Worksheets</h3>
              </div>

              <form onSubmit={handleUploadWorksheet} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={worksheetForm.subject}
                    onChange={(e) => setWorksheetForm({ ...worksheetForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quadratic Equations"
                    value={worksheetForm.chapter}
                    onChange={(e) => setWorksheetForm({ ...worksheetForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Worksheet Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 9 Maths Worksheet 3: Factorization Problems"
                    value={worksheetForm.title}
                    onChange={(e) => setWorksheetForm({ ...worksheetForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Upload Worksheet PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setWorksheetForm({ ...worksheetForm, selectedFile: e.target.files?.[0] || null })}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 shadow-md transition cursor-pointer flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{loading ? 'Publishing Worksheet...' : 'Publish Worksheet to Students'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: FORMULA SHEETS */}
        {activeTab === 'formula_sheets' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Bookmark className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Upload Quick Formula & Equation Sheets</h3>
              </div>

              <form onSubmit={handleUploadFormula} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formulaForm.subject}
                    onChange={(e) => setFormulaForm({ ...formulaForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Current & Ohm's Law"
                    value={formulaForm.chapter}
                    onChange={(e) => setFormulaForm({ ...formulaForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Formula Sheet Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Physics Formula Sheet for SSC Exams"
                    value={formulaForm.title}
                    onChange={(e) => setFormulaForm({ ...formulaForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 shadow-md transition cursor-pointer"
                  >
                    {loading ? 'Publishing...' : 'Publish Formula Sheet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: PREVIOUS PAPERS */}
        {activeTab === 'previous_papers' && (
          <TeacherPreviousPapersManager
            teacherName={teacherName}
            onSuccessNotice={triggerSuccess}
          />
        )}

        {/* TAB 10: QUESTION BANK */}
        {activeTab === 'question_bank' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Add Questions to Practice Bank</h3>
              </div>

              <form onSubmit={handleAddQuestionBank} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={qBankForm.subject}
                    onChange={(e) => setQBankForm({ ...qBankForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Question Type</label>
                  <select
                    value={qBankForm.type}
                    onChange={(e) => setQBankForm({ ...qBankForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Short">Short Answer</option>
                    <option value="Long">Long Essay</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={qBankForm.difficulty}
                    onChange={(e) => setQBankForm({ ...qBankForm, difficulty: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Question Text *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter question statement..."
                    value={qBankForm.questionText}
                    onChange={(e) => setQBankForm({ ...qBankForm, questionText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {qBankForm.type === 'MCQ' && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Option A</label>
                      <input
                        type="text"
                        value={qBankForm.optionA}
                        onChange={(e) => setQBankForm({ ...qBankForm, optionA: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Option B</label>
                      <input
                        type="text"
                        value={qBankForm.optionB}
                        onChange={(e) => setQBankForm({ ...qBankForm, optionB: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Option C</label>
                      <input
                        type="text"
                        value={qBankForm.optionC}
                        onChange={(e) => setQBankForm({ ...qBankForm, optionC: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Option D</label>
                      <input
                        type="text"
                        value={qBankForm.optionD}
                        onChange={(e) => setQBankForm({ ...qBankForm, optionD: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Correct Option Index</label>
                      <select
                        value={qBankForm.correctAnswer}
                        onChange={(e) => setQBankForm({ ...qBankForm, correctAnswer: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      >
                        <option value={0}>Option A (0)</option>
                        <option value={1}>Option B (1)</option>
                        <option value={2}>Option C (2)</option>
                        <option value={3}>Option D (3)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Explanation / Hint</label>
                  <input
                    type="text"
                    placeholder="Step-by-step reasoning or hint..."
                    value={qBankForm.explanation}
                    onChange={(e) => setQBankForm({ ...qBankForm, explanation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    {loading ? 'Adding...' : 'Add to Question Bank'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 10.5: PRACTICE SETS (30-50 QUESTIONS) */}
        {activeTab === 'practice_sets' && (
          <TeacherPracticeSetManager
            teacherName={teacherName}
            onSuccessNotice={triggerSuccess}
          />
        )}

        {/* TAB 10.6: 100-Q MOCK TESTS */}
        {activeTab === 'mock_tests' && (
          <TeacherMockTestManager />
        )}

        {/* TAB 11: QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <CheckSquare className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Create & Publish Interactive Quiz</h3>
              </div>

              <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={quizForm.class}
                    onChange={(e) => setQuizForm({ ...quizForm, class: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value={10}>Class 10 (AP SSC Board)</option>
                    <option value={9}>Class 9</option>
                    <option value={8}>Class 8</option>
                    <option value={7}>Class 7</option>
                    <option value={6}>Class 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chapter / Topic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Refraction of Light at Curved Surfaces"
                    value={quizForm.chapter}
                    onChange={(e) => setQuizForm({ ...quizForm, chapter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quiz Type *</label>
                  <select
                    value={quizForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      setQuizForm({
                        ...quizForm,
                        type: newType,
                        durationMinutes: newType === 'Mock Test' ? 180 : 25
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Chapter Quiz">Chapter Quiz</option>
                    <option value="Weekly Test">Weekly Test</option>
                    <option value="Monthly Test">Monthly Test</option>
                    <option value="Mock Test">Mock Test (Requires Exactly 100 Questions)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 Physical Science Refraction Mastery Test"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={quizForm.durationMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 100-Question Mock Test Loader Banner */}
                {quizForm.type === 'Mock Test' && (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <span className="font-black text-amber-900 dark:text-amber-200 text-xs">
                          100-Question Mock Test Validation Requirement
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                        quizQuestionsList.length === 100 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {quizQuestionsList.length} / 100 Questions
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Mock tests require 100 authentic questions to publish. Click below to instantly load 100 syllabus-calibrated questions for {quizForm.subject}.
                    </p>
                    <button
                      type="button"
                      onClick={handleLoad100MockQuestions}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition cursor-pointer"
                    >
                      ⚡ Load 100 Board Questions Automatically
                    </button>
                  </div>
                )}

                {/* Question Builder */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      Add / Compose Question (Current Total: {quizQuestionsList.length})
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Question Statement</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Which law states that the ratio of sine of angle of incidence to sine of angle of refraction is constant?"
                      value={quizForm.mcqQuestion}
                      onChange={(e) => setQuizForm({ ...quizForm, mcqQuestion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Option A</label>
                      <input
                        type="text"
                        placeholder="Option A text"
                        value={quizForm.optionA}
                        onChange={(e) => setQuizForm({ ...quizForm, optionA: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Option B</label>
                      <input
                        type="text"
                        placeholder="Option B text"
                        value={quizForm.optionB}
                        onChange={(e) => setQuizForm({ ...quizForm, optionB: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Option C</label>
                      <input
                        type="text"
                        placeholder="Option C text"
                        value={quizForm.optionC}
                        onChange={(e) => setQuizForm({ ...quizForm, optionC: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Option D</label>
                      <input
                        type="text"
                        placeholder="Option D text"
                        value={quizForm.optionD}
                        onChange={(e) => setQuizForm({ ...quizForm, optionD: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Correct Key</label>
                      <select
                        value={quizForm.correctAnswer}
                        onChange={(e) => setQuizForm({ ...quizForm, correctAnswer: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                      >
                        <option value="Option A">Option A</option>
                        <option value="Option B">Option B</option>
                        <option value="Option C">Option C</option>
                        <option value="Option D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Marks</label>
                      <input
                        type="number"
                        value={quizForm.marks}
                        onChange={(e) => setQuizForm({ ...quizForm, marks: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Explanation / Hint</label>
                    <input
                      type="text"
                      placeholder="Step-by-step SCERT reasoning..."
                      value={quizForm.explanation}
                      onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddQuestionToQuiz}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-300 transition cursor-pointer"
                    >
                      + Add Question to Current Quiz
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    {loading ? 'Publishing...' : 'Publish to Student Portal (Firestore)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 12: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Create New Assignment / Homework</h3>
              </div>

              <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Draw Ray Diagram for Refraction through Glass Prism"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Instructions & Guidelines</label>
                  <textarea
                    rows={3}
                    placeholder="Step-by-step submission instructions for students..."
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-md transition cursor-pointer"
                  >
                    {loading ? 'Publishing...' : 'Publish Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 13: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="animate-in fade-in">
            <AnnouncementsView teacherName={teacherName} />
          </div>
        )}

        {/* TAB 14: STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
            <h3 className="font-extrabold text-sm text-slate-900">Enrolled Students Roster & Progress</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-extrabold uppercase">
                    <th className="p-3">Roll #</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Avg Quiz Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {realStudentsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        No students enrolled yet.
                      </td>
                    </tr>
                  ) : (
                    realStudentsList.map((s, idx) => {
                      const avgScore = s.quizScoreAvg ?? s.averageMockTestScore ?? 0;
                      const statusLabel = avgScore >= 85 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore > 0 ? 'Needs Support' : 'Pending Tests';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-500 dark:text-slate-400">{s.rollNumber || `STU-${idx + 1}`}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <img
                              src={s.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.name}`}
                              alt={s.name}
                              className="w-6 h-6 rounded-full bg-slate-200"
                            />
                            <span>{s.name}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{s.grade || (s.class ? `Class ${s.class}` : 'Unassigned')}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{s.status === 'Online' ? 'Active (Online)' : 'Offline'}</td>
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{avgScore > 0 ? `${avgScore}%` : 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              statusLabel === 'Excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              statusLabel === 'Needs Support' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 
                              statusLabel === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 15: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
            <h3 className="font-extrabold text-sm text-slate-900">Class Performance & Engagement Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900">Video Watch Completion</div>
                <div className="text-3xl font-black text-blue-600">84%</div>
                <div className="text-[11px] text-blue-700">Average student video completion rate</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900">Quiz Submission Rate</div>
                <div className="text-3xl font-black text-emerald-600">
                  {realStudentsList.length > 0 ? `${Math.round((realStudentsList.filter(s => (s.quizScoreAvg || 0) > 0).length / realStudentsList.length) * 100)}%` : '0%'}
                </div>
                <div className="text-[11px] text-emerald-700">
                  {realStudentsList.length > 0 
                    ? `${realStudentsList.filter(s => (s.quizScoreAvg || 0) > 0).length} out of ${realStudentsList.length} enrolled students submitted` 
                    : 'No students enrolled yet'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900">Resource Downloads</div>
                <div className="text-3xl font-black text-indigo-600">142</div>
                <div className="text-[11px] text-indigo-700">Notes & Worksheets downloaded this week</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 16: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs animate-in fade-in">
            <h3 className="font-extrabold text-sm text-slate-900">Teacher Profile & Portal Settings</h3>
            <div className="space-y-3 max-w-lg">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  disabled
                  value={teacherName}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  disabled
                  value="Senior Physical Science & Mathematics Master"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">School</label>
                <input
                  type="text"
                  disabled
                  value="ZPHS Vijayawada • AP SCERT (AP SSC)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        <VideoModalPlayer
          isOpen={!!previewVideoModal}
          onClose={() => setPreviewVideoModal(null)}
          video={previewVideoModal}
        />
      </main>
    </div>
  );
};
