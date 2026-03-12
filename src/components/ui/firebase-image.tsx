'use client';

import Image, { type ImageProps } from 'next/image';

/**
 * Checks whether a URL points to Firebase Storage.
 * Firebase SDK v11+ may return URLs on any of these hosts:
 *   - firebasestorage.googleapis.com
 *   - storage.googleapis.com
 *   - <bucket>.firebasestorage.app
 */
function isFirebaseStorageUrl(src: string | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  return (
    src.includes('firebasestorage.googleapis.com') ||
    src.includes('storage.googleapis.com') ||
    src.includes('.firebasestorage.app')
  );
}

/**
 * Drop-in replacement for next/image that automatically bypasses
 * Next.js image optimisation for Firebase Storage URLs.
 *
 * Why?
 *   Next.js proxies remote images through `/_next/image` on the server.
 *   On many hosting platforms (Vercel Serverless, Netlify, self-hosted)
 *   the proxy can fail intermittently when fetching from Firebase Storage
 *   due to cold-start timeouts, DNS issues, or response-size limits.
 *
 *   By setting `unoptimized` for Firebase URLs the browser fetches
 *   directly from Firebase's own CDN, which is fast and reliable.
 *   For all other images (local files, placeholder services, etc.)
 *   normal Next.js optimisation is preserved.
 */
export function FirebaseImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : undefined;
  const shouldSkipOptimisation = isFirebaseStorageUrl(src);

  return (
    <Image
      {...props}
      unoptimized={shouldSkipOptimisation || props.unoptimized}
    />
  );
}

export default FirebaseImage;
