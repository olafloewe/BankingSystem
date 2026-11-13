/**
 * Formats integer cents (e.g. 150000) into "$1,500.00" (or "$1500.00" matching original view).
 * @param {number} cents
 * @returns {string}
 */
export function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
