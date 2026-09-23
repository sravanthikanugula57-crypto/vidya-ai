import React, { useState } from 'react';
import {
  X,
  Save,
  Clock,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  BookOpen,
  Video,
  FileCode,
  FileSpreadsheet,
  Database,
  HelpCircle,
  Megaphone,
  Compass,
  Award,
  Globe,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CMSItem, CMSContentType, CMSApprovalStatus, CMS_TYPE_LABELS } from './cmsData';
import { soundFx } from '../../lib/audio';

interface CMSItemModalProps {
  item?: CMSItem | null;
  defaultType?: CMSContentType;
  userRole: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: CMSItem) => void;
}

export const CMSItemModal: React.FC<CMSItemModalProps> = ({
  item,
  defaultType = 'lesson',
  userRole,
  userName,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!item;

  const [type, setType] = useState<CMSContentType>(item?.type || defaultType);
  const [title, setTitle] = useState(item?.title || '');
  const [code, setCode] = useState(item?.code || `CMS-${type.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`);
  const [classLevel, setClassLevel] = useState(item?.classLevel || 'Class 10');
  const [subject, setSubject] = useState(item?.subject || 'Physical Science');
  const [chapter, setChapter] = useState(item?.chapter || '');
  const [medium, setMedium] = useState<'Telugu' | 'English' | 'Urdu' | 'All'>(item?.medium || 'Telugu');
  const [description, setDescription] = useState(item?.description || '');
  const [status, setStatus] = useState<CMSApprovalStatus>(item?.status || 'Draft');
  const [version, setVersion] = useState(item?.version || 'v1.0');

  // Schedule config
  const [publishDate, setPublishDate] = useState(item?.schedule?.publishDate || new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(item?.schedule?.expiryDate || '');
  const [targetDistrict, setTargetDistrict] = useState(item?.schedule?.targetDistrict || 'All AP Districts');
  const [targetAudience, setTargetAudience] = useState(item?.schedule?.targetAudience || 'Students & Teachers');

  // Meta fields
  const [url, setUrl] = useState(item?.meta?.url || '');
  const [fileSizeMb, setFileSizeMb] = useState<number | undefined>(item?.meta?.fileSizeMb || 5);
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(item?.meta?.durationMinutes || 30);
  const [questionsCount, setQuestionsCount] = useState<number | undefined>(item?.meta?.questionsCount || 10);
  const [maxMarks, setMaxMarks] = useState<number | undefined>(item?.meta?.maxMarks || 20);
  const [grantAmount, setGrantAmount] = useState(item?.meta?.grantAmount || '');
  const [eligibleCriteria, setEligibleCriteria] = useState(item?.meta?.eligibleCriteria || '');
  const [salaryPackage, setSalaryPackage] = useState(item?.meta?.salaryPackage || '');
  const [versionNote, setVersionNote] = useState('');

  const handleTypeChange = (newType: CMSContentType) => {
    setType(newType);
    if (!isEditing) {
      setCode(`CMS-${newType.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();

    const todayStr = new Date().toISOString().split('T')[0];

    const updatedVersion = isEditing && versionNote.trim()
      ? `v${(parseFloat(version.replace('v', '')) + 0.1).toFixed(1)}`
      : version;

    const existingVersionHistory = item?.versionHistory || [];
    const newVersionHistory = isEditing && versionNote.trim()
      ? [
          {
            version: updatedVersion,
            updatedAt: todayStr,
            author: userName,
            summary: versionNote,
            changesDiff: [`Updated ${type} content and parameters`, versionNote]
          },
          ...existingVersionHistory
        ]
      : existingVersionHistory.length > 0
      ? existingVersionHistory
      : [
          {
            version: updatedVersion,
            updatedAt: todayStr,
            author: userName,
            summary: 'Initial creation',
            changesDiff: ['Created item in CMS']
          }
        ];

    const newItem: CMSItem = {
      id: item?.id || `cms-${type}-${Date.now()}`,
      type,
      title,
      code,
      classLevel,
      subject,
      chapter: chapter || undefined,
      medium,
      description,
      status,
      version: updatedVersion,
      author: item?.author || { name: userName, role: userRole === 'admin' || userRole === 'super_admin' ? 'Educational Admin' : 'Senior Teacher' },
      approver: status === 'Approved' || status === 'Published'
        ? { name: userName, role: 'Approval Officer', timestamp: todayStr }
        : item?.approver,
      versionHistory: newVersionHistory,
      approvalHistory: item?.approvalHistory || [
        {
          status,
          timestamp: todayStr,
          actor: userName,
          comments: `Created with status ${status}`
        }
      ],
      schedule: {
        publishDate,
        expiryDate: expiryDate || undefined,
        targetDistrict,
        targetAudience
      },
      meta: {
        viewsCount: item?.meta?.viewsCount || 0,
        downloadsCount: item?.meta?.downloadsCount || 0,
        url: url || undefined,
        fileSizeMb: fileSizeMb || undefined,
        durationMinutes: durationMinutes || undefined,
        questionsCount: questionsCount || undefined,
        maxMarks: maxMarks || undefined,
        grantAmount: grantAmount || undefined,
        eligibleCriteria: eligibleCriteria || undefined,
        salaryPackage: salaryPackage || undefined
      },
      createdAt: item?.createdAt || todayStr,
      updatedAt: todayStr
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                {isEditing ? `Edit ${CMS_TYPE_LABELS[type].label.slice(0, -1)}` : 'Create New Education CMS Content'}
              </h2>
              <p className="text-xs text-slate-300">
                SCERT Compliant • Versioning, Approval & Target Audience Control
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector Bar */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max">
            {(Object.keys(CMS_TYPE_LABELS) as CMSContentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { soundFx.playClick(); handleTypeChange(t); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  type === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{CMS_TYPE_LABELS[t].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Content Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 4: Refraction of Light at Curved Surfaces"
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Code / Unique Reference
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-indigo-600 dark:text-indigo-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Class / Grade
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
              >
                <option value="All Classes">All Classes</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Category
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
              >
                <option value="General">General / All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Science">Physical Science</option>
                <option value="Biological Science">Biological Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Urdu">Urdu</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Scholarships">Scholarships</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Instruction Medium
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as any)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <option value="Telugu">Telugu Medium (తెలుగు మెడియం)</option>
                <option value="English">English Medium</option>
                <option value="Urdu">Urdu Medium (اردو ذریعہ)</option>
                <option value="All">All Mediums (Multilingual)</option>
              </select>
            </div>
          </div>

          {/* Chapter / Topic Sub-field */}
          {(type === 'lesson' || type === 'video' || type === 'pdf' || type === 'worksheet' || type === 'quiz' || type === 'chapter') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chapter / Unit Name
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Unit 3: Factorization & Real Numbers"
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
              />
            </div>
          )}

          {/* Description / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Overview Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide learning objectives, summary, or government circular notes..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
            />
          </div>

          {/* Dynamic Type Specific Metadata Fields */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{CMS_TYPE_LABELS[type].label} Specific Parameters</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(type === 'video' || type === 'pdf' || type === 'worksheet' || type === 'announcement') && (
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resource URL / File Storage Link
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://scert.telangana.gov.in/resource.pdf"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              )}

              {(type === 'video' || type === 'pdf') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={fileSizeMb || ''}
                    onChange={(e) => setFileSizeMb(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              )}

              {(type === 'video' || type === 'lesson' || type === 'quiz') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes || ''}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              )}

              {(type === 'worksheet' || type === 'question_bank' || type === 'quiz') && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Total Questions
                    </label>
                    <input
                      type="number"
                      value={questionsCount || ''}
                      onChange={(e) => setQuestionsCount(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Marks / Points
                    </label>
                    <input
                      type="number"
                      value={maxMarks || ''}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>
                </>
              )}

              {type === 'scholarship' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Grant Amount (₹ / year)
                    </label>
                    <input
                      type="text"
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(e.target.value)}
                      placeholder="e.g. ₹12,000 / year"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Eligibility Criteria
                    </label>
                    <input
                      type="text"
                      value={eligibleCriteria}
                      onChange={(e) => setEligibleCriteria(e.target.value)}
                      placeholder="e.g. Class 8 Govt School Students with parental income < ₹3.5L"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>
                </>
              )}

              {type === 'career' && (
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Career Salary & Career Growth Package
                  </label>
                  <input
                    type="text"
                    value={salaryPackage}
                    onChange={(e) => setSalaryPackage(e.target.value)}
                    placeholder="e.g. ₹3.5L - ₹8.0L / annum starting packages"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Workflow & Scheduling Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Publishing & Approval Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Workflow Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CMSApprovalStatus)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-indigo-600 dark:text-indigo-400"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Publishing Date
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expiry / Unpublish Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target District
                </label>
                <input
                  type="text"
                  value={targetDistrict}
                  onChange={(e) => setTargetDistrict(e.target.value)}
                  placeholder="e.g., Sangareddy, Medak, All"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Version Note */}
            {isEditing && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Version Change Note (Increments Version e.g. {version} → v{(parseFloat(version.replace('v', '')) + 0.1).toFixed(1)})
                </label>
                <input
                  type="text"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="e.g., Updated diagram labels and SCERT 2026 guidelines"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Content Changes' : 'Create & Register in CMS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
