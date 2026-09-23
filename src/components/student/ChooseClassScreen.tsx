import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  School, 
  LogOut, 
  User, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { OfficialClassGrade, OFFICIAL_CLASSES } from '../../data/officialSyllabusData';
import { UserAuthProfile } from '../../types';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

interface ChooseClassScreenProps {
  currentUser: UserAuthProfile | null;
  onSelectClass: (grade: OfficialClassGrade) => void | Promise<void>;
  onLogout?: () => void;
  isModalVariant?: boolean;
  onCloseModal?: () => void;
}

interface ClassOptionMeta {
  grade: OfficialClassGrade;
  title: string;
  badge: string;
  stage: string;
  subjectsSummary: string;
  keyHighlight: string;
  color: string;
  accentBg: string;
  iconBg: string;
}

export const ChooseClassScreen: React.FC<ChooseClassScreenProps> = ({
  currentUser,
  onSelectClass,
  onLogout,
  isModalVariant = false,
  onCloseModal
}) => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<OfficialClassGrade | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CLASS_OPTIONS: ClassOptionMeta[] = [
    {
      grade: 'Class 5',
      title: `${t('class', 'Class')} 5`,
      badge: 'Primary Wing',
      stage: 'Foundational Stage',
      subjectsSummary: 'Telugu, English, Mathematics, Environmental Studies (EVS)',
      keyHighlight: 'Interactive visual stories, math foundations & discovery science',
      color: 'from-amber-500 to-orange-500',
      accentBg: 'hover:border-amber-400 dark:hover:border-amber-500/60',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
    },
    {
      grade: 'Class 6',
      title: `${t('class', 'Class')} 6`,
      badge: 'Middle School',
      stage: 'Upper Primary Stage',
      subjectsSummary: 'Telugu, Hindi, English, Mathematics, General Science, Social Studies',
      keyHighlight: 'SCERT 3-Language formula, geometry basics & introductory biology',
      color: 'from-blue-500 to-cyan-500',
      accentBg: 'hover:border-blue-400 dark:hover:border-blue-500/60',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
    },
    {
      grade: 'Class 7',
      title: `${t('class', 'Class')} 7`,
      badge: 'Middle School',
      stage: 'Upper Primary Stage',
      subjectsSummary: 'Telugu, Hindi, English, Mathematics, Science, Social Studies',
      keyHighlight: 'Algebra concepts, physical sciences, world geography & state history',
      color: 'from-emerald-500 to-teal-500',
      accentBg: 'hover:border-emerald-400 dark:hover:border-emerald-500/60',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
    },
    {
      grade: 'Class 8',
      title: `${t('class', 'Class')} 8`,
      badge: 'High School Prep',
      stage: 'Secondary Foundation',
      subjectsSummary: 'Telugu, Hindi, English, Mathematics, Physical Science, Biological Science, Social',
      keyHighlight: 'NMMS Scholarship syllabus, advanced geometry & chemical reactions',
      color: 'from-indigo-500 to-purple-500',
      accentBg: 'hover:border-indigo-400 dark:hover:border-indigo-500/60',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
    },
    {
      grade: 'Class 9',
      title: `${t('class', 'Class')} 9`,
      badge: 'Secondary School',
      stage: 'Pre-Board Stage',
      subjectsSummary: 'Telugu, Hindi, English, Mathematics, Physical Science, Biology, Social Studies',
      keyHighlight: 'Board exam conceptual prep, Olympiad practice & analytical laboratory notes',
      color: 'from-purple-500 to-pink-500',
      accentBg: 'hover:border-purple-400 dark:hover:border-purple-500/60',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
    },
    {
      grade: 'Class 10',
      title: `${t('class', 'Class')} 10`,
      badge: 'SSC Board Special',
      stage: 'Board Examination Stage',
      subjectsSummary: 'AP/TS SCERT Complete 6-Subject Board Exam Curriculum',
      keyHighlight: '10/10 GPA blueprint, 10-year previous papers, daily mock tests & AI doubt solver',
      color: 'from-rose-500 to-orange-500',
      accentBg: 'hover:border-rose-400 dark:hover:border-rose-500/60',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
    }
  ];

  const handleCardClick = (grade: OfficialClassGrade) => {
    soundFx.playClick();
    setSelectedClass(grade);
    setValidationError(null);
  };

  const handleContinue = async () => {
    if (!selectedClass) {
      soundFx.playFlip();
      setValidationError(t('selectClass', 'Please select your class to continue.'));
      return;
    }

    soundFx.playSuccess();
    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.6 }
    });

    setIsSubmitting(true);
    try {
      await onSelectClass(selectedClass);
    } catch (err) {
      console.warn('Class selection callback error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentDisplayName = currentUser?.name || currentUser?.email?.split('@')[0] || t('student', 'Student');

  const content = (
    <div className={isModalVariant ? 'w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[90vh] overflow-y-auto' : 'min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100'}>
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Vidya AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                SCERT Aligned
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Andhra Pradesh & Telangana State Board Platform
            </p>
          </div>
        </div>

        {/* User Badge / Logout */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <div className="w-6 h-6 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">
                {studentDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[130px]">{studentDisplayName}</span>
            </div>
          )}

          {isModalVariant && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
          )}

          {onLogout && !isModalVariant && (
            <button
              onClick={() => {
                soundFx.playClick();
                onLogout();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition text-xs font-bold cursor-pointer"
              title="Sign out or switch account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('logout', 'Sign Out')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center py-4 sm:py-6">
        
        {/* Onboarding Heading Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>AP & TS SCERT Curriculum</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('selectClass', 'Select Your Class')}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            {t('selectClassPrompt', 'Choose your class to continue')}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Choose which class you want to enter. Your dashboard, syllabus, mock tests, homework, and study materials will instantly adapt to your selected grade.
          </p>
        </div>

        {/* Validation Warning Notice */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className="max-w-md mx-auto mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center space-x-3 shadow-lg shadow-rose-500/10"
              role="alert"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold leading-tight">
                <p className="font-extrabold text-sm">{validationError}</p>
                <p className="text-[11px] opacity-90">Click one of the class cards below (Class 5 to Class 10) before continuing.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Selection Grid: 2 columns on mobile/tablet, 3 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {CLASS_OPTIONS.map((item) => {
            const isSelected = selectedClass === item.grade;

            return (
              <motion.button
                key={item.grade}
                type="button"
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleCardClick(item.grade)}
                className={`group relative text-left p-5 sm:p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/15 ring-4 ring-blue-500/20'
                    : `bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md ${item.accentBg}`
                }`}
              >
                {/* Top Badge & Selector Indicator */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>

                  {/* Radio / Check Circle */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-110'
                      : 'border-2 border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-blue-600" />}
                  </div>
                </div>

                {/* Class Title & Stage */}
                <div className="space-y-1 my-2">
                  <div className="flex items-baseline space-x-2">
                    <h3 className={`text-2xl font-black tracking-tight ${
                      isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      • {item.stage}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                    {item.subjectsSummary}
                  </p>
                </div>

                {/* Highlight Tag */}
                <div className={`mt-3 pt-3 border-t text-[11px] leading-snug flex items-center space-x-1.5 ${
                  isSelected 
                    ? 'border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 font-medium'
                    : 'border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="line-clamp-2">{item.keyHighlight}</span>
                </div>

                {/* Visual Active Accent Bar on Left/Bottom */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {selectedClass 
                ? `${t('selectedClass', 'Selected')}: ${selectedClass}`
                : t('selectClassPrompt', 'Please select your class to unlock your personalized classroom.')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2.5 transition-all shadow-xl cursor-pointer ${
              selectedClass
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-600/30'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <span>{isSubmitting ? 'Opening Dashboard...' : t('continue', 'Continue')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer */}
      {!isModalVariant && (
        <footer className="w-full max-w-5xl mx-auto text-center py-3 text-[11px] text-slate-400 dark:text-slate-600">
          Vidya AI Educational Operating System • All syllabus aligned to official State Board SCERT standards
        </footer>
      )}
    </div>
  );

  if (isModalVariant) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return content;
};
