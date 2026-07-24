import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '@/app/api/settings/genieacs/route';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    const body = await request.json();
    const { wlanIndex, ssid, password, securityMode, enabled } = body;
    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 });
    const { host, username, password: pwd } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${pwd}`).toString('base64');
    const tasks = [];
    if (ssid) {
      tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.SSID`, ssid]] });
    }
    if (password && securityMode !== 'None') {
      tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.PreSharedKey.1.KeyPassphrase`, password]] });
    }
    if (enabled !== undefined) {
      tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.Enable`, enabled ? '1' : '0']] });
    }
    if (securityMode) {
      if (securityMode === 'None') {
        tasks.push({ name: 'setParameterValues', device: deviceId, parameterValues: [[`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.Enable`, '1']] });
      }
    }
    const results = [];
    for (const task of tasks) {
      const res = await fetch(`${host}/tasks`, {
        method: 'POST', headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(task),
      });
      const data = await res.json();
      results.push(data);
    }
    return NextResponse.json({ success: true, tasks: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
