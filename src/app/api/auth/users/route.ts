import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword, getSession } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  if (!token) return null;
  const session = await getSession(token);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await query('SELECT id, username, display_name, role, isActive, createdAt FROM users ORDER BY createdAt DESC') as any[];
    return NextResponse.json({ success: true, users: rows });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { username, password, displayName, role } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const existing = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, displayName || username, role || 'operator']
    ) as any;

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
