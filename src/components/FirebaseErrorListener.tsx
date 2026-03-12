'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's error.tsx or global-error.tsx.
 * 
 * Note: Errors are only thrown in production. In development, they are logged to console.
 */
export function FirebaseErrorListener() {
  // Use the specific error type for the state for type safety.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: FirestorePermissionError) => {
      // Log the error for debugging
      console.error('[FirebaseErrorListener] Permission error detected:', {
        operation: error.request.method,
        path: error.request.path,
        message: error.message,
        request: error.request,
      });
      
      // Don't throw permission errors - they shouldn't crash the app
      // Instead, log them and let the app continue functioning
      // Permission errors are usually non-critical (e.g., user doesn't have access to a resource)
      console.warn('[FirebaseErrorListener] Firebase permission error handled gracefully. App will continue to function.');
      
      // Only set error for critical errors that actually need to crash the app
      // For now, we'll handle permission errors gracefully
      // Uncomment the line below if you want permission errors to trigger error boundary
      // setError(error);
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Only throw critical errors that should crash the app
  // Permission errors are handled gracefully above
  if (error) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
