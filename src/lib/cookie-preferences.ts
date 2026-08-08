import { CookiePreferences } from '@/components/site/cookie-consent';

const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
const COOKIE_CONSENT_KEY = 'cookie_consent';

/**
 * Dispatched on `window` by the cookie banner whenever preferences are saved.
 *
 * Lives here rather than next to the banner or the GA component so both can
 * import it without a cycle: the banner owns the CookiePreferences type that
 * this module already imports.
 *
 * Needed because localStorage writes do not fire a `storage` event in the tab
 * that made them, so consent-gated scripts would stay dormant until the next
 * page load.
 */
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed';

export const defaultCookiePreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return defaultCookiePreferences;
  }

  try {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultCookiePreferences, ...parsed, essential: true };
    }
  } catch (e) {
    console.error('Error reading cookie preferences:', e);
  }

  return defaultCookiePreferences;
}

export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent === 'accepted' || consent === 'custom';
}

export function canUseAnalytics(): boolean {
  const preferences = getCookiePreferences();
  return preferences.analytics;
}

export function canUseMarketing(): boolean {
  const preferences = getCookiePreferences();
  return preferences.marketing;
}

export function canUseFunctional(): boolean {
  const preferences = getCookiePreferences();
  return preferences.functional;
}
