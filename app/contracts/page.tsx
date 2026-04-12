import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FileText, Shield, Sparkles, Download } from 'lucide-react'
import ContractClient from './ContractClient'

export const metadata: Metadata = {
  title: 'AI Генератор договора — FreelanceHub',
  description: 'Сгенерируй профессиональный ГПХ-договор для фриланс-проекта с помощью AI за несколько секунд.',
}

const FEATURES = [
  { icon: Sparkles, text: 'Пишет полный ГПХ-договор по вашим параметрам' },
  { icon: Shield,   text: 'Учитывает законодательство РФ, РК и РБ' },
  { icon: Download, text: 'Скачай готовый файл или скопируй текст' },
]

export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Генератор договора</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Заполни параметры — AI напишет полный профессиональный договор ГПХ за секунды.
        </p>
        <div className="flex flex-wrap gap-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
        ⚠️ Договор носит ознакомительный характер. Перед подписанием рекомендуем проконсультироваться с юристом.
      </div>

      <Suspense>
        <ContractClient />
      </Suspense>
    </div>
  )
}
