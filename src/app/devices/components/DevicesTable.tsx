import React from 'react';
import { Search, RefreshCw, Server, Eye, RotateCcw, Power, Trash2 } from 'lucide-react';
import { GenieACSDevice } from '../types';

interface Props {
  devices: GenieACSDevice[]; loading: boolean; error: string | null; refreshing: boolean;
  search: string; setSearch: (s: string) => void; statusFilter: string; setStatusFilter: (s: string) => void;
  limit: number; page: number; totalPages: number;
  selectedDeviceIds: string[];
  handleToggleSelect: (id: string) => void; handleToggleSelectAll: () => void;
  handleBatchDelete: () => void; handleSearch: (e?: React.FormEvent) => void;
  handleRefresh: () => void; handleLimitChange: (l: number) => void;
  handlePrevPage: () => void; handleNextPage: () => void;
  handleViewDetail: (id: string) => void; handleRefreshParameters: (id: string, serial: string) => void;
  handleReboot: (id: string) => void; handleDelete: (id: string) => void;
}

export default function DevicesTable({
  devices, loading, error, refreshing, search, setSearch, statusFilter, setStatusFilter,
  limit, page, totalPages, selectedDeviceIds, handleToggleSelect,
  handleToggleSelectAll, handleBatchDelete, handleSearch, handleRefresh,
  handleLimitChange, handlePrevPage, handleNextPage, handleViewDetail,
  handleRefreshParameters, handleReboot, handleDelete
}: Props) {
  return (
    <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-850">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Cari serial, model, IP, PPPoE..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
            />
          </div>
          <button type="button" onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-650 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync
          </button>
          {selectedDeviceIds.length > 0 && (
            <button type="button" onClick={handleBatchDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
            ><Trash2 className="w-3.5 h-3.5" /> Hapus ({selectedDeviceIds.length})</button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all cursor-pointer"
            ><option value="">All</option><option value="Online">Online</option><option value="Offline">Offline</option></select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Rows:</span>
            <select value={limit} onChange={e => handleLimitChange(parseInt(e.target.value))}
              className="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all cursor-pointer"
            >{[25,50,100,200].map(n => <option key={n} value={n}>{n}</option>)}</select>
            <button type="button" disabled={page <= 1} onClick={handlePrevPage}
              className="px-3 py-1 bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-650 dark:text-zinc-350 disabled:opacity-30 rounded-xl cursor-pointer"
            >Prev</button>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Page {page}{totalPages ? ` / ${totalPages}` : ''}</span>
            <button type="button" disabled={totalPages ? page >= totalPages : devices.length < limit} onClick={handleNextPage}
              className="px-3 py-1 bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-650 dark:text-zinc-350 disabled:opacity-30 rounded-xl cursor-pointer"
            >Next</button>
          </div>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest border-b border-zinc-150 dark:border-zinc-850">
            <tr>
              <th className="py-3 px-3 text-center w-8">
                <input type="checkbox" checked={devices.length > 0 && selectedDeviceIds.length === devices.length}
                  onChange={handleToggleSelectAll}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 text-orange-500 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900" />
              </th>
              <th className="py-3 px-3">Serial Number</th>
              <th className="py-3 px-3">Model</th>
              <th className="py-3 px-3">PPPoE</th>
              <th className="py-3 px-3">SSID</th>
              <th className="py-3 px-3">RX Power</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {devices.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                {loading ? <div className="flex flex-col items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div><p className="text-xs font-bold">Memuat data...</p></div>
                  : error ? <div className="flex flex-col items-center"><p className="text-xs font-bold text-rose-600 mb-1">{error}</p><button onClick={handleRefresh} className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-full font-bold">Coba Lagi</button></div>
                  : <><Server className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-xs font-bold">Tidak ada device</p></>}
              </td></tr>
            ) : devices.map(device => (
              <tr key={device._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                <td className="py-3 px-3 text-center">
                  <input type="checkbox" checked={selectedDeviceIds.includes(device._id)}
                    onChange={() => handleToggleSelect(device._id)}
                    className="rounded-md border-zinc-200 dark:border-zinc-800 text-orange-500 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900" />
                </td>
                <td className="py-3 px-3">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{device.serialNumber || '-'}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{device.manufacturer || '-'}</p>
                </td>
                <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 font-semibold">{device.model || '-'}</td>
                <td className="py-3 px-3">
                  <p className="text-orange-600 dark:text-orange-400 font-bold">{device.pppoeUsername || '-'}</p>
                  {device.pppoeIP && device.pppoeIP !== '-' && <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{device.pppoeIP}</p>}
                </td>
                <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 font-bold">{device.ssid || '-'}</td>
                <td className="py-3 px-3">
                  {device.rxPower && device.rxPower !== '-' ? (
                    <span className={`font-bold ${parseFloat(device.rxPower) > -25 ? 'text-emerald-600 dark:text-emerald-400' : parseFloat(device.rxPower) > -28 ? 'text-amber-600 dark:text-amber-500' : 'text-rose-600 dark:text-rose-400'}`}>
                      {device.rxPower} dBm</span>
                  ) : '-'}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    device.status === 'Online' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {device.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex justify-center gap-0.5">
                    <button onClick={() => handleViewDetail(device._id)} title="Detail"
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg active:scale-95 transition-all cursor-pointer"
                    ><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleRefreshParameters(device._id, device.serialNumber)} title="Refresh"
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg active:scale-95 transition-all cursor-pointer"
                    ><RotateCcw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleReboot(device._id)} title="Reboot"
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg active:scale-95 transition-all cursor-pointer"
                    ><Power className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(device._id)} title="Hapus"
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg active:scale-95 transition-all cursor-pointer"
                    ><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
