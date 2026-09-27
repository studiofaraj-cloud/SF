import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { categoryLabel, hostOf } from '@/lib/project-display';
import { SERVICES, serviceGroupsFor, type ServiceSlug } from '@/lib/services-catalog';
import type { ServiceLocalKey } from '@/lib/service-local-content';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import HomeCtaSection from './home-cta-section';
import { RevealWords } from './reveal-words';
import { ServiceLocal } from './service-local';
import { ServiceQuoteButton } from './service-quote-button';

export type ServiceProof = Pick<Project, 'slug' | 'title' | 'clientName' | 'year' | 'category' | 'featuredImage' | 'projectUrl'>;

export type ServiceSection =
  | { kind: 'steps'; title: string; items: { title: string; description: string; meta?: string }[] }
  | { kind: 'checklist'; title: string; lead?: string; items: string[]; more?: { label: string; href: string } }
  | { kind: 'pairs'; title: string; lead?: string; items: { name: string; description: string }[] }
  | { kind: 'callout'; title: string; body: string }
  | { kind: 'node'; node: ReactNode };

export type ServicePageContent = {
  slug: ServiceSlug;
  title: string;
  lead: string;
  notes: string[];
  quoteLabel: string;
  /** Prefilled quote message, for services the form has no option for. */
  quoteMessage?: string;
  /** Main action as a link instead of the quote form (e.g. consulting books a call). */
  primary?: { label: string; href: string };
  /** Second hero button; defaults to the portfolio. */
  secondary?: { label: string; href: string };
  /** Heading of the features section; defaults to "Cosa facciamo". */
  featuresTitle?: string;
  features: { title: string; description: string }[];
  sections: ServiceSection[];
  closing?: { title: readonly [string, string]; lead?: string };
  /** Replaces the shared closing call to action (e.g. a page with its own two paths). */
  closingNode?: ReactNode;
  localKey?: ServiceLocalKey;
};

const COPY = {
  it: {
    services: 'Servizi',
    work: 'Guarda i lavori',
    proof: 'Un progetto reale',
    caseStudy: 'Leggi il caso studio',
    get: 'Cosa ottieni',
    what: 'Cosa facciamo',
    others: 'Altri servizi',
  },
  en: {
    services: 'Services',
    work: 'See the work',
    proof: 'A real project',
    caseStudy: 'Read the case study',
    get: 'What you get',
    what: 'What we do',
    others: 'Other services',
  },
} as const;

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground';
const H2 = 'rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]';

function SectionHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="grid gap-5 md:grid-cols-12 md:items-end">
      <h2 className={`${H2} md:col-span-7`}>
        <RevealWords text={title} />
      </h2>
      {lead && <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5">{lead}</p>}
    </header>
  );
}

