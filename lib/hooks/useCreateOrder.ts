'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useToastHelpers } from '@/lib/context/ToastContext'
import type { FormData, PriceAdvice } from '@/components/orders/create/types'

/**
 * Owns state, validation, AI helpers (description / voice / price),
 * and submit for the 4-step create-order wizard. The page is pure
 * layout; all data/side-effects live here.
 */
export function useCreateOrder(user: SupabaseUser | null) {
  const router = useRouter()
  const { success, error: toastError } = useToastHelpers()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [priceAdviceLoading, setPriceAdviceLoading] = useState(false)
  const [priceAdvice, setPriceAdvice] = useState<PriceAdvice | null>(null)
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
    } catch {
    } finally {
      setAiLoading(false)
    }
  }

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
        if (parsed.category)    set('category', parsed.category as FormData['category'])
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
    } catch {
    } finally {
      setPriceAdviceLoading(false)
    }
  }

  function applyPriceAdvice() {
    if (!priceAdvice) return
    set('budgetMin', String(priceAdvice.min))
    set('budgetMax', String(priceAdvice.max))
    setPriceAdvice(null)
  }

  const canNextByStep = [
    form.category !== '',
    form.title.trim().length >= 10 && form.description.trim().length >= 30,
    form.deadline !== '' && (form.budgetMin !== '' || form.budgetMax !== ''),
  ]

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

      fetch('/api/orders/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: json.id }),
      }).catch(() => {})
    } catch (e) {
      toastError('Failed to create order', e instanceof Error ? e.message : 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form, set, step, setStep,
    submitting, aiLoading,
    skillInput, setSkillInput, addSkill, removeSkill,
    priceAdvice, priceAdviceLoading, getPriceAdvice, applyPriceAdvice,
    voiceRecording, voiceParsing, toggleVoice,
    generateDescription, handleSubmit,
    createdOrderId,
    canNext: canNextByStep[step] ?? true,
  }
}
