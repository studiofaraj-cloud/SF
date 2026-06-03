import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCompanyProfileBySlug } from '@/lib/firestore-data';
import { getSession } from '@/lib/auth';
import { RESERVED_SLUGS, SLUG_REGEX } from '@/lib/company-slugs';
import { generateMetadata as buildSEOMetadata, siteConfig } from '@/lib/seo';
import {
  profileCompleteness,
  truncateForMeta,
  inferProfileLang,
  QUALITY_GATE_PCT,
} from '@/lib/company-profile-utils';
import {
  ProfileHero,
  DescriptionSection,
  ServicesGrid,
  StatsRow,
  PointsOfStrength,
  ContactBlock,
  SocialRow,
  TaxIdBlock,
  UnavailableProfile,
  OrganizationJsonLd,
} from '@/components/company-profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteParams = { companySlug: string };

async function loadProfile(slug: string) {
  if (RESERVED_SLUGS.has(slug) || !SLUG_REGEX.test(slug)) return null;
  return getCompanyProfileBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { companySlug } = await params;
  const profile = await loadProfile(companySlug);
  if (!profile) {
    return {
      title: 'Pagina non disponibile',
      robots: { index: false, follow: false },
    };
  }
  const url = `${siteConfig.url}/${companySlug}`;
  const title = profile.tagline
    ? `${profile.companyName} — ${profile.tagline}`
    : profile.companyName;

  // Google cuts meta description ~155 chars — truncate ourselves on a word
  // boundary so the cut is clean and ends with "…".
  const description = truncateForMeta(profile.description ?? profile.tagline);
  const image = profile.heroUrl || profile.logoUrl;

  // Quality gate: thin profiles below QUALITY_GATE_PCT completeness are
  // noindex to protect the studiofaraj.it domain authority from being dragged
  // down by template-only pages. They become indexable automatically once the
  // owner fills more sections.
  const completeness = profileCompleteness(profile);
  const thin = completeness < QUALITY_GATE_PCT;
  const lang = inferProfileLang(profile);

  const meta = buildSEOMetadata({
    title,
    description,
    image,
    url,
    type: 'profile',
    locale: lang,
    noindex: !profile.isPublished || thin,
  });
  meta.alternates = { canonical: url };
  // Backup signal to declare the page's language to crawlers — complements
  // the <html lang="..."> already set by the root layout.
  meta.other = {
    ...(meta.other ?? {}),
    'content-language': lang,
  };
  return meta;
}

export default async function CompanyProfilePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { companySlug } = await params;
  const { preview } = await searchParams;

  const profile = await loadProfile(companySlug);
  if (!profile) notFound();

  // Allow the owner (or any admin) to preview their draft (?preview=1) even
  // when unpublished.
  let isOwnerPreview = false;
  if (preview) {
    const session = await getSession();
    if (
      session?.user?.id === profile.ownerUid ||
      session?.user?.role === 'admin'
    ) {
      isOwnerPreview = true;
    }
  }

  if (!profile.isPublished && !isOwnerPreview) {
    return <UnavailableProfile companyName={profile.companyName} />;
  }

  const companyName = profile.companyName;

  return (
    <main className="bg-background text-foreground">
      <OrganizationJsonLd
        companyName={companyName}
        url={`${siteConfig.url}/${companySlug}`}
        logoUrl={profile.logoUrl}
        description={profile.description}
        social={profile.social}
        contact={profile.contact}
        taxId={profile.taxId}
        lang={inferProfileLang(profile)}
      />

      <ProfileHero
        companyName={companyName}
        tagline={profile.tagline}
        logoUrl={profile.logoUrl}
        heroUrl={profile.heroUrl}
      />

      <SocialRow social={profile.social} />

      <DescriptionSection description={profile.description} lang={inferProfileLang(profile)} />

      <ServicesGrid services={profile.services} />

      <StatsRow stats={profile.stats} />

      <PointsOfStrength points={profile.pointsOfStrength} />

      <ContactBlock contact={profile.contact} />

      <TaxIdBlock taxId={profile.taxId} show={profile.taxIdPublic ?? true} />

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>
          Pagina pubblicata tramite{' '}
          <a href="/" className="font-medium text-primary hover:underline">
            Studio Faraj
          </a>
        </p>
      </footer>
    </main>
  );
}
