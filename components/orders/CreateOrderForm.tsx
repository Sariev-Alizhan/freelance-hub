'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Code2, PenSquare, BarChart2, Target, PenLine,
  Video, Bot, Brain, Blocks, Sparkles,
  ArrowRight, ArrowLeft, Check, Loader2,
  Zap, Clock, DollarSign, Tag, X, Wand2, Mic, MicOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { CategorySlug } from '@/lib/supabase/types'
import { useToastHelpers } from '@/lib/context/ToastContext'

// ── Types ──────────────────────────────────────────────────
interface FormData {
  category: CategorySlug | ''
  title: string
  description: string
  skills: string[]
  budgetMin: string
  budgetMax: string
  budgetType: 'fixed' | 'hourly'
  deadline: string
  isUrgent: boolean
}

// ── Categories ─────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'dev',         label: 'Development',    icon: Code2,     color: '#6366F1', desc: 'Websites, apps, bots' },
  { slug: 'ux-ui',       label: 'UX/UI Design',   icon: PenSquare, color: '#F24E1E', desc: 'Interfaces, prototypes' },
  { slug: 'smm',         label: 'SMM',             icon: BarChart2, color: '#E1306C', desc: 'Social media, content' },
  { slug: 'targeting',   label: 'Targeting',       icon: Target,    color: '#1877F2', desc: 'Ads, leads' },
  { slug: 'copywriting', label: 'Copywriting',     icon: PenLine,   color: '#10B981', desc: 'Text, SEO, email' },
  { slug: 'video',       label: 'Video editing',   icon: Video,     color: '#EF4444', desc: 'Videos, Reels, editing' },
  { slug: 'tg-bots',     label: 'Telegram bots',   icon: Bot,       color: '#229ED9', desc: 'Bots, mini-apps' },
  { slug: 'ai-ml',       label: 'AI / ML',         icon: Brain,     color: '#8B5CF6', desc: 'Neural nets, automation' },
  { slug: 'nocode',      label: 'No-code',         icon: Blocks,    color: '#F59E0B', desc: 'Bubble, Webflow, Make' },
  { slug: '3d-art',      label: '3D / AI art',     icon: Sparkles,  color: '#EC4899', desc: 'Illustrations, 3D' },
] as const

const DEADLINES = [
  { value: 'Urgent (1-2 days)',  label: 'Urgent',   sub: '1–2 days',  icon: '⚡' },
  { value: 'Up to 1 week',       label: '1 week',   sub: 'up to 7d',  icon: '📅' },
  { value: 'Up to 2 weeks',      label: '2 weeks',  sub: '7–14 days', icon: '🗓️' },
  { value: 'Up to 1 month',      label: '1 month',  sub: '14–30 days',icon: '📆' },
  { value: 'Over a month',       label: 'Long-term',sub: '30+ days',  icon: '🔭' },
  { value: 'To be discussed',    label: 'Discuss',  sub: 'flexible',  icon: '💬' },
]

const BUDGET_RANGES = [
  { label: 'up to ₸10 000', min: '0',     max: '10000'  },
  { label: '₸10–30 000',    min: '10000', max: '30000'  },
  { label: '₸30–60 000',    min: '30000', max: '60000'  },
  { label: '₸60–100 000',   min: '60000', max: '100000' },
  { label: '₸100 000+',     min: '100000',max: '500000' },
  { label: 'Negotiable',     min: '0',     max: '0'      },
]

// ── Step progress ──────────────────────────────────────────
const STEPS = ['Category', 'Description', 'Details', 'Done']

