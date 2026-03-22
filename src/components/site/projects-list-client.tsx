'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { TechnologyBadge } from '@/components/site/technology-badge';
import { FolderKanban, ArrowRight, Sparkles, ChevronDown, ExternalLink, Search, X, Globe } from 'lucide-react';
import type { Project } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Lazy load heavy components
const ScrollFadeIn = dynamic(() => import('@/components/site/scroll-fade-in'), { ssr: true });
const RippleGrid = dynamic(() => import('@/components/RippleGrid'), { ssr: false });
const GradientText = dynamic(() => import('@/components/GradientText'), { ssr: false });

const CATEGORIES = [
  'all',
  'e-commerce',
  'portfolio',
  'corporate',
  'saas',
  'mobile-app',
  'landing-page',
  'blog/content',
  'dashboard/admin',
  'other'
];

interface ProjectsListClientProps {
  projects: Project[];
}

export function ProjectsListClient({ projects: initialProjects }: ProjectsListClientProps) {
  const locale = useLocale();
  const t = useTranslations('projects');
  const [heroVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const publishedProjects = initialProjects.filter(p => p.published);

  const filteredProjects = useMemo(() => {
    return publishedProjects.filter(project => {
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
        project.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [publishedProjects, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(publishedProjects.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [publishedProjects]);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#8b5cf6"
            rippleIntensity={0.06}
            gridSize={12}
            gridThickness={20}
            fadeDistance={1.2}
            vignetteStrength={1.8}
            glowIntensity={0.15}
            opacity={0.8}
            mouseInteraction={true}
            mouseInteractionRadius={1.5}
            animationSpeed={0.8}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-violet-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-purple-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-violet-500/20 text-violet-400 border-violet-500/30">
              <FolderKanban className="w-4 h-4 mr-2" />
              {t('title')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#8b5cf6', '#a855f7', '#8b5cf6']}
                animationSpeed={4}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                {t('hero.title')}
              </GradientText>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mt-1">
                {t('hero.titleHighlight')}
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
              {t('hero.description')}{' '}
              <span className="text-violet-400 font-semibold">{t('hero.descriptionHighlight')}</span>.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-foreground">{publishedProjects.length}+</span>
                <span>{t('hero.completed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-foreground">98%</span>
                <span>{t('hero.satisfaction')}</span>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="mt-8 flex justify-center">
              <div className="animate-bounce">
                <ChevronDown className="w-8 h-8 text-violet-500/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-50" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          {publishedProjects.length > 0 ? (
            <>
              <ScrollFadeIn animation="fade-up">
                <div className="text-center max-w-3xl mx-auto mb-8">
                  <Badge className="badge-futuristic mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('filters.badge')}
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    <span className="text-foreground">{t('filters.title')}</span>
                    <span className="block text-violet-400">{t('filters.titleHighlight')}</span>
                  </h2>
                </div>
              </ScrollFadeIn>

              {/* Filters and Search */}
              <ScrollFadeIn animation="fade-up" delay={100}>
                <div className="max-w-4xl mx-auto mb-12 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('filters.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 placeholder:text-muted-foreground/70"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        selectedCategory === 'all' && 'bg-violet-600 hover:bg-violet-700'
                      )}
                    >
                      {t('filters.all')}
                    </Button>
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          selectedCategory === cat && 'bg-violet-600 hover:bg-violet-700'
                        )}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollFadeIn>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <ScrollFadeIn key={project.id} animation="fade-up" delay={index * 100}>
                      <Link href={`/${locale}/projects/${project.slug}`} className="block group">
                        <Card className="h-full holographic-card neon-border overflow-hidden bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/20 group-hover:scale-[1.02]">
                          <div className="relative overflow-hidden aspect-video">
                            {project.featuredImage ? (
                              <FirebaseImage
                                alt={project.title}
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                src={project.featuredImage}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary flex items-center justify-center">
                                  <FolderKanban className="w-10 h-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              {project.category && (
                                <Badge className="badge-futuristic bg-violet-500/20 text-violet-400 border-violet-500/30">
                                  {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace(/-/g, ' ')}
                                </Badge>
                              )}
                            </div>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-wrap gap-1 max-w-[60%] justify-end">
                                {project.technologies.slice(0, 2).map(tech => (
                                  <TechnologyBadge key={tech} technology={tech} size="sm" />
                                ))}
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2">
                              {project.projectUrl && (
                                <Badge className="badge-futuristic bg-violet-500/20 text-violet-400 border-violet-500/30">
                                  <Globe className="w-3 h-3 mr-1" />
                                  {t('filters.liveSite')}
                                </Badge>
                              )}
                              <Badge className="badge-futuristic bg-violet-500/20 text-violet-400 border-violet-500/30">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {t('filters.details')}
                              </Badge>
                            </div>
                            {project.metrics && project.metrics.length > 0 && (
                              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <Badge className="badge-futuristic bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                  {project.metrics[0].value}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              {project.category && (
                                <Badge variant="secondary" className="w-fit bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                                  {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace(/-/g, ' ')}
                                </Badge>
                              )}
                              {project.year && (
                                <span className="text-xs text-muted-foreground">{project.year}</span>
                              )}
                            </div>
                            <CardTitle className="text-violet-400 group-hover:text-violet-300 transition-colors">
                              {project.title}
                            </CardTitle>
                            {project.clientName && (
                              <p className="text-xs text-muted-foreground mt-1">per {project.clientName}</p>
                            )}
                          </CardHeader>
                          <CardContent className="flex-grow space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {project.description}
                            </p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2">
                                {project.technologies.slice(0, 3).map(tech => (
                                  <TechnologyBadge key={tech} technology={tech} size="sm" />
                                ))}
                                {project.technologies.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.technologies.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </ScrollFadeIn>
                  ))}
                </div>
              ) : (
                <ScrollFadeIn animation="fade-up">
                  <div className="text-center py-20">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-2xl font-bold mb-2">{t('filters.noResults')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('filters.noResultsDesc')}
                    </p>
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                      {t('filters.resetFilters')}
                    </Button>
                  </div>
                </ScrollFadeIn>
              )}
            </>
          ) : (
            <ScrollFadeIn animation="fade-up">
              <div className="text-center py-20">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-2xl font-bold mb-2">{t('filters.noProjects')}</h3>
                <p className="text-muted-foreground">{t('filters.noProjectsDesc')}</p>
              </div>
            </ScrollFadeIn>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-background to-purple-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('filters.cta.badge')}
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t('filters.cta.title')}</span>
                  <span className="block text-violet-400">{t('filters.cta.titleHighlight')}</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  {t('filters.cta.description')}
                </p>

                <Link href={getLocalizedPath('/contatti', locale as any)}>
                  <button className="group inline-flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 px-8 py-3 text-sm font-medium text-white transition-colors">
                    {t('filters.cta.button')}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </Card>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}
