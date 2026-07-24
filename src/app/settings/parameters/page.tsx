'use client';

import { useState, useEffect } from 'react';
import { Settings2, Plus, Trash2, Save, RotateCcw, Loader2, ChevronLeft, Info, AlertCircle, GripVertical } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function ParametersPage() {
  const [mappings, setMappings] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => { fetchMappings(); }, []);

  const fetchMappings = async () => {
    try { setLoading(true);
      const res = await fetch('/api/settings/genieacs/parameters');
      const d = await res.json();
      if (d.success) setMappings(d.mappings); else throw new Error(d.error||'Gagal');
    } catch (err: any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setLoading(false); }
  };

  const handleAddPath = (key: string) => setMappings(p=>({...p,[key]:[...(p[key]||[]),'']}));
  const handleRemovePath = (key: string, index: number) => setMappings(p=>({...p,[key]:p[key].filter((_,i)=>i!==index)}));
  const handleUpdatePath = (key: string, index: number, value: string) => setMappings(p=>{const n=[...p[key]];n[index]=value;return{...p,[key]:n};});

  const handleAddNewParameter = async () => {
    const { value: name } = await Swal.fire({ title:'Parameter Baru', input:'text', inputLabel:'Nama parameter (camelCase)', inputPlaceholder:'clientRssi', showCancelButton:true,
      inputValidator: (v) => { if (!v) return 'Tidak boleh kosong'; if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return 'camelCase, huruf & angka'; if (mappings[v]) return 'Sudah ada'; }
    });
    if (name) { setMappings(p=>({...p,[name]:[]})); Swal.fire({ icon:'success', title:`Parameter "${name}" ditambahkan`, timer:2000, showConfirmButton:false }); }
  };

  const handleRemoveParameter = async (key: string) => {
    const r = await Swal.fire({ title:'Hapus?', text:`Hapus parameter "${key}"?`, icon:'warning', showCancelButton:true, confirmButtonText:'Ya', confirmButtonColor:'#d33' });
    if (r.isConfirmed) { setMappings(p=>{const n={...p};delete n[key];return n;}); Swal.fire({ icon:'success', title:'Terhapus', timer:2000, showConfirmButton:false }); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { const res = await fetch('/api/settings/genieacs/parameters', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mappings}) });
      const d = await res.json();
      if (d.success) Swal.fire({ icon:'success', title:'Berhasil', timer:2000, showConfirmButton:false }); else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setSaving(false); }
  };

  const handleRestoreDefaults = async () => {
    const r = await Swal.fire({ title:'Reset Default?', text:'Semua perubahan kustom akan dihapus', icon:'warning', showCancelButton:true, confirmButtonText:'Ya, Reset', confirmButtonColor:'#d33' });
    if (!r.isConfirmed) return;
    setRestoring(true);
    try { const res = await fetch('/api/settings/genieacs/parameters', { method:'DELETE' }); const d = await res.json(); if (d.success) setMappings(d.mappings); else throw new Error(d.error); }
    catch (err: any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setRestoring(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500"/></div>;

  const keys = Object.keys(mappings).sort();
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-28 relative">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-3.5 mb-4 relative z-10">
            <Link href="/settings" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Parameter Mappings</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Konfigurasi path parameter TR-069 untuk berbagai vendor ONT</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10">
            <button onClick={handleAddNewParameter} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" /> Parameter Baru</button>
            <button onClick={handleRestoreDefaults} disabled={restoring||saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl cursor-pointer disabled:opacity-50"><RotateCcw className="w-3.5 h-3.5" /> Reset Default</button>
            <button onClick={handleSave} disabled={saving||restoring} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50">{saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>} Simpan</button>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex gap-3 text-xs">
          <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div><p className="font-bold text-zinc-800 dark:text-zinc-200">Cara Kerja</p><p className="text-zinc-500 mt-0.5">Sistem coba path pertama, fallback ke path berikutnya jika kosong. Mendukung multi-vendor (Huawei, ZTE, Nokia, dll).</p></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {keys.map(key => (
            <div key={key} className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-900/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-2xl text-orange-500"><Settings2 className="w-4 h-4" /></div>
                    <div><h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 capitalize">{key.replace(/([A-Z])/g,' $1')}</h3><code className="text-[10px] text-orange-600 font-mono font-bold bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">{key}</code></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={()=>handleAddPath(key)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5"/> Tambah Path</button>
                    <button onClick={()=>handleRemoveParameter(key)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {mappings[key].length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-black">Tidak ada path</p>
                  </div>
                ) : mappings[key].map((path, idx) => (
                  <div key={idx} className="flex gap-2 group items-center">
                    <div className="text-zinc-400 group-hover:text-zinc-600 flex-shrink-0 cursor-grab"><GripVertical className="w-4 h-4"/></div>
                    <input type="text" value={path} onChange={e=>handleUpdatePath(key,idx,e.target.value)}
                      placeholder="InternetGatewayDevice.DeviceInfo.SerialNumber"
                      className="flex-1 min-w-0 px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-mono" />
                    <button onClick={()=>handleRemovePath(key,idx)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-[999]">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mr-2"><AlertCircle className="w-4 h-4 text-orange-500"/><span>Jangan lupa simpan</span></div>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-xs cursor-pointer disabled:opacity-50">
            {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>} Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
