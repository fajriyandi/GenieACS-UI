'use client';

import { useState } from 'react';
import { Server, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (d.success) {
        Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
        setTimeout(() => router.push('/'), 500);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: d.error || 'Login gagal' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Koneksi error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex p-3 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10 mb-3">
              <Server className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GenieACS Manager</h1>
            <p className="text-xs text-zinc-500 font-medium mt-1">Masuk ke dashboard management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-semibold"
                placeholder="admin" autoFocus />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 pr-9 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-semibold"
                  placeholder="••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !username || !password}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/10 active:scale-[0.99] transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
