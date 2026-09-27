import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { categoryLabel, hostOf } from '@/lib/project-display';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import { RichContentRenderer } from './rich-content-renderer';
import { RevealWords } from './reveal-words';
import { ProjectGallery } from './project-gallery';
import HomeCtaSection from './home-cta-section';

export type NextProject = Pick<Project, 'slug' | 'title' | 'featuredImage' | 'projectUrl' | 'clientName'>;

const COPY = {
  it: {
    portfolio: 'Portfolio',
    client: 'Cliente',
    year: 'Anno',
    type: 'Tipo',
    stack: 'Tecnologie',
    visit: (host: string) => `Visita ${host}`,
    similar: 'Un progetto simile',
    results: 'Risultati',
    story: 'Il progetto',
    challenge: 'La sfida',
    solution: 'La soluzione',
    outcome: 'I risultati',
    highlights: 'In breve',
    gallery: 'Galleria',
    next: 'Prossimo progetto',
    // Plain strings: these labels go to a client component ({n} = image number).
    gallerySr: { open: 'Apri l’immagine {n}', close: 'Chiudi', prev: 'Immagine precedente', next: 'Immagine successiva' },
  },
  en: {
    portfolio: 'Portfolio',
    client: 'Client',
    year: 'Year',
    type: 'Type',
    stack: 'Technology',
    visit: (host: string) => `Visit ${host}`,
    similar: 'A similar project',
    results: 'Results',
    story: 'The project',
    challenge: 'The challenge',
    solution: 'The solution',
    outcome: 'The results',
    highlights: 'In short',
    gallery: 'Gallery',
    next: 'Next project',
    gallerySr: { open: 'Open image {n}', close: 'Close', prev: 'Previous image', next: 'Next image' },
  },
} as const;

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

function paragraphs(text?: string) {
  return (text ?? '').split('\n').map((p) => p.trim()).filter(Boolean);
}

