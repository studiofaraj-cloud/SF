'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { usePreloadMessages } from '@/hooks/use-preload-messages';

export function AppBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Preload all locale messages in the background for smooth language switching
  // This runs silently in the background and doesn't block rendering
  usePreloadMessages();

  return (
    <>
      {!isAdminRoute && <SiteHeader />}
      <div className="transition-opacity duration-300 ease-in-out">
        {children}
      </div>
      {!isAdminRoute && <SiteFooter />}
    </>
  );
}
