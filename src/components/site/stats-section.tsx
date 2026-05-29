'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, Calendar, Layers } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from 'next-intl';

type Stat = {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  iconColor: string;
  iconShadow: string;
};

function AnimatedCounter({
  target,
  suffix,
  isVisible,
  skipAnimation = false,
}: {
  target: number;
  suffix: string;
  isVisible: boolean;
  skipAnimation?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) { setCount(0); return; }
    if (skipAnimation) { setCount(target); return; }

    const duration = 2000;
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
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, target, skipAnimation]);

  return <span className="tabular-nums">{count}{suffix}</span>;
}

export default function StatsSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('stats');

  const stats: Stat[] = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      value: 50,
      suffix: '+',
      label: t('projects'),
      iconColor: '#3b82f6',
      iconShadow: 'rgba(59,130,246,0.35)',
    },
    {
      icon: <Users className="w-5 h-5" />,
      value: 40,
      suffix: '+',
      label: t('clients'),
      iconColor: '#10b981',
      iconShadow: 'rgba(16,185,129,0.35)',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      value: 5,
      suffix: '+',
      label: t('experience'),
      iconColor: '#8b5cf6',
      iconShadow: 'rgba(139,92,246,0.35)',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      value: 12,
      suffix: '+',
      label: t('technologies'),
      iconColor: '#f59e0b',
      iconShadow: 'rgba(245,158,11,0.35)',
    },
  ];

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(currentRef);

    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <section ref={sectionRef} className="relative pt-6 pb-10 md:py-16 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-primary/5" />

      {/* Soft primary glow — continuity with hero */}
      <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-8">
        {/* Section header — credibility */}
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="brand-wordmark">{t('sinceLabel')}</span>
            <span className="block text-base md:text-lg font-normal text-muted-foreground mt-2">
              {t('sinceTagline')}
            </span>
          </h2>
        </div>

        {/* Single row strip */}
        <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          {/* Subtle top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_8px_rgba(var(--primary-rgb,59,130,246),0.4)]" />

          {/* Mobile: 2x2 grid */}
          <div className="md:hidden grid grid-cols-2">
            {stats.map((stat, index) => {
              const isRightCol = index % 2 === 1;
              const isBottomRow = index >= 2;
              return (
                <div
                  key={`m-${index}`}
                  className={`relative transition-all duration-700 ${
                    !isRightCol ? 'border-r border-border/50' : ''
                  } ${!isBottomRow ? 'border-b border-border/50' : ''} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="flex flex-col items-center text-center px-3 py-5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg mb-2"
                      style={{
                        backgroundColor: stat.iconColor,
                        boxShadow: `0 4px 14px 0 ${stat.iconShadow}`,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="brand-wordmark text-4xl font-extrabold mb-1 tracking-tight">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-tight">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: grid layout */}
          <div className="hidden md:grid md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Vertical divider (not on first col) */}
                {index > 0 && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-border/50" />
                )}

                <div className="group flex flex-col items-center text-center px-4 py-6 md:py-8 hover:bg-primary/5 transition-colors duration-300">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: stat.iconColor,
                      boxShadow: `0 4px 14px 0 ${stat.iconShadow}`,
                    }}
                  >
                    {stat.icon}
                  </div>

                  {/* Number */}
                  <div className="brand-wordmark text-4xl sm:text-5xl md:text-6xl font-extrabold mb-1 tracking-tight">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      isVisible={isVisible}
                      skipAnimation={isMobile}
                    />
                  </div>

                  {/* Label */}
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-tight">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
