import type { ReactNode } from 'react';
import { FirebaseProviderWrapper } from '@/components/admin/firebase-provider-wrapper';

/**
 * Root client-hub layout — provides Firebase context to all hub routes.
 * The login/register pages live directly here (public); authenticated pages
 * are nested under (protected)/ which adds the HubGuard.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
  return <FirebaseProviderWrapper>{children}</FirebaseProviderWrapper>;
}
