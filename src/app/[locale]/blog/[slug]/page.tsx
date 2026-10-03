import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import { getBlogBySlugAction, getBlogsAction } from '@/lib/actions';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { BlogCard } from '@/components/site/blog-card';
import HomeCtaSection from '@/components/site/home-cta-section';
import { RichContentRenderer } from '@/components/site/rich-content-renderer';
import { SectionEdge } from '@/components/site/section-edge';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataBlogPosting,
  generateStructuredDataBreadcrumbList,
  siteConfig,
} from '@/lib/seo';
import type { Locale } from '@/i18n/config';
import type { Blog } from '@/lib/definitions';
import { setRequestLocale } from 'next-intl/server';
import { formatPostDate, readingMinutes, toListItem } from '@/lib/blog-list';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cleanBlogDoc, type JSONNode } from '@/lib/blog-content';
import { articleOutline, parseTiptap, type TiptapDocument } from '@/lib/tiptap-outline';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';

const COPY = {
  it: {
    minutes: (n: number) => `${n} min di lettura`,
    toc: 'In questa guida',
    gallery: 'Immagini',
    image: 'immagine',
    by: 'Scritto da',
    published: 'pubblicato il',
    all: 'Tutti gli articoli',
    more: 'Continua a leggere',
  },
  en: {
    minutes: (n: number) => `${n} min read`,
    toc: 'In this guide',
    gallery: 'Images',
    image: 'image',
    by: 'Written by',
    published: 'published on',
    all: 'All articles',
    more: 'Keep reading',
  },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ─── Static params ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const blogs = await getBlogsAction();
    const locales = ['it', 'en'];
    return locales.flatMap((locale) =>
      blogs
        .filter((b: Blog) => b.published)
        .map((b: Blog) => ({ locale, slug: b.slug }))
    );
  } catch {
    return [];
  }
}

