'use client';

import { useState } from 'react';
import { Loader2, Zap, Save, CheckCircle, Info, ChevronLeft, Settings2, Key, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

// Local helper to define CodeBlock for API Docs page only.
const CodeBlock = ({ code }: { code: string }) => {
  return (
    <pre className="bg-zinc-900 dark:bg-black text-white text-[9px] sm:text-[10px] leading-relaxed p-2.5 sm:p-3 rounded-xl overflow-x-auto font-mono whitespace-pre-wrap break-all border border-zinc-700 dark:border-zinc-800">
      {code}
    </pre>
  );
};

export default function ApiDocsPage() {
  const endpoints = [
    { method: 'GET', path: '/api/settings/genieacs/devices', desc: 'Daftar device (pagination + filter)', auth: 'Cookie',
      desc_long: 'Support query params: page, limit, search, status (online/offline). Default limit 50, page 1.',
      curl: `curl -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices?page=1&limit=50&status=online"`
    },
    { method: 'GET', path: '/api/settings/genieacs/devices/[deviceId]/detail', desc: 'Detail satu device', auth: 'Cookie',
      curl: `curl -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/detail"`
    },
    { method: 'GET', path: '/api/settings/genieacs/devices/[deviceId]/wan', desc: 'Daftar koneksi WAN', auth: 'Cookie' },
    { method: 'GET', path: '/api/settings/genieacs/devices/[deviceId]/wifi', desc: 'Daftar konfigurasi WiFi', auth: 'Cookie' },
    { method: 'GET', path: '/api/settings/genieacs/devices/[deviceId]/clients', desc: 'Daftar client WiFi', auth: 'Cookie' },

    { method: 'POST', path: '/api/genieacs/devices/[deviceId]/wifi', desc: 'Update konfigurasi WiFi', auth: 'Cookie',
      body: `{ "wlanIndex": 1, "ssid": "MyWiFi", "password": "secret123", "securityMode": "WPA2-PSK", "enabled": true }`,
      curl: `curl -X POST -H "Authorization: Bearer ga_xxx..." -H "Content-Type: application/json" -d '{"wlanIndex":1,"ssid":"MyWiFi","password":"secret123","enabled":true,"securityMode":"WPA2-PSK"}' "http://localhost:3000/api/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/wifi"`
    },
    { method: 'POST', path: '/api/genieacs/devices/[deviceId]/wan', desc: 'Tambah/Edit/Hapus koneksi WAN', auth: 'Cookie',
      body: `{ "action": "edit", "connectionType": "PPPoE", "username": "user", "password": "pass", "vlanId": "10", "path": "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1" }`,
      curl: `curl -X POST -H "Authorization: Bearer ga_xxx..." -H "Content-Type: application/json" -d '{"action":"edit","connectionType":"PPPoE","username":"user","password":"pass","vlanId":"10"}' "http://localhost:3000/api/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/wan"`
    },

    { method: 'POST', path: '/api/settings/genieacs/devices/[id]/reboot', desc: 'Reboot device', auth: 'Cookie',
      curl: 'curl -X POST -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/reboot"'
    },
    { method: 'POST', path: '/api/settings/genieacs/devices/[id]/refresh', desc: 'Refresh parameters', auth: 'Cookie',
      curl: 'curl -X POST -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/refresh"'
    },
    { method: 'POST', path: '/api/settings/genieacs/devices/[id]/connection-request', desc: 'Force connection request', auth: 'Cookie',
      curl: 'curl -X POST -H "Authorization: Bearer ga_xxx..." "http://localhost:3000/api/settings/genieacs/devices/2CB6C2-F670L-ZTEGDA1926C9/connection-request"'
    },

    { method: 'GET', path: '/api/settings/genieacs', desc: 'Get GenieACS NBI settings', auth: 'Cookie' },
    { method: 'POST', path: '/api/settings/genieacs', desc: 'Update GenieACS NBI settings', auth: 'Cookie',
      body: `{ "host": "http://genieacs:7557", "username": "admin", "password": "password" }`
    },
    { method: 'POST', path: '/api/settings/genieacs/test', desc: 'Test GenieACS NBI connection', auth: 'Cookie',
      body: `{ "host": "http://genieacs:7557", "username": "admin", "password": "password" }`
    },

    { method: 'GET', path: '/api/auth/me', desc: 'Cek status login', auth: 'Cookie' },
    { method: 'POST', path: '/api/auth/login', desc: 'Login', auth: 'No',
      body: `{ "username": "admin", "password": "admin" }`
    },
    { method: 'POST', path: '/api/auth/logout', desc: 'Logout', auth: 'Cookie' },
    { method: 'POST', path: '/api/auth/validate-key', desc: 'Validasi API Key', auth: 'No',
      body: `{ "key": "ga_your_api_key_here" }`
    },

    { method: 'GET', path: '/api/settings/auth/keys', desc: 'Daftar API keys (admin)', auth: 'Admin Cookie' },
    { method: 'POST', path: '/api/settings/auth/keys', desc: 'Generate API Key baru (admin)', auth: 'Admin Cookie' },
    { method: 'DELETE', path: '/api/settings/auth/keys/[id]', desc: 'Hapus API Key (admin)', auth: 'Admin Cookie' },

    { method: 'GET', path: '/api/auth/users', desc: 'Daftar users (admin)', auth: 'Admin Cookie' },
    { method: 'POST', path: '/api/auth/users', desc: 'Buat user baru (admin)', auth: 'Admin Cookie',
      body: `{ "username": "operator", "password": "password", "displayName": "Operator", "role": "operator" }`
    },
    { method: 'PATCH', path: '/api/auth/users/[id]', desc: 'Update user (admin)', auth: 'Admin Cookie',
      body: `{ "displayName": "New Name", "role": "admin", "active": true, "password": "new_password" }`
    },
    { method: 'DELETE', path: '/api/auth/users/[id]', desc: 'Hapus user (admin)', auth: 'Admin Cookie' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-955 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 transition-colors"><ChevronLeft className="w-4 h-4" /></Link>
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/10"><BookOpen className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">API Documentation</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Semua endpoint yang tersedia untuk integrasi</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {endpoints.map((ep, index) => (
            <div key={index} className="border border-zinc-200/50 dark:border-white/10 shadow-lg bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-850">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600' :
                      ep.method === 'POST' ? 'bg-orange-500/10 text-orange-600' :
                      ep.method === 'PUT' ? 'bg-indigo-500/10 text-indigo-600' :
                      ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>{ep.method}</span>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">{ep.path}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      ep.auth === 'No' ? 'bg-zinc-500/10 text-zinc-500' :
                      ep.auth === 'Cookie' ? 'bg-indigo-500/10 text-indigo-600' :
                      ep.auth.includes('Admin') ? 'bg-rose-500/10 text-rose-600' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>{ep.auth}</span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{ep.desc}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {(ep as any).desc_long && <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{(ep as any).desc_long}</p>}
                {(ep as any).body && (
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">Request Body</h4>
                    <CodeBlock code={(ep as any).body} />
                  </div>
                )}
                {(ep as any).curl && (
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">Contoh <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">curl</code></h4>
                    <CodeBlock code={(ep as any).curl} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}