'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Reviewer photo from Google, falling back to coloured initials when there is
 * no photo or it fails to load. The only client code in the reviews section.
 */
export function ReviewAvatar({ name, photo }: { name: string; photo?: string }) {
  const [failed, setFailed] = useState(false);

  const words = name.trim().split(/\s+/);
  const initials = (
    words.length >= 2 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? '?')
  ).toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 17) % 360;

  if (photo && !failed) {
    return (
      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={photo}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ background: `hsl(${hue},45%,42%)` }}
    >
      {initials}
    </span>
  );
}