// ─── SEO Metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;

  // A failed read throws rather than falling through to "not found" — see the page below.
  const blog: Blog | null = await getBlogBySlugAction(slug);

  if (!blog || !blog.published) {
    return { title: 'Articolo non trovato | Studio Faraj' };
  }

  const baseUrl = `${siteConfig.url}/${currentLocale}/blog/${slug}`;
  const alternateUrls = {
    it: `${siteConfig.url}/it/blog/${slug}`,
    en: `${siteConfig.url}/en/blog/${slug}`,
  };

  return generateSEOMetadata({
    title: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage || siteConfig.ogImage,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
    // A post has one set of Firestore text fields, so /en/blog/{slug} serves the
    // identical document as /it/blog/{slug}. Canonicalise both to the Italian
    // URL instead of claiming a translation exists.
    defaultLocaleOnly: true,
    type: 'article',
    publishedTime: blog.createdAt,
    modifiedTime: blog.updatedAt,
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

/**
 * A blog post — server component, so the article reaches the browser once,
 * as HTML. A navy header with the title, the cover over its curve, a table of
 * contents when the post has sections, the article, then more posts and the
 * closing call to action. The reading bar on top is CSS only.
 */
export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const lang = (locale === 'en' ? 'en' : 'it') as Locale;
  setRequestLocale(lang);
  const copy = COPY[lang];

  // Only a post that doesn't exist is a 404: a failed read throws, so Next
  // keeps serving the last good version of this page instead of caching
  // "not found" for a real article.
  const blog: Blog | null = await getBlogBySlugAction(slug);
  if (!blog || !blog.published) notFound();

  // Other published posts, newest first (non-critical).
  let related: Blog[] = [];
  try {
    related = ((await getBlogsAction()) as Blog[])
      .filter((b) => b.published && b.slug !== slug)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  } catch {
    // leave the section out
  }

  const minutes = readingMinutes(blog.content);
  const date = formatPostDate(blog.createdAt, lang);
  // Same clean-up as the renderer, so the contents links match the headings shown.
  const parsed = parseTiptap(blog.content);
  const doc = parsed ? (cleanBlogDoc(parsed as JSONNode).doc as TiptapDocument) : null;
  const outline = doc ? articleOutline(doc, blog.title) : [];
  const postUrl = `${siteConfig.url}/${lang}/blog/${slug}`;

  const blogPostingSD = generateStructuredDataBlogPosting(
    blog.title,
    blog.excerpt,
    postUrl,
    blog.featuredImage || siteConfig.ogImage,
    blog.createdAt,
    blog.updatedAt,
    siteConfig.name,
    blog.gallery,
  );
  const breadcrumbSD = generateStructuredDataBreadcrumbList([
    { name: 'Home', url: `${siteConfig.url}/${lang}` },
    { name: 'Blog', url: `${siteConfig.url}/${lang}/blog` },
    { name: blog.title, url: postUrl },
  ]);

  return (
    <>
      <StructuredDataServer data={[blogPostingSD, breadcrumbSD]} />
      <div className="bg-background text-foreground">
        <div aria-hidden className="read-progress" />

        <header
          data-dark-top
          className={`relative overflow-clip bg-navy pt-32 text-white md:pt-40 ${blog.featuredImage ? 'pb-44 md:pb-64' : 'pb-24 md:pb-32'}`}
        >
          <div aria-hidden className="pointer-events-none absolute -top-48 right-[-12%] h-[38rem] w-[38rem] rounded-full bg-blue-500/30 blur-[100px]" />
          <div className="container relative mx-auto max-w-5xl px-5 md:px-8">
            <p className={`${MONO} text-white/55`}>
              <Link href={getLocalizedPath('/blog', lang)} className="transition-colors hover:text-white">
                Blog
              </Link>
              <span aria-hidden> · </span>
              <time dateTime={blog.createdAt}>{date}</time>
              <span aria-hidden> · </span>
              {copy.minutes(minutes)}
            </p>
            <h1 className="mt-6 text-balance font-display text-[2.3rem] font-extrabold leading-[1.03] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]">
              {blog.title}
            </h1>
            {/* `whitespace-pre-line` keeps the line breaks typed in the admin textarea. */}
            {blog.excerpt && (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-white/70 md:text-xl md:leading-relaxed">{blog.excerpt}</p>
            )}
          </div>
          <SectionEdge shape="arc" edge="bottom" />
        </header>

        {blog.featuredImage && (
          <div className="container relative mx-auto -mt-36 max-w-5xl px-5 md:-mt-56 md:px-8">
            <div className="relative aspect-video overflow-clip rounded-[24px] bg-muted shadow-[0_40px_90px_-40px_rgba(10,22,40,0.5)] ring-1 ring-border">
              <Image src={blog.featuredImage} alt={blog.title} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" />
            </div>
          </div>
        )}

        <div className="container mx-auto px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20">
          <div className="mx-auto max-w-[70ch]">
            {outline.length > 0 && (
              <nav aria-labelledby="toc-title" className="mb-12 rounded-2xl bg-muted/60 p-6 ring-1 ring-border md:p-7">
                <p id="toc-title" className={`${MONO} text-muted-foreground`}>{copy.toc}</p>
                <ol className="mt-4 grid list-decimal gap-x-10 gap-y-2.5 pl-5 text-[15px] leading-snug marker:text-muted-foreground sm:grid-cols-2">
                  {outline.map((h) => (
                    <li key={h.id} className="pl-1">
                      <a href={`#${h.id}`} className="text-foreground/80 transition-colors hover:text-primary">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <RichContentRenderer content={blog.content} variant="article" title={blog.title} />

            {blog.gallery && blog.gallery.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{copy.gallery}</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
                  {blog.gallery.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-clip rounded-2xl bg-muted ring-1 ring-border">
                      <Image src={src} alt={`${blog.title} — ${copy.image} ${i + 1}`} fill sizes="(min-width: 768px) 340px, 50vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <footer className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
              <p>
                {copy.by} <span className="font-medium text-foreground">{blog.author || siteConfig.name}</span>, {copy.published}{' '}
                <time dateTime={blog.createdAt}>{date}</time>
              </p>
              <Link
                href={getLocalizedPath('/blog', lang)}
                className="font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
              >
                {copy.all}
              </Link>
            </footer>
          </div>
        </div>

        {related.length > 0 && (
          <section className="container mx-auto px-5 pb-24 md:px-8 md:pb-32">
            <h2 className="font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]">{copy.more}</h2>
            <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b, i) => (
                <li key={b.slug} className="rv" style={{ '--i': i } as CSSProperties}>
                  <BlogCard post={toListItem(b)} locale={lang} heading="h3" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <HomeCtaSection locale={lang} />
      </div>
    </>
  );
}
