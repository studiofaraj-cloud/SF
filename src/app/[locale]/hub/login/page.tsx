import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, FolderOpen, MessageSquare } from 'lucide-react';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { HubAuthForm, type AuthMode } from '@/components/hub/auth-form';
import { RequestPreview } from '@/components/hub/request-preview';
import { LocaleSwitch } from '@/components/site/locale-switch';
import { sameSitePath } from '@/lib/safe-redirect';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string; next?: string }>;
};

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';

const COPY = {
  it: {
    title: 'Accedi all’area clienti',
    description: 'Accedi o crea il tuo account Studio Faraj per inviare una richiesta, ricevere il preventivo e seguire il tuo progetto.',
    home: 'Studio Faraj, torna alla home',
    back: 'Torna al sito',
    eyebrow: 'Area clienti',
    headline: ['Il tuo progetto,', 'in un unico posto.'],
    lead: 'Richieste, messaggi, file e preventivi: segui ogni fase del lavoro con lo studio, dalla prima idea alla consegna.',
    features: 'Nell’area clienti',
    items: ['Richieste', 'Messaggi', 'File', 'Preventivi e pagamenti'],
  },
  en: {
    title: 'Sign in to the client area',
    description: 'Sign in or create your Studio Faraj account to send a request, get your quote and follow your project.',
    home: 'Studio Faraj, back to the home page',
    back: 'Back to the site',
    eyebrow: 'Client area',
    headline: ['Your project,', 'all in one place.'],
    lead: 'Requests, messages, files and quotes: follow every stage of the work with the studio, from the first idea to delivery.',
    features: 'In the client area',
    items: ['Requests', 'Messages', 'Files', 'Quotes and payments'],
  },
} as const;

const ICONS = [FileText, MessageSquare, FolderOpen, CreditCard];

/** After signing in: a path on this site, never the login page itself. */
function safeNext(next: string | undefined, locale: string) {
  const fallback = `/${locale}/hub`;
  const path = sameSitePath(next, siteConfig.url, fallback);
  return path.split(/[?#]/)[0].endsWith('/hub/login') ? fallback : path;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'it';
  return generateSEOMetadata({
    title: COPY[lang].title,
    description: COPY[lang].description,
    url: `${siteConfig.url}/${lang}/hub/login`,
    locale: lang,
    // A sign-in screen is not something to find on Google: /inizia is the
    // page that explains the client area. Links on it are still followed.
    noindex: true,
  });
}

export default async function HubLoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'it';
  const { mode, next } = await searchParams;
  const c = COPY[lang];
  const initialMode: AuthMode = mode === 'register' ? 'register' : 'signin';

  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[minmax(0,46%)_minmax(0,1fr)]">
      <aside className="relative overflow-clip bg-navy text-white lg:flex lg:min-h-[100dvh] lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,#1d3a72_0%,transparent_55%)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-64 -right-56 hidden h-[620px] w-[620px] rounded-full border border-white/[0.08] shadow-[0_0_0_70px_rgba(255,255,255,0.025),0_0_0_140px_rgba(255,255,255,0.02)] lg:block"
        />

        <div className="relative flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 lg:px-14 lg:pt-9">
          <Link href={`/${lang}`} aria-label={c.home} className="flex items-center gap-2.5 text-[17px] font-semibold">
            <Image src="/assets/logo-white.webp" alt="" width={34} height={34} priority />
            Studio Faraj
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitch className="text-white lg:hidden" />
            <Link href={`/${lang}`} className="flex items-center gap-1.5 text-[13.5px] text-white/70 transition-colors hover:text-white">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              <span className="hidden sm:inline">{c.back}</span>
              <span className="sr-only sm:hidden">{c.back}</span>
            </Link>
          </div>
        </div>

        <div className="relative px-5 pb-[4.5rem] pt-7 sm:px-8 lg:my-auto lg:px-14 lg:py-10">
          <p className={`${MONO} text-[#93b4ff]`}>{c.eyebrow}</p>
          <p className="mt-3 font-display text-[2.1rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-[2.6rem] lg:mt-5 lg:text-[3.25rem]">
            {c.headline[0]}
            <br />
            {c.headline[1]}
          </p>
          <p className="mt-5 hidden max-w-[440px] text-[17px] leading-relaxed text-white/70 lg:block">{c.lead}</p>
          <RequestPreview locale={lang} className="mt-9 hidden max-w-[470px] lg:block" />
        </div>

        <div className="relative hidden px-14 pb-10 lg:block">
          <p className="sr-only">{c.features}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13.5px] text-white/80">
            {c.items.map((item, i) => {
              const Icon = ICONS[i];
              return (
                <li key={item} className="flex items-center gap-2.5">
                  <Icon aria-hidden className="h-4 w-4 text-[#93b4ff]" />
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <main className="relative z-[1] -mt-11 px-4 pb-12 lg:mt-0 lg:flex lg:min-h-[100dvh] lg:items-center lg:justify-center lg:p-10">
        <div className="absolute right-8 top-6 hidden lg:block">
          <LocaleSwitch className="text-muted-foreground" />
        </div>
        <div className="mx-auto w-full max-w-[420px] rounded-3xl bg-background p-6 shadow-[0_20px_50px_-30px_rgba(2,8,23,0.5)] ring-1 ring-border/60 sm:p-8 lg:rounded-none lg:p-0 lg:shadow-none lg:ring-0">
          <HubAuthForm locale={lang} initialMode={initialMode} next={safeNext(next, lang)} />
        </div>
      </main>
    </div>
  );
}
