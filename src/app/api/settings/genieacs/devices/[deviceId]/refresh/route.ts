import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '../../../route';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    if (!deviceId) return NextResponse.json({ success: false, error: 'Device ID required' }, { status: 400 });

    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'GenieACS not configured' }, { status: 400 });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    // refreshObject via /devices/:id/tasks with connection_request
    const taskBody = { name: 'refreshObject', objectName: '' };
    const res = await fetch(`${host}/devices/${encodeURIComponent(deviceId)}/tasks?connection_request`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(taskBody),
    });

    if (!res.ok) {
      // fallback: getParameterValues
      const altBody = { name: 'getParameterValues', parameterNames: ['InternetGatewayDevice.', 'Device.'] };
      const altRes = await fetch(`${host}/devices/${encodeURIComponent(deviceId)}/tasks?connection_request`, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(altBody),
      });
      if (!altRes.ok) {
        const err = await altRes.text();
        console.error('GenieACS refresh error:', err);
        return NextResponse.json({ success: false, error: `Refresh task failed: ${altRes.status}` }, { status: 200 });
      }
    }

    return NextResponse.json({ success: true, message: 'Refresh task sent', deviceId });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
