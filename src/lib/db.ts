import * as mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'GenieACS',
      password: process.env.DB_PASSWORD || 'GenieACS',
      database: process.env.DB_NAME || 'GenieACS',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql: string, params?: any[]) {
  const db = await getPool();
  const [rows] = await db.execute(sql, params || []);
  return rows;
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = (await query(sql, params)) as any[];
  return rows.length > 0 ? rows[0] : null;
}
