import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { BrandMark } from '@/components/site/brand-mark';
import HomeCtaSection from '@/components/site/home-cta-section';
import { RevealWords } from '@/components/site/reveal-words';
import { SectionEdge } from '@/components/site/section-edge';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { SERVICES, serviceGroupsFor } from '@/lib/services-catalog';
import type { Locale } from '@/i18n/config';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';
const PHOTO = '/assets/hussein-faraj-fondatore-studio-faraj.webp';
const LINKEDIN = 'https://www.linkedin.com/in/hussein-faraj-9572b72b5/';
const EMAIL = 'husseinfaraj101@gmail.com';

const COPY = {
  it: {
    eyebrow: 'Chi siamo · Padova, dal 2020',
    title: ['Siamo', 'Studio Faraj.'],
    lead: 'Studio Faraj nasce a Padova nel 2020 per aiutare le aziende a crescere nel digitale. Siti, e-commerce e piattaforme scritti su misura: il codice resta tuo.',
    founder: {
      label: 'Il fondatore',
      quote: 'Il codice è poesia che risolve problemi reali.',
      role: 'Fondatore · Sviluppatore full-stack',
      bio: 'Con Studio Faraj progetta e scrive siti aziendali, e-commerce e gestionali su misura per aziende in Italia e all’estero. Segue ogni progetto dal primo incontro alla messa online, e poi hosting, SEO tecnica e manutenzione.',
      alt: 'Hussein Faraj, fondatore di Studio Faraj',
      write: 'Scrivi a Hussein',
    },
    services: {
      title: 'Cosa facciamo',
      lead: 'Costruiamo il prodotto, lo facciamo trovare e lo teniamo veloce e aggiornato. Ogni servizio ha la sua pagina.',
      all: 'Tutti i servizi',
    },
    places: {
      label: 'Dove abbiamo lavorato',
      title: 'Da Padova, per aziende in Italia e all’estero.',
      lead: 'Abbiamo realizzato progetti per clienti in questi paesi.',
    },
    principles: {
      title: 'Come lavoriamo',
      items: [
        { title: 'Scritto su misura', text: 'Niente template né page builder: ogni sito è scritto riga per riga per chi lo usa.' },
        { title: 'Il codice è tuo', text: 'Codice sorgente, dominio e contenuti restano di tua proprietà: puoi cambiare fornitore quando vuoi.' },
        { title: 'Veloce e trovabile', text: 'SEO tecnica e prestazioni fanno parte del progetto dal primo giorno, non si aggiungono alla fine.' },
        { title: 'Dall’idea alla manutenzione', text: 'Design, sviluppo, hosting e manutenzione con le stesse persone: parli con chi scrive il codice.' },
      ],
    },
  },
  en: {
    eyebrow: 'About us · Padova, since 2020',
    title: ['We are', 'Studio Faraj.'],
    lead: 'Studio Faraj was founded in Padova in 2020 to help businesses grow online. Websites, e-commerce and platforms written to measure: the code stays yours.',
    founder: {
      label: 'The founder',
      quote: 'Code is poetry that solves real problems.',
      role: 'Founder · Full-stack developer',
      bio: 'At Studio Faraj he designs and writes company websites, e-commerce stores and custom business software for companies in Italy and abroad. He follows every project from the first meeting to launch, and then hosting, technical SEO and maintenance.',
      alt: 'Hussein Faraj, founder of Studio Faraj',
      write: 'Write to Hussein',
    },
    services: {
      title: 'What we do',
      lead: 'We build the product, get it found, and keep it fast and up to date. Every service has its own page.',
      all: 'All services',
    },
    places: {
      label: 'Where we have worked',
      title: 'From Padova, for businesses in Italy and abroad.',
      lead: 'We have built projects for clients in these countries.',
    },
    principles: {
      title: 'How we work',
      items: [
        { title: 'Written to measure', text: 'No templates or page builders: every site is written line by line for the people who use it.' },
        { title: 'The code is yours', text: 'Source code, domain and content stay yours: you can change supplier whenever you want.' },
        { title: 'Fast and findable', text: 'Technical SEO and performance are part of the project from day one, not added at the end.' },
        { title: 'From idea to maintenance', text: 'Design, development, hosting and maintenance with the same people: you talk to whoever writes the code.' },
      ],
    },
  },
} as const;

/** Countries the studio has built projects for, Italy first. */
const COUNTRIES: { code: string; name: Record<Locale, string> }[] = [
  { code: 'IT', name: { it: 'Italia', en: 'Italy' } },
  { code: 'CH', name: { it: 'Svizzera', en: 'Switzerland' } },
  { code: 'FR', name: { it: 'Francia', en: 'France' } },
  { code: 'BE', name: { it: 'Belgio', en: 'Belgium' } },
  { code: 'DE', name: { it: 'Germania', en: 'Germany' } },
  { code: 'GB', name: { it: 'Regno Unito', en: 'United Kingdom' } },
  { code: 'US', name: { it: 'Stati Uniti', en: 'United States' } },
  { code: 'AE', name: { it: 'Emirati Arabi Uniti', en: 'United Arab Emirates' } },
  { code: 'LB', name: { it: 'Libano', en: 'Lebanon' } },
];

/**
 * /chi-siamo — server component. A navy hero with the logo's ripples (as in
 * the OG image), the founder, what the studio does (linked to each service),
 * the countries it has built projects for, and how it works. No client code.
 */
