import { ReactNode } from 'react';
import type { Viewport } from 'next';
import "@/app/globals.css";

import { Poppins, Lora, Tomorrow } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';
import { cn } from "@/lib/utils";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

// Primary UI font — geometric, modern, very readable
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

// Elegant serif — used for review quote text and pull-quotes
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
  preload: false, // non-critical, load after body font
  adjustFontFallback: true,
});

// Brand / heading accent — keep existing
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
    <html lang={defaultLocale} className={`${poppins.variable} ${lora.variable} ${tomorrow.variable}`} suppressHydrationWarning>
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
        {/* PWA meta (theme-color + viewport are handled by the exported `viewport` object) */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/assets/android-chrome-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Studio Faraj" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
