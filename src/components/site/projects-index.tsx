import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { CATEGORY_ORDER, categoryLabel, hostOf } from '@/lib/project-display';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import HomeCtaSection from './home-cta-section';
import { ProjectsFilter } from './projects-filter';
import { ProjectsPreview } from './projects-preview';

export type ProjectListItem = Pick<
  Project,
  'id' | 'slug' | 'title' | 'featuredImage' | 'projectUrl' | 'category' | 'clientName' | 'year'
>;

const COPY = {
  it: {
    kicker: 'Portfolio',
    title: 'Siti web realizzati',
    lead: 'Siti aziendali, e-commerce e piattaforme che abbiamo progettato e scritto riga per riga, per aziende in Italia e all’estero. Apri un progetto per leggere come l’abbiamo costruito.',
    filter: 'Filtra per tipo',
    all: 'Tutti',
    empty: 'I progetti tornano presto online.',
  },
  en: {
    kicker: 'Portfolio',
    title: 'Websites we’ve built',
    lead: 'Company websites, e-commerce and platforms we designed and wrote line by line, for companies in Italy and abroad. Open a project to read how we built it.',
    filter: 'Filter by type',
    all: 'All',
    empty: 'The projects will be back online shortly.',
  },
} as const;

const LIST_ID = 'projects-index';

/**
 * /projects — an agency-style index. Each project is one large row (client in
 * the display face, then what was built, type and year) linking to its case
 * study. Mouse users see the site's screenshot trail the cursor over the
 * hovered row (ProjectsPreview); touch screens get a thumbnail in each row.
 * Server component: the rows are plain HTML; the filter and preview are
 * small islands.
 */
export function ProjectsIndex({ projects, locale }: { projects: ProjectListItem[]; locale: Locale }) {
  const copy = COPY[locale];
  const present = new Set(projects.map((p) => p.category ?? 'other'));
  const options = [
    { value: 'all', label: copy.all },
    ...CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({ value: c, label: categoryLabel(c, locale)! })),
  ];

  return (
    <div className="bg-background text-foreground">
      <header className="container mx-auto px-5 pb-12 pt-32 md:px-8 md:pb-16 md:pt-40">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
          {copy.kicker}
        </p>
        <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
          <h1 className="font-display text-[3rem] font-extrabold leading-[0.95] tracking-[-0.035em] md:col-span-8 md:text-7xl lg:text-[5.6rem]">
            {copy.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground md:col-span-4">{copy.lead}</p>
        </div>
      </header>

      <section className="container mx-auto px-5 pb-24 md:px-8 md:pb-32">
        {projects.length === 0 ? (
          <p className="border-t border-border py-16 text-lg text-muted-foreground">{copy.empty}</p>
        ) : (
          <ProjectsFilter listId={LIST_ID} label={copy.filter} options={options}>
            {projects.map((p, i) => {
              const type = categoryLabel(p.category, locale);
              const meta = [type, p.year].filter(Boolean).join(' · ');
              const client = p.clientName || p.title;
              return (
                <li
                  key={p.id || p.slug}
                  data-category={p.category ?? 'other'}
                  className="rv border-b border-border"
                  style={{ '--i': Math.min(i, 3) } as CSSProperties}
                >
                  <Link
                    href={getLocalizedPath(`/projects/${p.slug}`, locale)}
                    data-preview={i}
                    className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:gap-x-8 md:py-7"
                  >
                    {/* Touch screens: a thumbnail. Mouse: the row number (the preview floats). */}
                    <span className="pi-thumb relative block aspect-[16/10] w-24 overflow-clip rounded-lg bg-muted ring-1 ring-border sm:w-36">
                      <FirebaseImage src={p.featuredImage} alt="" fill sizes="(min-width: 640px) 144px, 96px" className="object-cover object-top" />
                    </span>
                    <span className="pi-num hidden w-10 font-mono text-sm text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-8">
                        <h2 className="font-display text-[1.6rem] font-bold leading-[1.05] tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-4xl lg:text-[3.4rem]">
                          {client}
                        </h2>
                        {meta && (
                          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:text-xs">
                            {meta}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:mt-2 md:line-clamp-1 md:text-base">
                        {p.title}
                      </p>
                    </div>

                    <span
                      aria-hidden
                      className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-border transition-colors duration-300 group-hover:bg-foreground group-hover:text-background group-hover:ring-foreground md:h-12 md:w-12"
                    >
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ProjectsFilter>
        )}
      </section>

      <ProjectsPreview
        listId={LIST_ID}
        items={projects.map((p) => ({ src: p.featuredImage, host: hostOf(p.projectUrl) ?? p.clientName ?? '' }))}
      />

      <HomeCtaSection locale={locale} />
    </div>
  );
}
