'use client';

import { useState, useEffect } from 'react';
import { Server, Plus, Trash2, Save, RotateCcw, Loader2, ChevronLeft, Info, AlertCircle, ArrowUp, ArrowDown, Edit, X } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface VendorMapping {
  id: string; name: string; manufacturerPattern: string; modelPattern: string;
  wlanIndexes: number[]; wlanBandMapping: Record<string, string>;
  readPaths?: { wifiPassword?: string[] }; writePaths?: { ssid?: string[]; password?: string[]; enable?: string[] };
}

export default function VendorsPage() {
  const [mappings, setMappings] = useState<VendorMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingRule, setEditingRule] = useState<VendorMapping | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [manufacturerPattern, setManufacturerPattern] = useState('');
  const [modelPattern, setModelPattern] = useState('*');
  const [wlanIndexesInput, setWlanIndexesInput] = useState('');
  const [bandMappings, setBandMappings] = useState<Record<string,string>>({});
  const [readWifiPasswordInput, setReadWifiPasswordInput] = useState('');
  const [writeSsidInput, setWriteSsidInput] = useState('');
  const [writePasswordInput, setWritePasswordInput] = useState('');
  const [writeEnableInput, setWriteEnableInput] = useState('');

  useEffect(() => { fetchMappings(); }, []);

  const fetchMappings = async () => {
    try { setLoading(true);
      const res = await fetch('/api/settings/genieacs/vendors');
      const d = await res.json();
      if (d.success) setMappings(d.mappings); else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (rule: VendorMapping | null = null) => {
    if (rule) {
      setEditingRule(rule); setRuleName(rule.name); setManufacturerPattern(rule.manufacturerPattern);
      setModelPattern(rule.modelPattern); setWlanIndexesInput(rule.wlanIndexes.join(', '));
      setBandMappings(rule.wlanBandMapping);
      setReadWifiPasswordInput(rule.readPaths?.wifiPassword?.join('\n')||'');
      setWriteSsidInput(rule.writePaths?.ssid?.join('\n')||'');
      setWritePasswordInput(rule.writePaths?.password?.join('\n')||'');
      setWriteEnableInput(rule.writePaths?.enable?.join('\n')||'');
    } else {
      setEditingRule(null); setRuleName(''); setManufacturerPattern(''); setModelPattern('*');
      setWlanIndexesInput('1, 5'); setBandMappings({'1':'2.4GHz','5':'5GHz'});
      setReadWifiPasswordInput('InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.PreSharedKey.1.KeyPassphrase');
      setWriteSsidInput('InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.SSID');
      setWritePasswordInput('InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.KeyPassphrase');
      setWriteEnableInput('InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.Enable');
    }
    setIsOpenModal(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName||!manufacturerPattern) { Swal.fire({ icon:'warning', title:'Perhatian', text:'Nama dan Manufacturer harus diisi' }); return; }
    const indexes = wlanIndexesInput.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (indexes.length===0) { Swal.fire({ icon:'warning', title:'Perhatian', text:'Min 1 indeks WLAN' }); return; }
    const clean = (s:string) => s.split('\\n').map(x=>x.trim()).filter(x=>x.length>0);
    const newRule: VendorMapping = {
      id: editingRule ? editingRule.id : 'rule_'+Math.random().toString(36).substr(2,9),
      name: ruleName, manufacturerPattern, modelPattern: modelPattern||'*',
      wlanIndexes: indexes, wlanBandMapping: bandMappings,
      readPaths: { wifiPassword: clean(readWifiPasswordInput) },
      writePaths: { ssid: clean(writeSsidInput), password: clean(writePasswordInput), enable: clean(writeEnableInput) },
    };
    setMappings(prev => {
      if (editingRule) return prev.map(r => r.id===editingRule.id ? newRule : r);
      const fbIdx = prev.findIndex(r => r.id==='default-fallback');
      if (fbIdx>=0) { const list=[...prev]; list.splice(fbIdx,0,newRule); return list; }
      return [...prev, newRule];
    });
    setIsOpenModal(false);
  };

  const deleteRule = (id: string) => {
    if (id==='default-fallback') { Swal.fire({ icon:'error', title:'Error', text:'Fallback tidak bisa dihapus' }); return; }
    Swal.fire({ title:'Hapus Rule?', icon:'warning', showCancelButton:true, confirmButtonText:'Ya', confirmButtonColor:'#d33' }).then(r => { if (r.isConfirmed) setMappings(p=>p.filter(x=>x.id!==id)); });
  };

  const moveUp = (idx: number) => {
    if (idx===0) return;
    setMappings(p=>{const n=[...p];const t=n[idx];n[idx]=n[idx-1];n[idx-1]=t;return n;});
  };
  const moveDown = (idx: number) => {
    if (idx>=mappings.length-2) return;
    setMappings(p=>{const n=[...p];const t=n[idx];n[idx]=n[idx+1];n[idx+1]=t;return n;});
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try { const res = await fetch('/api/settings/genieacs/vendors', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mappings}) });
      const d = await res.json();
      if (d.success) Swal.fire({ icon:'success', title:'Berhasil', timer:2000, showConfirmButton:false }); else throw new Error(d.error);
    } catch (err: any) { Swal.fire({ icon:'error', title:'Error', text:err.message }); }
    finally { setSaving(false); }
  };

  const handleRestoreDefaults = async () => {
    const r = await Swal.fire({ title:'Reset Default?', icon:'warning', showCancelButton:true, confirmButtonText:'Ya', confirmButtonColor:'#d33' });
    if (!r.isConfirmed) return;
    setRestoring(true);
    try { const res = await fetch('/api/settings/genieacs/vendors', { method:'DELETE' }); const d = await res.json(); if (d.success) setMappings(d.mappings); } catch {}
    finally { setRestoring(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500"/></div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <Link href="/settings" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4"/></Link>
              <div><h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Vendor Mapping</h1><p className="text-xs text-zinc-500 mt-0.5">Mapping WLAN & write paths per vendor ONT</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRestoreDefaults} disabled={restoring||saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl cursor-pointer disabled:opacity-50"><RotateCcw className="w-3.5 h-3.5"/> Reset</button>
              <button onClick={handleSaveAll} disabled={saving||restoring} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50">{saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>} Simpan</button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex gap-3 text-xs">
          <Info className="w-5 h-5 text-orange-500 flex-shrink-0" /><div><p className="font-bold">Prioritas</p><p className="text-zinc-500 mt-0.5">Rule pertama yang cocok digunakan. Default Fallback selalu di bawah.</p></div>
        </div>

        <div className="flex justify-end">
          <button onClick={()=>handleOpenModal(null)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 rounded-xl cursor-pointer"><Plus className="w-4 h-4"/> Tambah Rule</button>
        </div>

        <div className="space-y-3">
          {mappings.map((rule, idx) => {
            const isFallback = rule.id==='default-fallback';
            return (
              <div key={rule.id} className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black">{rule.name}</h3>
                      {isFallback && <span className="text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">Global Fallback</span>}
                    </div>
                    <div className="text-xs text-zinc-500 font-semibold flex flex-wrap gap-4">
                      <span>Manufacturer: <strong className="text-orange-600 font-mono bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">{rule.manufacturerPattern}</strong></span>
                      <span>Model: <strong className="text-orange-600 font-mono bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">{rule.modelPattern}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {rule.wlanIndexes.map(i => <span key={i} className="text-[10px] font-bold bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 px-2.5 py-1 rounded-xl border border-zinc-200/60">Index {i} &rarr; {rule.wlanBandMapping[String(i)]||'2.4GHz'}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isFallback && <>
                      <button onClick={()=>moveUp(idx)} disabled={idx===0} className="p-1.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 rounded-xl hover:bg-zinc-100 cursor-pointer"><ArrowUp className="w-4 h-4"/></button>
                      <button onClick={()=>moveDown(idx)} disabled={idx>=mappings.length-2} className="p-1.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 rounded-xl hover:bg-zinc-100 cursor-pointer"><ArrowDown className="w-4 h-4"/></button>
                    </>}
                    <button onClick={()=>handleOpenModal(rule)} className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-500/10 cursor-pointer"><Edit className="w-4 h-4"/></button>
                    {!isFallback && <button onClick={()=>deleteRule(rule.id)} className="p-1.5 text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-500/10 cursor-pointer"><Trash2 className="w-4 h-4"/></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-[999]">
          <div className="flex items-center gap-2 text-xs text-zinc-500 border-r border-zinc-200 pr-4"><AlertCircle className="w-4 h-4 text-orange-500"/><span>Simpan semua perubahan</span></div>
          <button onClick={handleSaveAll} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-xs cursor-pointer disabled:opacity-50">
            {saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>} Simpan Semua
          </button>
        </div>

        {isOpenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200/50">
              <div className="p-4 border-b border-zinc-200/50 flex justify-between items-center">
                <h2 className="font-black text-sm uppercase tracking-widest">{editingRule?'Edit Rule':'Tambah Rule'}</h2>
                <button onClick={()=>setIsOpenModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Nama Rule</label>
                    <input type="text" value={ruleName} onChange={e=>setRuleName(e.target.value)} required
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-semibold" /></div>
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Manufacturer</label>
                    <input type="text" value={manufacturerPattern} onChange={e=>setManufacturerPattern(e.target.value)} required
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-mono" placeholder="TENDA, *ZTE*" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Model Pattern</label>
                    <input type="text" value={modelPattern} onChange={e=>setModelPattern(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-mono" placeholder="HG7, * (wildcard)" /></div>
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">WLAN Indexes</label>
                    <input type="text" value={wlanIndexesInput} onChange={e=>{setWlanIndexesInput(e.target.value);const n=e.target.value.split(',').map(s=>parseInt(s.trim())).filter(x=>!isNaN(x));setBandMappings(p=>{const o:Record<string,string>={};for(const i of n)o[String(i)]=p[String(i)]||(i===1?'2.4GHz':i===5?'5GHz':'2.4GHz');return o;});}}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 font-mono" placeholder="1, 5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(bandMappings).map(([idx,band]) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-zinc-500 text-[10px]">Index {idx}:</span>
                      <select value={band} onChange={e=>setBandMappings(p=>({...p,[idx]:e.target.value}))}
                        className="flex-1 px-2 py-1 text-[10px] border border-zinc-200 rounded-lg bg-white dark:bg-zinc-800">
                        <option value="2.4GHz">2.4GHz</option><option value="5GHz">5GHz</option></select>
                    </div>
                  ))}
                </div>
                <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Read WiFi Password (satu path per baris, gunakan {`{index}`})</label>
                  <textarea value={readWifiPasswordInput} onChange={e=>setReadWifiPasswordInput(e.target.value)} rows={2}
                    className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Write SSID</label>
                    <textarea value={writeSsidInput} onChange={e=>setWriteSsidInput(e.target.value)} rows={2}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500" /></div>
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Write Password</label>
                    <textarea value={writePasswordInput} onChange={e=>setWritePasswordInput(e.target.value)} rows={2}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500" /></div>
                  <div><label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Write Enable</label>
                    <textarea value={writeEnableInput} onChange={e=>setWriteEnableInput(e.target.value)} rows={2}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500" /></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={()=>setIsOpenModal(false)} className="px-4 py-2 text-xs font-medium text-zinc-600 border border-zinc-300 rounded-lg cursor-pointer">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg cursor-pointer">{editingRule?'Simpan Perubahan':'Tambah Rule'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
