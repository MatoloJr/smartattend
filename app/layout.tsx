import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider } from '@/contexts/ThemeContext'; // We'll keep this for now to avoid breaking changes
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartAttend - QR-Based Attendance System',
  description: 'Modern QR-based attendance management system for educational institutions',
  manifest: '/manifest.json',
  icons: {
    icon: '/smartattend.png',
    shortcut: '/smartattend.png',
    apple: '/smartattend.png',
  },
  other: {
    'mobile-web-app-capable': 'yes'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartAttend',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}