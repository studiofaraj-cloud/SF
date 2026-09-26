'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Labels = { rail: string; prev: string; next: string; hint: string };

const pad = (n: number) => String(n).padStart(2, '0');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Horizontal rail for the homepage's recent work. The slides are
 * server-rendered and passed in as children (<li data-slide>); this island
 * adds the arrows, the counter and progress, and drag-to-scroll for mice.
 * Touch, trackpads and the keyboard use native scrolling and scroll snap.
 * Sizes and the grid alignment live in globals.css (.work-rail).
 */
export function WorkRail({ count, labels, children }: { count: number; labels: Labels; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Where each slide snaps to, clamped to how far the rail can scroll.
  const snapPoints = useCallback(() => {
    const el = track.current!;
    const inset = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    return [...el.querySelectorAll<HTMLElement>(':scope > [data-slide]')].map((s) =>
      Math.max(0, Math.min(s.offsetLeft - inset, max)),
    );
  }, []);

  const nearest = (left: number, points: number[]) =>
    points.reduce((best, p, i) => (Math.abs(p - left) < Math.abs(points[best] - left) ? i : best), 0);

  // Counter, progress and arrow states follow the scroll position.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const points = snapPoints();
      setIndex(Math.min(nearest(el.scrollLeft, points), count - 1));
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      el.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, [count, snapPoints]);

  // Drag to scroll with a mouse. Snap is off while dragging, then the rail
  // settles on the nearest slide; a drag never counts as a click on a link.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let pointer: number | null = null;
    let dragged = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pointer = e.pointerId;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      dragged = false;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) > 6) {
        dragged = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      }
      if (dragged) el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      if (!dragged) return;
      el.classList.remove('is-dragging');
      const points = snapPoints();
      el.scrollTo({ left: points[nearest(el.scrollLeft, points)], behavior: reducedMotion() ? 'auto' : 'smooth' });
    };
    const click = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };
    const noNativeDrag = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    el.addEventListener('dragstart', noNativeDrag);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('dragstart', noNativeDrag);
    };
  }, [snapPoints]);

  const go = (step: 1 | -1) => {
    const el = track.current!;
    const points = snapPoints();
    const target = points[Math.max(0, Math.min(points.length - 1, nearest(el.scrollLeft, points) + step))];
    el.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const arrow =
    'grid h-11 w-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30 md:h-12 md:w-12';

  return (
    <>
      <ul
        ref={track}
        tabIndex={0}
        aria-label={labels.rail}
        className="work-rail relative -my-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-6 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      <div className="container mx-auto mt-8 flex items-center gap-4 px-5 md:mt-10 md:gap-6 md:px-8">
        <p aria-live="polite" className="shrink-0 font-mono text-sm tabular-nums">
          <span className="text-foreground">{pad(index + 1)}</span>
          <span className="text-muted-foreground"> / {pad(count)}</span>
        </p>
        <div aria-hidden className="flex min-w-0 flex-1 gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={cn('h-[3px] flex-1 rounded-full transition-colors duration-300', i <= index ? 'bg-foreground' : 'bg-border')}
            />
          ))}
        </div>
        <p className="hidden shrink-0 font-mono text-xs text-muted-foreground lg:block">{labels.hint}</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label={labels.prev} disabled={edges.start} onClick={() => go(-1)} className={arrow}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label={labels.next} disabled={edges.end} onClick={() => go(1)} className={arrow}>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
