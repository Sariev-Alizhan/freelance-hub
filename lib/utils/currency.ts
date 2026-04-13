import { Currency } from '@/lib/types'

// Base: RUB. Approximate rates (update via API in production).
export const EXCHANGE_RATES: Record<Currency, number> = {
  RUB:  1,
  KZT:  4.9,
  UAH:  0.38,
  USD:  0.011,
  EUR:  0.010,
  GBP:  0.0087,
  USDT: 0.011,
  CNY:  0.079,
  AED:  0.040,
  TRY:  0.37,
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

export function convertPrice(amountRub: number, toCurrency: Currency): number {
  return Math.round(amountRub * EXCHANGE_RATES[toCurrency])
}

export function formatPrice(amountRub: number, currency: Currency): string {
  const converted = convertPrice(amountRub, currency)
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${converted.toLocaleString('ru-RU')} ${symbol}`
}