// ── Main component ─────────────────────────────────────────
export default function CreateOrderForm() {
  const router = useRouter()
  const { user } = useUser()
  const { success, error: toastError } = useToastHelpers()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [priceAdviceLoading, setPriceAdviceLoading] = useState(false)
  const [priceAdvice, setPriceAdvice] = useState<{ min: number; max: number; explanation: string } | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [voiceParsing, setVoiceParsing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const [form, setForm] = useState<FormData>({
    category: '',
    title: '',
    description: '',
    skills: [],
    budgetMin: '',
    budgetMax: '',
    budgetType: 'fixed',
    deadline: '',
    isUrgent: false,
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ── Skill tags ───────────────────────────────────────────
  function addSkill(skill: string) {
    const s = skill.trim()
    if (s && !form.skills.includes(s) && form.skills.length < 10) {
      set('skills', [...form.skills, s])
    }
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    set('skills', form.skills.filter(s => s !== skill))
  }

  // ── AI description helper ────────────────────────────────
  async function generateDescription() {
    if (!form.title || !form.category) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, category: form.category }),
      })
      const { description } = await res.json()
      if (description) set('description', description)
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Voice order creation ─────────────────────────────────
  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      toastError('Voice input is not supported in this browser')
      return
    }

    if (voiceRecording) {
      recognitionRef.current?.stop()
      setVoiceRecording(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'ru-RU'
    recognitionRef.current = recognition

    let transcript = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcript += e.results[i][0].transcript + ' '
      }
    }
    recognition.onerror = () => { setVoiceRecording(false) }
    recognition.onend = async () => {
      setVoiceRecording(false)
      if (!transcript.trim()) return
      setVoiceParsing(true)
      try {
        const res = await fetch('/api/ai/parse-voice-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcript.trim() }),
        })
        if (!res.ok) throw new Error('parse failed')
        const parsed = await res.json()
        if (parsed.title)       set('title', parsed.title)
        if (parsed.description) set('description', parsed.description)
        if (parsed.category)    set('category', parsed.category as typeof form.category)
        if (parsed.budgetMin)   set('budgetMin', parsed.budgetMin)
        if (parsed.budgetMax)   set('budgetMax', parsed.budgetMax)
        if (parsed.skills?.length) set('skills', parsed.skills)
        success('Voice order filled in!')
      } catch {
        toastError('Could not parse voice input')
      } finally {
        setVoiceParsing(false)
      }
    }

    recognition.start()
    setVoiceRecording(true)
  }

  // ── AI price advisor ─────────────────────────────────────
  async function getPriceAdvice() {
    if (!form.category || !form.description) return
    setPriceAdviceLoading(true)
    setPriceAdvice(null)
    try {
      const res = await fetch('/api/ai/price-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          deadline: form.deadline || 'flexible',
        }),
      })
      const data = await res.json()
      if (data.min && data.max) setPriceAdvice(data)
    } catch (e) {
      console.error(e)
    } finally {
      setPriceAdviceLoading(false)
    }
  }

  // ── Validation ───────────────────────────────────────────
  const canNext = [
    form.category !== '',
    form.title.trim().length >= 10 && form.description.trim().length >= 30,
    form.deadline !== '' && (form.budgetMin !== '' || form.budgetMax !== ''),
  ]

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit() {
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:      form.title.trim(),
          description: form.description.trim(),
          category:   form.category,
          budgetMin:  parseInt(form.budgetMin) || 0,
          budgetMax:  parseInt(form.budgetMax) || 0,
          budgetType: form.budgetType,
          deadline:   form.deadline,
          skills:     form.skills,
          isUrgent:   form.isUrgent,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create order')

      setCreatedOrderId(json.id)
      setStep(4)
      success('Order published!', 'Specialists can already see your order')

      // Notify matching freelancers via Telegram (best-effort)
      fetch('/api/orders/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: json.id }),
      }).catch(() => {})
    } catch (e) {
      console.error(e)
      toastError('Failed to create order', 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const slide = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -30 },
    transition: { duration: 0.25 },
  }

  return (
    <div className="rounded-2xl border border-subtle bg-card overflow-hidden">
      {/* Progress bar */}
      {step < 4 && (
        <div className="px-6 pt-6 pb-4 border-b border-white/6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-primary text-white'
                  : i === step ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-subtle text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-12 mx-1 transition-all ${i < step ? 'bg-primary' : 'bg-surface'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-6">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Category ── */}
          {step === 0 && (
            <motion.div key="step0" {...slide}>
              <h2 className="text-lg font-bold mb-1">Choose a category</h2>
              <p className="text-sm text-muted-foreground mb-5">What area do you need help with?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const selected = form.category === cat.slug
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => set('category', cat.slug as CategorySlug)}
                      className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-subtle hover:border-white/20 hover:bg-subtle'
                      }`}
                    >
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ background: `${cat.color}18` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <div className="text-sm font-semibold">{cat.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cat.desc}</div>
                      {selected && (
                        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Title + Description ── */}
          {step === 1 && (
            <motion.div key="step1" {...slide} className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold mb-1">Describe the task</h2>
                  <p className="text-sm text-muted-foreground">The more detail, the better we match you with a specialist</p>
                </div>
                {/* Voice input button */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={voiceParsing}
                  title={voiceRecording ? 'Stop recording' : 'Describe by voice'}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    background: voiceRecording ? 'rgba(239,68,68,0.1)' : 'rgba(94,106,210,0.08)',
                    border: `1px solid ${voiceRecording ? 'rgba(239,68,68,0.3)' : 'rgba(94,106,210,0.2)'}`,
                    color: voiceRecording ? '#ef4444' : '#7170ff',
                  }}
                >
                  {voiceParsing
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : voiceRecording
                      ? <MicOff className="h-4 w-4" />
                      : <Mic className="h-4 w-4" />
                  }
                  {voiceParsing ? 'Parsing…' : voiceRecording ? 'Stop' : 'Voice'}
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Job title</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="E.g.: Build an e-commerce store with Next.js"
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Minimum 10 characters</span>
                  <span className={`text-xs ${form.title.length >= 10 ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {form.title.length}/120
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Description</label>
                  <button
                    onClick={generateDescription}
                    disabled={aiLoading || form.title.trim().length < 10}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {aiLoading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Wand2 className="h-3 w-3" />
                    }
                    AI fill
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe in detail what needs to be done, what result you expect, any special requirements..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Minimum 30 characters</span>
                  <span className={`text-xs ${form.description.length >= 30 ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {form.description.length} chars
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Skills + Budget + Deadline ── */}
          {step === 2 && (
            <motion.div key="step2" {...slide} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Order details</h2>
                <p className="text-sm text-muted-foreground">Skills, budget and timeline</p>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Required skills
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 min-h-[36px] mb-2">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput) }
                    }}
                    placeholder="React, Figma, Python... (Enter to add)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={() => addSkill(skillInput)}
                    disabled={!skillInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Budget type */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Payment type
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {(['fixed', 'hourly'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => set('budgetType', type)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.budgetType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-subtle text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      {type === 'fixed' ? '💰 Fixed price' : '⏱️ Hourly rate'}
                    </button>
                  ))}
                </div>

                {/* AI Price Advisor */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={getPriceAdvice}
                    disabled={priceAdviceLoading || !form.description}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {priceAdviceLoading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Wand2 className="h-3 w-3" />
                    }
                    AI price suggestion
                  </button>

                  {priceAdvice && (
                    <div className="mt-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-primary">
                          AI suggests: {priceAdvice.min.toLocaleString()} – {priceAdvice.max.toLocaleString()} ₸
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            set('budgetMin', String(priceAdvice.min))
                            set('budgetMax', String(priceAdvice.max))
                            setPriceAdvice(null)
                          }}
                          className="text-xs px-2 py-0.5 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                        >
                          Use
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{priceAdvice.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Budget presets */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {BUDGET_RANGES.map(range => (
                    <button
                      key={range.label}
                      onClick={() => { set('budgetMin', range.min); set('budgetMax', range.max) }}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                        form.budgetMin === range.min && form.budgetMax === range.max
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-subtle text-muted-foreground hover:border-white/20 hover:text-foreground'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Custom budget */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From (₸)</label>
                    <input
                      type="number"
                      value={form.budgetMin}
                      onChange={e => set('budgetMin', e.target.value)}
                      placeholder="10000"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To (₸)</label>
                    <input
                      type="number"
                      value={form.budgetMax}
                      onChange={e => set('budgetMax', e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Timeline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEADLINES.map(d => (
                    <button
                      key={d.value}
                      onClick={() => {
                        set('deadline', d.value)
                        set('isUrgent', d.value.includes('Urgent'))
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        form.deadline === d.value
                          ? 'border-primary bg-primary/10'
                          : 'border-subtle hover:border-white/20'
                      }`}
                    >
                      <span className="text-lg">{d.icon}</span>
                      <div>
                        <div className={`text-xs font-semibold ${form.deadline === d.value ? 'text-primary' : ''}`}>{d.label}</div>
                        <div className="text-xs text-muted-foreground">{d.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgent toggle */}
              {!form.deadline.includes('Urgent') && (
                <button
                  onClick={() => set('isUrgent', !form.isUrgent)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    form.isUrgent
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-subtle hover:border-white/20'
                  }`}
                >
                  <div className={`h-5 w-5 rounded flex items-center justify-center ${form.isUrgent ? 'bg-red-500' : 'border border-white/20'}`}>
                    {form.isUrgent && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Zap className={`h-3.5 w-3.5 ${form.isUrgent ? 'text-red-400' : 'text-muted-foreground'}`} />
                      Urgent order
                    </div>
                    <div className="text-xs text-muted-foreground">Get responses faster</div>
                  </div>
                </button>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <motion.div key="step3" {...slide} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Review your order</h2>
                <p className="text-sm text-muted-foreground">Everything correct? Click "Publish"</p>
              </div>

              {/* Summary card */}
              <div className="rounded-xl border border-subtle bg-background divide-y divide-white/6">
                <div className="p-4">
                  {(() => {
                    const cat = CATEGORIES.find(c => c.slug === form.category)
                    const Icon = cat?.icon ?? Sparkles
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${cat?.color}20` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: cat?.color }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{cat?.label}</span>
                        {form.isUrgent && (
                          <span className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                            <Zap className="h-3 w-3" /> Urgent
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  <h3 className="font-semibold">{form.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{form.description}</p>
                </div>

                {form.skills.length > 0 && (
                  <div className="px-4 py-3">
                    <div className="text-xs text-muted-foreground mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-4 py-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Budget</div>
                    <div className="font-semibold text-primary">
                      {form.budgetMin && form.budgetMax && parseInt(form.budgetMax) > 0
                        ? `${parseInt(form.budgetMin).toLocaleString()} – ${parseInt(form.budgetMax).toLocaleString()} ₸`
                        : form.budgetMin ? `from ${parseInt(form.budgetMin).toLocaleString()} ₸`
                        : 'Negotiable'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">{form.budgetType === 'fixed' ? 'fixed price' : 'hourly rate'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                    <div className="font-semibold">{form.deadline}</div>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
                  To publish you need to{' '}
                  <a href="/auth/login" className="underline font-medium">sign in</a>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
                <Check className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order published!</h2>
              <p className="text-muted-foreground mb-8">
                Specialists can already see your order and will start responding soon
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {createdOrderId && (
                  <button
                    onClick={() => router.push(`/orders/${createdOrderId}`)}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                  >
                    View order
                  </button>
                )}
                <button
                  onClick={() => router.push('/orders')}
                  className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors"
                >
                  All orders
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? 'Back' : 'Prev'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {submitting ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
