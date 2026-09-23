import React from 'react';
import { PlatformHealthService } from '../data/superAdminMockData';
import { soundFx } from '../../../lib/audio';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface PlatformHealthViewProps {
  services: PlatformHealthService[];
}

export const PlatformHealthView: React.FC<PlatformHealthViewProps> = ({ services }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Platform Health & Infrastructure Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Status, Cloud Run Containers, Firestore Latency & Edge API Health across 1,248 Schools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>99.98% SLA OPERATIONAL</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              alert('Triggered live telemetry ping to Cloud Run & Firestore shards.');
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            title="Refresh Health Diagnostics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  {service.category}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                  {service.name}
                </h3>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                ● {service.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Uptime</p>
                <p className="font-black text-emerald-600">{service.uptimePercent}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Latency</p>
                <p className="font-black text-slate-800 dark:text-slate-200">{service.latencyMs} ms</p>
              </div>
            </div>

            {/* Load Gauges */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>CPU LOAD</span>
                  <span>{service.cpuLoadPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${service.cpuLoadPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>MEMORY USAGE</span>
                  <span>{service.memoryUsagePercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${service.memoryUsagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
