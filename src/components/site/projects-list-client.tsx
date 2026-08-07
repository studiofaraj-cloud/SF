'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { TechnologyBadge } from '@/components/site/technology-badge';
import { FolderKanban, ArrowRight, ArrowUpRight, Sparkles, Search, X, Globe } from 'lucide-react';
import type { Project } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Lazy load reveal wrapper (subtle motion only)
const ScrollFadeIn = dynamic(() => import('@/components/site/scroll-fade-in'), { ssr: true });

interface ProjectsListClientProps {
  projects: Project[];
}

function formatCategory(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
}

export function ProjectsListClient({ projects: initialProjects }: ProjectsListClientProps) {
  const locale = useLocale();
  const t = useTranslations('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const publishedProjects = initialProjects.filter((p) => p.published);

  const filteredProjects = useMemo(() => {
    return publishedProjects.filter((project) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.clientName && project.clientName.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'all' || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publishedProjects, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(publishedProjects.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [publishedProjects]);

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="relative border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background">
        <div className="container px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-5 inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              {t('hero.badge')}
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              {t('hero.title')}{' '}
              <span className="text-violet-600 dark:text-violet-400">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t('hero.description')}{' '}
              <span className="text-foreground font-medium">
                {t('hero.descriptionHighlight')}
              </span>
              .
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {publishedProjects.length}+
                </p>
                <p className="text-sm text-muted-foreground">{t('hero.completed')}</p>
              </div>
              <div className="h-10 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-3xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">{t('hero.satisfaction')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="container px-4 sm:px-6 md:px-8 py-16 md:py-24">
        {publishedProjects.length > 0 ? (
          <>
            {/* Search + filters */}
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    selectedCategory === 'all'
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'border-border text-muted-foreground hover:border-violet-500/40 hover:text-foreground'
                  )}
                >
                  {t('filters.all')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                      selectedCategory === cat
                        ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'border-border text-muted-foreground hover:border-violet-500/40 hover:text-foreground'
                    )}
                  >
                    {formatCategory(cat)}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {filteredProjects.map((project, index) => (
                  <ScrollFadeIn
                    key={project.id}
                    animation="fade-up"
                    delay={Math.min(index, 6) * 60}
                    className="h-full"
                  >
                    <article className="h-full">
                      <Link
                        href={`/${locale}/projects/${project.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
                      >
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                          {project.featuredImage ? (
                            <FirebaseImage
                              alt={`${project.title}${project.category ? ` — ${formatCategory(project.category)}` : ''}`}
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              src={project.featuredImage}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FolderKanban className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                          )}
                          {project.category && (
                            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm ring-1 ring-border">
                              {formatCategory(project.category)}
                            </span>
                          )}
                          {project.projectUrl && (
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                              <Globe className="h-3 w-3" />
                              {t('filters.liveSite')}
                            </span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {project.clientName
                                ? (locale === 'it' ? `per ${project.clientName}` : `for ${project.clientName}`)
                                : project.category
                                  ? formatCategory(project.category)
                                  : ''}
                            </span>
                            {project.year && <span className="shrink-0">{project.year}</span>}
                          </div>

                          <h2 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                            {project.title}
                          </h2>

                          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                            {project.description}
                          </p>

                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <TechnologyBadge key={tech} technology={tech} size="sm" />
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                            {t('filters.details')}
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </Link>
                    </article>
                  </ScrollFadeIn>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Search className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
                <h3 className="mb-2 text-xl font-semibold">{t('filters.noResults')}</h3>
                <p className="mb-5 text-muted-foreground">{t('filters.noResultsDesc')}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  {t('filters.resetFilters')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <FolderKanban className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
            <h3 className="mb-2 text-xl font-semibold">{t('filters.noProjects')}</h3>
            <p className="text-muted-foreground">{t('filters.noProjectsDesc')}</p>
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="container px-4 sm:px-6 md:px-8 pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card p-8 text-center md:p-14">
          <Badge
            variant="secondary"
            className="mb-5 inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t('filters.cta.badge')}
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t('filters.cta.title')}{' '}
            <span className="text-violet-600 dark:text-violet-400">
              {t('filters.cta.titleHighlight')}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t('filters.cta.description')}
          </p>
          <Link
            href={getLocalizedPath('/contatti', locale as any)}
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            {t('filters.cta.button')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
