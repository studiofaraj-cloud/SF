import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v4: requestLocale is a Promise — await it to get the string value
  let locale = await requestLocale;

  // Ensure the incoming locale is valid; fall back to default if not
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // Load messages for the resolved locale
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/${defaultLocale}.json`)).default;
    locale = defaultLocale;
  }

  return { locale, messages };
});
