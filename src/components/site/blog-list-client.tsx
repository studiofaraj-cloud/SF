'use client';

import Link from 'next/link';
import { FirebaseImage } from '@/components/ui/firebase-image';
import dynamic from 'next/dynamic';
import { BookOpen, Calendar, ChevronRight, Search, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Blog } from '@/lib/definitions';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useMemo } from 'react';

const ScrollFadeIn = dynamic(
  () => import('@/components/site/scroll-fade-in'),
  { ssr: true }
);
const RippleGrid = dynamic(() => import('@/components/RippleGrid'), { ssr: false });
const GradientText = dynamic(() => import('@/components/GradientText'), { ssr: false });

interface BlogListClientProps {
  blogs: Blog[];
}

const IT_MONTHS_LONG  = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const EN_MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const IT_MONTHS_SHORT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const EN_MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const day = d.getUTCDate();
  const month = locale === 'it' ? IT_MONTHS_LONG[d.getUTCMonth()] : EN_MONTHS_LONG[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function formatYear(dateStr: string) {
  return new Date(dateStr).getUTCFullYear();
}

function formatShortDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const day = d.getUTCDate();
  const month = locale === 'it' ? IT_MONTHS_SHORT[d.getUTCMonth()] : EN_MONTHS_SHORT[d.getUTCMonth()];
  return `${day} ${month}`;
}

