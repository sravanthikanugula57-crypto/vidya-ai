import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send, 
  Star, 
  Check, 
  Paperclip, 
  BookOpen, 
  Image as ImageIcon, 
  X, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  RotateCcw,
  Bot
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { normalizeGradeKey, OFFICIAL_SYLLABUS_BY_CLASS, OfficialClassGrade } from '../../../data/officialSyllabusData';
import { 
  submitStudentHomework, 
  subscribeToHomeworkSubmissions,
  TeacherHomeworkItem,
  HomeworkSubmissionDoc
} from '../../../services/studentFirestoreService';
import { 
  subscribeToHomeworks, 
  subscribeToStudentAIHomework,
  saveAIHomework,
  generateAIHomeworkForChapter,
  fetchHomeworkByClassAndSection,
  Homework as ServiceHomework,
  AIQuestionItem
} from '../../../services/homeworkService';
import { 
  RealHomeworkDoc, 
  RealHomeworkSubmissionDoc, 
  subscribeStudentHomeworkList, 
  subscribeStudentSubmissions,
  normalizeSubmissionStatus
} from '../../../services/realHomeworkService';
import { StudentSolveHomeworkModal } from '../homework/StudentSolveHomeworkModal';

interface HomeworkCenterViewProps {
  userId?: string;
  studentName?: string;
  studentSection?: string;
  homeworkList?: any[];
  onSubmitHomework?: (hwId: string) => void;
  onLaunchCam?: () => void;
  studentClassGrade?: string;
}

type FilterTab = 'All' | 'Pending' | 'Submitted' | 'Completed' | 'Overdue';

