'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useToastHelpers } from '@/lib/context/ToastContext'
import type { FormData } from '@/components/profile/setup/types'

/**
 * Owns all state, validation, and submit logic for the freelancer
 * onboarding wizard. Returns form data, per-step handlers, and the
 * async submit that uploads the avatar + calls /api/profile/save.
 */
export function useFreelancerSetup(user: SupabaseUser | null) {
  const router = useRouter()
  const { success, error: toastError } = useToastHelpers()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const [form, setForm] = useState<FormData>({
    fullName: user?.user_metadata?.full_name || '',
    location: '',
    bio: '',
    avatarFile: null,
    avatarPreview: user?.user_metadata?.avatar_url || '',
    title: '',
    category: '',
    level: 'middle',
    responseTime: 'within a day',
    languages: ['Russian'],
    skills: [],
    priceFrom: '',
    priceTo: '',
    portfolio: [],
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addSkill(s: string) {
    const trimmed = s.trim()
    if (trimmed && !form.skills.includes(trimmed) && form.skills.length < 15) {
      set('skills', [...form.skills, trimmed])
    }
    setSkillInput('')
  }

  function toggleLanguage(lang: string) {
    if (form.languages.includes(lang)) {
      if (form.languages.length === 1) return
      set('languages', form.languages.filter(l => l !== lang))
    } else {
      set('languages', [...form.languages, lang])
    }
  }

  async function generateBio() {
    if (!form.title) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/bio-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          skills: form.skills,
          level: form.level,
        }),
      })
      const { bio } = await res.json()
      if (bio) set('bio', bio)
    } finally {
      setAiLoading(false)
    }
  }

  const canNextByStep = [
    form.fullName.trim().length >= 2,
    form.title.trim().length >= 3 && form.category !== '',
    form.skills.length >= 2 && form.priceFrom !== '',
    true,
  ]

  async function handleSubmit() {
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)
    setSubmitError(null)
    try {
      let avatarUrl = form.avatarPreview
      if (form.avatarFile) {
        const fd = new FormData()
        fd.append('file', form.avatarFile)
        const upRes = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
        const upJson = await upRes.json()
        if (upRes.ok && upJson.url) avatarUrl = upJson.url
      }

      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          location: form.location.trim() || null,
          bio: form.bio.trim() || null,
          avatarUrl: avatarUrl || null,
          title: form.title.trim(),
          category: form.category,
          skills: form.skills,
          priceFrom: form.priceFrom,
          priceTo: form.priceTo,
          level: form.level,
          responseTime: form.responseTime,
          languages: form.languages,
          portfolio: form.portfolio,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)

      setStep(5)
      success('Profile saved!', 'Now clients can find you')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setSubmitError(msg)
      toastError('Save error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form, set, step, setStep,
    submitting, submitError, aiLoading,
    skillInput, setSkillInput,
    addSkill, toggleLanguage, generateBio, handleSubmit,
    canNext: canNextByStep[step] ?? true,
  }
}
