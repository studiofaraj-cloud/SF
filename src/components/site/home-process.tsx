import type { Locale } from '@/i18n/config';
import { RevealWords } from './reveal-words';

const COPY: Record<Locale, { title: string; lead: string; steps: { title: string; text: string }[] }> = {
  it: {
    title: 'Come lavoriamo',
    lead: 'Quattro fasi, lo stesso team dall’inizio alla fine e un’area clienti dove seguire ogni passaggio.',
    steps: [
      { title: 'Analisi e strategia', text: 'Ascoltiamo le tue esigenze e definiamo insieme gli obiettivi per creare una strategia su misura.' },
      { title: 'Design e prototipo', text: 'Creiamo un design unico e funzionale, focalizzato sull’esperienza utente e sull’identità del tuo brand.' },
      { title: 'Sviluppo', text: 'Trasformiamo il design in un sito performante, sicuro e ottimizzato per tutti i dispositivi.' },
      { title: 'Lancio e ottimizzazione', text: 'Mettiamo online il sito e ne monitoriamo le prestazioni, per risultati che durano nel tempo.' },
    ],
  },
  en: {
    title: 'How we work',
    lead: 'Four stages, the same team from start to finish, and a client area where you can follow every step.',
    steps: [
      { title: 'Analysis and strategy', text: 'We listen to your needs and define the goals together to build a tailored strategy.' },
      { title: 'Design and prototype', text: 'We create a distinctive, functional design focused on user experience and your brand identity.' },
      { title: 'Development', text: 'We turn the design into a fast, secure website optimised for every device.' },
      { title: 'Launch and optimisation', text: 'We put the site live and monitor its performance, for results that last.' },
    ],
  },
};

/** The process — a real sequence, so the steps are numbered. Server component. */
export function HomeProcess({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section className="bg-background py-20 md:py-28 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="rv-title font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:col-span-6 md:text-[3.4rem]">
            <RevealWords text={copy.title} />
          </h2>
          <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5 md:col-start-8" style={{ '--i': 1 } as React.CSSProperties}>{copy.lead}</p>
        </header>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-8">
          {copy.steps.map((step, i) => (
            <li key={step.title} className="rv rv-rule-t border-t-2 border-foreground pt-6" style={{ '--i': i } as React.CSSProperties}>
              <span aria-hidden className="rv-slot">
                <span className="font-display text-4xl font-bold tracking-[-0.02em] text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em] text-foreground">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
