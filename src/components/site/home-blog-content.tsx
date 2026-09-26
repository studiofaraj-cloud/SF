import Link from 'next/link';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';

export type HomeBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  minutes: number;
};

const COPY = {
  it: {
    title: 'Dal blog',
    lead: 'Guide pratiche su siti web, SEO e prestazioni, scritte da chi le mette in pratica ogni giorno.',
    all: 'Tutti gli articoli',
    minutes: (n: number) => `${n} min di lettura`,
  },
  en: {
    title: 'From the blog',
    lead: 'Practical guides on websites, SEO and performance, written by people who apply them every day.',
    all: 'All articles',
    minutes: (n: number) => `${n} min read`,
  },
} as const;

/** Latest articles as a text index (date, title, excerpt) — server component. */
export function HomeBlogContent({ posts, locale }: { posts: HomeBlogPost[]; locale: Locale }) {
  if (posts.length === 0) return null;
  const copy = COPY[locale];
  const dateFormat = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="bg-background py-20 md:py-28 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:col-span-6 md:text-[3.4rem]">
            {copy.title}
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lg leading-relaxed text-muted-foreground">{copy.lead}</p>
            <Link
              href={getLocalizedPath('/blog', locale)}
              className="mt-4 inline-block font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
            >
              {copy.all}
            </Link>
          </div>
        </header>

        <ul className="mt-12 divide-y divide-border border-y border-border md:mt-16">
          {posts.map((post) => (
            <li key={post.id || post.slug} className="group relative grid gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-10">
              <p className="text-sm text-muted-foreground md:col-span-3">
                {post.createdAt && <time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time>}
                <span className="block">{copy.minutes(post.minutes)}</span>
              </p>
              <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary md:col-span-5 md:text-2xl">
                <Link
                  href={getLocalizedPath(`/blog/${post.slug}`, locale)}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="line-clamp-3 leading-relaxed text-muted-foreground md:col-span-4">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
