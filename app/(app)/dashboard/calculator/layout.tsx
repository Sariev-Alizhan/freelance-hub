import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор фриланс-дохода — FreelanceHub',
  description: 'Рассчитай свою фриланс-ставку с учётом налогов, простоев и расходов.',
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
