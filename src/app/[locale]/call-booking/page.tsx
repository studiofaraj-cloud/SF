import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { 
  Calendar, 
  Sparkles, 
  Code, 
  ShoppingCart, 
  Smartphone, 
  Wrench, 
  Bot, 
  LineChart, 
  Server, 
  DraftingCompass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BookingForm } from '@/components/site/booking-form';
import { ServiceAccordionMobile } from '@/components/site/service-accordion-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScrollFadeIn from '@/components/site/scroll-fade-in';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bookingDialog' });
  
  return {
    title: `${t('title')} | Studio Faraj`,
    description: t('description'),
  };
}

export default async function CallBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations({ locale, namespace: 'bookingDialog' });
  const tHome = await getTranslations({ locale, namespace: 'home' });
  const tServices = await getTranslations({ locale, namespace: 'home.services' });
  const tContact = await getTranslations({ locale, namespace: 'contact' });

  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: tServices('webDevelopment.title'),
      description: tServices('webDevelopment.description'),
      color: "from-blue-500/20 to-cyan-500/20",
      slug: "sviluppo-web",
      orbColor: "bg-blue-500/15",
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: tServices('ecommerce.title'),
      description: tServices('ecommerce.description'),
      color: "from-emerald-500/20 to-green-500/20",
      slug: "e-commerce",
      orbColor: "bg-emerald-500/15",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: tServices('designUIUX.title'),
      description: tServices('designUIUX.description'),
      color: "from-violet-500/20 to-purple-500/20",
      slug: "design-ui-ux",
      orbColor: "bg-violet-500/15",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: tServices('maintenance.title'),
      description: tServices('maintenance.description'),
      color: "from-orange-500/20 to-amber-500/20",
      slug: "manutenzione",
      orbColor: "bg-orange-500/15",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: tServices('aiAutomation.title'),
      description: tServices('aiAutomation.description'),
      color: "from-pink-500/20 to-rose-500/20",
      slug: "ai-automazione",
      orbColor: "bg-pink-500/15",
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: tServices('seoMarketing.title'),
      description: tServices('seoMarketing.description'),
      color: "from-teal-500/20 to-cyan-500/20",
      slug: "seo-marketing",
      orbColor: "bg-teal-500/15",
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: tServices('hostingCloud.title'),
      description: tServices('hostingCloud.description'),
      color: "from-indigo-500/20 to-blue-500/20",
      slug: "hosting-cloud",
      orbColor: "bg-indigo-500/15",
    },
    {
      icon: <DraftingCompass className="w-8 h-8" />,
      title: tServices('consulting.title'),
      description: tServices('consulting.description'),
      color: "from-fuchsia-500/20 to-pink-500/20",
      slug: "consulenza",
      orbColor: "bg-fuchsia-500/15",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-20 md:pt-28 pb-16 md:pb-24">
      {/* Abstract Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container relative z-10 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Title and Info */}
          <div className="lg:col-span-5 space-y-8">
            <ScrollFadeIn animation="fade-right">
              <div className="space-y-6">
                <Badge className="badge-futuristic py-1.5 px-4 text-xs md:text-sm">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  {tContact('badge')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  {t('title')}
                  <span className="block text-primary mt-2">Studio Faraj</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {t('description')}
                </p>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border-2 border-primary/10 transition-colors hover:border-primary/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{tContact('trust.response24h')}</h3>
                      <p className="text-sm text-muted-foreground">{tContact('infoCards.guaranteedResponse.description').replace(/\*\*/g, '')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border-2 border-primary/10 transition-colors hover:border-primary/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{tContact('trust.freeConsultation')}</h3>
                      <p className="text-sm text-muted-foreground">{tContact('infoCards.freeConsultation.description').replace(/\*\*/g, '')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border-2 border-primary/10 transition-colors hover:border-primary/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{tContact('trust.gdprCompliant')}</h3>
                      <p className="text-sm text-muted-foreground">{tContact('infoCards.privacyGuaranteed.description').replace(/\*\*/g, '')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-7">
            <ScrollFadeIn animation="fade-left" delay={200}>
              <Card className="holographic-card neon-border overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent border-b border-primary/10 p-6 md:p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl md:text-2xl font-bold">{t('form.date')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('form.datePlaceholder')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <BookingForm source="call-booking-page" />
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>

        {/* Services Section */}
        <section className="mt-24 md:mt-32">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <Badge className="badge-futuristic mb-4">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                {tServices('badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                {tServices('title')} <span className="text-primary">{tServices('titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          {/* Mobile: Accordion */}
          <div className="md:hidden">
            <ServiceAccordionMobile services={services} learnMoreLabel={tServices('learnMore')} />
          </div>

          {/* Tablet/Desktop: Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 50}>
                <Card className="h-full holographic-card neon-border group hover:border-primary/40 transition-all duration-300">
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      {service.icon}
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
