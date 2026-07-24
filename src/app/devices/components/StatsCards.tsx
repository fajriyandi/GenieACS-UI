import React from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';

interface StatsCardsProps {
  stats: { total: number; online: number; offline: number };
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function StatsCards({ stats, statusFilter, setStatusFilter }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {[
        { label: 'Total', value: stats.total, icon: Server, filter: '', color: 'orange' },
        { label: 'Online', value: stats.online, icon: Wifi, filter: 'Online', color: 'emerald' },
        { label: 'Offline', value: stats.offline, icon: WifiOff, filter: 'Offline', color: 'rose' },
      ].map(({ label, value, icon: Icon, filter, color }) => (
        <div key={filter || 'all'}
          onClick={() => setStatusFilter(filter)}
          className={`bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border p-3.5 cursor-pointer transition-all duration-300 active:scale-[0.99] hover:shadow-md ${
            statusFilter === filter ? `border-${color}-500/50 dark:border-${color}-500/50 ring-1 ring-${color}-500/20 shadow-md shadow-${color}-500/5`
              : 'border-zinc-200/50 dark:border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-${color}-500/10 dark:bg-${color}-500/20`}>
              <Icon className={`w-4 h-4 text-${color}-500`} />
            </div>
            <div>
              <p className={`text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest`}>{label}</p>
              <p className={`text-sm md:text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5`}>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
