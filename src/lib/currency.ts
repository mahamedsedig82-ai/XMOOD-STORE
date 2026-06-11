/**
 * @fileOverview Currency utilities for the Exigo platform.
 * Handles USD to SDG conversion based on the fixed rate 1 USD = 5400 SDG.
 */

export const USD_TO_SDG_RATE = 5400;

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
 * Formats a number (assumed in USD) as SDG currency using the fixed rate.
 */
export function formatSDG(usdAmount: number): string {
  const sdgAmount = usdAmount * USD_TO_SDG_RATE;
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    maximumFractionDigits: 0,
  }).format(sdgAmount);
}

/**
 * Returns a dual-price string for display.
 */
export function getDualPrice(usdAmount: number): string {
  return `${formatUSD(usdAmount)} (${formatSDG(usdAmount)})`;
}