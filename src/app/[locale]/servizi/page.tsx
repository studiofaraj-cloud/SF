import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import HomeCtaSection from '@/components/site/home-cta-section';
import { RevealWords } from '@/components/site/reveal-words';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataBreadcrumbList,
  generateStructuredDataCollectionPage,
  siteConfig,
} from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { SERVICES, serviceGroupsFor } from '@/lib/services-catalog';
import type { Locale } from '@/i18n/config';

/**
 * SERVICES HUB.
 *
 * This page was listed in sitemap-pages.xml at priority 0.9 for both locales but
 * never existed — Googlebot was handed two 404s at the highest priority tier in
 * the sitemap. Beyond that, the eight service pages had no parent: they were
 * siblings reachable only from the nav, which is the weakest possible internal
 * link topology for a cluster we want to rank.
 *
 * Server component: the services grouped as on the homepage (build / grow /
 * run, from lib/services-catalog), each a large index row linking to its
 * page, then the closing call to action.
 */

type Props = { params: Promise<{ locale: string }> };

const COPY = {
  it: {
    metaTitle: 'Servizi — Sviluppo Web, E-commerce e SEO',
    metaDescription:
      'Otto servizi digitali da Padova: sviluppo web su misura, e-commerce, design UI/UX, SEO, AI e automazione, hosting, manutenzione e consulenza IT.',
    badge: 'I Nostri Servizi',
    h1a: 'Servizi digitali',
    h1b: 'dallo studio a Padova.',
    intro:
      'Dal primo sito alla piattaforma su misura: progettiamo, sviluppiamo e manteniamo tutto con codice scritto da noi. Scegli il servizio che ti serve — o scrivici e lo capiamo insieme.',
    ctaTitle: 'Non sai da dove iniziare?',
    ctaBody: 'Raccontaci il progetto: ti rispondiamo con una proposta concreta e un preventivo gratuito.',
    ctaButton: 'Parliamone',
    keywords: [
      'servizi sviluppo web', 'agenzia web Padova', 'servizi digitali aziende',
      'realizzazione siti web', 'e-commerce su misura', 'consulenza SEO',
      'manutenzione sito web', 'hosting gestito', 'automazione AI aziende',
    ],
  },
  en: {
    metaTitle: 'Services — Web Development, E-commerce and SEO',
    metaDescription:
      'Eight digital services from Padova, Italy: custom web development, e-commerce, UI/UX design, SEO, AI automation, hosting, maintenance and IT consulting.',
    badge: 'Our Services',
    h1a: 'Digital services',
    h1b: 'from our studio in Padova.',
    intro:
      'From a first website to a bespoke platform: we design, build and maintain everything with code we write ourselves. Pick the service you need — or tell us the problem and we will work it out together.',
    ctaTitle: 'Not sure where to start?',
    ctaBody: 'Tell us about the project and we will come back with a concrete proposal and a free quote.',
    ctaButton: "Let's talk",
    keywords: [
      'web development services', 'web agency Italy', 'digital services for business',
      'custom websites', 'custom e-commerce', 'SEO consulting',
      'website maintenance', 'managed hosting', 'AI automation for business',
    ],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  const copy = COPY[lang];

  return generateSEOMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: [...copy.keywords],
    url: `${siteConfig.url}/${lang}/servizi`,
    locale: lang,
    alternateUrls: {
      it: `${siteConfig.url}/it/servizi`,
      en: `${siteConfig.url}/en/servizi`,
    },
  });
}

export default async function ServicesHubPage({ params }: Props) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);

  const copy = COPY[lang];
  const groups = serviceGroupsFor(lang);
  const items = groups.flatMap((g) => g.services).map((slug) => ({
    name: SERVICES[slug].name[lang],
    url: `${siteConfig.url}/${lang}/servizi/${slug}`,
  }));

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/${lang}` },
      { name: copy.badge, url: `${siteConfig.url}/${lang}/servizi` },
    ]),
    generateStructuredDataCollectionPage(copy.metaTitle, copy.metaDescription, `${siteConfig.url}/${lang}/servizi`, items),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="servizi-hub" />

      <div className="bg-background text-foreground">
        <header className="container mx-auto px-5 pb-12 pt-32 md:px-8 md:pb-20 md:pt-40">
          <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
            {copy.badge}
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
            <h1 className="font-display text-[2.8rem] font-extrabold leading-[0.96] tracking-[-0.035em] md:col-span-8 md:text-7xl lg:text-[5.2rem]">
              {copy.h1a} {copy.h1b}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground md:col-span-4">{copy.intro}</p>
          </div>
        </header>

        <div className="container mx-auto space-y-20 px-5 pb-24 md:space-y-28 md:px-8 md:pb-32">
          {groups.map((g, gi) => (
            <section key={g.id} aria-labelledby={`group-${g.id}`} className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-3">
                <p className="font-mono text-xs text-primary">{String(gi + 1).padStart(2, '0')}</p>
                <h2 id={`group-${g.id}`} className="rv-title mt-3 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                  <RevealWords text={g.title[lang]} />
                </h2>
                <p className="mt-2 text-muted-foreground">{g.about[lang]}</p>
              </div>
              <ul className="border-t border-border lg:col-span-9">
                {g.services.map((slug, i) => (
                  <li key={slug} className="rv border-b border-border" style={{ '--i': Math.min(i, 3) } as CSSProperties}>
                    <Link
                      href={getLocalizedPath(`/servizi/${slug}`, lang)}
                      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:py-8"
                    >
                      <div className="min-w-0">
                        <h3 className="font-display text-[1.7rem] font-bold leading-[1.05] tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-[2.6rem]">
                          {SERVICES[slug].name[lang]}
                        </h3>
                        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{SERVICES[slug].line[lang]}</p>
                      </div>
                      <span
                        aria-hidden
                        className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-border transition-colors duration-300 group-hover:bg-foreground group-hover:text-background group-hover:ring-foreground md:h-12 md:w-12"
                      >
                        <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <HomeCtaSection locale={lang} title={[copy.ctaTitle, copy.ctaButton.endsWith('.') ? copy.ctaButton : `${copy.ctaButton}.`]} lead={copy.ctaBody} />
      </div>
    </>
  );
}
