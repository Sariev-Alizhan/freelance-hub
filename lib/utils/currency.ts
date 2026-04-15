import { Currency } from '@/lib/types'

// Static fallback rates relative to RUB (April 2026).
// Live rates are fetched by /api/rates and provided via CurrencyContext.
export const EXCHANGE_RATES: Record<Currency, number> = {
  RUB:  1,
  KZT:  5.85,
  UAH:  0.41,
  USD:  0.0109,
  EUR:  0.0101,
  GBP:  0.0086,
  USDT: 0.0109,
  CNY:  0.079,
  AED:  0.040,
  TRY:  0.375,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  KZT:  '₸',
  RUB:  '₽',
  USD:  '$',
  EUR:  '€',
  GBP:  '£',
  USDT: '₮',
  UAH:  '₴',
  CNY:  '¥',
  AED:  'د.إ',
  TRY:  '₺',
}

export function convertPrice(
  amountRub: number,
  toCurrency: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): number {
  return Math.round(amountRub * (rates[toCurrency] ?? EXCHANGE_RATES[toCurrency]))
}

export function formatPrice(
  amountRub: number,
  currency: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): string {
  const converted = convertPrice(amountRub, currency, rates)
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${converted.toLocaleString('ru-RU')} ${symbol}`
}
