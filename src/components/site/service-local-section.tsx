import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataFAQPage } from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import {
  SERVICE_AREA,
  SERVICE_LOCAL_CONTENT,
  type ServiceLocalKey,
} from '@/lib/service-local-content';

/**
 * Long-form local-SEO block for a /servizi/* page: explanatory copy, service
 * area, FAQ (+ FAQPage JSON-LD) and links to related services.
 *
 * Italian only — the copy targets "<servizio> Padova/Veneto" searches, so the
 * English pages render nothing. Plain markup with no client hooks and no
 * fade-in, so the full text is in the server HTML and visible immediately.
 */
export function ServiceLocalSection({ service, locale }: { service: ServiceLocalKey; locale: string }) {
  if (locale !== 'it') return null;
  const c = SERVICE_LOCAL_CONTENT[service];

  return (
    <section className="relative py-20 md:py-28">
      <StructuredDataServer data={generateStructuredDataFAQPage(c.faqs)} id={`faq-${service}`} />

      <div className="container relative z-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6">{c.heading}</h2>
          <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {c.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-10">
            {c.points.map((pt) => (
              <div key={pt.title} className="rounded-xl border border-border/50 bg-card/60 p-5">
                <h3 className="font-semibold text-foreground mb-2">{pt.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pt.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-border/50 bg-secondary/30 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-foreground mb-2">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
              {SERVICE_AREA.heading}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{SERVICE_AREA.body}</p>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-16 mb-6">Domande frequenti</h2>
          <div className="divide-y divide-border/50 border-y border-border/50">
            {c.faqs.map((f) => (
              <details key={f.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                  <h3 className="text-base sm:text-lg">{f.question}</h3>
                  <span className="text-primary transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-16 mb-4">Servizi collegati</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.related.map((r) => (
              <li key={r.href}>
                <Link
                  href={getLocalizedPath(r.href, locale as any)}
                  className="group flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-foreground hover:border-primary/50 hover:bg-secondary/40 transition-colors"
                >
                  {r.label}
                  <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
