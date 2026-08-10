'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import ScrollFadeIn from '@/components/site/scroll-fade-in';

interface ServiceItem {
  icon: ReactNode;
  title: string;
  description: string;
  slug: string;
}

interface ServicesGridProps {
  services: ServiceItem[];
  learnMoreLabel?: string;
}

/**
 * Compact, scannable services grid — replaces the scroll-jacked sticky
 * showcase. All services are visible at once (1 col mobile → 2 tablet →
 * 4 desktop) with a restrained card treatment that matches the projects page.
 */
export function ServicesGrid({ services, learnMoreLabel }: ServicesGridProps) {
  const locale = useLocale();
  const learn = learnMoreLabel ?? (locale === 'en' ? 'Learn more' : 'Scopri di più');

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service, index) => (
        <ScrollFadeIn key={service.slug} animation="fade-up" delay={Math.min(index, 4) * 60}>
          <Link
            href={getLocalizedPath(`/servizi/${service.slug}`, locale as 'it' | 'en')}
            title={service.title}
            className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 [&>svg]:h-6 [&>svg]:w-6">
              {service.icon}
            </span>
            <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {service.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {learn}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </ScrollFadeIn>
      ))}
    </div>
  );
}
