import { cn } from '@/lib/utils';

/*
 * Shapes are drawn for a band's bottom edge (viewBox 0 0 1440 72): the filled
 * region is what gets cut away, below the navy's new edge. A top edge uses
 * the same path mirrored vertically.
 */
const SHAPES = {
  // Hero: one shallow arc, deepest in the middle ("orizzonte").
  arc: {
    d: 'M0 0C260 46 480 72 720 72S1180 46 1440 0V72H0Z',
    height: 'h-[calc(clamp(24px,5vw,72px)_+_1px)]',
  },
  // Stack, rising out of the process: four even steps, one per phase.
  steps: {
    d: 'M0 0H360V24H720V48H1080V72H0Z',
    height: 'h-[calc(clamp(18px,3.5vw,48px)_+_1px)]',
  },
  // Stack, into the studio: one long, uneven wave.
  wave: {
    d: 'M0 40C180 64 300 74 440 70C640 64 820 6 1080 8C1240 10 1360 24 1440 32V72H0Z',
    height: 'h-[calc(clamp(24px,5vw,72px)_+_1px)]',
  },
} as const;

/**
 * Shaped edge of a navy band. It is cut inside the band in the page
 * background colour, so it adds no space between sections.
 *
 * The band needs `relative` and enough padding on that edge (72px at most),
 * and the neighbouring section must use bg-background. The SVG runs 1px past
 * the edge so a fractional section height can't leave a navy hairline.
 */
export function SectionEdge({ shape, edge }: { shape: keyof typeof SHAPES; edge: 'top' | 'bottom' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute inset-x-0 w-full text-background',
        SHAPES[shape].height,
        edge === 'bottom' ? '-bottom-px' : '-top-px -scale-y-100',
      )}
    >
      <path fill="currentColor" d={SHAPES[shape].d} />
    </svg>
  );
}
