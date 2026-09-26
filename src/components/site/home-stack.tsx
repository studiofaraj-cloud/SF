import type { Locale } from '@/i18n/config';
import { SectionEdge } from './section-edge';

type Layer = { name: string; tools: string[]; why: string };

const COPY: Record<Locale, { title: string; lead: string; layers: Layer[] }> = {
  it: {
    title: 'Tecnologie scelte per durare.',
    lead: 'Strumenti moderni e molto diffusi, scelti per velocità e sicurezza, e perché il codice resti facile da far evolvere anche dopo di noi.',
    layers: [
      {
        name: 'Interfaccia',
        tools: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
        why: 'Pagine generate sul server: si caricano in fretta e Google le legge senza fatica.',
      },
      { name: 'Server', tools: ['Node.js'], why: 'Logica, API e integrazioni scritte su misura, senza plugin di terze parti.' },
      { name: 'Dati', tools: ['Firebase', 'PostgreSQL'], why: 'Il database giusto per il progetto, in tempo reale o relazionale.' },
      { name: 'Pagamenti', tools: ['Stripe', 'PayPal'], why: 'Checkout, abbonamenti e pagamenti integrati direttamente nel sito.' },
      { name: 'Infrastruttura', tools: ['Vercel', 'Google Cloud'], why: 'Hosting veloce, certificati SSL e backup gestiti da noi.' },
    ],
  },
  en: {
    title: 'Technology chosen to last.',
    lead: 'Modern, widely used tools, chosen for speed and security, and so the code stays easy to evolve, even after us.',
    layers: [
      {
        name: 'Interface',
        tools: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
        why: 'Pages rendered on the server: they load fast and Google reads them easily.',
      },
      { name: 'Server', tools: ['Node.js'], why: 'Logic, APIs and integrations written to measure, with no third-party plugins.' },
      { name: 'Data', tools: ['Firebase', 'PostgreSQL'], why: 'The right database for the project, real-time or relational.' },
      { name: 'Payments', tools: ['Stripe', 'PayPal'], why: 'Checkout, subscriptions and payments built straight into the site.' },
      { name: 'Infrastructure', tools: ['Vercel', 'Google Cloud'], why: 'Fast hosting, SSL certificates and backups, managed by us.' },
    ],
  },
};

/**
 * The stack by layer, each with the reason it's used — technical without being
 * a logo wall. Navy band: the second appearance of the hero's code language.
 * Server component.
 */
export function HomeStack({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section className="relative bg-navy py-20 text-white md:py-28 lg:py-32">
      <SectionEdge shape="steps" edge="top" />
      <SectionEdge shape="wave" edge="bottom" />
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] md:col-span-6 md:text-[3.4rem]">
            {copy.title}
          </h2>
          <p className="text-lg leading-relaxed text-white/60 md:col-span-5 md:col-start-8">{copy.lead}</p>
        </header>

        <dl className="mt-14 border-t border-white/15 md:mt-20">
          {copy.layers.map((layer) => (
            <div key={layer.name} className="grid gap-3 border-b border-white/15 py-7 md:grid-cols-12 md:gap-8 md:py-8">
              <dt className="font-display text-xl font-bold tracking-[-0.01em] md:col-span-3 md:text-2xl">{layer.name}</dt>
              <dd className="md:col-span-9">
                <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[15px] text-sky-300">
                  {layer.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
                <p className="mt-3 max-w-2xl leading-relaxed text-white/60">{layer.why}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
