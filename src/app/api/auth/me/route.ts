import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) return NextResponse.json({ authenticated: false });

    const session = await getSession(token);
    if (!session) return NextResponse.json({ authenticated: false });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user_id,
        username: session.username,
        displayName: session.display_name,
        role: session.role,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
