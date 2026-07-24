'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Save, Loader2, ChevronLeft, Shield, ShieldOff, UserCog } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface User {
  id: number;
  username: string;
  display_name: string;
  role: string;
  isActive: number;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/auth/users').then(r => r.json()),
    ]).then(([meData, userData]) => {
      if (meData.authenticated) setMe(meData.user);
      if (userData.success) setUsers(userData.users);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const { value: form } = await Swal.fire({
      title: 'Buat User Baru',
      html: `
        <input id="swal-username" class="swal2-input" placeholder="Username" autocomplete="off">
        <input id="swal-display" class="swal2-input" placeholder="Nama tampilan">
        <input id="swal-password" class="swal2-input" type="password" placeholder="Password (min 6)">
        <select id="swal-role" class="swal2-input" style="height:auto;padding:8px 12px">
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>
      `,
      showCancelButton: true, confirmButtonText: 'Buat', confirmButtonColor: '#f97316',
      preConfirm: () => ({
        username: (document.getElementById('swal-username') as HTMLInputElement).value,
        displayName: (document.getElementById('swal-display') as HTMLInputElement).value,
        password: (document.getElementById('swal-password') as HTMLInputElement).value,
        role: (document.getElementById('swal-role') as HTMLSelectElement).value,
      }),
    });
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.success) { await loadUsers(); Swal.fire({ icon: 'success', title: 'Berhasil', timer: 2000, showConfirmButton: false }); }
      else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
    finally { setSaving(false); }
  };

  const handleEdit = async (user: User) => {
    const { value: form } = await Swal.fire({
      title: `Edit ${user.username}`,
      html: `
        <input id="swal-display" class="swal2-input" placeholder="Nama tampilan" value="${user.display_name || ''}">
        <input id="swal-password" class="swal2-input" type="password" placeholder="Password baru (kosongkan jika tidak ubah)">
        <select id="swal-role" class="swal2-input" style="height:auto;padding:8px 12px">
          <option value="operator" ${user.role === 'operator' ? 'selected' : ''}>Operator</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:13px">
          <input type="checkbox" id="swal-active" ${user.isActive ? 'checked' : ''}> Aktif
        </label>
      `,
      showCancelButton: true, confirmButtonText: 'Simpan', confirmButtonColor: '#f97316',
      preConfirm: () => ({
        displayName: (document.getElementById('swal-display') as HTMLInputElement).value,
        password: (document.getElementById('swal-password') as HTMLInputElement).value,
        role: (document.getElementById('swal-role') as HTMLSelectElement).value,
        isActive: (document.getElementById('swal-active') as HTMLInputElement).checked,
      }),
    });
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.success) { await loadUsers(); Swal.fire({ icon: 'success', title: 'Tersimpan', timer: 2000, showConfirmButton: false }); }
      else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (user: User) => {
    if (me?.id === user.id) { Swal.fire({ icon: 'warning', title: 'Tidak bisa hapus diri sendiri' }); return; }
    const r = await Swal.fire({ title: 'Hapus User?', text: `"${user.username}" akan dihapus permanen`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus', confirmButtonColor: '#d33' });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) { setUsers(users.filter(u => u.id !== user.id)); Swal.fire({ icon: 'success', title: 'Terhapus', timer: 2000, showConfirmButton: false }); }
      else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
  };

  const loadUsers = async () => {
    const res = await fetch('/api/auth/users');
    const d = await res.json();
    if (d.success) setUsers(d.users);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/settings" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10"><Users className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Manage Users</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Kelola akun pengguna dashboard</p>
            </div>
          </div>
        </div>

        <button onClick={handleCreate} disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
        >{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Tambah User</button>

        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-orange-500/10 rounded-2xl text-orange-500"><UserCog className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{u.display_name || u.username}</h3>
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-[9px] font-black uppercase"><Shield className="w-2.5 h-2.5" /> Admin</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-[9px] font-black uppercase"><ShieldOff className="w-2.5 h-2.5" /> Operator</span>
                      )}
                      {!u.isActive && <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Nonaktif</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">@{u.username}</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Dibuat {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(u)} className="p-2 text-zinc-400 hover:text-orange-600 rounded-xl hover:bg-orange-500/10 cursor-pointer" title="Edit"><Save className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u)} disabled={me?.id === u.id} className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 cursor-pointer disabled:opacity-30" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
