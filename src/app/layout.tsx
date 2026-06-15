import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

const notoSansBengali = Noto_Sans_Bengali({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ইনতিফাদাহ — কর্যে হাসানাঃ',
  description: 'সুদমুক্ত আর্থিক সহযোগিতা প্ল্যাটফর্ম — দান, সঞ্চয় ও ঋণ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ইনতিফাদাহ',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#DD1D66',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={notoSansBengali.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
