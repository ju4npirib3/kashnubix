export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import SwRegister from '@/components/SwRegister';

export const metadata: Metadata = {
  title: 'KashNubix',
  description: 'Tu gestor financiero personal',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'KashNubix' },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <div className="min-h-screen max-w-md mx-auto relative">
                {children}
              </div>
            </AppProvider>
          </AuthProvider>
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
