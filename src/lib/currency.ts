
/**
 * @fileOverview Currency utilities for the XMOOD platform.
 * Handles USD to SDG conversion based on a dynamic rate.
 */

export const DEFAULT_USD_TO_SDG_RATE = 5400;

/**
 * Formats a number as USD currency.
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a number (assumed in USD) as SDG currency using a provided or default rate.
 */
export function formatSDG(usdAmount: number, rate: number = DEFAULT_USD_TO_SDG_RATE): string {
  const sdgAmount = usdAmount * rate;
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    maximumFractionDigits: 0,
  }).format(sdgAmount);
}

/**
 * Returns a dual-price string for display.
 */
export function getDualPrice(usdAmount: number, rate: number = DEFAULT_USD_TO_SDG_RATE): string {
  return `${formatUSD(usdAmount)} (${formatSDG(usdAmount, rate)})`;
}
