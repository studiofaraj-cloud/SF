import { type Locale } from '@/i18n/config';

// Type for messages (matches the structure of JSON files)
export type Messages = Record<string, any>;

// Client-side message cache
const messageCache = new Map<Locale, Messages>();

/**
 * Load messages for a specific locale from the client-side
 * Messages are cached after first load for instant subsequent access
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  // Return cached messages if available
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }

  try {
    // Dynamically import the message file
    const messages = (await import(`@/messages/${locale}.json`)).default;
    
    // Cache the messages for future use
    messageCache.set(locale, messages);
    
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Return empty object as fallback
    return {};
  }
}

/**
 * Preload messages for all locales in the background
 * This improves performance by loading messages before they're needed
 */
export async function preloadAllMessages(locales: Locale[]): Promise<void> {
  // Load all locale messages in parallel
  await Promise.all(locales.map(locale => loadMessages(locale)));
}

/**
 * Clear the message cache (useful for development/testing)
 */
export function clearMessageCache(): void {
  messageCache.clear();
}

/**
 * Check if messages for a locale are already cached
 */
export function hasCachedMessages(locale: Locale): boolean {
  return messageCache.has(locale);
}
