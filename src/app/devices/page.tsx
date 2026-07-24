'use client';

import { useState, useEffect, useCallback } from 'react';
import { Server, Settings2, Loader2, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

import StatsCards from './components/StatsCards';
import DevicesTable from './components/DevicesTable';
import DeviceDetailModal from './components/DeviceDetailModal';
import EditWifiModal from './components/EditWifiModal';
import EditWanModal from './components/EditWanModal';
import { GenieACSDevice, DeviceDetail, WLANConfig } from './types';

export default function GenieACSDevicesPage() {
  const [devices, setDevices] = useState<GenieACSDevice[]>([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showEditWifiModal, setShowEditWifiModal] = useState(false);
  const [editWifiData, setEditWifiData] = useState({ deviceId: '', wlanIndex: 1, ssid: '', password: '', securityMode: 'WPA2-PSK', enabled: true });
  const [savingWifi, setSavingWifi] = useState(false);
  const [showEditWanModal, setShowEditWanModal] = useState(false);
  const [editWanData, setEditWanData] = useState({ deviceId: '', action: 'edit' as 'edit'|'add', connectionType: 'PPPoE', name: 'INTERNET', username: '', password: '', vlanId: '', bindingPorts: [] as string[], serviceList: 'INTERNET' });
  const [savingWan, setSavingWan] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 500); return () => clearTimeout(t); }, [search]);

  const fetchDevices = useCallback(async (refresh = false, searchTerm = debouncedSearch) => {
    try {
      if (!refresh) setLoading(true);
      setError(null);
      const [devicesRes, settingsRes] = await Promise.all([
        fetch(`/api/settings/genieacs/devices?page=${page}&limit=${limit}${refresh?'&refresh=1':''}${searchTerm?'&search='+encodeURIComponent(searchTerm):''}${statusFilter?'&status='+statusFilter:''}`),
        fetch('/api/settings/genieacs')
      ]);
      if (settingsRes.ok) { const d = await settingsRes.json(); setIsConfigured(!!d?.settings?.host); }
      if (devicesRes.ok) {
        const d = await devicesRes.json();
        if (d.success === false) { setError(d.error||'Gagal'); setDevices([]); }
        else { setDevices(d.devices||[]); if (d.total!==undefined) setTotal(Number(d.total)); if (d.totalPages!==undefined) setTotalPages(Number(d.totalPages)); if (d.statistics) setStats(d.statistics); }
      } else setError(`Server error: ${devicesRes.status}`);
    } catch (err: any) { setError(err.message||'Error'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => { setPage(1); setTotal(0); setTotalPages(0); }, [debouncedSearch]);
  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { setSelectedDeviceIds([]); }, [page, limit, debouncedSearch, statusFilter]);
  useEffect(() => { fetchDevices(); }, [page, limit, debouncedSearch, statusFilter]);

  const handleRefresh = async () => { setRefreshing(true); await fetchDevices(true); setRefreshing(false); };
  const handleSearch = async (e?: React.FormEvent) => { if (e) e.preventDefault(); setPage(1); setDebouncedSearch(search); setRefreshing(true); await fetchDevices(true, search); setRefreshing(false); };
  const handleLimitChange = async (newLimit: number) => { setRefreshing(true); setLimit(newLimit); setPage(1); await fetchDevices(true); setRefreshing(false); };

  const handleReboot = async (deviceId: string) => {
    const r = await Swal.fire({ title:'Reboot?', text:'Device akan di-restart', icon:'warning', showCancelButton:true, confirmButtonText:'Ya, Reboot', confirmButtonColor:'#f97316', cancelButtonText:'Batal', heightAuto:false });
    if (!r.isConfirmed) return;
    try {
      Swal.fire({ title:'Sending...', allowOutsideClick:false, didOpen:()=>Swal.showLoading(), heightAuto:false });
      const res = await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(deviceId)}/reboot`, { method:'POST' });
      const d = await res.json();
      if (res.ok && d.success) Swal.fire({ icon:'success', title:'Berhasil', text:'Perintah reboot terkirim', timer:2000, showConfirmButton:false, heightAuto:false });
      else throw new Error(d.error||'Gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
  };

  const handleForceSync = async (deviceId: string) => {
    try {
      Swal.fire({ title:'Sync...', text:'Mengirim connection request', allowOutsideClick:false, heightAuto:false, didOpen:()=>Swal.showLoading() });
      const res = await fetch(`/api/genieacs/devices/${encodeURIComponent(deviceId)}/connection-request`, { method:'POST' });
      const d = await res.json();
      if (res.ok && d.success) { Swal.fire({ icon:'success', title:'Berhasil', timer:3000, showConfirmButton:false, heightAuto:false }); setTimeout(()=>handleRefresh(), 3000); }
      else throw new Error(d.error||'Gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
  };

  const handleDelete = async (deviceId: string) => {
    const r = await Swal.fire({ title:'Hapus Device?', text:'Device akan dihapus dari GenieACS', icon:'warning', showCancelButton:true, confirmButtonText:'Ya, Hapus', confirmButtonColor:'#dc2626', cancelButtonText:'Batal', heightAuto:false });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(deviceId)}`, { method:'DELETE' });
      if (res.ok) { setDevices(devices.filter(d=>d._id!==deviceId)); Swal.fire({ icon:'success', title:'Berhasil', text:'Device dihapus', timer:2000, showConfirmButton:false, heightAuto:false }); }
      else throw new Error('Gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
  };

  const handleBatchDelete = async () => {
    if (selectedDeviceIds.length===0) return;
    const r = await Swal.fire({ title:'Hapus Terpilih?', text:`${selectedDeviceIds.length} device akan dihapus`, icon:'warning', showCancelButton:true, confirmButtonText:'Ya, Hapus', confirmButtonColor:'#dc2626', heightAuto:false });
    if (!r.isConfirmed) return;
    try {
      Swal.fire({ title:'Menghapus...', allowOutsideClick:false, didOpen:()=>Swal.showLoading(), heightAuto:false });
      await Promise.all(selectedDeviceIds.map(id=>fetch(`/api/settings/genieacs/devices/${encodeURIComponent(id)}`,{method:'DELETE'})));
      setDevices(prev=>prev.filter(d=>!selectedDeviceIds.includes(d._id))); setSelectedDeviceIds([]);
      Swal.fire({ icon:'success', title:'Berhasil', timer:2000, showConfirmButton:false, heightAuto:false });
    } catch { Swal.fire({ icon:'error', title:'Error', text:'Gagal', heightAuto:false }); }
  };

  const handleRefreshParameters = async (deviceId: string, serialNumber: string) => {
    const r = await Swal.fire({ title:'Refresh Parameters?', text:`Refresh ${serialNumber}?`, icon:'question', showCancelButton:true, confirmButtonColor:'#0d9488', cancelButtonText:'Batal', heightAuto:false });
    if (!r.isConfirmed) return;
    try {
      Swal.fire({ title:'Refreshing...', allowOutsideClick:false, didOpen:()=>Swal.showLoading(), heightAuto:false });
      const res = await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(deviceId)}/refresh`, { method:'POST' });
      const d = await res.json();
      if (res.ok && d.success) { Swal.fire({ icon:'success', title:'Berhasil', text:'Refresh task terkirim', timer:2000, showConfirmButton:false, heightAuto:false }); setTimeout(()=>handleRefresh(),2000); }
      else throw new Error(d.error||'Gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
  };

  const handleViewDetail = async (deviceId: string) => {
    setLoadingDetail(true); setShowDetailModal(true); setSelectedDevice(null);
    try {
      try { await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(deviceId)}/refresh`, { method:'POST' }); } catch {}
      await new Promise(r=>setTimeout(r, 2500));
      const res = await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(deviceId)}/detail`);
      const d = await res.json();
      if (res.ok && d.success && d.device) setSelectedDevice(d.device);
      else { Swal.fire({ icon:'error', title:'Error', text:d.error||'Gagal', heightAuto:false }); setShowDetailModal(false); }
    } catch { Swal.fire({ icon:'error', title:'Error', text:'Gagal', heightAuto:false }); setShowDetailModal(false); }
    finally { setLoadingDetail(false); }
  };

  const handleRefreshDetail = async () => {
    if (!selectedDevice) return;
    setLoadingDetail(true);
    try {
      await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(selectedDevice._id)}/refresh`, { method:'POST' });
      await new Promise(r=>setTimeout(r, 2500));
      const res = await fetch(`/api/settings/genieacs/devices/${encodeURIComponent(selectedDevice._id)}/detail`);
      const d = await res.json();
      if (res.ok && d.success && d.device) setSelectedDevice(d.device);
    } catch {} finally { setLoadingDetail(false); }
  };

  const openEditWifiModal = (deviceId: string, wlan?: WLANConfig) => {
    let secMode = wlan?.security||'WPA2-PSK';
    if (secMode.toLowerCase().includes('none')||secMode==='') secMode='None';
    else if (secMode.includes('WPA2')) secMode='WPA2-PSK';
    else if (secMode.includes('WPA')&&!secMode.includes('WPA2')) secMode='WPA-PSK';
    setEditWifiData({ deviceId, wlanIndex: wlan?.index||1, ssid: wlan?.ssid||'', password: (wlan&&wlan.password&&wlan.password!=='-')?wlan.password:'', securityMode: secMode, enabled: wlan?.enabled??true });
    setShowEditWifiModal(true);
  };

  const handleSaveWifi = async () => {
    if (!editWifiData.ssid||editWifiData.ssid.length<1||editWifiData.ssid.length>32) { Swal.fire({ icon:'warning', title:'Validasi', text:'SSID 1-32 karakter', heightAuto:false }); return; }
    const isOpen = editWifiData.securityMode==='None';
    if (!isOpen&&(!editWifiData.password||editWifiData.password.length<8)) { Swal.fire({ icon:'warning', title:'Validasi', text:'Password 8-63 karakter', heightAuto:false }); return; }
    const r = await Swal.fire({ title:'Update WiFi?', text:'Konfigurasi WiFi akan dikirim ke device', icon:'question', showCancelButton:true, confirmButtonText:'Ya, Simpan', confirmButtonColor:'#0d9488', heightAuto:false });
    if (!r.isConfirmed) return;
    setSavingWifi(true);
    try {
      const res = await fetch(`/api/genieacs/devices/${encodeURIComponent(editWifiData.deviceId)}/wifi`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ wlanIndex: editWifiData.wlanIndex, ssid: editWifiData.ssid, password: editWifiData.password, securityMode: editWifiData.securityMode, enabled: editWifiData.enabled }) });
      const d = await res.json();
      if (res.ok&&d.success) { Swal.fire({ icon:'success', title:'Berhasil', text:'Task WiFi terkirim', timer:2000, showConfirmButton:false, heightAuto:false }); setShowEditWifiModal(false); }
      else throw new Error(d.error||'Gagal');
    } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
    finally { setSavingWifi(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-350 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GenieACS Devices</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Management perangkat TR-069</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

        {/* Table */}
        <DevicesTable
          devices={devices} loading={loading} error={error} refreshing={refreshing}
          search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          limit={limit} page={page} totalPages={totalPages}
          selectedDeviceIds={selectedDeviceIds}
          handleToggleSelect={(id)=>setSelectedDeviceIds(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])}
          handleToggleSelectAll={()=>{if(selectedDeviceIds.length===devices.length)setSelectedDeviceIds([]);else setSelectedDeviceIds(devices.map(d=>d._id));}}
          handleBatchDelete={handleBatchDelete}
          handleSearch={handleSearch} handleRefresh={handleRefresh}
          handleLimitChange={handleLimitChange}
          handlePrevPage={()=>setPage(p=>Math.max(1,p-1))}
          handleNextPage={()=>setPage(p=>p+1)}
          handleViewDetail={handleViewDetail}
          handleRefreshParameters={handleRefreshParameters}
          handleReboot={handleReboot}
          handleDelete={handleDelete}
        />

        {/* Detail Modal */}
        <DeviceDetailModal
          show={showDetailModal} device={selectedDevice} loadingDetail={loadingDetail}
          onClose={()=>{setShowDetailModal(false);setSelectedDevice(null);}}
          onRefresh={handleRefreshDetail}
          onForceSync={handleForceSync}
          onRefreshParameters={handleRefreshParameters}
          onReboot={handleReboot}
          onOpenEditWifi={(id,wlan)=>{setShowDetailModal(false);openEditWifiModal(id,wlan);}}
          onOpenEditWan={(device,conn)=>{setShowDetailModal(false);setEditWanData({deviceId:device._id,action:'edit',connectionType:conn?.connectionType||'PPPoE',name:conn?.name||'INTERNET',username:conn?.username||'',password:'',vlanId:conn?.vlanId||'',bindingPorts:conn?.bindingPorts||[],serviceList:conn?.serviceList||'INTERNET'});setShowEditWanModal(true);}}
          onOpenAddWan={(device)=>{setShowDetailModal(false);setEditWanData({deviceId:device._id,action:'add',connectionType:'PPPoE',name:'INTERNET',username:'',password:'',vlanId:'',bindingPorts:[],serviceList:'INTERNET'});setShowEditWanModal(true);}}
          onDeleteWan={async (device,conn)=>{if(!conn?.path)return;try{await fetch(`/api/genieacs/devices/${encodeURIComponent(device._id)}/wan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',path:conn.path})});Swal.fire({icon:'success',title:'Berhasil',timer:2000,showConfirmButton:false,heightAuto:false});}catch(err:any){Swal.fire({icon:'error',title:'Error',text:err.message,heightAuto:false});}}}
        />

        {/* Edit WiFi Modal */}
        <EditWifiModal show={showEditWifiModal} wlanConfigs={selectedDevice?.wlanConfigs || []} editWifiData={editWifiData} setEditWifiData={setEditWifiData} savingWifi={savingWifi} onClose={()=>setShowEditWifiModal(false)} onSave={handleSaveWifi} />

        {/* Edit WAN Modal */}
        <EditWanModal show={showEditWanModal} editWanData={editWanData} setEditWanData={setEditWanData} savingWan={savingWan} onClose={()=>setShowEditWanModal(false)} onSave={async()=>{
          setSavingWan(true);
          try {
            const res = await fetch(`/api/genieacs/devices/${encodeURIComponent(editWanData.deviceId)}/wan`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:editWanData.action,path:editWanData.connectionType==='PPPoE'?'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1':'',name:editWanData.name,connectionType:editWanData.connectionType,username:editWanData.username,password:editWanData.password,vlanId:editWanData.vlanId,bindingPorts:editWanData.bindingPorts,serviceList:editWanData.serviceList}) });
            const d = await res.json();
            if (res.ok&&d.success) { Swal.fire({ icon:'success', title:'Berhasil', text:'Task WAN terkirim', timer:2000, showConfirmButton:false, heightAuto:false }); setShowEditWanModal(false); }
            else throw new Error(d.error||'Gagal');
          } catch (err:any) { Swal.fire({ icon:'error', title:'Error', text:err.message, heightAuto:false }); }
          finally { setSavingWan(false); }
        }} />
      </div>
    </div>
  );
}
