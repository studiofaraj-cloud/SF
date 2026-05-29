'use client';

import { useState, useEffect, useActionState } from 'react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  User,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RichContentRenderer } from '@/components/site/rich-content-renderer';
import type { Blog } from '@/lib/definitions';
import { contactServices } from '@/lib/definitions';
import { createSubscriber } from '@/lib/actions';

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

export function BlogPostClient({
  blog,
  related,
  locale,
  readingTime = 1,
  formattedDate = '',
  relatedDates = [],
}: BlogPostClientProps) {
  const isIT = locale === 'it';
  const backLabel = isIT ? 'Torna al Blog' : 'Back to Blog';
  const relatedLabel = isIT ? 'Articoli Correlati' : 'Related Articles';
  const publishedLabel = isIT ? 'Pubblicato il' : 'Published on';
  const galleryLabel = isIT ? 'Galleria Immagini' : 'Image Gallery';
  const readLabel = isIT ? 'min di lettura' : 'min read';

  // Reading progress bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Newsletter form state
  const [newsletterState, newsletterDispatch] = useActionState(
    createSubscriber,
    { message: '', success: false }
  );

  // Static FAQ items (inline bilingual)
  const faqItems = isIT
    ? [
        {
          q: 'Come posso contattare Studio Faraj?',
          a: 'Puoi contattarci tramite il modulo sul nostro sito, scrivendo a info@studiofaraj.it oppure chiamandoci direttamente. Siamo sempre disponibili per rispondere alle tue domande.',
        },
        {
          q: 'Quanto tempo richiede lo sviluppo di un sito web?',
          a: 'I tempi variano in base alla complessità del progetto. Un sito vetrina richiede generalmente 2–4 settimane, mentre un e-commerce o un\'applicazione web complessa può richiedere 6–12 settimane.',
        },
        {
          q: 'Offrite servizi di manutenzione e supporto?',
          a: 'Sì, offriamo piani di manutenzione mensili che includono aggiornamenti, monitoraggio delle performance, backup e supporto tecnico prioritario.',
        },
        {
          q: 'Operate solo a Padova o anche in altre città?',
          a: 'Siamo basati a Padova ma lavoriamo con clienti in tutta Italia e all\'estero. La maggior parte dei progetti si svolge completamente da remoto.',
        },
        {
          q: 'Come funziona una prima consulenza?',
          a: 'La prima consulenza è gratuita e senza impegno. Analizziamo le tue esigenze, ti proponiamo una soluzione e ti forniamo un preventivo dettagliato entro 48 ore.',
        },
      ]
    : [
        {
          q: 'How can I contact Studio Faraj?',
          a: "You can reach us through the contact form on our website, by emailing info@studiofaraj.it, or by calling us directly. We're always happy to answer your questions.",
        },
        {
          q: 'How long does it take to build a website?',
          a: 'Timelines vary by project complexity. A brochure site typically takes 2–4 weeks, while an e-commerce store or complex web app may take 6–12 weeks.',
        },
        {
          q: 'Do you offer maintenance and support services?',
          a: 'Yes, we offer monthly maintenance plans that include updates, performance monitoring, backups, and priority technical support.',
        },
        {
          q: 'Do you work only in Padova or also in other cities?',
          a: 'We are based in Padova but work with clients all over Italy and abroad. Most projects are handled fully remotely.',
        },
        {
          q: 'How does an initial consultation work?',
          a: 'The first consultation is free and non-binding. We analyse your needs, propose a solution, and provide a detailed quote within 48 hours.',
        },
      ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden pt-20 md:pt-24">

      {/* ══════════════════════════════════════════════════════
          READING PROGRESS BAR (fixed, z-[60], above header)
          ══════════════════════════════════════════════════════ */}
      <div className="fixed top-0 inset-x-0 z-[60] h-1 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#1e3a8a] to-[#38bdf8] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          1. TOP CTA BANNER
          ══════════════════════════════════════════════════════ */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 text-sm flex-wrap">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">
            {isIT
              ? 'Hai un progetto in mente? Parliamo insieme.'
              : "Got a project in mind? Let's talk."}
          </span>
          <Link
            href={`/${locale}/contatti`}
            className="font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 shrink-0"
          >
            {isIT ? 'Contattaci' : 'Contact us'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. ARTICLE HEADER — breadcrumb + badge + title + excerpt + meta
          ══════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground/60 mb-6"
        >
          <Link href={`/${locale}`} className="hover:text-muted-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href={`/${locale}/blog`} className="hover:text-muted-foreground transition-colors">
            Blog
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-muted-foreground/40 truncate max-w-[200px]">{blog.title}</span>
        </nav>

        {/* Badge */}
        <div className="mb-5">
          <Badge className="badge-futuristic bg-primary/10 text-primary border-primary/20">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            {isIT ? 'Articolo' : 'Article'}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.15]">
          {blog.title}
        </h1>

        {/* Excerpt / description */}
        {blog.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-light max-w-[720px]">
            {blog.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground border-t border-border/30 pt-6">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary/60" />
            <span className="font-medium text-foreground">
              {blog.author || 'Studio Faraj Team'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary/60" />
            <span suppressHydrationWarning>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary/60" />
            <span suppressHydrationWarning>
              {readingTime} {readLabel}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. FEATURED IMAGE — full-width below intro
          ══════════════════════════════════════════════════════ */}
      {blog.featuredImage && (
        <div className="flex justify-center px-4 sm:px-6 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-[90%] md:w-[70%] h-auto block rounded-xl border border-border/40 shadow-lg"
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          4. ARTICLE BODY
          ══════════════════════════════════════════════════════ */}
      <article>
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
          {/* Decorative divider */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-1 w-1 rounded-full bg-primary/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          {/* Rich content */}
          <ScrollFadeIn animation="fade-up" delay={100}>
            <RichContentRenderer content={blog.content} className="text-base md:text-[1.0625rem]" />
          </ScrollFadeIn>
        </div>

        {/* Gallery */}
        {blog.gallery && blog.gallery.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 pb-12">
            <ScrollFadeIn animation="fade-up" delay={100}>
              <section className="max-w-5xl mx-auto">
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
                          alt={`${blog.title} — ${isIT ? 'immagine' : 'image'} ${i + 1}`}
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
          </div>
        )}
      </article>

      {/* ══════════════════════════════════════════════════════
          5. STATIC FAQ
          ══════════════════════════════════════════════════════ */}
      <section className="bg-primary/5 border-y border-primary/10 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center mb-10">
              <Badge className="badge-futuristic mb-4 bg-primary/10 text-primary border-primary/20">
                FAQ
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {isIT ? 'Domande Frequenti' : 'Frequently Asked Questions'}
              </h2>
              <div className="mt-3 flex items-center justify-center gap-1">
                <div className="h-0.5 w-8 bg-primary/50 rounded-full" />
                <div className="h-0.5 w-3 bg-primary/25 rounded-full" />
              </div>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn animation="fade-up" delay={100}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="holographic-card neon-border rounded-xl border-0 px-5"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-5 hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. END CTA SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-clip bg-[#0a1628] bg-circuit">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <ScrollFadeIn animation="fade-up">
            <Badge className="badge-futuristic mb-6 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Studio Faraj
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              {isIT ? 'Hai un progetto in mente?' : 'Got a project in mind?'}
            </h2>
            <p className="text-white/70 mb-8 text-lg leading-relaxed">
              {isIT
                ? 'Trasformiamo le tue idee in esperienze digitali straordinarie. Contattaci per una consulenza gratuita.'
                : "We turn your ideas into extraordinary digital experiences. Contact us for a free consultation."}
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link href={`/${locale}/contatti`}>
                {isIT ? 'Parliamo del tuo progetto' : "Let's talk about your project"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. AUTHOR + DATE CARD
          ══════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <ScrollFadeIn animation="fade-up">
          <div className="holographic-card neon-border rounded-xl p-5 sm:p-6 flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-5">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {blog.author || 'Studio Faraj Team'}
              </p>
              <p suppressHydrationWarning className="text-sm text-muted-foreground mt-0.5">
                {publishedLabel} {formattedDate}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs hover:border-primary/40"
              >
                <Link href={`/${locale}/blog`}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {backLabel}
                </Link>
              </Button>
            </div>
          </div>
        </ScrollFadeIn>
      </div>

      {/* ══════════════════════════════════════════════════════
          8. STUDIO FARAJ SERVICES BLOCK
          ══════════════════════════════════════════════════════ */}
      <section className="border-t border-border/30 py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollFadeIn animation="fade-up">
            <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wider mb-5">
              {isIT ? 'I nostri servizi' : 'Our services'}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {contactServices
                .filter((s) => s.value !== 'altro')
                .map((service) => (
                  <Link
                    key={service.value}
                    href={`/${locale}/servizi/${service.value}`}
                    className="holographic-card neon-border rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200"
                  >
                    {service.label}
                  </Link>
                ))}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          9. NEWSLETTER SIGNUP
          ══════════════════════════════════════════════════════ */}
      <section className="bg-primary/5 border-y border-primary/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-xl text-center">
          <ScrollFadeIn animation="fade-up">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <Mail className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {isIT ? 'Ricevi gli ultimi articoli' : 'Get the latest articles'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {isIT
                ? 'Iscriviti alla newsletter e resta aggiornato sulle ultime novità dal mondo del digitale.'
                : 'Subscribe to our newsletter and stay updated on the latest from the digital world.'}
            </p>
            <form
              action={newsletterDispatch}
              className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto"
            >
              <input type="hidden" name="locale" value={locale} />
              <Input
                name="email"
                type="email"
                placeholder={isIT ? 'La tua email…' : 'Your email…'}
                required
                className="flex-1"
              />
              <Button type="submit" className="shrink-0 gap-1.5">
                {isIT ? 'Iscriviti' : 'Subscribe'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            {newsletterState?.message && (
              <p className="mt-3 text-sm text-muted-foreground">{newsletterState.message}</p>
            )}
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          10. RELATED ARTICLES
          ══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="relative border-t border-border/20 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
            <ScrollFadeIn animation="fade-up">
              <div className="text-center mb-12">
                <Badge className="badge-futuristic mb-4 bg-primary/10 text-primary border-primary/20">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  {isIT ? 'Continua a leggere' : 'Keep reading'}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{relatedLabel}</h2>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <div className="h-1 w-3 bg-primary/20 rounded-full" />
                  <div className="h-1 w-8 bg-primary/50 rounded-full" />
                  <div className="h-1 w-3 bg-primary/20 rounded-full" />
                </div>
              </div>
            </ScrollFadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {related.map((post, idx) => (
                <ScrollFadeIn key={post.id} animation="fade-up" delay={idx * 120} className="h-full">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-xl overflow-hidden holographic-card neon-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                  >
                    {post.featuredImage ? (
                      <div className="relative h-48 shrink-0 overflow-hidden">
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
                      <div className="h-48 shrink-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center neon-border">
                          <BookOpen className="h-6 w-6 text-primary/40" />
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <p
                        suppressHydrationWarning
                        className="text-[10px] text-muted-foreground/50 mb-2 font-semibold uppercase tracking-widest"
                      >
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
                      <div className="mt-auto pt-3 flex items-center gap-1 text-xs text-primary/60 font-medium group-hover:text-primary transition-colors">
                        <span>{isIT ? 'Leggi' : 'Read'}</span>
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
