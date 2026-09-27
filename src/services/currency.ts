/**
 * Centralized Currency Configuration and Utilities
 * Standardized on Indian Rupee (INR / ₹) with en-IN numbering locale.
 */

export const CURRENCY_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
} as const;

export const CURRENCY = CURRENCY_CONFIG.currency;
export const CURRENCY_SYMBOL = CURRENCY_CONFIG.currencySymbol;

/**
 * Formats a monetary amount into standard Indian currency string (e.g., ₹12,500, ₹1,25,000, ₹12,50,000)
 */
export function formatCurrency(
  amount: number,
  options?: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  }
): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${CURRENCY_CONFIG.currencySymbol}0`;
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString(CURRENCY_CONFIG.locale, {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  });

  return isNegative
    ? `-${CURRENCY_CONFIG.currencySymbol}${formatted}`
    : `${CURRENCY_CONFIG.currencySymbol}${formatted}`;
}

/**
 * Formats a number with Indian locale groupings (e.g. 1,00,000)
 */
export function formatIndianNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString(CURRENCY_CONFIG.locale);
}