/** The site in a browser frame; tall full-page screenshots scroll as the page does (.pd-shot). */
function BrowserFrame({ src, host, alt, priority, sizes }: { src: string; host: string; alt: string; priority?: boolean; sizes: string }) {
  return (
    <div className="overflow-clip rounded-2xl border border-border bg-card shadow-[0_40px_90px_-40px_rgba(10,22,40,0.45)]">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </span>
        <span className="truncate rounded-md bg-background px-3 py-1 font-mono text-xs text-muted-foreground">{host}</span>
      </div>
      <div className="relative aspect-[16/10] bg-muted">
        <FirebaseImage src={src} alt={alt} fill priority={priority} sizes={sizes} className="pd-shot object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * A case study — server component. The title, the real site in a browser
 * frame, measured results when the project has them, then the story in one
 * reading column (challenge / solution / results when filled in, then the
 * full write-up), highlights, gallery, and a large link to the next project.
 * Only the gallery viewer is a client island.
 */
export function ProjectCaseStudy({ project, next, locale }: { project: Project; next: NextProject | null; locale: Locale }) {
  const copy = COPY[locale];
  const host = hostOf(project.projectUrl);
  const type = categoryLabel(project.category, locale);
  const client = project.clientName || project.title;
  const facts = [
    { label: copy.client, value: project.clientName },
    { label: copy.year, value: project.year },
    { label: copy.type, value: type },
    { label: copy.stack, value: project.technologies?.join(', ') },
  ].filter((f) => f.value);
  const chapters = [
    { title: copy.challenge, text: paragraphs(project.challenge) },
    { title: copy.solution, text: paragraphs(project.solution) },
    { title: copy.outcome, text: paragraphs(project.results) },
  ].filter((c) => c.text.length);
  const highlights = (project.highlights ?? []).filter(Boolean);
  const gallery = (project.gallery ?? []).filter(Boolean);
  const hasBody = Boolean(project.content && project.content !== EMPTY_DOC);

  return (
    <article className="bg-background text-foreground">
      {/* ── Title ── */}
      <header className="container mx-auto px-5 pt-28 md:px-8 md:pt-36">
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <ol className="flex min-w-0 items-center gap-2">
            <li className="shrink-0">
              <Link href={getLocalizedPath('/projects', locale)} className="transition-colors hover:text-foreground">
                {copy.portfolio}
              </Link>
            </li>
            <li aria-hidden className="shrink-0">/</li>
            <li aria-current="page" className="truncate text-foreground">{client}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            {(type || project.year) && (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {type && <span className="text-primary">{type}</span>}
                {type && project.year && ' · '}
                {project.year}
              </p>
            )}
            <h1 className="mt-4 font-display text-[2.3rem] font-extrabold leading-[1.02] tracking-[-0.03em] md:text-5xl lg:text-[3.6rem]">
              {project.title}
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{project.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.projectUrl && host && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110"
                >
                  {copy.visit(host)}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
              <Link
                href={getLocalizedPath('/inizia', locale)}
                className="inline-flex min-h-[48px] items-center rounded-xl px-5 text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted"
              >
                {copy.similar}
              </Link>
            </div>
          </div>
        </div>

        {facts.length > 0 && (
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{f.label}</dt>
                <dd className="mt-1.5 font-medium leading-snug">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {/* ── The site ── */}
      {project.featuredImage && (
        <div className="container mx-auto mt-10 px-5 md:mt-14 md:px-8">
          <BrowserFrame
            src={project.featuredImage}
            host={host ?? client}
            alt={project.title}
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
          />
        </div>
      )}

      {/* ── Results ── */}
      {project.metrics?.length ? (
        <section className="container mx-auto mt-16 px-5 md:mt-24 md:px-8">
          <div className="rounded-3xl bg-navy px-6 py-10 text-white md:px-12 md:py-14">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{copy.results}</h2>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
              {project.metrics.map((m, i) => (
                <div key={m.label} className="rv flex min-w-0 flex-col-reverse" style={{ '--i': i } as CSSProperties}>
                  <dt className="mt-2 text-sm leading-snug text-white/60">{m.label}</dt>
                  <dd className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
                    <span className="rv-slot">
                      <span>{m.value}</span>
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* ── The story ── */}
      {(chapters.length > 0 || hasBody || highlights.length > 0 || gallery.length > 0) && (
        <div className="container mx-auto mt-16 grid gap-10 px-5 md:mt-24 md:px-8 lg:grid-cols-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground lg:sticky lg:top-28 lg:col-span-3 lg:self-start">
            {copy.story}
          </p>

          <div className="min-w-0 lg:col-span-8 lg:col-start-5">
            {chapters.map((c, i) => (
              <section key={c.title} className="rv mb-14 border-t border-border pt-6">
                <h2 className="flex items-baseline gap-4 font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">
                  <span className="font-mono text-sm font-normal text-primary">{String(i + 1).padStart(2, '0')}</span>
                  {c.title}
                </h2>
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
                  {c.text.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            {hasBody && (
              <div className="pd-body text-base md:text-[1.0625rem]">
                <RichContentRenderer content={project.content} />
              </div>
            )}

            {highlights.length > 0 && (
              <section className="mt-14 border-t border-border pt-6">
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">{copy.highlights}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {highlights.map((h, i) => (
                    <li
                      key={h}
                      className="rv flex items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed ring-1 ring-border/70"
                      style={{ '--i': i % 2 } as CSSProperties}
                    >
                      <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {gallery.length > 0 && (
              <section className="mt-14 border-t border-border pt-6">
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">{copy.gallery}</h2>
                <div className="mt-6">
                  <ProjectGallery images={gallery} alt={project.title} labels={copy.gallerySr} />
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ── Next project ── */}
      {next && (
        <section className="container mx-auto mt-24 px-5 md:mt-32 md:px-8">
          <Link
            href={getLocalizedPath(`/projects/${next.slug}`, locale)}
            className="group grid gap-8 border-t-2 border-foreground pt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-12 md:items-center md:gap-12"
          >
            <div className="md:col-span-6">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.next}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </p>
              <p className="rv-title mt-4 font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl lg:text-7xl">
                <RevealWords text={next.clientName || next.title} />
              </p>
              <p className="mt-3 text-muted-foreground">{next.title}</p>
            </div>
            <div className="rv-img md:col-span-6 [--rv-r:1rem]">
              <BrowserFrame
                src={next.featuredImage}
                host={hostOf(next.projectUrl) ?? next.clientName ?? ''}
                alt=""
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          </Link>
        </section>
      )}

      <div className="mt-24 md:mt-32">
        <HomeCtaSection locale={locale} />
      </div>
    </article>
  );
}
