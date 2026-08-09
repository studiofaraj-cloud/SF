'use client';

import { useEffect, useState } from 'react';

/**
 * The one animated word in the hero subhead.
 *
 * Deliberately NOT in the <h1>. The previous hero cycled a word inside the
 * heading itself, which made the page's strongest on-page signal
 * non-deterministic — whatever Google happened to render was one of four
 * variants. (Same defect we reported on gscostruzioni.ch.) The <h1> is now
 * static and keyword-bearing; the personality lives here, where rotation costs
 * nothing.
 *
 * Renders `words[0]` on the server so the sentence is complete in the HTML and
 * reads correctly with JS disabled; cycling starts after hydration. Reserves
 * width from the longest word so the line never reflows — a rotating word with
 * no width floor is a reliable source of layout shift.
 */
export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [words.length]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className="relative inline-grid align-bottom">
      {/* Invisible sizer: holds the widest word so the line width is stable. */}
      <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
        {longest}
      </span>
      <span
        key={words[index]}
        className="col-start-1 row-start-1 animate-word-rise font-semibold text-primary"
      >
        {words[index]}
      </span>
    </span>
  );
}
