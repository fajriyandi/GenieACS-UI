'use client';

import { useState } from 'react';
import { BookOpen, ChevronLeft, Server, Key, Globe, Activity, Smartphone, Wifi, Layers, Cpu, Eye, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface ApiEndpoint {
  method: string;
  path: string;
  desc: string;
  auth: string;
  body?: string;
  response?: string;
  desc_long?: string;
  curl?: string;
}

const endpoints: { category: string; icon: any; items: ApiEndpoint[] }[] = [
  {
    category: 'Authentication', icon: Key,
    items: [
      { method: 'POST', path: '/api/auth/login', desc: 'Login user', auth: 'No',
        body: `{ "username": "admin", "password": "admin" }`,
        response: `{ "success": true, "user": { "id": 1, "username": "admin", "displayName": "Administrator", "role": "admin" } }` },
      { method: 'GET', path: '/api/auth/me', desc: 'Cek session saat ini', auth: 'Cookie',
        response: `{ "authenticated": true, "user": { ... } }` },
      { method: 'POST', path: '/api/auth/logout', desc: 'Logout', auth: 'Cookie',
        response: `{ "success": true }` },
      { method: 'GET', path: '/api/auth/users', desc: 'Daftar semua user (admin only)', auth: 'Cookie+Admin',
        response: `{ "success": true, "users": [...] }` },
      { method: 'POST', path: '/api/auth/users', desc: 'Tambah user baru (admin only)', auth: 'Cookie+Admin',
        body: `{ "username": "operator1", "password": "xxx", "displayName": "Operator", "role": "operator" }` },
      { method: 'PATCH', path: '/api/auth/users/[id]', desc: 'Edit user (admin only)', auth: 'Cookie+Admin' },
      { method: 'DELETE', path: '/api/auth/users/[id]', desc: 'Hapus user (admin only)', auth: 'Cookie+Admin' },
    ]
  },
  {
    category: 'API Keys', icon: Key,
    items: [
      { method: 'GET', path: '/api/settings/auth/keys', desc: 'Daftar API key (semua)', auth: 'Cookie',
        response: `{ "success": true, "keys": [{ "id": "...", "name": "...", "key": "ga_xxx...", "createdAt": "...", "lastUsedAt": null }] }` },
      { method: 'POST', path: '/api/settings/auth/keys', desc: 'Buat API key baru', auth: 'Cookie',
        body: `{ "name": "Monitoring Bot" }`,
        response: `{ "success": true, "id": "...", "key": "ga_<48_hex>", "name": "Monitoring Bot" }` },
      { method: 'DELETE', path: '/api/settings/auth/keys/[id]', desc: 'Revoke API key', auth: 'Cookie' },
    ]
  },
  {
    category: 'GenieACS NBI Proxy', icon: Server,
    items: [
      { method: 'GET', path: '/api/settings/genieacs', desc: 'Ambil settings NBI', auth: 'Cookie',
        response: `{ "settings": { "id": 1, "host": "http://...", "username": "admin", "isActive": true } }` },
      { method: 'POST', path: '/api/settings/genieacs', desc: 'Simpan settings NBI', auth: 'Cookie',
        body: `{ "host": "http://192.168.1.1:7557", "username": "admin", "password": "xxx" }` },
      { method: 'POST', path: '/api/settings/genieacs/test', desc: 'Test koneksi NBI', auth: 'Cookie' },
    ]
  },
  {
    category: 'Devices', icon: Globe,
    items: [
      { method: 'GET', path: '/api/settings/genieacs/devices', desc: 'Daftar device (pagination + filter)', auth: 'Cookie',
        desc_long: 'Support query params: page, limit, search, status (online/offline), no_cache=1',
        response: `{ "success": true, "devices": [...], "total": 682, "page": 1, "limit": 50, "statistics": { "total": 682, "online": 630, "offline": 52 } }`,
        curl: 'curl -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices?limit=5"' },
      { method: 'DELETE', path: '/api/settings/genieacs/devices/[id]', desc: 'Hapus device dari GenieACS', auth: 'Cookie' },
      { method: 'GET', path: '/api/settings/genieacs/devices/[id]/detail', desc: 'Detail device (WiFi, WAN, clients, optical)', auth: 'Cookie' },
      { method: 'POST', path: '/api/settings/genieacs/devices/[id]/reboot', desc: 'Reboot device', auth: 'Cookie',
        curl: 'curl -X POST -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices/[id]/reboot"' },
      { method: 'POST', path: '/api/settings/genieacs/devices/[id]/refresh', desc: 'Refresh parameter device', auth: 'Cookie' },
      { method: 'POST', path: '/api/genieacs/devices/[id]/connection-request', desc: 'Kirim connection request', auth: 'Cookie' },
    ]
  },
  {
    category: 'WiFi', icon: Wifi,
    items: [
      { method: 'POST', path: '/api/genieacs/devices/[id]/wifi', desc: 'Update konfigurasi WiFi', auth: 'Cookie',
        body: `{ "wlanIndex": 1, "ssid": "MyWiFi", "password": "secret123", "securityMode": "WPA2-PSK", "enabled": true }`,
        curl: 'curl -X POST -H "Authorization: Bearer ga_xxx..." -H "Content-Type: application/json" -d \'{"wlanIndex":1,"ssid":"MyWiFi","password":"secret123","enabled":true}\' "http://localhost:3000/api/genieacs/devices/[id]/wifi"' },
    ]
  },
  {
    category: 'WAN', icon: Activity,
    items: [
      { method: 'POST', path: '/api/genieacs/devices/[id]/wan', desc: 'Add/Edit/Delete WAN connection', auth: 'Cookie',
        body: `{ "action": "edit", "path": "...", "name": "INTERNET", "connectionType": "PPPoE", "username": "...", "password": "...", "vlanId": "10" }` },
    ]
  },
  {
    category: 'Tasks', icon: Layers,
    items: [
      { method: 'GET', path: '/api/genieacs/tasks', desc: 'Daftar task queue', auth: 'Cookie' },
      { method: 'GET', path: '/api/genieacs/tasks/[id]', desc: 'Detail task', auth: 'Cookie' },
      { method: 'POST', path: '/api/genieacs/tasks/[id]/retry', desc: 'Retry task gagal', auth: 'Cookie' },
    ]
  },
  {
    category: 'Settings (Parameters & Vendors)', icon: Cpu,
    items: [
      { method: 'GET', path: '/api/settings/genieacs/parameters', desc: 'Ambil parameter mappings', auth: 'Cookie' },
      { method: 'POST', path: '/api/settings/genieacs/parameters', desc: 'Simpan parameter mappings', auth: 'Cookie' },
      { method: 'DELETE', path: '/api/settings/genieacs/parameters', desc: 'Reset parameter mappings default', auth: 'Cookie' },
      { method: 'GET', path: '/api/settings/genieacs/vendors', desc: 'Ambil vendor mappings', auth: 'Cookie' },
      { method: 'POST', path: '/api/settings/genieacs/vendors', desc: 'Simpan vendor mappings', auth: 'Cookie' },
      { method: 'DELETE', path: '/api/settings/genieacs/vendors', desc: 'Reset vendor mappings', auth: 'Cookie' },
    ]
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-zinc-900 dark:bg-black text-white text-[9px] sm:text-[10px] leading-relaxed p-2.5 sm:p-3 rounded-xl overflow-x-auto font-mono whitespace-pre-wrap break-all border border-zinc-800">{code}</pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
      </button>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10"><BookOpen className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">API Documentation</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Endpoint referensi untuk integrasi 3rd party dan internal</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex gap-3 text-xs">
          <Key className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-zinc-800 dark:text-zinc-200">Autentikasi</p>
            <p className="text-zinc-500 mt-0.5">
              Endpoint yang butuh <strong>Cookie</strong> menggunakan session cookie dari login.
              Endpoint yang butuh <strong>Cookie+Admin</strong> hanya untuk user role admin.
              Untuk akses 3rd party, generate <Link href="/settings/auth" className="text-orange-600 hover:underline">API Key</Link> dan kirim sebagai header:
            </p>
            <div className="mt-2 space-y-1.5">
              <div className="overflow-x-auto">
                <code className="inline-block bg-white dark:bg-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-lg font-mono text-[9px] sm:text-[10px] whitespace-nowrap border border-zinc-200 dark:border-zinc-700">Authorization: Bearer &lt;api_key&gt;</code>
              </div>
              <div className="overflow-x-auto">
                <code className="inline-block bg-white dark:bg-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-lg font-mono text-[9px] sm:text-[10px] whitespace-nowrap border border-zinc-200 dark:border-zinc-700">curl -H "Authorization: Bearer ga_xxx" http://localhost:3000/api/settings/genieacs/devices</code>
              </div>
            </div>
          </div>
        </div>

        {endpoints.map((group) => (
          <div key={group.category} className="space-y-3">
            <div className="flex items-center gap-2.5 py-1">
              <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500"><group.icon className="w-4 h-4" /></div>
              <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-200">{group.category}</h2>
            </div>

            <div className="space-y-2">
              {group.items.map((ep, i) => (
                <div key={i} className="border border-zinc-200/50 dark:border-white/10 shadow-sm bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
                  <div className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600' :
                      ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600' :
                      ep.method === 'PATCH' ? 'bg-amber-500/10 text-amber-600' :
                      ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-zinc-500/10 text-zinc-600'
                    }`}>{ep.method}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-1.5">
                        <code className="text-[10px] sm:text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 break-all">{ep.path}</code>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex-shrink-0 ${
                          ep.auth === 'No' ? 'bg-zinc-500/10 text-zinc-500' :
                          ep.auth === 'Cookie' ? 'bg-orange-500/10 text-orange-600' :
                          ep.auth.includes('Admin') ? 'bg-rose-500/10 text-rose-600' :
                          'bg-zinc-500/10 text-zinc-500'
                        }`}>{ep.auth}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">{ep.desc}</p>
                      {(ep as any).desc_long && <p className="text-[10px] text-zinc-400 mt-0.5">{(ep as any).desc_long}</p>}
                      {ep.body && (
                        <div className="mt-2">
                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Request Body</p>
                          <CodeBlock code={ep.body} />
                        </div>
                      )}
                      {ep.response && (
                        <div className="mt-2">
                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Response</p>
                          <CodeBlock code={ep.response} />
                        </div>
                      )}
                      {ep.curl && (
                        <div className="mt-2">
                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Curl Example</p>
                          <CodeBlock code={ep.curl} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
