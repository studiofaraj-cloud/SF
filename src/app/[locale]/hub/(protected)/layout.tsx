import type { ReactNode } from 'react';
import { HubGuard } from '@/components/hub/hub-guard';
import { HubHeader } from '@/components/hub/hub-header';
import { PastDueBanner } from '@/components/hub/past-due-banner';

export default async function HubProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <HubGuard loginPath={`/${locale}/hub/login`}>
      <div className="min-h-screen bg-background">
        <PastDueBanner />
        <HubHeader />
        {children}
      </div>
    </HubGuard>
  );
}
