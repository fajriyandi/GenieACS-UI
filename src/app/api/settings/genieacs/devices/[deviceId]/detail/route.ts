import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '../../../route';
import { mapDeviceDetail, getAllProjectionPaths } from '@/lib/genieacs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const projection = getAllProjectionPaths();
    const tr069Paths = [
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.Hosts.Host',
      'InternetGatewayDevice.WANDevice',
      'InternetGatewayDevice.DeviceInfo',
      'InternetGatewayDevice.LANDevice.1.LANHostConfigManagement',
      'InternetGatewayDevice.ManagementServer',
    ];
    const projParam = encodeURIComponent([...new Set([
      '_id', '_deviceId', '_lastInform', '_tags',
      ...projection.filter(p => p.startsWith('VirtualParameters.')),
      ...tr069Paths,
    ])].join(','));
    const query = JSON.stringify({ _id: deviceId });
    const res = await fetch(`${host}/devices?query=${encodeURIComponent(query)}&projection=${projParam}`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`GenieACS returned ${res.status}`);
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
    const detail = await mapDeviceDetail(arr[0]);
    return NextResponse.json({ success: true, device: detail });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
