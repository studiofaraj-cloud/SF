/**
 * Where to send someone after signing in, from a `?next=` parameter: only a
 * path on this site. `//evil.example`, `/\evil.example` or a full URL would
 * take them elsewhere — the URL parser resolves all of those, so this
 * compares origins rather than characters. Returns `fallback` otherwise.
 */
export function sameSitePath(next: string | null | undefined, base: string, fallback: string): string {
  if (!next?.startsWith('/')) return fallback;
  try {
    const origin = new URL(base).origin;
    const url = new URL(next, origin);
    if (url.origin !== origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
