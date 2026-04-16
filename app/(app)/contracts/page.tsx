import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FileText, Shield, Sparkles, Download } from 'lucide-react'
import ContractClient from './ContractClient'

export const metadata: Metadata = {
  title: 'AI Contract Generator — FreelanceHub',
  description: 'Generate a professional freelance contract with AI in seconds.',
}

const FEATURES = [
  { icon: Sparkles, text: 'Writes a full contract based on your parameters' },
  { icon: Shield,   text: 'Legally structured for freelance agreements worldwide' },
  { icon: Download, text: 'Download the ready file or copy the text' },
]

export default function ContractsPage() {
  return (
    <div className="page-shell page-shell--wide">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Contract Generator</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Fill in the parameters — AI will write a full professional contract in seconds.
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
        ⚠️ This contract is for informational purposes only. We recommend consulting a lawyer before signing.
      </div>

      <Suspense>
        <ContractClient />
      </Suspense>
    </div>
  )
}
