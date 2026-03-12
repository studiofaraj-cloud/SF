import { locales, defaultLocale, type Locale } from '@/i18n/config';

/**
 * Get localized path by prepending locale to the path.
 * With 'always' localePrefix, we ALWAYS add the prefix.
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash if present
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Remove existing locale prefix if present
  for (const loc of locales) {
    if (cleanPath.startsWith(`${loc}/`)) {
      cleanPath = cleanPath.slice(loc.length + 1);
      break;
    } else if (cleanPath === loc) {
      cleanPath = '';
      break;
    }
  }

  // Always prepend locale
  const finalPath = `/${locale}${cleanPath ? `/${cleanPath}` : ''}`;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[getLocalizedPath] Input path:', path, 'Locale:', locale, '-> Output:', finalPath);
  }
  
  return finalPath;
}

/**
 * Extract locale from pathname
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return defaultLocale;
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    const pathWithoutLocale = '/' + segments.slice(1).join('/');
    return pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
  }
  
  return pathname;
}
