import React from 'react';
import { 
  User, 
  Award, 
  BookOpen, 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const TeacherProfileView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>State Education Department Certified Faculty</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Faculty Profile & Accreditation</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Head Teacher & Senior Physical Science Master • ZPHS High School Sangareddy.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center">
          <div className="text-lg font-black text-yellow-300">14 Years Service</div>
          <div className="text-[10px] text-emerald-100 uppercase font-bold">Emp ID: TS-EDU-84920</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg">
            RS
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Mr. Ramesh Sharma</h3>
            <span className="text-xs text-emerald-600 font-bold">School Incharge & Senior Teacher</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 text-left font-medium">
            <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-emerald-600" /> ZPHS High School, Sangareddy</div>
            <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Physical Science & Mathematics</div>
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-600" /> ramesh.sharma@tsedu.gov.in</div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-600" /> +91 98480 11223</div>
          </div>
        </div>

        {/* Badges & Classes */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-600" /> State Recognitions & Teacher Awards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="font-extrabold text-xs text-amber-800 dark:text-amber-300">🏆 Best STEM Teacher Award 2025</div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Awarded by Andhra Pradesh State Education Dept (AP SSC) for zero-cost lab innovation.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">⭐ VidyaAI Master Innovator</div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Completed 120+ AI lesson plans & 100% parent broadcast adoption.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3">Assigned Academic Incharges</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                <span>Class 9A - Physical Science & Class Incharge</span>
                <span className="text-emerald-600">42 Students</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                <span>Class 9B - Physical Science</span>
                <span className="text-emerald-600">38 Students</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                <span>Class 10A - Mathematics</span>
                <span className="text-emerald-600">40 Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
