import { getAdminCopy, Scenario } from '../copy';
import { renderBaseLayout, renderKeyValueTable, escapeHtml, SITE_URL } from './base-layout';

interface AdminNotificationInput {
  scenario: Scenario;
  fields: Array<{ label: string; value?: string | null }>;
  submitterName?: string;
  submitterEmail?: string;
}

export function renderAdminNotification({
  scenario,
  fields,
  submitterName,
  submitterEmail,
}: AdminNotificationInput): { subject: string; html: string } {
  const copy = getAdminCopy(scenario);
  const subject = copy.subject(submitterName);

  const bodyHtml = `
    <h1 style="margin:16px 0 8px 0; font-size:22px; line-height:1.3; font-weight:700; color:#0f172a;">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 12px 0; color:#475569;">${escapeHtml(copy.intro)}</p>
    ${renderKeyValueTable(fields)}
    ${submitterEmail
      ? `<p style="margin:16px 0 0 0; font-size:14px; color:#475569;">Rispondi direttamente a questa email per contattare <strong>${escapeHtml(submitterEmail)}</strong>.</p>`
      : ''}
  `;

  return {
    subject,
    html: renderBaseLayout({
      title: subject,
      previewText: copy.intro,
      bodyHtml,
      ctaLabel: 'Apri dashboard',
      ctaUrl: `${SITE_URL}/admin/messages`,
      locale: 'it',
    }),
  };
}
