'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Code2, PenSquare, BarChart2, Target, PenLine,
  Video, Bot, Brain, Blocks, Sparkles,
  ArrowRight, ArrowLeft, Check, Loader2,
  User, MapPin, Wand2, X, Tag, DollarSign,
  Image as ImageIcon, Plus, Trash2, Globe, Star,
  Briefcase, Clock, ChevronDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import type { CategorySlug, FreelancerLevel } from '@/lib/supabase/types'
import { useToastHelpers } from '@/lib/context/ToastContext'

// ── Data ───────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'dev',         label: 'Разработка',   icon: Code2,     color: '#6366F1' },
  { slug: 'ux-ui',       label: 'UX/UI Дизайн', icon: PenSquare, color: '#F24E1E' },
  { slug: 'smm',         label: 'SMM',           icon: BarChart2, color: '#E1306C' },
  { slug: 'targeting',   label: 'Таргетинг',     icon: Target,    color: '#1877F2' },
  { slug: 'copywriting', label: 'Копирайтинг',   icon: PenLine,   color: '#10B981' },
  { slug: 'video',       label: 'Видеомонтаж',   icon: Video,     color: '#EF4444' },
  { slug: 'tg-bots',     label: 'Telegram-боты', icon: Bot,       color: '#229ED9' },
  { slug: 'ai-ml',       label: 'AI / ML',       icon: Brain,     color: '#8B5CF6' },
  { slug: 'nocode',      label: 'No-code',        icon: Blocks,    color: '#F59E0B' },
  { slug: '3d-art',      label: '3D / AI-арт',   icon: Sparkles,  color: '#EC4899' },
] as const

const LEVELS: { value: FreelancerLevel; label: string; sub: string; icon: string }[] = [
  { value: 'new',    label: 'Новичок',    sub: 'до 1 года опыта',   icon: '🌱' },
  { value: 'junior', label: 'Junior',     sub: '1–2 года',          icon: '⚡' },
  { value: 'middle', label: 'Middle',     sub: '2–4 года',          icon: '🔥' },
  { value: 'senior', label: 'Senior',     sub: '4+ лет',            icon: '💎' },
  { value: 'top',    label: 'Топ',        sub: 'эксперт отрасли',   icon: '👑' },
]

const RESPONSE_TIMES = [
  { value: 'в течение часа',    label: '< 1 часа',  icon: '⚡' },
  { value: 'в течение 4 часов', label: '< 4 часов', icon: '🕐' },
  { value: 'в течение суток',   label: '< суток',   icon: '📅' },
  { value: 'в течение 2 дней',  label: '2 дня',     icon: '🗓️' },
]

const LANGUAGES = ['Русский', 'Украинский', 'Казахский', 'English', 'Deutsch', 'Español', '中文']

const STEPS = ['Личное', 'Специализация', 'Навыки и цены', 'Портфолио', 'Готово']

interface PortfolioItem {
  title: string
  imageUrl: string
  category: string
  url: string
}

interface FormData {
  // Step 0 — personal
  fullName: string
  location: string
  bio: string
  avatarFile: File | null
  avatarPreview: string
  // Step 1 — specialization
  title: string
  category: CategorySlug | ''
  level: FreelancerLevel
  responseTime: string
  languages: string[]
  // Step 2 — skills & pricing
  skills: string[]
  priceFrom: string
  priceTo: string
  // Step 3 — portfolio
  portfolio: PortfolioItem[]
}

