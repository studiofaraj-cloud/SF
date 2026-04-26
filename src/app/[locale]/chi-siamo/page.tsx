'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Handshake, ShieldCheck, PenTool, CheckCircle,
  Briefcase, MapPin, Calendar, Code, Zap,
  Users, Target, ArrowRight, Sparkles,
  Linkedin, Github, Mail, Star, Camera,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { Rocket } from 'lucide-react';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = '',
  isVisible,
}: {
  target: number;
  suffix?: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span className="tabular-nums">{count}{suffix}</span>;
}

// ─── Founder image ─────────────────────────────────────────────────────────
// To use a real photo: place it at /public/images/founder.jpg
// then change FOUNDER_PHOTO to '/images/founder.jpg'
const FOUNDER_PHOTO = '/assets/founder.png';

function FounderImage() {
  if (FOUNDER_PHOTO) {
    return (
      <Image
        src={FOUNDER_PHOTO}
        alt="Hussein Faraj — Fondatore di Studio Faraj"
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      {/* Decorative rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-primary/20" />
      </div>
      {/* Initials circle */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-4">
        <span className="text-3xl font-bold text-primary">HF</span>
      </div>
      <Camera className="relative z-10 w-5 h-5 text-muted-foreground/40 mb-2" />
      <p className="relative z-10 text-xs text-muted-foreground/50 text-center px-8 leading-relaxed">
        Aggiungi la foto del fondatore:<br />
        <code className="text-[10px] text-primary/50">/public/images/founder.jpg</code>
      </p>
    </div>
  );
}

// ─── Co-founder photo placeholder ─────────────────────────────────────────
const COFOUNDER_PHOTO = ''; // e.g. '/images/cofounder.jpg'

function CoFounderImage() {
  if (COFOUNDER_PHOTO) {
    return (
      <Image
        src={COFOUNDER_PHOTO}
        alt="Maria Elisa Midulla — Co-Founder di Studio Faraj"
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-background">
      <div className="w-16 h-16 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center">
        <span className="text-xl font-bold text-violet-500">ME</span>
      </div>
    </div>
  );
}

// ─── Timeline item ────────────────────────────────────────────────────────────
function TimelineItem({
  year,
  title,
  description,
  isLast = false,
}: {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-6 md:gap-8">
      {/* Dot + vertical line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/30 shrink-0 mt-1" />
        {!isLast && <div className="w-px flex-1 bg-border/60 mt-2" />}
      </div>
      {/* Content */}
      <div className={isLast ? 'pb-0' : 'pb-8'}>
        <span className="inline-block font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">
          {year}
        </span>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChiSiamoPage() {
  const locale = useLocale();
  const t = useTranslations('about');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { value: 50, suffix: '+', label: t('identity.stats.projects') },
    { value: 40, suffix: '+', label: t('identity.stats.clients') },
    { value: 5,  suffix: '+', label: t('identity.stats.years') },
    { value: 12, suffix: '+', label: t('identity.stats.technologies') },
  ];

  const philosophy = [
    {
      icon: <PenTool className="w-5 h-5" />,
      title: t('philosophy.creativity.title'),
      description: t('philosophy.creativity.description'),
    },
    {
      icon: <Handshake className="w-5 h-5" />,
      title: t('philosophy.collaboration.title'),
      description: t('philosophy.collaboration.description'),
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: t('philosophy.transparency.title'),
      description: t('philosophy.transparency.description'),
    },
  ];

  const timeline = [
    { year: '2020', title: t('timeline.2020.title'), description: t('timeline.2020.description') },
    { year: '2021', title: t('timeline.2021.title'), description: t('timeline.2021.description') },
    { year: '2022', title: t('timeline.2022.title'), description: t('timeline.2022.description') },
    { year: '2023', title: t('timeline.2023.title'), description: t('timeline.2023.description') },
    { year: '2024', title: t('timeline.2024.title'), description: t('timeline.2024.description') },
    { year: '2025+', title: t('timeline.2025.title'), description: t('timeline.2025.description') },
  ];

  const localeParam = locale as 'it' | 'en';

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ══════════════════════════════════════════
          1. HERO
          ══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Soft gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-primary/6 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative z-10 container px-4 sm:px-6 text-center">
          <ScrollFadeIn animation="fade-up">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              {t('hero.badge')}
            </Badge>

            <div className="mb-6">
              <GradientText
                colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                animationSpeed={4}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              >
                {t('hero.title')}
              </GradientText>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mt-2">
                {t('hero.titleHighlight')}
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('hero.subtitle')}{' '}
              <span className="text-primary font-medium">{t('hero.subtitleLocation')}</span>
              {t('hero.subtitleText')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="px-8 w-full sm:w-auto group" asChild>
                <Link href={getLocalizedPath('/contatti', localeParam)}>
                  {t('hero.ctaStart')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', localeParam)}>
                  {t('hero.ctaExplore')}
                </Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FOUNDER SPOTLIGHT
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">

            {/* Photo */}
            <ScrollFadeIn animation="fade-right">
              <div className="relative mx-auto lg:mx-0 max-w-md lg:max-w-none">
                {/* Offset shadow border */}
                <div className="absolute -inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 translate-x-3 translate-y-3" />
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border/60 bg-secondary/50 shadow-2xl shadow-primary/10">
                  <FounderImage />
                </div>
                {/* Floating experience badge */}
                <div className="absolute -bottom-5 -right-5 bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-foreground">5+ anni</p>
                    <p className="text-[10px] text-muted-foreground">di esperienza</p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>

            {/* Bio */}
            <ScrollFadeIn animation="fade-left">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/30 text-primary text-xs">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  Fondatore · Padova, Italia
                </Badge>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tight">
                  {t('team.hussein.name')}
                </h2>
                <p className="text-primary font-medium mb-6">{t('team.hussein.role')}</p>

                <blockquote className="pl-5 mb-6 border-l-2 border-primary/40">
                  <p className="font-quote italic text-lg text-foreground/80 leading-relaxed">
                    &ldquo;{t('team.hussein.quote')}&rdquo;
                  </p>
                </blockquote>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {t('team.hussein.bio')}
                </p>

                {/* Skill pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {['React / Next.js', 'Node.js', 'AI Integration', 'System Architecture', 'UI/UX Design'].map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary border border-border/60 text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social */}
                <div className="flex gap-3">
                  {[
                    { href: 'https://www.linkedin.com/in/studio-faraj-47923b389/', icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
                    { href: 'https://github.com/husseinfaraj', icon: <Github className="w-4 h-4" />, label: 'GitHub' },
                    { href: 'mailto:hussein@studiofaraj.com', icon: <Mail className="w-4 h-4" />, label: 'Email' },
                  ].map(({ href, icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith('mailto') ? undefined : '_blank'}
                      rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      aria-label={label}
                      className="w-10 h-10 rounded-xl border border-border/60 bg-secondary hover:bg-primary hover:border-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-all duration-200"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollFadeIn>
          </div>

          {/* ── Co-founder card ─────────────────────────────────────────────── */}
          <ScrollFadeIn animation="fade-up" delay={100}>
            <div className="mt-16 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start gap-6 p-6 md:p-8 rounded-3xl border border-border/60 bg-card hover:border-primary/20 transition-colors duration-300">
                {/* Photo */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border/60 shrink-0 bg-secondary/50">
                  <CoFounderImage />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-foreground">{t('team.maria.name')}</h3>
                    <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-500">
                      Co-Founder
                    </Badge>
                  </div>
                  <p className="text-sm text-primary font-medium mb-3">{t('team.maria.role')}</p>
                  <blockquote className="text-sm text-muted-foreground italic mb-3 border-l-2 border-violet-500/30 pl-3">
                    {t('team.maria.quote')}
                  </blockquote>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('team.maria.bio')}</p>
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {['Frontend / CSS', 'UI/UX Design', 'Digital Marketing', 'Brand Strategy'].map((s) => (
                      <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary border border-border/60 text-foreground/70">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Social */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href="https://www.linkedin.com/in/studio-faraj-47923b389/"
                    target="_blank" rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-xl border border-border/60 bg-secondary hover:bg-violet-500 hover:border-violet-500 hover:text-white flex items-center justify-center text-muted-foreground transition-all duration-200"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:mariaelisa@studiofaraj.com"
                    aria-label="Email"
                    className="w-9 h-9 rounded-xl border border-border/60 bg-secondary hover:bg-violet-500 hover:border-violet-500 hover:text-white flex items-center justify-center text-muted-foreground transition-all duration-200"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. STATS
          ══════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 md:py-20 border-y border-border/40 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <ScrollFadeIn key={i} animation="scale" delay={i * 80}>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. PHILOSOPHY — 3 pillars
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4 sm:px-6">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                {t('philosophy.badge')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('philosophy.title')}{' '}
                <span className="text-primary">{t('philosophy.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground">{t('philosophy.subtitle')}</p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {philosophy.map((item, i) => (
              <ScrollFadeIn key={item.title} animation="fade-up" delay={i * 120}>
                <div className="group relative flex flex-col gap-4 p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                  {/* Ghost number */}
                  <span aria-hidden className="absolute top-5 right-6 font-mono text-5xl font-black text-foreground/[0.04] select-none pointer-events-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. TIMELINE — sticky left header + rail
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">

            {/* Left: header (sticky on desktop) */}
            <ScrollFadeIn animation="fade-right">
              <div className="lg:sticky lg:top-32">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                  {t('timeline.badge')}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  {t('timeline.title')}{' '}
                  <span className="text-primary">{t('timeline.titleHighlight')}</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {t('timeline.subtitle')}
                </p>
                {/* Founding card */}
                <div className="inline-flex items-center gap-3 px-5 py-4 rounded-2xl border border-border/60 bg-card">
                  <div className="text-3xl font-bold text-primary">{t('identity.foundingYear')}</div>
                  <div className="border-l border-border/60 pl-3">
                    <p className="text-xs text-muted-foreground">{t('identity.foundingLabel')}</p>
                    <p className="text-xs text-foreground/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-primary" />
                      {t('identity.foundingLocation')}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>

            {/* Right: timeline items */}
            <ScrollFadeIn animation="fade-left">
              <div className="pt-1">
                {timeline.map((item, i) => (
                  <TimelineItem
                    key={item.year}
                    year={item.year}
                    title={item.title}
                    description={item.description}
                    isLast={i === timeline.length - 1}
                  />
                ))}
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. MISSION + IDENTITY card
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <ScrollFadeIn animation="fade-up">
              <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-primary to-violet-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">

                  {/* Mission */}
                  <div className="p-8 md:p-10 lg:p-12">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                      <Target className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="mb-4 text-xs border-primary/30 text-primary">
                      {t('identity.mission.badge')}
                    </Badge>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{t('identity.mission.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t('identity.mission.description')}{' '}
                      <span className="text-primary font-medium">{t('identity.mission.descriptionHighlight')}</span>{' '}
                      {t('identity.mission.descriptionEnd')}
                    </p>
                  </div>

                  {/* Identity */}
                  <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                        {t('identity.badge')}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {t('identity.title')}{' '}
                        <span className="text-primary">{t('identity.titleHighlight')}</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{t('identity.subtitle')}</p>
                    </div>
                    {/* Trust chips */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: <CheckCircle className="w-3 h-3 text-green-500" />, label: 'Garanzia Soddisfazione' },
                        { icon: <ShieldCheck className="w-3 h-3 text-blue-500" />, label: 'GDPR Compliant' },
                        { icon: <Zap className="w-3 h-3 text-yellow-500" />, label: 'Tecnologie Moderne' },
                      ].map(({ icon, label }) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary border border-border/60 text-foreground/70"
                        >
                          {icon}
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. CTA
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/6 rounded-full blur-[100px]" />
        </div>
        <div className="container px-4 sm:px-6 relative z-10">
          <ScrollFadeIn animation="scale">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary text-xs">
                <Rocket className="w-3 h-3 mr-2" />
                Pronto a Decollare?
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Iniziamo il Tuo{' '}
                <span className="text-primary">Viaggio Digitale</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                Raccontaci la tua visione. Siamo pronti ad ascoltare, progettare e costruire
                insieme il futuro digitale del tuo business.
              </p>

              {/* Availability indicator */}
              <div className="flex items-center justify-center gap-2 mb-8 text-sm text-muted-foreground">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                Disponibili per nuovi progetti
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="px-8 w-full sm:w-auto group" asChild>
                  <Link href={getLocalizedPath('/contatti', localeParam)}>
                    Richiedi Consulenza Gratuita
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border w-full sm:w-auto" asChild>
                  <Link href={getLocalizedPath('/projects', localeParam)}>
                    Vedi Portfolio
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 text-sm text-muted-foreground">
                <a
                  href="mailto:info@studiofaraj.it"
                  className="flex items-center justify-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@studiofaraj.it
                </a>
                <span className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Padova, Italia
                </span>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}
