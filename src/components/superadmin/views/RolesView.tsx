import React, { useState } from 'react';
import { SuperAdminRole } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  ShieldCheck,
  Plus,
  Users,
  Key,
  Layers,
  Lock,
  X,
  CheckCircle2
} from 'lucide-react';

interface RolesViewProps {
  roles: SuperAdminRole[];
  setRoles: React.Dispatch<React.SetStateAction<SuperAdminRole[]>>;
}

export const RolesView: React.FC<RolesViewProps> = ({ roles, setRoles }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [level, setLevel] = useState<SuperAdminRole['level']>('District');
  const [description, setDescription] = useState('');

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    soundFx.playSuccess();
    const newRole: SuperAdminRole = {
      id: `role-${Date.now()}`,
      name: roleName,
      level,
      description: description || 'Custom assigned system role.',
      usersCount: 1,
      permissionsCount: 12,
      isSystemRole: false,
    };

    setRoles([...roles, newRole]);
    setIsAddModalOpen(false);
    setRoleName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Global RBAC Role Hierarchy
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System Level Scopes, Delegation Policies & Role Authority Levels.
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
          <span>Create Custom Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                  Level: {role.level}
                </span>
                {role.isSystemRole && (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500" /> Protected Core
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {role.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Users Assigned</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{role.usersCount.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Permissions Granted</p>
                <p className="font-black text-amber-600">{role.permissionsCount} Rules</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRole}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Define Role
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Academic Inspector"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Level Scope</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SuperAdminRole['level'])}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Platform">Platform Level</option>
                  <option value="District">District Level</option>
                  <option value="School">School Level</option>
                  <option value="Moderation">Moderation Level</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and scope of this role..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Save Role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
