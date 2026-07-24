'use client';

import { useState, useEffect } from 'react';
import { Server, Loader2, Zap, Save, CheckCircle, Info, ChevronLeft, Settings2, Key, Users } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ id: '', host: '', username: '', password: '', isActive: false, hasPassword: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/genieacs'),
      fetch('/api/settings/genieacs/devices?withTotal=true'),
    ]).then(async ([sr, dr]) => {
      if (sr.ok) { const d = await sr.json(); if (d?.settings) setSettings({id:d.settings.id??'',host:d.settings.host??'',username:d.settings.username??'',password:'',isActive:d.settings.isActive??false,hasPassword:d.settings.hasPassword??false}); }
      if (dr.ok) { const d = await dr.json(); setDeviceCount(d.total??0); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.host||!settings.username||(!settings.password&&!settings.hasPassword)) { Swal.fire({ icon:'warning', title:'Perhatian', text:'Host, username, password harus diisi'}); return; }
    setSaving(true);
    try {
      const payload: any = { host: settings.host, username: settings.username };
      if (settings.password) payload.password = settings.password;
      const res = await fetch('/api/settings/genieacs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (res.ok) { setSettings(p=>{return{...p,hasPassword:true,password:'',isActive:true}}); Swal.fire({ icon:'success', title:'Berhasil', timer:2000, showConfirmButton:false }); }
      else { const d = await res.json(); throw new Error(d.error||'Gagal'); }
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    if (!settings.host) { Swal.fire({ icon:'warning', title:'Perhatian', text:'Masukkan URL server'}); return; }
    setTesting(true);
    try {
      const res = await fetch('/api/settings/genieacs/test', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({host:settings.host,username:settings.username,password:settings.password}) });
      const d = await res.json();
      if (res.ok&&d.success) Swal.fire({ icon:'success', title:'Koneksi Berhasil', text:`${d.deviceCount||0} device terdaftar`, timer:3000, showConfirmButton:false });
      else throw new Error(d.error||'Koneksi gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Koneksi Gagal', text:err.message }); }
    finally { setTesting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10"><Server className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GenieACS Settings</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Konfigurasi koneksi GenieACS NBI API</p>
            </div>
            <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${settings.isActive?'bg-emerald-500/10 text-emerald-600 border-emerald-500/20':'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings.isActive?'bg-emerald-500 animate-pulse':'bg-rose-500'}`}></span>
              {settings.isActive?'Aktif':'Nonaktif'}
            </span>
          </div>
        </div>

        {settings.isActive && (
          <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-orange-500/10 rounded-2xl"><Server className="w-4 h-4 text-orange-500" /></div>
                <div><p className="text-sm font-black">{deviceCount} Device</p><p className="text-xs text-zinc-500">Terhubung ke GenieACS</p></div>
              </div>
              <Link href="/devices" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl transition-all cursor-pointer">Lihat Devices</Link>
            </div>
          </div>
        )}

        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-900/20">
            <h2 className="text-xs font-black uppercase tracking-widest">Konfigurasi Server</h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">Masukkan kredensial untuk GenieACS NBI API</p>
          </div>
          <form onSubmit={handleSaveSettings} className="p-5 space-y-5">
            {settings.hasPassword && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>Kredensial tersimpan. Kosongkan password jika tidak ingin mengubah.</p>
              </div>
            )}
            <div className="flex items-start gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs">
              <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div><p className="font-bold text-zinc-800 dark:text-zinc-200">GenieACS NBI API</p><p className="text-zinc-500 mt-0.5">URL server + port NBI (default 7557). Contoh: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded font-mono text-[10px]">http://192.168.1.1:7557</code></p></div>
            </div>
            <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">URL Server</label>
              <input type="text" value={settings.host} onChange={e=>setSettings({...settings,host:e.target.value})}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
                placeholder="http://genieacs.local:7557" required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Username</label>
                <input type="text" value={settings.username} onChange={e=>setSettings({...settings,username:e.target.value})}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
                  placeholder="admin" required /></div>
              <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Password {!settings.hasPassword&&'*'}</label>
                <input type="password" value={settings.password} onChange={e=>setSettings({...settings,password:e.target.value})}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
                  placeholder={settings.hasPassword?'(tidak berubah)':'......'} required={!settings.hasPassword} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleTestConnection} disabled={testing||!settings.host}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-xl text-zinc-700 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >{testing?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Zap className="w-3.5 h-3.5 text-orange-500"/>}Test Koneksi</button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-orange-500/10"
              >{saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>}Simpan</button>
            </div>
          </form>
        </div>

        {/* Links to Parameters & Vendors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/settings/parameters"
            className="group border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 hover:shadow-xl hover:border-orange-500/20 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl">
                <Settings2 className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-black">Parameter Mappings</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Konfigurasi path parameter TR-069 multi-vendor</p>
              </div>
            </div>
          </Link>
          <Link href="/settings/vendors"
            className="group border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 hover:shadow-xl hover:border-orange-500/20 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl">
                <Settings2 className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-black">Vendor Mapping</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Mapping WLAN index & write paths per vendor ONT</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Authentication & Users */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/settings/auth"
            className="group border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 hover:shadow-xl hover:border-orange-500/20 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl">
                <Key className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-black">API Keys</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">API Key management untuk integrasi 3rd party</p>
              </div>
            </div>
          </Link>
          <Link href="/settings/users"
            className="group border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 hover:shadow-xl hover:border-orange-500/20 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl">
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-black">User Management</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Kelola akun pengguna dashboard (admin & operator)</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
