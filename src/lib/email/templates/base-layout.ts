interface BaseLayoutInput {
  title: string;
  previewText: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showUnsubscribe?: boolean;
  locale?: 'it' | 'en';
}

const SITE_URL = process.env.EMAIL_SITE_URL || 'https://studiofaraj.it';

const LOGO_URL = `${SITE_URL}/assets/logo-mail.png`;

const BRAND = {
  bg: '#f5f5f7',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  accent: '#0f172a',
  accentText: '#ffffff',
};

export function renderBaseLayout({
  title,
  previewText,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  showUnsubscribe = false,
  locale = 'it',
}: BaseLayoutInput): string {
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td align="center" style="padding: 8px 0 24px 0;">
            <a href="${ctaUrl}"
               style="display: inline-block; background: ${BRAND.accent}; color: ${BRAND.accentText}; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 600; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
      : '';

  const unsubscribeBlock = showUnsubscribe
    ? `<br/><a href="${SITE_URL}" style="color: ${BRAND.muted}; text-decoration: underline;">${
        locale === 'en' ? 'Unsubscribe' : 'Annulla iscrizione'
      }</a>`
    : '';

  const footerCopy =
    locale === 'en'
      ? 'Studio Faraj — Padova, Italy<br/>Web design, development &amp; digital solutions.'
      : 'Studio Faraj — Padova, Italia<br/>Web design, sviluppo &amp; soluzioni digitali.';

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0; padding:0; background:${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:${BRAND.text};">
    <div style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden; mso-hide:all;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.bg}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:${BRAND.card}; border-radius:16px; overflow:hidden; box-shadow: 0 2px 12px rgba(15,23,42,0.06);">
            <tr>
              <td align="center" style="padding: 36px 32px 12px 32px;">
                <a href="${SITE_URL}" style="display:inline-block;">
                  <img src="${LOGO_URL}" alt="Studio Faraj" width="140" style="display:block; width:140px; height:auto; border:0; outline:none; text-decoration:none;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 40px 8px 40px; font-size:16px; line-height:1.6; color:${BRAND.text};">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaBlock}
            <tr>
              <td style="padding: 24px 40px 32px 40px; border-top:1px solid ${BRAND.border}; font-size:13px; line-height:1.6; color:${BRAND.muted}; text-align:center;">
                ${footerCopy}
                <br/><a href="${SITE_URL}" style="color:${BRAND.muted}; text-decoration:underline;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
                ${unsubscribeBlock}
              </td>
            </tr>
          </table>
          <div style="font-size:12px; color:${BRAND.muted}; padding: 16px 0; text-align:center;">
            &copy; ${new Date().getFullYear()} Studio Faraj
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(input: string | undefined | null): string {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderKeyValueTable(rows: Array<{ label: string; value?: string | null }>): string {
  const filtered = rows.filter((r) => r.value != null && r.value !== '');
  if (filtered.length === 0) return '';
  const trs = filtered
    .map(
      (r) => `
        <tr>
          <td style="padding:10px 12px; background:#f8fafc; border:1px solid ${BRAND.border}; font-weight:600; font-size:14px; color:${BRAND.text}; width:35%; vertical-align:top;">${escapeHtml(r.label)}</td>
          <td style="padding:10px 12px; border:1px solid ${BRAND.border}; font-size:14px; color:${BRAND.text}; vertical-align:top; white-space:pre-wrap;">${escapeHtml(r.value!)}</td>
        </tr>`
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate; border-spacing:0; margin: 12px 0 20px 0;">
      ${trs}
    </table>`;
}

export { SITE_URL };
