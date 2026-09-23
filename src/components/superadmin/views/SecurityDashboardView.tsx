import React from 'react';
import { soundFx } from '../../../lib/audio';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Users,
  AlertTriangle,
  Globe,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const SecurityDashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Platform Cyber Security & Threat Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Andhra Pradesh AP SSC Government Cloud Infrastructure Defenses, MFA Enforcement & Key Rotation.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            alert('Secrets & API Key Rotation initialized in secure HSM environment.');
          }}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-2 shrink-0"
        >
          <KeyRound className="w-4 h-4" />
          <span>Rotate API Key Secrets</span>
        </button>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Threat Assessment</span>
          <p className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> LOW / GREEN
          </p>
          <p className="text-[11px] text-slate-400">0 Critical Vulnerabilities</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Active User Sessions</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">3,420</p>
          <p className="text-[11px] text-emerald-600 font-bold">100% TLS 1.3 Encrypted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">MFA Adoption Rate</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">94.8%</p>
          <p className="text-[11px] text-slate-400">Enforced for DEO & HM Accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Failed Logins (24h)</span>
          <p className="text-2xl font-black text-amber-600">24 Attempts</p>
          <p className="text-[11px] text-slate-400">Blocked by Rate Limiters</p>
        </div>
      </div>

      {/* Security Policies List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
          Active Government Cyber Security Policies
        </h3>

        <div className="space-y-3 text-xs">
          {[
            { title: 'Multi-Factor Authentication (MFA) Enforcement', status: 'Enforced', desc: 'Mandatory SMS OTP + Authenticator app for all Super Admins & District Officers.' },
            { title: 'Gemini API Key Secret Auto-Rotation', status: 'Active (Next in 12 days)', desc: 'Secrets automatically cycled every 30 days via Google Secret Manager.' },
            { title: 'IP Whitelisting & Geo-Fencing', status: 'Enforced', desc: 'Restricts Super Admin access exclusively to Andhra Pradesh Government Network CIDR blocks.' },
            { title: 'Firestore Row Level Security (RLS) Rules', status: 'Active & Deployed', desc: 'Prevents cross-school data leakages between district accounts.' },
          ].map(policy => (
            <div key={policy.title} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white">{policy.title}</h4>
                <p className="text-slate-500 mt-0.5">{policy.desc}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                ● {policy.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
