import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import { NotFoundContent } from '@/components/site/not-found-content';

export default async function NotFound() {
  let locale: 'it' | 'en' = 'it';

  try {
    const fetchedLocale = await getLocale();
    locale = fetchedLocale === 'en' ? 'en' : 'it';
    setRequestLocale(locale);
  } catch {
    locale = 'it';
  }

  let t: (key: string) => string;
  try {
    t = await getTranslations('common.notFound');
  } catch {
    const fallbacks: Record<string, string> = {
      title: 'Pagina Non Trovata',
      description: 'La pagina che stai cercando non esiste o è stata spostata.',
      subtitle: 'Possiamo aiutarti?',
      home: 'Torna alla Home',
      bookCall: 'Prenota una Chiamata',
    };
    t = (key: string) => fallbacks[key] || key;
  }

  return (
    <NotFoundContent
      locale={locale}
      title={t('title')}
      description={t('description')}
      subtitle={t('subtitle')}
      homeLabel={t('home')}
      bookCallLabel={t('bookCall')}
    />
  );
}
