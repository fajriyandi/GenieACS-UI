'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Logout!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        const d = await res.json();
        if (d.success) {
          router.push('/login');
        } else {
          Swal.fire('Error', d.error || 'Logout gagal', 'error');
        }
      }
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-black text-zinc-800 dark:text-white">GenieACS</h1>
            <p className="ml-4 text-xs text-zinc-500 dark:text-zinc-400">
              Developed by <Link href="https://github.com/fajriyandi" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Fajri Yandi</Link>
            </p>
          </div>
          <div className="flex items-center">
            <button onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}