import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { BookCallButton } from './book-call-button';
import { RevealWords } from './reveal-words';
import { ServicePanel, type ServiceProof } from './service-panel';
import { ServiceQuoteButton } from './service-quote-button';
import { FaqSection } from './service-faq';

/*
 * The sections only /servizi/sviluppo-web has, fed by its
 * services.webDevelopment.v2 messages. Server components; the quote buttons
 * are the only client islands and open the form with the scenario or sector
 * already written in.
 */

type Msg = Record<string, any>;

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground';
const H2 = 'rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]';

function Header({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="grid gap-5 md:grid-cols-12 md:items-end">
      <h2 className={`${H2} md:col-span-7`}>
        <RevealWords text={title} />
      </h2>
      {lead && <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5">{lead}</p>}
    </header>
  );
}

const INCLUDES: Record<Locale, string> = { it: 'Cosa include', en: "What's included" };

/** The three ways the studio works with a client: what each includes, and a real project of that kind. */
export function WebScenarios({
  m,
  examples,
  locale,
}: {
  m: Msg;
  examples: Partial<Record<'vetrina' | 'dashboard' | 'platform', ServiceProof>>;
  locale: Locale;
}) {
  const a = m.archetypes;
  const service = { vetrina: 'sviluppo-web', dashboard: 'sviluppo-web', platform: 'e-commerce' } as const;

  return (
    <section className="container mx-auto px-5 md:px-8">
      <Header title={`${a.title} ${a.titleHighlight}`} lead={a.subtitle} />
      <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
        {(['vetrina', 'dashboard', 'platform'] as const).map((k, i) => {
          const x = a[k];
          return (
            <article key={k} className="grid gap-10 border-t border-border pt-10 lg:grid-cols-12 lg:items-center lg:gap-14">
              <div className={`min-w-0 lg:col-span-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <p className={MONO}>
                  <span className="text-primary">{String(i + 1).padStart(2, '0')}</span> · {x.tag}
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] md:text-4xl">{x.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{x.description}</p>
                {x.painLine && (
                  <blockquote className="mt-5 border-l-2 border-primary pl-4 leading-relaxed text-foreground/80">{x.painLine}</blockquote>
                )}
                {Array.isArray(x.examples) && x.examples.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold">{x.examplesTitle}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {(x.examples as string[]).map((e) => (
                        <li key={e} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground ring-1 ring-border">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(x.techs) && <p className={`mt-6 ${MONO}`}>{(x.techs as string[]).join(' · ')}</p>}
                <div className="mt-8">
                  <ServiceQuoteButton label={x.cta} service={service[k]} message={m.prefill?.[k]} />
                </div>
              </div>

              <div className={`rv min-w-0 lg:col-span-6 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <ServicePanel label={INCLUDES[locale]} items={x.bullets as string[]} example={examples[k]} locale={locale} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** Template / freelance / studio, as one table that stacks into cards on phones. */
export function WebComparison({ m }: { m: Msg }) {
  const d = m.differentiators;
  const cols = d.columns;
  const cell = 'max-md:block max-md:py-1 max-md:before:mr-2 max-md:before:font-mono max-md:before:text-[11px] max-md:before:uppercase max-md:before:tracking-[0.14em] max-md:before:text-muted-foreground max-md:before:content-[attr(data-label)]';

  return (
    <section className="container mx-auto px-5 md:px-8">
      <Header title={`${d.title} ${d.titleHighlight}`} lead={d.subtitle} />
      <table className="mt-12 w-full border-collapse text-left md:mt-16">
        <caption className="sr-only">{d.subtitle}</caption>
        <thead className="max-md:sr-only">
          <tr className="border-b-2 border-foreground">
            <th scope="col" className={`${MONO} py-4 pr-6 font-normal`}>{cols.feature}</th>
            <th scope="col" className={`${MONO} py-4 pr-6 font-normal`}>{cols.noCode}</th>
            <th scope="col" className={`${MONO} py-4 pr-6 font-normal`}>{cols.freelance}</th>
            <th scope="col" className="rounded-t-xl bg-navy px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-white">{cols.us}</th>
          </tr>
        </thead>
        <tbody>
          {(d.rows as Msg[]).map((r) => (
            <tr key={r.feature} className="rv border-b border-border max-md:block max-md:py-5">
              <th scope="row" className="py-5 pr-6 font-display text-lg font-bold tracking-[-0.01em] max-md:block max-md:py-0 max-md:pb-2">
                {r.feature}
              </th>
              <td data-label={cols.noCode} className={`py-5 pr-6 text-muted-foreground ${cell}`}>{r.noCode}</td>
              <td data-label={cols.freelance} className={`py-5 pr-6 text-muted-foreground ${cell}`}>{r.freelance}</td>
              <td data-label={cols.us} className={`bg-primary/[0.07] px-5 py-5 font-semibold ${cell} max-md:mt-2 max-md:rounded-lg max-md:px-3 max-md:py-2`}>
                {r.us}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {d.cta && (
        <div className="mt-10">
          <ServiceQuoteButton label={d.cta} service="consulenza" message={m.prefill?.differentiators} variant="outline" />
        </div>
      )}
    </section>
  );
}

/** Sectors: each opens the quote form with the sector already named. */
export function WebSectors({ m }: { m: Msg }) {
  const ind = m.industries;
  const template: string = m.prefill?.industries ?? '';
  const withSector = (name: string) => template.replace('[scrivi qui il tuo settore]', name).replace('[write your industry here]', name);

  return (
    <section className="container mx-auto px-5 md:px-8">
      <Header title={`${ind.title} ${ind.titleHighlight}`} lead={ind.subtitle} />
      <ul className="mt-12 grid gap-3 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
        {(ind.items as { name: string; desc: string }[]).map((it, i) => (
          <li key={it.name} className="rv" style={{ '--i': i % 3 } as CSSProperties}>
            <ServiceQuoteButton
              label={it.name}
              service="sviluppo-web"
              message={withSector(it.name)}
              variant="plain"
              className="group flex h-full w-full items-start justify-between gap-4 rounded-xl bg-muted/50 p-5 text-left ring-1 ring-border/70 transition-colors hover:bg-foreground hover:text-background hover:ring-foreground"
            >
              <span>
                <span className="block font-display text-lg font-bold tracking-[-0.01em]">{it.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-background/70">{it.desc}</span>
              </span>
              <ArrowRight aria-hidden className="mt-1 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </ServiceQuoteButton>
          </li>
        ))}
      </ul>
      {(ind.footer || ind.cta) && (
        <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {ind.footer && <p className="max-w-2xl text-muted-foreground">{ind.footer}</p>}
          {ind.cta && <ServiceQuoteButton label={ind.cta} service="consulenza" message={template} variant="outline" />}
        </div>
      )}
    </section>
  );
}

/** The page's closing: two paths (a quote, or a call first) in the navy bottom sheet. */
export function WebTwoPaths({ m, locale }: { m: Msg; locale: Locale }) {
  const c = m.ctaFinal;
  const trust = [c.trustResponse, c.trustFree, c.trustHQ, c.trustPiva].filter(Boolean);

  return (
    <section className="rv-sheet relative overflow-clip rounded-t-[clamp(28px,6vw,112px)] bg-navy text-white shadow-[0_-30px_80px_-40px_rgba(10,22,40,0.5)]">
      <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/25 md:top-5 md:w-16" />
      <div className="container relative mx-auto px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <h2 className="rv-title max-w-3xl text-balance font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl">
          <RevealWords text={`${c.title} ${c.titleHighlight}`} />
        </h2>
        <p className="rv mt-6 text-lg text-white/70">{c.subtitle}</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rv flex flex-col rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/15 md:p-9">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sky-300">A</p>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">{c.pathA.title}</h3>
            <p className="mt-2 flex-1 leading-relaxed text-white/70">{c.pathA.description}</p>
            <div className="mt-7">
              <ServiceQuoteButton label={c.pathA.cta} service="sviluppo-web" />
            </div>
          </div>
          <div className="rv flex flex-col rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/15 md:p-9" style={{ '--i': 1 } as CSSProperties}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sky-300">B</p>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">{c.pathB.title}</h3>
            <p className="mt-2 flex-1 leading-relaxed text-white/70">{c.pathB.description}</p>
            <div className="mt-7">
              <BookCallButton className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white hover:text-navy">
                {c.pathB.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </BookCallButton>
            </div>
          </div>
        </div>

        {trust.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-white/50">
            {trust.map((x: string) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** The page's own FAQ, with its FAQPage JSON-LD. */
export function WebFaq({ m }: { m: Msg }) {
  const f = m.faq;
  const faqs = (f.items as { q: string; a: string }[]).map((x) => ({ question: x.q, answer: x.a }));
  return <FaqSection title={`${f.title} ${f.titleHighlight}`} faqs={faqs} id="faq-sviluppo-web" />;
}
