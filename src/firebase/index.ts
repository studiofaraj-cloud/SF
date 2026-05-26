'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// App Check (anti-bot/abuse) — only activates in the browser when a reCAPTCHA
// site key is configured. Until then it's a no-op, so dev/local is unaffected.
let appCheckStarted = false;
function setupAppCheck(app: FirebaseApp) {
  if (typeof window === 'undefined' || appCheckStarted) return;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckStarted = true;
  } catch (err) {
    console.warn('[AppCheck] initialization skipped:', err);
  }
}

export function initializeFirebase() {
  if (!getApps().length) {
    // This app runs on standard Firebase Hosting (not Firebase App Hosting),
    // so we always initialise directly from the hardcoded config object.
    return getSdks(initializeApp(firebaseConfig));
  }

  // Already initialised — reuse the existing app.
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Start App Check as early as possible so it attests subsequent calls.
  setupAppCheck(firebaseApp);

  const firestore = getFirestore(firebaseApp);

  // Configure Firestore to handle offline mode gracefully
  // Firestore will automatically work in offline mode, these connection warnings are informational
  if (typeof window !== 'undefined') {
    // Suppress Firestore connection warnings - these are normal when Firestore operates in offline mode
    // We only filter specific Firestore connection errors, not all console errors
    const originalConsoleError = console.error;
    const firestoreConnectionErrorPattern = /@firebase\/firestore.*Could not reach Cloud Firestore backend/i;
    const firestoreOfflinePattern = /offline mode/i;
    
    console.error = (...args: any[]) => {
      const message = typeof args[0] === 'string' ? args[0] : String(args[0] || '');
      // Filter out Firestore connection warnings - these are informational when offline
      if (firestoreConnectionErrorPattern.test(message) || 
          (firestoreConnectionErrorPattern.test(message) && firestoreOfflinePattern.test(message))) {
        // Silently ignore offline mode connection warnings - Firestore works fine offline
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }
  
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
