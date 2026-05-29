'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceItem {
  icon: ReactNode;
  title: string;
  description: string;
  color: string; // tailwind gradient classes, e.g. "from-blue-500/20 to-cyan-500/20"
  slug: string;
  orbColor: string;
}

interface ServicesStickyProps {
  services: ServiceItem[];
  learnMoreLabel?: string;
}

// 3 micro-bullets per service — kept inline (short, design-driven, easier to tweak than message JSON).
const BULLETS_BY_SLUG: Record<string, { it: string[]; en: string[] }> = {
  'sviluppo-web': {
    it: ['Siti vetrina e corporate', 'Web app su misura', 'Performance ottimizzate (Core Web Vitals)'],
    en: ['Landing & corporate sites', 'Custom web apps', 'Performance-tuned (Core Web Vitals)'],
  },
  'e-commerce': {
    it: ['Shopify / WooCommerce / Custom', 'Checkout senza attriti', 'SEO + Google Merchant'],
    en: ['Shopify / WooCommerce / Custom', 'Frictionless checkout', 'SEO + Google Merchant'],
  },
  'design-ui-ux': {
    it: ['UX research e wireframing', 'Design system riusabili', 'Accessibilità AAA'],
    en: ['UX research & wireframing', 'Reusable design systems', 'AAA accessibility'],
  },
  'manutenzione': {
    it: ['Backup automatici e ripristino', 'Security patch e aggiornamenti', 'Supporto reattivo via chat'],
    en: ['Automatic backups & restore', 'Security patches & updates', 'Reactive chat support'],
  },
  'ai-automazione': {
    it: ['Chatbot e assistenti AI', 'Automazioni n8n / Zapier', 'Integrazioni GPT / Gemini'],
    en: ['AI chatbots & assistants', 'n8n / Zapier automations', 'GPT / Gemini integrations'],
  },
  'seo-marketing': {
    it: ['SEO tecnico e on-page', 'Content strategy', 'Google Ads & Analytics 4'],
    en: ['Technical & on-page SEO', 'Content strategy', 'Google Ads & Analytics 4'],
  },
  'hosting-cloud': {
    it: ['CDN globale e SSL', 'Backup giornalieri', 'Uptime monitoring'],
    en: ['Global CDN & SSL', 'Daily backups', 'Uptime monitoring'],
  },
  'consulenza': {
    it: ['Audit tecnico e UX', 'Scelta dello stack', 'Roadmap di prodotto'],
    en: ['Technical & UX audits', 'Stack selection', 'Product roadmap'],
  },
};

export function ServicesSticky({ services, learnMoreLabel }: ServicesStickyProps) {
  const locale = useLocale();
  const en = locale === 'en';
  const learn = learnMoreLabel ?? (en ? 'Learn more' : 'Scopri di più');
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    // Map progress 0→1 onto 0…services.length-1
    const idx = Math.min(services.length - 1, Math.max(0, Math.floor(p * services.length)));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  const active = services[activeIndex] ?? services[0];
  const bullets = (BULLETS_BY_SLUG[active?.slug] ?? { it: [], en: [] })[en ? 'en' : 'it'];

  return (
    <>
      {/* ── Desktop: scroll-jacked sticky ── */}
      <div
        ref={containerRef}
        className="hidden md:block relative"
        style={{ minHeight: `${services.length * 60}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center">
          <div className="container mx-auto px-6 lg:px-10 grid grid-cols-12 gap-8 lg:gap-12 w-full">
            {/* Left: indexed list */}
            <aside className="col-span-5 lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/80 font-semibold mb-3">
                {en ? 'Services' : 'Servizi'}
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-8">
                {en ? 'What we do' : 'Cosa facciamo'}
              </h2>
              <ul className="space-y-3">
                {services.map((s, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <li key={s.slug} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'h-px transition-all duration-300',
                          isActive ? 'w-10 bg-primary' : 'w-5 bg-border'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm transition-colors duration-300',
                          isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}. {s.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Right: active card */}
            <div className="col-span-7 lg:col-span-8 relative">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="holographic-card neon-border relative rounded-3xl p-8 lg:p-12 bg-card/60 backdrop-blur-md border-primary/30"
              >
                <div className="absolute top-6 right-8 font-mono text-xs text-muted-foreground">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                </div>

                <div
                  className={cn(
                    'inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 bg-gradient-to-br border border-primary/20',
                    active.color
                  )}
                >
                  <span className="text-primary [&_svg]:h-7 [&_svg]:w-7">{active.icon}</span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{active.title}</h3>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-7 max-w-2xl">
                  {active.description}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm lg:text-base">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}/servizi/${active.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {learn}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: stacked cards (no scroll-jack) ── */}
      <div className="md:hidden space-y-4">
        {services.map((s, i) => {
          const b = (BULLETS_BY_SLUG[s.slug] ?? { it: [], en: [] })[en ? 'en' : 'it'];
          return (
            <div
              key={s.slug}
              className="holographic-card neon-border rounded-2xl p-6 bg-card/60 backdrop-blur-md border-primary/30"
            >
              <div className="flex items-start gap-4 mb-3">
                <div
                  className={cn(
                    'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br border border-primary/20',
                    s.color
                  )}
                >
                  <span className="text-primary [&_svg]:h-5 [&_svg]:w-5">{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
                    {String(i + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
              <ul className="space-y-1.5 mb-4 text-sm">
                {b.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/servizi/${s.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {learn}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
