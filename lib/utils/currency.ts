import { Currency } from '@/lib/types'

export const EXCHANGE_RATES: Record<Currency, number> = {
  RUB: 1,
  UAH: 0.38,
  KZT: 4.9,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  UAH: '₴',
  KZT: '₸',
}

export function convertPrice(amountRub: number, toCurrency: Currency): number {
  return Math.round(amountRub * EXCHANGE_RATES[toCurrency])
}

export function formatPrice(amountRub: number, currency: Currency): string {
  const converted = convertPrice(amountRub, currency)
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${converted.toLocaleString('ru-RU')} ${symbol}`
}
