import { ReactNode } from 'react';
import "@/app/globals.css";
import { Inter, Tomorrow } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const tomorrow = Tomorrow({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-tomorrow',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

// Root layout must have <html> and <body> tags per Next.js requirements
// The locale-specific content is handled in [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} className={`${inter.variable} ${tomorrow.variable}`} suppressHydrationWarning>
      <head>
        {/* DNS prefetch and preconnect for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicons */}
        <link rel="icon" href="/assets/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Theme & PWA meta */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/assets/android-chrome-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Studio Faraj" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
