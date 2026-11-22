import 'server-only';

import { ADMIN_RECIPIENTS, REPLY_TO_CLIENT, brevoSend, getSender } from './brevo-client';
import { renderAdminNotification } from './templates/admin-notification';
import { renderBaseLayout, escapeHtml } from './templates/base-layout';

const SITE_URL = process.env.EMAIL_SITE_URL || 'https://studiofaraj.it';

const COPY = {
  it: {
    subject: 'Conferma l’iscrizione alla newsletter di Studio Faraj',
    preview: 'Un clic per confermare: senza conferma non ti iscriviamo.',
    heading: 'Conferma la tua iscrizione',
    intro: 'Qualcuno, probabilmente tu, ha chiesto di ricevere la newsletter di Studio Faraj a questo indirizzo.',
    body: 'Per iscriverti conferma con il pulsante qui sotto. Il link vale 7 giorni.',
    ignore: 'Se non sei stato tu, ignora questa email: senza conferma non ti iscriviamo e non ti scriveremo più.',
    cta: 'Conferma l’iscrizione',
    signOff: 'A presto,<br/>Studio Faraj',
  },
  en: {
    subject: 'Confirm your Studio Faraj newsletter subscription',
    preview: 'One click to confirm: without it, you won’t be subscribed.',
    heading: 'Confirm your subscription',
    intro: 'Someone, probably you, asked to receive the Studio Faraj newsletter at this address.',
    body: 'To subscribe, confirm with the button below. The link works for 7 days.',
    ignore: 'If this wasn’t you, ignore this email: without confirmation you won’t be subscribed and we won’t write again.',
    cta: 'Confirm subscription',
    signOff: 'See you soon,<br/>Studio Faraj',
  },
} as const;

/** The double opt-in email. No unsubscribe link: nobody is subscribed yet. */
export async function sendConfirmationEmail(input: { email: string; locale: 'it' | 'en'; confirmToken: string }) {
  const c = COPY[input.locale];
  const url = `${SITE_URL}/${input.locale}/newsletter/conferma?t=${encodeURIComponent(input.confirmToken)}`;
  const bodyHtml = `
    <h1 style="margin:16px 0 8px 0; font-size:24px; line-height:1.3; font-weight:700; color:#0f172a;">${escapeHtml(c.heading)}</h1>
    <p style="margin:0 0 12px 0;">${escapeHtml(c.intro)}</p>
    <p style="margin:0 0 16px 0;">${escapeHtml(c.body)}</p>
  `;
  const footer = `
    <p style="margin:0 0 12px 0; color:#64748b; font-size:13px;">${escapeHtml(c.ignore)}</p>
    <p style="margin:12px 0 0 0; color:#475569;">${c.signOff}</p>
  `;
  return brevoSend({
    sender: getSender(),
    to: [{ email: input.email }],
    subject: c.subject,
    htmlContent: renderBaseLayout({
      title: c.subject,
      previewText: c.preview,
      bodyHtml: bodyHtml,
      ctaLabel: c.cta,
      ctaUrl: url,
      afterCtaHtml: footer,
      locale: input.locale,
    }),
    replyTo: REPLY_TO_CLIENT,
  });
}

/** Tells the studio about a confirmed subscriber (not about every request). */
export async function sendNewSubscriberAlert(email: string) {
  const admin = renderAdminNotification({
    scenario: 'newsletter',
    fields: [
      { label: 'Email', value: email },
      { label: 'Tipo', value: 'Iscrizione newsletter confermata' },
    ],
    submitterEmail: email,
  });
  return brevoSend({ sender: getSender(), to: ADMIN_RECIPIENTS, subject: admin.subject, htmlContent: admin.html });
}
