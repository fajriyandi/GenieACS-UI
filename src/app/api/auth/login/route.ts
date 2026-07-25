import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ success: false, error: 'Username dan password diperlukan' }, { status: 400 });
  }

  const user = await queryOne(
    'SELECT id, password_hash, display_name, role FROM users WHERE username = ? AND isActive = 1',
    [username]
  );

  if (!user) {
    return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
  }

  // Hapus sesi lama
  await query('DELETE FROM sessions WHERE user_id = ?', [user.id]);

  // Buat sesi baru
  const token = await createSession(user.id);

  const response = NextResponse.json({
    success: true,
    user: { username, display_name: user.display_name, role: user.role },
  });

  response.cookies.set('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 jam
  });

  return response;
}
