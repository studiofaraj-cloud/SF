import type { CSSProperties, ReactNode } from 'react';

type ScrollFadeInProps = {
  children: ReactNode;
  className?: string;
  /** Kept for existing callers; every variant uses the same rise. */
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  /** Stagger in ms; each 100 ms is one step of the CSS reveal's offset. */
  delay?: number;
};

/**
 * Reveals its content as it scrolls into view, with the site's CSS scroll
 * reveal (.rv in globals.css). The content is visible by default: without
 * support for scroll-driven animations, with reduced motion, without
 * JavaScript and for crawlers, it simply shows. No script, no listeners.
 */
export default function ScrollFadeIn({ children, className = '', delay = 0 }: ScrollFadeInProps) {
  return (
    <div className={`rv ${className}`} style={delay ? ({ '--i': Math.min(4, Math.round(delay / 100)) } as CSSProperties) : undefined}>
      {children}
    </div>
  );
}
