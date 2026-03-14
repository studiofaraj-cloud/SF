'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { ArrowRight, Sparkles, Calendar, Tag, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import type { Blog } from '@/lib/definitions';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

const ScrollFadeIn = dynamic(() => import('@/components/site/scroll-fade-in'), { ssr: true });

interface HomeBlogContentProps {
  blogs: Blog[];
}

export function HomeBlogContent({ blogs }: HomeBlogContentProps) {
  const locale = useLocale();
  const t = useTranslations('home.blog');
  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Constellation Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      <div className="absolute inset-0 bg-constellation" />
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="container relative z-10 px-4 md:px-8">
        {/* Header */}
        <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
            <Badge className="badge-futuristic mb-4 md:mb-6">
              <BookOpen className="w-3 h-3 mr-2" />
              {t('title')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="text-foreground">{t('title')}</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
              {t('subtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        {/* Featured Blog Post + Grid Layout */}
        {blogs.length > 0 && blogs[0] && (
          <div className="space-y-6 md:space-y-8">
            {/* Featured Blog Post - First item */}
            <ScrollFadeIn animation="fade-up" delay={100}>
              <Link href={`/${locale}/blog/${blogs[0]?.slug || ''}`} className="block group">
                <Card className="relative overflow-hidden holographic-card neon-border transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image Side */}
                    <div className="relative aspect-video md:aspect-auto md:h-[450px] overflow-hidden">
                      {blogs[0]?.featuredImage && (
                        <FirebaseImage
                          alt={blogs[0]?.title || 'Blog post'}
                          className="object-cover transition-all duration-700 group-hover:scale-105"
                          src={blogs[0].featuredImage}
                          fill
                          data-ai-hint="technology abstract"
                        />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 lg:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 md:top-6 md:left-6">
                        <Badge className="badge-futuristic shadow-lg px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
                          <Sparkles className="w-3 h-3 mr-1 md:mr-2" />
                          Articolo in Evidenza
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content Side */}
                    <div className="relative p-5 md:p-8 lg:p-12 flex flex-col justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-4">
                          <Badge variant="outline" className="border-primary/30 text-primary text-xs md:text-sm">
                            <Tag className="w-3 h-3 mr-1 md:mr-2" />
                            Digital
                          </Badge>
                          <span className="flex items-center text-xs md:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            {blogs[0]?.createdAt && new Date(blogs[0].createdAt).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                          {blogs[0]?.title || ''}
                        </h3>
                        
                        <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed line-clamp-3">
                          {blogs[0]?.excerpt || ''}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                          <span className="inline-flex items-center text-primary font-semibold group-hover:underline text-sm md:text-base">
                            Leggi l&apos;Articolo
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-2" />
                          </span>
                          <span className="flex items-center text-xs md:text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            5 min lettura
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollFadeIn>

            {/* Remaining Blog Posts Grid */}
            {blogs.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {blogs.slice(1).map((blog, index) => (
                  <ScrollFadeIn key={blog.id || blog.slug || index} animation="fade-up" delay={(index + 1) * 100}>
                    <Link href={`/${locale}/blog/${blog.slug}`} className="block group">
                      <Card className="relative overflow-hidden h-full holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 md:hover:-translate-y-2">
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden">
                          {blog.featuredImage && (
                            <FirebaseImage
                              alt={blog.title || 'Blog post'}
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                              src={blog.featuredImage}
                              fill
                              data-ai-hint="technology abstract"
                            />
                          )}
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-3 left-3 md:top-4 md:left-4">
                            <Badge variant="secondary" className="bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow-lg text-xs md:text-sm">
                              <Tag className="w-3 h-3 mr-1 md:mr-2" />
                              Digital
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <CardContent className="relative z-10 p-4 md:p-6">
                          {/* Date and Reading Time */}
                          <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3 text-xs md:text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {new Date(blog.createdAt).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              4 min
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          
                          {/* Excerpt */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 md:mb-4">
                            {blog.excerpt}
                          </p>
                          
                          {/* CTA */}
                          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                            Leggi l&apos;articolo
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
                          </span>
                        </CardContent>
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
            <Button asChild size="lg" variant="outline" className="group border-2 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary w-full sm:w-auto neon-border">
              <Link href={getLocalizedPath('/blog', locale as any)} className="flex items-center justify-center gap-2">
                {t('readMore')}
                <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
              </Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
