import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Rocket, FolderOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default async function HomeCtaSection({ locale }: { locale: 'it' | 'en' }) {
  const t = await getTranslations('contact.cta');

  return (
    <section className="relative py-16 sm:py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/40 to-background" />
      <div className="absolute inset-0 bg-constellation opacity-40" />

      {/* Glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-[500px] md:h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-[500px] md:h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container relative z-10 px-4 md:px-8">
        <ScrollFadeIn animation="scale">
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl animated-gradient-border holographic-card px-6 py-12 sm:px-10 sm:py-16 md:px-16 md:py-20 text-center">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              <Badge className="badge-futuristic mb-5 md:mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t('badge')}
              </Badge>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 md:mb-6">
                <span className="text-foreground">{t('title')} </span>
                <span className="block sm:inline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t('titleHighlight')}
                </span>
              </h2>

              <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">
                {t('subtitle')}{' '}
                <span className="font-semibold text-primary">{t('subtitleHighlight')}</span>.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button asChild size="lg" className="group neon-glow w-full sm:w-auto px-8">
                  <Link href={getLocalizedPath('/contatti', locale)} title={t('startProject')} className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    {t('startProject')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="group w-full sm:w-auto px-8 border-primary/30 hover:bg-primary hover:text-primary-foreground">
                  <Link href={getLocalizedPath('/projects', locale)} title={t('viewWorks')} className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {t('viewWorks')}
                  </Link>
                </Button>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-sm text-muted-foreground">{t('availability')}</span>
              </div>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
