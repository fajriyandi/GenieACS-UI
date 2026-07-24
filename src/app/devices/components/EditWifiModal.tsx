import React from 'react';
import { Wifi, X, Lock, Loader2, Save } from 'lucide-react';
import { WLANConfig } from '../types';

interface Props {
  show: boolean; wlanConfigs?: WLANConfig[];
  editWifiData: { wlanIndex: number; ssid: string; securityMode: string; password?: string; enabled: boolean };
  setEditWifiData: React.Dispatch<React.SetStateAction<any>>;
  savingWifi: boolean; onClose: () => void; onSave: () => void;
}

export default function EditWifiModal({ show, wlanConfigs, editWifiData, setEditWifiData, savingWifi, onClose, onSave }: Props) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-3 text-white flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2"><Wifi className="w-4 h-4" /><h2 className="text-sm font-semibold">Edit WiFi</h2></div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">WLAN Index</label>
            <select value={editWifiData.wlanIndex} onChange={e => setEditWifiData({...editWifiData,wlanIndex:parseInt(e.target.value)})}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-teal-500">
              {(wlanConfigs || []).map(w => <option key={w.index} value={w.index}>WLAN {w.index} - {w.ssid} ({w.band})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">SSID <span className="text-red-500">*</span></label>
            <input type="text" value={editWifiData.ssid} onChange={e => setEditWifiData({...editWifiData,ssid:e.target.value})} maxLength={32}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-teal-500" placeholder="Nama WiFi" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">Security</label>
            <select value={editWifiData.securityMode} onChange={e => setEditWifiData({...editWifiData,securityMode:e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-teal-500">
              <option value="None">None (Open)</option><option value="WPA-PSK">WPA-PSK</option><option value="WPA2-PSK">WPA2-PSK</option><option value="WPA-WPA2-PSK">WPA/WPA2-PSK</option>
            </select>
          </div>
          {editWifiData.securityMode !== 'None' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" value={editWifiData.password||''} onChange={e => setEditWifiData({...editWifiData,password:e.target.value})} maxLength={63}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-teal-500" placeholder="Password WiFi" />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">8-63 karakter</p>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <div><p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">WiFi Status</p><p className="text-[10px] text-zinc-500">Aktifkan/nonaktifkan</p></div>
            <button type="button" onClick={() => setEditWifiData({...editWifiData,enabled:!editWifiData.enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editWifiData.enabled ? 'bg-teal-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editWifiData.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">Batal</button>
          <button onClick={onSave} disabled={savingWifi} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
            {savingWifi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
