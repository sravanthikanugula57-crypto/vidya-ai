import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Clock,
  Award,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Play,
  Loader2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { QuizDoc, QuizAttemptDoc } from '../../../types/quiz';
import {
  subscribeToClassQuizzes,
  subscribeToStudentQuizAttempts,
  parseClassNumber,
  seedAuthoritativeQuizzesIfEmpty
} from '../../../services/quizService';
import { MockTestPlayerModal } from './MockTestPlayerModal';
import { soundFx } from '../../../lib/audio';

interface MockTestListViewProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
  studentClassGrade?: string | null;
  onSelectClass?: () => void;
}

const AP_CORE_SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Physical Science',
  'Biological Science',
  'Social Studies'
];

export const MockTestListView: React.FC<MockTestListViewProps> = ({
  userId = 'std_24331A4202',
  userName = 'Adduri Surendra',
  userEmail = '24331A4202@mvgrce.edu.in',
  studentClassGrade,
  onSelectClass
}) => {
  const numericClass = parseClassNumber(studentClassGrade);

  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [quizzes, setQuizzes] = useState<QuizDoc[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<QuizAttemptDoc[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDoc | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize seed quizzes on mount
  useEffect(() => {
    seedAuthoritativeQuizzesIfEmpty().catch(console.warn);
  }, []);

  // Subscribe to published quizzes for this exact class
  useEffect(() => {
    if (!numericClass) {
      setQuizzes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubQuizzes = subscribeToClassQuizzes(
      numericClass,
      (data) => {
        setQuizzes(data);
        setIsLoading(false);
      },
      selectedSubject === 'All Subjects' ? undefined : selectedSubject
    );

    return () => unsubQuizzes();
  }, [numericClass, selectedSubject]);

  // Subscribe to student's previous attempts in real-time
  useEffect(() => {
    if (!userId) return;
    const unsubAttempts = subscribeToStudentQuizAttempts(userId, (attempts) => {
      setStudentAttempts(attempts);
    });
    return () => unsubAttempts();
  }, [userId]);

  // Map quizId -> highest score achieved
  const bestScoresMap = useMemo(() => {
    const map: Record<string, { score: number; totalMarks: number; percentage: number }> = {};
    studentAttempts.forEach((att) => {
      const existing = map[att.quizId];
      if (!existing || att.score > existing.score) {
        map[att.quizId] = {
          score: att.score,
          totalMarks: att.totalMarks,
          percentage: att.percentage
        };
      }
    });
    return map;
  }, [studentAttempts]);

  // Handle starting a test
  const handleStartQuiz = (quiz: QuizDoc) => {
    soundFx.playClick();
    setActiveQuiz(quiz);
    setIsPlayerOpen(true);
  };

  // 100-question grand mock test shortcut
  const grandMockQuiz = quizzes.find((q) => q.totalQuestions === 100) || null;

  // If no class is selected / found in student profile: show missing class prompt (Section 4 mandate)
  if (!numericClass) {
    return (
      <div className="p-10 max-w-lg mx-auto text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 my-8 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Please select your class to continue.
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Vidya AI provides authentic AP State Board mock examinations calibrated to your exact enrolled grade.
          Please select your class to load official board papers.
        </p>
        {onSelectClass && (
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectClass();
            }}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
          >
            Select Your Class
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              AP SSC State Board Examination Simulator
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-black">
              100 Questions Grand Mock Test
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            Class {numericClass} Official Board Examination Mock Series
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Authentic SCERT AP State Board questions across Mathematics, Physical Science, Biological Science, and Social Studies. Includes timed exam simulation, full question palette navigation, real-time scoring, and step-by-step model explanations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {grandMockQuiz && (
              <button
                onClick={() => handleStartQuiz(grandMockQuiz)}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-2xl shadow-slate-950/20"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Take 100-Q Grand Mock Test</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stat Pill */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
          <div className="text-3xl font-black text-yellow-300">{quizzes.length}</div>
          <div className="text-[10px] uppercase font-extrabold text-rose-100">Published Board Tests</div>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AP_CORE_SUBJECTS.map((subject) => {
          const isSelected = selectedSubject === subject;
          const matchCount = subject === 'All Subjects' 
            ? quizzes.length 
            : quizzes.filter(q => q.subject === subject || q.subject === 'All Subjects').length;

          return (
            <button
              key={subject}
              onClick={() => {
                soundFx.playClick();
                setSelectedSubject(subject);
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition shrink-0 cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{subject}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {matchCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Published Mock Tests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-600" />
            <span>Class {numericClass} Published Mock Examinations</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Strict Class {numericClass} AP SSC Curriculum
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <span className="text-xs font-bold">Loading published mock tests from Firestore...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No mock tests published yet for Class {numericClass}.
            </p>
            <p className="text-xs text-slate-400">
              Teachers and MDM supervisors can create and publish tests from the Faculty CMS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map((quiz) => {
              const bestScoreInfo = bestScoresMap[quiz.quizId];
              const isAttempted = Boolean(bestScoreInfo);

              return (
                <div
                  key={quiz.quizId}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:border-rose-400 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-black">
                        {quiz.totalQuestions === 100 ? '100-Question Grand Mock' : `${quiz.totalQuestions} Questions`}
                      </span>

                      {isAttempted ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Best: {bestScoreInfo.score}/{bestScoreInfo.totalMarks} ({bestScoreInfo.percentage}%)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                          Unattempted
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {quiz.board} • {quiz.subject}
                      </p>
                    </div>

                    {/* Question breakdown pill */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-extrabold">
                        <span>Total Questions:</span>
                        <span>{quiz.totalQuestions} Questions</span>
                      </div>
                      <div className="text-slate-500 leading-relaxed">
                        {quiz.totalQuestions === 100
                          ? '25 Maths • 25 Physics • 25 Biology • 25 Social'
                          : `${quiz.subject} Chapter & Comprehensive Review`}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span>{quiz.durationMinutes} Minutes</span>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-md shadow-rose-600/20"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isAttempted ? 'Retake Test' : 'Start Mock Test'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mock Test Interactive Runner Modal */}
      {activeQuiz && (
        <MockTestPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          quiz={activeQuiz}
          student={{
            id: userId,
            name: userName,
            email: userEmail,
            class: numericClass,
            board: 'AP SSC'
          }}
        />
      )}
    </div>
  );
};
