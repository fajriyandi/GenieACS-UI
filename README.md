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
- Parameter mappings default
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

## Build & Deploy

```bash
npm run build
npm start
```

Atau pake PM2:

```bash
npm i -g pm2
pm2 start npm --name genieacs-ui -- start
pm2 save
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name genieacs.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Struktur

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Login, me, users (CRUD)
│   │   └── settings/genieacs/ # NBI proxy, devices, parameters
│   ├── devices/               # Device list & detail modal
│   ├── settings/              # Settings, parameters, vendors, auth, users
│   ├── tasks/                 # Task queue
│   └── middleware.ts          # Auth guard
├── lib/
│   ├── genieacs.ts            # Parameter helpers & extractors
│   ├── auth.ts                # Password hashing, session
│   ├── cache.ts               # In-memory cache
│   └── db.ts                  # MySQL pool
└── scripts/
    ├── migrate.mjs            # Migration
    └── seed.mjs               # Seed data
```
