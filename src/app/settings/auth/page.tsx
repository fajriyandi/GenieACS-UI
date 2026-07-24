'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Loader2, ChevronLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function AuthPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());

  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/auth/keys');
      const d = await res.json();
      if (d.success) setKeys(d.keys);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
    const { value: name } = await Swal.fire({
      title: 'Buat API Key Baru',
      input: 'text',
      inputLabel: 'Nama key (untuk identifikasi)',
      inputPlaceholder: 'Monitoring Bot',
      showCancelButton: true,
      inputValidator: v => !v ? 'Nama harus diisi' : null,
    });
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/settings/auth/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const d = await res.json();
      if (d.success) {
        showKeyAlert(d.key);
        await fetchKeys();
      } else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
    finally { setCreating(false); }
  };

  const showKeyAlert = (key: string) => {
    Swal.fire({
      icon: 'success', title: 'API Key Created',
      text: 'Copy this key now. You won\'t see it again.',
      input: 'text', inputValue: key,
      confirmButtonText: 'Copied!',
      didOpen: () => {
        const input = Swal.getInput();
        if (input) { input.select(); document.execCommand('copy'); }
      }
    });
  };

  const handleRevoke = async (id: string, name: string) => {
    const r = await Swal.fire({ title: 'Revoke Key?', text: `"${name}" akan dinonaktifkan`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Revoke', confirmButtonColor: '#d33' });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`/api/settings/auth/keys/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) { setKeys(keys.filter(k => k.id !== id)); Swal.fire({ icon: 'success', title: 'Revoked', timer: 2000, showConfirmButton: false }); }
      else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/settings" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10"><Key className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Authentication</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">API Key management untuk integrasi 3rd party</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex gap-3 text-xs">
          <Key className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-zinc-800 dark:text-zinc-200">API Key Authentication</p>
            <p className="text-zinc-500 mt-0.5">
              Setiap request API dari aplikasi eksternal harus menyertakan header <code className="bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded font-mono text-[10px]">Authorization: Bearer &lt;api_key&gt;</code>.
              Gunakan key berbeda untuk setiap integrasi agar mudah di-revoke.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={handleCreate} disabled={creating}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
          >{creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Buat API Key</button>
          <button onClick={fetchKeys} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 cursor-pointer" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {keys.length === 0 ? (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center">
            <Key className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
            <p className="text-sm font-bold text-zinc-400">Belum ada API Key</p>
            <p className="text-xs text-zinc-400 mt-1">Buat API key untuk integrasi dengan aplikasi 3rd party</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k.id} className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-orange-500/10 rounded-2xl text-orange-500"><Key className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{k.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span>Key: </span>
                        <code className="font-mono bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[200px]">
                          {showKeys.has(k.id) ? k.key : `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`}
                        </code>
                        <button onClick={() => setShowKeys(s => { const n = new Set(s); if (n.has(k.id)) n.delete(k.id); else n.add(k.id); return n; })} className="text-zinc-400 hover:text-zinc-600">
                          {showKeys.has(k.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(k.key); Swal.fire({ icon: 'success', text: 'Copied!', timer: 1500, showConfirmButton: false }); }} className="text-zinc-400 hover:text-zinc-600">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-400 mt-1">
                        Dibuat {new Date(k.createdAt).toLocaleDateString()}
                        {k.lastUsedAt ? ` • Terakhir dipakai ${new Date(k.lastUsedAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleRevoke(k.id, k.name)}
                    className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 cursor-pointer flex-shrink-0" title="Revoke">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
