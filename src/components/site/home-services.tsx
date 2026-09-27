import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import { RevealWords } from './reveal-words';
import { SERVICES, serviceGroupsFor } from '@/lib/services-catalog';

const COPY: Record<Locale, { title: string; lead: string; ctaLead: string; cta: string; all: string }> = {
  it: {
    title: 'Un solo studio, dal sito al gestionale.',
    lead: 'Progettiamo, sviluppiamo e manteniamo ogni parte del tuo prodotto digitale con codice scritto da noi: niente template, niente piattaforme da affittare.',
    ctaLead: 'Non sai da quale servizio partire? Raccontaci il progetto: la prima consulenza è gratuita.',
    cta: 'Richiedi una consulenza gratuita',
    all: 'Tutti i servizi',
  },
  en: {
    title: 'One studio, from the website to the business system.',
    lead: 'We design, build and maintain every part of your digital product with code we write ourselves: no templates, no platforms to rent.',
    ctaLead: 'Not sure which service to start with? Tell us about the project: the first consultation is free.',
    cta: 'Book a free consultation',
    all: 'All services',
  },
};

/**
 * Services as one ecosystem — server component. Three groups (build / grow /
 * run) with the services as a typographic index instead of eight identical
 * cards: the grouping itself says the studio covers the whole product.
 */
export function HomeServices({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section id="services" className="scroll-mt-24 bg-secondary/50 py-20 md:py-28 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="rv-title font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:col-span-7 md:text-[3.4rem]">
            <RevealWords text={copy.title} />
          </h2>
          <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9" style={{ '--i': 1 } as React.CSSProperties}>{copy.lead}</p>
        </header>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-3 lg:gap-10">
          {serviceGroupsFor(locale).map((group, gi) => (
            <div key={group.id} className="rv min-w-0" style={{ '--i': gi } as React.CSSProperties}>
              <div className="rv-rule-b border-b-2 border-foreground pb-4">
                <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[1.75rem]">
                  {group.title[locale]}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{group.about[locale]}</p>
              </div>
              <ul className="divide-y divide-border">
                {group.services.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={getLocalizedPath(`/servizi/${slug}`, locale)}
                      className="group/s flex items-start justify-between gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground transition-colors group-hover/s:text-primary">
                          {SERVICES[slug].name[locale]}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{SERVICES[slug].line[locale]}</span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="mt-1 h-4 w-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover/s:translate-x-0 group-hover/s:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rv mt-14 flex flex-col gap-6 border-t border-border pt-10 md:mt-20 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-foreground">{copy.ctaLead}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Button asChild size="lg" className="min-h-[52px] px-7 text-base font-semibold">
              <Link href={getLocalizedPath('/contatti', locale)}>{copy.cta}</Link>
            </Button>
            <Link
              href={getLocalizedPath('/servizi', locale)}
              className="text-center font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
            >
              {copy.all}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
