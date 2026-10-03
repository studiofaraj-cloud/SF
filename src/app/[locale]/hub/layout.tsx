import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { FirebaseProviderWrapper } from '@/components/admin/firebase-provider-wrapper';
import { Toaster } from '@/components/ui/toaster';

// The hub is private: its pages have nothing for a search engine (they
// redirect to the login when signed out). The login page sets its own title
// and keeps links followable; /inizia is the public page about the hub.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'Client area | Studio Faraj' : 'Area clienti | Studio Faraj',
    robots: { index: false, follow: false },
  };
}

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
