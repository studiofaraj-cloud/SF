'use client';

import { FirebaseImage } from '@/components/ui/firebase-image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Calendar, ChevronRight, ExternalLink, Github,
  Code2, Award, TrendingUp, FolderKanban, BookOpen, ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RichContentRenderer } from '@/components/site/rich-content-renderer';
import { TechnologyBadge } from '@/components/site/technology-badge';
import type { Project } from '@/lib/definitions';

const ScrollFadeIn = dynamic(
  () => import('@/components/site/scroll-fade-in'),
  { ssr: true }
);
const RippleGrid = dynamic(() => import('@/components/RippleGrid'), { ssr: false });
const GradientText = dynamic(() => import('@/components/GradientText'), { ssr: false });

interface ProjectPostClientProps {
  project: Project;
  related: Project[];
  locale: string;
  formattedDate?: string;
  relatedDates?: string[];
}

export function ProjectPostClient({
  project,
  related,
  locale,
  formattedDate = '',
  relatedDates = [],
}: ProjectPostClientProps) {
  const backLabel = locale === 'it' ? 'Tutti i Progetti' : 'All Projects';
  const relatedLabel = locale === 'it' ? 'Altri Progetti' : 'Other Projects';
  const galleryLabel = locale === 'it' ? 'Galleria' : 'Gallery';
  const techLabel = locale === 'it' ? 'Stack Tecnologico' : 'Tech Stack';
  const highlightsLabel = locale === 'it' ? 'Punti di Forza' : 'Highlights';
  const metricsLabel = locale === 'it' ? 'Risultati Chiave' : 'Key Results';
  const publishedLabel = locale === 'it' ? 'Completato il' : 'Completed on';
  const clientLabel = locale === 'it' ? 'Cliente' : 'Client';
  const yearLabel = locale === 'it' ? 'Anno' : 'Year';
  const categoryLabel = locale === 'it' ? 'Categoria' : 'Category';
  const viewProjectLabel = locale === 'it' ? 'Vedi Progetto' : 'View Project';
  const viewCodeLabel = locale === 'it' ? 'Codice' : 'Code';

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[60svh] sm:min-h-[65svh] flex flex-col justify-end overflow-x-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#8b5cf6"
            rippleIntensity={0.05}
            gridSize={14}
            gridThickness={18}
            fadeDistance={1.2}
            vignetteStrength={1.8}
            glowIntensity={0.12}
            opacity={0.7}
            mouseInteraction={true}
            mouseInteractionRadius={1.5}
            animationSpeed={0.6}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />

        {/* Floating shapes */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[15%] left-[8%] w-16 h-16 sm:w-24 sm:h-24 border-2 border-violet-500/20 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
          <div className="floating-shape absolute top-[55%] right-[12%] w-14 h-14 sm:w-20 sm:h-20 border-2 border-violet-400/15 rounded-full" style={{ animationDelay: '2s' }} />
          <div className="floating-shape absolute bottom-[25%] left-[18%] w-10 h-10 sm:w-14 sm:h-14 bg-violet-500/5 rotate-12 hidden md:block" style={{ animationDelay: '4s' }} />
        </div>

        {/* Content */}
        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center max-w-4xl py-12">
          {/* Badge */}
          <div className="mb-3">
            <Badge className="badge-futuristic bg-violet-500/20 text-violet-400 border-violet-500/30">
              <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
              {project.category || (locale === 'it' ? 'Progetto' : 'Project')}
            </Badge>
          </div>

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="inline-flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1 text-xs text-muted-foreground/60 mb-5">
            <Link href={`/${locale}`} className="hover:text-foreground transition-colors whitespace-nowrap">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href={`/${locale}/projects`} className="hover:text-foreground transition-colors whitespace-nowrap">
              {locale === 'it' ? 'Progetti' : 'Projects'}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-muted-foreground/40 truncate max-w-[140px] sm:max-w-[200px]">{project.title}</span>
          </nav>

          {/* Title */}
          <div className="mb-5">
            <GradientText
              colors={['#8b5cf6', '#a78bfa', '#8b5cf6']}
              animationSpeed={5}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              {project.title}
            </GradientText>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-6 leading-relaxed">
            {project.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground/70 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-violet-400/60" />
              <span suppressHydrationWarning>{`${publishedLabel} ${formattedDate}`}</span>
            </div>
            {project.clientName && (
              <div className="flex items-center gap-1.5">
                <span className="text-violet-400/60">·</span>
                <span>{`${clientLabel}: ${project.clientName}`}</span>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-1.5">
                <span className="text-violet-400/60">·</span>
                <span>{`${yearLabel}: ${project.year}`}</span>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                {viewProjectLabel}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/60 hover:bg-secondary/50 px-5 py-2.5 text-sm font-medium transition-colors"
              >
                <Github className="h-4 w-4" />
                {viewCodeLabel}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Image ── */}
      {project.featuredImage && (
        <ScrollFadeIn animation="fade-up" delay={100}>
          <section className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8 relative z-40 mb-12">
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/20 group">
              <FirebaseImage
                src={project.featuredImage}
                alt={project.title}
                width={700}
                height={300}
                priority
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          </section>
        </ScrollFadeIn>
      )}

      {/* ── Main content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pb-16">

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-5 w-5 text-violet-400 shrink-0" />
                <h2 className="text-lg font-bold text-foreground">{metricsLabel}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {project.metrics.map((metric, i) => (
                  <div key={i} className="holographic-card neon-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-violet-400">{metric.value}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        )}

        {/* Divider */}
        <ScrollFadeIn animation="fade" delay={150}>
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400/40" />
            <div className="h-1 w-1 rounded-full bg-violet-400/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400/40" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
          </div>
        </ScrollFadeIn>

        {/* Rich content body */}
        {project.content && project.content !== '{"type":"doc","content":[{"type":"paragraph"}]}' && (
          <ScrollFadeIn animation="fade-up" delay={200}>
            <div className="mb-12">
              <RichContentRenderer content={project.content} className="text-base md:text-[1.0625rem]" />
            </div>
          </ScrollFadeIn>
        )}

        {/* Highlights */}
        {project.highlights && project.highlights.filter(h => h).length > 0 && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-5 w-5 text-violet-400 shrink-0" />
                <h2 className="text-lg font-bold text-foreground">{highlightsLabel}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
              </div>
              <ul className="space-y-3">
                {project.highlights.filter(h => h).map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/80">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-violet-500/15 flex items-center justify-center mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    </div>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          </ScrollFadeIn>
        )}

        {/* Tech Stack */}
        {project.technologies && project.technologies.length > 0 && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="h-5 w-5 text-violet-400 shrink-0" />
                <h2 className="text-lg font-bold text-foreground">{techLabel}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
              </div>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <TechnologyBadge key={tech} technology={tech} />
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <ScrollFadeIn animation="fade-up" delay={100}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                <h2 className="text-lg font-semibold text-foreground shrink-0 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400/60 inline-block" />
                  {galleryLabel}
                  <span className="h-2 w-2 rounded-full bg-violet-400/60 inline-block" />
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.gallery.map((imgUrl, i) => (
                  <ScrollFadeIn key={i} animation="scale" delay={i * 80}>
                    <div className="relative aspect-square rounded-xl overflow-hidden holographic-card neon-border group">
                      <FirebaseImage
                        src={imgUrl}
                        alt={`${project.title} — ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  </ScrollFadeIn>
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        )}

        {/* Back button */}
        <ScrollFadeIn animation="fade-up" delay={100}>
          <div className="pt-8 border-t border-border/20">
            <Button variant="outline" asChild className="gap-2 text-sm holographic-card hover:neon-border transition-all">
              <Link href={`/${locale}/projects`}>
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </ScrollFadeIn>
      </div>

      {/* ── Related projects ── */}
      {related.length > 0 && (
        <section className="relative border-t border-border/20 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
            <ScrollFadeIn animation="fade-up">
              <div className="text-center mb-12">
                <Badge className="badge-futuristic mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
                  <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
                  {locale === 'it' ? 'Scopri altri' : 'Discover more'}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{relatedLabel}</h2>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <div className="h-1 w-3 bg-violet-500/20 rounded-full" />
                  <div className="h-1 w-8 bg-violet-500/50 rounded-full" />
                  <div className="h-1 w-3 bg-violet-500/20 rounded-full" />
                </div>
              </div>
            </ScrollFadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, idx) => (
                <ScrollFadeIn key={p.id} animation="fade-up" delay={idx * 120}>
                  <Link
                    href={`/${locale}/projects/${p.slug}`}
                    className="group block rounded-xl overflow-hidden holographic-card neon-border hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                  >
                    {p.featuredImage ? (
                      <div className="relative h-48 overflow-hidden">
                        <FirebaseImage
                          src={p.featuredImage}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-violet-500/10 via-background to-secondary/10 flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center neon-border">
                          <FolderKanban className="h-6 w-6 text-violet-400/40" />
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <p suppressHydrationWarning className="text-[10px] text-muted-foreground/50 mb-2 font-semibold uppercase tracking-widest">
                        {relatedDates[idx] ?? ''}
                      </p>
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-violet-400 transition-colors line-clamp-2 text-foreground">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs text-violet-400/60 font-medium group-hover:text-violet-400 transition-colors">
                        <span>{locale === 'it' ? 'Scopri' : 'View'}</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
