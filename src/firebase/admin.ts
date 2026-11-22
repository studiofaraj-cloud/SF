import 'server-only';

import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from '@/firebase/config';

/**
 * The server's own access to Firestore and Storage, through the Admin SDK.
 *
 * It bypasses the security rules, which is why the rules can deny anonymous
 * visitors everything: the public site reads its data here, on the server,
 * never from the browser. Credentials come from the environment (Application
 * Default Credentials): on App Hosting that is the backend's own service
 * account, so there is no key to store. Locally it is either the Firebase
 * emulators (FIRESTORE_EMULATOR_HOST / FIREBASE_STORAGE_EMULATOR_HOST set) or
 * `gcloud auth application-default login` with an account on the project.
 */
let app: App | undefined;

function adminApp(): App {
  if (app) return app;
  app =
    getApps()[0] ??
    initializeApp({
      // GCLOUD_PROJECT lets the emulators run under a demo project id.
      projectId: process.env.GCLOUD_PROJECT || firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  return app;
}

// Route handlers and pages can be separate bundles, each with its own copy of
// this module, while the Admin SDK hands them all the same Firestore instance:
// keep it on globalThis so its settings are applied exactly once.
const shared = globalThis as typeof globalThis & { __studioFarajAdminDb?: Firestore };

export function adminDb(): Firestore {
  if (shared.__studioFarajAdminDb) return shared.__studioFarajAdminDb;
  const firestore = getFirestore(adminApp());
  try {
    // Same behaviour as the web SDK the server used before: fields set to
    // undefined are dropped instead of failing the write.
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Another bundle already applied the same settings.
  }
  shared.__studioFarajAdminDb = firestore;
  return firestore;
}

export function adminBucket() {
  return getStorage(adminApp()).bucket();
}
