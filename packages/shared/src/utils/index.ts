/**
 * Format an amount in cents to a display string.
 * @example formatCurrency(2500, 'CAD') => "$25.00 CAD"
 */
export function formatCurrency(amountInCents: number, currency = 'CAD'): string {
  const dollars = (amountInCents / 100).toFixed(2);
  return `$${dollars} ${currency}`;
}

/**
 * Format a date for display in the given locale.
 * @example formatDate(new Date('2026-04-15'), 'en') => "April 15, 2026"
 * @example formatDate(new Date('2026-04-15'), 'fr') => "15 avril 2026"
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const loc = locale === 'fr' ? 'fr-CA' : 'en-CA';
  return d.toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Generate a URL-safe slug from text.
 * @example slugify("Maple Leaf Boutique Hotel") => "maple-leaf-boutique-hotel"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Mask an API key for safe display.
 * @example maskApiKey("sk_live_abc123xyz789") => "sk_l****z789"
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

/**
 * Calculate the number of nights between check-in and check-out dates.
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
