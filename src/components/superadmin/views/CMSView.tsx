import React, { useState } from 'react';
import { CMSContentItem } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  X,
  Globe,
  BookOpen
} from 'lucide-react';

interface CMSViewProps {
  cmsItems: CMSContentItem[];
  setCmsItems: React.Dispatch<React.SetStateAction<CMSContentItem[]>>;
}

export const CMSView: React.FC<CMSViewProps> = ({ cmsItems, setCmsItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CMSContentItem['category']>('Curriculum Update');
  const [author, setAuthor] = useState('SCERT Andhra Pradesh');

  const filtered = cmsItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    soundFx.playSuccess();
    const newItem: CMSContentItem = {
      id: `cms-${Date.now()}`,
      title,
      category,
      targetGrades: ['Class 8', 'Class 9', 'Class 10'],
      languages: ['Telugu', 'English'],
      status: 'Published',
      author,
      publishDate: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      downloadsCount: 0,
    };

    setCmsItems([newItem, ...cmsItems]);
    setIsAddModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              State Educational CMS & Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            State Syllabus Curriculum Updates, AI Tutor Prompt Guidelines, Circulars & Model Test Papers.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Content / Circular</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
        <input
          type="text"
          placeholder="Search Educational Content Title or Category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                {item.category}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                ● {item.status}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h3>

            <div className="flex flex-wrap gap-1">
              {item.languages.map(lang => (
                <span key={lang} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  🌐 {lang}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Author: <strong>{item.author}</strong></span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.viewsCount.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {item.downloadsCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Publish Educational Content
              </h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Content Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Physical Science Midterm Prep AI Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CMSContentItem['category'])}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Curriculum Update">Curriculum Update</option>
                  <option value="Exam Notification">Exam Notification</option>
                  <option value="AI Prompt KB">AI Prompt KB</option>
                  <option value="Govt Circular">Govt Circular</option>
                  <option value="Teacher Guide">Teacher Guide</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 font-bold text-xs">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
                Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
