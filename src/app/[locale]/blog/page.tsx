import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { BlogCard } from '@/components/site/blog-card';
import { BrandMark } from '@/components/site/brand-mark';
import HomeCtaSection from '@/components/site/home-cta-section';
import { SectionEdge } from '@/components/site/section-edge';
import { formatPostDate, getPublishedPosts, type BlogListItem } from '@/lib/blog-list';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { generateStructuredDataPageBreadcrumb } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';

const COPY = {
  it: {
    title: ['Guide su siti web,', 'SEO e prestazioni.'],
    lead: 'Scritte da chi le mette in pratica ogni giorno: come farsi trovare su Google, come rendere un sito veloce e come scegliere come costruirlo.',
    note: '',
    latest: 'Ultimo articolo',
    empty: 'Non ci sono ancora articoli pubblicati: torna a trovarci presto.',
  },
  en: {
    title: ['Guides on websites,', 'SEO and performance.'],
    lead: 'Written by people who apply them every day: how to get found on Google, how to make a site fast and how to choose how to build it.',
    note: 'The articles are written in Italian.',
    latest: 'Latest article',
    empty: 'No articles have been published yet: check back soon.',
  },
} as const;

/**
 * /blog — server component. A navy masthead, the latest post as a card over
 * its curve, then every other post in a grid. Only the summary fields reach
 * the page, never the article bodies.
 */
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const copy = COPY[lang];

  let posts: BlogListItem[] = [];
  try {
    posts = await getPublishedPosts();
  } catch (error) {
    // Firestore unavailable with nothing cached: the page says there is nothing yet.
    console.warn('Failed to fetch blogs:', error);
  }
  const [latest, ...rest] = posts;

  return (
    <>
      {/* The breadcrumb lives here, not in blog/layout.tsx: that layout also
          wraps blog/[slug], which emits its own three-level trail. */}
      <StructuredDataServer data={generateStructuredDataPageBreadcrumb(lang, { name: 'Blog', path: '/blog' })} id="blog-breadcrumb" />
      <div className="bg-background text-foreground">
        <section data-dark-top className="relative overflow-clip bg-navy pb-40 pt-32 text-white md:pb-52 md:pt-40">
          <div aria-hidden className="pointer-events-none absolute -top-48 right-[-12%] h-[38rem] w-[38rem] rounded-full bg-blue-500/30 blur-[100px]" />
          <div className="container relative mx-auto px-5 md:px-8">
            <p className={`${MONO} text-white/55`}>Blog</p>
            <h1 className="mt-7 font-display text-[2.9rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-[4.6rem]">
              {copy.title[0]} <span className="block">{copy.title[1]}</span>
            </h1>
            <p className="mt-7 max-w-[36rem] text-lg leading-relaxed text-white/70 sm:text-xl sm:leading-relaxed">{copy.lead}</p>
            {copy.note && <p className="mt-3 text-sm text-white/50">{copy.note}</p>}
          </div>
          <SectionEdge shape="arc" edge="bottom" />
        </section>

        <section className="container relative mx-auto -mt-28 px-5 md:-mt-36 md:px-8">
          {latest ? (
            <article className="group relative grid gap-6 rounded-[28px] bg-card p-3 shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] ring-1 ring-border md:grid-cols-[7fr_5fr] md:items-center md:gap-10 md:p-4">
              <div className="relative aspect-video overflow-clip rounded-[20px] bg-navy">
                {latest.image ? (
                  <Image src={latest.image} alt="" fill priority sizes="(min-width: 1280px) 680px, (min-width: 768px) 56vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                ) : (
                  <BrandMark id="blog-latest-mark" className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-white/25" />
                )}
              </div>
              <div className="px-3 pb-5 md:py-6 md:pl-0 md:pr-8">
                <p className={`${MONO} text-primary`}>{copy.latest}</p>
                <h2 className="mt-4 font-display text-[1.7rem] font-bold leading-[1.1] tracking-[-0.02em] transition-colors group-hover:text-primary md:text-[2.1rem]">
                  <Link
                    href={getLocalizedPath(`/blog/${latest.slug}`, lang)}
                    className="after:absolute after:inset-0 after:rounded-[28px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  >
                    {latest.title}
                  </Link>
                </h2>
                {latest.excerpt && <p className="mt-4 line-clamp-3 leading-relaxed text-muted-foreground">{latest.excerpt}</p>}
                <p className={`${MONO} mt-6 text-muted-foreground`}>
                  <time dateTime={latest.createdAt}>{formatPostDate(latest.createdAt, lang)}</time>
                  <span aria-hidden> · </span>
                  {latest.minutes} min
                </p>
              </div>
            </article>
          ) : (
            <p className="rounded-[28px] bg-card p-10 text-center text-muted-foreground shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] ring-1 ring-border">{copy.empty}</p>
          )}
        </section>

        <div className="container mx-auto px-5 pb-24 pt-20 md:px-8 md:pb-32 md:pt-24">
          {rest.length > 0 && (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <li key={post.slug} className="rv" style={{ '--i': i % 3 } as CSSProperties}>
                  <BlogCard post={post} locale={lang} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <HomeCtaSection locale={lang} />
      </div>
    </>
  );
}
