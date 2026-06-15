import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PWAInstallPrompt } from '@/components/PWAProvider';

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

  /* Apple PWA — makes "Add to Home Screen" behave as app, not bookmark */
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ইনতিফাদাহ',
    startupImage: [
      { url: '/icon', media: '(device-width: 390px) and (device-height: 844px)' },
    ],
  },

  /* Chrome / Android — icon auto-discovery */
  icons: {
    icon: [
      { url: '/icon', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon',
  },

  /* Open Graph (nice when sharing) */
  openGraph: {
    title: 'ইনতিফাদাহ — কর্যে হাসানাঃ',
    description: 'সুদমুক্ত আর্থিক সহযোগিতা প্ল্যাটফর্ম',
    type: 'website',
  },
};

export const viewport: Viewport = {
  /* Matches manifest theme_color */
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#c01155' },
    { media: '(prefers-color-scheme: dark)',  color: '#c01155' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,      /* allow pinch-zoom for accessibility */
  userScalable: true,
  viewportFit: 'cover', /* fills the safe area on notched phones */
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={notoSansBengali.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Tells iOS Safari this is a full-screen web app */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="ইনতিফাদাহ" />

        {/* Splash screen color on Android */}
        <meta name="msapplication-TileColor" content="#c01155" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}

            {/* PWA install banner — shown after 4s if not already installed */}
            <PWAInstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
