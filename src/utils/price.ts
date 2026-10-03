/**
 * Formats integer PKR amount into display string e.g. 999 -> "Rs. 999".
 */
export function formatPKR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0';
  }
  const formatted = Math.round(amount).toLocaleString('en-US');
  return `Rs. ${formatted}`;
}

/**
 * Calculates discount percentage rounded to nearest integer.
 */
export function calcDiscountPercent(originalPricePKR: number, dealPricePKR: number): number {
  if (!originalPricePKR || originalPricePKR <= 0 || dealPricePKR >= originalPricePKR) {
    return 0;
  }
  const percent = ((originalPricePKR - dealPricePKR) / originalPricePKR) * 100;
  return Math.round(percent);
}

/**
 * Calculates absolute PKR savings.
 */
export function calcSavings(originalPricePKR: number, dealPricePKR: number): number {
  if (!originalPricePKR || originalPricePKR <= 0 || dealPricePKR >= originalPricePKR) {
    return 0;
  }
  return Math.max(0, originalPricePKR - dealPricePKR);
}
