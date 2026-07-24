import * as crypto from 'crypto';
import { query, queryOne } from './db';

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 jam

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(salt + ':' + key.toString('hex'));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(derived.toString('hex') === key);
    });
  });
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_TTL);
  await query(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expires]
  );
  return token;
}

export async function getSession(token: string): Promise<any | null> {
  const row = await queryOne(
    'SELECT s.token, s.user_id, s.expires_at, u.username, u.display_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW() AND u.isActive = 1',
    [token]
  );
  return row || null;
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = ?', [token]);
}
