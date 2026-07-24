'use client';

import { useState, useEffect } from 'react';
import { Server, Settings2, Activity, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/genieacs'),
      fetch('/api/settings/genieacs/devices?withTotal=true'),
    ]).then(async ([settingsRes, devicesRes]) => {
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setConfigured(!!s?.settings?.host);
      }
      if (devicesRes.ok) {
        const d = await devicesRes.json();
        if (d.statistics) setStats(d.statistics);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GenieACS Manager</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">TR-069 Device Management Interface</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {configured && (
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20"><Server className="w-4 h-4 text-orange-500" /></div>
                <div><p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total</p><p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{stats.total}</p></div>
              </div>
            </div>
            <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20"><Activity className="w-4 h-4 text-emerald-500" /></div>
                <div><p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Online</p><p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.online}</p></div>
              </div>
            </div>
            <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20"><Server className="w-4 h-4 text-rose-500" /></div>
                <div><p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Offline</p><p className="text-lg font-black text-rose-600 dark:text-rose-400">{stats.offline}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/devices', icon: Server, title: 'Devices', desc: 'Kelola perangkat TR-069, lihat detail, edit WiFi & WAN' },
            { href: '/tasks', icon: Activity, title: 'Tasks', desc: 'Queue dan status task background' },
            { href: '/settings', icon: Settings2, title: 'Settings & Mapping', desc: 'Konfigurasi NBI, parameter TR-069 & vendor mapping' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="group border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:border-orange-500/20 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl text-orange-500">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Not configured notice */}
        {!configured && (
          <div className="border border-orange-500/20 shadow-lg bg-orange-500/5 dark:bg-orange-500/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <Server className="w-12 h-12 mx-auto mb-3 text-orange-400" />
            <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-200">Belum Dikonfigurasi</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1 max-w-md mx-auto">Konfigurasi koneksi GenieACS NBI API terlebih dahulu</p>
            <Link href="/settings" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all">
              <ExternalLink className="w-4 h-4" /> Konfigurasi Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
