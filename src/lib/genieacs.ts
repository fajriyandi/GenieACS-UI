export function extractRawValue(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object' && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    if ('_value' in obj) return obj._value;
    if ('value' in obj) return (obj as any).value;
  }
  return val;
}

export function safeString(val: unknown): string {
  const raw = extractRawValue(val);
  if (raw === null || raw === undefined) return '-';
  if (typeof raw === 'string') return raw || '-';
  if (typeof raw === 'number') return String(raw);
  if (typeof raw === 'boolean') return String(raw);
  if (Array.isArray(raw)) {
    if (raw.length > 0) return safeString(raw[0]);
    return '-';
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if ('_value' in obj) return safeString(obj._value);
    if ('value' in obj) {
      const v = (obj as any).value;
      if (Array.isArray(v) && v.length > 0) return safeString(v[0]);
      return safeString(v);
    }
    return '-';
  }
  return String(raw) || '-';
}

export function getNestedValue(device: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let value: unknown = device;
  for (const part of parts) {
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (part in obj) value = obj[part];
      else return undefined;
    } else return undefined;
  }
  return value;
}

export function getParameterValue(device: Record<string, unknown>, paths: string[]): string {
  for (const path of paths) {
    const val = getNestedValue(device, path);
    if (val !== undefined && val !== null) {
      const result = safeString(val);
      if (result !== '-' && result !== '') return result;
    }
  }
  return '-';
}

function extractIPFromURL(url: string): string {
  if (!url || url === '-') return '-';
  const match = url.match(/https?:\/\/([^:\/]+)/);
  return match && match[1] ? match[1] : '-';
}

export function getDeviceStatus(lastInform: string | null): string {
  if (!lastInform) return 'Unknown';
  try {
    const diffHours = (Date.now() - new Date(lastInform).getTime()) / (1000 * 60 * 60);
    return diffHours < 1 ? 'Online' : 'Offline';
  } catch { return 'Unknown'; }
}

