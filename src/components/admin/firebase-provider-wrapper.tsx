'use client';

// FirebaseClientProvider is already a 'use client' component, so a dynamic()
// wrapper with { ssr: false } is redundant and causes a blank-screen flash while
// the async import resolves. Import it directly instead.
import { FirebaseClientProvider } from '@/firebase/client-provider';
import type { ReactNode } from 'react';

interface FirebaseProviderWrapperProps {
  children: ReactNode;
}

export function FirebaseProviderWrapper({ children }: FirebaseProviderWrapperProps) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
