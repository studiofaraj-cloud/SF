
import "server-only";

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This function is for SERVER-SIDE use only.
export function initializeServerSideFirebase() {
  // If already initialized, return SDKs for the existing app
  const existingApps = getApps();
  if (existingApps.length > 0) {
    // Prefer an app that has a valid projectId (avoid returning an empty auto-init app)
    const validApp = existingApps.find(app => app.options.projectId) ?? existingApps[0];
    return getSdks(validApp);
  }

  let firebaseApp: FirebaseApp;

  // Firebase App Hosting sets FIREBASE_CONFIG automatically — only use auto-init there.
  // In classic Firebase Hosting, local dev, and CI, always use the explicit config.
  if (process.env.FIREBASE_CONFIG) {
    try {
      firebaseApp = initializeApp();
      // Guard: auto-init can succeed but produce an empty config outside App Hosting
      if (!firebaseApp.options.projectId) {
        throw new Error('Auto-init produced empty Firebase config');
      }
    } catch {
      // Auto-init failed or produced empty config — fall back to explicit config
      const apps = getApps();
      firebaseApp = apps.length > 0
        ? (apps.find(app => app.options.projectId) ?? apps[0])
        : initializeApp(firebaseConfig);
    }
  } else {
    // No FIREBASE_CONFIG env var — use hardcoded client config directly
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

// Helper to get the SDKs
function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}
