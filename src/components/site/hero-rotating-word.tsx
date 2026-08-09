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
 * No reserved width. Two earlier attempts tried to stop the sentence reflowing
 * when the word length changes — first an `inline-grid` overlay with an
 * invisible sizer, then a min-width sized to the longest word. Both reserved
 * space for "convertono", so every shorter word left a visible hole before the
 * following period.
 *
 * The caller instead places this at the END of its line, so there is nothing to
 * its right to be pushed around and no reservation is needed: the period sits
 * flush against the word at every length.
 *
 * `display: inline-block` is set inline rather than via a class because
 * `animate-word-rise` transforms the element, which an inline box ignores — and
 * because three Tailwind classes in this component were previously missing from
 * the generated CSS. An inline style cannot be affected by a content scan.
 */
export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span
      key={words[index]}
      className="animate-word-rise font-semibold text-primary"
      // Size and layout are inline, not Tailwind classes. Three separate class
      // names in this one component (inline-grid, text-2xl, leading-none) never
      // made it into the generated CSS on a long-running dev server, each time
      // silently changing how it rendered. Inline styles cannot be affected by
      // a content scan, and this element only needs three properties.
      // 1.4em against the lead's 18px ≈ 25px, so the word reads as a deliberate
      // accent; lineHeight 1 stops the taller glyphs pushing the next line down.
      style={{ display: 'inline-block', fontSize: '1.4em', lineHeight: 1 }}
    >
      {words[index]}
    </span>
  );
}