// Actual paths verified against ZTE F670L ONT via GenieACS NBI
export const GENIEACS_PARAMETER_PATHS = {
  pppUsername: [
    'VirtualParameters.pppUsername',
    'VirtualParameters.pppoeUsername',
    'VirtualParameters.pppoeUsername2',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.2.Username',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.3.Username',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.4.Username',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.1.Username',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.2.Username',
    'Device.PPP.Interface.1.Username',
    'Device.PPP.Interface.2.Username',
    'Device.PPP.Interface.3.Username',
    'Device.PPP.Interface.4.Username',
  ],
  rxPower: [
    'VirtualParameters.redaman',
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_FH_GponInterfaceConfig.RXPower',
    'InternetGatewayDevice.X_ALU_OntOpticalParam.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_CT-COM_GponInterfaceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_CT-COM_EponInterfaceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_CMCC_GponInterfaceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_CMCC_EponInterfaceConfig.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_CU_WANEPONInterfaceConfig.OpticalTransceiver.RXPower',
    'InternetGatewayDevice.WANDevice.1.WANEponInterfaceConfig.RXPower',
    'Device.Optical.Interface.1.Stats.RXPower',
    'InternetGatewayDevice.WANDevice.1.X_GponInterfaceConfig.RXPower',
    'VirtualParameters.RXPower',
  ],
  txPower: [
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TXPower',
    'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TXPower',
    'Device.Optical.Interface.1.Stats.TXPower',
  ],
  pppoeIP: [
    'VirtualParameters.pppIP',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.ExternalIPAddress',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.2.ExternalIPAddress',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.1.ExternalIPAddress',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress',
    'Device.PPP.Interface.1.IPCP.LocalIPAddress',
    'Device.PPP.Interface.2.IPCP.LocalIPAddress',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.ExternalIPAddress',
  ],
  uptime: [
    'VirtualParameters.uptimeDevice',
    'VirtualParameters.uptime',
    'InternetGatewayDevice.DeviceInfo.UpTime',
    'Device.DeviceInfo.UpTime',
  ],
  macAddress: [
    'VirtualParameters.MacAddress',
    'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.MACAddress',
    'InternetGatewayDevice.LANDevice.1.LANEthernetInterfaceConfig.1.MACAddress',
    'Device.Ethernet.Interface.1.MACAddress',
  ],
  serialNumber: ['InternetGatewayDevice.DeviceInfo.SerialNumber', 'Device.DeviceInfo.SerialNumber'],
  model: ['InternetGatewayDevice.DeviceInfo.ProductClass', 'InternetGatewayDevice.DeviceInfo.ModelName', 'Device.DeviceInfo.ModelName'],
  manufacturer: ['InternetGatewayDevice.DeviceInfo.Manufacturer', 'Device.DeviceInfo.Manufacturer'],
  temp: [
    'VirtualParameters.temp',
    'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverTemperature',
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverTemperature',
    'Device.Optical.Interface.1.Stats.Temperature',
  ],
  ponMode: [
    'VirtualParameters.PonMode',
    'InternetGatewayDevice.DeviceInfo.AccessType',
    'InternetGatewayDevice.WANDevice.1.WANCommonInterfaceConfig.WANAccessType',
  ],
  softwareVersion: [
    'VirtualParameters.softwareVersion',
    'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
    'Device.DeviceInfo.SoftwareVersion',
  ],
  hardwareVersion: ['InternetGatewayDevice.DeviceInfo.HardwareVersion', 'Device.DeviceInfo.HardwareVersion'],
  tr069IP: ['InternetGatewayDevice.ManagementServer.ConnectionRequestURL', 'Device.ManagementServer.ConnectionRequestURL'],
  ssid: [
    'VirtualParameters.getWlanPass24G-1',
    'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID',
    'Device.WiFi.SSID.1.SSID',
  ],
  voltage: [
    'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverVoltage',
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverVoltage',
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.SupplyVoltage',
  ],
  biasCurrent: [
    'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverBiasCurrent',
    'InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverBiasCurrent',
  ],
  lanIP: ['InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.IPInterface.1.IPInterfaceIPAddress', 'Device.IP.Interface.1.IPv4Address.1.IPAddress'],
  lanSubnet: ['InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.IPInterface.1.IPInterfaceSubnetMask'],
  dhcpEnabled: ['InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.DHCPServerEnable'],
  dhcpStart: ['InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.MinAddress'],
  dhcpEnd: ['InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.MaxAddress'],
  dns: ['InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.DNSServers'],
  memoryFree: ['InternetGatewayDevice.DeviceInfo.MemoryStatus.Free', 'InternetGatewayDevice.DeviceInfo.X_ZTE-COM_MemUsed'],
  memoryTotal: ['InternetGatewayDevice.DeviceInfo.MemoryStatus.Total'],
  cpuUsage: ['InternetGatewayDevice.DeviceInfo.ProcessStatus.CPUUsage', 'InternetGatewayDevice.DeviceInfo.X_ZTE-COM_CpuUsed'],
  connectedDevices: [
    'InternetGatewayDevice.LANDevice.1.Hosts.Host',
    'Device.Hosts.Host',
    'InternetGatewayDevice.LANDevice.1.Hosts.Host.1',
  ],
};

export interface WLANConfig {
  index: number; ssid: string; enabled: boolean; channel: string;
  security: string; password: string; band: string; totalAssociations: number;
  connectedClients: number;
}

export interface ConnectedHost {
  hostName: string; ipAddress: string; macAddress: string;
  interfaceType: string; active: boolean; layer2Interface: string;
  ssidIndex: number; rssi?: number; ssidName?: string;
}

export interface WANConnection {
  path: string; name: string; connectionType: string;
  username?: string; ipAddress: string; vlanId: string;
  bindingPorts: string[]; enabled: boolean; serviceList?: string;
}

