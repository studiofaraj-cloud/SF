/**
 * The Studio Faraj mark as vector geometry (measured from the app icon, the
 * same drawing as scripts/og/mark.svg): a disc with the planet, the dot and
 * the line between them cut out. It takes the text colour. `id` names the
 * mask, so it must be unique on the page.
 */
export function BrandMark({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={className}>
      <defs>
        <mask id={id}>
          <rect width="512" height="512" fill="#fff" />
          <circle cx="114.4" cy="402.3" r="173.3" fill="#000" />
          <circle cx="345.8" cy="163.9" r="50" fill="#000" />
          <line x1="345.8" y1="163.9" x2="114.4" y2="402.3" stroke="#000" strokeWidth="25" />
          <circle cx="84.7" cy="301.7" r="33.9" fill="#fff" />
          <circle cx="214.4" cy="431.6" r="33.3" fill="#fff" />
        </mask>
      </defs>
      <circle cx="256" cy="256" r="256" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
