import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { fontVariables } from './fonts';

/**
 * The <html>/<head>/<body> shell shared by all three root layouts.
 *
 * Next.js requires <html> and <body> to come from a root layout, and a tree can
 * only have one. This app has three separate trees — [locale], admin and c —
 * because each needs its own `lang` and its own providers. Previously a single
 * app/layout.tsx served all of them, which forced `lang` to a hardcoded constant
 * and meant every /en page shipped `lang="it"` to crawlers, contradicting its own
 * hreflang annotations. Each tree now owns its root layout and passes the correct
 * `lang` here.
 */

export const sharedViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

export function RootHtml({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
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
        {/* Search engine ownership verification. Both omitted until the env vars
            are set, so no empty verification tags ship. Paste the token value
            only — not the whole <meta> tag Google/Bing show you. */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        {process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && (
          <meta
            name="msvalidate.01"
            content={process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION}
          />
        )}
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        {children}
      </body>
    </html>
  );
}