export interface DeviceDetail {
  _id: string; serialNumber: string; manufacturer: string; model: string;
  oui: string; pppoeUsername: string; pppoeIP: string; tr069IP: string;
  rxPower: string; txPower: string; ponMode: string; uptime: string;
 status: string; lastInform: string | null; macAddress: string;
 softwareVersion: string; hardwareVersion: string; temp: string;
 voltage: string; biasCurrent: string; lanIP: string; lanSubnet: string;
 dhcpEnabled: string; dhcpStart: string; dhcpEnd: string; dns1: string;
 memoryFree: string; memoryTotal: string; cpuUsage: string;
 wlanConfigs: WLANConfig[]; wanConnections?: WANConnection[];
 connectedDevices: ConnectedHost[]; totalConnected: number;
 isDualBand: boolean; tags: string[]; ssid?: string;
}

function discoverParameter(device: Record<string, unknown>, leafName: string, pathPattern?: RegExp): string[] {
  const results: string[] = [];
  function traverse(obj: unknown, currentPath: string) {
    if (!obj || typeof obj !== 'object') return;
    const record = obj as Record<string, unknown>;
    if (leafName in record) {
      const val = record[leafName];
      if (val !== null && val !== undefined) {
        if (!pathPattern || pathPattern.test(currentPath)) {
          const str = safeString(val);
          if (str !== '-' && str !== '') results.push(str);
        }
      }
    }
    for (const key in record) {
      if (key.startsWith('_')) continue;
      const child = record[key];
      if (child && typeof child === 'object') traverse(child, currentPath ? `${currentPath}.${key}` : key);
    }
  }
  traverse(device, '');
  return results;
}

export interface GenieACSVendorMapping {
  id: string; name: string; manufacturerPattern: string; modelPattern: string;
  wlanIndexes: number[]; wlanBandMapping: Record<string, string>;
  readPaths?: { wifiPassword?: string[] };
  writePaths?: { ssid?: string[]; password?: string[]; enable?: string[] };
}

