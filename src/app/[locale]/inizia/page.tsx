import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ClipboardList, MessagesSquare, FolderOpen, Receipt, UserPlus, FileText, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: en ? 'Start your project — Studio Faraj' : 'Inizia il tuo progetto — Studio Faraj',
    description: en
      ? 'Create your client account to request services, track progress, chat with our team, and pay online.'
      : 'Crea il tuo account cliente per richiedere servizi, seguire l’avanzamento, chattare con il team e pagare online.',
  };
}

export default async function StartPage({ params }: Props) {
  const { locale } = await params;
  const en = locale === 'en';
  const registerHref = `/${locale}/hub/login?mode=register&next=${encodeURIComponent(`/${locale}/hub/requests/new`)}`;
  const loginHref = `/${locale}/hub/login`;

  const steps = [
    {
      icon: UserPlus,
      title: en ? 'Create your account' : 'Crea il tuo account',
      desc: en ? 'Sign up in seconds with email or Google.' : 'Registrati in pochi secondi con email o Google.',
    },
    {
      icon: FileText,
      title: en ? 'Submit your request' : 'Invia la tua richiesta',
      desc: en ? 'Tell us what you need and your budget.' : 'Raccontaci cosa ti serve e il tuo budget.',
    },
    {
      icon: Rocket,
      title: en ? 'Track, chat & pay' : 'Segui, chatta e paga',
      desc: en
        ? 'Follow progress, message us, and pay quotes online.'
        : 'Segui l’avanzamento, scrivici e paga i preventivi online.',
    },
  ];

  const features = [
    {
      icon: ClipboardList,
      title: en ? 'Request tracking' : 'Tracciamento richieste',
      desc: en ? 'Every project in one place, always up to date.' : 'Ogni progetto in un unico posto, sempre aggiornato.',
    },
    {
      icon: MessagesSquare,
      title: en ? 'Real-time chat' : 'Chat in tempo reale',
      desc: en ? 'Talk directly with the Studio Faraj team.' : 'Parla direttamente con il team di Studio Faraj.',
    },
    {
      icon: FolderOpen,
      title: en ? 'File sharing' : 'Condivisione file',
      desc: en ? 'Share briefs and receive deliverables securely.' : 'Condividi brief e ricevi i materiali in sicurezza.',
    },
    {
      icon: Receipt,
      title: en ? 'Quotes & online payments' : 'Preventivi e pagamenti online',
      desc: en ? 'Review quotes and pay securely by card.' : 'Consulta i preventivi e paga in sicurezza con carta.',
    },
  ];

  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pb-16 pt-28 md:pt-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            {en ? 'Client Hub' : 'Area Clienti'}
          </span>
          <h1
            className="mt-6 animate-gradient bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl"
            style={{
              backgroundImage: 'linear-gradient(to right, #3b82f6, #8b5cf6, #3b82f6)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              animationDuration: '6s',
            }}
            suppressHydrationWarning
          >
            {en ? 'Start your project with Studio Faraj' : 'Inizia il tuo progetto con Studio Faraj'}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            {en
              ? 'Create your account to request a website or any service, track progress, chat with us, and pay — all in one place.'
              : 'Crea il tuo account per richiedere un sito o qualsiasi servizio, seguire l’avanzamento, chattare con noi e pagare — tutto in un unico posto.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 px-7 text-base">
              <Link href={registerHref}>
                {en ? 'Create account & start' : 'Crea account e inizia'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base">
              <Link href={loginHref}>{en ? 'I already have an account' : 'Ho già un account'}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
            {en ? 'How it works' : 'Come funziona'}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border/60 bg-card/50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-xs font-semibold text-primary">
                  {en ? `Step ${i + 1}` : `Passo ${i + 1}`}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
            {en ? 'Everything in your client area' : 'Tutto nella tua area clienti'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/50 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            {en ? 'Ready to start?' : 'Pronto a iniziare?'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {en
              ? 'Create your free account and send your first request in minutes.'
              : 'Crea il tuo account gratuito e invia la prima richiesta in pochi minuti.'}
          </p>
          <Button asChild size="lg" className="mt-7 h-12 gap-2 px-7 text-base">
            <Link href={registerHref}>
              {en ? 'Create account & start' : 'Crea account e inizia'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
