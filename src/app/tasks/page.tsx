'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Loader2, Server, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/genieacs/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GenieACS Tasks</h1>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Queue dan status task background</p>
              </div>
            </div>
            <button onClick={async()=>{setRefreshing(true);await fetchTasks();setRefreshing(false);}}
              className="p-2 bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-xl text-zinc-500 active:scale-95 transition-all cursor-pointer"
            >{refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-zinc-500 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border p-8">
            <Server className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700 border border-dashed rounded-xl p-2" />
            <p className="text-xs font-bold">No tasks found</p>
            <p className="text-[10px] mt-1 text-zinc-400">GenieACS queue is empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest border-b border-zinc-150 dark:border-zinc-850">
                <tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Created</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {tasks.map((t: any) => {
                  const status = String(t.status||'').toLowerCase();
                  let sStyle = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
                  if (status.includes('pend')||status.includes('que')) sStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                  else if (status.includes('run')||status.includes('activ')) sStyle = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                  else if (status.includes('complet')||status.includes('success')) sStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                  return (
                    <tr key={t._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="px-6 py-4 font-mono text-zinc-500">{t._id}</td>
                      <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200">{t.name||'-'}</td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${sStyle}`}>{t.status||'-'}</span></td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{t.timestamp||'-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
