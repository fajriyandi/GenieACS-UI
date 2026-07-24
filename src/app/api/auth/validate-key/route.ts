import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false });
    }

    const hashed = crypto.createHash('sha256').update(key).digest('hex');
    const row = await queryOne(
      'SELECT id FROM api_keys WHERE hashed_val = ?',
      [hashed]
    ) as any;

    if (row) {
      // Update lastUsedAt (fire-and-forget)
      const { query } = await import('@/lib/db');
      await query('UPDATE api_keys SET lastUsedAt = NOW() WHERE id = ?', [row.id]);
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false });
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e.message });
  }
}
