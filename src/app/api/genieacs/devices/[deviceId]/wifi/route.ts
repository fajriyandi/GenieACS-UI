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
      tasks.push(`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.SSID`, ssid);
    }
    if (password && securityMode !== 'None') {
      tasks.push(`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.PreSharedKey.1.KeyPassphrase`, password);
    }
    if (enabled !== undefined) {
      tasks.push(`InternetGatewayDevice.LANDevice.1.WLANConfiguration.${wlanIndex}.Enable`, enabled ? '1' : '0');
    }
    if (tasks.length > 0) {
      const res = await fetch(`${host}/devices/${encodeURIComponent(deviceId)}/tasks?connection_request`, {
        method: 'POST', headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'setParameterValues',
          parameterValues: tasks.reduce((acc: any[][], _, i, arr) => {
            if (i % 2 === 0) acc.push([arr[i], arr[i+1]]);
            return acc;
          }, []),
        }),
      });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { raw: raw.substring(0,200) }; }
      return NextResponse.json({ success: res.ok, task: data });
    }
    return NextResponse.json({ success: true, message: 'No changes' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
