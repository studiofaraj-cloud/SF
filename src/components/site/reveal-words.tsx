import { Fragment, type CSSProperties } from 'react';

/**
 * Splits a title into words for the scroll reveal (globals.css, .rv-title):
 * each word sits in its own slot and rises out of it. The words stay plain
 * text separated by real spaces, so the heading reads and indexes exactly as
 * before; without animation support the spans have no effect. `offset`
 * continues the stagger across a line break.
 */
export function RevealWords({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="rw">
            <span className="rw-i" style={{ '--i': offset + i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
