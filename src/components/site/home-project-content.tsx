'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { ArrowRight, Sparkles, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import type { Project } from '@/lib/definitions';
import { useLocale } from 'next-intl';

const ScrollFadeIn = dynamic(() => import('@/components/site/scroll-fade-in').then(mod => mod.default ? mod : { default: mod.ScrollFadeIn ?? (() => null) }), { ssr: true });

interface HomeProjectContentProps {
  projects: Project[];
}

export function HomeProjectContent({ projects }: HomeProjectContentProps) {
  const locale = useLocale();
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden suspense-reveal" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container relative z-10 px-4 md:px-8">
        {/* Header */}
        <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
            <Badge className="badge-futuristic mb-4 md:mb-6">
              <Tag className="w-3 h-3 mr-2" />
              Portfolio
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="text-foreground">I Nostri</span>
              <span className="block text-primary mt-1 md:mt-2">Ultimi Lavori</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
              Dai un&apos;occhiata ad alcuni dei progetti che abbiamo realizzato con passione per i nostri clienti.
            </p>
          </div>
        </ScrollFadeIn>

        {/* Featured Project + Grid Layout */}
        {projects.length > 0 && projects[0] && (
          <div className="space-y-6 md:space-y-8">
            {/* Featured Project - First item */}
            <ScrollFadeIn animation="fade-up" delay={100}>
              <Link href={`/${locale}/projects/${projects[0]?.slug || ''}`} className="block group">
                <Card className="relative overflow-hidden holographic-card neon-border transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Image Side */}
                    <div className="relative aspect-video lg:aspect-auto lg:h-[500px] overflow-hidden">
                      {projects[0]?.featuredImage && (
                        <FirebaseImage
                          alt={projects[0]?.title || 'Project'}
                          className="object-cover transition-all duration-700 group-hover:scale-105"
                          src={projects[0].featuredImage}
                          fill
                          data-ai-hint="creative design"
                        />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 lg:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 md:top-6 md:left-6">
                        <Badge className="badge-futuristic shadow-lg px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
                          <Sparkles className="w-3 h-3 mr-1 md:mr-2" />
                          Progetto in Evidenza
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content Side */}
                    <div className="relative p-5 md:p-8 lg:p-12 flex flex-col justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <Badge variant="outline" className="mb-3 md:mb-4 border-primary/30 text-primary text-xs md:text-sm">
                          <Tag className="w-3 h-3 mr-1 md:mr-2" />
                          Web Development
                        </Badge>
                        
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                          {projects[0]?.title || ''}
                        </h3>
                        
                        <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed line-clamp-3">
                          {projects[0]?.description || ''}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center text-primary font-semibold group-hover:underline text-sm md:text-base">
                            Scopri il Progetto
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-2" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollFadeIn>

            {/* Remaining Projects Grid */}
            {projects.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {projects.slice(1).map((project, index) => (
                  <ScrollFadeIn key={project.id || project.slug || index} animation="fade-up" delay={(index + 1) * 100}>
                    <Link href={`/${locale}/projects/${project.slug}`} className="block group">
                      <Card className="relative overflow-hidden h-[300px] md:h-[400px] holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 md:hover:-translate-y-2">
                        {/* Background Image */}
                        {project.featuredImage && (
                          <FirebaseImage
                            alt={project.title || 'Project'}
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                            src={project.featuredImage}
                            fill
                            data-ai-hint="creative design"
                          />
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
                        
                        {/* Decorative corner accent */}
                        <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Badge at top */}
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                          <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm border-0 text-white text-xs">
                            <Tag className="w-3 h-3 mr-1 md:mr-2" />
                            Progetto
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8 text-white">
                          {/* Bottom content */}
                          <div className="relative transition-transform duration-500 ease-out md:group-hover:-translate-y-4">
                            <h3 className="text-xl md:text-2xl font-bold mb-0">
                              {project.title}
                            </h3>

                            <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 ease-out">
                              <p className="text-white/80 text-sm mt-2 mb-2">
                                {project.description?.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')}
                              </p>
                              <span className="inline-flex items-center text-primary text-sm font-medium group-hover:underline">
                                Scopri di più
                                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </ScrollFadeIn>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <ScrollFadeIn animation="fade-up" delay={400}>
          <div className="text-center mt-10 md:mt-16">
            <Button asChild size="lg" className="group neon-glow w-full sm:w-auto">
              <Link href={`/${locale}/projects`} className="flex items-center justify-center gap-2">
                Vedi Tutti i Progetti
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
