import React from 'react';
import { Network, Plus, Lock, Loader2, Save, X } from 'lucide-react';

interface Props {
  show: boolean;
  editWanData: { deviceId: string; action: 'edit'|'add'; connectionType: string; name: string; username: string; password?: string; vlanId: string; bindingPorts: string[]; serviceList: string };
  setEditWanData: React.Dispatch<React.SetStateAction<any>>;
  savingWan: boolean; onClose: () => void; onSave: () => void;
}

export default function EditWanModal({ show, editWanData, setEditWanData, savingWan, onClose, onSave }: Props) {
  if (!show) return null;
  const isPPPoE = editWanData.connectionType === 'PPPoE';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className={`bg-gradient-to-r ${editWanData.action==='add'?'from-teal-600 to-cyan-600':'from-orange-600 to-red-600'} p-3 text-white flex items-center justify-between rounded-t-lg`}>
          <div className="flex items-center gap-2">{editWanData.action==='add'?<Plus className="w-4 h-4"/>:<Network className="w-4 h-4"/>}
            <h2 className="text-sm font-semibold">{editWanData.action==='add'?'Add WAN':'Edit WAN'}</h2></div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {editWanData.action === 'add' && (
            <>
              <div><label className="block text-[11px] font-medium mb-1">Connection Type</label>
                <select value={editWanData.connectionType} onChange={e=>setEditWanData({...editWanData,connectionType:e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800">
                  <option value="PPPoE">PPPoE (Routed)</option>
                  <option value="PPPoE_Bridged">PPPoE (Bridged)</option>
                  <option value="DHCP">DHCP / IPoE</option>
                  <option value="Bridge">Bridge</option>
                </select></div>
              <div><label className="block text-[11px] font-medium mb-1">Connection Name</label>
                <input type="text" value={editWanData.name} onChange={e=>setEditWanData({...editWanData,name:e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800" placeholder="INTERNET" /></div>
            </>
          )}
          <div><label className="block text-[11px] font-medium mb-1">Service List</label>
            <select value={editWanData.serviceList} onChange={e=>setEditWanData({...editWanData,serviceList:e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800">
              <option value="INTERNET">INTERNET</option><option value="Other">Other</option>
            </select></div>
          {isPPPoE && (
            <><div><label className="block text-[11px] font-medium mb-1">PPPoE Username</label>
              <input type="text" value={editWanData.username} onChange={e=>setEditWanData({...editWanData,username:e.target.value})}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800" placeholder="Username" /></div>
              <div><label className="block text-[11px] font-medium mb-1">PPPoE Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="password" value={editWanData.password||''} onChange={e=>setEditWanData({...editWanData,password:e.target.value})}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800" placeholder="Password" /></div></div></>
          )}
          <div><label className="block text-[11px] font-medium mb-1">VLAN ID</label>
            <input type="number" value={editWanData.vlanId} onChange={e=>setEditWanData({...editWanData,vlanId:e.target.value})} min={1} max={4094}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800" placeholder="100" /></div>
          <div><label className="block text-[11px] font-medium mb-1">Binding Ports (comma-separated paths)</label>
            <textarea value={(editWanData.bindingPorts||[]).join(',')} onChange={e=>{const a=e.target.value.split(',').map(s=>s.trim()).filter(Boolean);setEditWanData({...editWanData,bindingPorts:a})}}
              rows={2} className="w-full px-3 py-1.5 text-xs font-mono border border-zinc-300 rounded-lg bg-white dark:bg-zinc-800" placeholder="InternetGatewayDevice.LANDevice.1.LANEthernetInterfaceConfig.1" /></div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">Batal</button>
          <button onClick={onSave} disabled={savingWan} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
            {savingWan ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
