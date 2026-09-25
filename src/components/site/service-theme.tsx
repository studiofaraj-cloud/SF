import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ChevronDown, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';

/**
 * Building blocks shared by the /servizi/* pages, so the sections added after
 * the original design (local SEO copy, FAQ, related links, the gestionale
 * page) look like the hero/features sections above them.
 *
 * The markup mirrors what the service pages write inline. Class names are
 * spelled out in full per accent because Tailwind only generates classes it
 * can find verbatim in src/{app,components,pages} — keep this file there.
 *
 * No hooks and no ScrollFadeIn: these blocks render in server components and
 * their text must be visible in the initial HTML.
 */

export type ServiceAccent =
  | 'pink'
  | 'emerald'
  | 'violet'
  | 'teal'
  | 'orange'
  | 'indigo'
  | 'fuchsia'
  | 'cyan';

interface AccentClasses {
  text: string;
  badge: string;
  iconTile: string;
  hoverShadow: string;
  hoverText: string;
  groupHoverText: string;
  openBorder: string;
}

export const SERVICE_ACCENTS: Record<ServiceAccent, AccentClasses> = {
  pink: {
    text: 'text-pink-400',
    badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    iconTile: 'bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-pink-500/20',
    hoverText: 'hover:text-pink-400',
    groupHoverText: 'group-hover:text-pink-400',
    openBorder: 'open:border-pink-500/50',
  },
  emerald: {
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconTile: 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-emerald-500/20',
    hoverText: 'hover:text-emerald-400',
    groupHoverText: 'group-hover:text-emerald-400',
    openBorder: 'open:border-emerald-500/50',
  },
  violet: {
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    iconTile: 'bg-violet-500/20 text-violet-400 group-hover:bg-violet-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-violet-500/20',
    hoverText: 'hover:text-violet-400',
    groupHoverText: 'group-hover:text-violet-400',
    openBorder: 'open:border-violet-500/50',
  },
  teal: {
    text: 'text-teal-400',
    badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    iconTile: 'bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-teal-500/20',
    hoverText: 'hover:text-teal-400',
    groupHoverText: 'group-hover:text-teal-400',
    openBorder: 'open:border-teal-500/50',
  },
  orange: {
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    iconTile: 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-orange-500/20',
    hoverText: 'hover:text-orange-400',
    groupHoverText: 'group-hover:text-orange-400',
    openBorder: 'open:border-orange-500/50',
  },
  indigo: {
    text: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    iconTile: 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-indigo-500/20',
    hoverText: 'hover:text-indigo-400',
    groupHoverText: 'group-hover:text-indigo-400',
    openBorder: 'open:border-indigo-500/50',
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    badge: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    iconTile: 'bg-fuchsia-500/20 text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-fuchsia-500/20',
    hoverText: 'hover:text-fuchsia-400',
    groupHoverText: 'group-hover:text-fuchsia-400',
    openBorder: 'open:border-fuchsia-500/50',
  },
  cyan: {
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    iconTile: 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
    hoverShadow: 'hover:shadow-cyan-500/20',
    hoverText: 'hover:text-cyan-400',
    groupHoverText: 'group-hover:text-cyan-400',
    openBorder: 'open:border-cyan-500/50',
  },
};

/** Section shell with the two backgrounds the service pages alternate. */
export function ServiceSection({
  background,
  id,
  children,
}: {
  background: 'gradient' | 'band';
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative py-20 md:py-32 overflow-hidden">
      {background === 'gradient' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
          <div className="absolute inset-0 bg-constellation opacity-50" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-secondary/50" />
          <div className="absolute inset-0 bg-circuit opacity-30" />
        </>
      )}

      <div className="container relative z-10 px-4 sm:px-6 md:px-8">{children}</div>
    </section>
  );
}

/** Badge + two-tone H2 (+ optional subtitle), centred. */
export function ServiceSectionHeader({
  accent,
  icon: Icon,
  badge,
  title,
  highlight,
  subtitle,
}: {
  accent: ServiceAccent;
  icon: LucideIcon;
  badge: string;
  title: string;
  highlight: string;
  subtitle?: string;
}) {
  const a = SERVICE_ACCENTS[accent];
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <Badge className={`badge-futuristic mb-4 ${a.badge}`}>
        <Icon className="w-4 h-4 mr-2" />
        {badge}
      </Badge>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
        <span className="text-foreground">{title}</span>{' '}
        <span className={`block ${a.text}`}>{highlight}</span>
      </h2>
      {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

/** The icon card used by the "features" grids. */
export function ServiceFeatureCard({
  accent,
  icon: Icon,
  title,
  children,
}: {
  accent: ServiceAccent;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  const a = SERVICE_ACCENTS[accent];
  return (
    <Card className={`h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${a.hoverShadow} group`}>
      <CardContent className="p-6">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${a.iconTile}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${a.text}`}>{title}</h3>
        <p className="text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}

/**
 * FAQ list. Native <details> rather than the Radix accordion so the answers
 * are in the server HTML (the pages also emit them as FAQPage JSON-LD).
 */
export function ServiceFaq({
  accent,
  faqs,
}: {
  accent: ServiceAccent;
  faqs: { question: string; answer: string }[];
}) {
  const a = SERVICE_ACCENTS[accent];
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((f) => (
        <details
          key={f.question}
          className={`group rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm px-5 transition-all open:shadow-lg open:shadow-primary/10 ${a.openBorder}`}
        >
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-foreground transition-colors [&::-webkit-details-marker]:hidden ${a.hoverText}`}>
            <h3 className="text-left text-base sm:text-lg">{f.question}</h3>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180 ${a.text}`}
              aria-hidden="true"
            />
          </summary>
          <p className="pb-4 text-muted-foreground leading-relaxed">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** "Servizi collegati" link cards. Only used on Italian-only content. */
export function ServiceRelated({
  accent,
  links,
  locale,
}: {
  accent: ServiceAccent;
  links: { href: string; label: string }[];
  locale: Locale;
}) {
  const a = SERVICE_ACCENTS[accent];
  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
        <span className="text-foreground">Servizi</span>{' '}
        <span className={a.text}>collegati</span>
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {links.map((r) => (
          <li key={r.href}>
            <Link
              href={getLocalizedPath(r.href, locale)}
              className={`group flex h-full items-center justify-between gap-4 rounded-xl holographic-card neon-border bg-card/80 backdrop-blur-sm px-5 py-4 font-medium text-foreground transition-all duration-300 hover:shadow-lg ${a.hoverShadow}`}
            >
              <span className={`transition-colors ${a.groupHoverText}`}>{r.label}</span>
              <ArrowRight
                className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${a.text}`}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
