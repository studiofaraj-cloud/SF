import 'server-only';

import { ADMIN_RECIPIENTS, REPLY_TO_CLIENT, brevoSend, getSender, type BrevoAddress } from './brevo-client';
import { renderBaseLayout, escapeHtml } from './templates/base-layout';
import type { Locale } from './copy';

/**
 * Base URL for all links inside emails. Always the public custom domain —
 * never the Firebase web.app host.
 */
export const EMAIL_SITE_URL = process.env.EMAIL_SITE_URL || 'https://studiofaraj.it';

interface HubNotifyInput {
  to: BrevoAddress[];
  subject: string;
  heading: string;
  intro: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  locale?: Locale;
  replyTo?: BrevoAddress;
  /** When provided, the email opens with "Ciao {name}," / "Hi {name},". */
  greetingName?: string;
}

/**
 * Sends a single targeted notification email (e.g. a status update to a client,
 * or a "new message" alert to the other party). Unlike sendTransactionalEmails,
 * this does not fan out to both admin and client — the caller picks recipients.
 */
export async function sendHubNotification({
  to,
  subject,
  heading,
  intro,
  body,
  ctaLabel,
  ctaUrl,
  locale = 'it',
  replyTo,
  greetingName,
}: HubNotifyInput): Promise<void> {
  if (!to || to.length === 0) return;

  const greeting = greetingName
    ? `<p style="margin:0 0 12px 0; color:#475569;">${locale === 'en' ? 'Hi' : 'Ciao'} ${escapeHtml(greetingName)},</p>`
    : '';

  const bodyHtml = `
    <h1 style="margin:16px 0 8px 0; font-size:24px; line-height:1.3; font-weight:700; color:#0f172a;">${escapeHtml(heading)}</h1>
    ${greeting}
    <p style="margin:0 0 16px 0;">${escapeHtml(intro)}</p>
    ${body ? `<p style="margin:0 0 16px 0;">${escapeHtml(body)}</p>` : ''}
  `;

  await brevoSend({
    sender: getSender(),
    to,
    subject,
    htmlContent: renderBaseLayout({ title: subject, previewText: intro, bodyHtml, ctaLabel, ctaUrl, locale }),
    replyTo: replyTo ?? REPLY_TO_CLIENT,
  });
}

export { ADMIN_RECIPIENTS };