export const DEFAULT_VENDOR_MAPPINGS: GenieACSVendorMapping[] = [
  { id: 'tenda-default', name: 'Tenda ONU Default', manufacturerPattern: 'Tenda', modelPattern: '*',
    wlanIndexes: [1,2], wlanBandMapping: {'1':'2.4GHz','2':'5GHz'},
    readPaths: { wifiPassword: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.PreSharedKey.1.KeyPassphrase'] },
    writePaths: { ssid: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.SSID'],
      password: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.PreSharedKey.1.KeyPassphrase'],
      enable: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.Enable'] }
  },
  { id: 'tdtc-hg7', name: 'TDTC HG7 Dual-Band', manufacturerPattern: 'TDTC', modelPattern: 'HG7',
    wlanIndexes: [1,6], wlanBandMapping: {'1':'5GHz','6':'2.4GHz'} },
  { id: 'default-fallback', name: 'Default Fallback (Huawei, ZTE, etc.)', manufacturerPattern: '*', modelPattern: '*',
    wlanIndexes: [1,5], wlanBandMapping: {'1':'2.4GHz','5':'5GHz'},
    readPaths: { wifiPassword: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.PreSharedKey.1.KeyPassphrase',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.KeyPassphrase'] },
    writePaths: { ssid: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.SSID'],
      password: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.KeyPassphrase'],
      enable: ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.{index}.Enable'] }
  }
];

function detectBand(wlan: Record<string, unknown>, index: number): string {
  const freq = safeString(getNestedValue(wlan, 'OperatingFrequencyBand') as unknown);
  const std = safeString(getNestedValue(wlan, 'Standard') as unknown).toLowerCase();
  const ssid = safeString(getNestedValue(wlan, 'SSID') as unknown).toLowerCase();
  if (freq.includes('5')) return '5GHz';
  if (freq.includes('2.4') || freq.includes('2G')) return '2.4GHz';
  if (std.includes('ac') || std.includes('ax') || std === 'a' || std.includes('5g')) return '5GHz';
  if (std.includes('b') || std.includes('g')) return '2.4GHz';
  if (ssid.includes('5g') || ssid.includes('_5')) return '5GHz';
  return index <= 3 ? '2.4GHz' : '5GHz';
}

export function isTruthyValue(val: unknown): boolean {
  const raw = extractRawValue(val);
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0) return false;
  const str = String(raw).toLowerCase();
  return str === 'true' || str === '1' || str === 'yes' || str === 'on';
}

function matchVendorMappingRule(mappings: GenieACSVendorMapping[], manufacturer?: string, model?: string): GenieACSVendorMapping {
  const mfg = String(manufacturer || '').toUpperCase();
  const mdl = String(model || '').toUpperCase();
  const isMatch = (val: string, pattern: string) => {
    const pat = pattern.toUpperCase();
    if (pat === '*' || pat === '') return true;
    if (pat.startsWith('*') && pat.endsWith('*')) return val.includes(pat.slice(1,-1));
    if (pat.startsWith('*')) return val.endsWith(pat.slice(1));
    if (pat.endsWith('*')) return val.startsWith(pat.slice(0,-1));
    return val === pat;
  };
  for (const rule of mappings) {
    if (rule.manufacturerPattern === '*' && rule.modelPattern === '*') continue;
    if (isMatch(mfg, rule.manufacturerPattern) && isMatch(mdl, rule.modelPattern)) return rule;
  }
  return mappings.find(r => r.id === 'default-fallback') || DEFAULT_VENDOR_MAPPINGS[DEFAULT_VENDOR_MAPPINGS.length-1];
}

export async function getEffectiveMappings() {
  const { queryOne } = await import('./db');
  try {
    const row = await queryOne('SELECT paths FROM genieacs_parameter_mappings WHERE paramKey = ?', ['custom_paths']) as any;
    if (row) return { ...GENIEACS_PARAMETER_PATHS, ...JSON.parse(row.paths) };
  } catch {}
  return GENIEACS_PARAMETER_PATHS;
}

export async function getEffectiveVendorMappings(): Promise<GenieACSVendorMapping[]> {
  const { query } = await import('./db');
  try {
    const rows = await query('SELECT * FROM genieacs_vendor_mappings ORDER BY sortOrder ASC') as any[];
    if (rows.length > 0) return rows.map((r: any) => ({
      id: r.id, name: r.name, manufacturerPattern: r.manufacturerPattern, modelPattern: r.modelPattern,
      wlanIndexes: JSON.parse(r.wlanIndexes), wlanBandMapping: JSON.parse(r.wlanBandMapping),
      readPaths: r.readPaths ? JSON.parse(r.readPaths) : undefined,
      writePaths: r.writePaths ? JSON.parse(r.writePaths) : undefined,
    }));
  } catch {}
  return DEFAULT_VENDOR_MAPPINGS;
}

export function extractWLANConfigs(device: Record<string, unknown>, manufacturer?: string, model?: string): WLANConfig[] {
  const res: WLANConfig[] = [];
  const lanDevice = getNestedValue(device, 'InternetGatewayDevice.LANDevice.1') as Record<string, unknown>;
  if (lanDevice && typeof lanDevice === 'object') {
    const wlanObj = lanDevice['WLANConfiguration'] as Record<string, unknown>;
    if (wlanObj && typeof wlanObj === 'object') {
      for (const key of Object.keys(wlanObj)) {
        if (!isNaN(parseInt(key))) {
          const wlan = wlanObj[key] as Record<string, unknown>;
          if (wlan && typeof wlan === 'object') {
            const ssid = safeString(wlan['SSID']);
            if (ssid && ssid !== '-' && ssid !== '') {
              const index = parseInt(key);
              const enabled = isTruthyValue(wlan['Enable']);
              const band = detectBand(wlan, index);
              const totalAssocRaw = wlan['TotalAssociations'];
              let totalAssoc = 0;
              if (totalAssocRaw && typeof totalAssocRaw === 'object') {
                const assocObj = totalAssocRaw as Record<string, unknown>;
                if ('_value' in assocObj) totalAssoc = parseInt(String((assocObj as any)._value)) || 0;
              } else totalAssoc = parseInt(safeString(totalAssocRaw)) || 0;
              let security = safeString(wlan['BeaconType']);
              if (security === '-' || security === '') security = safeString(wlan['WPAEncryptionModes']);
              // Map TR-069 auth types to readable security modes
              if (security.toLowerCase().includes('wpa2') || security === '11i' || security === 'IEEE802.11i') security = 'WPA2-PSK';
              else if (security.toLowerCase().includes('wpa') && !security.toLowerCase().includes('wpa2')) security = 'WPA-PSK';
              else if (security.toLowerCase().includes('none') || security === '' || security === 'None' || security === 'Open') security = 'None';
              const getPwd = (w: Record<string, unknown>) => {
                for (const p of ['PreSharedKey.1.KeyPassphrase', 'KeyPassphrase', 'X_HW_WPAKey']) {
                  const v = getNestedValue(w, p);
                  if (v !== undefined && v !== null) { const s = safeString(v); if (s !== '-' && s !== '') return s; }
                }
                return '';
              };
              const password = getPwd(wlan);
              res.push({ index, ssid, enabled, channel: safeString(wlan['Channel']), security, password, band, totalAssociations: totalAssoc, connectedClients: totalAssoc });
            }
          }
        }
      }
    }
  }
  res.sort((a,b) => a.index - b.index);
  return res;
}

export function extractWANConnections(device: Record<string, unknown>): WANConnection[] {
  const res: WANConnection[] = [];
  const wanDevice = getNestedValue(device, 'InternetGatewayDevice.WANDevice.1') as Record<string, unknown>;
  if (!wanDevice || typeof wanDevice !== 'object') return res;
  const connDevice = wanDevice['WANConnectionDevice'] as Record<string, unknown>;
  if (!connDevice || typeof connDevice !== 'object') return res;
  for (const cdKey of Object.keys(connDevice)) {
    if (isNaN(parseInt(cdKey))) continue;
    const cd = connDevice[cdKey] as Record<string, unknown>;
    if (!cd || typeof cd !== 'object') continue;
    for (const connType of ['WANPPPConnection', 'WANIPConnection']) {
      const conns = cd[connType] as Record<string, unknown>;
      if (!conns || typeof conns !== 'object') continue;
      for (const connKey of Object.keys(conns)) {
        if (isNaN(parseInt(connKey))) continue;
        const conn = conns[connKey] as Record<string, unknown>;
        if (!conn || typeof conn !== 'object') continue;
        const name = safeString(conn['Name']) || safeString(conn['ConnectionName']) || `WAN-${cdKey}-${connKey}`;
        const isPPP = connType === 'WANPPPConnection';
        const connTypeStr = isPPP ? 'PPPoE' : 'DHCP';
        const username = isPPP ? safeString(conn['Username']) : '';
        const ip = safeString(isPPP ? conn['ExternalIPAddress'] : conn['ExternalIPAddress']);
        const vlanIdRaw = getNestedValue(conn, 'VLANIDMarkingConfiguration.1.VLANID') as unknown;
        const vlanId = safeString(vlanIdRaw) !== '-' ? safeString(vlanIdRaw) : '';
        const enabled = isTruthyValue(conn['Enable']);
        res.push({
          path: `InternetGatewayDevice.WANDevice.1.WANConnectionDevice.${cdKey}.${connType}.${connKey}`,
          name, connectionType: connTypeStr, username, ipAddress: ip,
          vlanId, bindingPorts: [], enabled, serviceList: safeString(conn['ServiceList']),
        });
      }
    }
  }
  return res;
}

export function extractConnectedHosts(device: Record<string, unknown>): ConnectedHost[] {
  const res: ConnectedHost[] = [];
  const hosts = getNestedValue(device, 'InternetGatewayDevice.LANDevice.1.Hosts.Host') as Record<string, unknown>;
  if (!hosts || typeof hosts !== 'object') return res;
  for (const key of Object.keys(hosts)) {
    if (isNaN(parseInt(key))) continue;
    const host = hosts[key] as Record<string, unknown>;
    if (!host || typeof host !== 'object') continue;
    res.push({
      hostName: safeString(host['HostName']), ipAddress: safeString(host['IPAddress']),
      macAddress: safeString(host['MACAddress']), interfaceType: safeString(host['InterfaceType']),
      active: isTruthyValue((host['Active'] as any)?._value ?? host['Active']),
      layer2Interface: safeString(host['Layer2Interface']),
      ssidIndex: 0,
    });
  }
  return res;
}

export function extractAssociatedDevices(device: Record<string, unknown>, wlanConfigs: WLANConfig[]): ConnectedHost[] {
  const res: ConnectedHost[] = [];
  for (const wlan of wlanConfigs) {
    const assocDevices = getNestedValue(device, `InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlan.index}.AssociatedDevice`) as Record<string, unknown>;
    if (!assocDevices || typeof assocDevices !== 'object') continue;
    for (const key of Object.keys(assocDevices)) {
      if (isNaN(parseInt(key))) continue;
      const dev = assocDevices[key] as Record<string, unknown>;
      if (!dev || typeof dev !== 'object') continue;
      // Try multiple RSSI field names (vendor-specific: ZTE uses AssociatedDeviceRssi, X_ZTE-COM_*, etc.)
      const rssiStr = safeString(dev['AssociatedDeviceRssi'])
        || safeString(dev['X_ZTE-COM_Rssi'])
        || safeString(dev['X_ZTE-COM_SignalStrength'])
        || safeString(dev['X_ZTE-COM_WLAN_RSSI'])
        || safeString(dev['X_ZTE-COM_WLAN_ClientSignalStrength'])
        || safeString(dev['SignalStrength']);
      // Try vendor-specific host name
      const hostName = safeString(dev['X_ZTE-COM_AssociatedDeviceName']) !== '-'
        ? safeString(dev['X_ZTE-COM_AssociatedDeviceName'])
        : safeString(dev['AssociatedDeviceMACAddress']) !== '-'
          ? `Device-${safeString(dev['AssociatedDeviceMACAddress']).slice(-5)}`
          : '-';
      const ipAddr = safeString(dev['AssociatedDeviceIPAddress']) || safeString(dev['IPAddress']);
      // ZTE reports false for auth state even when clients are active; use RSSI presence as online signal
      const hasRssi = rssiStr !== '-' && rssiStr !== '';
      res.push({
        hostName,
        ipAddress: ipAddr,
        macAddress: safeString(dev['AssociatedDeviceMACAddress']),
        interfaceType: wlan.ssid,
        active: hasRssi,
        layer2Interface: `WLAN${wlan.index}`,
        ssidIndex: wlan.index,
        rssi: hasRssi ? parseInt(rssiStr) : undefined,
        ssidName: wlan.ssid,
      });
    }
  }
  return res;
}

export async function mapDeviceDetail(deviceRaw: any): Promise<DeviceDetail> {
  const deviceIdObj = deviceRaw._deviceId || {};
  const serialNumber = safeString(deviceIdObj._SerialNumber) !== '-' ? safeString(deviceIdObj._SerialNumber)
    : getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.serialNumber);
  const manufacturer = safeString(deviceIdObj._Manufacturer) !== '-' ? safeString(deviceIdObj._Manufacturer)
    : getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.manufacturer);
  const model = safeString(deviceIdObj._ProductClass) !== '-' ? safeString(deviceIdObj._ProductClass)
    : getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.model);
  let tr069IP = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.tr069IP);
  if (tr069IP !== '-' && tr069IP.includes('://')) tr069IP = extractIPFromURL(tr069IP);
  const wlanConfigs = extractWLANConfigs(deviceRaw, manufacturer, model);
  const wifiClients = extractAssociatedDevices(deviceRaw, wlanConfigs);
  const allHosts = extractConnectedHosts(deviceRaw);
  const allConnectedDevices: ConnectedHost[] = [...wifiClients];
  for (const host of allHosts) {
    if (host.active && !allConnectedDevices.find(d => d.macAddress.toLowerCase() === host.macAddress.toLowerCase())) {
      // Map Layer2Interface to SSID name
      let ssidMatch = '';
      if (host.layer2Interface?.includes('WLANConfiguration')) {
        const m = host.layer2Interface.match(/WLANConfiguration\.(\d+)/);
        if (m) { const idx = parseInt(m[1]); ssidMatch = wlanConfigs.find(w => w.index === idx)?.ssid || ''; }
      }
      host.interfaceType = ssidMatch || (host.interfaceType === 'Ethernet' ? 'LAN' : host.interfaceType);
      host.ssidName = ssidMatch || wlanConfigs.find(w => w.index === host.ssidIndex)?.ssid;
      allConnectedDevices.push(host);
    }
  }
  const isDualBand = wlanConfigs.some(w => w.band === '5GHz') && wlanConfigs.some(w => w.band === '2.4GHz');
  const tags: string[] = deviceRaw._tags || [];
  const lastInform = deviceRaw._lastInform || null;
  const status = getDeviceStatus(lastInform as string);
  const pppoeUsername = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.pppUsername);
  const pppoeIP = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.pppoeIP);
  const rxPower = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.rxPower);
  const txPower = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.txPower);
  const uptime = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.uptime);
  const macAddr = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.macAddress);
  const swVer = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.softwareVersion);
  const hwVer = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.hardwareVersion);
  const temp = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.temp);
  let voltage = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.voltage);
  // ZTE SupplyVoltage returns millivolts (e.g. 3252 = 3.252V)
  const vNum = parseFloat(voltage);
  if (!isNaN(vNum) && vNum > 100) voltage = (vNum / 1000).toFixed(3);
  const bias = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.biasCurrent);
  const lanIP = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.lanIP);
  const lanSubnet = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.lanSubnet);
  const dhcpE = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.dhcpEnabled);
  const dhcpS = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.dhcpStart);
  const dhcpEn = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.dhcpEnd);
  const dns1 = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.dns);
  const memFree = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.memoryFree);
  const memTotal = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.memoryTotal);
  let cpu = getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.cpuUsage);
  // ZTE X_ZTE-COM_CpuUsed returns "0%;1%" (core1;core2) — show max
  if (cpu && cpu.includes(';')) {
    const nums = cpu.split(';').map(s => parseFloat(s.trim().replace('%', ''))).filter(n => !isNaN(n));
    if (nums.length > 0) cpu = Math.max(...nums) + '%';
  }
  const wanConnections = extractWANConnections(deviceRaw);
  const oui = safeString(deviceIdObj._OUI);
  const ssid = wlanConfigs.length > 0 ? wlanConfigs[0].ssid : '-';
  return {
    _id: deviceRaw._id, serialNumber, manufacturer, model, oui, pppoeUsername, pppoeIP, tr069IP,
    rxPower, txPower, ponMode: getParameterValue(deviceRaw, GENIEACS_PARAMETER_PATHS.ponMode),
    uptime, status, lastInform: lastInform as string, macAddress: macAddr,
    softwareVersion: swVer, hardwareVersion: hwVer, temp, voltage, biasCurrent: bias,
    lanIP, lanSubnet, dhcpEnabled: dhcpE, dhcpStart: dhcpS, dhcpEnd: dhcpEn, dns1,
    memoryFree: memFree, memoryTotal: memTotal, cpuUsage: cpu,
    wlanConfigs, wanConnections, connectedDevices: allConnectedDevices,
    totalConnected: allConnectedDevices.length, isDualBand, tags, ssid,
  };
}

export function getAllProjectionPaths(): string[] {
  const allPaths = new Set<string>(['_id','_lastInform','_tags','_deviceId']);
  for (const key in GENIEACS_PARAMETER_PATHS) {
    const paths = (GENIEACS_PARAMETER_PATHS as any)[key];
    if (Array.isArray(paths)) paths.forEach((p: string) => allPaths.add(p));
  }
  return Array.from(allPaths);
}
