'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    try {
      // Initialize Firebase on the client side, once per component mount.
      return initializeFirebase();
    } catch (error) {
      // Log error but don't crash the app
      console.error('[FirebaseClientProvider] Failed to initialize Firebase:', error);
      // Return null services - the FirebaseProvider will handle this gracefully
      return {
        firebaseApp: null,
        auth: null,
        firestore: null,
      } as any;
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // If Firebase failed to initialize, render children without Firebase provider
  // This allows the app to continue working even if Firebase is unavailable
  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    console.warn('[FirebaseClientProvider] Firebase services not available. Rendering without Firebase provider.');
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}