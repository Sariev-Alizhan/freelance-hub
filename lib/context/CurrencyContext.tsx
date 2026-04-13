'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency } from '@/lib/types'

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'KZT',
  setCurrency: () => {},
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('KZT')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-currency') as Currency | null
      if (saved) setCurrencyState(saved)
    } catch {}
  }, [])

  const setCurrency = (c: Currency) => {
    try { localStorage.setItem('fh-currency', c) } catch {}
    setCurrencyState(c)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
