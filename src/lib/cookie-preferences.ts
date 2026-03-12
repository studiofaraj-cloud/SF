import { CookiePreferences } from '@/components/site/cookie-consent';

const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
const COOKIE_CONSENT_KEY = 'cookie_consent';

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
