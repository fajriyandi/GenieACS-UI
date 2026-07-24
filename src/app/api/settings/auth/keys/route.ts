import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const rows = await query('SELECT id, name, CONCAT(LEFT(key_value, 12), \'...\', RIGHT(key_value, 4)) as key, createdAt, lastUsedAt FROM api_keys ORDER BY createdAt DESC') as any[];
    return NextResponse.json({ success: true, keys: rows });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 });
    const id = crypto.randomUUID();
    const rawKey = 'ga_' + crypto.randomBytes(24).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawKey).digest('hex');
    await query('INSERT INTO api_keys (id, name, key_value, hashed_val) VALUES (?, ?, ?, ?)', [id, name, rawKey, hashed]);
    return NextResponse.json({ success: true, id, key: rawKey, name });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
