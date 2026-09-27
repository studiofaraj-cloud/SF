import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight, MapPin, Plus } from 'lucide-react';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataFAQPage } from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { SERVICE_AREA, SERVICE_LOCAL_CONTENT, type ServiceLocalKey } from '@/lib/service-local-content';
import { RevealWords } from './reveal-words';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground';

/**
 * The Italian local-SEO block of a service page: the explanatory copy, where
 * the studio works, the FAQ (native <details>, so every answer is in the HTML
 * and it works without JavaScript) with its FAQPage JSON-LD, and curated
 * links to related services. Server component; Italian pages only.
 */
export function ServiceLocal({ service }: { service: ServiceLocalKey }) {
  const c = SERVICE_LOCAL_CONTENT[service];

  return (
    <>
      <section className="container mx-auto px-5 md:px-8">
        <p className={MONO}>Padova e Veneto</p>
        <h2 className="rv-title mt-4 max-w-4xl font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] md:text-[2.8rem]">
          <RevealWords text={`${c.heading} ${c.headingHighlight}`} />
        </h2>

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-7">
            {c.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="rv">
                {p}
              </p>
            ))}
          </div>
          <aside className="rv lg:col-span-4 lg:col-start-9">
            <div className="rounded-2xl bg-muted/60 p-6 ring-1 ring-border">
              <p className="flex items-center gap-2 font-semibold">
                <MapPin aria-hidden className="h-4 w-4 text-primary" />
                {SERVICE_AREA.heading}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SERVICE_AREA.body}</p>
            </div>
          </aside>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {c.points.map((pt, i) => (
            <li key={pt.title} className="rv rv-rule-t border-t-2 border-foreground pt-6" style={{ '--i': i } as CSSProperties}>
              <h3 className="font-display text-xl font-bold tracking-[-0.01em]">{pt.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{pt.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container mx-auto px-5 md:px-8">
        <StructuredDataServer data={generateStructuredDataFAQPage(c.faqs)} id={`faq-${service}`} />
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem] lg:col-span-4">
            <RevealWords text="Domande frequenti" />
          </h2>
          <div className="lg:col-span-8">
            <div className="border-t border-border">
              {c.faqs.map((f) => (
                <details key={f.question} className="group border-b border-border">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-display text-lg font-semibold tracking-[-0.01em] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:text-xl [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <Plus aria-hidden className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-open:text-primary" />
                  </summary>
                  <p className="pb-6 pr-10 leading-relaxed text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>

            {c.related.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2">
                {c.related.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={getLocalizedPath(r.href, 'it')}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-medium ring-1 ring-inset ring-border transition-colors hover:bg-foreground hover:text-background hover:ring-foreground"
                    >
                      {r.label}
                      <ArrowUpRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
