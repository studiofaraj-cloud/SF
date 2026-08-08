
import type { ReactNode } from 'react';
import { FirebaseProviderWrapper } from '@/components/admin/firebase-provider-wrapper';
import { RootHtml, sharedViewport } from '../root-html';
import { defaultLocale } from '@/i18n/config';

/**
 * Root admin layout — owns <html>/<body> for the /admin tree, plus Firebase context.
 * The login page lives here and renders full-screen without any chrome.
 * Protected pages are nested under (protected)/layout.tsx which adds
 * the sidebar, header, and AuthGuard.
 *
 * The admin UI is Italian-only, so `lang` is the default locale rather than a
 * route param. It is noindex'd via robots.txt anyway.
 */
export const viewport = sharedViewport;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootHtml lang={defaultLocale}>
      <FirebaseProviderWrapper>
        {children}
      </FirebaseProviderWrapper>
    </RootHtml>
  );
}
