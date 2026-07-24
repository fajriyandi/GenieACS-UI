import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || 'genieacs-ui-enc-key-32bytes!!';
  return Buffer.from(key.padEnd(32, 'x').slice(0, 32));
}
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function getGenieACSCredentials(): Promise<{ host: string; username: string; password: string } | null> {
  try {
    const row = await queryOne('SELECT * FROM genieacs_settings WHERE isActive = 1 LIMIT 1') as any;
    if (row && row.host && row.username && row.password) {
      return { host: row.host, username: row.username, password: decrypt(row.password) };
    }
  } catch {}
  return null;
}

export async function GET() {
  try {
    const row = await queryOne('SELECT * FROM genieacs_settings WHERE isActive = 1 LIMIT 1') as any;
    if (!row) return NextResponse.json({ settings: null });
    return NextResponse.json({ settings: { id: row.id, host: row.host, username: row.username, isActive: !!row.isActive, hasPassword: !!row.password } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, username, password } = body;
    if (!host || !username) return NextResponse.json({ error: 'Host and username required' }, { status: 400 });
    const existing = await queryOne('SELECT * FROM genieacs_settings WHERE isActive = 1 LIMIT 1') as any;
    if (existing) {
      if (password) {
        await query('UPDATE genieacs_settings SET host=?, username=?, password=?, isActive=1 WHERE id=?', [host, username, encrypt(password), existing.id]);
      } else {
        await query('UPDATE genieacs_settings SET host=?, username=?, isActive=1 WHERE id=?', [host, username, existing.id]);
      }
    } else {
      const id = crypto.randomUUID();
      await query('INSERT INTO genieacs_settings (id, host, username, password, isActive) VALUES (?, ?, ?, ?, 1)', [id, host, username, encrypt(password)]);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
