'use client';

import { useEffect, useState } from 'react';
import { locales, type Locale } from '@/i18n/config';
import { preloadAllMessages, loadMessages, type Messages } from '@/lib/client-messages';

/**
 * Hook to preload all locale messages in the background
 * This ensures smooth language switching by having messages ready before they're needed
 */
export function usePreloadMessages() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadError, setPreloadError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function preload() {
      try {
        // Preload all messages in the background
        await preloadAllMessages(locales);
        
        if (isMounted) {
          setIsPreloading(false);
        }
      } catch (error) {
        if (isMounted) {
          setPreloadError(error as Error);
          setIsPreloading(false);
        }
      }
    }

    // Start preloading immediately
    preload();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isPreloading, preloadError };
}

/**
 * Hook to load messages for a specific locale
 * Returns loading state and messages
 */
export function useMessages(locale: Locale) {
  const [messages, setMessages] = useState<Messages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedMessages = await loadMessages(locale);
        
        if (isMounted) {
          setMessages(loadedMessages);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { messages, isLoading, error };
}
