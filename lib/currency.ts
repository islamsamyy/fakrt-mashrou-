/**
 * Currency utilities for IDEA BUSINESS
 * Handles exchange rate fetching, conversion, and formatting
 */

export type CurrencyCode = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'KWD' | 'QAR' | 'OMR' | 'JOD' | 'BHD';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  SAR: 'ر.س',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  KWD: 'د.ك',
  QAR: 'ر.ق',
  OMR: 'ر.ع.',
  JOD: 'د.ا',
  BHD: 'د.ب',
};

const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  SAR: 'الريال السعودي',
  USD: 'الدولار الأمريكي',
  EUR: 'اليورو',
  GBP: 'الجنيه الإسترليني',
  AED: 'الدرهم الإماراتي',
  KWD: 'الدينار الكويتي',
  QAR: 'الريال القطري',
  OMR: 'الريال العماني',
  JOD: 'الدينار الأردني',
  BHD: 'الدينار البحريني',
};

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

/**
 * Fetch current exchange rates from OpenExchangeRates API
 * Falls back to cached rates if API is unavailable
 */
export async function fetchExchangeRates(
  baseCurrency: CurrencyCode = 'SAR'
): Promise<Record<CurrencyCode, number>> {
  const apiKey = process.env.OPENEXCHANGERATES_API_KEY;

  // If no API key, return default rates (1:1)
  if (!apiKey) {
    console.warn('OPENEXCHANGERATES_API_KEY not configured, using default rates');
    return getDefaultRates(baseCurrency);
  }

  try {
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=${baseCurrency}&symbols=USD,EUR,GBP,AED,KWD,QAR,OMR,JOD,BHD,SAR`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`);
    }

    const data = (await response.json()) as ExchangeRateResponse;
    return data.rates as Record<CurrencyCode, number>;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return getDefaultRates(baseCurrency);
  }
}

/**
 * Get default exchange rates (fallback when API is unavailable)
 * These are approximate rates and should be updated manually or via cron
 */
function getDefaultRates(baseCurrency: CurrencyCode): Record<CurrencyCode, number> {
  // Rates relative to USD as base for simplicity
  const usdRates: Record<CurrencyCode, number> = {
    SAR: 3.75,
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    KWD: 0.31,
    QAR: 3.64,
    OMR: 0.38,
    JOD: 0.71,
    BHD: 0.376,
  };

  // Convert to base currency
  const baseRate = usdRates[baseCurrency];
  const rates: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;

  Object.entries(usdRates).forEach(([currency, rate]) => {
    rates[currency as CurrencyCode] = rate / baseRate;
  });

  return rates;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to base (first currency in rates object), then to target
  const baseRate = rates[fromCurrency] || 1;
  const targetRate = rates[toCurrency] || 1;

  return (amount / baseRate) * targetRate;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: string = 'ar-SA',
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get currency name in Arabic
 */
export function getCurrencyName(currency: CurrencyCode, locale: string = 'ar'): string {
  if (locale === 'ar') {
    return CURRENCY_NAMES[currency] || currency;
  }
  return currency;
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: unknown): currency is CurrencyCode {
  return (
    typeof currency === 'string' &&
    ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'OMR', 'JOD', 'BHD'].includes(currency)
  );
}

/**
 * Get list of all supported currencies
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'OMR', 'JOD', 'BHD'];
}

/**
 * Parse currency from string (e.g., "1,234.56 SAR")
 */
export function parseCurrency(value: string): { amount: number; currency: CurrencyCode } | null {
  // Extract currency code (3 letters)
  const currencyMatch = value.match(/([A-Z]{3})/);
  if (!currencyMatch) return null;

  const currency = currencyMatch[1];
  if (!isValidCurrency(currency)) return null;

  // Extract numeric value
  const numberMatch = value.match(/[\d,]+\.?\d*/);
  if (!numberMatch) return null;

  const amount = parseFloat(numberMatch[0].replace(/,/g, ''));
  return { amount, currency };
}

/**
 * Calculate fee based on currency and amount
 */
export function calculateConversionFee(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  // Base fee: 0.5%
  let feePercentage = 0.005;

  // Higher fee for cross-border transactions
  if (fromCurrency !== toCurrency && fromCurrency !== 'SAR' && toCurrency !== 'SAR') {
    feePercentage = 0.015; // 1.5%
  }

  return amount * feePercentage;
}

/**
 * Get exchange rate for display
 */
export async function getDisplayExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const rates = await fetchExchangeRates(fromCurrency);
  return rates[toCurrency] || 1;
}