export default function FreelancerSetupForm() {
  const router = useRouter()
  const { user } = useUser()
  const { success, error: toastError } = useToastHelpers()
  const fileRef = useRef<HTMLInputElement>(null)
  const skillInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [portfolioForm, setPortfolioForm] = useState<PortfolioItem>({ title: '', imageUrl: '', category: '', url: '' })
  const [showPortfolioAdd, setShowPortfolioAdd] = useState(false)

  const [form, setForm] = useState<FormData>({
    fullName: user?.user_metadata?.full_name || '',
    location: '',
    bio: '',
    avatarFile: null,
    avatarPreview: user?.user_metadata?.avatar_url || '',
    title: '',
    category: '',
    level: 'middle',
    responseTime: 'в течение суток',
    languages: ['Русский'],
    skills: [],
    priceFrom: '',
    priceTo: '',
    portfolio: [],
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Avatar upload
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    set('avatarFile', file)
    const reader = new FileReader()
    reader.onload = (ev) => set('avatarPreview', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // Skills
  function addSkill(s: string) {
    const trimmed = s.trim()
    if (trimmed && !form.skills.includes(trimmed) && form.skills.length < 15) {
      set('skills', [...form.skills, trimmed])
    }
    setSkillInput('')
  }

  // Languages toggle
  function toggleLanguage(lang: string) {
    if (form.languages.includes(lang)) {
      if (form.languages.length === 1) return
      set('languages', form.languages.filter(l => l !== lang))
    } else {
      set('languages', [...form.languages, lang])
    }
  }

  // AI bio
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

  // Portfolio add
  function addPortfolioItem() {
    if (!portfolioForm.title.trim()) return
    set('portfolio', [...form.portfolio, { ...portfolioForm }])
    setPortfolioForm({ title: '', imageUrl: '', category: '', url: '' })
    setShowPortfolioAdd(false)
  }

  // Validation per step
  const canNext = [
    form.fullName.trim().length >= 2,
    form.title.trim().length >= 3 && form.category !== '',
    form.skills.length >= 2 && form.priceFrom !== '',
    true, // portfolio optional
  ]

  // Submit
  async function handleSubmit() {
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const supabase = createClient()

      // 1. Upload avatar if changed
      let avatarUrl = form.avatarPreview
      if (form.avatarFile) {
        const ext = form.avatarFile.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('avatars')
          .upload(path, form.avatarFile, { upsert: true })
        if (upErr) console.warn('Avatar upload:', upErr.message)
        else {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      }

      // 2. Сохраняем через server-side API (service_role, обходит RLS)
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
      success('Профиль сохранён!', 'Теперь заказчики могут найти вас')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка'
      console.error('Profile save error:', e)
      setSubmitError(msg)
      toastError('Ошибка сохранения', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const slide = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -30 },
    transition: { duration: 0.22 },
  }

  return (
    <div className="rounded-2xl border border-subtle bg-card overflow-hidden">
      {/* Progress */}
      {step < 5 && (
        <div className="px-6 pt-6 pb-4 border-b border-white/6">
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-primary text-white'
                    : i === step ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-subtle text-muted-foreground'
                  }`}>
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={`hidden sm:block text-[10px] font-medium text-center leading-tight ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mb-4 transition-all ${i < step ? 'bg-primary' : 'bg-surface'}`} />
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

          {/* ── STEP 0: Personal info ── */}
          {step === 0 && (
            <motion.div key="s0" {...slide} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1">Личная информация</h2>
                <p className="text-sm text-muted-foreground">Как вас будут видеть заказчики</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative h-20 w-20 rounded-2xl bg-subtle border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden flex-shrink-0 group"
                >
                  {form.avatarPreview ? (
                    <>
                      <img src={form.avatarPreview} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <User className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Фото</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Фото профиля</p>
                  <p className="text-xs text-muted-foreground mb-2">JPG, PNG до 5 МБ. Квадратное фото выглядит лучше</p>
                  <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg bg-subtle border border-subtle hover:bg-surface transition-colors">
                    Загрузить фото
                  </button>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Имя и фамилия *</label>
                <input
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Город
                  <span className="text-muted-foreground font-normal">(необязательно)</span>
                </label>
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="Москва, Киев, Алматы..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">О себе</label>
                  <span className="text-xs text-muted-foreground">необязательно — можно заполнить на шаге 2</span>
                </div>
                <textarea
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                  placeholder="Кратко расскажите о себе, опыте и подходе к работе..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Specialization ── */}
          {step === 1 && (
            <motion.div key="s1" {...slide} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Специализация</h2>
                <p className="text-sm text-muted-foreground">Выберите основное направление работы</p>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-3 block">Категория *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    const sel = form.category === cat.slug
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => set('category', cat.slug as CategorySlug)}
                        className={`group flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                          sel ? 'border-primary bg-primary/8' : 'border-subtle hover:border-white/20 hover:bg-subtle'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: `${cat.color}18` }}>
                          <Icon className="h-4 w-4" style={{ color: cat.color }} />
                        </div>
                        <span className={`text-xs font-medium ${sel ? 'text-primary' : ''}`}>{cat.label}</span>
                        {sel && <Check className="h-3 w-3 text-primary ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title / position */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  Должность / специализация *
                </label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Full-stack разработчик, SMM-специалист, UI/UX дизайнер..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Level */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <Star className="h-3.5 w-3.5 text-muted-foreground" />
                  Уровень опыта
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEVELS.map(lv => (
                    <button
                      key={lv.value}
                      onClick={() => set('level', lv.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        form.level === lv.value ? 'border-primary bg-primary/8' : 'border-subtle hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{lv.icon}</span>
                      <div>
                        <div className={`text-xs font-semibold ${form.level === lv.value ? 'text-primary' : ''}`}>{lv.label}</div>
                        <div className="text-xs text-muted-foreground">{lv.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Время ответа
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSE_TIMES.map(rt => (
                    <button
                      key={rt.value}
                      onClick={() => set('responseTime', rt.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        form.responseTime === rt.value ? 'border-primary bg-primary/8 text-primary' : 'border-subtle hover:border-white/20 text-muted-foreground'
                      }`}
                    >
                      <span>{rt.icon}</span>
                      <span className="text-sm font-medium">{rt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Языки общения
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.languages.includes(lang)
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'border-subtle text-muted-foreground hover:border-white/20 hover:text-foreground'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI bio generation */}
              {form.title && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">AI-описание</span>
                    </div>
                    <button
                      onClick={generateBio}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      Сгенерировать
                    </button>
                  </div>
                  {form.bio ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">{form.bio}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      AI напишет «О себе» на основе вашей специализации и навыков
                    </p>
                  )}
                  {form.bio && (
                    <button
                      onClick={() => set('bio', '')}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Очистить
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Skills & Pricing ── */}
          {step === 2 && (
            <motion.div key="s2" {...slide} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-1">Навыки и цены</h2>
                <p className="text-sm text-muted-foreground">Покажите что умеете и сколько стоят ваши услуги</p>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Навыки *
                  <span className="text-muted-foreground font-normal text-xs">минимум 2</span>
                </label>

                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.skills.map(skill => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                      >
                        {skill}
                        <button onClick={() => set('skills', form.skills.filter(s => s !== skill))} className="hover:text-white transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={skillInputRef}
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput) }
                    }}
                    placeholder="React, Figma, Python... (Enter для добавления)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={() => addSkill(skillInput)}
                    disabled={!skillInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {form.skills.length}/15 навыков добавлено
                </p>
              </div>

              {/* Pricing */}
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Стоимость услуг (₽/проект)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">От * (₽)</label>
                    <input
                      type="number"
                      value={form.priceFrom}
                      onChange={e => set('priceFrom', e.target.value)}
                      placeholder="5 000"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">До (₽)</label>
                    <input
                      type="number"
                      value={form.priceTo}
                      onChange={e => set('priceTo', e.target.value)}
                      placeholder="50 000"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {form.priceFrom && (
                  <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-sm text-green-400">
                    Ваши заказчики увидят: от {parseInt(form.priceFrom).toLocaleString('ru')} ₽
                    {form.priceTo ? ` до ${parseInt(form.priceTo).toLocaleString('ru')} ₽` : ''}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Portfolio ── */}
          {step === 3 && (
            <motion.div key="s3" {...slide} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1">Портфолио</h2>
                <p className="text-sm text-muted-foreground">Покажите ваши лучшие работы (необязательно)</p>
              </div>

              {/* Existing items */}
              {form.portfolio.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.portfolio.map((item, i) => (
                    <div key={i} className="relative rounded-xl border border-subtle overflow-hidden group bg-background">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-subtle flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-primary hover:underline truncate"
                            >
                              Открыть ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => set('portfolio', form.portfolio.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add item form */}
              <AnimatePresence>
                {showPortfolioAdd ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <p className="text-sm font-medium text-primary">Новая работа</p>
                      <input
                        value={portfolioForm.title}
                        onChange={e => setPortfolioForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Название проекта *"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <input
                        value={portfolioForm.imageUrl}
                        onChange={e => setPortfolioForm(p => ({ ...p, imageUrl: e.target.value }))}
                        placeholder="Ссылка на изображение (URL)"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <input
                        value={portfolioForm.category}
                        onChange={e => setPortfolioForm(p => ({ ...p, category: e.target.value }))}
                        placeholder="Категория (например: Лендинг, Мобильное приложение)"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <input
                        value={portfolioForm.url}
                        onChange={e => setPortfolioForm(p => ({ ...p, url: e.target.value }))}
                        placeholder="Ссылка на проект (необязательно)"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowPortfolioAdd(false); setPortfolioForm({ title: '', imageUrl: '', category: '', url: '' }) }}
                          className="flex-1 py-2.5 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={addPortfolioItem}
                          disabled={!portfolioForm.title.trim()}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowPortfolioAdd(true)}
                    disabled={form.portfolio.length >= 8}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/15 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {form.portfolio.length >= 8 ? 'Максимум 8 работ' : 'Добавить работу'}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              {form.portfolio.length === 0 && !showPortfolioAdd && (
                <p className="text-center text-xs text-muted-foreground">
                  Портфолио необязательно, но увеличивает шанс получить заказ в 3 раза
                </p>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === 4 && (
            <motion.div key="s4" {...slide} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Всё верно?</h2>
                <p className="text-sm text-muted-foreground">Проверьте данные перед публикацией профиля</p>
              </div>

              <div className="rounded-xl border border-subtle bg-background divide-y divide-white/6">
                {/* Personal */}
                <div className="p-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0">
                    {form.avatarPreview
                      ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                      : <User className="h-7 w-7 text-primary m-auto mt-3.5" />
                    }
                  </div>
                  <div>
                    <div className="font-semibold">{form.fullName || '—'}</div>
                    {form.location && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{form.location}</div>}
                    {form.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.bio}</p>}
                  </div>
                </div>

                {/* Specialization */}
                <div className="px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-1.5">Специализация</div>
                  <div className="font-medium text-sm">{form.title || '—'}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {form.category && (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{
                        background: `${CATEGORIES.find(c => c.slug === form.category)?.color}15`,
                        color: CATEGORIES.find(c => c.slug === form.category)?.color,
                      }}>
                        {CATEGORIES.find(c => c.slug === form.category)?.label}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-subtle text-muted-foreground">
                      {LEVELS.find(l => l.value === form.level)?.icon} {LEVELS.find(l => l.value === form.level)?.label}
                    </span>
                  </div>
                </div>

                {/* Skills & Price */}
                <div className="px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-2">Навыки ({form.skills.length})</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {form.skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                    ))}
                  </div>
                  {form.priceFrom && (
                    <div className="text-sm font-semibold text-green-400">
                      от {parseInt(form.priceFrom).toLocaleString('ru')} ₽
                      {form.priceTo ? ` — до ${parseInt(form.priceTo).toLocaleString('ru')} ₽` : ''}
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                {form.portfolio.length > 0 && (
                  <div className="px-4 py-3">
                    <div className="text-xs text-muted-foreground mb-1">Портфолио: {form.portfolio.length} работ</div>
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {form.portfolio.map((p, i) => (
                        <div key={i} className="h-14 w-20 rounded-lg bg-subtle flex-shrink-0 overflow-hidden border border-subtle">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  <p className="font-semibold mb-1">Ошибка сохранения</p>
                  <p className="text-xs opacity-80">{submitError}</p>
                  <p className="text-xs mt-2 opacity-60">Проверьте что вы авторизованы и повторите попытку</p>
                </div>
              )}

              {!user && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
                  Для сохранения профиля нужно{' '}
                  <a href="/auth/login" className="underline font-medium">войти в аккаунт</a>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 5: Success ── */}
          {step === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="h-24 w-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="h-12 w-12 text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Профиль готов! 🎉</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Ваш профиль опубликован. Теперь заказчики могут найти вас и предложить проект
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/orders')}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  Найти заказы
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors"
                >
                  Мой кабинет
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? 'Назад' : 'Пред.'}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Далее
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {submitting ? 'Сохраняю...' : 'Опубликовать профиль'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
