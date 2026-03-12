'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Handshake, ShieldCheck, PenTool, CheckCircle, Briefcase, Utensils, 
  Building, Rocket, HeartPulse, Home, MapPin, Calendar, Code, Zap,
  Users, Target, Award, ArrowRight, Sparkles, Globe, Linkedin, Github,
  Mail, ChevronDown, Star, TrendingUp, Clock, Eye
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Animated Counter Component
function AnimatedCounter({ 
  target, 
  suffix = '', 
  prefix = '',
  isVisible 
}: { 
  target: number; 
  suffix?: string;
  prefix?: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
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
  }, [isVisible, target]);
  
  return (
    <span className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

// Timeline Item Component - Mobile Optimized
function TimelineItem({ 
  year, 
  title, 
  description, 
  icon,
  isLeft,
  index 
}: { 
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLeft: boolean;
  index: number;
}) {
  return (
    <ScrollFadeIn animation={isLeft ? 'fade-right' : 'fade-left'} delay={index * 100}>
      <div className={`relative flex items-center ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
        {/* Left Card */}
        <div className={`flex-1 ${isLeft ? 'md:pr-12 lg:pr-16' : 'md:pl-12 lg:pl-16'}`}>
          <Card className="holographic-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 group">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className={`flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 ${isLeft ? 'md:justify-end' : ''}`}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {icon}
                </div>
                <Badge className="badge-futuristic text-primary text-xs sm:text-sm">{year}</Badge>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">{title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Timeline Node - Centered on the line */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 z-10">
          <div className="timeline-node" />
        </div>
        
        {/* Right Card */}
        <div className={`flex-1 hidden md:block ${isLeft ? 'md:pl-12 lg:pl-16' : 'md:pr-12 lg:pr-16'}`} />
      </div>
    </ScrollFadeIn>
  );
}

// Skill Bar Component - Mobile Optimized
function SkillBar({ skill, percentage, isVisible }: { skill: string; percentage: number; isVisible: boolean }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-foreground font-medium">{skill}</span>
        <span className="text-primary">{percentage}%</span>
      </div>
      <div className="skill-bar">
        <div 
          className={`skill-bar-fill ${isVisible ? 'animate' : ''}`}
          style={{ width: `${percentage}%`, transitionDelay: '0.3s' }}
        />
      </div>
    </div>
  );
}

export default function ChiSiamoPage() {
  const locale = useLocale();
  const t = useTranslations('about');
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [teamSkillsVisible, setTeamSkillsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeroVisible(true);
    
    const observerOptions = { threshold: 0.3 };
    
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setStatsVisible(true);
    }, observerOptions);
    
    const teamObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setTeamSkillsVisible(true);
    }, observerOptions);
    
    if (statsRef.current) statsObserver.observe(statsRef.current);
    if (teamRef.current) teamObserver.observe(teamRef.current);
    
    return () => {
      statsObserver.disconnect();
      teamObserver.disconnect();
    };
  }, []);

    const philosophy = [
        {
      icon: <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />,
            title: t('philosophy.creativity.title'),
      subtitle: t('philosophy.creativity.subtitle'),
      description: t('philosophy.creativity.description'),
      features: ['Design Thinking', 'UI/UX Innovation', 'Brand Storytelling'],
        },
        {
      icon: <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />,
            title: t('philosophy.collaboration.title'),
      subtitle: t('philosophy.collaboration.subtitle'),
      description: t('philosophy.collaboration.description'),
      features: ['Agile Workflow', 'Real-time Updates', 'Shared Vision'],
        },
        {
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
            title: t('philosophy.transparency.title'),
      subtitle: t('philosophy.transparency.subtitle'),
      description: t('philosophy.transparency.description'),
      features: ['Live Dashboards', 'Open Communication', 'Clear Pricing'],
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: t('timeline.2020.title'),
      description: t('timeline.2020.description'),
      icon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      year: '2021',
      title: t('timeline.2021.title'),
      description: t('timeline.2021.description'),
      icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      year: '2022',
      title: t('timeline.2022.title'),
      description: t('timeline.2022.description'),
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      year: '2023',
      title: t('timeline.2023.title'),
      description: t('timeline.2023.description'),
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      year: '2024',
      title: t('timeline.2024.title'),
      description: t('timeline.2024.description'),
      icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      year: '2025+',
      title: t('timeline.2025.title'),
      description: t('timeline.2025.description'),
      icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />,
        },
    ];
    
  const teamMembers = [
    {
      name: t('team.hussein.name'),
      role: t('team.hussein.role'),
      quote: t('team.hussein.quote'),
      bio: t('team.hussein.bio'),
      skills: [
        { name: 'React/Next.js', percentage: 95 },
        { name: 'Node.js/Backend', percentage: 90 },
        { name: 'AI Integration', percentage: 85 },
        { name: 'System Architecture', percentage: 88 },
      ],
      stats: { projects: 50, experience: '5+ anni' },
      social: {
        linkedin: 'https://www.linkedin.com/in/studio-faraj-47923b389/',
        github: 'https://github.com/husseinfaraj',
        email: 'hussein@studiofaraj.com',
      },
    },
    {
      name: t('team.maria.name'),
      role: t('team.maria.role'),
      quote: t('team.maria.quote'),
      bio: t('team.maria.bio'),
      skills: [
        { name: 'Frontend/CSS', percentage: 92 },
        { name: 'UI/UX Design', percentage: 88 },
        { name: 'Digital Marketing', percentage: 90 },
        { name: 'Brand Strategy', percentage: 85 },
      ],
      stats: { projects: 45, experience: '4+ anni' },
      social: {
        linkedin: 'https://www.linkedin.com/in/studio-faraj-47923b389/',
        github: '#',
        email: 'mariaelisa@studiofaraj.com',
      },
    },
    ];

    const sectors = [
    { 
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.professional.title'),
      description: t('sectors.professional.description'),
      projects: 15,
    },
    { 
      icon: <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.restaurant.title'),
      description: t('sectors.restaurant.description'),
      projects: 12,
    },
    { 
      icon: <Building className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.retail.title'),
      description: t('sectors.retail.description'),
      projects: 18,
    },
    { 
      icon: <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.startup.title'),
      description: t('sectors.startup.description'),
      projects: 10,
    },
    { 
      icon: <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.health.title'),
      description: t('sectors.health.description'),
      projects: 8,
    },
    { 
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: t('sectors.realEstate.title'),
      description: t('sectors.realEstate.description'),
      projects: 7,
    },
  ];

  const advantages = [
    {
      title: t('advantages.custom.title'),
      description: t('advantages.custom.description'),
      metric: t('advantages.custom.metric'),
      metricLabel: t('advantages.custom.metricLabel'),
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: t('advantages.strategic.title'),
      description: t('advantages.strategic.description'),
      metric: t('advantages.strategic.metric'),
      metricLabel: t('advantages.strategic.metricLabel'),
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: t('advantages.technology.title'),
      description: t('advantages.technology.description'),
      metric: t('advantages.technology.metric'),
      metricLabel: t('advantages.technology.metricLabel'),
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: t('advantages.support.title'),
      description: t('advantages.support.description'),
      metric: t('advantages.support.metric'),
      metricLabel: t('advantages.support.metricLabel'),
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: t('advantages.global.title'),
      description: t('advantages.global.description'),
      metric: t('advantages.global.metric'),
      metricLabel: t('advantages.global.metricLabel'),
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: t('advantages.guarantee.title'),
      description: t('advantages.guarantee.description'),
      metric: t('advantages.guarantee.metric'),
      metricLabel: t('advantages.guarantee.metricLabel'),
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
  ];

  const stats = [
    { value: 50, suffix: '+', label: t('identity.stats.projects'), icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 40, suffix: '+', label: t('identity.stats.clients'), icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 5, suffix: '+', label: t('identity.stats.years'), icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 12, suffix: '+', label: t('identity.stats.technologies'), icon: <Code className="w-5 h-5 sm:w-6 sm:h-6" /> },
    ];

    return (
    <div className="bg-background text-foreground overflow-x-hidden">
      
      {/* ============================================
          1. HERO SECTION - Digital Dimension Portal
          ============================================ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        {/* WebGL RippleGrid Background */}
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#3b82f6"
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />

        {/* Floating Geometric Shapes - Responsive sizes and hidden on small mobile */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[20%] left-[10%] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-primary/30 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
          <div className="floating-shape absolute top-[60%] right-[15%] w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
          <div className="floating-shape absolute bottom-[30%] left-[20%] w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rotate-12 hidden sm:block" style={{ animationDelay: '4s' }} />
          <div className="floating-shape absolute top-[40%] right-[25%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-primary/20 clip-hexagon hidden md:block" style={{ animationDelay: '6s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <Badge className="badge-futuristic mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t('hero.badge')}
            </Badge>

            {/* Main Title with Gradient */}
            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                animationSpeed={4}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                {t('hero.title')}
              </GradientText>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mt-1 sm:mt-2">
                {t('hero.titleHighlight')}
              </h1>
            </div>

            {/* Subtitle */}
            <p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2"
              style={{ animationDelay: '0.3s' }}
            >
              {t('hero.subtitle')} <span className="text-primary font-semibold">{t('hero.subtitleLocation')}</span>{t('hero.subtitleText')}
            </p>

            {/* Location Badge - Stack vertically on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
              <Badge variant="outline" className="border-primary/30 text-primary text-xs sm:text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {t('hero.locationCoordinates')}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary text-xs sm:text-sm">
                <Globe className="w-3 h-3 mr-1" />
                {t('hero.operationalArea')}
              </Badge>
            </div>

            {/* CTA Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button size="lg" className="group neon-glow px-6 sm:px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('hero.ctaStart')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>
                  {t('hero.ctaExplore')}
                </Link>
              </Button>
            </div>
            
            {/* Scroll Indicator - Positioned below buttons */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <div className="animate-bounce">
                <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. IDENTITY MATRIX - Who We Are + Stats
          ============================================ */}
      <section ref={statsRef} className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          {/* Section Header */}
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Eye className="w-3 h-3 mr-1.5 sm:mr-2" />
                {t('identity.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{t('identity.title')}</span>
                <span className="block text-primary">{t('identity.titleHighlight')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {t('identity.subtitle')}
              </p>
            </div>
          </ScrollFadeIn>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
            {/* Main Card - Spans 2 columns */}
            <ScrollFadeIn animation="fade-right" className="md:col-span-2">
              <Card className="h-full holographic-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 overflow-hidden group">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <Badge className="mb-2 sm:mb-3 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">{t('identity.mission.badge')}</Badge>
                      <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">{t('identity.mission.title')}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t('identity.mission.description')} <span className="text-primary font-medium">{t('identity.mission.descriptionHighlight')}</span> {t('identity.mission.descriptionEnd')}
                        </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollFadeIn>

            {/* Founding Info Card */}
            <ScrollFadeIn animation="fade-left">
              <Card className="h-full animated-gradient-border overflow-hidden">
                <div className="bg-card h-full p-4 sm:p-6 flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">{t('identity.foundingYear')}</div>
                    <p className="text-sm sm:text-base text-muted-foreground">{t('identity.foundingLabel')}</p>
                    <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm text-foreground">{t('identity.foundingLocation')}</span>
                    </div>
                    </div>
                </div>
              </Card>
            </ScrollFadeIn>
                            </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <ScrollFadeIn key={index} animation="scale" delay={index * 100}>
                <Card className="text-center card-3d-tilt neon-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary">
                      {stat.icon}
                                </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 metric-glow">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
                        </div>
                    </div>
                </section>

      {/* ============================================
          3. CORE PROTOCOLS - Philosophy Section
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-secondary/50">
        <div className="absolute inset-0 bg-constellation" />
        
        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Code className="w-3 h-3 mr-1.5 sm:mr-2" />
                {t('philosophy.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{t('philosophy.title')}</span>
                <span className="block text-primary">{t('philosophy.titleHighlight')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {t('philosophy.subtitle')}
              </p>
            </div>
            </ScrollFadeIn>

          {/* Philosophy Cards with Connection Lines */}
          <div className="relative">
            {/* SVG Connection Lines - Desktop Only */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
              <line x1="33%" y1="50%" x2="50%" y2="50%" className="connection-line" />
              <line x1="50%" y1="50%" x2="67%" y2="50%" className="connection-line" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative z-10">
              {philosophy.map((item, index) => (
                <ScrollFadeIn key={item.title} animation="fade-up" delay={index * 150}>
                  <Card className="h-full holographic-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 group overflow-hidden">
                    <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                      {/* Icon with Hexagonal Clip */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/30 to-primary/10 clip-hexagon flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                        <div className="text-primary group-hover:text-primary-foreground transition-colors">
                          {item.icon}
                        </div>
                                        </div>
                      <Badge variant="outline" className="mb-2 font-mono text-[10px] sm:text-xs">{item.subtitle}</Badge>
                      <CardTitle className="text-xl sm:text-2xl text-primary">{item.title}</CardTitle>
                                    </CardHeader>
                    <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{item.description}</p>
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {item.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                                    </CardContent>
                                </Card>
                </ScrollFadeIn>
                            ))}
            </div>
                        </div>
                    </div>
                </section>

      {/* ============================================
          4. TIMELINE ODYSSEY - Our Story
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        
        {/* Particles - Hide some on mobile */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`particle ${i > 3 ? 'hidden sm:block' : ''}`}
              style={{ 
                left: `${15 + i * 15}%`, 
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: `${i * 1.5}s`
              }} 
                                    />
          ))}
                                </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Calendar className="w-3 h-3 mr-1.5 sm:mr-2" />
                {t('timeline.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{t('timeline.title')}</span>
                <span className="block text-primary">{t('timeline.titleHighlight')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {t('timeline.subtitle')}
                                </p>
                            </div>
          </ScrollFadeIn>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Central Line - Desktop Only */}
            <div className="timeline-line hidden md:block" />

            <div className="relative space-y-6 sm:space-y-8 md:space-y-12">
              {timeline.map((item, index) => (
                <TimelineItem
                  key={item.year}
                  {...item}
                  isLeft={index % 2 === 0}
                  index={index}
                />
              ))}
            </div>
                        </div>
                    </div>
                </section>

      {/* ============================================
          5. THE ARCHITECTS - Team Section
          ============================================ */}
      <section ref={teamRef} className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-secondary/50">
        <div className="absolute inset-0 bg-circuit opacity-20" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Users className="w-3 h-3 mr-1.5 sm:mr-2" />
                {t('team.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{t('team.title')}</span>
                <span className="block text-primary">{t('team.titleHighlight')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {t('team.subtitle')}
              </p>
            </div>
            </ScrollFadeIn>

          {/* Team Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto items-stretch">
            {teamMembers.map((member, index) => (
              <ScrollFadeIn key={member.name} animation={index === 0 ? 'fade-right' : 'fade-left'}>
                <Card className="h-full holographic-card border-2 border-primary/30 hover:border-primary/50 transition-all duration-500 overflow-hidden group flex flex-col">
                  <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
                    {/* Header - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                      <div>
                        <h3 
                          className="text-xl sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1 glitch-text" 
                          data-text={member.name}
                        >
                          {member.name}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">{member.role}</p>
                        </div>
                      <div className="flex gap-2">
                        <a 
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a 
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a 
                          href={`mailto:${member.social.email}`}
                          className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-sm sm:text-base text-primary/80 italic border-l-2 border-primary/50 pl-3 sm:pl-4 mb-4 sm:mb-6">
                      {member.quote}
                    </blockquote>

                    {/* Bio */}
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 flex-1">{member.bio}</p>

                    {/* Skills */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {member.skills.map((skill) => (
                        <SkillBar 
                          key={skill.name} 
                          skill={skill.name} 
                          percentage={skill.percentage}
                          isVisible={teamSkillsVisible}
                        />
                      ))}
                    </div>

                    {/* Stats Badges */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-auto">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {member.stats.projects}+ {t('team.hussein.projects')}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {member.stats.experience}
                      </Badge>
                    </div>
                                </CardContent>
                            </Card>
              </ScrollFadeIn>
            ))}
                        </div>
                    </div>
                </section>

      {/* ============================================
          6. INDUSTRY NEXUS - Sectors Section
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-50" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Building className="w-3 h-3 mr-1.5 sm:mr-2" />
                {t('sectors.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{t('sectors.title')}</span>
                <span className="block text-primary">{t('sectors.titleHighlight')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {t('sectors.subtitle')}
              </p>
            </div>
            </ScrollFadeIn>

          {/* Sectors Grid - Single column on small mobile */}
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
            {sectors.map((sector, index) => (
              <ScrollFadeIn key={sector.title} animation="scale" delay={index * 100}>
                <Card className="text-center card-3d-tilt neon-border bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 group">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        {sector.icon}
                                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-primary mb-1 sm:mb-2">{sector.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{sector.description}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {sector.projects}+ {t('sectors.projects')}
                    </Badge>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
                            ))}
                        </div>
                    </div>
                </section>

      {/* ============================================
          7. ADVANTAGE PROTOCOL - Why Choose Us
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-secondary/50">
        <div className="absolute inset-0 bg-circuit opacity-20" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <Award className="w-3 h-3 mr-1.5 sm:mr-2" />
                Advantage Protocol
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">Perché Scegliere</span>
                <span className="block text-primary">Studio Faraj</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                Vantaggi concreti e misurabili che fanno la differenza per il tuo business.
              </p>
            </div>
            </ScrollFadeIn>

          {/* Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => (
              <ScrollFadeIn key={advantage.title} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 group overflow-hidden">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {advantage.icon}
                            </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-primary metric-glow">{advantage.metric}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{advantage.metricLabel}</div>
                        </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-primary mb-1 sm:mb-2">{advantage.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>

          {/* Trust Badges */}
          <ScrollFadeIn animation="fade-up" delay={300}>
            <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-0">
              <Badge className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary border-primary/30 neon-border text-xs sm:text-sm justify-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Garanzia Soddisfazione
              </Badge>
              <Badge className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary border-primary/30 neon-border text-xs sm:text-sm justify-center">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                GDPR Compliant
              </Badge>
              <Badge className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary border-primary/30 neon-border text-xs sm:text-sm justify-center">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Tecnologie Moderne
              </Badge>
            </div>
          </ScrollFadeIn>
                    </div>
                </section>

      {/* ============================================
          8. INITIALIZE CONNECTION - CTA Section
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/15 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating Shapes - Hide on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="floating-shape absolute top-[10%] right-[10%] w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-primary/20 rotate-45" />
          <div className="floating-shape absolute bottom-[20%] left-[5%] w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-5 sm:p-6 md:p-8 lg:p-12 text-center">
                <Badge className="badge-futuristic mb-4 sm:mb-6">
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Pronto a Decollare?
                </Badge>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  <span className="text-foreground">Iniziamo il Tuo</span>
                  <span className="block text-primary">Viaggio Digitale</span>
                </h2>
                
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                  Raccontaci la tua visione. Siamo pronti ad ascoltare, progettare e costruire 
                  insieme il futuro digitale del tuo business.
                </p>

                {/* Availability Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Disponibili per nuovi progetti
                  </span>
                </div>

                {/* CTA Buttons - Full width on mobile */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
                  <Button size="lg" className="group neon-glow-intense px-6 sm:px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      <span className="text-sm sm:text-base">Richiedi Consulenza Gratuita</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary/50 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/projects', locale as any)}>
                      <span className="text-sm sm:text-base">Vedi Portfolio</span>
                    </Link>
                            </Button>
                        </div>

                {/* Contact Info - Stack on mobile */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <a href="mailto:info@studiofaraj.it" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    info@studiofaraj.it
                  </a>
                  <span className="flex items-center justify-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    Sciacca, Italia
                  </span>
                </div>
              </div>
            </Card>
          </ScrollFadeIn>
        </div>
            </section>
        </div>
    );
}
