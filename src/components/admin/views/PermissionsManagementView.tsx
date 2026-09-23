import React, { useState } from 'react';
import { PermissionRole } from '../data/adminMockData';
import { soundFx } from '../../../lib/audio';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';

interface PermissionsManagementViewProps {
  permissions: PermissionRole[];
  setPermissions: React.Dispatch<React.SetStateAction<PermissionRole[]>>;
}

export const PermissionsManagementView: React.FC<PermissionsManagementViewProps> = ({
  permissions,
  setPermissions,
}) => {
  const togglePermission = (roleId: string, permKey: keyof PermissionRole['permissions']) => {
    soundFx.playClick();
    setPermissions((prev) =>
      prev.map((role) => {
        if (role.roleId === roleId) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permKey]: !role.permissions[permKey],
            },
          };
        }
        return role;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Enterprise Role-Based Access Control (RBAC)
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Security Permissions & Module Access Matrix
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure Granular Read/Write Privileges for Principals, Faculty, Office Staff and District Auditors
        </p>
      </div>

      {/* Permissions Matrix Cards */}
      <div className="space-y-6">
        {permissions.map((role) => (
          <div
            key={role.roleId}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  {role.roleId}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {role.roleName}
                </h3>
                <p className="text-xs text-slate-500">{role.description}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-200 dark:border-blue-800">
                {role.userCount} Assigned Users
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(role.permissions).map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePermission(role.roleId, key as keyof PermissionRole['permissions'])}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                      value
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold truncate">{label}</span>
                    {value ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
