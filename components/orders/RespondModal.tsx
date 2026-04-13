'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Wand2, Loader2, Send, Sparkles, Check,
  ChevronUp, ChevronDown, AlertCircle, DollarSign
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useToastHelpers } from '@/lib/context/ToastContext'

interface Props {
  orderId: string
  orderTitle: string
  orderDescription: string
  category: string
  budgetMin: number
  budgetMax: number
  onClose: () => void
}

interface AIAdvice {
  score: number
  tips: string[]
}

export default function RespondModal({
  orderId, orderTitle, orderDescription, category,
  budgetMin, budgetMax, onClose
}: Props) {
  const { user } = useUser()
  const router = useRouter()
  const { success, error: toastError } = useToastHelpers()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [message, setMessage] = useState('')
  const [price, setPrice] = useState('')
  const [step, setStep] = useState<'write' | 'success'>('write')

  const [aiLoading, setAiLoading] = useState(false)
  const [adviceLoading, setAdviceLoading] = useState(false)
  const [advice, setAdvice] = useState<AIAdvice | null>(null)
  const [showAdvice, setShowAdvice] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 280) + 'px'
  }, [message])

  // Generate AI response
  async function generateMessage() {
    if (!orderTitle) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderTitle,
          orderDescription,
          category,
          proposedPrice: price ? parseInt(price) : null,
        }),
      })
      const { message: generated } = await res.json()
      if (generated) {
        setMessage(generated)
        setAdvice(null)
      }
    } finally {
      setAiLoading(false)
    }
  }

  // Get AI quality advice (debounced via button)
  async function getAdvice() {
    if (!message.trim() || message.trim().length < 50) return
    setAdviceLoading(true)
    setShowAdvice(true)
    try {
      const res = await fetch('/api/ai/generate-response', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, orderTitle, proposedPrice: price || null }),
      })
      const data = await res.json()
      setAdvice(data)
    } finally {
      setAdviceLoading(false)
    }
  }

  // Submit
  async function handleSubmit() {
    if (!user) { router.push('/auth/login'); return }
    if (!message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: message.trim(),
          proposedPrice: price ? parseInt(price) : null,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error')
      }
      setStep('success')
      success('Application sent!', 'The client will be notified')
    } catch (e) {
      console.error(e)
      toastError('Failed to send', 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const charCount = message.trim().length
  const isReady = charCount >= 50

  // Score color
  const scoreColor = (s: number) =>
    s >= 8 ? 'text-green-400' : s >= 6 ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = (s: number) =>
    s >= 8 ? 'bg-green-500/10 border-green-500/20' : s >= 6 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-2xl bg-card border border-subtle rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        {step === 'success' ? (
          /* ── Success ── */
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-green-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold mb-1">Application sent!</h2>
              <p className="text-muted-foreground text-sm">
                The client will be notified and will reach out to you soon
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Great!
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-subtle flex-shrink-0">
              <div className="pr-4">
                <h2 className="font-bold text-lg leading-tight">Apply for order</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{orderTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* Price */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Your price
                  <span className="text-muted-foreground font-normal text-xs ml-1">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder={
                        budgetMin && budgetMax
                          ? `${budgetMin.toLocaleString()} – ${budgetMax.toLocaleString()} ₽`
                          : 'Propose a price'
                      }
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
                  </div>
                  {budgetMin > 0 && budgetMax > 0 && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Budget: {budgetMin.toLocaleString()}–{budgetMax.toLocaleString()} ₽
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Cover letter</label>
                  <button
                    onClick={generateMessage}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {aiLoading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Wand2 className="h-3 w-3" />
                    }
                    AI draft
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => { setMessage(e.target.value); setAdvice(null) }}
                    placeholder="Tell us why you're a great fit for this task, your experience and approach..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none min-h-[120px]"
                  />
                  <div className={`absolute bottom-3 right-3 text-xs transition-colors ${isReady ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {charCount}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-xs ${isReady ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {isReady ? '✓ Good to go' : `Minimum 50 characters (${50 - charCount} more)`}
                  </span>
                  {isReady && (
                    <button
                      onClick={getAdvice}
                      disabled={adviceLoading}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {adviceLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      AI rate
                    </button>
                  )}
                </div>
              </div>

              {/* AI Advice panel */}
              <AnimatePresence>
                {showAdvice && (advice || adviceLoading) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`rounded-xl border p-4 ${advice ? scoreBg(advice.score) : 'bg-subtle border-subtle'}`}>
                      {adviceLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          AI is analyzing your application...
                        </div>
                      ) : advice && (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className={`h-4 w-4 ${scoreColor(advice.score)}`} />
                              <span className="text-sm font-semibold">AI score</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-bold ${scoreColor(advice.score)}`}>
                                {advice.score}
                              </span>
                              <span className="text-muted-foreground text-sm">/10</span>
                              <button
                                onClick={() => setShowAdvice(false)}
                                className="ml-2 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {advice.tips.length > 0 && (
                            <ul className="space-y-1.5">
                              {advice.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-yellow-400" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth warning */}
              {!user && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
                  To submit an application you need to{' '}
                  <a href="/auth/login" className="underline font-medium">sign in</a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-subtle flex items-center gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isReady || submitting || !user}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  : <><Send className="h-4 w-4" /> Send application</>
                }
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
