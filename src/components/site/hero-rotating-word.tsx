'use client';

import { useEffect, useState } from 'react';

/**
 * The one animated word in the hero subhead.
 *
 * Deliberately NOT in the <h1>. The previous hero cycled a word inside the
 * heading itself, which made the page's strongest on-page signal
 * non-deterministic — whatever Google happened to render was one of four
 * variants. The <h1> is now static and keyword-bearing; the personality lives
 * here, where rotation costs nothing.
 *
 * Renders `words[0]` on the server so the sentence is complete in the HTML and
 * reads correctly with JS disabled.
 *
 * Layout is done with INLINE STYLES on purpose. The first version used an
 * `inline-grid` wrapper with an invisible sizer stacked underneath; `inline-grid`
 * is used nowhere else in this project, so Tailwind never generated the rule and
 * the wrapper fell back to `display: inline` — which put the invisible sizer
 * *beside* the visible word and opened a large gap mid-sentence. A min-width in
 * `ch` damps the reflow when the word length changes without depending on any
 * generated class.
 */
export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span
      key={words[index]}
      className="animate-word-rise font-semibold text-primary"
      style={{
        display: 'inline-block',
        minWidth: `${(longest.length * 0.56).toFixed(2)}em`,
        textAlign: 'left',
      }}
    >
      {words[index]}
    </span>
  );
}
