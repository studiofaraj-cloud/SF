import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Code, ShoppingCart, Palette, LineChart, Bot, Wrench, Server, Lightbulb,
  Boxes, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataBreadcrumbList,
  generateStructuredDataCollectionPage,
  siteConfig,
} from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';
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
 * Server component on purpose. The eight service detail pages are all
 * 'use client' with animation gates; the hub has no interactive state, so it
 * ships as static HTML and keeps its LCP text in the initial response.
 */

type Props = { params: Promise<{ locale: string }> };

/** Slug -> i18n key under the existing `services` namespace, plus its icon. */
const SERVICES = [
  { slug: 'sviluppo-web',   key: 'webDevelopment', Icon: Code,         accent: 'text-blue-500    bg-blue-500/10' },
  { slug: 'e-commerce',     key: 'ecommerce',      Icon: ShoppingCart, accent: 'text-emerald-500 bg-emerald-500/10' },
  { slug: 'design-ui-ux',   key: 'designUIUX',     Icon: Palette,      accent: 'text-violet-500  bg-violet-500/10' },
  { slug: 'seo-marketing',  key: 'seoMarketing',   Icon: LineChart,    accent: 'text-teal-500    bg-teal-500/10' },
  { slug: 'ai-automazione', key: 'aiAutomation',   Icon: Bot,          accent: 'text-pink-500    bg-pink-500/10' },
  { slug: 'manutenzione',   key: 'maintenance',    Icon: Wrench,       accent: 'text-orange-500  bg-orange-500/10' },
  { slug: 'hosting-cloud',  key: 'hostingCloud',   Icon: Server,       accent: 'text-indigo-500  bg-indigo-500/10' },
  { slug: 'consulenza',     key: 'consulting',     Icon: Lightbulb,    accent: 'text-fuchsia-500 bg-fuchsia-500/10' },
] as const;

/**
 * Italian-only service pages that have no entry in the `services` message
 * namespace, so their copy lives here. They notFound() outside `it`, hence the
 * locale guard where they are merged in.
 */
const IT_ONLY_SERVICES = [
  {
    slug: 'software-gestionale',
    Icon: Boxes,
    accent: 'text-cyan-500 bg-cyan-500/10',
    label: 'Software gestionale su misura',
    subtitle:
      'Gestionali costruiti sul processo reale: commesse, cantieri, rapportini e avanzamento lavori. Nessun canone per utente, codice di proprietà del cliente.',
  },
] as const;

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
    explore: 'Scopri di più',
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
    explore: 'Learn more',
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
  const t = await getTranslations('services');

  /**
   * Several `subtitle` values are deliberate sentence fragments — the detail
   * pages render them as subtitle + subtitleHighlight + subtitleEnd with the
   * middle span styled. Read alone, `consulting.subtitle` is just "Ti
   * affianchiamo nelle". Rejoin the parts so the cards read as full sentences,
   * reusing the real copy instead of inventing a second set of descriptions.
   */
  const fullSubtitle = (key: string) =>
    (['subtitle', 'subtitleHighlight', 'subtitleEnd'] as const)
      .filter((part) => t.has(`${key}.${part}`))
      .map((part) => t(`${key}.${part}`))
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.])/g, '$1')
      .trim();

  const items = [
    ...SERVICES.map(({ slug, key, Icon, accent }) => ({
      slug,
      Icon,
      accent,
      href: getLocalizedPath(`/servizi/${slug}`, lang),
      label: t(`${key}.label`),
      subtitle: fullSubtitle(key),
      url: `${siteConfig.url}/${lang}/servizi/${slug}`,
    })),
    // Only on /it — these pages 404 on any other locale.
    ...(lang === 'it'
      ? IT_ONLY_SERVICES.map(({ slug, Icon, accent, label, subtitle }) => ({
          slug,
          Icon,
          accent,
          href: getLocalizedPath(`/servizi/${slug}`, lang),
          label,
          subtitle,
          url: `${siteConfig.url}/it/servizi/${slug}`,
        }))
      : []),
  ];

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: lang === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${lang}` },
      { name: copy.badge, url: `${siteConfig.url}/${lang}/servizi` },
    ]),
    generateStructuredDataCollectionPage(
      copy.metaTitle,
      copy.metaDescription,
      `${siteConfig.url}/${lang}/servizi`,
      items.map((i) => ({ name: i.label, url: i.url })),
    ),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="servizi-hub" />

      <div className="bg-background text-foreground">
        {/* Hero */}
        <section className="container px-4 sm:px-6 md:px-8 pt-32 pb-12 sm:pt-40 sm:pb-16">
          <div className="max-w-3xl">

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              {copy.h1a}{' '}
              <span className="text-primary">{copy.h1b}</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {copy.intro}
            </p>
          </div>
        </section>

        {/* Service grid — the internal links this page exists to provide */}
        <section className="container px-4 sm:px-6 md:px-8 pb-20">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(({ slug, href, label, subtitle, Icon, accent }) => (
              <li key={slug}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">{label}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {subtitle}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {copy.explore}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="container px-4 sm:px-6 md:px-8 pb-24">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{copy.ctaBody}</p>
            <Button size="lg" className="mt-6" asChild>
              <Link href={getLocalizedPath('/contatti', lang)}>
                {copy.ctaButton}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
