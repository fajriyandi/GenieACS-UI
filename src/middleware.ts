import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/api/auth/login', '/api/auth/me', '/api/auth/validate-key'];
const BASE = 'http://localhost:3000';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // API routes: cek API Key via internal endpoint
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('Authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (match) {
      try {
        const res = await fetch(`${BASE}/api/auth/validate-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: match[1] }),
        });
        const data = await res.json();
        if (data.valid) return NextResponse.next();
      } catch {}
    }

    // Fallback ke session cookie
    const token = request.cookies.get('session_token')?.value;
    if (token) {
      try {
        const res = await fetch(`${BASE}/api/auth/me`, {
          headers: { Cookie: `session_token=${token}` },
        });
        const data = await res.json();
        if (data.authenticated) return NextResponse.next();
      } catch {}
    }

    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Non-API routes — session cookie wajib
  const token = request.cookies.get('session_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Cookie: `session_token=${token}` },
    });
    const data = await res.json();
    if (!data.authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
