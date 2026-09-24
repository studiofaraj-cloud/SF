'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';

export function AppBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  // The client hub is an authenticated app area — it uses its own chrome,
  // not the public marketing header/footer.
  const isHubRoute = /^\/(?:it|en)\/hub(?:\/|$)/.test(pathname);
  const hideSiteChrome = isAdminRoute || isHubRoute;

  return (
    <>
      {!hideSiteChrome && <SiteHeader />}
      <div className="transition-opacity duration-300 ease-in-out">
        {children}
      </div>
      {!hideSiteChrome && <SiteFooter />}
    </>
  );
}
