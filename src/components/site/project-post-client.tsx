'use client';

import { useEffect, useRef, useState } from 'react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Calendar, ChevronRight, ChevronLeft, ExternalLink, Github,
  Code2, Award, TrendingUp, FolderKanban, ArrowRight,
  Target, Lightbulb, Trophy, User, Tag, Sparkles, X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RichContentRenderer } from '@/components/site/rich-content-renderer';
import { TechnologyBadge } from '@/components/site/technology-badge';
import type { Project } from '@/lib/definitions';

const ScrollFadeIn = dynamic(
  () => import('@/components/site/scroll-fade-in'),
  { ssr: true }
);

interface ProjectPostClientProps {
  project: Project;
  related: Project[];
  locale: string;
  formattedDate?: string;
  relatedDates?: string[];
}

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

// ─── Animated metric (count-up on scroll) ──────────────────────────────────────
function formatNum(n: number, decimals: number) {
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}

function AnimatedMetric({ value }: { value: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.trim().match(/^([+~<>]?)(\d[\d.,]*)\s*([%x×kKmMbB+]*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseFloat(numStr);
    if (!isFinite(target)) {
      setDisplay(value);
      return;
    }
    const decimals = (numStr.split('.')[1] || '').length;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let startTs = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          if (reduced) {
            setDisplay(`${prefix}${formatNum(target, decimals)}${suffix}`);
            return;
          }
          const duration = 1200;
          const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const p = Math.min(1, (ts - startTs) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(`${prefix}${formatNum(target * eased, decimals)}${suffix}`);
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <p ref={ref} className="text-3xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
      {display}
    </p>
  );
}

// ─── Case study section ─────────────────────────────────────────────────────────
function CaseStudySection({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  const paragraphs = text.split('\n').map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          {icon}
        </span>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>
      <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

export function ProjectPostClient({
  project,
  related,
  locale,
  formattedDate = '',
  relatedDates = [],
}: ProjectPostClientProps) {
  const t = useTranslations('projects.detail');
  const hasCaseStudy = Boolean(project.challenge || project.solution || project.results);
  const hasMetrics = Boolean(project.metrics && project.metrics.length > 0);
  const cleanHighlights = (project.highlights || []).filter((h) => h);

  // Gallery lightbox
  const gallery = project.gallery || [];
  const [lightbox, setLightbox] = useState<number | null>(null);
  const openLightbox = (i: number) => setLightbox(i);
  const prev = () => setLightbox((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length));
  const next = () => setLightbox((i) => (i === null ? i : (i + 1) % gallery.length));

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    // Lock body scroll while the lightbox is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, gallery.length]);

  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60 pt-24 pb-14">
        {/* decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-500/[0.07] via-secondary/30 to-background" />
        <div
          className="pointer-events-none absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"
          aria-hidden
        />
        <div className="container max-w-5xl px-4 sm:px-6 md:px-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <Link href={`/${locale}`} className="transition-colors hover:text-foreground">
              {t('home')}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href={`/${locale}/projects`} className="transition-colors hover:text-foreground">
              {t('projects')}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate text-foreground/70">{project.title}</span>
          </nav>

          {project.category && (
            <Badge
              variant="secondary"
              className="mb-4 inline-flex items-center gap-1.5 border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              {formatCategory(project.category)}
            </Badge>
          )}

          <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {project.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {/* Meta */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-500/70" />
              <span suppressHydrationWarning>{`${t('completedOn')} ${formattedDate}`}</span>
            </span>
            {project.clientName && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 text-violet-500/70" />
                {project.clientName}
              </span>
            )}
            {project.year && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-violet-500/70" />
                {project.year}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Image ── */}
      {project.featuredImage && (
        <div className="container max-w-5xl px-4 sm:px-6 md:px-8">
          <div className="-mt-8 overflow-hidden rounded-2xl border border-border shadow-2xl shadow-violet-950/10 ring-1 ring-black/5">
            <FirebaseImage
              src={project.featuredImage}
              alt={`${project.title}${project.category ? ` — ${formatCategory(project.category)}` : ''}`}
              width={1200}
              height={675}
              priority
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>
      )}

      {/* ── Metrics band (full width) ── */}
      {hasMetrics && (
        <div className="container max-w-5xl px-4 sm:px-6 md:px-8 pt-14">
          <ScrollFadeIn animation="fade-up">
            <section className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-card p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 shrink-0 text-violet-500" />
                <h2 className="text-lg font-bold text-foreground">{t('keyResults')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {project.metrics!.map((metric, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <AnimatedMetric value={metric.value} />
                    <p className="mt-1.5 text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        </div>
      )}

      {/* ── Body: two-column with sticky sidebar ── */}
      <div className="container max-w-5xl px-4 sm:px-6 md:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">

          {/* Main column */}
          <main className="min-w-0">
            {/* Case study */}
            {hasCaseStudy && (
              <ScrollFadeIn animation="fade-up">
                <div>
                  {project.challenge && (
                    <CaseStudySection icon={<Target className="h-5 w-5" />} title={t('challenge')} text={project.challenge} />
                  )}
                  {project.solution && (
                    <CaseStudySection icon={<Lightbulb className="h-5 w-5" />} title={t('solution')} text={project.solution} />
                  )}
                  {project.results && (
                    <CaseStudySection icon={<Trophy className="h-5 w-5" />} title={t('results')} text={project.results} />
                  )}
                </div>
              </ScrollFadeIn>
            )}

            {/* Rich content body */}
            {project.content && project.content !== EMPTY_DOC && (
              <ScrollFadeIn animation="fade-up">
                <div className="mb-12">
                  <RichContentRenderer content={project.content} className="text-base md:text-[1.0625rem]" />
                </div>
              </ScrollFadeIn>
            )}

            {/* Highlights */}
            {cleanHighlights.length > 0 && (
              <ScrollFadeIn animation="fade-up">
                <section className="mb-12">
                  <div className="mb-5 flex items-center gap-3">
                    <Award className="h-5 w-5 shrink-0 text-violet-500" />
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t('highlights')}</h2>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {cleanHighlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/50 p-4 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              </ScrollFadeIn>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <ScrollFadeIn animation="fade-up">
                <section className="mb-4">
                  <div className="mb-5 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t('gallery')}</h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {gallery.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(i)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        aria-label={`${t('gallery')} ${i + 1}`}
                      >
                        <FirebaseImage
                          src={imgUrl}
                          alt={`${project.title} — ${t('gallery')} ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      </button>
                    ))}
                  </div>
                </section>
              </ScrollFadeIn>
            )}
          </main>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              {/* CTAs */}
              {(project.projectUrl || project.githubUrl) && (
                <div className="mb-6 space-y-2.5">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('viewProject')}
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/60"
                    >
                      <Github className="h-4 w-4" />
                      {t('viewCode')}
                    </a>
                  )}
                </div>
              )}

              {/* Facts */}
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground/80">
                {t('factsTitle')}
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{t('completedOn')}</dt>
                  <dd suppressHydrationWarning className="text-right font-medium text-foreground">{formattedDate}</dd>
                </div>
                {project.clientName && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('client')}</dt>
                    <dd className="text-right font-medium text-foreground">{project.clientName}</dd>
                  </div>
                )}
                {project.year && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('year')}</dt>
                    <dd className="text-right font-medium text-foreground">{project.year}</dd>
                  </div>
                )}
                {project.category && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('categoryLabel')}</dt>
                    <dd className="text-right font-medium text-foreground">{formatCategory(project.category)}</dd>
                  </div>
                )}
              </dl>

              {/* Tech stack */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-6 border-t border-border/60 pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/80">
                    <Code2 className="h-4 w-4 text-violet-500" />
                    {t('techStack')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <TechnologyBadge key={tech} technology={tech} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back link */}
            <div className="mt-4">
              <Button variant="ghost" asChild className="gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Link href={`/${locale}/projects`}>
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToProjects')}
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Closing CTA band ── */}
      <section className="border-t border-border/60 bg-gradient-to-br from-violet-500/[0.08] via-secondary/30 to-background">
        <div className="container max-w-4xl px-4 sm:px-6 md:px-8 py-16 text-center">
          <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('ctaText')}</p>
          <div className="mt-7">
            <a
              href={`/${locale}/contatti`}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              {t('ctaButton')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Related projects ── */}
      {related.length > 0 && (
        <section className="border-t border-border/60 bg-secondary/20">
          <div className="container max-w-5xl px-4 sm:px-6 md:px-8 py-16">
            <div className="mb-10 text-center">
              <Badge
                variant="secondary"
                className="mb-3 inline-flex items-center gap-1.5 border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                {t('relatedBadge')}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t('relatedTitle')}</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {related.map((p, idx) => (
                <article key={p.id} className="h-full">
                  <Link
                    href={`/${locale}/projects/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
                  >
                    {p.featuredImage ? (
                      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-secondary">
                        <FirebaseImage
                          src={p.featuredImage}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] shrink-0 items-center justify-center bg-secondary">
                        <FolderKanban className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <p suppressHydrationWarning className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                        {relatedDates[idx] ?? ''}
                      </p>
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                        {t('relatedView')}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery lightbox (self-contained overlay) ── */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t('gallery')} ${lightbox + 1} / ${gallery.length}`}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40">
              <FirebaseImage
                src={gallery[lightbox]}
                alt={`${project.title} — ${t('gallery')} ${lightbox + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg ring-1 ring-border transition-colors hover:bg-secondary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg ring-1 ring-border backdrop-blur transition-colors hover:bg-background"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg ring-1 ring-border backdrop-blur transition-colors hover:bg-background"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border backdrop-blur">
                  {lightbox + 1} / {gallery.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
