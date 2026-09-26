import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

type ProjectSummary = Omit<Project, 'content' | 'gallery'>;

const COPY = {
  it: {
    title: 'Lavori recenti',
    lead: 'Siti e piattaforme che abbiamo progettato e scritto per aziende in Italia e all’estero. Sono tutti online: puoi visitarli.',
    all: (n: number) => `Tutti i ${n} progetti`,
    caseStudy: 'Leggi il caso studio',
    visit: (host: string) => `Visita ${host}`,
    stack: 'Stack',
    categories: { corporate: 'Sito aziendale', 'landing-page': 'Landing page', 'e-commerce': 'E-commerce' },
  },
  en: {
    title: 'Recent work',
    lead: 'Websites and platforms we designed and built for companies in Italy and abroad. They are all live: you can visit them.',
    all: (n: number) => `All ${n} projects`,
    caseStudy: 'Read the case study',
    visit: (host: string) => `Visit ${host}`,
    stack: 'Stack',
    categories: { corporate: 'Company website', 'landing-page': 'Landing page', 'e-commerce': 'E-commerce' },
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
 * "Recent work" — server component. Each project is presented as its real,
 * live website (a minimal browser frame showing the domain) next to what was
 * built and, where the project has them, measured results: the three newest
 * projects.
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
    <section id="lavori" className="scroll-mt-24 bg-background py-20 md:py-28 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 border-b border-border pb-10 md:grid-cols-12 md:items-end md:pb-14">
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

        <ul className="divide-y divide-border">
          {projects.map((p) => {
            const host = hostOf(p.projectUrl);
            const category =
              p.category && p.category in copy.categories
                ? copy.categories[p.category as keyof typeof copy.categories]
                : null;
            const meta = [category, p.year].filter(Boolean).join(', ');
            const href = getLocalizedPath(`/projects/${p.slug}`, locale);

            return (
              <li key={p.id || p.slug} className="group relative grid gap-8 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
                {/* What was built */}
                <div className="flex min-w-0 flex-col lg:col-span-5">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{p.clientName}</span>
                    {meta && <span className="mt-0.5 block text-muted-foreground">{meta}</span>}
                  </p>

                  <h3 className="mt-5 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground md:text-[1.9rem]">
                    {/* Stretched link: the whole row opens the case study. */}
                    <Link href={href} className="after:absolute after:inset-0 after:content-['']">
                      {p.title}
                    </Link>
                  </h3>

                  <p className="mt-4 line-clamp-3 leading-relaxed text-muted-foreground">{p.description}</p>

                  {p.metrics?.length ? (
                    <dl className="mt-8 grid grid-cols-3 gap-5 border-t border-border pt-6">
                      {p.metrics.slice(0, 3).map((m) => (
                        <div key={m.label} className="flex min-w-0 flex-col-reverse">
                          <dt className="mt-1 text-xs leading-snug text-muted-foreground">{m.label}</dt>
                          <dd className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : p.highlights?.length ? (
                    <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-foreground/80">
                      {p.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex gap-3">
                          <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-primary" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : p.technologies?.length ? (
                    <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{copy.stack}</span>{' '}
                      {p.technologies.join(', ')}
                    </p>
                  ) : null}

                  <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium lg:mt-auto lg:pt-8">
                    <span className="text-primary underline decoration-primary/30 underline-offset-[6px] transition-colors group-hover:decoration-primary">
                      {copy.caseStudy}
                    </span>
                    {host && (
                      <a
                        href={p.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {copy.visit(host)}
                        <ArrowUpRight aria-hidden className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* The live site — first on phones (the site is the proof),
                    beside the text from lg. DOM order keeps the title first. */}
                <div className="order-first min-w-0 lg:order-none lg:col-span-7">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-500 group-hover:shadow-xl">
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
                        sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border pt-10">
          <Link
            href={allHref}
            className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground underline decoration-border decoration-2 underline-offset-8 transition-colors hover:decoration-primary md:text-3xl"
          >
            {copy.all(total)}
          </Link>
        </div>
      </div>
    </section>
  );
}
