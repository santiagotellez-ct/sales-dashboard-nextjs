import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Sales Dashboard V2 — Colombia Tech Week',
  description: 'Dashboard en vivo de ventas para AI Summit 2026 y CTW 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
