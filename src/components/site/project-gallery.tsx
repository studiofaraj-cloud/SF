'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FirebaseImage } from '@/components/ui/firebase-image';

/** `open` is a template: {n} becomes the image number. */
type Labels = { open: string; close: string; prev: string; next: string };

/**
 * A case study's gallery: a grid of thumbnails, each opening a full-size
 * viewer (arrow keys to move, Escape to close). Radix Dialog handles focus
 * and scroll lock.
 */
export function ProjectGallery({ images, alt, labels }: { images: string[]; alt: string; labels: Labels }) {
  const [index, setIndex] = useState<number | null>(null);
  const go = (step: number) => setIndex((i) => (i === null ? i : (i + step + images.length) % images.length));

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:gap-4">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={labels.open.replace('{n}', String(i + 1))}
              className="group relative block aspect-[4/3] w-full overflow-clip rounded-2xl bg-muted ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <FirebaseImage
                src={src}
                alt={`${alt} — ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 400px, 50vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby={undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') go(-1);
              if (e.key === 'ArrowRight') go(1);
            }}
            className="fixed inset-0 z-[91] outline-none"
          >
            <Dialog.Title className="sr-only">{index !== null ? `${alt} — ${index + 1} / ${images.length}` : alt}</Dialog.Title>
            {index !== null && (
              // Explicit insets: a `fill` image has no height of its own to size a box by.
              <div className="absolute inset-x-4 inset-y-20 md:inset-x-24 md:inset-y-12">
                <FirebaseImage src={images[index]} alt={`${alt} — ${index + 1}`} fill sizes="100vw" className="object-contain" />
              </div>
            )}
            <Dialog.Close
              aria-label={labels.close}
              className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={labels.prev}
                  onClick={() => go(-1)}
                  className="fixed left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={labels.next}
                  onClick={() => go(1)}
                  className="fixed right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
