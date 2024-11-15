import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { initializeDatabase } from '@/lib/db';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Firma Yönetim Sistemi',
  description: 'Ürün ve Talep Yönetimi',
};

// Veritabanını başlat
if (typeof window !== 'undefined') {
  initializeDatabase();
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}