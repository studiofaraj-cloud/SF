'use client';

import { useEffect } from 'react';

/**
 * Pointer-driven depth for the hero's code window: writes --mx/--my
 * (-0.5…0.5) on the target element, which .hero-window turns into a small
 * offset (see globals.css). Renders nothing. Skipped for reduced motion and
 * touch screens, so it's purely an enhancement.
 */
export function HeroPointer({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--mx', x.toFixed(3));
      el.style.setProperty('--my', y.toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return null;
}
