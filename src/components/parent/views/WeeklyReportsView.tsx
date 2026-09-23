import React, { useState } from 'react';
import { LanguageCode } from '../../../types';
import { soundFx } from '../../../lib/audio';
import {
  FileText,
  Volume2,
  Download,
  Award,
  Sparkles,
  CheckCircle,
  Calendar,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';

interface WeeklyReportsViewProps {
  selectedLang: LanguageCode;
  selectedChildName: string;
}

const HISTORICAL_REPORTS = [
  { week: 'Week 4 (July 21 - July 27)', minutes: 240, attendance: 98, rank: '#4', status: 'Active' },
  { week: 'Week 3 (July 14 - July 20)', minutes: 190, attendance: 100, rank: '#5', status: 'Archived' },
  { week: 'Week 2 (July 07 - July 13)', minutes: 210, attendance: 96, rank: '#4', status: 'Archived' },
  { week: 'Week 1 (July 01 - July 06)', minutes: 180, attendance: 100, rank: '#6', status: 'Archived' },
];

export const WeeklyReportsView: React.FC<WeeklyReportsViewProps> = ({
  selectedLang,
  selectedChildName,
}) => {
  const [selectedReportWeek, setSelectedReportWeek] = useState('Week 4 (July 21 - July 27)');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const handlePlayAudio = () => {
    soundFx.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Weekly Progress Report for ${selectedChildName}: Outstanding performance in ${selectedReportWeek}. Total study time: 240 minutes on VidyaAI. School attendance: 98 percent. Strongest area: Biological Science and English. Headmaster Note: Excellent curiosity and daily socratic practice. Keep up the great work!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handlePrintCertificate = () => {
    soundFx.playSuccess();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            AI Weekly Performance Reports
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {selectedChildName}'s Progress Cards
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified by Headmaster Ramesh Sharma & District Educational Officer (DEO Medak)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayAudio}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span>{isPlayingAudio ? 'Speaking...' : 'Listen Voice Report'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSuccess();
              setShowCertificateModal(true);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Print Student Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Weekly Report Detail Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Selected Report Cycle
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {selectedReportWeek}
            </h3>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold self-start sm:self-auto">
            ✓ DEO Verified Report
          </span>
        </div>

        {/* 4 Summary Metric Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 uppercase">AI Study Time</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">240 Minutes</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 uppercase">School Attendance</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">98%</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 uppercase">District Rank</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">Rank #4</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Questions Asked</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">32 Socratic Doubts</div>
          </div>
        </div>

        {/* AI Analysis Commentary */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Socratic Pedagogy Feedback
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
            "{selectedChildName} has demonstrated phenomenal curiosity in Biological Sciences (Cell Organelles) and English letter writing this week. In Mathematics, she solved 15 quadratic equations step-by-step. With 10 minutes of daily polynomial revision at home, she is on track for a top 3 rank in Medak district!"
          </p>
        </div>
      </div>

      {/* Historical Reports Archive Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Weekly Reports Archive (July 2026)
        </h3>

        <div className="space-y-2">
          {HISTORICAL_REPORTS.map((rep, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFx.playClick();
                setSelectedReportWeek(rep.week);
              }}
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between gap-4 ${
                selectedReportWeek === rep.week
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-400 dark:border-purple-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">{rep.week}</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {rep.minutes} Mins • {rep.attendance}% Attendance • District Rank {rep.rank}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-4 border-yellow-500/80 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
            <div className="text-center space-y-2 border-b-2 border-yellow-500/30 pb-6">
              <div className="text-3xl">📜</div>
              <div className="text-xs font-black uppercase text-yellow-600 tracking-widest">
                Government of Andhra Pradesh • School Education Department (AP SSC)
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Certificate of Academic Excellence
              </h2>
              <p className="text-xs text-slate-500">
                DEO Medak District High School Honor Roll
              </p>
            </div>

            <div className="text-center space-y-3 py-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                This official certificate is proudly awarded to
              </p>
              <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400 underline decoration-yellow-400 decoration-2">
                {selectedChildName}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                For outstanding dedication, 98% attendance, and achieving District Rank #4 in ZPHS Medak Government High School on VidyaAI Education Platform.
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">Ramesh Sharma</div>
                <div className="text-[10px] text-slate-500">Headmaster, ZPHS Medak</div>
              </div>
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">DEO Medak</div>
                <div className="text-[10px] text-slate-500">District Educational Officer</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 print:hidden">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrintCertificate}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
