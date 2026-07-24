import React, { useState } from 'react';
import { Server, Loader2, RefreshCw, X, RotateCcw, Power, Edit, Globe, Activity, Smartphone, Wifi, Plus, Trash2 } from 'lucide-react';
import { DeviceDetail, WLANConfig } from '../types';
import { formatUptime } from '@/lib/utils';

interface Props {
  show: boolean; device: DeviceDetail | null; loadingDetail: boolean;
  onClose: () => void; onRefresh: () => void; onForceSync: (id: string) => void;
  onRefreshParameters: (id: string, serial: string) => void; onReboot: (id: string) => void;
  onOpenEditWifi: (id: string, wlan: WLANConfig) => void;
  onOpenEditWan: (device: DeviceDetail, connection?: any) => void;
  onOpenAddWan: (device: DeviceDetail) => void; onDeleteWan: (device: DeviceDetail, connection: any) => void;
}

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <span className="text-[11px] text-zinc-500">{label}</span>
    <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">{value || '-'}</span>
  </div>
);

const tabs = [
  { id: 'info', label: 'Device', icon: Server },
  { id: 'wan', label: 'WAN', icon: Globe },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'connected', label: 'Clients', icon: Smartphone },
];

export default function DeviceDetailModal({ show, device, loadingDetail, onClose, onRefresh, onForceSync, onRefreshParameters, onReboot, onOpenEditWifi, onOpenEditWan, onOpenAddWan, onDeleteWan }: Props) {
  const [activeTab, setActiveTab] = useState('info');
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <div>
              <h2 className="text-sm font-semibold">Device Detail</h2>
              {device && <p className="text-[10px] text-teal-100">{device.serialNumber} - {device.model}</p>}
              {loadingDetail && <p className="text-[10px] text-teal-200 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Memuat detail...</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {device && !loadingDetail && (
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}>
                {device.status}
              </span>
            )}
            <button onClick={onRefresh} disabled={loadingDetail} className="p-1 hover:bg-white/10 rounded disabled:opacity-40" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loadingDetail ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => onReboot(device?._id || '')} className="p-1 hover:bg-white/10 rounded" title="Reboot">
              <Power className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {device && !loadingDetail && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-700 px-3 pt-2 gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-t-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-teal-600 border border-zinc-200 dark:border-zinc-700 border-b-white dark:border-b-zinc-800 -mb-px'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative"><div className="w-12 h-12 rounded-full border-4 border-teal-100 dark:border-teal-900/30" /><div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" /></div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Memuat Detail Device...</p>
            </div>
          ) : device ? (
            <>
              {/* TAB: Device Info */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <Server className="w-3.5 h-3.5 text-orange-600" /><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Device Info</span>
                  </div>
                  <div className="p-3">
                    <InfoRow label="Serial Number" value={device.serialNumber} />
                    <InfoRow label="Product Class" value={device.model} />
                    <InfoRow label="OUI" value={device.oui} />
                    <InfoRow label="Manufacturer" value={device.manufacturer} />
                    <InfoRow label="Hardware Version" value={device.hardwareVersion} />
                    <InfoRow label="Software Version" value={device.softwareVersion} />
                    <InfoRow label="MAC Address" value={device.macAddress} />
                    <InfoRow label="TR-069 IP" value={device.tr069IP} />
                    <InfoRow label="Uptime" value={formatUptime(device.uptime)} />
                    <InfoRow label="Last Inform" value={device.lastInform ? new Date(device.lastInform).toLocaleString('id-ID') : '-'} />
                    <InfoRow label="PPP Username" value={device.pppoeUsername} />
                    <InfoRow label="PPP IP" value={device.pppoeIP} />
                    <InfoRow label="LAN IP" value={device.lanIP} />
                    <InfoRow label="LAN Subnet" value={device.lanSubnet} />
                    <InfoRow label="DHCP" value={device.dhcpEnabled === '-' ? '-' : (device.dhcpEnabled === 'true' ? `${device.dhcpStart} - ${device.dhcpEnd}` : 'Disabled')} />
                    <InfoRow label="DNS" value={device.dns1} />
                    <InfoRow label="CPU Usage" value={device.cpuUsage} />
                  </div>
                </div>
                {/* Optical */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <Activity className="w-3.5 h-3.5 text-purple-600" /><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Optical</span>
                  </div>
                  <div className="p-3">
                    <InfoRow label="PON Mode" value={device.ponMode} />
                    <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500">Rx Power</span>
                      <span className={`text-[11px] font-medium ${device.rxPower && device.rxPower !== '-'
                        ? parseFloat(device.rxPower) > -25 ? 'text-green-600' : parseFloat(device.rxPower) > -28 ? 'text-yellow-600' : 'text-red-600'
                        : 'text-zinc-800'}`}>
                        {device.rxPower && device.rxPower !== '-' ? `${device.rxPower} dBm` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500">Tx Power</span>
                      <span className={`text-[11px] font-medium ${device.txPower && device.txPower !== '-'
                        ? parseFloat(device.txPower) > 0 ? 'text-green-600' : 'text-red-600'
                        : 'text-zinc-800'}`}>
                        {device.txPower && device.txPower !== '-' ? `${device.txPower} dBm` : '-'}
                      </span>
                    </div>
                    <InfoRow label="Temperature" value={device.temp && device.temp !== '-' ? `${device.temp}°C` : '-'} />
                    <InfoRow label="Voltage" value={device.voltage && device.voltage !== '-' ? `${device.voltage} V` : '-'} />
                  </div>
                </div>
                </div>
              )}
              {activeTab === 'wan' && (
                <div className="space-y-3">
                  <button onClick={() => onOpenAddWan(device)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" /> Add WAN
                  </button>
                  {device.wanConnections && device.wanConnections.length > 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 border-b">
                        <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-semibold">WAN ({device.wanConnections.length})</span></div>
                      </div>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {device.wanConnections.map((conn, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Globe className="w-3 h-3 text-blue-600" /></div>
                              <div>
                                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{conn.name || 'WAN'}</p>
                                <p className="text-[10px] text-zinc-500">{conn.connectionType}{conn.vlanId ? ` • VLAN ${conn.vlanId}` : ''}{conn.ipAddress !== '-' ? ` • ${conn.ipAddress}` : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${conn.enabled ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'}`}>{conn.enabled ? 'ON' : 'OFF'}</span>
                              <button onClick={() => onOpenEditWan(device, conn)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded cursor-pointer"><Edit className="w-3 h-3" /></button>
                              <button onClick={() => onDeleteWan(device, conn)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"><Globe className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Tidak ada koneksi WAN</p></div>
                  )}
                </div>
              )}

              {/* TAB: Optical */}
              {activeTab === 'optical' && (
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <Activity className="w-3.5 h-3.5 text-purple-600" /><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Optical</span>
                  </div>
                  <div className="p-3">
                    <InfoRow label="PON Mode" value={device.ponMode} />
                    <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500">Rx Power</span>
                      <span className={`text-[11px] font-medium ${device.rxPower && device.rxPower !== '-'
                        ? parseFloat(device.rxPower) > -25 ? 'text-green-600' : parseFloat(device.rxPower) > -28 ? 'text-yellow-600' : 'text-red-600'
                        : 'text-zinc-800'}`}>
                        {device.rxPower && device.rxPower !== '-' ? `${device.rxPower} dBm` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500">Tx Power</span>
                      <span className={`text-[11px] font-medium ${device.txPower && device.txPower !== '-'
                        ? parseFloat(device.txPower) > 0 ? 'text-green-600' : 'text-red-600'
                        : 'text-zinc-800'}`}>
                        {device.txPower && device.txPower !== '-' ? `${device.txPower} dBm` : '-'}
                      </span>
                    </div>
                    <InfoRow label="Temperature" value={device.temp && device.temp !== '-' ? `${device.temp}°C` : '-'} />
                    <InfoRow label="Voltage" value={device.voltage && device.voltage !== '-' ? `${device.voltage} V` : '-'} />
                  </div>
                </div>
              )}

              {/* TAB: WiFi */}
              {activeTab === 'wifi' && (
                <div className="space-y-3">
                  {device.wlanConfigs && device.wlanConfigs.length > 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 border-b">
                        <div className="flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-cyan-600" /><span className="text-xs font-semibold">WiFi ({device.wlanConfigs.length})</span></div>
                        <span className="text-[10px] text-zinc-500">{device.totalConnected} devices</span>
                      </div>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {device.wlanConfigs.map((wlan, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${wlan.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                <Wifi className={`w-3 h-3 ${wlan.enabled ? 'text-green-600' : 'text-zinc-400'}`} />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{wlan.ssid || '-'}</p>
                                <p className="text-[10px] text-zinc-500">{wlan.band} • Ch {wlan.channel} • {wlan.security || 'Open'} • {wlan.connectedClients ?? 0} client</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${wlan.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700'}`}>{wlan.enabled ? 'ON' : 'OFF'}</span>
                              <button onClick={() => onOpenEditWifi(device._id, wlan)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"><Edit className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"><Wifi className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Tidak ada data WiFi</p></div>
                  )}
                </div>
              )}

              {/* TAB: Connected Clients */}
              {activeTab === 'connected' && (
                device.connectedDevices && device.connectedDevices.length > 0 ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 border-b">
                      <div className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-indigo-600" /><span className="text-xs font-semibold">Connected ({device.connectedDevices.length})</span></div>
                      <span className="text-[10px] text-zinc-500">{device.connectedDevices.filter(d => d.active).length} online</span>
                    </div>
                    <div className="p-3 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-zinc-200">
                          <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-zinc-500">Device</th>
                          <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-zinc-500">IP</th>
                          <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-zinc-500">MAC</th>
                          <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-zinc-500">Interface</th>
                          <th className="text-center py-1.5 px-2 text-[10px] font-semibold text-zinc-500">Signal</th>
                          <th className="text-center py-1.5 px-2 text-[10px] font-semibold text-zinc-500">Status</th>
                        </tr></thead>
                        <tbody>
                          {device.connectedDevices.map((host, idx) => (
                            <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800">
                              <td className="py-1.5 px-2 font-medium text-zinc-800 dark:text-zinc-200">{host.hostName !== '-' ? host.hostName : host.macAddress || 'Unknown'}</td>
                              <td className="py-1.5 px-2 text-zinc-600 dark:text-zinc-400">{host.ipAddress}</td>
                              <td className="py-1.5 px-2 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">{host.macAddress}</td>
                              <td className="py-1.5 px-2 text-zinc-600 dark:text-zinc-400">{host.interfaceType || host.layer2Interface?.split('.').slice(-3,-1).join('.') || '-'}</td>
                              <td className="py-1.5 px-2 text-center">
                                {host.rssi !== undefined ? (
                                  <span className={`text-[10px] font-medium ${host.rssi >= -50 ? 'text-green-600' : host.rssi >= -67 ? 'text-yellow-600' : 'text-red-600'}`}>{host.rssi} dBm</span>
                                ) : '-'}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${host.active ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'}`}>
                                  {host.active ? 'Online' : 'Offline'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"><Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Tidak ada client terhubung</p></div>
                )
              )}
            </>
          ) : (
            <div className="text-center py-8 text-zinc-500"><Server className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Device tidak ditemukan</p></div>
          )}
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
