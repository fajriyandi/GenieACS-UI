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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { username, password, displayName, role, isActive } = await request.json();
    const user = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const updates: string[] = [];
    const values: any[] = [];

    if (username !== undefined) { updates.push('username = ?'); values.push(username); }
    if (displayName !== undefined) { updates.push('display_name = ?'); values.push(displayName); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (isActive !== undefined) { updates.push('isActive = ?'); values.push(isActive ? 1 : 0); }
    if (password) {
      const pwHash = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(pwHash);
    }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No changes' }, { status: 400 });

    values.push(id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    if (id === String(admin.user_id)) {
      return NextResponse.json({ success: false, error: 'Tidak bisa menghapus diri sendiri' }, { status: 400 });
    }
    await query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
