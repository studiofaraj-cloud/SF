'use client';

import { FirebaseImage } from '@/components/ui/firebase-image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RichContentRenderer } from '@/components/site/rich-content-renderer';
import type { Blog } from '@/lib/definitions';

const ScrollFadeIn = dynamic(
  () => import('@/components/site/scroll-fade-in'),
  { ssr: true }
);

interface BlogPostClientProps {
  blog: Blog;
  related: Blog[];
  locale: string;
  readingTime?: number;
  formattedDate?: string;
  relatedDates?: string[];
}

export function BlogPostClient({ blog, related, locale, readingTime = 1, formattedDate = '', relatedDates = [] }: BlogPostClientProps) {
  const backLabel = locale === 'it' ? 'Torna al Blog' : 'Back to Blog';
  const relatedLabel = locale === 'it' ? 'Articoli Correlati' : 'Related Articles';
  const publishedLabel = locale === 'it' ? 'Pubblicato il' : 'Published on';
  const galleryLabel = locale === 'it' ? 'Galleria Immagini' : 'Image Gallery';
  const readLabel = locale === 'it' ? 'min di lettura' : 'min read';

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          1. HERO — Dark magazine-style header
          ═══════════════════════════════════════════════ */}
      <section className="relative">
        {/* Dark gradient background — covers only the text header portion */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]/90 z-0" />

        {/* Subtle blurred background image */}
        {blog.featuredImage && (
          <div className="absolute inset-0 z-0">
            <FirebaseImage
              src={blog.featuredImage}
              alt=""
              fill
              className="object-cover opacity-[0.07] blur-sm"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[20%] left-[5%] w-16 h-16 sm:w-20 sm:h-20 border border-primary/10 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
          <div className="floating-shape absolute top-[40%] right-[8%] w-12 h-12 sm:w-16 sm:h-16 border border-primary/10 rounded-full" style={{ animationDelay: '2s' }} />
          <div className="floating-shape absolute bottom-[35%] left-[15%] w-10 h-10 bg-primary/5 rotate-12 hidden md:block" style={{ animationDelay: '4s' }} />
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-primary/10 rounded-full blur-[100px] z-[5] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 md:w-56 md:h-56 bg-primary/5 rounded-full blur-[80px] z-[5] pointer-events-none" />

        {/* Hero text content */}
        <div className="relative z-20 pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-12 md:pb-14">
          <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="inline-flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1 text-xs text-white/40 mb-6">
              <Link href={`/${locale}`} className="hover:text-white/70 transition-colors whitespace-nowrap">Home</Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link href={`/${locale}/blog`} className="hover:text-white/70 transition-colors whitespace-nowrap">Blog</Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-white/30 truncate max-w-[140px] sm:max-w-[200px]">{blog.title}</span>
            </nav>

            {/* Badge */}
            <Badge className="badge-futuristic mb-5 sm:mb-6 bg-primary/20 text-primary border-primary/30">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              {locale === 'it' ? 'Articolo' : 'Article'}
            </Badge>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5 sm:mb-6 leading-[1.15]">
              {blog.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-sm text-white/50 mb-8 sm:mb-10">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span suppressHydrationWarning>{`${publishedLabel} ${formattedDate}`}</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span suppressHydrationWarning>{`${readingTime} ${readLabel}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured image — smaller, fully rounded, centered */}
        {blog.featuredImage && (
          <div className="relative z-20 max-w-3xl mx-auto px-6 sm:px-10 md:px-16 pb-8 sm:pb-10">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-auto block max-h-[420px] object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ═══════════════════════════════════════════════
          2. ARTICLE BODY
          ═══════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className={`pb-16 ${blog.featuredImage ? 'pt-8 sm:pt-10' : 'pt-12'}`}>

        {/* Excerpt */}
        {blog.excerpt && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <div className="mb-10">
              <blockquote className="relative pl-6 sm:pl-8 py-4 border-l-[3px] border-primary/50">
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed font-light italic">
                  {blog.excerpt}
                </p>
              </blockquote>
            </div>
          </ScrollFadeIn>
        )}

        {/* Divider */}
        <ScrollFadeIn animation="fade" delay={150}>
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-1 w-1 rounded-full bg-primary/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        </ScrollFadeIn>

        {/* Rich content — main article body */}
        <ScrollFadeIn animation="fade-up" delay={200}>
          <div className="mb-12">
            <RichContentRenderer content={blog.content} className="text-base md:text-[1.0625rem]" />
          </div>
        </ScrollFadeIn>

        {/* ── Gallery Section ── */}
        {blog.gallery && blog.gallery.length > 0 && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h2 className="text-lg font-semibold text-foreground shrink-0 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary/60 inline-block" />
                  {galleryLabel}
                  <span className="h-2 w-2 rounded-full bg-primary/60 inline-block" />
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {blog.gallery.map((imgUrl, i) => (
                  <ScrollFadeIn key={i} animation="scale" delay={i * 80}>
                    <div className="relative aspect-square rounded-xl overflow-hidden holographic-card neon-border group">
                      <FirebaseImage
                        src={imgUrl}
                        alt={`${blog.title} — ${locale === 'it' ? 'immagine' : 'image'} ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </ScrollFadeIn>
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        )}

        {/* ── Footer actions ── */}
        <ScrollFadeIn animation="fade-up" delay={100}>
          <div className="pt-8 border-t border-border/20">
            <Button variant="outline" asChild className="gap-2 text-sm hover:border-primary/40 transition-all">
              <Link href={`/${locale}/blog`}>
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </ScrollFadeIn>

        </div>{/* end inner card */}
      </div>{/* end outer max-w wrapper */}

      {/* ═══════════════════════════════════════════════
          3. RELATED POSTS
          ═══════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="relative border-t border-border/20 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
            <ScrollFadeIn animation="fade-up">
              <div className="text-center mb-12">
                <Badge className="badge-futuristic mb-4 bg-primary/10 text-primary border-primary/20">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  {locale === 'it' ? 'Continua a leggere' : 'Keep reading'}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{relatedLabel}</h2>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <div className="h-1 w-3 bg-primary/20 rounded-full" />
                  <div className="h-1 w-8 bg-primary/50 rounded-full" />
                  <div className="h-1 w-3 bg-primary/20 rounded-full" />
                </div>
              </div>
            </ScrollFadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((post, idx) => (
                <ScrollFadeIn key={post.id} animation="fade-up" delay={idx * 120}>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group block rounded-xl overflow-hidden holographic-card neon-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                  >
                    {post.featuredImage ? (
                      <div className="relative h-48 overflow-hidden">
                        <FirebaseImage
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center neon-border">
                          <BookOpen className="h-6 w-6 text-primary/40" />
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <p suppressHydrationWarning className="text-[10px] text-muted-foreground/50 mb-2 font-semibold uppercase tracking-widest">
                        {relatedDates[idx] ?? ''}
                      </p>
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 text-foreground">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary/60 font-medium group-hover:text-primary transition-colors">
                        <span>{locale === 'it' ? 'Leggi' : 'Read'}</span>
                        <ArrowLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
