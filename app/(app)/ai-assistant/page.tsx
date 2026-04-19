import { Sparkles } from 'lucide-react'
import ChatInterface from '@/components/ai/ChatInterface'
import AIHints from '@/components/ai/AIHints'
import { getServerT } from '@/lib/i18n/server'

export default async function AIAssistantPage() {
  const t = await getServerT()
  const td = t.aiPage

  return (
    <div className="page-shell page-shell--narrow">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          {td.asstBadge}
        </div>
        <h1 className="text-3xl font-bold mb-3">{td.asstTitle}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {td.asstSubtitle}
        </p>
      </div>

      {/* Chat */}
      <div className="rounded-2xl border border-subtle bg-card overflow-hidden">
        <ChatInterface />
      </div>

      {/* Hints */}
      <AIHints />
    </div>
  )
}
