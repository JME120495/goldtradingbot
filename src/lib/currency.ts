// Static Exchange Rates relative to USD (Base)
// Note: In a production environment, these could be fetched dynamically from an API like OpenExchangeRates or Fixer.io
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  XAF: 605, // CFA Franc CEMAC
  XOF: 605, // CFA Franc UEMOA
  GBP: 0.79,
  ZAR: 18.5,
  KES: 135,
  NGN: 1150
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  XAF: 'FCFA',
  XOF: 'FCFA',
  GBP: '£',
  ZAR: 'R',
  KES: 'KSh',
  NGN: '₦'
};

/**
 * Converts a base price in USD to the target currency and formats it.
 * @param amountInUSD - The amount in US Dollars
 * @param targetCurrency - The currency code (e.g., 'XAF', 'EUR')
 * @returns Formatted string (e.g., "15000 FCFA" or "€25.50")
 */
export function formatPrice(amountInUSD: number, targetCurrency: string = 'USD'): string {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const convertedAmount = amountInUSD * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;

  // Formatting rules based on currency
  if (targetCurrency === 'XAF' || targetCurrency === 'XOF') {
    // FCFA doesn't use decimals and symbol goes at the end
    return `${Math.round(convertedAmount).toLocaleString('fr-FR')} ${symbol}`;
  }

  if (targetCurrency === 'EUR') {
    // Euro often uses comma for decimals and symbol at the end in french, or beginning in english.
    // Let's stick to standard Intl.NumberFormat
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(convertedAmount);
  }

  if (targetCurrency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(convertedAmount);
  }

  // Fallback generic format
  return `${symbol}${convertedAmount.toFixed(2)}`;
}
