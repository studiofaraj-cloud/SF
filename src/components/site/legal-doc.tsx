import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { CONTACT } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

export type LegalDocId = 'privacy' | 'cookie' | 'terms';

export type LegalSection = { id: string; title: string; body: ReactNode };

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';

const DOCS: { id: LegalDocId; href: string; name: Record<Locale, string> }[] = [
  { id: 'privacy', href: '/privacy', name: { it: 'Privacy', en: 'Privacy' } },
  { id: 'cookie', href: '/cookie', name: { it: 'Cookie policy', en: 'Cookie policy' } },
  { id: 'terms', href: '/terms', name: { it: 'Termini e condizioni', en: 'Terms and conditions' } },
];

const COPY = {
  it: {
    docs: 'Documenti legali',
    onPage: 'In questa pagina',
    brief: 'In breve',
    questions: { privacy: 'Domande sui tuoi dati?', cookie: 'Domande sui cookie?', terms: 'Domande sui termini?' },
    updated: 'Aggiornata il',
    prevails: '',
  },
  en: {
    docs: 'Legal documents',
    onPage: 'On this page',
    brief: 'In short',
    questions: { privacy: 'Questions about your data?', cookie: 'Questions about cookies?', terms: 'Questions about the terms?' },
    updated: 'Updated on',
    prevails: 'This is a translation: if it differs from the Italian version, the Italian version prevails.',
  },
} as const;

/** Body text of a legal section: paragraphs, lists, links and small headings. */
export const LEGAL_PROSE = cn(
  'text-[1.0625rem] leading-[1.75] text-foreground/80',
  '[&_p+p]:mt-4 [&_p+ul]:mt-3 [&_ul+p]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-primary',
  '[&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3+p]:mt-2',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary',
);

/**
 * A table of the facts a legal page lists (what data, why, for how long; which
 * cookie, who sets it, how long). From md a real table; on phones each row
 * becomes a small card, so nothing needs scrolling sideways.
 */
export function LegalTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-6">
      <table className="hidden w-full border-collapse text-left text-[14.5px] leading-snug md:table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className={`${MONO} border-b border-foreground pb-2.5 pr-4 font-medium text-muted-foreground`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} className={cn('border-b border-border py-3.5 pr-4 align-top', ci === 0 ? 'font-semibold text-foreground' : 'text-foreground/80')}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-3 md:hidden">
        {rows.map((r, ri) => (
          <dl key={ri} className="rounded-2xl p-4 ring-1 ring-border">
            <dt className="font-semibold text-foreground">{r[0]}</dt>
            {r.slice(1).map((c, ci) => (
              <div key={ci} className="mt-3">
                <dt className={`${MONO} text-muted-foreground`}>{head[ci + 1]}</dt>
                <dd className="mt-1 text-[15px] leading-snug text-foreground/80">{c}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </div>
  );
}

/**
 * Layout shared by the privacy policy, the cookie policy and the terms. A navy
 * card stays beside the text on wide screens: the three documents, this
 * page's sections and the contact address. Server component.
 */
export function LegalDoc({
  locale,
  doc,
  title,
  lead,
  updated,
  brief,
  actions,
  sections,
}: {
  locale: Locale;
  doc: LegalDocId;
  title: string;
  lead: string;
  /** ISO date of the last change to this text. */
  updated: string;
  brief?: ReactNode[];
  /** Shown under the summary, e.g. the cookie preferences button. */
  actions?: ReactNode;
  sections: LegalSection[];
}) {
  const copy = COPY[locale];
  const date = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(updated));
  const toc = (
    <ol className="space-y-1 text-[14px]">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex gap-3 rounded-lg py-1.5 text-white/70 transition-colors hover:text-white">
            <span className="w-5 shrink-0 pt-[3px] font-mono text-[10.5px] text-white/40">{String(i + 1).padStart(2, '0')}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto grid gap-10 px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-0">
        <header className="lg:col-span-8 lg:col-start-5 lg:row-start-1">
          <p className={`${MONO} text-muted-foreground`}>
            {copy.updated} <time dateTime={updated}>{date}</time>
          </p>
          <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1] tracking-[-0.035em] md:text-6xl lg:text-[3.9rem]">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">{lead}</p>
        </header>

        <aside className="lg:col-span-4 lg:row-span-2 lg:row-start-1">
          <div className="rounded-[28px] bg-navy p-6 text-white md:p-7 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto [scrollbar-color:rgb(255_255_255/0.25)_transparent] [scrollbar-width:thin]">
            <p className={`${MONO} text-white/55`}>{copy.docs}</p>
            <nav aria-label={copy.docs} className="mt-4 grid gap-1.5">
              {DOCS.map((d) => {
                const current = d.id === doc;
                return (
                  <Link
                    key={d.id}
                    href={getLocalizedPath(d.href, locale)}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'flex h-11 items-center justify-between rounded-xl px-4 text-[15px] font-semibold transition-colors',
                      current ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {d.name[locale]}
                    {current && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-7 hidden lg:block">
              <p className={`${MONO} text-white/55`}>{copy.onPage}</p>
              <div className="mt-3">{toc}</div>
            </div>
            <details className="group mt-6 lg:hidden">
              <summary className={`${MONO} flex cursor-pointer list-none items-center justify-between text-white/70 [&::-webkit-details-marker]:hidden`}>
                {copy.onPage}
                <ChevronDown aria-hidden className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3">{toc}</div>
            </details>

            <div className="mt-6 border-t border-white/15 pt-5 text-sm leading-relaxed text-white/70">
              {copy.questions[doc]}
              <a href={`mailto:${CONTACT.email}`} className="group mt-1 flex items-center gap-1.5 font-semibold text-white">
                {CONTACT.email}
                <ArrowUpRight aria-hidden className="h-4 w-4 text-white/50 transition-colors group-hover:text-white" />
              </a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5 lg:row-start-2 lg:pt-12">
          <div className="max-w-[72ch]">
            {brief && brief.length > 0 && (
              <div className="rounded-2xl bg-muted/60 p-6 ring-1 ring-border md:p-7">
                <p className={`${MONO} text-muted-foreground`}>{copy.brief}</p>
                <ul className="mt-4 space-y-3 text-[15.5px] leading-relaxed">
                  {brief.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/85">{b}</span>
                    </li>
                  ))}
                </ul>
                {actions && <div className="mt-6">{actions}</div>}
              </div>
            )}

            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="mt-14 scroll-mt-28 first:mt-0">
                <h2 className="flex items-baseline gap-3 font-display text-2xl font-bold leading-tight tracking-[-0.02em] md:text-[1.75rem]">
                  <span className="font-mono text-[11px] font-normal tracking-[0.16em] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className={cn('mt-5', LEGAL_PROSE)}>{s.body}</div>
              </section>
            ))}

            {copy.prevails && <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">{copy.prevails}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
