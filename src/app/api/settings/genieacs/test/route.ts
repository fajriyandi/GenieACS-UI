import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { host, username, password } = await request.json();
    if (!host) return NextResponse.json({ success: false, error: 'Host required' }, { status: 400 });
    const authHeader = 'Basic ' + Buffer.from(`${username || 'admin'}:${password || ''}`).toString('base64');
    const res = await fetch(`${host}/devices?limit=1`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const total = res.headers.get('total') || '0';
    return NextResponse.json({ success: true, deviceCount: parseInt(total) || 0 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
