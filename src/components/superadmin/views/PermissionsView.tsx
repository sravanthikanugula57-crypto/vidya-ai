import React, { useState } from 'react';
import { SuperAdminPermission } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  ShieldAlert,
  Save,
  Check,
  X,
  Lock,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

interface PermissionsViewProps {
  permissions: SuperAdminPermission[];
  setPermissions: React.Dispatch<React.SetStateAction<SuperAdminPermission[]>>;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({ permissions, setPermissions }) => {
  const [saved, setSaved] = useState(false);

  const toggleCell = (index: number, key: keyof SuperAdminPermission) => {
    soundFx.playClick();
    setPermissions(prev =>
      prev.map((item, i) => {
        if (i === index && typeof item[key] === 'boolean') {
          return { ...item, [key]: !item[key] };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    soundFx.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              System Resource Access & Permissions Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fine-grained Resource CRUD, Approval Gates, CSV Export & Audit Enforcement Policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 shrink-0"
        >
          {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Permissions Updated!' : 'Save Matrix Rules'}</span>
        </button>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5">System Resource & Policy Scope</th>
              <th className="py-4 px-3 text-center">Read</th>
              <th className="py-4 px-3 text-center">Write</th>
              <th className="py-4 px-3 text-center">Delete</th>
              <th className="py-4 px-3 text-center">Approve</th>
              <th className="py-4 px-3 text-center">Export</th>
              <th className="py-4 px-3 text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {permissions.map((perm, idx) => (
              <tr key={perm.resource} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                <td className="py-4 px-5">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {perm.resource}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {perm.description}
                  </p>
                </td>

                {(['read', 'write', 'delete', 'approve', 'exportData', 'audit'] as const).map((capKey) => (
                  <td key={capKey} className="py-4 px-3 text-center">
                    <button
                      onClick={() => toggleCell(idx, capKey)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition ${
                        perm[capKey]
                          ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
