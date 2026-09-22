/**
 * Price formatting utilities for WhatsApp sales posts
 */

export interface PriceParts {
  currency: string;
  numberStr: string;
  unit: 'k' | 'm' | '';
}

/**
 * Parses amount into numerical components for flexible styling
 */
export function formatPriceParts(amount: number, currency: string = '₦'): PriceParts {
  if (isNaN(amount) || amount === 0) {
    return { currency, numberStr: '0', unit: '' };
  }

  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    // Format up to 2 decimal places, trimming trailing zeroes and unnecessary decimal points
    const formatted = parseFloat(val.toFixed(2)).toString();
    return { currency, numberStr: formatted, unit: 'm' };
  }

  if (amount >= 1_000) {
    const val = amount / 1_000;
    const formatted = parseFloat(val.toFixed(2)).toString();
    return { currency, numberStr: formatted, unit: 'k' };
  }

  return { currency, numberStr: amount.toString(), unit: '' };
}

/**
 * Format price according to specification:
 * 'full': ₦ + comma-grouped integer, e.g. ₦670,000
 * 'abbreviated':
 *   >= 1,000,000 -> divide by 1,000,000, trim trailing .0, suffix m -> ₦1.2m, ₦22.8m
 *   >= 1,000 -> divide by 1,000, trim trailing .0, suffix k -> ₦670k, ₦85k
 *   else -> raw number, no suffix
 * 'both': ₦670,000 (₦670k)
 */
export function formatPrice(
  amount: number,
  style: 'full' | 'abbreviated' | 'both' = 'full',
  currency: string = '₦'
): string {
  if (isNaN(amount) || amount === 0) return `${currency}0`;

  if (style === 'full') {
    const grouped = Math.round(amount).toLocaleString('en-US');
    return `${currency}${grouped}`;
  }

  if (style === 'both') {
    const full = Math.round(amount).toLocaleString('en-US');
    const parts = formatPriceParts(amount, currency);
    const abbr = `${parts.currency}${parts.numberStr}${parts.unit}`;
    return `${currency}${full} (${abbr})`;
  }

  const parts = formatPriceParts(amount, currency);
  return `${parts.currency}${parts.numberStr}${parts.unit}`;
}

/**
 * Normalizes user price strings common in Nigerian market, e.g.:
 * - "750000" -> 750000
 * - "750k", "750 K", "₦750k", "₦ 750k" -> 750000
 * - "1.2m", "1.2 M", "₦1.2m" -> 1200000
 * - "₦750,000", "750,000" -> 750000
 */
export function normalizeNigerianPriceInput(raw: string): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[₦#,\s]/g, '').trim().toLowerCase();

  // Match million e.g. 1.2m, 1.75m, 22m, 22.8million
  const millionMatch = cleaned.match(/^([\d.]+)\s*(?:m|million)$/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1]);
    return isNaN(val) ? null : Math.round(val * 1_000_000);
  }

  // Match thousand e.g. 770k, 535k, 45k, 85thousand
  const thousandMatch = cleaned.match(/^([\d.]+)\s*(?:k|thousand)$/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    return isNaN(val) ? null : Math.round(val * 1_000);
  }

  const rawNum = parseFloat(cleaned);
  if (!isNaN(rawNum) && rawNum > 0) {
    return Math.round(rawNum);
  }

  return null;
}
