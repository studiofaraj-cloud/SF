'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';

/**
 * Client-side guard for the client hub. Requires any authenticated user
 * (clients and admins both allowed). Server-side enforcement also runs in
 * middleware.ts — this is the in-app UX layer.
 */
export function HubGuard({
  children,
  loginPath,
}: {
  children: React.ReactNode;
  loginPath: string;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || isUserLoading) return;
    if (!user) router.replace(loginPath);
  }, [mounted, user, isUserLoading, loginPath, router]);

  if (!mounted || isUserLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
