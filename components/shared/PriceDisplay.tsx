'use client'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { formatPrice } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface Props {
  amountRub: number
  prefix?: string
  suffix?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PriceDisplay({ amountRub, prefix = 'from ', suffix, className, size = 'md' }: Props) {
  const { currency, rates } = useCurrency()
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl font-bold' : 'text-base font-semibold'
  return (
    <span className={cn(sizeClass, className)}>
      {prefix}{formatPrice(amountRub, currency, rates)}{suffix}
    </span>
  )
}
