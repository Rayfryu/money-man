import React from 'react';
import './globals.css';

export const metadata = {
  title: 'CuanSiswa - Money Management Siswa',
  description: 'Money Management App khusus siswa kelas akhir dengan pendekatan Mobile-First.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        <div className="max-w-md mx-auto min-h-screen bg-slate-950 relative border-x border-slate-900 shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
