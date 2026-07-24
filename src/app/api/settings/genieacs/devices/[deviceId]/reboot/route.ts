import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '../../../route';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    if (!deviceId) return NextResponse.json({ success: false, error: 'Device ID required' }, { status: 400 });

    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const res = await fetch(`${host}/devices/${encodeURIComponent(deviceId)}/tasks?connection_request`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: 'reboot' }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('GenieACS reboot error:', err);
      return NextResponse.json({ success: false, error: `Failed: ${res.status}` }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Reboot task sent', deviceId });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
