import type { ReactNode } from 'react';
import { HubGuard } from '@/components/hub/hub-guard';
import { HubHeader } from '@/components/hub/hub-header';

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
        <HubHeader />
        {children}
      </div>
    </HubGuard>
  );
}
