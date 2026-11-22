/**
 * Versioning for Terms of Service and Privacy/Marketing consent.
 * Bump TOS_VERSION whenever the user-facing terms change in a way that
 * requires re-acceptance. Users whose stored consent.tosVersion differs
 * from this value must re-accept before saving profile changes.
 */
export const TOS_VERSION = '2026-06-01';

/**
 * Version of the privacy notice (/privacy), recorded with each newsletter
 * consent. Bump it when the notice changes.
 */
export const PRIVACY_VERSION = '2026-11-22';
