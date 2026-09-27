import { setRequestLocale } from 'next-intl/server';
import { ServicePage } from '@/components/site/service-page';
import { buildServiceContent, getServiceProof } from '@/lib/service-content';
import type { Locale } from '@/i18n/config';

// Refreshed hourly, like the portfolio project it shows.
export const revalidate = 3600;

export default async function HostingCloudPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const [content, proof] = await Promise.all([buildServiceContent('hosting-cloud', lang), getServiceProof('hosting-cloud')]);
  return <ServicePage content={content} proof={proof} locale={lang} />;
}