export const HomeworkCenterView: React.FC<HomeworkCenterViewProps> = ({
  userId = 'std_demo_101',
  studentName = 'Student',
  studentSection,
  onSubmitHomework,
  onLaunchCam,
  studentClassGrade = 'Class 5'
}) => {
  const normalizedClass = (normalizeGradeKey(studentClassGrade) as OfficialClassGrade) || 'Class 5';
  const [selectedClass, setSelectedClass] = useState<string>(normalizedClass);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  
  // Real Firestore Datasets (Zero fake data)
  const [realHomeworks, setRealHomeworks] = useState<RealHomeworkDoc[]>([]);
  const [realSubmissions, setRealSubmissions] = useState<RealHomeworkSubmissionDoc[]>([]);
  const [solvingRealHomework, setSolvingRealHomework] = useState<RealHomeworkDoc | null>(null);

  const [teacherHomeworks, setTeacherHomeworks] = useState<ServiceHomework[]>([]);
  const [aiHomeworks, setAiHomeworks] = useState<ServiceHomework[]>([]);
  const [mySubmissions, setMySubmissions] = useState<HomeworkSubmissionDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Item for standard Teacher submission modal
  const [selectedHomework, setSelectedHomework] = useState<ServiceHomework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // AI Homework Generator Modal State
  const [isAIGenModalOpen, setIsAIGenModalOpen] = useState(false);
  const [aiSubject, setAiSubject] = useState<string>('Mathematics');
  const [aiChapter, setAiChapter] = useState<string>('');
  const [aiDifficulty, setAiDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  // Interactive AI Practice Solving Modal
  const [activeAIPractice, setActiveAIPractice] = useState<ServiceHomework | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isAIPracticeSubmitted, setIsAIPracticeSubmitted] = useState(false);
  const [aiScore, setAiScore] = useState(0);

  // Hidden File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Stream State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraErr, setCameraErr] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Available subjects and chapters based on selected class
  const classKey = (selectedClass in OFFICIAL_SYLLABUS_BY_CLASS ? selectedClass : 'Class 5') as OfficialClassGrade;
  const syllabusSubjects = OFFICIAL_SYLLABUS_BY_CLASS[classKey] || OFFICIAL_SYLLABUS_BY_CLASS['Class 5'] || [];
  const currentSubjectObj = syllabusSubjects.find(s => s.name === aiSubject) || syllabusSubjects[0];
  const availableChapters = currentSubjectObj ? currentSubjectObj.chapters : [];

  // Update default AI subject & chapter when class changes
  useEffect(() => {
    if (syllabusSubjects.length > 0) {
      const firstSubj = syllabusSubjects[0];
      setAiSubject(firstSubj.name);
      if (firstSubj.chapters.length > 0) {
        setAiChapter(firstSubj.chapters[0].title);
      }
    }
  }, [selectedClass]);

  // Update AI chapter when subject changes
  useEffect(() => {
    if (availableChapters.length > 0) {
      setAiChapter(availableChapters[0].title);
    }
  }, [aiSubject]);

  // 1. Subscribe to Teacher Assigned Homework (Real Firestore)
  useEffect(() => {
    setIsLoading(true);
    const targetQueryClass = selectedClass === 'All' ? undefined : selectedClass;
    
    // Subscribe to new real homework system
    const unsubRealHw = subscribeStudentHomeworkList(selectedClass, (list) => {
      setRealHomeworks(list);
      setIsLoading(false);
    });

    const unsubRealSubs = subscribeStudentSubmissions(userId, (subs) => {
      setRealSubmissions(subs);
    });

    const unsubscribeTeacherHW = subscribeToHomeworks(targetQueryClass, studentSection, (items) => {
      setTeacherHomeworks(items || []);
      setIsLoading(false);
    });

    // 2. Subscribe to AI-Generated Homework for this authenticated student
    const unsubscribeAIHW = subscribeToStudentAIHomework(userId, targetQueryClass, (items) => {
      setAiHomeworks(items || []);
      setIsLoading(false);
    });

    // 3. Subscribe to Student Submissions (legacy format)
    const unsubscribeSub = subscribeToHomeworkSubmissions((subs) => {
      const userSubs = subs.filter(s => s.studentId === userId || s.studentName === studentName);
      setMySubmissions(userSubs);
    });

    return () => {
      unsubRealHw();
      unsubRealSubs();
      unsubscribeTeacherHW();
      unsubscribeAIHW();
      unsubscribeSub();
    };
  }, [selectedClass, studentSection, userId, studentName]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startLiveCamera = async () => {
    soundFx.playClick();
    setCameraErr(null);
    setIsCameraModalOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera stream failed, falling back to camera input", err);
      setCameraErr("Could not launch live camera stream directly. Opening device camera app...");
      setTimeout(() => {
        setIsCameraModalOpen(false);
        cameraInputRef.current?.click();
      }, 1000);
    }
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    soundFx.playSuccess();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setAttachedImages(prev => [...prev, dataUrl]);
    }
    stopCameraStream();
    setIsCameraModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    soundFx.playClick();
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFx.playClick();
    setPdfFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPdfUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const getSubjectIcon = (subj?: string) => {
    const s = (subj || '').toLowerCase();
    if (s.includes('math')) return '📘';
    if (s.includes('sci') || s.includes('evs') || s.includes('environ')) return '🔬';
    if (s.includes('eng')) return '📖';
    if (s.includes('telugu')) return '✍️';
    if (s.includes('hindi')) return '📜';
    if (s.includes('social')) return '🌍';
    return '📝';
  };

  const isOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    const dLower = (dueDateStr || '').toLowerCase();
    if (dLower.includes('today') || dLower.includes('self-paced') || dLower.includes('upcoming')) {
      return false;
    }
    try {
      const date = new Date(dueDateStr);
      if (!isNaN(date.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date.getTime() < today.getTime();
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Combine Real Teacher Homework and Real AI Homework
  const convertedRealHomeworks: ServiceHomework[] = (realHomeworks || []).filter(h => Boolean(h && h.id)).map(h => ({
    id: h.id,
    title: h.title || '',
    description: h.description || '',
    class: h.class || '',
    classId: h.class || '',
    targetGrade: h.class || '',
    subject: h.subject || '',
    chapter: h.chapterName || '',
    instructions: h.description || '',
    dueDate: h.dueDate || '',
    status: ((h.status || 'published').toUpperCase() as any),
    totalMarks: h.totalMarks || 0,
    questions: (h.questions || []) as any,
    source: 'TEACHER',
    published: h.status === 'published'
  }));

  const existingRealIds = new Set(convertedRealHomeworks.map(h => h.id));
  const uniqueLegacyTeacherHws = teacherHomeworks.filter(h => !existingRealIds.has(h.id));
  const allRealHomeworks: ServiceHomework[] = [...convertedRealHomeworks, ...uniqueLegacyTeacherHws, ...aiHomeworks];

  // Enrich with current student submission status
  const enrichedHomeworkList = allRealHomeworks.map((hw) => {
    const realSub = realSubmissions.find(s => s.homeworkId === hw.id);
    const sub = mySubmissions.find(s => s.homeworkId === hw.id);
    const realHwDoc = realHomeworks.find(r => r.id === hw.id);

    let status: 'Pending' | 'Submitted' | 'Completed' | 'Overdue' = 'Pending';
    let displayStatus: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded' | 'Late' = 'Not Started';
    let submissionTimeStr: string | undefined;
    let realScore: number | undefined;
    let realMaxScore: number | undefined;
    let teacherFeedback: string | undefined;
    let isInProgress = false;

    if (realSub) {
      const norm = normalizeSubmissionStatus(realSub.status);
      if (norm === 'submitted') {
        displayStatus = 'Submitted';
        status = 'Submitted';
        realScore = realSub.score;
        realMaxScore = realSub.maxScore || (realSub as any).totalMarks;
        teacherFeedback = realSub.teacherFeedback;
      } else if (norm === 'graded') {
        displayStatus = 'Graded';
        status = 'Completed';
        realScore = realSub.score;
        realMaxScore = realSub.maxScore || (realSub as any).totalMarks;
        teacherFeedback = realSub.teacherFeedback;
      } else if (norm === 'late') {
        displayStatus = 'Late';
        status = 'Submitted';
        realScore = realSub.score;
        realMaxScore = realSub.maxScore || (realSub as any).totalMarks;
      } else if (norm === 'in_progress') {
        displayStatus = 'In Progress';
        status = 'Pending';
        isInProgress = true;
      }

      if (realSub.submittedAt) {
        try {
          const dt = new Date(realSub.submittedAt);
          if (!isNaN(dt.getTime())) {
            submissionTimeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } catch {
          // ignore
        }
      }
    } else if (sub) {
      if (sub.status === 'Graded') {
        status = 'Completed';
        displayStatus = 'Graded';
      } else {
        status = 'Submitted';
        displayStatus = 'Submitted';
      }
    } else {
      if (isOverdue(hw.dueDate)) {
        status = 'Overdue';
        displayStatus = 'Not Started';
      } else {
        status = 'Pending';
        displayStatus = 'Not Started';
      }
    }

    return {
      ...hw,
      userStatus: status,
      displayStatus,
      submissionTimeStr,
      submissionDoc: sub,
      realSubmissionDoc: realSub,
      realHwDoc,
      realScore,
      realMaxScore,
      teacherFeedback,
      isInProgress,
      isAI: hw.source === 'AI'
    };
  });

  // Filter list by selected tab
  const filteredList = enrichedHomeworkList.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return item.userStatus === 'Pending';
    if (activeFilter === 'Submitted') return item.userStatus === 'Submitted';
    if (activeFilter === 'Completed') return item.userStatus === 'Completed';
    if (activeFilter === 'Overdue') return item.userStatus === 'Overdue';
    return true;
  });

  // Due Today Card: Only shown if there is a real pending assignment due today
  const dueTodayItem = enrichedHomeworkList.find(
    (h) => (h.dueDate && ((h.dueDate || '').toLowerCase().includes('today') || (h.dueDate || '').includes('8:00 PM'))) && h.userStatus === 'Pending'
  );

  // Submit standard homework (teacher assignment)
  const handleSubmitTeacherHomework = async () => {
    if (!selectedHomework) return;
    setIsSubmitting(true);
    soundFx.playSuccess();

    try {
      await submitStudentHomework({
        homeworkId: selectedHomework.id,
        homeworkTitle: selectedHomework.title,
        studentId: userId,
        studentName: studentName || 'Student',
        studentGrade: normalizedClass,
        answersText: submissionText || (attachedImages.length > 0 || pdfUrl ? 'Solution documents/scans attached.' : 'Submitted solution notebook work.'),
        attachedPdfUrl: pdfUrl || undefined,
        attachedImages: attachedImages.length > 0 ? attachedImages : undefined,
        maxMarks: selectedHomework.totalMarks || 20,
        teacherName: selectedHomework.teacherName || 'Teacher'
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);

      setTimeout(() => {
        setIsSubmittedSuccess(false);
        setSelectedHomework(null);
        setSubmissionText('');
        setPdfUrl('');
        setPdfFileName('');
        setAttachedImages([]);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Generate AI Homework upon explicit student request
  const handleGenerateAIHomework = async () => {
    setIsGeneratingAI(true);
    setAiGenError(null);
    soundFx.playClick();

    try {
      // Calls service layer to trigger AI prompt and save under 'AI' source in Firestore
      await generateAIHomeworkForChapter({
        grade: selectedClass === 'All' ? 'Class 5' : selectedClass,
        subject: aiSubject,
        chapter: aiChapter || 'Core Practice',
        difficulty: aiDifficulty,
        numQuestions: aiQuestionCount,
        studentId: userId,
        studentName: studentName,
        language: 'English'
      });

      soundFx.playSuccess();
      setIsGeneratingAI(false);
      setIsAIGenModalOpen(false);
    } catch (err: any) {
      console.error('Error generating AI homework:', err);
      setAiGenError(err.message || 'Could not generate homework. Please try again.');
      setIsGeneratingAI(false);
    }
  };

  // Start Solving Interactive AI Practice
  const handleStartAIPractice = (hw: ServiceHomework) => {
    setActiveAIPractice(hw);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setShowHint({});
    setIsAIPracticeSubmitted(false);
    setAiScore(0);
  };

  // Submit AI Practice Answers
  const handleSubmitAIPractice = async () => {
    if (!activeAIPractice) return;
    soundFx.playSuccess();

    const questions = (activeAIPractice.questions || []) as AIQuestionItem[];
    let score = 0;
    const maxScore = activeAIPractice.totalMarks || (questions.length * 2) || 10;
    const pointsPerQ = maxScore / (questions.length || 1);

    questions.forEach((q, idx) => {
      const studentAns = selectedAnswers[idx];
      if (studentAns && q.correctAnswer && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += pointsPerQ;
      }
    });

    const finalScore = Math.round(score);
    setAiScore(finalScore);
    setIsAIPracticeSubmitted(true);

    try {
      await submitStudentHomework({
        homeworkId: activeAIPractice.id,
        homeworkTitle: activeAIPractice.title,
        studentId: userId,
        studentName: studentName || 'Student',
        studentGrade: normalizedClass,
        answersText: `AI Practice Completed. Score: ${finalScore}/${maxScore}. Answers: ${JSON.stringify(selectedAnswers)}`,
        maxMarks: maxScore,
        teacherName: 'AI Learning Coach'
      });
    } catch (err) {
      console.warn('Could not save AI practice score to submissions:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hidden Real HTML Inputs */}
      <input 
        type="file" 
        ref={imageInputRef} 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={handleImageFileChange} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleImageFileChange} 
      />
      <input 
        type="file" 
        ref={pdfInputRef} 
        accept="application/pdf" 
        className="hidden" 
        onChange={handlePdfFileChange} 
      />

      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              HOMEWORK CENTER
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
              Stay on top of your assignments.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete your homework and track your progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Grade Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Grade:</span>
              <select
                value={selectedClass}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedClass(e.target.value);
                }}
                className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="All">All Grades</option>
              </select>
            </div>

            {/* Explicit AI Homework Generator Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                setIsAIGenModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Homework</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📌 Due Today Highlight Box (Shown strictly when real pending homework exists) */}
      {dueTodayItem && (
        <div className="rounded-3xl border-2 border-slate-900 dark:border-slate-600 bg-amber-50/70 dark:bg-slate-900/90 p-6 sm:p-7 shadow-sm transition-all relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm mb-3">
            <span className="text-base">📌</span>
            <span>Due Today</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {dueTodayItem.subject} – {dueTodayItem.chapter ? dueTodayItem.chapter.replace(/^Chapter \d+:\s*/i, '').replace(/–.*/, '').trim() : (dueTodayItem.title || 'Assignment')}
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Due: {(dueTodayItem.dueDate && dueTodayItem.dueDate.includes('Today')) ? dueTodayItem.dueDate : 'Today, 8:00 PM'}
            </p>
          </div>

          <div className="mt-5">
            <button
              onClick={() => {
                soundFx.playClick();
                if (dueTodayItem.source === 'AI') {
                  handleStartAIPractice(dueTodayItem);
                } else {
                  setSelectedHomework(dueTodayItem);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>Start Homework</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* "Your Homework" Section */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Homework
          </h2>

          {/* Filter Tabs: [All] [Pending] [Submitted] [Completed] [Overdue] */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['All', 'Pending', 'Submitted', 'Completed', 'Overdue'] as const).map((tab) => {
              const count = tab === 'All' 
                ? enrichedHomeworkList.length 
                : enrichedHomeworkList.filter(h => h.userStatus === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveFilter(tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-Data Homework List or Empty State */}
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                No homework assigned yet.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When your teacher publishes an assignment for {selectedClass}, it will appear here in real time.
              </p>
            </div>

            {/* Need extra practice prompt with AI generator */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Need extra practice?</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate customized practice questions for your {selectedClass} syllabus chapters.
              </p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAIGenModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Homework</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item, idx) => {
              const icon = getSubjectIcon(item.subject);
              const chapterOrTitle = item.chapter || item.title || 'Exercise Assignment';
              const isSubmitted = item.userStatus === 'Submitted';
              const isCompleted = item.userStatus === 'Completed';
              const isPending = item.userStatus === 'Pending';
              const isOverdueStatus = item.userStatus === 'Overdue';
              const isAIItem = item.source === 'AI';

              return (
                <div
                  key={item.id || idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      {/* Subject Header with Icon */}
                      <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                        <span>{icon}</span>
                        <span>{item.subject}</span>
                        {isAIItem && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            🤖 AI Practice
                          </span>
                        )}
                      </div>

                      {/* Chapter / Exercise Title */}
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                        {chapterOrTitle}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      {item.class || selectedClass}
                    </span>
                  </div>

                  {/* Metadata Fields: Due, Assigned by, Status */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <div>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Due: </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{item.dueDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Assigned by: </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {isAIItem ? 'AI Learning Coach' : (item.teacherName || 'Teacher')}
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Status: </span>
                        {item.displayStatus === 'In Progress' && (
                          <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <span>⏳</span> In Progress
                          </span>
                        )}
                        {item.displayStatus === 'Not Started' && (
                          <span className="font-bold text-slate-600 dark:text-slate-400">
                            Not Started
                          </span>
                        )}
                        {item.displayStatus === 'Submitted' && (
                          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <span>✓</span> Submitted
                          </span>
                        )}
                        {item.displayStatus === 'Late' && (
                          <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <span>⚠️</span> Late
                          </span>
                        )}
                        {item.displayStatus === 'Graded' && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>⭐</span> Graded ({item.realScore ?? item.submissionDoc?.marks ?? item.totalMarks ?? 20}/{item.realMaxScore ?? item.submissionDoc?.maxMarks ?? item.totalMarks ?? 20} Marks)
                          </span>
                        )}
                      </div>

                      {item.submissionTimeStr && (
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Submitted at: {item.submissionTimeStr}</span>
                        </div>
                      )}

                      {item.realHwDoc?.attachmentUrl && (
                        <div className="pt-1">
                          <a
                            href={item.realHwDoc.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Attachment: {item.realHwDoc.attachmentName || 'View Document'}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {item.teacherFeedback && (
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
                        <span className="font-bold">Teacher Feedback: </span>
                        <span>"{item.teacherFeedback}"</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isPending || isOverdueStatus || item.isInProgress ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          if (item.realHwDoc) {
                            setSolvingRealHomework(item.realHwDoc);
                          } else if (isAIItem) {
                            handleStartAIPractice(item);
                          } else {
                            setSelectedHomework(item);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                      >
                        <span>{item.isInProgress ? 'Resume Homework' : 'Start Homework'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          if (item.realHwDoc) {
                            setSolvingRealHomework(item.realHwDoc);
                          } else if (isAIItem) {
                            handleStartAIPractice(item);
                          } else {
                            setSelectedHomework(item);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{isCompleted ? 'View Graded Homework' : 'View Submission'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Homework Generator Modal */}
      {isAIGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Generate AI Homework
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Syllabus-aligned practice for {selectedClass}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAIGenModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiGenError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {aiGenError}
              </div>
            )}

            <div className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={aiSubject}
                  onChange={(e) => {
                    soundFx.playClick();
                    setAiSubject(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {syllabusSubjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection from Real Syllabus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter
                </label>
                <select
                  value={aiChapter}
                  onChange={(e) => {
                    soundFx.playClick();
                    setAiChapter(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableChapters.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAiDifficulty(diff);
                    }}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                      aiDifficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Question count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Practice Questions
                </label>
                <div className="flex items-center gap-3">
                  {[5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAiQuestionCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        aiQuestionCount === num
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      {num} Questions ({num * 2} Marks)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateAIHomework}
                disabled={isGeneratingAI}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Syllabus Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Start Assignment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Practice Solving Modal */}
      {activeAIPractice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400">
                  {activeAIPractice.subject} • {activeAIPractice.chapter}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {activeAIPractice.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveAIPractice(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAIPracticeSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Award className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">
                    Practice Completed!
                  </h4>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Your Score: {aiScore} / {activeAIPractice?.totalMarks || (((activeAIPractice?.questions || []).length || 5) * 2)} Marks
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your AI homework submission and score have been saved to your student profile.
                </p>
                <button
                  onClick={() => setActiveAIPractice(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer shadow"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {(() => {
                  const questions = (activeAIPractice?.questions || []) as AIQuestionItem[];
                  const currentQ = questions[currentQIndex];

                  if (!currentQ) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No questions in this practice set.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Progress Header */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Question {currentQIndex + 1} of {questions.length}</span>
                        <span>{currentQ.marks || 2} Marks</span>
                      </div>

                      {/* Question Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                          {currentQ.question}
                        </p>
                      </div>

                      {/* Options */}
                      {currentQ.options && currentQ.options.length > 0 && (
                        <div className="space-y-2">
                          {currentQ.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[currentQIndex] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  soundFx.playClick();
                                  setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: opt }));
                                }}
                                className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Hint Accordion */}
                      {currentQ.hint && (
                        <div>
                          {showHint[currentQIndex] ? (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Hint: </span>
                                <span>{currentQ.hint}</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setShowHint(prev => ({ ...prev, [currentQIndex]: true }));
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>Show Hint</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Navigation & Submit Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={currentQIndex === 0}
                          onClick={() => {
                            soundFx.playClick();
                            setCurrentQIndex(prev => prev - 1);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-30 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          Previous
                        </button>

                        {currentQIndex < questions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setCurrentQIndex(prev => prev + 1);
                            }}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white cursor-pointer"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmitAIPractice}
                            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white cursor-pointer shadow-md"
                          >
                            Submit Practice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Camera Snapshot Stream Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-white text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Live Camera Scanner
              </span>
              <button 
                onClick={() => { stopCameraStream(); setIsCameraModalOpen(false); }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraErr ? (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <p>{cameraErr}</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border border-slate-800 flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-emerald-300 bg-black/50 px-3 py-1 rounded-full backdrop-blur">
                    Position Notebook Solution in Frame
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { stopCameraStream(); setIsCameraModalOpen(false); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              {!cameraErr && (
                <button
                  type="button"
                  onClick={capturePhotoFromCamera}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Homework Submission Modal */}
      {selectedHomework && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600">
                  {selectedHomework.subject} • {selectedHomework.class || normalizedClass}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedHomework.title || selectedHomework.chapter}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedHomework(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Homework Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Your teacher will receive instant notification in their portal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Teacher's Instructions:</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedHomework.instructions || selectedHomework.description || 'Complete the exercises in your homework notebook and submit solutions.'}
                  </p>
                </div>

                {/* Display Structured Questions if Available */}
                {selectedHomework?.questions && Array.isArray(selectedHomework.questions) && selectedHomework.questions.length > 0 && (
                  <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center justify-between text-xs font-black text-indigo-900 dark:text-indigo-300">
                      <span>Assignment Questions ({selectedHomework.questions.length})</span>
                      <span>Total: {selectedHomework.totalMarks || (selectedHomework.questions.length * 2)} Marks</span>
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {selectedHomework.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs space-y-1.5 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              Q{qIdx + 1}. {q.question || q.questionText}
                            </span>
                            <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                              {q.marks || 2} Marks
                            </span>
                          </div>
                          {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If viewing existing submission */}
                {(selectedHomework as any).submissionDoc ? (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Your Submitted Work:</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {(selectedHomework as any).submissionDoc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {(selectedHomework as any).submissionDoc.answersText}
                    </p>

                    {(selectedHomework as any).submissionDoc.marks !== undefined && (
                      <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                          <span>Evaluation: {(selectedHomework as any).submissionDoc.marks} / {(selectedHomework as any).submissionDoc.maxMarks || 20} Marks</span>
                        </div>
                        {(selectedHomework as any).submissionDoc.remarks && (
                          <p className="text-emerald-700 dark:text-emerald-400 mt-1 italic">
                            "{(selectedHomework as any).submissionDoc.remarks}"
                          </p>
                        )}
                      </div>
                    )}

                    {(selectedHomework as any).submissionDoc.attachedPdfUrl && (
                      <div className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        <a href={(selectedHomework as any).submissionDoc.attachedPdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          View Attached PDF Document
                        </a>
                      </div>
                    )}

                    {(selectedHomework as any).submissionDoc.attachedImages && (selectedHomework as any).submissionDoc.attachedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(selectedHomework as any).submissionDoc.attachedImages.map((img: string, idx: number) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt="scan" className="w-20 h-20 rounded-xl object-cover border border-slate-300 shadow-sm hover:scale-105 transition" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Submission Tools: Camera & Files */}
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={startLiveCamera}
                        className="p-3 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-center space-y-1 cursor-pointer transition hover:scale-[1.02]"
                      >
                        <Camera className="w-5 h-5 text-emerald-600 mx-auto" />
                        <div className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                          Live Camera
                        </div>
                        <div className="text-[9px] text-slate-400">Snap Photo</div>
                      </button>

                      <button 
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-3 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 text-center space-y-1 cursor-pointer transition hover:scale-[1.02]"
                      >
                        <ImageIcon className="w-5 h-5 text-blue-600 mx-auto" />
                        <div className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300">
                          Pick Photos
                        </div>
                        <div className="text-[9px] text-slate-400">Gallery/Files</div>
                      </button>

                      <button 
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="p-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 text-center space-y-1 cursor-pointer transition hover:scale-[1.02]"
                      >
                        <Upload className="w-5 h-5 text-indigo-600 mx-auto" />
                        <div className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                          Pick PDF
                        </div>
                        <div className="text-[9px] text-slate-400">PDF Doc</div>
                      </button>
                    </div>

                    {/* Previews of attached images */}
                    {attachedImages.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Attached Photos ({attachedImages.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {attachedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full shadow"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pdfFileName && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-xs">
                        <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold">
                          <Paperclip className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{pdfFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setPdfUrl(''); setPdfFileName(''); }}
                          className="text-rose-500 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Answers text input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Notebook Solution Notes / Text:
                      </label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Write down your final answers, steps, or explanation..."
                        rows={3}
                        className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSubmitTeacherHomework}
                        disabled={isSubmitting || (!submissionText.trim() && attachedImages.length === 0 && !pdfUrl)}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading to Teacher Portal...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Solution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real Homework Interactive Solving Modal */}
      {solvingRealHomework && (
        <StudentSolveHomeworkModal
          isOpen={!!solvingRealHomework}
          onClose={() => setSolvingRealHomework(null)}
          homework={solvingRealHomework}
          studentId={userId}
          studentName={studentName || 'Student'}
          studentClass={selectedClass}
          existingSubmission={realSubmissions.find(s => s.homeworkId === solvingRealHomework.id) || null}
        />
      )}
    </div>
  );
};
