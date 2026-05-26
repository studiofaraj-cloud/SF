'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useRole } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/definitions';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Role required to view the guarded content. Defaults to 'admin'. */
  requiredRole?: UserRole;
  /** Where to send unauthenticated users. Defaults to '/admin/login'. */
  loginPath?: string;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function AuthGuard({
  children,
  requiredRole = 'admin',
  loginPath = '/admin/login',
}: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useRole();
  const router = useRouter();
  // Don't make any auth decisions until after the first client render
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isUserLoading) return;
    // No user after Firebase resolved → send to login
    if (!user) {
      router.replace(loginPath);
      return;
    }
    // User exists but role not yet resolved → wait
    if (isRoleLoading) return;
    // Wrong role → redirect: clients hitting admin go to their hub; everyone
    // else to the appropriate login.
    if (role !== requiredRole) {
      if (role === 'client' && requiredRole === 'admin') {
        router.replace('/hub');
      } else {
        router.replace(loginPath);
      }
    }
  }, [mounted, user, isUserLoading, role, isRoleLoading, requiredRole, loginPath, router]);

  // Still resolving auth/role → spinner
  if (!mounted || isUserLoading || (user && isRoleLoading)) return <Spinner />;
  // No user, or role mismatch → spinner while redirect fires
  if (!user || role !== requiredRole) return <Spinner />;

  return <>{children}</>;
}
