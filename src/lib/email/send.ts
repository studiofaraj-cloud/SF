import 'server-only';
import { ADMIN_RECIPIENTS, REPLY_TO_CLIENT, brevoSend, getSender } from './brevo-client';
import { renderClientThankYou } from './templates/client-thank-you';
import { renderAdminNotification } from './templates/admin-notification';
import type { Locale, Scenario } from './copy';

interface NotifyInput {
  scenario: Scenario;
  locale?: Locale;
  client: {
    name?: string;
    email?: string;
  };
  adminFields: Array<{ label: string; value?: string | null }>;
}

export async function sendTransactionalEmails({
  scenario,
  locale = 'it',
  client,
  adminFields,
}: NotifyInput): Promise<void> {
  const sender = getSender();

  const admin = renderAdminNotification({
    scenario,
    fields: adminFields,
    submitterName: client.name,
    submitterEmail: client.email,
  });

  const adminPromise = brevoSend({
    sender,
    to: ADMIN_RECIPIENTS,
    subject: admin.subject,
    htmlContent: admin.html,
    replyTo: client.email ? { email: client.email, name: client.name } : undefined,
  });

  let clientPromise: Promise<unknown> = Promise.resolve();
  if (client.email) {
    const thanks = renderClientThankYou({
      scenario,
      locale,
      recipientName: client.name,
    });
    clientPromise = brevoSend({
      sender,
      to: [{ email: client.email, name: client.name }],
      subject: thanks.subject,
      htmlContent: thanks.html,
      replyTo: REPLY_TO_CLIENT,
    });
  }

  await Promise.allSettled([adminPromise, clientPromise]);
}

export function normalizeLocale(input: unknown): Locale {
  return input === 'en' ? 'en' : 'it';
}
