'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Globe,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
  TrendingUp,
  Rocket,
  Link2,
  Code2,
  Gauge,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pick, type Lang } from './translations';

const ICON_MAP: Record<string, any> = {
  Building2,
  Sparkles,
  TrendingUp,
  Star,
  Globe,
  Phone,
  Instagram,
  ShieldCheck,
  Mail,
  Linkedin,
  Facebook,
};

// Shared scroll-in animation — fades + slides each section into view.
const SECTION_INITIAL = { opacity: 0, y: 40 };
const SECTION_IN = { opacity: 1, y: 0 };
const SECTION_VIEWPORT = { once: true, margin: '-80px' as const };
const SECTION_TRANSITION = { duration: 0.7, ease: 'easeOut' as const };

export function PaginaAziendaliBody({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gate framer's `initial: { opacity: 0 }` on mount. Without this, SSR bakes
  // opacity:0 into the section HTML and content stays invisible on mobile when
  // hydration is slow, blocked (ad-blocker / CSP), or fails — the page would
  // render only the hero and look blank below.
  const canAnimate = mounted && !reduced;

  const showItems = pick('showItems', lang);
  const faqs = pick('faqs', lang);

  const ctaHref = `/${lang}/hub/login?mode=register&next=${encodeURIComponent(
    `/${lang}/hub/company-profile/edit`
  )}`;

  // Build the framer-motion section props once so each section is identical.
  const sectionProps = canAnimate
    ? {
        initial: SECTION_INITIAL,
        whileInView: SECTION_IN,
        viewport: SECTION_VIEWPORT,
        transition: SECTION_TRANSITION,
      }
    : {};

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      {/* ── Local CSS for floating orbs ─────────────────────────────── */}
      <style>{`
        @keyframes orb-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 25px) scale(0.95); }
        }
        @keyframes orb-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 30px) scale(1.08); }
        }
        @keyframes orb-float-c {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -20px) rotate(180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes light-sweep {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .orb-a { animation: orb-float-a 18s ease-in-out infinite; }
        .orb-b { animation: orb-float-b 22s ease-in-out infinite; }
        .orb-c { animation: orb-float-c 28s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b, .orb-c, .spin-slow { animation: none; }
        }
      `}</style>

      {/* Page-wide ambient orbs (subtle, behind everything) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="orb-a absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="orb-b absolute -right-40 top-2/3 h-[24rem] w-[24rem] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="orb-c absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Hero-specific moving objects */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_60%)]" />
          {/* Floating geometric shapes */}
          <div className="orb-a absolute right-[10%] top-[15%] h-32 w-32 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-3xl" />
          <div className="orb-b absolute left-[8%] bottom-[10%] h-24 w-24 rounded-full border border-purple-500/30 bg-purple-500/5 backdrop-blur-3xl" />
          <div className="spin-slow absolute left-[20%] top-[20%] h-16 w-16 rounded-2xl border border-cyan-500/30 bg-cyan-500/5" />
          <div className="orb-c absolute right-[20%] bottom-[15%] h-20 w-20 rounded-full bg-gradient-to-br from-pink-500/15 to-orange-500/15 blur-xl" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={canAnimate ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              {pick('badge', lang)}
            </Badge>

            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              {pick('h1', lang)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {pick('heroSub', lang)}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="group h-12 px-8 text-base shadow-lg transition-transform hover:scale-105">
                <Link href={ctaHref}>
                  {pick('ctaPrimary', lang)}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base transition-colors hover:border-primary/50 hover:bg-primary/5">
                <a href="#preview">{pick('ctaSecondary', lang)}</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> {pick('heroFeat1', lang)}
              </span>
              <span className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-primary" /> {pick('heroFeat2', lang)}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> {pick('heroFeat3', lang)}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Who it's for ───────────────────────────────────────────── */}
      <motion.section className="relative py-20" {...sectionProps}>
        {/* Section-level "light sweep" — appears once on scroll */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{pick('whoTitle', lang)}</h2>
            <p className="mt-3 text-muted-foreground">{pick('whoSub', lang)}</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              { icon: Rocket, title: pick('who1Title', lang), desc: pick('who1Desc', lang) },
              { icon: Link2, title: pick('who2Title', lang), desc: pick('who2Desc', lang) },
              { icon: MapPin, title: pick('who3Title', lang), desc: pick('who3Desc', lang) },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={canAnimate ? { opacity: 0, y: 20 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={SECTION_VIEWPORT}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              >
                <Card className="group h-full border-primary/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-7">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <c.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{c.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── What shows on your page ────────────────────────────────── */}
      <motion.section className="relative bg-muted/30 py-20" {...sectionProps}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="orb-a absolute right-1/4 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{pick('showTitle', lang)}</h2>
            <p className="mt-3 text-muted-foreground">{pick('showSub', lang)}</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showItems.map((item, i) => {
              const Icon = ICON_MAP[item.icon] ?? Building2;
              return (
                <motion.div
                  key={item.title}
                  initial={canAnimate ? { opacity: 0, y: 15 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={SECTION_VIEWPORT}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                  className="group relative cursor-default rounded-xl border border-border/50 bg-card/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/10"
                >
                  <Icon className="mb-3 h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Preview mockup — slides up dramatically from below ───── */}
      <section id="preview" className="relative py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="orb-b absolute left-10 top-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="orb-c absolute right-10 bottom-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            {...sectionProps}
          >
            <h2 className="text-3xl font-bold md:text-4xl">{pick('previewTitle', lang)}</h2>
            <p className="mt-3 text-muted-foreground">{pick('previewSub', lang)}</p>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
            initial={canAnimate ? { opacity: 0, y: 120, scale: 0.95 } : false}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-150px' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                🔒 studiofaraj.it/acme-srl
              </div>
              <Badge variant="outline" className="text-[10px]">
                {pick('previewBadge', lang)}
              </Badge>
            </div>

            {/* Fake hero */}
            <div className="relative overflow-hidden">
              <div className="h-48 w-full bg-gradient-to-br from-primary/40 via-purple-500/30 to-secondary/30" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent pt-16">
                <div className="container mx-auto px-6 pb-6 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Acme S.r.l.</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pick('previewSlogan', lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* Fake socials */}
            <div className="flex justify-center gap-2 py-4">
              {[Instagram, Linkedin, Facebook].map((I, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-transform duration-200 hover:scale-110 hover:border-primary/40"
                >
                  <I className="h-4 w-4 text-foreground/60" />
                </div>
              ))}
            </div>

            {/* Fake services */}
            <div className="border-t border-border/40 p-6">
              <h4 className="mb-4 text-center text-lg font-semibold">
                {pick('previewServices', lang)}
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {pick('previewServiceList', lang).map((s) => (
                  <div key={s} className="rounded-lg border border-border/40 bg-card/40 p-3 text-sm transition-colors hover:border-primary/30">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Fake stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/40 bg-muted/20 p-6 text-center">
              {pick('previewStats', lang).map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-bold text-primary">{s.v}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            {/* Fake contacts */}
            <div className="border-t border-border/40 p-6">
              <h4 className="mb-3 text-center text-lg font-semibold">
                {pick('previewContact', lang)}
              </h4>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> info@acme.it
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> +39 049 1234567
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> www.acme.it
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Padova, IT
                </div>
              </div>
            </div>

            {/* Fake tax id */}
            <div className="border-t border-border/40 px-6 py-3 text-center text-xs text-muted-foreground">
              P.IVA IT01234567890 <CheckCircle2 className="ml-1 inline h-3 w-3 text-primary" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Tech section ───────────────────────────────────────────── */}
      <motion.section
        className="relative bg-gradient-to-b from-background via-muted/10 to-background py-20"
        {...sectionProps}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="orb-c absolute -left-20 top-1/2 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-3 border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-primary"
            >
              <Code2 className="mr-1 inline h-3 w-3" /> {pick('techBadge', lang)}
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">{pick('techTitle', lang)}</h2>
            <p className="mt-3 text-muted-foreground">{pick('techSub', lang)}</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              { icon: Code2, title: pick('tech1Title', lang), desc: pick('tech1Desc', lang) },
              { icon: Gauge, title: pick('tech2Title', lang), desc: pick('tech2Desc', lang) },
              { icon: Search, title: pick('tech3Title', lang), desc: pick('tech3Desc', lang) },
              { icon: ShieldCheck, title: pick('tech4Title', lang), desc: pick('tech4Desc', lang) },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={canAnimate ? { opacity: 0, y: 25 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={SECTION_VIEWPORT}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
              >
                <Card className="group h-full border-primary/20 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-card hover:shadow-xl hover:shadow-primary/15">
                  <CardContent className="p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 transition-all duration-300 group-hover:bg-primary/25 group-hover:scale-110">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <motion.section className="relative py-20" {...sectionProps}>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
              {pick('faqTitle', lang)}
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <motion.details
                  key={i}
                  initial={canAnimate ? { opacity: 0, x: -20 } : false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={SECTION_VIEWPORT}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                  className="group rounded-xl border border-border/50 bg-card/60 p-5 transition-all hover:border-primary/40 hover:bg-card/80 open:border-primary/30 open:bg-card/80"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold">
                    <span className="mr-2 text-primary group-open:hidden">+</span>
                    <span className="mr-2 hidden text-primary group-open:inline">−</span>
                    {f.q}
                  </summary>
                  <p className="mt-3 pl-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <motion.section
        className="relative overflow-hidden border-t border-border/40 bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20"
        {...sectionProps}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="orb-a absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="orb-b absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">{pick('finalTitle', lang)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{pick('finalSub', lang)}</p>
          <Button asChild size="lg" className="group mt-8 h-12 px-8 text-base shadow-lg transition-transform hover:scale-105">
            <Link href={ctaHref}>
              {pick('ctaPrimary', lang)}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </motion.section>
    </main>
  );
}
