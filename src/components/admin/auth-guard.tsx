'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  // Don't make any auth decisions until after the first client render
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Wait until mounted and Firebase has resolved
    if (!mounted || isUserLoading) return;
    // No user after Firebase resolved → redirect to login
    if (!user) {
      router.replace('/admin/login');
    }
  }, [mounted, user, isUserLoading, router]);

  // Not yet mounted or Firebase still loading → spinner
  if (!mounted || isUserLoading) return <Spinner />;

  // Firebase resolved but no user → spinner while redirect fires
  if (!user) return <Spinner />;

  return <>{children}</>;
}
