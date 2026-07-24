# GenieACS UI

Dashboard web untuk manage perangkat ONT/router via GenieACS NBI.

## Tech Stack

- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS 4** (styling)
- **lucide-react** (icons)
- **sweetalert2** (notifikasi)
- **MariaDB/MySQL** (db via mysql2)

## Prasyarat

- Node.js 18+
- MariaDB/MySQL
- GenieACS NBI (HTTP, port 7557)

## Instalasi

```bash
npm install
```

## Konfigurasi

Copy `.env.example` ke `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=GenieACS
DB_PASSWORD=GenieACS
DB_NAME=GenieACS
```

## Database

Buat database dulu:

```sql
CREATE DATABASE IF NOT EXISTS GenieACS;
```

Migrasi & seed otomatis:

```bash
npm run migrate
npm run seed
```

Script `migrate` bikin tabel: `genieacs_settings`, `genieacs_parameter_mappings`, `genieacs_vendor_mappings`, `api_keys`, `users`, `sessions`.

Script `seed` isi:
- Placeholder NBI settings (konfigurasi via UI)
- Parameter mappings default (17 mapping)
- User admin default: **admin** / **admin**

## Dev

```bash
npm run dev
```

Akses `http://localhost:3000` → login dengan **admin** / **admin**.

## Fitur

### Authentication & User Management
- Login/logout dengan session cookie
- Role: **admin** & **operator**
- Manage users (admin only): tambah, edit, hapus, aktif/nonaktif

### API Key Authentication
- Generate API key untuk integrasi 3rd party
- Format: `ga_` + 48 hex chars, hash SHA256 disimpan
- Header: `Authorization: Bearer <key>`
- Setiap key bisa di-revoke terpisah
- Guard otomatis di middleware untuk semua route API

### Device Management
- Daftar device TR-069 dengan pagination & search
- Filter Online/Offline (akurat, fetch all + filter di server)
- Detail device: Info → Optical → WAN → WiFi → Clients
- Tab layout dengan grid per-seksi
- Edit WiFi per SSID
- Add/Edit/Delete WAN connection
- Reboot & refresh parameters

### Caching
- In-memory cache untuk device list (TTL 1 menit)
- Cache auto-clear setelah delete

## API Reference

Semua endpoint API (kecuali login) membutuhkan autentikasi via **session cookie** atau **API Key**.

### API Key

Generate key dari menu **Settings → API Keys**, lalu kirim sebagai header:

```bash
curl -H "Authorization: Bearer ga_xxx..." http://localhost:3000/api/settings/genieacs/devices?limit=5
```

### Device List

```bash
curl -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices?page=1&limit=50&status=online"
```

### Device Detail

```bash
curl -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[deviceId]/detail"
```

### Update WiFi

```bash
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "wlanIndex": 1,
    "ssid": "MyWiFi",
    "password": "secret123",
    "securityMode": "WPA2-PSK",
    "enabled": true
  }' \
  "http://localhost:3000/api/genieacs/devices/[deviceId]/wifi"
```

### Manage WAN

```bash
# Edit WAN
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "edit",
    "connectionType": "PPPoE",
    "username": "user@isp.net",
    "password": "pass123",
    "vlanId": "10"
  }' \
  "http://localhost:3000/api/genieacs/devices/[deviceId]/wan"

# Delete WAN
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"action": "delete", "path": "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1"}' \
  "http://localhost:3000/api/genieacs/devices/[deviceId]/wan"
```

### Reboot Device

```bash
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[deviceId]/reboot"
```

### Refresh Parameters

```bash
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[deviceId]/refresh"
```

### Connection Request

```bash
curl -X POST \
  -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/genieacs/devices/[deviceId]/connection-request"
```

### User Management (admin only)

```bash
# Daftar users
curl -H "Cookie: session_token=..." \
  "http://localhost:3000/api/auth/users"

# Tambah user
curl -X POST \
  -H "Cookie: session_token=..." \
  -H "Content-Type: application/json" \
  -d '{"username": "operator1", "password": "xxx", "displayName": "Operator", "role": "operator"}' \
  "http://localhost:3000/api/auth/users"
```

## Struktur

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Login, me, users (CRUD), validate-key
│   │   └── settings/genieacs/ # NBI proxy, devices, parameters
│   ├── devices/               # Device list & detail modal
│   ├── settings/              # Settings, parameters, vendors, auth, users
│   ├── tasks/                 # Task queue
│   ├── api-docs/              # API documentation page
│   └── middleware.ts          # Auth guard (session + API key)
├── lib/
│   ├── genieacs.ts            # Parameter helpers & extractors
│   ├── auth.ts                # Password hashing, session
│   ├── cache.ts               # In-memory cache
│   └── db.ts                  # MySQL pool
└── scripts/
    ├── migrate.mjs            # Migration
    └── seed.mjs               # Seed data
```
