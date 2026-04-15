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
  currency: 'KZT',
  setCurrency: () => {},
  rates: EXCHANGE_RATES,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('KZT')
  const [rates, setRates] = useState<Record<string, number>>(EXCHANGE_RATES)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-currency') as Currency | null
      if (saved) setCurrencyState(saved)
    } catch {}

    // Fetch live exchange rates (cached 1 h by the route handler)
    fetch('/api/rates')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.rates) setRates(d.rates) })
      .catch(() => {})
  }, [])

  const setCurrency = (c: Currency) => {
    try { localStorage.setItem('fh-currency', c) } catch {}
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
