'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, defaultLocale, type Locale } from '@/i18n/config';
import { getLocalizedPath, removeLocaleFromPath, getLocaleFromPath } from '@/lib/i18n-helpers';
import { useMemo, useState, useTransition } from 'react';
import { loadMessages } from '@/lib/client-messages';
import { Loader2 } from 'lucide-react';

const flagPaths: Record<Locale, string> = {
  it: '/assets/flag-it.svg',
  en: '/assets/flag-en.svg',
};

// Flag component using regular img tag for SVGs (better for production)
function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <img
      src={flagPaths[locale]}
      alt={localeNames[locale]}
      className={className}
      width={20}
      height={20}
      loading="eager"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [switchingTo, setSwitchingTo] = useState<Locale | null>(null);
  
  // Use pathname extraction instead of useLocale hook to avoid Turbopack HMR issues
  // This is more reliable and doesn't depend on module factory availability
  const currentLocale = useMemo(() => {
    const detected = getLocaleFromPath(pathname);
    // Debug: Log locale detection (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[LanguageSwitcher] Pathname:', pathname, '-> Detected locale:', detected);
    }
    return detected;
  }, [pathname]);

  const switchLocale = async (newLocale: Locale) => {
    // Don't switch if already on the same locale
    if (newLocale === currentLocale) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LanguageSwitcher] Already on locale:', newLocale);
      }
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LanguageSwitcher] ====== Language Switch Start ======');
      console.log('[LanguageSwitcher] Switching from', currentLocale, 'to', newLocale);
      console.log('[LanguageSwitcher] Current pathname:', pathname);
    }
    
    // Set switching state for visual feedback
    setSwitchingTo(newLocale);
    
    try {
      // Preload messages for the target locale before navigation
      // This ensures smooth transition without waiting for server
      if (process.env.NODE_ENV === 'development') {
        console.log('[LanguageSwitcher] Preloading messages for locale:', newLocale);
      }
      await loadMessages(newLocale);
      
      // Remove current locale from pathname
      const pathWithoutLocale = removeLocaleFromPath(pathname);
      if (process.env.NODE_ENV === 'development') {
        console.log('[LanguageSwitcher] Path without locale:', pathWithoutLocale);
      }
      
      // Navigate to new locale path
      const newPath = getLocalizedPath(pathWithoutLocale, newLocale);
      if (process.env.NODE_ENV === 'development') {
        console.log('[LanguageSwitcher] Constructed new path:', newPath);
        console.log('[LanguageSwitcher] Navigating to:', newPath);
        console.log('[LanguageSwitcher] ====== Language Switch End ======');
      }
      
      // Use full page navigation to ensure server-side locale and messages are properly loaded
      // This is necessary because next-intl needs to reload messages from the server
      // router.push/replace doesn't always trigger a full server render with new locale
      window.location.href = newPath;
    } catch (error) {
      console.error('[LanguageSwitcher] Failed to switch locale:', error);
      // Fallback to full page reload if message loading fails
      const pathWithoutLocale = removeLocaleFromPath(pathname);
      const newPath = getLocalizedPath(pathWithoutLocale, newLocale);
      if (process.env.NODE_ENV === 'development') {
        console.log('[LanguageSwitcher] Fallback navigation to:', newPath);
      }
      window.location.href = newPath;
      setSwitchingTo(null);
    }
  };

  const isLoading = isPending || switchingTo !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 relative transition-opacity duration-200"
          aria-label="Switch language"
          suppressHydrationWarning
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-primary" />
          ) : (
            <FlagIcon 
              locale={currentLocale} 
              className="w-5 h-5 md:w-6 md:h-6 transition-opacity duration-200" 
            />
          )}
          <span className="sr-only">{localeNames[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        sideOffset={8}
        className="min-w-[140px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {locales.map((loc) => {
          const isSwitching = switchingTo === loc;
          const isCurrent = currentLocale === loc;
          
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`transition-all duration-200 ${
                isCurrent ? 'bg-accent' : ''
              } ${isSwitching ? 'opacity-50 cursor-wait' : ''}`}
              disabled={isSwitching || isLoading}
            >
              <div className="flex items-center gap-2 w-full">
                {isSwitching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <FlagIcon locale={loc} className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1">{localeNames[loc]}</span>
                {isCurrent && !isSwitching && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
