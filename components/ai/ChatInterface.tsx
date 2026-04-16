'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { ChatMessage as ChatMsg, Freelancer } from '@/lib/types'
import { getFreelancerById } from '@/lib/mock'
import FreelancerCard from '@/components/freelancers/FreelancerCard'
import { motion, AnimatePresence } from 'framer-motion'

const WELCOME: ChatMsg = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I\'m the FreelanceHub AI assistant 👋\n\nDescribe your task and I\'ll find the perfect freelancer. You can simply say: "need a website", "want to set up ads", or "looking for an app designer".',
  timestamp: new Date(),
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef        = useRef<HTMLDivElement>(null)
  const msgsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    const history = [...messages, userMsg].filter((m) => m.id !== 'welcome')
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const reader = res.body?.getReader()
      if (!reader) return

      let fullText = ''
      const assistantMsgId = Date.now().toString() + '-ai'
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += new TextDecoder().decode(value)
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
        )
      }

      // Extract matched freelancers
      const matchBlock = fullText.match(/<matches>([\s\S]*?)<\/matches>/)
      if (matchBlock) {
        const { ids } = JSON.parse(matchBlock[1]) as { ids: string[] }
        const matched = ids.map((id) => getFreelancerById(id)).filter(Boolean) as Freelancer[]
        const cleanText = fullText.replace(/<matches>[\s\S]*?<\/matches>/, '').trim()
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: cleanText, matchedFreelancers: matched }
              : m
          )
        )
      }
    } catch {
      // network/stream failure — UI stays in loading=false state
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[700px]">
      {/* Messages */}
      <div ref={msgsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div className="shrink-0 h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-card border border-subtle rounded-tl-sm'
                  }`}
                >
                  {msg.content || (loading && msg.role === 'assistant' && messages[messages.length - 1].id === msg.id ? (
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                    </div>
                  ) : '')}
                </div>

                {/* Matched freelancers */}
                {msg.matchedFreelancers && msg.matchedFreelancers.length > 0 && (
                  <div className="w-full max-w-2xl space-y-3 mt-1">
                    <p className="text-xs text-muted-foreground font-medium">Matched freelancers:</p>
                    {msg.matchedFreelancers.map((f) => (
                      <FreelancerCard key={f.id} freelancer={f} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading dots */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-subtle">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-subtle p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Describe your task..."
            className="flex-1 px-4 py-3 rounded-xl bg-card border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by Claude AI · FreelanceHub
        </p>
      </div>
    </div>
  )
}
