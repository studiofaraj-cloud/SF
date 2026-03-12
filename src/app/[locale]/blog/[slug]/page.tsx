import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getBlogBySlugAction, getBlogsAction } from '@/lib/actions';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { BlogPostClient } from '@/components/site/blog-post-client';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataBlogPosting,
  generateStructuredDataBreadcrumbList,
  siteConfig,
} from '@/lib/seo';
import type { Locale } from '@/i18n/config';
import type { Blog } from '@/lib/definitions';
import { setRequestLocale } from 'next-intl/server';
import { estimateReadingTime } from '@/lib/tiptap-utils';

// ─── Date helpers (server-only, no locale mismatch) ───────────────────────────
const IT_MONTHS = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDateServer(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const day = d.getUTCDate();
  const month = locale === 'it' ? IT_MONTHS[d.getUTCMonth()] : EN_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

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

  let blog: Blog | null = null;
  try {
    blog = await getBlogBySlugAction(slug);
  } catch {
    // handled below
  }

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
    type: 'article',
    publishedTime: blog.createdAt,
    modifiedTime: blog.updatedAt,
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;
  setRequestLocale(currentLocale);

  // Fetch post
  let blog: Blog | null = null;
  try {
    blog = await getBlogBySlugAction(slug);
  } catch {
    notFound();
  }

  if (!blog || !blog.published) notFound();

  // Related posts (other published posts, up to 3)
  let related: Blog[] = [];
  try {
    const all = await getBlogsAction();
    related = (all as Blog[])
      .filter((b) => b.published && b.slug !== slug)
      .slice(0, 3);
  } catch {
    // non-critical
  }

  // Reading time
  let readingTime = 1;
  try {
    readingTime = estimateReadingTime(blog.content);
  } catch {
    // fallback to 1 min
  }

  const postUrl = `${siteConfig.url}/${currentLocale}/blog/${slug}`;

  // Structured data
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
    { name: 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: 'Blog', url: `${siteConfig.url}/${currentLocale}/blog` },
    { name: blog.title, url: postUrl },
  ]);

  return (
    <>
      <StructuredDataServer data={[blogPostingSD, breadcrumbSD]} />
      <BlogPostClient
        blog={blog}
        related={related}
        locale={currentLocale}
        readingTime={readingTime}
        formattedDate={formatDateServer(blog.createdAt, currentLocale)}
        relatedDates={related.map(r => formatDateServer(r.createdAt, currentLocale))}
      />
    </>
  );
}
