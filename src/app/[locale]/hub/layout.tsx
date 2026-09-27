import type { ReactNode } from 'react';
import { FirebaseProviderWrapper } from '@/components/admin/firebase-provider-wrapper';
import { Toaster } from '@/components/ui/toaster';

/**
 * Root client-hub layout — provides Firebase context to all hub routes.
 * The login/register pages live directly here (public); authenticated pages
 * are nested under (protected)/ which adds the HubGuard. The hub's toasts
 * mount here; the public site has none.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseProviderWrapper>
      {children}
      <Toaster />
    </FirebaseProviderWrapper>
  );
}
