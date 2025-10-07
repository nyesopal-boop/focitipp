import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'TippMix Akadémia - Fogadási Tippek és Statisztikák',
  description: 'Szerezzen megbízható forrásból érkező fogadási tippeket és egymás elleni statisztikákat labdarúgó mérkőzésekre',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}