import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { config } from 'dotenv';
config();

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(salt + ':' + key.toString('hex'));
    });
  });
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'genieacs',
  waitForConnections: true,
});

async function seed() {
  const conn = await pool.getConnection();
  try {
    // Default NBI settings (placeholder)
    const [existing] = await conn.execute('SELECT id FROM genieacs_settings LIMIT 1');
    if (!existing.length) {
      await conn.execute(
        `INSERT INTO genieacs_settings (host, username, password, isActive) VALUES (?, ?, ?, 1)`,
        ['127.0.0.1:7557', 'nbi', '']
      );
      console.log('Seeded: placeholder NBI settings (configure via UI)');
    }

    // Default parameter mappings
    const [pm] = await conn.execute('SELECT id FROM genieacs_parameter_mappings LIMIT 1');
    if (!pm.length) {
      const params = [
        ['pppUsername', 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username'],
        ['serialNumber', 'InternetGatewayDevice.DeviceInfo.SerialNumber'],
        ['manufacturer', 'InternetGatewayDevice.DeviceInfo.Manufacturer'],
        ['model', 'InternetGatewayDevice.DeviceInfo.ModelName,InternetGatewayDevice.DeviceInfo.ProductClass'],
        ['macAddress', 'InternetGatewayDevice.DeviceInfo.MACAddress,InternetGatewayDevice.DeviceInfo.X_ZTE-COM_MacAddress'],
        ['ip', 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.ExternalIPAddress,InternetGatewayDevice.DeviceInfo.X_ZTE-COM_ExternalIPAddress'],
        ['dns', 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.DNSServers'],
        ['uptime', 'InternetGatewayDevice.DeviceInfo.UpTime'],
        ['softwareVersion', 'InternetGatewayDevice.DeviceInfo.SoftwareVersion,InternetGatewayDevice.DeviceInfo.X_ZTE-COM_SoftwareVersion'],
        ['hardwareVersion', 'InternetGatewayDevice.DeviceInfo.HardwareVersion,InternetGatewayDevice.DeviceInfo.AdditionalHardwareVersion'],
        ['ponMode', 'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.PONMode,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.PONMode'],
        ['rxPower', 'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverRxPower,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverRxPower'],
        ['txPower', 'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverTxPower,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverTxPower'],
        ['temp', 'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverTemperature,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverTemperature'],
        ['voltage', 'InternetGatewayDevice.WANDevice.1.X_GponInterafceConfig.TransceiverVoltage,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverSupplyVoltage,InternetGatewayDevice.WANDevice.1.X_ZTE-COM_WANPONInterfaceConfig.TransceiverVoltage'],
        ['cpuUsage', 'InternetGatewayDevice.DeviceInfo.ProcessStatus.CPUUsage,InternetGatewayDevice.DeviceInfo.X_ZTE-COM_CpuUsed'],
        ['memoryFree', 'InternetGatewayDevice.DeviceInfo.MemoryStatus.Free,InternetGatewayDevice.DeviceInfo.X_ZTE-COM_MemUsed'],
      ];
      const sql = 'INSERT INTO genieacs_parameter_mappings (paramKey, paths) VALUES (?, ?)';
      for (const [name, pathList] of params) {
        const pathsJson = JSON.stringify(pathList.split(','));
        await conn.execute(sql, [name, pathsJson]);
      }
      console.log(`Seeded: ${params.length} parameter mappings`);
    }

    // Default admin user
    const [existingUser] = await conn.execute('SELECT id FROM users LIMIT 1');
    if (!existingUser.length) {
      const pwHash = await hashPassword('admin');
      await conn.execute(
        'INSERT INTO users (username, password_hash, display_name, role, isActive) VALUES (?, ?, ?, ?, 1)',
        ['admin', pwHash, 'Administrator', 'admin']
      );
      console.log('Seeded: default admin user (admin / admin)');
    }

    console.log('Seed complete');
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(e => { console.error(e); process.exit(1); });