export function BlogListClient({ blogs: initialBlogs }: BlogListClientProps) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [query, setQuery] = useState('');

  const publishedBlogs = initialBlogs.filter(b => b.published);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return publishedBlogs;
    const q = query.toLowerCase();
    return publishedBlogs.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || '').toLowerCase().includes(q)
    );
  }, [publishedBlogs, query]);

  // Group by year, descending
  const byYear = useMemo(() => {
    const map: Record<number, Blog[]> = {};
    for (const blog of filtered) {
      const y = formatYear(blog.createdAt);
      if (!map[y]) map[y] = [];
      map[y].push(blog);
    }
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, posts]) => ({ year: Number(year), posts }));
  }, [filtered]);

  // Featured post = most recent
  const featured = publishedBlogs[0] ?? null;

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] min-h-[65svh] flex flex-col justify-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#10b981"
            rippleIntensity={0.04}
            gridSize={14}
            gridThickness={18}
            fadeDistance={1.3}
            vignetteStrength={2}
            glowIntensity={0.1}
            opacity={0.7}
            mouseInteraction={false}
            animationSpeed={0.5}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background z-10" />

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center max-w-3xl py-14">
          <Badge className="badge-futuristic mb-5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            {t('hero.badge')}
          </Badge>

          <div className="mb-4 pb-2">
            <GradientText
              colors={['#10b981', '#059669', '#10b981']}
              animationSpeed={4}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2]"
            >
              {`${t('hero.title')} ${t('hero.titleHighlight')}`}
            </GradientText>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {t('hero.description')}{' '}
            <span className="text-emerald-400 font-semibold">{t('hero.descriptionHighlight')}</span>.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={locale === 'it' ? 'Cerca articoli…' : 'Search articles…'}
              className="w-full rounded-xl border border-border/40 bg-background/60 backdrop-blur-sm pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
            />
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-24">

        {publishedBlogs.length === 0 ? (
          <ScrollFadeIn animation="fade-up">
            <div className="text-center py-24">
              <BookOpen className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">{t('list.noPosts')}</h3>
              <p className="text-muted-foreground text-sm">{t('list.noPostsDesc')}</p>
            </div>
          </ScrollFadeIn>
        ) : (
          <div className="mt-[-2rem] grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

            {/* ── Left: article index ── */}
            <main>
              {filtered.length === 0 ? (
                <ScrollFadeIn animation="fade-up">
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    {locale === 'it' ? 'Nessun risultato per' : 'No results for'}{' '}
                    <strong className="text-foreground">"{query}"</strong>
                  </div>
                </ScrollFadeIn>
              ) : (
                byYear.map(({ year, posts }) => (
                  <ScrollFadeIn key={year} animation="fade-up">
                    <section className="mb-10">

                      {/* Year heading — Wikipedia-style */}
                      <div className="flex items-center gap-3 mb-1 pb-2 border-b border-border/40">
                        <h2 className="text-lg font-bold text-foreground">{year}</h2>
                        <span className="text-xs text-muted-foreground/50">
                          {posts.length}{' '}
                          {locale === 'it'
                            ? posts.length === 1 ? 'articolo' : 'articoli'
                            : posts.length === 1 ? 'article' : 'articles'}
                        </span>
                      </div>

                      {/* Article rows */}
                      <ul className="divide-y divide-border/20">
                        {posts.map(blog => (
                          <li key={blog.id}>
                            <Link
                              href={`/${locale}/blog/${blog.slug}`}
                              className="group flex items-start gap-4 py-4 hover:bg-secondary/30 -mx-3 px-3 rounded-lg transition-colors duration-200"
                            >
                              {/* Thumbnail */}
                              <div className="shrink-0 mt-0.5">
                                {blog.featuredImage ? (
                                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden border border-border/30 relative">
                                    <FirebaseImage
                                      src={blog.featuredImage}
                                      alt={blog.title}
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-md border border-border/20 bg-secondary/40 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                                  {blog.title}
                                </h3>
                                {blog.excerpt && (
                                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5 line-clamp-2 leading-relaxed">
                                    {blog.excerpt}
                                  </p>
                                )}
                              </div>

                              {/* Date + arrow */}
                              <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
                                <span suppressHydrationWarning className="flex items-center gap-1 text-[10px] text-muted-foreground/50 whitespace-nowrap">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {formatShortDate(blog.createdAt, locale)}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-emerald-400/60 transition-colors" />
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </ScrollFadeIn>
                ))
              )}
            </main>

            {/* ── Right: sidebar ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">

                {/* Featured article box */}
                {featured && (
                  <ScrollFadeIn animation="fade-up" delay={100}>
                    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden holographic-card">
                      <div className="px-4 py-2.5 border-b border-border/30 bg-emerald-500/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                          {locale === 'it' ? 'Articolo in evidenza' : 'Featured article'}
                        </p>
                      </div>
                      {featured.featuredImage && (
                        <div className="relative h-36 overflow-hidden">
                          <FirebaseImage
                            src={featured.featuredImage}
                            alt={featured.title}
                            fill
                            className="object-cover"
                            sizes="280px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
                          {featured.title}
                        </h3>
                        {featured.excerpt && (
                          <p className="text-xs text-muted-foreground/70 line-clamp-3 leading-relaxed mb-3">
                            {featured.excerpt}
                          </p>
                        )}
                        <Link
                          href={`/${locale}/blog/${featured.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {locale === 'it' ? 'Leggi articolo' : 'Read article'}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </ScrollFadeIn>
                )}

                {/* Stats box */}
                <ScrollFadeIn animation="fade-up" delay={200}>
                  <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border/30 bg-secondary/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {locale === 'it' ? 'Statistiche' : 'Statistics'}
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground/60">{locale === 'it' ? 'Articoli totali' : 'Total articles'}</span>
                        <span className="font-semibold text-foreground">{publishedBlogs.length}</span>
                      </div>
                      {byYear.length > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground/60">{locale === 'it' ? 'Primo articolo' : 'First article'}</span>
                          <span className="font-semibold text-foreground">
                            {byYear[byYear.length - 1].year}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground/60">{locale === 'it' ? 'Anni coperti' : 'Years covered'}</span>
                        <span className="font-semibold text-foreground">{byYear.length}</span>
                      </div>
                    </div>
                  </div>
                </ScrollFadeIn>

                {/* Quick links — all years */}
                {byYear.length > 1 && (
                  <ScrollFadeIn animation="fade-up" delay={300}>
                    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-border/30 bg-secondary/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          {locale === 'it' ? 'Archivio' : 'Archive'}
                        </p>
                      </div>
                      <ul className="p-4 space-y-1.5">
                        {byYear.map(({ year, posts }) => (
                          <li key={year} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground/70">{year}</span>
                            <span className="text-[10px] text-muted-foreground/40 bg-secondary/40 px-1.5 py-0.5 rounded">
                              {posts.length}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollFadeIn>
                )}

              </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}
