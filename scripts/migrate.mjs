import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'genieacs',
  waitForConnections: true,
});

async function migrate() {
  const conn = await pool.getConnection();
  try {
    // Settings
    await conn.execute(`CREATE TABLE IF NOT EXISTS genieacs_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      host VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      password TEXT,
      isActive TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // Parameter mappings
    await conn.execute(`CREATE TABLE IF NOT EXISTS genieacs_parameter_mappings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      param_name VARCHAR(255) NOT NULL UNIQUE,
      param_paths TEXT NOT NULL,
      param_unit VARCHAR(50) DEFAULT NULL,
      is_virtual TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // Vendor mappings
    await conn.execute(`CREATE TABLE IF NOT EXISTS genieacs_vendor_mappings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      oui VARCHAR(10) NOT NULL,
      manufacturer VARCHAR(255) NOT NULL,
      model VARCHAR(255) DEFAULT NULL,
      path_overrides TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Migration complete');
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate().catch(e => { console.error(e); process.exit(1); });
