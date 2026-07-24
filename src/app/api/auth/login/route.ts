import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const user = await queryOne('SELECT id, username, password_hash, display_name, role, isActive FROM users WHERE username = ?', [username]) as any;
    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role },
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 jam
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