function Section({ section, locale }: { section: ServiceSection; locale: Locale }) {
  if (section.kind === 'node') return <>{section.node}</>;
  // Four steps sit on one row; other counts fill rows of three.
  const fourUp = section.kind === 'steps' && section.items.length % 4 === 0 && section.items.length % 3 !== 0;

  if (section.kind === 'callout') {
    return (
      <section className="container mx-auto px-5 md:px-8">
        <div className="rv rounded-3xl bg-muted/60 p-8 ring-1 ring-border md:p-12">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">{section.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{section.body}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-5 md:px-8">
      <SectionHeader title={section.title} lead={section.kind === 'steps' ? undefined : section.lead} />

      {section.kind === 'steps' && (
        <ol className={`mt-12 grid gap-10 sm:grid-cols-2 md:mt-16 lg:gap-8 ${fourUp ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {section.items.map((step, i) => (
            <li key={step.title} className="rv rv-rule-t border-t-2 border-foreground pt-6" style={{ '--i': i % (fourUp ? 4 : 3) } as CSSProperties}>
              <span aria-hidden className="rv-slot">
                <span className="font-display text-4xl font-bold tracking-[-0.02em] text-primary">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em]">{step.title}</h3>
              {step.meta && <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{step.meta}</p>}
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      )}

      {section.kind === 'checklist' && (
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <li
              key={item}
              className="rv flex items-start gap-3 rounded-xl bg-muted/50 p-4 leading-relaxed ring-1 ring-border/70"
              style={{ '--i': i % 3 } as CSSProperties}
            >
              <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.kind === 'checklist' && section.more && (
        <p className="mt-8">
          <Link
            href={getLocalizedPath(section.more.href, locale)}
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
          >
            {section.more.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      )}

      {section.kind === 'pairs' && (
        <dl className="mt-12 border-t border-border md:mt-16">
          {section.items.map((item) => (
            <div key={item.name} className="rv grid gap-2 border-b border-border py-6 md:grid-cols-12 md:gap-8">
              <dt className="font-display text-xl font-bold tracking-[-0.01em] md:col-span-4">{item.name}</dt>
              <dd className="leading-relaxed text-muted-foreground md:col-span-8">{item.description}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/**
 * A /servizi/* page — server component. Hero with the page's H1 and, beside
 * it, a real portfolio project for the service (or what the client gets, when
 * no project shows it honestly), then what we do, the page's own sections,
 * the Italian local-SEO block with its FAQ, links to the other services and
 * the closing call to action. The only client code is the quote button.
 */
export function ServicePage({ content, proof, locale }: { content: ServicePageContent; proof: ServiceProof | null; locale: Locale }) {
  const copy = COPY[locale];
  const service = SERVICES[content.slug];
  // Beside the H1: the real project, or else the list of what the page covers.
  const aside = proof !== null || content.features.length > 0;
  const others = serviceGroupsFor(locale)
    .flatMap((g) => g.services)
    .filter((s) => s !== content.slug);

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ── */}
      <header className="container mx-auto px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <nav aria-label="Breadcrumb" className={MONO}>
          <ol className="flex min-w-0 items-center gap-2">
            <li className="shrink-0">
              <Link href={getLocalizedPath('/servizi', locale)} className="transition-colors hover:text-foreground">
                {copy.services}
              </Link>
            </li>
            <li aria-hidden className="shrink-0">/</li>
            <li aria-current="page" className="truncate text-foreground">{service.name[locale]}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className={`min-w-0 ${aside ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl lg:text-[4.2rem]">
              {content.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{content.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {content.primary ? (
                <Link
                  href={getLocalizedPath(content.primary.href, locale)}
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 sm:whitespace-nowrap"
                >
                  {content.primary.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <ServiceQuoteButton label={content.quoteLabel} service={service.quoteValue} message={content.quoteMessage} className="sm:whitespace-nowrap" />
              )}
              <Link
                href={getLocalizedPath(content.secondary?.href ?? '/projects', locale)}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-7 text-base font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted sm:whitespace-nowrap"
              >
                {content.secondary?.label ?? copy.work}
              </Link>
            </div>
            {content.notes.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {content.notes.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {aside && (
            <div className="min-w-0 lg:col-span-6">
              {proof ? (
                <figure>
                  <Link href={getLocalizedPath(`/projects/${proof.slug}`, locale)} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="overflow-clip rounded-2xl border border-border bg-card shadow-[0_40px_90px_-40px_rgba(10,22,40,0.45)]">
                      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
                        <span aria-hidden className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                        </span>
                        <span className="truncate rounded-md bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                          {hostOf(proof.projectUrl) ?? proof.clientName}
                        </span>
                      </div>
                      <div className="relative aspect-[16/10] bg-muted">
                        <FirebaseImage
                          src={proof.featuredImage}
                          alt={proof.title}
                          fill
                          priority
                          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                    <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span className="text-sm">
                        <span className={MONO}>{copy.proof}</span>
                        <span className="mt-1 block font-semibold">
                          {[proof.clientName, categoryLabel(proof.category, locale), proof.year].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        {copy.caseStudy}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </figcaption>
                  </Link>
                </figure>
              ) : (
                <div className="rounded-3xl bg-navy p-8 text-white md:p-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{content.featuresTitle ?? copy.get}</p>
                  <ol className="mt-6 divide-y divide-white/10">
                    {content.features.map((f, i) => (
                      <li key={f.title} className="flex items-baseline gap-5 py-3.5">
                        <span className="w-6 shrink-0 font-mono text-xs text-sky-300">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-lg font-semibold tracking-[-0.01em] md:text-xl">{f.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="space-y-24 pb-24 md:space-y-32 md:pb-32">
        {/* ── What we do ── */}
        {content.features.length > 0 && (
          <section className="container mx-auto px-5 md:px-8">
            <SectionHeader title={content.featuresTitle ?? copy.what} />
            <ol className="mt-12 grid gap-x-12 border-t border-border md:mt-16 md:grid-cols-2">
              {content.features.map((f, i) => (
                <li key={f.title} className="rv grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-border py-7" style={{ '--i': i % 2 } as CSSProperties}>
                  <span className="pt-1 font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-[-0.01em] md:text-2xl">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{f.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {content.sections.map((s, i) => (
          <Section key={i} section={s} locale={locale} />
        ))}

        {locale === 'it' && content.localKey && <ServiceLocal service={content.localKey} />}

        {/* ── Other services ── */}
        <section className="container mx-auto px-5 md:px-8">
          <p className={MONO}>{copy.others}</p>
          <ul className="mt-6 grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {others.map((slug) => (
              <li key={slug} className="border-b border-border">
                <Link
                  href={getLocalizedPath(`/servizi/${slug}`, locale)}
                  className="group flex items-center justify-between gap-4 py-5 pr-2 font-display text-lg font-semibold tracking-[-0.01em] transition-colors hover:text-primary"
                >
                  {SERVICES[slug].name[locale]}
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:rotate-45 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {content.closingNode ?? <HomeCtaSection locale={locale} title={content.closing?.title} lead={content.closing?.lead} />}
    </div>
  );
}
