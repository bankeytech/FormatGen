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
 */
export function formatPrice(
  amount: number,
  style: 'full' | 'abbreviated' = 'full',
  currency: string = '₦'
): string {
  if (isNaN(amount)) return `${currency}0`;

  if (style === 'full') {
    const grouped = Math.round(amount).toLocaleString('en-US');
    return `${currency}${grouped}`;
  }

  const parts = formatPriceParts(amount, currency);
  return `${parts.currency}${parts.numberStr}${parts.unit}`;
}
