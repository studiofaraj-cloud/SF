'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

type ServiceItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  slug: string;
  orbColor: string;
};

interface ServiceAccordionMobileProps {
  services: ServiceItem[];
  learnMoreLabel?: string;
}

export function ServiceAccordionMobile({
  services,
  learnMoreLabel = 'Scopri di più',
}: ServiceAccordionMobileProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const locale = useLocale();

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  // Subtle accent color extracted from the gradient class
  const accentBg: Record<string, string> = {
    'from-blue-500/20':    'bg-blue-500/10 text-blue-400',
    'from-purple-500/20':  'bg-purple-500/10 text-purple-400',
    'from-emerald-500/20': 'bg-emerald-500/10 text-emerald-400',
    'from-violet-500/20':  'bg-violet-500/10 text-violet-400',
    'from-orange-500/20':  'bg-orange-500/10 text-orange-400',
    'from-pink-500/20':    'bg-pink-500/10 text-pink-400',
    'from-teal-500/20':    'bg-teal-500/10 text-teal-400',
    'from-indigo-500/20':  'bg-indigo-500/10 text-indigo-400',
    'from-fuchsia-500/20': 'bg-fuchsia-500/10 text-fuchsia-400',
  };

  const getAccent = (color: string) => {
    const key = color.split(' ')[0] as string;
    return accentBg[key] ?? 'bg-white/10 text-white';
  };

  if (!services?.length) return null;

  return (
    <div className="md:hidden divide-y divide-border rounded-2xl border border-border overflow-hidden bg-card">
      {services.map((service, index) => {
        const isOpen = openIndex === index;
        const accent = getAccent(service.color);

        return (
          <div key={service.slug}>
            {/* Row header */}
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent active:bg-accent"
              aria-expanded={isOpen}
            >
              {/* Icon */}
              <span
                className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${accent} [&>svg]:w-5 [&>svg]:h-5`}
              >
                {service.icon}
              </span>

              {/* Title */}
              <span className="flex-1 text-sm font-semibold text-foreground leading-snug">
                {service.title}
              </span>

              {/* Chevron */}
              <ChevronDown
                className={`shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expandable panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-0 pl-[3.75rem]">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {service.description}
                </p>
                <Link
                  href={`/${locale}/servizi/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {learnMoreLabel}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
