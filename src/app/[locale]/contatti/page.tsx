'use client';

import { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Clock, ChevronDown,
  Sparkles, ArrowRight, ShieldCheck, MessageSquare,
  HelpCircle, Rocket, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { ContactSection } from '@/components/site/contact-section';

export default function ContattiPage() {
  const locale = useLocale();
  const t = useTranslations('contactPage');
  const tContact = useTranslations('contact');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  // Safe translation getter with fallbacks
  const getTranslation = (key: string, fallback?: string) => {
    try {
      const value = t(key);
      if (value && value !== key) {
        return value;
      }
      return fallback || key;
    } catch (error) {
      console.warn(`Translation missing for key: contactPage.${key}`);
      return fallback || key;
    }
  };

  // Safe translation getter for contact namespace
  const getContactTranslation = (key: string, fallback?: string) => {
    try {
      const value = tContact(key);
      if (value && value !== key) {
        return value;
      }
      return fallback || key;
    } catch (error) {
      console.warn(`Translation missing for key: contact.${key}`);
      return fallback || key;
    }
  };

    const faqs = [
        {
      icon: <Clock className="w-5 h-5" />,
            question: getTranslation('faqs.responseTime.question', 'How quickly do you respond to messages?'),
            answer: getTranslation('faqs.responseTime.answer', 'Our goal is to respond to all requests within 24 business hours. Your request is important to us and we\'ll do our best to get back to you as soon as possible.')
        },
        {
      icon: <MessageSquare className="w-5 h-5" />,
            question: getTranslation('faqs.quoteProcess.question', 'How does the quote process work?'),
            answer: getTranslation('faqs.quoteProcess.answer', 'After receiving your request through the form, we\'ll analyze it carefully. If necessary, we\'ll contact you to clarify some details. Then, we\'ll send you a detailed and transparent quote, with no obligation.')
        },
        {
      icon: <ShieldCheck className="w-5 h-5" />,
            question: getTranslation('faqs.support.question', 'Do you offer support after project delivery?'),
            answer: getTranslation('faqs.support.answer', 'Yes, absolutely. We believe in long-term partnerships. We offer various maintenance and support plans to ensure your digital project remains performant, secure and updated over time.')
        },
        {
      icon: <Globe className="w-5 h-5" />,
            question: getTranslation('faqs.clients.question', 'Do you work with companies and individuals?'),
            answer: getTranslation('faqs.clients.answer', 'We collaborate with a wide range of clients, from innovative startups to established companies, to freelancers and individuals with an idea to realize. We\'re flexible and ready to adapt our solutions to every need.')
        }
    ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      
      {/* ============================================
          1. HERO SECTION - Connection Portal
          ============================================ */}
      <section className="relative min-h-[70svh] sm:min-h-[80svh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-28">
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

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[20%] left-[10%] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-primary/30 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
          <div className="floating-shape absolute top-[60%] right-[15%] w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
          <div className="floating-shape absolute bottom-[30%] left-[20%] w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rotate-12 hidden sm:block" style={{ animationDelay: '4s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <Badge className="badge-futuristic mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {getTranslation('hero.badge', 'Get in Touch')}
            </Badge>

            {/* Main Title with Gradient */}
            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                animationSpeed={4}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                {getTranslation('hero.title', 'Start a Conversation')}
              </GradientText>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mt-1 sm:mt-2">
                {getTranslation('hero.titleHighlight', 'with Us')}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              {getTranslation('hero.subtitle', 'We\'re here to help you transform your ideas into')}{' '}<span className="text-primary font-semibold">{getTranslation('hero.subtitleHighlight', 'successful digital solutions')}</span>.{' '}
              {getTranslation('hero.subtitleEnd', 'Tell us about your project and we\'ll respond within 24 hours.')}
                </p>

            {/* Availability Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {getTranslation('hero.available', 'Available for new projects')}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button size="lg" className="group neon-glow px-6 sm:px-8 w-full sm:w-auto" asChild>
                <a href="#contact-form">
                  {getTranslation('hero.writeNow', 'Write to Us Now')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 w-full sm:w-auto" asChild>
                <a href="tel:+393202223322">
                  <Phone className="w-4 h-4 mr-2" />
                  {getTranslation('hero.callUs', 'Call Us')}
                </a>
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
          3. CONTACT FORM - Message Portal
          ============================================ */}
      <div id="contact-form">
        <ContactSection />
      </div>

      {/* ============================================
          4. FAQ SECTION - Knowledge Base
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-3 sm:mb-4">
                <HelpCircle className="w-3 h-3 mr-1.5 sm:mr-2" />
                {getContactTranslation('faqSection.badge', 'FAQ')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                <span className="text-foreground">{getContactTranslation('faqSection.title', 'Frequently')}</span>
                <span className="block text-primary">{getContactTranslation('faqSection.titleHighlight', 'Asked Questions')}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-2">
                {getContactTranslation('faqSection.subtitle', 'Find quick answers to the most common questions.')}
              </p>
                </div>
          </ScrollFadeIn>

          <ScrollFadeIn animation="fade-up" delay={100}>
            <Card className="holographic-card neon-border overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                    <AccordionItem 
                      value={`item-${index}`} 
                      key={index}
                      className="border-b border-primary/10 last:border-0"
                    >
                      <AccordionTrigger className="text-left py-4 sm:py-5 hover:no-underline group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            {faq.icon}
                          </div>
                          <span className="text-sm sm:text-base md:text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                            {faq.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-4 sm:pb-5 pl-11 sm:pl-14">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          </ScrollFadeIn>

          {/* Additional Help */}
          <ScrollFadeIn animation="fade-up" delay={200}>
            <div className="mt-8 sm:mt-10 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {getContactTranslation('faqSection.notFound', 'Didn\'t find what you were looking for?')}
              </p>
              <Button variant="outline" className="border-primary/50 hover:bg-primary/10" asChild>
                <Link href="mailto:info@studiofaraj.it">
                  <Mail className="w-4 h-4 mr-2" />
                  {getContactTranslation('faqSection.writeDirectly', 'Write to us directly')}
                </Link>
              </Button>
            </div>
          </ScrollFadeIn>
            </div>
        </section>

      {/* ============================================
          5. CTA SECTION - Final Connection
          ============================================ */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/15 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating Shapes */}
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
                  {getContactTranslation('cta.badge', 'Ready to Start?')}
                </Badge>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  <span className="text-foreground">{getContactTranslation('cta.title', 'Transform Your')}</span>
                  <span className="block text-primary">{getContactTranslation('cta.titleHighlight', 'Idea into Reality')}</span>
                </h2>
                
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                  {getContactTranslation('cta.subtitle', 'Tell us what you have in mind and we\'ll find the ideal solution for you. Our initial consultation is')} <span className="text-primary font-semibold">{getContactTranslation('cta.subtitleHighlight', 'always free')}</span>.
                </p>

                {/* Availability Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {getContactTranslation('cta.availability', 'We respond quickly, always')}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
                  <Button size="lg" className="group neon-glow-intense px-6 sm:px-8 w-full sm:w-auto" asChild>
                    <a href="#contact-form">
                      <span className="text-sm sm:text-base">{getContactTranslation('cta.startProject', 'Start Your Project')}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary/50 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/projects', (locale as 'it' | 'en') || 'it')}>
                      <span className="text-sm sm:text-base">{getContactTranslation('cta.viewWorks', 'View Our Works')}</span>
                    </Link>
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <a href="mailto:info@studiofaraj.it" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    info@studiofaraj.it
                  </a>
                  <a href="tel:+393202223322" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    +39 320 222 3322
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
