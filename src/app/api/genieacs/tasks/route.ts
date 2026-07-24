import { NextResponse } from 'next/server';
import { getGenieACSCredentials } from '@/app/api/settings/genieacs/route';

export async function GET() {
  try {
    const credentials = await getGenieACSCredentials();
    if (!credentials) return NextResponse.json({ tasks: [] });
    const { host, username, password } = credentials;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const res = await fetch(`${host}/tasks?limit=100`, { headers: { Authorization: authHeader, Accept: 'application/json' } });
    if (!res.ok) return NextResponse.json({ tasks: [], error: `HTTP ${res.status}` });
    const tasks = await res.json();
    return NextResponse.json({ success: true, tasks: Array.isArray(tasks) ? tasks : [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, tasks: [], error: e.message }, { status: 500 });
  }
}
