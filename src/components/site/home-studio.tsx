import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import { RevealWords } from './reveal-words';

const COPY: Record<
  Locale,
  { title: string; body: string; founder: string; role: string; alt: string; principles: { title: string; text: string }[]; link: string }
> = {
  it: {
    title: 'Dal 2020 al servizio di chi fa impresa.',
    body: 'Studio Faraj nasce a Padova con un obiettivo chiaro: aiutare le aziende a crescere nel digitale. Siamo un team di sviluppatori e designer: non creiamo solo siti web, costruiamo sistemi digitali che fanno risparmiare tempo e rendono la tua attività più facile da trovare.',
    founder: 'Hussein Faraj',
    role: 'Fondatore',
    alt: 'Hussein Faraj, fondatore di Studio Faraj',
    principles: [
      { title: 'Il codice è tuo', text: 'Codice sorgente, dominio e contenuti restano di tua proprietà: puoi cambiare fornitore quando vuoi.' },
      { title: 'Veloce e trovabile', text: 'SEO tecnica e prestazioni misurate fanno parte di ogni progetto, non si aggiungono alla fine.' },
      { title: 'Un solo team', text: 'Design, sviluppo, hosting e manutenzione con le stesse persone, dall’inizio alla fine.' },
    ],
    link: 'Conosci lo studio',
  },
  en: {
    title: 'Since 2020, working for people who run businesses.',
    body: 'Studio Faraj was founded in Padova with one clear goal: helping companies grow online. We are a team of developers and designers: we don’t just make websites, we build digital systems that save time and make your business easier to find.',
    founder: 'Hussein Faraj',
    role: 'Founder',
    alt: 'Hussein Faraj, founder of Studio Faraj',
    principles: [
      { title: 'The code is yours', text: 'Source code, domain and content stay yours: you can change supplier whenever you want.' },
      { title: 'Fast and findable', text: 'Technical SEO and measured performance are part of every project, not added at the end.' },
      { title: 'One team', text: 'Design, development, hosting and maintenance with the same people, from start to finish.' },
    ],
    link: 'Meet the studio',
  },
};

/**
 * Who's behind the work — replaces the stock-photo "why choose us" block and
 * the team band with one human section: the founder, what the studio is, and
 * three principles that are commitments rather than unverifiable claims.
 * Server component.
 */
export function HomeStudio({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section className="bg-background py-20 md:py-28 lg:py-32">
      <div className="container mx-auto grid gap-12 px-5 md:px-8 lg:grid-cols-12 lg:gap-16">
        {/* Phones: a small portrait beside the name, so the heading isn't a
            full screen away. From lg: the large portrait. */}
        <figure className="flex items-center gap-4 lg:col-span-4 lg:block">
          <div className="rv-img relative aspect-square w-24 shrink-0 overflow-clip rounded-xl bg-muted [--rv-r:0.75rem] lg:w-full lg:max-w-[22rem]">
            <Image
              src="/assets/hussein-faraj-fondatore-studio-faraj.webp"
              alt={copy.alt}
              fill
              sizes="(min-width: 1024px) 352px, 96px"
              className="object-cover"
            />
          </div>
          <figcaption className="text-sm lg:mt-4">
            <span className="font-semibold text-foreground">{copy.founder}</span>
            <span className="block text-muted-foreground">{copy.role}, Studio Faraj</span>
          </figcaption>
        </figure>

        <div className="lg:col-span-8">
          <h2 className="rv-title font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:text-[3.4rem]">
            <RevealWords text={copy.title} />
          </h2>
          <p className="rv mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style={{ '--i': 1 } as React.CSSProperties}>{copy.body}</p>

          <ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {copy.principles.map((p, pi) => (
              <li key={p.title} className="rv border-t border-border pt-5" style={{ '--i': pi } as React.CSSProperties}>
                <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>

          <Link
            href={getLocalizedPath('/chi-siamo', locale)}
            className="mt-10 inline-block font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
          >
            {copy.link}
          </Link>
        </div>
      </div>
    </section>
  );
}
