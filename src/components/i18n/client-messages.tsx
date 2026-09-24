import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { GLOBAL_CLIENT_NAMESPACES, pickMessages } from '@/i18n/client-messages';

/**
 * Sends a route's translation namespaces to its client components.
 *
 * Nested providers replace the parent's messages rather than merging with
 * them, so the site-wide namespaces are included again here.
 */
export async function ClientMessages({
  locale,
  namespaces,
  children,
}: {
  locale: string;
  namespaces: string[];
  children: ReactNode;
}) {
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={pickMessages(messages, [...GLOBAL_CLIENT_NAMESPACES, ...namespaces])}
    >
      {children}
    </NextIntlClientProvider>
  );
}
