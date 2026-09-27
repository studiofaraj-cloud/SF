'use client';

import { useEffect, useRef, useState } from 'react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { cn } from '@/lib/utils';

type Item = { src: string; host: string };

// Kept smaller in area than the page's h1 (~73,000px²), so a hover before the
// first scroll can't become the page's Largest Contentful Paint.
const WIDTH = 296; // px, the preview card
const HEIGHT = 220; // px, roughly: address bar + a 16:10 screenshot

/**
 * Floating preview for the projects index (mouse users only; touch screens
 * get a thumbnail in each row instead, see .pi-* in globals.css). Hovering a
 * row (<a data-preview={index}>) shows that site's screenshot in a small
 * browser frame that trails the cursor. The screenshots only load once the
 * pointer first enters the list, so visitors who never hover (and crawlers)
 * don't download them. Purely decorative: aria-hidden.
 */
export function ProjectsPreview({ listId, items }: { listId: string; items: Item[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = document.getElementById(listId);
    const el = box.current;
    if (!list || !el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let placed = false;
    const place = () => {
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    };
    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      place();
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      // Beside the cursor, kept inside the viewport.
      x = Math.min(e.clientX + 28, window.innerWidth - WIDTH - 16);
      y = Math.max(16, Math.min(e.clientY - HEIGHT / 2, window.innerHeight - HEIGHT - 16));
      if (reduced || !placed) {
        cx = x;
        cy = y;
        placed = true;
        place();
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };
    const over = (e: PointerEvent) => {
      const row = (e.target as Element).closest<HTMLElement>('[data-preview]');
      setActive(row ? Number(row.dataset.preview) : null);
    };
    const enter = () => setArmed(true);
    const leave = () => {
      setActive(null);
      placed = false;
    };

    list.addEventListener('pointerenter', enter);
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerover', over);
    list.addEventListener('pointerleave', leave);
    return () => {
      list.removeEventListener('pointerenter', enter);
      list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerover', over);
      list.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, [listId]);

  const host = active !== null ? items[active]?.host : '';

  return (
    <div
      ref={box}
      aria-hidden
      className="pi-preview pointer-events-none fixed left-0 top-0 z-40"
      style={{ width: WIDTH }}
    >
      <div
        className={cn(
          'overflow-clip rounded-2xl border border-border bg-card shadow-[0_30px_80px_-20px_rgba(10,22,40,0.45)] transition-[opacity,scale] duration-300 ease-out',
          active === null ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <div className="flex items-center border-b border-border bg-muted/60 px-3 py-2">
          <span className="truncate rounded-md bg-background px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">{host || ' '}</span>
        </div>
        <div className="relative aspect-[16/10] bg-muted">
          {armed &&
            items.map((it, i) => (
              <FirebaseImage
                key={it.src}
                src={it.src}
                alt=""
                fill
                sizes={`${WIDTH}px`}
                className={cn('object-cover object-top transition-opacity duration-300', i === active ? 'opacity-100' : 'opacity-0')}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
