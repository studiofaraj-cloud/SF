import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ScrollFadeIn from '@/components/site/scroll-fade-in';

interface SectionHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  /** Optional accent portion of the title, rendered in the primary colour. */
  titleHighlight?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  /** Wrap in a scroll-reveal animation (default true). */
  animate?: boolean;
  className?: string;
}

/**
 * Single source of truth for home-page section headers.
 * Replaces the six hand-rolled header variants so every section shares one
 * eyebrow style and type scale (aligned with the projects detail page).
 */
export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  titleHighlight,
  subtitle,
  align = 'center',
  animate = true,
  className,
}: SectionHeaderProps) {
  const content = (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {eyebrowIcon}
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
        {title}
        {titleHighlight && <span className="text-primary"> {titleHighlight}</span>}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-muted-foreground md:text-lg',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (!animate) return content;
  return <ScrollFadeIn animation="fade-up">{content}</ScrollFadeIn>;
}
