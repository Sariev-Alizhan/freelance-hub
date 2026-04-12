'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Currency } from '@/lib/types'

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'RUB',
  setCurrency: () => {},
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('RUB')
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
