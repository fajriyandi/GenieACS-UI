# GenieACS UI

Dashboard web untuk manage perangkat ONT/router via GenieACS NBI.

## Tech Stack

- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS 4** (styling)
- **lucide-react** (icons)
- **sweetalert2** (notifikasi)
- **MariaDB/MySQL** (db via mysql2)
- **Docker** (deployment)

## Fitur

- **Auth** — login/logout session cookie, role admin & operator
- **API Key** — generate/revoke, guard middleware SHA256, format `ga_` + 48 hex
- **Device** — list pagination + search + filter online/offline, detail tab (Info/Optical/WAN/WiFi/Clients)
- **WiFi** — edit per SSID
- **WAN** — add/edit/delete
- **Reboot & Refresh** — langsung dari UI
- **Parameter Mapping** — manage parameter path untuk device
- **Vendor Mapping** — rule deteksi vendor dari OUI
- **Users** — admin CRUD operator
- **API Docs** — interactive documentation

## Deploy — Docker (recommended)

Prasarat: **Docker**, **docker compose**, akses network ke GenieACS NBI.

### 1. Clone & masuk

```bash
git clone https://github.com/fajriyandi/genieacs-ui.git
cd genieacs-ui
```

### 2. Start semua service

```bash
docker compose up -d db
sleep 5

docker compose run --rm migrate
docker compose run --rm seed

docker compose up -d app
```

Atau satu baris:

```bash
docker compose up -d db && sleep 5 && docker compose run --rm migrate && docker compose run --rm seed && docker compose up -d app
```

### 3. Akses

```
http://<ip-server>:3000
```

Login: **admin** / **admin**

### 4. Konfigurasi NBI

Masuk → Settings → isi:

| Field | Contoh |
|-------|--------|
| NBI Host | `http://host.docker.internal:7557` atau IP langsung |
| NBI User | `admin` |
| NBI Password | `***` |

> `host.docker.internal` resolve ke host dari container. Atau bisa pake IP langsung kalo di jaringan sama.

### Service tersedia

| Service | Fungsi |
|---------|--------|
| `app` | Web UI port 3000 |
| `db` | MariaDB 11 |
| `migrate` | Migrasi tabel (one-shot) |
| `seed` | Seed default admin + parameter (one-shot) |

### Reset semua

```bash
docker compose down -v
```

Volume `db_data` ikut kehapus — database fresh.

## Deploy — manual (tanpa Docker)

### Prasyarat

- Node.js 18+, MariaDB/MySQL
- GenieACS NBI accessible

### Instalasi

```bash
npm install
```

Buat database:

```sql
CREATE DATABASE IF NOT EXISTS GenieACS;
```

Migrasi & seed:

```bash
npm run migrate
npm run seed
```

### Konfigurasi

Copy `.env.example` ke `.env`:

```env
DB_HOST=localhost
DB_USER=GenieACS
DB_PASSWORD=GenieACS
DB_NAME=GenieACS
```

### Dev

```bash
npm run dev
```

Akses `http://localhost:3000` — login **admin** / **admin**.

### Production build

```bash
npm run build
npm start
```

> **PENTING**: `next start` bind ke `localhost` secara default. Biar bisa diakses dari IP lain, jalankan:
> ```bash
> npx next start -H 0.0.0.0
> ```
> Atau set env `HOST=0.0.0.0`.

## API Reference

Semua endpoint (kecuali login) perlu **session cookie** atau **Authorization: Bearer**.

Generate key dari **Settings → API Keys**.

```bash
# Device list
curl -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices?page=1&limit=50"

# Device detail
curl -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[id]/detail"

# Update WiFi
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"wlanIndex":1,"ssid":"MyWiFi","password":"secret","securityMode":"WPA2-PSK","enabled":true}' \
  "http://localhost:3000/api/genieacs/devices/[id]/wifi"

# Edit WAN
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"action":"edit","connectionType":"PPPoE","username":"user","password":"pass","vlanId":"10"}' \
  "http://localhost:3000/api/genieacs/devices/[id]/wan"

# Delete WAN
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"action":"delete","path":"InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1"}' \
  "http://localhost:3000/api/genieacs/devices/[id]/wan"

# Reboot
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[id]/reboot"

# Refresh
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/settings/genieacs/devices/[id]/refresh"

# Connection request
curl -X POST -H "Authorization: Bearer ga_xxx..." \
  "http://localhost:3000/api/genieacs/devices/[id]/connection-request"
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
│   ├── login/                 # Login page
│   └── middleware.ts          # Auth guard
├── lib/
│   ├── genieacs.ts            # NBI helpers
│   ├── auth.ts                # Password hashing, session
│   ├── cache.ts               # In-memory cache
│   └── db.ts                  # MySQL pool
└── scripts/
    ├── migrate.mjs            # Migration
    └── seed.mjs               # Seed data
```
