'use client';

/**
 * ServicesDesktop — elegant sidebar + detail panel layout (md+ only).
 * Mobile is handled separately by ServiceAccordionMobile.
 *
 * Layout:
 *   ┌──────────────────┬────────────────────────────────────────┐
 *   │  numbered list   │  large detail panel (animated on swap) │
 *   │  01 ● Service A  │                                        │
 *   │  02 ● Service B  │  [icon]                        01      │
 *   │  03 ● Service C  │  Service title                         │
 *   │  …               │  Full description…                     │
 *   │                  │  ─────────────────                     │
 *   │                  │  Scopri il servizio →                  │
 *   └──────────────────┴────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;     // Tailwind gradient e.g. "from-blue-500/20 to-cyan-500/20"
  slug: string;
  orbColor: string;
}

interface ServicesDesktopProps {
  services: Service[];
  locale: string;
  requestInfo: string;
  cta: string;
  ctaHref: string;
}

// Strip the Tailwind opacity modifier so we get a solid-ish gradient for the top bar
// e.g. "from-blue-500/20 to-cyan-500/20" → "from-blue-500 to-cyan-500"
function solidGradient(color: string) {
  return color.replace(/\/\d+/g, '');
}

// Extract a single "from" colour for subtle tints
// e.g. "from-blue-500/20 to-cyan-500/20" → "blue-500"
function fromColor(color: string) {
  const m = color.match(/from-([a-z]+-\d+)/);
  return m ? m[1] : 'primary';
}

export function ServicesDesktop({
  services,
  locale,
  requestInfo,
  cta,
  ctaHref,
}: ServicesDesktopProps) {
  const [active, setActive] = useState(0);
  const [panelKey, setPanelKey] = useState(0); // forces re-mount → re-runs animation

  function select(i: number) {
    if (i === active) return;
    setActive(i);
    setPanelKey((k) => k + 1);
  }

  const svc = services[active];
  const grad = solidGradient(svc.color);
  const fc = fromColor(svc.color);

  return (
    <div className="hidden md:flex gap-6 lg:gap-10 xl:gap-14 items-stretch min-h-[520px] lg:min-h-[560px]">

      {/* ── Left: numbered service list ─────────────────────────────── */}
      <nav
        aria-label="Services"
        className="w-[280px] lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col gap-0.5"
      >
        {services.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              onMouseEnter={() => select(i)}
              onClick={() => select(i)}
              aria-current={isActive ? 'true' : undefined}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border
                ${isActive
                  ? 'bg-primary/8 border-primary/20 shadow-sm'
                  : 'border-transparent hover:bg-secondary/70'
                }`}
            >
              {/* Number */}
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/50 w-5 shrink-0 leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Icon pill */}
              <span
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                  [&>svg]:w-4 [&>svg]:h-4
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                  }`}
              >
                {s.icon}
              </span>

              {/* Name */}
              <span
                className={`flex-1 font-semibold text-sm leading-tight transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-foreground/75 group-hover:text-foreground'}`}
              >
                {s.title}
              </span>

              {/* Arrow indicator */}
              <ArrowRight
                className={`w-3.5 h-3.5 shrink-0 transition-all duration-200
                  ${isActive ? 'text-primary opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5'}`}
              />
            </button>
          );
        })}
      </nav>

      {/* ── Right: detail panel ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div
          key={panelKey}
          className="service-panel-enter h-full rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col"
        >
          {/* Top colour accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${grad} shrink-0`} />

          <div className="flex-1 flex flex-col p-7 lg:p-10 xl:p-12 relative overflow-hidden">

            {/* Ghost number — decorative large numeral */}
            <span
              aria-hidden="true"
              className="absolute top-4 right-6 font-mono font-black text-[7rem] lg:text-[9rem] leading-none text-foreground/[0.04] select-none pointer-events-none"
            >
              {String(active + 1).padStart(2, '0')}
            </span>

            {/* Icon */}
            <div
              className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-primary border border-primary/15 shadow-lg mb-6
                [&>svg]:w-8 [&>svg]:h-8 lg:[&>svg]:w-10 lg:[&>svg]:h-10`}
            >
              {svc.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-4 leading-tight">
              {svc.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed flex-grow max-w-2xl">
              {svc.description}
            </p>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between gap-4">
              <Link
                href={`/${locale}/servizi/${svc.slug}`}
                className="inline-flex items-center gap-2 font-semibold text-primary hover:underline underline-offset-4 group/link text-sm lg:text-base"
              >
                {requestInfo}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
              </Link>

              <Link
                href={`/${locale}/servizi/${svc.slug}`}
                className="shrink-0 w-10 h-10 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary hover:border-primary flex items-center justify-center transition-all duration-300 group/btn"
                aria-label={svc.title}
              >
                <ArrowUpRight className="w-4 h-4 text-primary group-hover/btn:text-primary-foreground transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
