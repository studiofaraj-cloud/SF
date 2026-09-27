import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowDown, ArrowRight, ArrowUpRight, ExternalLink, Navigation } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';
import ContattiMap from '@/components/site/contatti-map';
import { RevealWords } from '@/components/site/reveal-words';
import { FaqSection } from '@/components/site/service-faq';
import { WhatsAppIcon } from '@/components/site/whatsapp-icon';
import { CONTACT, DIRECTIONS_URL, OPEN_IN_MAPS_URL, whatsappUrl } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground';
const FAQ_KEYS = ['responseTime', 'quoteProcess', 'support', 'clients'] as const;

type Channel = {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  href: string;
  external?: boolean;
  icon: 'out' | 'in' | 'down';
};

/**
 * /contatti — server component. Beside the H1, every way to reach the studio
 * (email, WhatsApp with a message already written, phone, a call, the
 * studio), and the form; then the map and the FAQ. The form and the map
 * embed are the only client code.
 */
export default async function ContattiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const t = await getTranslations({ locale: lang, namespace: 'contactPage' });

  const channels: Channel[] = [
    {
      label: t('v2.channels.email'),
      value: CONTACT.email,
      note: t('v2.emailNote'),
      href: `mailto:${CONTACT.email}`,
      icon: 'out',
    },
    {
      label: t('v2.channels.whatsapp'),
      value: (
        <span className="inline-flex items-center gap-2">
          <WhatsAppIcon className="h-[18px] w-[18px] text-[#25D366]" />
          {t('v2.whatsappCta')}
        </span>
      ),
      note: (
        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
          {t('v2.whatsappNote')}
        </span>
      ),
      href: whatsappUrl(t('v2.whatsappGreeting')),
      external: true,
      icon: 'out',
    },
    {
      label: t('v2.channels.phone'),
      value: CONTACT.phoneDisplay,
      note: t('v2.hours'),
      href: `tel:${CONTACT.phone}`,
      icon: 'out',
    },
    {
      label: t('v2.channels.call'),
      value: t('v2.bookCall'),
      note: t('v2.bookCallNote'),
      href: getLocalizedPath('/call-booking', lang),
      icon: 'in',
    },
    {
      label: t('v2.channels.studio'),
      value: 'Via Ludovico Ariosto 42',
      note: t('v2.studioNote'),
      href: '#dove-siamo',
      icon: 'down',
    },
  ];

  const faqs = FAQ_KEYS.map((k) => ({ question: t(`faqs.${k}.question`), answer: t(`faqs.${k}.answer`) }));

  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="min-w-0">
            <p className={`${MONO} flex items-center gap-2.5`}>
              <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('v2.available')}
            </p>
            <h1 className="mt-7 font-display text-[2.8rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl lg:text-[4.2rem]">
              {t('v2.title')}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{t('v2.lead')}</p>

            <ul className="mt-10 border-t border-border md:mt-12">
              {channels.map((ch) => {
                const Icon = ch.icon === 'out' ? ArrowUpRight : ch.icon === 'down' ? ArrowDown : ArrowRight;
                const body = (
                  <>
                    <span className={`${MONO} col-span-2 sm:col-span-1 sm:pt-1.5`}>{ch.label}</span>
                    <span className="min-w-0">
                      <span className="block break-words text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-primary">{ch.value}</span>
                      {ch.note && <span className="mt-1 block text-sm text-muted-foreground">{ch.note}</span>}
                    </span>
                    <Icon aria-hidden className="mt-1 h-5 w-5 text-muted-foreground transition-[color,transform] duration-300 group-hover:text-primary group-hover:translate-x-0.5" />
                  </>
                );
                const cls =
                  'group grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-2 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[7rem_1fr_auto]';
                return (
                  <li key={ch.label} className="border-b border-border">
                    {ch.href.startsWith('/') ? (
                      <Link href={ch.href} className={cls}>{body}</Link>
                    ) : (
                      <a href={ch.href} className={cls} {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {body}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="min-w-0">
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] sm:p-9 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-24 pb-24 md:space-y-32 md:pb-32">
        <section id="dove-siamo" className="container mx-auto scroll-mt-28 px-5 md:px-8">
          <header className="grid gap-5 md:grid-cols-12 md:items-end">
            <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:col-span-7 md:text-[3rem]">
              <RevealWords text={t('v2.mapTitle')} />
            </h2>
            <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5">{t('map.subtitle')}</p>
          </header>

          <div className="mt-12 grid gap-3 rounded-3xl bg-muted/50 p-3 ring-1 ring-border md:mt-16 lg:grid-cols-3">
            <div className="flex flex-col justify-between gap-8 p-5 md:p-6">
              <div>
                <p className={MONO}>{t('map.addressLabel')}</p>
                <address className="mt-3 font-display text-2xl font-bold not-italic leading-snug tracking-[-0.01em]">
                  Studio Faraj
                  <br />
                  Via Ludovico Ariosto 42
                  <br />
                  35128 Padova (PD)
                </address>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 sm:flex-1 lg:flex-none"
                >
                  <Navigation className="h-4 w-4" />
                  {t('map.directions')}
                </a>
                <a
                  href={OPEN_IN_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-background px-6 text-[15px] font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted sm:flex-1 lg:flex-none"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('map.openInMaps')}
                </a>
              </div>
            </div>
            <div className="relative h-[320px] overflow-clip rounded-2xl bg-background ring-1 ring-border sm:h-[380px] lg:col-span-2 lg:h-[440px]">
              <ContattiMap />
            </div>
          </div>
        </section>

        <FaqSection title={t('v2.faqTitle')} faqs={faqs} id="faq-contatti" />
      </div>
    </div>
  );
}
