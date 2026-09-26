import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLocalizedPath } from '@/lib/i18n-helpers';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Studio%20Faraj%2C%20Via%20Ludovico%20Ariosto%2042%2C%2035128%20Padova&query_place_id=ChIJV_YxeITzBAERefznEKaDrkc';

const COPY = {
  it: {
    title: ['Hai un progetto in mente?', 'Parliamone.'],
    lead: 'Raccontaci cosa vuoi costruire: rispondiamo entro 24 ore con una proposta concreta. La prima consulenza è gratuita.',
    start: 'Inizia il tuo progetto',
    contact: 'Scrivici un messaggio',
    email: 'Email',
    phone: 'Telefono',
    studio: 'Studio',
  },
  en: {
    title: ['Have a project in mind?', 'Let’s talk.'],
    lead: 'Tell us what you want to build: we reply within 24 hours with a concrete proposal. The first consultation is free.',
    start: 'Start your project',
    contact: 'Send us a message',
    email: 'Email',
    phone: 'Phone',
    studio: 'Studio',
  },
} as const;

/**
 * Closing call to action — navy band that bookends the hero. What happens
 * next, plus the real ways to reach the studio. Server component.
 */
export default function HomeCtaSection({ locale }: { locale: 'it' | 'en' }) {
  const copy = COPY[locale];
  const contacts = [
    { label: copy.email, value: 'info@studiofaraj.it', href: 'mailto:info@studiofaraj.it', external: false },
    { label: copy.phone, value: '+39 320 222 3322', href: 'tel:+393202223322', external: false },
    { label: copy.studio, value: 'Via Ludovico Ariosto 42, 35128 Padova', href: MAPS_URL, external: true },
  ];

  return (
    // Rises like a bottom sheet: rounded top corners, a grabber, a soft shadow
    // on the section above. Its only neighbour above uses bg-background.
    <section className="relative overflow-hidden rounded-t-[clamp(28px,6vw,112px)] bg-navy text-white shadow-[0_-30px_80px_-40px_rgba(10,22,40,0.5)]">
      <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/25 md:top-5 md:w-16" />
      <div className="container relative mx-auto grid gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-10 lg:py-32">
        <div className="lg:col-span-7">
          <h2 className="text-balance font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl lg:text-[4.2rem]">
            {copy.title[0]} <span className="block">{copy.title[1]}</span>
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">{copy.lead}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-[52px] px-7 text-base font-semibold">
              <Link href={getLocalizedPath('/inizia', locale)}>{copy.start}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-[52px] border-white/25 bg-transparent px-7 text-base font-semibold text-white hover:border-white hover:bg-white hover:text-navy"
            >
              <Link href={getLocalizedPath('/contatti', locale)}>{copy.contact}</Link>
            </Button>
          </div>
        </div>

        <dl className="self-end border-t border-white/15 lg:col-span-4 lg:col-start-9">
          {contacts.map((c) => (
            <div key={c.label} className="border-b border-white/15 py-5">
              <dt className="text-sm text-white/50">{c.label}</dt>
              <dd className="mt-1">
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-lg font-medium text-white underline decoration-white/20 underline-offset-[6px] transition-colors hover:decoration-white"
                >
                  {c.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
