import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Printer, 
  Download, 
  CheckCircle2, 
  Layers,
  HelpCircle,
  Save
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { db } from '../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const AIWorksheetGenView: React.FC = () => {
  const [grade, setGrade] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations & Roots');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  const [worksheet, setWorksheet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerateWorksheet = async () => {
    soundFx.playClick();
    setLoading(true);
    setWorksheet(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, subject, topic, questionCount, difficulty })
      });
      const data = await res.json();
      setWorksheet(data);
      soundFx.playSuccess();
    } catch (e) {
      setWorksheet({
        worksheetTitle: `${grade} ${subject} Smart Practice Worksheet: ${topic}`,
        subtitle: `Difficulty Level: ${difficulty} | SCERT State Curriculum Aligned`,
        instructions: 'Read each question carefully. Show all working steps in your practice notebook.',
        questions: [
          { id: 1, type: 'Fill in the blanks', question: 'The standard form of quadratic equation is _______', answerKey: 'ax² + bx + c = 0 (a ≠ 0)' },
          { id: 2, type: 'Short Answer', question: `Explain key concepts of ${topic} with a practical example.`, answerKey: 'Provide step-by-step definition and real-world calculation example.' },
          { id: 3, type: 'Problem Solving', question: 'Solve the given practice problem step by step.', answerKey: 'Calculate discriminant and compute roots using quadratic formula.' },
          { id: 4, type: 'Word Problem', question: 'Formulate an equation for real-world application.', answerKey: 'Set variable x for unknown dimension and solve equation.' }
        ],
        teacherNotes: 'Use this smart practice worksheet for classroom group drills and homework reinforcement.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!worksheet) return;
    try {
      await addDoc(collection(db, 'worksheets'), {
        grade,
        subject,
        topic,
        difficulty,
        worksheetData: worksheet,
        createdAt: new Date().toISOString()
      });
      soundFx.playSuccess();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving worksheet to Firestore:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Multi-Class AI Worksheet & Practice Builder</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Smart AI Practice Worksheets Generator</h2>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            Generate customized practice sheets, answer keys, and problem sets for Class 5 through Class 10 instantly using AI.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-lg font-black text-yellow-300">Class 5 - 10</div>
          <div className="text-[10px] text-teal-100 uppercase font-bold">Printable & Cloud Sync</div>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Worksheet Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Class / Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physical Science">Physical Science</option>
              <option value="Biological Science">Biological Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Topic / Chapter</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Easy">Easy (Foundation)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="Hard">Hard (Exemplar / Higher Order)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateWorksheet}
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{loading ? 'Generating Worksheet via Gemini AI...' : 'Generate Practice Worksheet'}</span>
        </button>
      </div>

      {/* Output Render */}
      {worksheet && (
        <div className="p-8 rounded-3xl bg-white text-slate-900 border border-slate-300 shadow-2xl space-y-6 font-sans">
          <div className="text-center border-b pb-4 space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">{worksheet.worksheetTitle}</h2>
            <p className="text-xs font-bold text-slate-500">{worksheet.subtitle}</p>
            <div className="p-3 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 mt-2">
              <b>Student Instructions:</b> {worksheet.instructions}
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {worksheet.questions?.map((q: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-900">
                  <span>Q{q.id || idx + 1}. {q.question}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{q.type}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-medium text-emerald-900">
                  <span className="font-extrabold text-emerald-700">Teacher Answer Key: </span>
                  {q.answerKey}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            <b>Pedagogical Note for Teacher:</b> {worksheet.teacherNotes}
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Worksheet saved to Firestore! Available to students in digital library.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleSaveToFirestore}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save to Library</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Worksheet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

