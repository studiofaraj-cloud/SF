import 'server-only';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export const ADMIN_RECIPIENTS = [
  { email: 'info@studiofaraj.it' },
  { email: 'studiofarajhussein@gmail.com' },
];

export interface BrevoAddress {
  email: string;
  name?: string;
}

export interface BrevoSendInput {
  sender: BrevoAddress;
  to: BrevoAddress[];
  subject: string;
  htmlContent: string;
  replyTo?: BrevoAddress;
}

export function getSender(): BrevoAddress {
  const raw = process.env.EMAIL_FROM || 'Studio Faraj <info@studiofaraj.it>';
  // Parse "Name <email@domain>" or fallback to plain email
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1] || undefined, email: match[2] };
  }
  return { email: raw.trim() };
}

export const REPLY_TO_CLIENT: BrevoAddress = { email: 'info@studiofaraj.it', name: 'Studio Faraj' };

export async function brevoSend(payload: BrevoSendInput): Promise<{ messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not configured, skipping email');
    return { error: 'no-api-key' };
  }
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[email] Brevo HTTP ${res.status}: ${text}`);
      return { error: `http-${res.status}` };
    }
    const data = (await res.json()) as { messageId?: string };
    return { messageId: data.messageId };
  } catch (err) {
    console.error('[email] Brevo request failed:', err);
    return { error: 'request-failed' };
  }
}
