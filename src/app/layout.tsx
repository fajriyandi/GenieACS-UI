'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata tidak bisa di client component, pindahkan ke metadata.ts
// export const metadata: Metadata = {
//   title: "GenieACS Manager",
//   description: "TR-069 Device Management",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        {!isLoginPage && <Navbar />}
        <main className={`flex-grow ${!isLoginPage ? 'pt-16' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
