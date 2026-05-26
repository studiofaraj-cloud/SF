/** Format a minor-unit (cents) amount as a localized currency string. */
export function formatMoney(cents: number, currency = 'eur', locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((cents ?? 0) / 100);
}

/** Parse a user-entered euro amount (e.g. "1.234,56" or "1234.56") to cents. */
export function eurosToCents(input: string | number): number {
  if (typeof input === 'number') return Math.round(input * 100);
  let s = input.trim().replace(/\s/g, '');
  if (!s) return 0;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // The right-most separator is the decimal one; strip the other (thousands).
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    s = s.replace(',', '.');
  }
  const value = parseFloat(s);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}
