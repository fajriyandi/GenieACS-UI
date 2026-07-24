import { NextRequest, NextResponse } from 'next/server';
import { getGenieACSCredentials } from '../../../route';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params;
    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const res = await fetch(`${host}/devices/${encodeURIComponent(deviceId)}/connectionRequest`, {
      method: 'POST', headers: { Authorization: authHeader },
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
