import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import { WorkRail } from './work-rail';

type ProjectSummary = Omit<Project, 'content' | 'gallery'>;

const COPY = {
  it: {
    title: 'Lavori recenti',
    lead: 'Siti e piattaforme che abbiamo progettato e scritto per aziende in Italia e all’estero. Sono tutti online: puoi visitarli.',
    all: (n: number) => `Tutti i ${n} progetti`,
    archive: 'Archivio',
    caseStudy: 'Leggi il caso studio',
    visit: (host: string) => `Visita ${host}`,
    stack: 'Stack',
    categories: { corporate: 'Sito aziendale', 'landing-page': 'Landing page', 'e-commerce': 'E-commerce' },
    rail: { rail: 'Progetti recenti', prev: 'Progetto precedente', next: 'Progetto successivo', hint: 'Trascina o usa le frecce' },
  },
  en: {
    title: 'Recent work',
    lead: 'Websites and platforms we designed and built for companies in Italy and abroad. They are all live: you can visit them.',
    all: (n: number) => `All ${n} projects`,
    archive: 'Archive',
    caseStudy: 'Read the case study',
    visit: (host: string) => `Visit ${host}`,
    stack: 'Stack',
    categories: { corporate: 'Company website', 'landing-page': 'Landing page', 'e-commerce': 'E-commerce' },
    rail: { rail: 'Recent projects', prev: 'Previous project', next: 'Next project', hint: 'Drag or use the arrows' },
  },
} as const;

function hostOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * "Recent work" — server component. The newest projects on a horizontal
 * rail: each slide is the real, live site (a browser frame showing the
 * domain) beside what was built and, where the project has them, measured
 * results. The rail ends with a card to the full archive. WorkRail is the
 * client island that moves it.
 */
export function HomeProjectContent({
  projects,
  total,
  locale,
}: {
  projects: ProjectSummary[];
  total: number;
  locale: Locale;
}) {
  if (projects.length === 0) return null;
  const copy = COPY[locale];
  const allHref = getLocalizedPath('/projects', locale);

  return (
    <section
      id="lavori"
      className="scroll-mt-24 overflow-x-clip bg-background py-20 [container-type:inline-size] md:py-24 lg:py-28"
    >
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[2.6rem] font-bold leading-[1] tracking-[-0.03em] text-foreground md:col-span-6 md:text-6xl">
            {copy.title}
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lg leading-relaxed text-muted-foreground">{copy.lead}</p>
            <Link
              href={allHref}
              className="mt-4 inline-block font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
            >
              {copy.all(total)}
            </Link>
          </div>
        </header>
      </div>

      <div className="mt-10 md:mt-14">
        <WorkRail count={projects.length} labels={copy.rail}>
          {projects.map((p, i) => {
            const host = hostOf(p.projectUrl);
            const category =
              p.category && p.category in copy.categories
                ? copy.categories[p.category as keyof typeof copy.categories]
                : null;
            const meta = [category, p.year].filter(Boolean).join(', ');
            const href = getLocalizedPath(`/projects/${p.slug}`, locale);

            return (
              <li key={p.id || p.slug} data-slide className="work-slide flex w-[var(--slide)] shrink-0 snap-start">
                <article className="group relative flex w-full flex-col gap-5 rounded-[28px] bg-muted/50 p-2.5 ring-1 ring-border/70 transition-shadow duration-500 hover:shadow-xl md:grid md:grid-cols-12 md:gap-8 md:p-3 lg:p-4">
                  {/* The live site */}
                  <div className="min-w-0 md:col-span-7">
                    <div className="overflow-hidden rounded-[20px] border border-border bg-card">
                      <div className="flex items-center border-b border-border bg-muted/60 px-3 py-2">
                        <span className="truncate rounded-md bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                          {host ?? p.clientName}
                        </span>
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <FirebaseImage
                          src={p.featuredImage}
                          alt={p.title}
                          fill
                          sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 88vw"
                          draggable={false}
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* What was built */}
                  <div className="flex min-w-0 flex-col px-2.5 pb-3 md:col-span-5 md:px-0 md:py-3 md:pr-4 lg:py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="text-primary">{String(i + 1).padStart(2, '0')}</span>
                      {meta && <span> · {meta}</span>}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-foreground">{p.clientName}</p>
                    <h3 className="mt-1 font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-foreground md:text-2xl lg:text-[1.75rem]">
                      {/* Stretched link: the whole card opens the case study. */}
                      <Link href={href} draggable={false} className="after:absolute after:inset-0 after:content-['']">
                        {p.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-2 leading-relaxed text-muted-foreground lg:line-clamp-3">{p.description}</p>

                    {p.metrics?.length ? (
                      <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-4">
                        {p.metrics.slice(0, 3).map((m) => (
                          <div key={m.label} className="flex min-w-0 flex-col-reverse">
                            <dt className="mt-1 text-xs leading-snug text-muted-foreground">{m.label}</dt>
                            <dd className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">{m.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : p.highlights?.length ? (
                      <ul className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm text-foreground/80">
                        {p.highlights.slice(0, 2).map((h) => (
                          <li key={h} className="flex gap-3">
                            <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-primary" />
                            <span className="line-clamp-1">{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : p.technologies?.length ? (
                      <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{copy.stack}</span> {p.technologies.slice(0, 5).join(', ')}
                      </p>
                    ) : null}

                    <div className="relative z-10 mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium md:mt-auto md:pt-5">
                      <span className="text-primary underline decoration-primary/30 underline-offset-[6px] transition-colors group-hover:decoration-primary">
                        {copy.caseStudy}
                      </span>
                      {host && (
                        <a
                          href={p.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          draggable={false}
                          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {copy.visit(host)}
                          <ArrowUpRight aria-hidden className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}

          {/* The rail ends at the archive. */}
          <li data-slide className="work-slide flex w-[var(--end)] shrink-0 snap-start">
            <Link
              href={allHref}
              draggable={false}
              className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[28px] bg-navy p-7 text-white md:p-9"
            >
              <span aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-60" />
              <span className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{copy.archive}</span>
              <span className="relative mt-16 font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] md:text-4xl">
                {copy.all(total)}
              </span>
              <span className="relative mt-8 grid h-14 w-14 place-items-center rounded-full bg-white text-navy transition-transform duration-300 group-hover:translate-x-1.5">
                <ArrowRight aria-hidden className="h-6 w-6" />
              </span>
            </Link>
          </li>
        </WorkRail>
      </div>
    </section>
  );
}
