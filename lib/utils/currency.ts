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

/** Convert from RUB (internal base) to any currency */
export function convertPrice(
  amountRub: number,
  toCurrency: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): number {
  return Math.round(amountRub * (rates[toCurrency] ?? EXCHANGE_RATES[toCurrency]))
}

/** Convert from USD to any display currency */
export function convertFromUSD(
  amountUsd: number,
  to: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): number {
  if (to === 'USD' || to === 'USDT') return Math.round(amountUsd * 100) / 100
  const usdPerRub = rates['USD'] ?? EXCHANGE_RATES['USD']   // e.g. 0.0109
  const rubAmount = amountUsd / usdPerRub                   // USD → RUB
  const toRate    = rates[to]  ?? EXCHANGE_RATES[to]        // target per RUB
  return Math.round(rubAmount * toRate)
}

/** Convert from any currency back to USD (for internal calculations) */
export function convertToUSD(
  amount: number,
  from: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): number {
  if (from === 'USD' || from === 'USDT') return amount
  const fromRate  = rates[from] ?? EXCHANGE_RATES[from]     // from-currency per RUB
  const rubAmount = amount / fromRate                        // → RUB
  const usdPerRub = rates['USD'] ?? EXCHANGE_RATES['USD']
  return rubAmount * usdPerRub                              // → USD
}

/** Format a USD amount in the chosen display currency */
export function formatFromUSD(
  amountUsd: number,
  to: Currency,
  rates: Record<string, number> = EXCHANGE_RATES,
): string {
  const n   = convertFromUSD(amountUsd, to, rates)
  const sym = CURRENCY_SYMBOLS[to]
  // Symbol-prefix currencies: USD, EUR, GBP, USDT
  if (['USD', 'EUR', 'GBP', 'USDT'].includes(to)) return `${sym}${n.toLocaleString('en-US')}`
  return `${n.toLocaleString('ru-RU')} ${sym}`
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
