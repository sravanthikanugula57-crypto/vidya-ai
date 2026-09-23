import React, { useState, useMemo, useEffect } from 'react';
import {
  publishTeacherContent,
  subscribeToGenericCollection
} from '../../services/studentFirestoreService';
import {
  Search,
  Plus,
  Filter,
  Layers,
  BookOpen,
  FileText,
  Video,
  FileCode,
  FileSpreadsheet,
  Database,
  HelpCircle,
  Megaphone,
  Compass,
  Award,
  History,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  Eye,
  Edit,
  Trash2,
  Grid,
  List,
  SlidersHorizontal,
  CheckSquare,
  Square,
  School,
  Globe,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import {
  CMSItem,
  CMSContentType,
  CMSApprovalStatus,
  CMS_TYPE_LABELS,
  INITIAL_CMS_ITEMS,
  CMSVersionRecord
} from './cmsData';
import { CMSItemModal } from './CMSItemModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { ApprovalWorkflowModal } from './ApprovalWorkflowModal';
import { soundFx } from '../../lib/audio';

interface EducationCMSProps {
  userRole?: string;
  userName?: string;
}

export const EducationCMS: React.FC<EducationCMSProps> = ({
  userRole = 'admin',
  userName = 'Sravanthi Kanugula'
}) => {
  const [items, setItems] = useState<CMSItem[]>(INITIAL_CMS_ITEMS);

  useEffect(() => {
    const unsub = subscribeToGenericCollection<CMSItem>('cmsItems', (firestoreDocs) => {
      if (firestoreDocs && firestoreDocs.length > 0) {
        const combined = [...firestoreDocs];
        INITIAL_CMS_ITEMS.forEach((init) => {
          if (!combined.some((c) => c.id === init.id)) {
            combined.push(init);
          }
        });
        setItems(combined);
      }
    });
    return () => unsub();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CMSContentType | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<CMSApprovalStatus | 'all'>('all');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-selection state for bulk actions
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CMSItem | null>(null);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionItem, setVersionItem] = useState<CMSItem | null>(null);

  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowItem, setWorkflowItem] = useState<CMSItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      const query = (searchQuery || '').toLowerCase();
      const matchesQuery =
        !searchQuery ||
        (item.title || '').toLowerCase().includes(query) ||
        (item.code || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        (item.author?.name || '').toLowerCase().includes(query) ||
        (item.chapter && (item.chapter || '').toLowerCase().includes(query));

      // Type
      const matchesType = selectedType === 'all' || item.type === selectedType;

      // Class
      const matchesClass = selectedClass === 'all' || item.classLevel === selectedClass;

      // Subject
      const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;

      // Status
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      // Medium
      const matchesMedium =
        selectedMedium === 'all' || item.medium === 'All' || item.medium === selectedMedium;

      return matchesQuery && matchesType && matchesClass && matchesSubject && matchesStatus && matchesMedium;
    });
  }, [items, searchQuery, selectedType, selectedClass, selectedSubject, selectedStatus, selectedMedium]);

  // Analytics counts
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === 'Draft' || i.status === 'Pending Approval').length;
    const scheduled = items.filter((i) => i.status === 'Scheduled').length;
    const published = items.filter((i) => i.status === 'Published').length;

    let totalViews = 0;
    let totalDownloads = 0;
    items.forEach((i) => {
      totalViews += i.meta?.viewsCount || 0;
      totalDownloads += i.meta?.downloadsCount || 0;
    });

    return { total, pending, scheduled, published, totalViews, totalDownloads };
  }, [items]);

  // Handlers
  const handleSaveItem = async (newItem: CMSItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newItem;
        return updated;
      }
      return [newItem, ...prev];
    });

    // Save to Firestore
    try {
      await publishTeacherContent('cmsItems', newItem);

      // Mirror to corresponding specific collection for Student Dashboard
      if (newItem.type === 'video') {
        await publishTeacherContent('videos', {
          id: newItem.id,
          title: newItem.title,
          description: newItem.description,
          class: newItem.classLevel,
          board: 'Andhra Pradesh State Board (SCERT AP)',
          subject: newItem.subject,
          chapter: newItem.chapter || 'General',
          lesson: newItem.title,
          teacherName: newItem.author.name,
          teacher: newItem.author.name,
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
          videoUrl: newItem.meta?.url || '',
          youtubeId: '',
          duration: `${newItem.meta?.durationMinutes || 20} mins`,
          language: newItem.medium,
          createdAt: new Date().toISOString(),
          published: true
        });
      } else if (newItem.type === 'pdf') {
        await publishTeacherContent('notes', {
          id: newItem.id,
          title: newItem.title,
          description: newItem.description,
          type: 'PDF Notes',
          subject: newItem.subject,
          chapter: newItem.chapter || 'General',
          teacherName: newItem.author.name,
          teacher: newItem.author.name,
          fileSize: `${newItem.meta?.fileSizeMb || 2.5} MB`,
          downloadUrl: newItem.meta?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileUrl: newItem.meta?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          createdAt: new Date().toISOString(),
          published: true
        });
      } else if (newItem.type === 'worksheet') {
        await publishTeacherContent('worksheets', {
          id: newItem.id,
          title: newItem.title,
          description: newItem.description,
          type: 'Worksheets',
          subject: newItem.subject,
          chapter: newItem.chapter || 'General',
          teacherName: newItem.author.name,
          teacher: newItem.author.name,
          fileSize: `${newItem.meta?.fileSizeMb || 1.8} MB`,
          downloadUrl: newItem.meta?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          createdAt: new Date().toISOString(),
          published: true
        });
      } else if (newItem.type === 'announcement') {
        await publishTeacherContent('announcements', {
          id: newItem.id,
          teacherName: newItem.author.name,
          announcement: newItem.description || newItem.title,
          uploadDate: new Date().toLocaleDateString(),
          subject: newItem.subject,
          createdAt: new Date().toISOString(),
          published: true
        });
      }
    } catch (e) {
      console.warn('Error saving to Firestore:', e);
    }
  };


  const handleRevertVersion = (versionRecord: CMSVersionRecord) => {
    if (!versionItem) return;
    const updated: CMSItem = {
      ...versionItem,
      version: versionRecord.version,
      updatedAt: new Date().toISOString().split('T')[0],
      versionHistory: [
        {
          version: `v${(parseFloat(versionItem.version.replace('v', '')) + 0.1).toFixed(1)}`,
          updatedAt: new Date().toISOString().split('T')[0],
          author: userName,
          summary: `Reverted to ${versionRecord.version}`,
          changesDiff: [`Restored content state from version ${versionRecord.version}`]
        },
        ...versionItem.versionHistory
      ]
    };
    handleSaveItem(updated);
    setIsVersionModalOpen(false);
  };

  const handleStatusChange = (item: CMSItem, newStatus: CMSApprovalStatus, comments: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: CMSItem = {
      ...item,
      status: newStatus,
      updatedAt: todayStr,
      approver: { name: userName, role: 'Approval Officer', timestamp: todayStr },
      approvalHistory: [
        {
          status: newStatus,
          timestamp: todayStr,
          actor: userName,
          comments
        },
        ...(item.approvalHistory || [])
      ]
    };
    handleSaveItem(updated);
  };

  const handleDeleteItem = (id: string) => {
    soundFx.playClick();
    if (confirm('Are you sure you want to delete this resource from CMS?')) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedItemIds((prev) => prev.filter((iId) => iId !== id));
    }
  };

  const handleToggleSelect = (id: string) => {
    soundFx.playClick();
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((iId) => iId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    soundFx.playClick();
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    }
  };

  const handleBulkStatusChange = (newStatus: CMSApprovalStatus) => {
    if (selectedItemIds.length === 0) return;
    soundFx.playSuccess();
    const todayStr = new Date().toISOString().split('T')[0];
    setItems((prev) =>
      prev.map((i) => {
        if (selectedItemIds.includes(i.id)) {
          return {
            ...i,
            status: newStatus,
            updatedAt: todayStr,
            approver: { name: userName, role: 'Bulk Approval Officer', timestamp: todayStr },
            approvalHistory: [
              {
                status: newStatus,
                timestamp: todayStr,
                actor: userName,
                comments: `Bulk updated to ${newStatus}`
              },
              ...(i.approvalHistory || [])
            ]
          };
        }
        return i;
      })
    );
    setSelectedItemIds([]);
  };

  const renderIcon = (typeKey: CMSContentType) => {
    switch (typeKey) {
      case 'class': return <School className="w-4 h-4" />;
      case 'subject': return <BookOpen className="w-4 h-4" />;
      case 'chapter': return <Layers className="w-4 h-4" />;
      case 'lesson': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileCode className="w-4 h-4" />;
      case 'worksheet': return <FileSpreadsheet className="w-4 h-4" />;
      case 'question_bank': return <Database className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'career': return <Compass className="w-4 h-4" />;
      case 'scholarship': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClass = (status: CMSApprovalStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'Pending Approval':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'Archived':
        return 'bg-zinc-200 text-zinc-800 border-zinc-400 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner & Governance Overview */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-yellow-400 text-slate-950 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                SCERT Andhra Pradesh (AP SSC) Education Content Management System (CMS)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Education CMS Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Unified authoring, multi-level approval workflows, version control, scheduling, and distribution for 12 education content categories.
              </p>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Content Item</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-white">{stats.total}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Total Managed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-amber-300">{stats.pending}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Pending Approvals</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-purple-300">{stats.scheduled}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Scheduled Releases</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-emerald-400">{stats.published}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Live Published</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-sky-300">{(stats.totalViews / 1000).toFixed(1)}k</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Student Views</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-yellow-300">{(stats.totalDownloads / 1000).toFixed(1)}k</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Offline Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Type Filter Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => { soundFx.playClick(); setSelectedType('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Content (12 Types)</span>
          </button>

          {(Object.keys(CMS_TYPE_LABELS) as CMSContentType[]).map((t) => {
            const count = items.filter((i) => i.type === t).length;
            return (
              <button
                key={t}
                onClick={() => { soundFx.playClick(); setSelectedType(t); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {renderIcon(t)}
                <span>{CMS_TYPE_LABELS[t].label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, code, description, chapter, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
            >
              <option value="all">All Grades / Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="All Classes">All Classes</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physical Science">Physical Science</option>
              <option value="Biological Science">Biological Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Urdu">Urdu</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="Scholarships">Scholarships</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-indigo-600 dark:text-indigo-400"
            >
              <option value="all">All Workflow Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Action & View Mode Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
            >
              {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredItems.length})</span>
            </button>

            {selectedItemIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                  {selectedItemIds.length} Selected
                </span>

                <button
                  onClick={() => handleBulkStatusChange('Approved')}
                  className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Bulk Approve
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Published')}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Bulk Publish
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Archived')}
                  className="px-3 py-1 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
                >
                  Bulk Archive
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">
              Showing {filteredItems.length} of {items.length} CMS items
            </span>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => { soundFx.playClick(); setViewMode('grid'); }}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow' : 'text-slate-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => { soundFx.playClick(); setViewMode('table'); }}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow' : 'text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering (Grid View vs Table View) */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No CMS Content Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No matching resources match your search criteria. Try resetting filters or creating a new item.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const typeInfo = CMS_TYPE_LABELS[item.type];

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSelect(item.id)}
                        className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border flex items-center gap-1 ${typeInfo.color}`}>
                        {renderIcon(item.type)}
                        <span>{typeInfo.label.slice(0, -1)}</span>
                      </span>

                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {item.version}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono block">
                      {item.code} • {item.classLevel}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                    {item.description}
                  </p>

                  {/* Secondary Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Subject: {item.subject}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {item.medium} Medium
                    </span>
                    {item.chapter && (
                      <span className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                        {item.chapter}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Metadata & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>By: {item.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-sky-600">
                        <Eye className="w-3 h-3" />
                        {item.meta.viewsCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <Download className="w-3 h-3" />
                        {item.meta.downloadsCount}
                      </span>
                    </div>
                  </div>

                  {/* Action Button Strip */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setVersionItem(item);
                          setIsVersionModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Version History & Diff Log"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setWorkflowItem(item);
                          setIsWorkflowModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Approval Workflow"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Workflow</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setEditingItem(item);
                          setIsItemModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Mode */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Type & Code</th>
                  <th className="p-3.5">Title & Description</th>
                  <th className="p-3.5">Class / Subject</th>
                  <th className="p-3.5">Medium</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const typeInfo = CMS_TYPE_LABELS[item.type];

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <button onClick={() => handleToggleSelect(item.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border inline-flex items-center gap-1 ${typeInfo.color}`}>
                          {renderIcon(item.type)}
                          <span>{typeInfo.label.slice(0, -1)}</span>
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.code}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.description}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white block">{item.classLevel}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.subject}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-emerald-600">{item.medium}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono font-bold text-purple-600">
                        {item.version}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {item.author.name}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setVersionItem(item);
                              setIsVersionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-bold text-[10px] cursor-pointer"
                            title="Version History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setWorkflowItem(item);
                              setIsWorkflowModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-[10px] cursor-pointer"
                            title="Approval Workflow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Create/Edit Modal */}
      <CMSItemModal
        item={editingItem}
        userRole={userRole}
        userName={userName}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        item={versionItem}
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onRevertVersion={handleRevertVersion}
      />

      {/* Approval Workflow Modal */}
      <ApprovalWorkflowModal
        item={workflowItem}
        userName={userName}
        userRole={userRole}
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