export default async function ChiSiamoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const copy = COPY[lang];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-clip bg-navy pb-40 pt-32 text-white md:pb-48 md:pt-40">
        {/* The mark with rings rippling out of it. From lg it sits beside the
            title; on smaller screens only the rings show, from the corner. */}
        <div aria-hidden className="pointer-events-none absolute left-[100%] top-[30%] h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 sm:left-[88%] lg:left-[75%] lg:top-[46%] lg:h-[250px] lg:w-[250px]">
          <div className="absolute -inset-[90%] rounded-full bg-blue-500/35 blur-[90px]" />
          {[0.42, 0.32, 0.22, 0.14, 0.08].map((o, i) => (
            <span key={i} className="ab-ring" style={{ '--i': i, '--s': 1 + i * 0.43, '--o': o } as CSSProperties} />
          ))}
          <BrandMark id="about-hero-mark" className="relative hidden h-full w-full text-white lg:block" />
        </div>

        <div className="container relative mx-auto px-5 md:px-8">
          <p className={`${MONO} text-white/55`}>{copy.eyebrow}</p>
          <h1 className="mt-7 font-display text-[3.25rem] font-extrabold leading-[0.93] tracking-[-0.035em] sm:text-7xl lg:text-[5rem]">
            {copy.title[0]} <span className="block">{copy.title[1]}</span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-white/70 sm:text-xl sm:leading-relaxed">{copy.lead}</p>
        </div>
        <SectionEdge shape="arc" edge="bottom" />
      </section>

      <section className="container relative mx-auto -mt-28 px-5 md:-mt-32 md:px-8">
        <article className="grid gap-6 rounded-[28px] bg-card p-3 shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] ring-1 ring-border md:grid-cols-[minmax(0,17rem)_1fr] md:items-center md:gap-10 md:p-4 lg:grid-cols-[20rem_1fr] lg:gap-14">
          <div className="relative aspect-[4/3] overflow-clip rounded-[20px] bg-muted md:aspect-[4/5]">
            <Image src={PHOTO} alt={copy.founder.alt} fill priority sizes="(min-width: 1024px) 320px, (min-width: 768px) 272px, 100vw" className="object-cover object-top" />
          </div>
          <div className="px-3 pb-6 md:py-6 md:pl-0 md:pr-8 lg:pr-12">
            <p className={`${MONO} text-primary`}>{copy.founder.label}</p>
            <blockquote className="mt-4 font-quote text-2xl italic leading-snug md:text-[1.75rem]">“{copy.founder.quote}”</blockquote>
            <h2 className="mt-6 font-display text-2xl font-bold tracking-[-0.01em]">Hussein Faraj</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.founder.role}</p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{copy.founder.bio}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary">
                LinkedIn
                <ArrowUpRight aria-hidden className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>
              <a href={`mailto:${EMAIL}`} className="group inline-flex items-center gap-1.5 underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary">
                {copy.founder.write}
                <ArrowUpRight aria-hidden className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>
            </div>
          </div>
        </article>
      </section>

      <div className="space-y-24 py-24 md:space-y-32 md:py-32">
        <section className="container mx-auto px-5 md:px-8">
          <header className="grid gap-5 md:grid-cols-12 md:items-end">
            <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:col-span-7 md:text-[3rem]">
              <RevealWords text={copy.services.title} />
            </h2>
            <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5">{copy.services.lead}</p>
          </header>
          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {serviceGroupsFor(lang).map((g, gi) => (
              <div key={g.id} className="rv border-t border-foreground pt-5" style={{ '--i': gi } as CSSProperties}>
                <p className={`${MONO} text-muted-foreground`}>{g.title[lang]}</p>
                <p className="mt-2 text-sm text-muted-foreground">{g.about[lang]}</p>
                <ul className="mt-5 border-t border-border">
                  {g.services.map((slug) => (
                    <li key={slug} className="border-b border-border">
                      <Link href={getLocalizedPath(`/servizi/${slug}`, lang)} className="group flex items-center justify-between gap-4 py-3.5 font-medium transition-colors hover:text-primary">
                        {SERVICES[slug].name[lang]}
                        <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href={getLocalizedPath('/servizi', lang)}
            className="mt-10 inline-block font-medium underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
          >
            {copy.services.all}
          </Link>
        </section>

        <section className="container mx-auto grid gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className={`${MONO} text-muted-foreground`}>{copy.places.label}</p>
            <h2 className="rv-title mt-5 font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]">
              <RevealWords text={copy.places.title} />
            </h2>
            <p className="rv mt-6 text-lg leading-relaxed text-muted-foreground">{copy.places.lead}</p>
          </div>
          <ul className="grid border-t border-border sm:grid-cols-2 sm:gap-x-8 lg:col-span-7">
            {COUNTRIES.map((c, ci) => (
              <li key={c.code} className="rv flex items-baseline justify-between gap-4 border-b border-border py-4" style={{ '--i': ci % 4 } as CSSProperties}>
                <span className="font-display text-xl font-bold tracking-[-0.01em] md:text-[1.4rem]">{c.name[lang]}</span>
                <span aria-hidden className={`${MONO} text-muted-foreground`}>{c.code}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="container mx-auto px-5 md:px-8">
          <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]">
            <RevealWords text={copy.principles.title} />
          </h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-6">
            {copy.principles.items.map((p, pi) => (
              <li key={p.title} className="rv border-t border-border pt-5" style={{ '--i': pi } as CSSProperties}>
                <h3 className="font-display text-lg font-bold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <HomeCtaSection locale={lang} />
    </div>
  );
}
