// KPay operators (https://kpay.site/documentation/providers): 12 countries, 23 providers.
// Single source of truth for the payment modal, phone prefixes and amount conversion.
// KPay charges in the operator's local currency, derived from the provider code.

export interface KpayProvider {
  code: string; // exact, case-sensitive KPay provider code
  country: string;
  operator: string;
  dialCode: string;
  currency: string;
  decimals: 0 | 2;
}

export const KPAY_PROVIDERS: KpayProvider[] = [
  { code: 'MTN_MOMO_BEN', country: 'Bénin', operator: 'MTN', dialCode: '229', currency: 'XOF', decimals: 0 },
  { code: 'MOOV_BEN', country: 'Bénin', operator: 'Moov', dialCode: '229', currency: 'XOF', decimals: 0 },
  { code: 'MTN_MOMO_CMR', country: 'Cameroun', operator: 'MTN', dialCode: '237', currency: 'XAF', decimals: 0 },
  { code: 'ORANGE_CMR', country: 'Cameroun', operator: 'Orange', dialCode: '237', currency: 'XAF', decimals: 0 },
  { code: 'MTN_MOMO_CIV', country: "Côte d'Ivoire", operator: 'MTN', dialCode: '225', currency: 'XOF', decimals: 0 },
  { code: 'ORANGE_CIV', country: "Côte d'Ivoire", operator: 'Orange', dialCode: '225', currency: 'XOF', decimals: 0 },
  { code: 'VODACOM_MPESA_COD', country: 'RD Congo', operator: 'Vodacom M-Pesa', dialCode: '243', currency: 'CDF', decimals: 0 },
  { code: 'AIRTEL_COD', country: 'RD Congo', operator: 'Airtel', dialCode: '243', currency: 'CDF', decimals: 2 },
  { code: 'ORANGE_COD', country: 'RD Congo', operator: 'Orange', dialCode: '243', currency: 'CDF', decimals: 2 },
  { code: 'AIRTEL_GAB', country: 'Gabon', operator: 'Airtel', dialCode: '241', currency: 'XAF', decimals: 0 },
  { code: 'MPESA_KEN', country: 'Kenya', operator: 'M-Pesa', dialCode: '254', currency: 'KES', decimals: 0 },
  { code: 'AIRTEL_COG', country: 'Congo', operator: 'Airtel', dialCode: '242', currency: 'XAF', decimals: 0 },
  { code: 'MTN_MOMO_COG', country: 'Congo', operator: 'MTN', dialCode: '242', currency: 'XAF', decimals: 0 },
  { code: 'AIRTEL_RWA', country: 'Rwanda', operator: 'Airtel', dialCode: '250', currency: 'RWF', decimals: 0 },
  { code: 'MTN_MOMO_RWA', country: 'Rwanda', operator: 'MTN', dialCode: '250', currency: 'RWF', decimals: 0 },
  { code: 'FREE_SEN', country: 'Sénégal', operator: 'Free', dialCode: '221', currency: 'XOF', decimals: 0 },
  { code: 'ORANGE_SEN', country: 'Sénégal', operator: 'Orange', dialCode: '221', currency: 'XOF', decimals: 0 },
  { code: 'ORANGE_SLE', country: 'Sierra Leone', operator: 'Orange', dialCode: '232', currency: 'SLE', decimals: 2 },
  { code: 'AIRTEL_OAPI_UGA', country: 'Ouganda', operator: 'Airtel', dialCode: '256', currency: 'UGX', decimals: 0 },
  { code: 'MTN_MOMO_UGA', country: 'Ouganda', operator: 'MTN', dialCode: '256', currency: 'UGX', decimals: 0 },
  { code: 'AIRTEL_OAPI_ZMB', country: 'Zambie', operator: 'Airtel', dialCode: '260', currency: 'ZMW', decimals: 2 },
  { code: 'MTN_MOMO_ZMB', country: 'Zambie', operator: 'MTN', dialCode: '260', currency: 'ZMW', decimals: 2 },
  { code: 'ZAMTEL_ZMB', country: 'Zambie', operator: 'Zamtel', dialCode: '260', currency: 'ZMW', decimals: 2 },
];

// Mobile Money is offered in Cameroon only for now (crypto stays available everywhere).
// To open another KPay country, add its provider codes here.
const ENABLED_CODES = ['MTN_MOMO_CMR', 'ORANGE_CMR'];
export const KPAY_ENABLED_PROVIDERS = KPAY_PROVIDERS.filter((p) => ENABLED_CODES.includes(p.code));

// Only enabled operators can be quoted or charged
export const findKpayProvider = (code: string) =>
  KPAY_ENABLED_PROVIDERS.find((p) => p.code === code);

// CFA franc (XAF / XOF) keeps the site's fixed rate: 1 USD = 600.
const CFA_RATE = 600;

// Used only if the live rate service is unreachable (approximate, Oct 2026).
const FALLBACK_RATES: Record<string, number> = {
  KES: 129.8,
  RWF: 1478,
  CDF: 2310,
  SLE: 24.36,
  UGX: 4040,
  ZMW: 20.17,
};

const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const RATES_TTL_MS = 60 * 60 * 1000;
let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null = null;

async function usdRate(currency: string): Promise<{ rate: number; source: 'fixed' | 'live' | 'fallback' }> {
  if (currency === 'XAF' || currency === 'XOF') return { rate: CFA_RATE, source: 'fixed' };

  if (!cachedRates || Date.now() - cachedRates.fetchedAt > RATES_TTL_MS) {
    try {
      const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data?.result === 'success' && data.rates) {
        cachedRates = { rates: data.rates, fetchedAt: Date.now() };
      }
    } catch {
      // keep the previous cache (if any) or use the fallback below
    }
  }

  const live = cachedRates?.rates[currency];
  if (live && live > 0) return { rate: live, source: 'live' };
  return { rate: FALLBACK_RATES[currency], source: 'fallback' };
}

/** Converts a USD price to the amount KPay must charge for this provider. */
export async function toKpayAmount(amountUSD: number, provider: KpayProvider) {
  const { rate, source } = await usdRate(provider.currency);
  if (!rate) throw new Error(`Aucun taux de change pour ${provider.currency}`);
  const factor = 10 ** provider.decimals;
  // Round up so the customer never pays less than the USD price
  const amount = Math.ceil(amountUSD * rate * factor) / factor;
  return { amount, currency: provider.currency, rate, rateSource: source };
}
