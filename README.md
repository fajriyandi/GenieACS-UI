# GenieACS UI

Dashboard web untuk manage perangkat ONT/router via GenieACS NBI.

## Tech Stack

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** (styling)
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
DB_USER=root
DB_PASSWORD=
DB_NAME=genieacs

# Enkripsi password settings (32 karakter, opsional — ada fallback default)
# ENCRYPTION_KEY=your-32-char-key
```

## Database

Buat database dulu:

```sql
CREATE DATABASE IF NOT EXISTS genieacs;
```

Migrasi & seed otomatis:

```bash
npm run migrate
npm run seed
```

Atau satu baris:

```bash
npm run migrate && npm run seed
```

Script `migrate` bikin tabel (`genieacs_settings`, `genieacs_parameter_mappings`, `genieacs_vendor_mappings`). Script `seed` isi default NBI settings + parameter mappings awal.

## Dev

```bash
npm run dev
```

Akses `http://localhost:3000`.

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

## API Routes

| Route | Method | Desc |
|-------|--------|------|
| `/api/genieacs` | GET/PUT | Settings NBI (host, port, user, password) |
| `/api/genieacs/parameters` | GET/POST | Parameter mappings |
| `/api/genieacs/vendors` | GET/POST/DELETE | Vendor mappings |
| `/api/genieacs/tasks` | GET | Daftar task device |
| `/api/genieacs/devices` | GET | Daftar device (pagination, filter) |
| `/api/genieacs/devices/[id]/detail` | GET | Detail device (WiFi, WAN, clients, optical) |
| `/api/genieacs/devices/[id]/reboot` | POST | Reboot device |
| `/api/genieacs/devices/[id]/refresh` | POST | Refresh parameters |
| `/api/genieacs/devices/[id]/wifi` | PUT | Update WiFi config |
| `/api/genieacs/devices/[id]/wan` | POST/PUT/DELETE | Manage WAN connection |

## Struktur

```
src/
├── app/
│   ├── api/           # API routes
│   ├── devices/       # Device list & detail
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   └── genieacs.ts    # Parameter helpers & extractors
└── scripts/
    ├── migrate.mjs    # Migration
    └── seed.mjs       # Seed data
```
