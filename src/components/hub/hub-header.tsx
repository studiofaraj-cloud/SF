'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useRole } from '@/firebase/provider';
import { signOutAction } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, ExternalLink, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HubHeader() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { role } = useRole();
  const en = locale === 'en';

  const handleSignOut = async () => {
    await signOutAction();
    await signOut(auth);
    router.replace('/');
  };

  const switchLocale = (target: 'it' | 'en') => {
    if (target === locale) return;
    const parts = (pathname || `/${locale}/hub`).split('/');
    if (parts[1] === 'it' || parts[1] === 'en') parts[1] = target;
    else parts.splice(1, 0, target);
    // Full reload so the [locale] layout reloads the right messages.
    window.location.href = parts.join('/') || `/${target}/hub`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={`/${locale}/hub`} className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Studio Faraj" width={26} height={26} />
          <span className="text-sm font-semibold">
            Studio Faraj <span className="text-muted-foreground">· {en ? 'Client Hub' : 'Area Clienti'}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <div className="mr-1 flex items-center overflow-hidden rounded-full border border-border/60 text-[11px] font-semibold">
            {(['it', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLocale(l)}
                aria-label={l === 'it' ? 'Italiano' : 'English'}
                className={cn(
                  'px-2 py-1 uppercase transition-colors',
                  locale === l
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">{en ? 'Website' : 'Sito'}</span>
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link href={`/${locale}/hub/profile`}>
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">{en ? 'Profile' : 'Profilo'}</span>
            </Link>
          </Button>
          {role === 'admin' && (
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/admin">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{en ? 'Sign out' : 'Esci'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
