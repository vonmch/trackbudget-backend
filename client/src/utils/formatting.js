// src/utils/formatting.js

/**
 * Formats a number into a standard US currency string.
 * Example: 1000000 -> "$1,000,000.00"
 */
export const formatCurrency = (number) => {
  const numericValue = Number(number) || 0;
  return numericValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};