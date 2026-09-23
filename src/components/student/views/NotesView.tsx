import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Download, 
  Search, 
  Tag, 
  Trash2, 
  BookOpen, 
  Database,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { soundFx } from '../../../lib/audio';
import { recordRealStudentEvent } from '../../../services/studentActivityService';
import { subscribeToDigitalLibrary, FirestoreLibraryResource } from '../../../services/digitalLibraryService';

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  date: string;
  isAiGenerated?: boolean;
  isTeacherResource?: boolean;
  fileUrl?: string;
  studentUid?: string;
}

interface NotesViewProps {
  studentClassGrade?: string;
  studentUid?: string;
  studentName?: string;
}

export const NotesView: React.FC<NotesViewProps> = ({ 
  studentClassGrade = 'Class 10',
  studentUid = '',
  studentName = 'Student'
}) => {
  const [personalNotes, setPersonalNotes] = useState<NoteItem[]>([]);
  const [publishedNotes, setPublishedNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // 1. Subscribe to student's personal notes in Firestore collection `student_notes`
  useEffect(() => {
    if (!studentUid) {
      setPersonalNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notesRef = collection(db, 'student_notes');
    const q = query(notesRef, where('studentUid', '==', studentUid));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: NoteItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || 'Untitled Note',
          subject: data.subject || 'General',
          content: data.content || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          date: data.date ? new Date(data.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          isAiGenerated: !!data.isAiGenerated,
          isTeacherResource: false,
          studentUid: data.studentUid
        });
      });
      setPersonalNotes(items);
      setLoading(false);
    }, (err) => {
      console.warn('Personal notes subscription error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [studentUid]);

  // 2. Subscribe to teacher-published notes from unified `resources` collection
  useEffect(() => {
    const unsub = subscribeToDigitalLibrary(
      { classGrade: studentClassGrade, isStudent: true },
      (resources: FirestoreLibraryResource[]) => {
        // Filter notes, formula sheets, key summaries
        const noteResources = resources.filter(r => 
          (r.type as any) === 'Chapter Notes' || 
          r.type === 'Formula / Key Facts' ||
          r.type === 'Study Material' ||
          ((r.type as string) && (r.type as string).toLowerCase().includes('note'))
        );

        const mapped: NoteItem[] = noteResources.map(r => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          content: r.description || `Teacher published notes for ${r.chapter || r.subject}. Available for download or reading.`,
          tags: [r.type, r.chapter || 'Revision'].filter(Boolean),
          date: r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Official',
          isAiGenerated: false,
          isTeacherResource: true,
          fileUrl: r.fileUrl
        }));

        setPublishedNotes(mapped);
      }
    );

    return () => unsub();
  }, [studentClassGrade]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    soundFx.playSuccess();
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const tagList = newTags.split(',').map(t => t.trim()).filter(Boolean);

    const newNoteDoc = {
      id: noteId,
      studentUid: studentUid || 'anonymous',
      studentName: studentName || 'Student',
      class: studentClassGrade,
      title: newTitle.trim(),
      subject: newSubject,
      content: newContent.trim(),
      tags: tagList.length > 0 ? tagList : ['Personal Notes'],
      date: nowIso,
      createdAt: nowIso,
      isAiGenerated: false
    };

    try {
      await setDoc(doc(db, 'student_notes', noteId), newNoteDoc);
      
      // Log student activity
      if (studentUid) {
        await recordRealStudentEvent({
          studentUid,
          studentName,
          class: studentClassGrade,
          subject: newSubject,
          eventType: 'NOTES_OPENED',
          eventDetails: `Created personal note: "${newTitle.trim()}" in ${newSubject}`
        });
      }

      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating note in Firestore:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    soundFx.playPop();
    try {
      await deleteDoc(doc(db, 'student_notes', noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Combine both teacher published notes and student personal notes
  const allNotes = [...personalNotes, ...publishedNotes];

  const filteredNotes = allNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Digital Study Notes & Highlights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            {studentClassGrade} Chapter Notes & Revision Summaries
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
            Access teacher-published official notes from Firestore and create your own customized study sheets with instant cloud sync.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsCreating(true);
          }}
          className="px-5 py-3 bg-white text-emerald-800 font-extrabold text-xs rounded-2xl shadow-lg hover:bg-emerald-50 transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Personal Note</span>
        </button>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword, chapter, or formula..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {['All', 'Mathematics', 'Physical Science', 'Biological Science', 'Social Studies', 'English', 'Telugu'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSubjectFilter === sub
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Note Creation Form Modal */}
      {isCreating && (
        <form onSubmit={handleCreateNote} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create New Personal Note</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 text-xs hover:text-slate-600 cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note Title (e.g. Quadratic Equation Roots)"
              className="sm:col-span-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              required
            />
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physical Science">Physical Science</option>
              <option value="Biological Science">Biological Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your study notes, definitions, formulas or key concepts here..."
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none h-32"
            required
          />

          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma separated, e.g. Formulas, Exam Tips, Chapter 1)"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Save Note to Cloud
            </button>
          </div>
        </form>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading notes from Firestore...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              No Notes Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No notes match your search criteria. You can create a personal note or teachers can publish chapter notes via the Teacher CMS.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Create First Note
          </button>
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-emerald-500 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    {note.subject}
                  </span>
                  {note.isTeacherResource ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Teacher Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Personal Note
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{note.title}</h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {note.content}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-400">
                  <span>{note.date}</span>
                  <div className="flex items-center space-x-2">
                    {note.fileUrl && (
                      <a 
                        href={note.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-blue-500 transition p-1" 
                        title="Open Resource Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {!note.isTeacherResource && (
                      <button 
                        onClick={() => handleDeleteNote(note.id)} 
                        className="hover:text-rose-500 transition p-1 cursor-pointer" 
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real Firestore Collections: `resources` & `student_notes`</span>
        </span>
        <span>Active Student: {studentName} ({studentClassGrade})</span>
      </div>
    </div>
  );
};
