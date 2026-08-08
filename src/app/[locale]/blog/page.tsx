import { getBlogsAction } from '@/lib/actions';
import { BlogListClient } from '@/components/site/blog-list-client';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataPageBreadcrumb } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

/**
 * Breadcrumb lives here rather than in blog/layout.tsx: that layout also wraps
 * blog/[slug], which emits its own three-level trail. Two BreadcrumbList nodes
 * on one page give Google contradictory trails.
 */
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';

  const breadcrumb = (
    <StructuredDataServer
      data={generateStructuredDataPageBreadcrumb(lang, { name: 'Blog', path: '/blog' })}
      id="blog-breadcrumb"
    />
  );

  try {
    const blogs = await getBlogsAction();
    return (
      <>
        {breadcrumb}
        <BlogListClient blogs={blogs || []} />
      </>
    );
  } catch (error) {
    // Gracefully handle Firestore connection errors during build
    // Return empty array if Firestore is unavailable (offline mode or build time)
    console.warn('Failed to fetch blogs, using empty array:', error);
    return (
      <>
        {breadcrumb}
        <BlogListClient blogs={[]} />
      </>
    );
  }
}
