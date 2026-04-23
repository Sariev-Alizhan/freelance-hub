'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency } from '@/lib/types'
import { EXCHANGE_RATES } from '@/lib/utils/currency'

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  rates: Record<string, number>
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  rates: EXCHANGE_RATES,
})

export function CurrencyProvider({ children, initialCurrency = 'KZT' }: { children: ReactNode; initialCurrency?: Currency }) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency)
  const [rates, setRates] = useState<Record<string, number>>(EXCHANGE_RATES)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-currency') as Currency | null
      if (saved && saved !== initialCurrency) setCurrencyState(saved)
      else if (!saved) {
        // Persist server's detection so subsequent SSR sees the cookie.
        document.cookie = `fh-currency=${initialCurrency}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`
      }
    } catch {}

    fetch('/api/rates')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.rates) setRates(d.rates) })
      .catch(() => {})
  }, [initialCurrency])

  const setCurrency = (c: Currency) => {
    try {
      localStorage.setItem('fh-currency', c)
      document.cookie = `fh-currency=${c}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`
    } catch {}
    setCurrencyState(c)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
