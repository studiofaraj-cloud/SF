import { getClientCopy, Locale, Scenario } from '../copy';
import { renderBaseLayout, SITE_URL, escapeHtml } from './base-layout';

interface ClientThankYouInput {
  scenario: Scenario;
  locale: Locale;
  recipientName?: string;
}

export function renderClientThankYou({
  scenario,
  locale,
  recipientName,
}: ClientThankYouInput): { subject: string; html: string } {
  const copy = getClientCopy(scenario, locale);
  const greeting = recipientName
    ? locale === 'en'
      ? `Hi ${escapeHtml(recipientName)},`
      : `Ciao ${escapeHtml(recipientName)},`
    : locale === 'en'
      ? 'Hi there,'
      : 'Ciao,';

  const bodyHtml = `
    <h1 style="margin:16px 0 8px 0; font-size:24px; line-height:1.3; font-weight:700; color:#0f172a;">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 12px 0; color:#475569;">${greeting}</p>
    <p style="margin:0 0 16px 0;">${copy.intro}</p>
    <p style="margin:0 0 16px 0;">${copy.body}</p>
    <p style="margin:20px 0 0 0; color:#475569;">${copy.signOff}</p>
  `;

  const ctaUrl = scenario === 'newsletter' ? `${SITE_URL}/${locale}/blog` : `${SITE_URL}/${locale}`;

  return {
    subject: copy.subject,
    html: renderBaseLayout({
      title: copy.subject,
      previewText: copy.intro,
      bodyHtml,
      ctaLabel: copy.ctaLabel,
      ctaUrl,
      showUnsubscribe: scenario === 'newsletter',
      locale,
    }),
  };
}
