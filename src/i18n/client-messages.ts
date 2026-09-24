/**
 * Which translation namespaces are sent to the browser.
 *
 * Client components read their strings from <NextIntlClientProvider>, and the
 * provider's messages are serialised into every page's HTML. Passing the whole
 * messages file cost ~20 KB gzipped on every page, most of it copy for other
 * pages. So the root layout sends only what the site chrome needs (header,
 * footer, dialogs, service names), and each route adds its own namespaces with
 * <ClientMessages> (src/components/i18n/client-messages.tsx).
 *
 * Server components don't need any of this: getTranslations() and non-client
 * useTranslations() read the full messages on the server.
 *
 * Paths are dotted; `*` matches every key at that level.
 */
export const GLOBAL_CLIENT_NAMESPACES = [
  'nav',
  'footer',
  'dialogs',
  // Navigation menu, footer and the quote/contact forms list the services by name.
  'services.*.label',
  'services.*.subtitle',
];

type Messages = Record<string, unknown>;

const isObject = (v: unknown): v is Messages =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function pickPath(node: unknown, segments: string[]): unknown {
  if (segments.length === 0) return node;
  if (!isObject(node)) return undefined;
  const [head, ...rest] = segments;
  const out: Messages = {};
  for (const key of head === '*' ? Object.keys(node) : [head]) {
    const picked = pickPath(node[key], rest);
    if (picked !== undefined) out[key] = picked;
  }
  return Object.keys(out).length ? out : undefined;
}

// Always merges into objects created here, so the (cached, shared) source
// messages are never mutated.
function mergeInto(target: Messages, source: Messages): Messages {
  for (const [key, value] of Object.entries(source)) {
    target[key] = isObject(value)
      ? mergeInto(isObject(target[key]) ? (target[key] as Messages) : {}, value)
      : value;
  }
  return target;
}

export function pickMessages(messages: Messages, paths: string[]): Messages {
  const result: Messages = {};
  for (const path of paths) {
    const picked = pickPath(messages, path.split('.'));
    if (isObject(picked)) mergeInto(result, picked);
  }
  return result;
}
