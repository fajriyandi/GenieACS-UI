export interface GenieACSDevice {
  _id: string; serialNumber: string; manufacturer: string; model: string;
  pppoeUsername: string; pppoeIP: string; tr069IP: string; rxPower: string;
  ponMode: string; uptime: string; status: string; lastInform: string | null; ssid?: string;
}

export interface WLANConfig {
  index: number; ssid: string; enabled: boolean; channel: string;
  security: string; password: string; band: string; totalAssociations: number;
}

export interface ConnectedHost {
  hostName: string; ipAddress: string; macAddress: string;
  interfaceType: string; active: boolean; layer2Interface: string;
  ssidIndex: number; rssi?: number; mode?: string; ssidName?: string;
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
  softwareVersion: string; hardwareVersion: string; temp: string; voltage: string;
  biasCurrent: string; lanIP: string; lanSubnet: string; dhcpEnabled: string;
  dhcpStart: string; dhcpEnd: string; dns1: string; memoryFree: string; memoryTotal: string;
  cpuUsage: string; wlanConfigs: WLANConfig[]; wanConnections?: WANConnection[];
  connectedDevices: ConnectedHost[]; totalConnected: number; isDualBand: boolean; tags: string[];
}
