import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Mail } from 'lucide-react';
import { ClientMessages } from '@/components/i18n/client-messages';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { BookingForm } from '@/components/site/booking-form';
import { WhatsAppIcon } from '@/components/site/whatsapp-icon';
import { CONTACT, whatsappUrl } from '@/lib/contact-info';
import { generateMetadata as buildSEOMetadata, generateStructuredDataPageBreadcrumb, siteConfig } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: string }> };

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground';
const STEPS = ['pick', 'confirm', 'talk'] as const;

const SEO = {
  it: {
    title: 'Prenota una Chiamata con Studio Faraj',
    description:
      'Scegli giorno e fascia oraria: ti richiamiamo per confermare. La prima consulenza è gratuita. Studio Faraj, agenzia web a Padova.',
  },
  en: {
    title: 'Book a Call with Studio Faraj',
    description:
      'Pick a day and a time slot: we get back to you to confirm. The first consultation is free. Studio Faraj, web agency in Padova, Italy.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  return buildSEOMetadata({
    ...SEO[lang],
    url: `${siteConfig.url}/${lang}/call-booking`,
    locale: lang,
    alternateUrls: { it: `${siteConfig.url}/it/call-booking`, en: `${siteConfig.url}/en/call-booking` },
  });
}

/**
 * /call-booking — server component. What happens after booking and the
 * other ways to reach the studio beside the H1, the booking form next to it.
 * The form is the only client code.
 */
export default async function CallBookingPage({ params }: Props) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const t = await getTranslations({ locale: lang, namespace: 'bookingDialog.v2' });

  return (
    <>
      <StructuredDataServer
        data={generateStructuredDataPageBreadcrumb(lang, { name: t('dialogTitle'), path: '/call-booking' })}
        id="call-booking-breadcrumb"
      />
      <div className="bg-background text-foreground">
        <section className="container mx-auto px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="min-w-0">
              <p className={`${MONO} flex items-center gap-2.5`}>
                <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
                {t('eyebrow')}
              </p>
              <h1 className="mt-7 font-display text-[2.8rem] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-6xl lg:text-[4.2rem]">
                {t('title')}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{t('lead')}</p>

              <ol className="mt-10 border-t border-border md:mt-12">
                {STEPS.map((s, i) => (
                  <li key={s} className="grid grid-cols-[2.75rem_1fr] border-b border-border py-5">
                    <span className="pt-1 font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block text-lg font-semibold tracking-[-0.01em]">{t(`steps.${s}.title`)}</span>
                      <span className="mt-1 block leading-relaxed text-muted-foreground">{t(`steps.${s}.text`)}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <p className={MONO}>{t('prefer')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={whatsappUrl(t('whatsappGreeting'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset ring-border transition-colors hover:bg-muted"
                  >
                    <WhatsAppIcon />
                    {t('whatsapp')}
                    <ArrowUpRight aria-hidden className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset ring-border transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    {CONTACT.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] sm:p-9 lg:p-10">
                {/* Server-rendered page; the form needs these in the browser. */}
                <ClientMessages locale={lang} namespaces={['bookingDialog', 'quoteDialog']}>
                  <BookingForm source="call-booking-page" />
                </ClientMessages>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
