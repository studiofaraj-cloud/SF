import type { CompanyProfileDoc } from '@/lib/firestore-data';

/**
 * Completeness score 0-100 — counts how many "value-adding" sections the
 * owner has filled. Used by:
 *   - the hub landing page to show progress to the owner
 *   - the public page's metadata to gate indexing of thin profiles
 *     (`noindex` below QUALITY_GATE_PCT to protect domain SEO)
 *
 * Keep in sync if the form gains/loses sections.
 */
export function profileCompleteness(p: CompanyProfileDoc | null): number {
  if (!p) return 0;
  let filled = 0;
  const total = 10;
  if (p.companyName) filled++;
  if (p.tagline) filled++;
  if (p.description) filled++;
  if (p.logoUrl) filled++;
  if (p.heroUrl) filled++;
  if ((p.services?.length ?? 0) > 0) filled++;
  if ((p.stats?.length ?? 0) > 0) filled++;
  if ((p.pointsOfStrength?.length ?? 0) > 0) filled++;
  if (p.contact && Object.values(p.contact).some(Boolean)) filled++;
  if (p.social && Object.values(p.social).some(Boolean)) filled++;
  return Math.round((filled / total) * 100);
}

/**
 * Profiles below this completeness threshold are `noindex` on Google.
 * Protects the studiofaraj.it domain authority from being dragged down by
 * thin / template-only profiles. Owners still see the page (it works), and
 * Google re-indexes it the moment the owner crosses the threshold.
 */
export const QUALITY_GATE_PCT = 40;

/**
 * Truncate a description to a meta-description-safe length at a word boundary.
 * Google typically displays 150-160 chars before cutting mid-word. We aim for
 * ~155 then back off to the last space.
 */
export function truncateForMeta(text: string | undefined, maxLen = 155): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 50 ? sliced.slice(0, lastSpace) : sliced).trim() + '…';
}

/**
 * Heuristic: infer the language of a profile for hreflang / inLanguage signals.
 * Defaults to 'it' (our primary market). Reads `taxId.country` first since
 * that's the strongest signal: an Italian P.IVA → Italian profile content.
 */
export function inferProfileLang(p: CompanyProfileDoc | null): 'it' | 'en' {
  if (!p) return 'it';
  const country = p.taxId?.country?.toUpperCase();
  // Italian-speaking markets default to it; English defaults for UK/US/IE/AU/CA.
  if (['GB', 'IE', 'US', 'AU', 'CA', 'NZ'].includes(country ?? '')) return 'en';
  return 'it';
}
