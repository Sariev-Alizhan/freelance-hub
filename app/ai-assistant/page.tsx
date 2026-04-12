import { Sparkles } from 'lucide-react'
import ChatInterface from '@/components/ai/ChatInterface'
import AIHints from '@/components/ai/AIHints'

export default function AIAssistantPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Powered by Claude AI
        </div>
        <h1 className="text-3xl font-bold mb-3">AI-подбор фрилансера</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Опишите задачу простыми словами — ИИ задаст уточняющие вопросы и подберёт идеального специалиста из 32 000+ фрилансеров
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
