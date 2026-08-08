import type { ReactNode } from 'react';
import { RootHtml, sharedViewport } from '../root-html';
import { defaultLocale } from '@/i18n/config';

/**
 * Root layout for public company profiles served at the bare `/{slug}` URL
 * (rewritten to /c/{slug} by middleware).
 *
 * `lang` is the default locale. Profiles can be English — `inferProfileLang()`
 * already detects that from the taxId country and the page uses it for metadata —
 * but deriving it here would mean fetching the profile a third time per request
 * (getCompanyProfileBySlug is not memoized, and this route is force-dynamic).
 * Not worth an extra Firestore read for one attribute; this matches the previous
 * behaviour exactly, where every profile shipped lang="it".
 */
export const viewport = sharedViewport;

export default function CompanyProfileRootLayout({ children }: { children: ReactNode }) {
  return <RootHtml lang={defaultLocale}>{children}</RootHtml>;
}
