
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataFAQPage } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'FAQ - Domande Frequenti | Studio Faraj',
      description: 'Trova risposte alle domande più frequenti su sviluppo web, e-commerce, design UI/UX, SEO e servizi digitali. Studio Faraj risponde alle tue domande.',
      keywords: [
        'FAQ',
        'domande frequenti',
        'sviluppo web FAQ',
        'e-commerce domande',
        'preventivo sito web',
        'tempi sviluppo',
      ],
    },
    en: {
      title: 'FAQ - Frequently Asked Questions | Studio Faraj',
      description: 'Find answers to the most frequently asked questions about web development, e-commerce, UI/UX design, SEO and digital services. Studio Faraj answers your questions.',
      keywords: [
        'FAQ',
        'frequently asked questions',
        'web development FAQ',
        'e-commerce questions',
        'website quote',
        'development timeline',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `https://www.studiofaraj.it${currentLocale === 'it' ? '' : `/${currentLocale}`}/faq`;
  
  return generateSEOMetadata({
    ...content,
    url: baseUrl,
    locale: currentLocale,
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const currentLocale = localeParam as 'it' | 'en';
  
  // Enable static rendering by setting the request locale
  setRequestLocale(currentLocale);
  
  const t = await getTranslations('faq');
  const tQuestions = await getTranslations('faq.questions');
  
  const faqs = [
    {
      question: tQuestions('services.question'),
      answer: tQuestions('services.answer')
    },
    {
      question: tQuestions('cost.question'),
      answer: tQuestions('cost.answer')
    },
    {
      question: tQuestions('timeline.question'),
      answer: tQuestions('timeline.answer')
    },
    {
      question: tQuestions('support.question'),
      answer: tQuestions('support.answer')
    },
    {
      question: tQuestions('ai.question'),
      answer: tQuestions('ai.answer')
    },
    {
      question: tQuestions('existing.question'),
      answer: tQuestions('existing.answer')
    }
  ];
  
  const faqStructuredData = generateStructuredDataFAQPage(faqs);
  
  return (
    <div className="bg-background text-foreground">
      <StructuredDataServer data={faqStructuredData} />
       <section className="py-20 text-center bg-secondary">
        <div className="container">
          <Badge variant="default" className="mb-4">{t('badge')}</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary">{t('title')}</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>
    </div>
  );
}
