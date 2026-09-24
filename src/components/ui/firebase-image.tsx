'use client';

import Image, { type ImageProps } from 'next/image';

/**
 * Thin wrapper around next/image for Firebase Storage URLs.
 *
 * Firebase Storage hosts are allowed in `images.remotePatterns` (next.config.ts),
 * so these images go through the `/_next/image` optimiser and are served as
 * AVIF/WebP at the requested `sizes`. The raw uploads are often ~2MB, and
 * serving them unoptimised was the main cause of slow mobile LCP.
 *
 * Pass `unoptimized` explicitly if a specific image must bypass the optimiser.
 */
export function FirebaseImage(props: ImageProps) {
  return <Image {...props} />;
}

export default FirebaseImage;
