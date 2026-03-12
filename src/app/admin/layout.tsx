
import type { ReactNode } from 'react';
import { FirebaseProviderWrapper } from '@/components/admin/firebase-provider-wrapper';

/**
 * Root admin layout — minimal, just Firebase context.
 * The login page lives here and renders full-screen without any chrome.
 * Protected pages are nested under (protected)/layout.tsx which adds
 * the sidebar, header, and AuthGuard.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseProviderWrapper>
      {children}
    </FirebaseProviderWrapper>
  );
}
