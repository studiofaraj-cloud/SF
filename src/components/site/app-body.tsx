'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site/site-header';
import type { HeaderRating } from '@/components/site/mobile-menu';
import { SiteFooter } from '@/components/site/site-footer';

export function AppBody({ children, rating = null }: { children: ReactNode; rating?: HeaderRating }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  // The client hub is an authenticated app area — it uses its own chrome,
  // not the public marketing header/footer.
  const isHubRoute = /^\/(?:it|en)\/hub(?:\/|$)/.test(pathname);
  const hideSiteChrome = isAdminRoute || isHubRoute;

  return (
    <>
      {!hideSiteChrome && <SiteHeader rating={rating} />}
      <div className="transition-opacity duration-300 ease-in-out">
        {children}
      </div>
      {!hideSiteChrome && <SiteFooter />}
    </>
  );
}
