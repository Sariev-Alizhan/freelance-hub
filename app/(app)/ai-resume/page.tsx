'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, ChevronRight, ChevronLeft, Check,
  Briefcase, Clock, Star, Target, Lightbulb, Rocket,
  Loader2, RefreshCw, ArrowRight,
} from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

interface FormData {
  specialization: string
  experience: string
  projects: string
  achievements: string
  strengths: string
  goals: string
}

interface ResumeResult {
  bio: string
  title: string
  skills: string[]
  rateMin: number
  rateMax: number
  level: string
}

type StepKeyPrefix = 'rsSpec' | 'rsExp' | 'rsProj' | 'rsAch' | 'rsStr' | 'rsGoal'

const STEPS: { id: keyof FormData; icon: React.ElementType; keyPrefix: StepKeyPrefix; required: boolean }[] = [
  { id: 'specialization', icon: Briefcase,  keyPrefix: 'rsSpec', required: true  },
  { id: 'experience',     icon: Clock,      keyPrefix: 'rsExp',  required: true  },
  { id: 'projects',       icon: Star,       keyPrefix: 'rsProj', required: false },
  { id: 'achievements',   icon: Target,     keyPrefix: 'rsAch',  required: false },
  { id: 'strengths',      icon: Lightbulb,  keyPrefix: 'rsStr',  required: false },
  { id: 'goals',          icon: Rocket,     keyPrefix: 'rsGoal', required: false },
]

const LEVEL_COLORS: Record<string, string> = {
  new: '#8a8f98',
  junior: '#5e6ad2',
  middle: '#0ea5e9',
  senior: '#22c55e',
  top: '#f59e0b',
}

export default function AIResumePage() {
  const router = useRouter()
  const { t } = useLang()
  const td = t.aiPage
  const LEVEL_LABELS: Record<string, string> = {
    new:    td.lvlNew,
    junior: td.lvlJunior,
    middle: td.lvlMiddle,
    senior: td.lvlSenior,
    top:    td.lvlTop,
  }
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    specialization: '',
    experience: '',
    projects: '',
    achievements: '',
    strengths: '',
    goals: '',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<ResumeResult | null>(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const currentStep = STEPS[step]
  const progress = ((step) / STEPS.length) * 100
  const value = form[currentStep.id]
  const canProceed = !currentStep.required || value.trim().length > 0
  const stepLabel:       string = td[`${currentStep.keyPrefix}Label` as const]
  const stepQuestion:    string = td[`${currentStep.keyPrefix}Q`     as const]
  const stepPlaceholder: string = td[`${currentStep.keyPrefix}Ph`    as const]
  const stepHint:        string = td[`${currentStep.keyPrefix}Hint`  as const]

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      generate()
    }
  }

  async function generate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/ai/resume-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.result) throw new Error(data.error || td.resumeErrGenFailed)
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : td.resumeErrGeneric)
    } finally {
      setGenerating(false)
    }
  }

  async function applyToProfile() {
    if (!result) return
    setApplying(true)
    try {
      await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: result.bio,
          title: result.title,
          skills: result.skills,
          priceFrom: result.rateMin,
          priceTo: result.rateMax,
          level: result.level,
        }),
      })
      setApplied(true)
      setTimeout(() => router.push('/dashboard'), 1800)
    } catch {
      setError(td.resumeErrApply)
    } finally {
      setApplying(false)
    }
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-[calc(100vh-52px)] py-14 px-4" style={{ background: 'var(--fh-canvas)' }}>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center rounded-xl mb-5"
              style={{ width: '52px', height: '52px', background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.2)' }}
            >
              <Sparkles className="h-6 w-6" style={{ color: '#7170ff' }} />
            </div>
            <h1 style={{ fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 510, letterSpacing: '-0.04em', color: 'var(--fh-t1)', marginBottom: '6px' }}>
              {td.resumeResultTitle}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fh-t3)' }}>
              {td.resumeResultSub}
            </p>
          </div>

          {/* Result card */}
          <div style={{
            background: 'var(--fh-surface)',
            border: '1px solid var(--fh-border)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '16px',
          }}>
            {/* Title + Level */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 590, letterSpacing: '-0.03em', color: 'var(--fh-t1)' }}>
                {result.title}
              </h2>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
                background: `${LEVEL_COLORS[result.level]}18`,
                color: LEVEL_COLORS[result.level],
                border: `1px solid ${LEVEL_COLORS[result.level]}30`,
                letterSpacing: '0.03em',
              }}>
                {LEVEL_LABELS[result.level] || result.level}
              </span>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {td.resumeBioLabel}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--fh-t2)', lineHeight: 1.65 }}>
                {result.bio}
              </p>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {td.resumeSkillsLabel}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
                      background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.18)',
                      color: '#7170ff', fontWeight: 510,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Rate */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {td.resumeRateLabel}
              </p>
              <p style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                ${result.rateMin}–${result.rateMax}
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fh-t4)', marginLeft: '4px' }}>{td.resumePerHour}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={applyToProfile}
              disabled={applying || applied}
              style={{
                flex: 1, minWidth: '180px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                padding: '12px 20px', borderRadius: '8px',
                background: applied ? 'rgba(39,166,68,0.1)' : '#5e6ad2',
                border: applied ? '1px solid rgba(39,166,68,0.25)' : '1px solid transparent',
                color: applied ? '#27a644' : '#fff',
                fontSize: '14px', fontWeight: 510, cursor: applying || applied ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {applying
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {td.resumeApplying}</>
                : applied
                ? <><Check className="h-4 w-4" /> {td.resumeApplied}</>
                : <><ArrowRight className="h-4 w-4" /> {td.resumeApplyBtn}</>
              }
            </button>

            <button
              onClick={() => { setResult(null); setStep(0); setApplied(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 18px', borderRadius: '8px',
                background: 'transparent', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t3)', fontSize: '14px', fontWeight: 510, cursor: 'pointer',
              }}
            >
              <RefreshCw className="h-4 w-4" /> {td.resumeRegenBtn}
            </button>
          </div>

          {error && (
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#e5484d' }}>{error}</p>
          )}
        </div>
      </div>
    )
  }

  // Generating screen
  if (generating) {
    return (
      <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4" style={{ background: 'var(--fh-canvas)' }}>
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-6"
            style={{ width: '64px', height: '64px', background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.2)' }}
          >
            <Sparkles className="h-7 w-7 animate-pulse" style={{ color: '#7170ff' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            {td.resumeBuildTitle}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)' }}>
            {td.resumeBuildSub}
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#7170ff',
                  animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
        </div>
      </div>
    )
  }

  // Questionnaire screen
  const StepIcon = currentStep.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-[calc(100vh-52px)] py-14 px-4" style={{ background: 'var(--fh-canvas)' }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center rounded-xl mb-5"
            style={{ width: '52px', height: '52px', background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.2)' }}
          >
            <Sparkles className="h-6 w-6" style={{ color: '#7170ff' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3.5vw,28px)', fontWeight: 510, letterSpacing: '-0.04em', color: 'var(--fh-t1)', marginBottom: '6px' }}>
            {td.resumeTitle}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)' }}>
            {td.resumeSubtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
              {td.resumeStepPrefix} {step + 1} {td.resumeStepOf} {STEPS.length}
            </span>
            <span style={{ fontSize: '12px', color: '#7170ff', fontWeight: 590 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--fh-border)' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #5e6ad2, #7170ff)',
              width: `${progress}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'center' }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                style={{
                  width: i === step ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i < step ? '#27a644' : i === step ? '#7170ff' : 'var(--fh-border)',
                  border: 'none',
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'var(--fh-surface)',
          border: '1px solid var(--fh-border)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <StepIcon className="h-4 w-4" style={{ color: '#7170ff' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                {stepLabel}
                {!currentStep.required && <span style={{ marginLeft: '6px', color: 'var(--fh-t4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{td.resumeOptional}</span>}
              </p>
              <p style={{ fontSize: '16px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {stepQuestion}
              </p>
            </div>
          </div>

          <textarea
            value={value}
            onChange={e => setForm(f => ({ ...f, [currentStep.id]: e.target.value }))}
            placeholder={stepPlaceholder}
            rows={4}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canProceed) handleNext()
            }}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: '10px',
              background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t1)', fontSize: '14px', lineHeight: 1.6,
              resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.4)' }}
            onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
          />

          <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--fh-t4)', lineHeight: 1.5 }}>
            {stepHint}
          </p>
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#e5484d', marginBottom: '12px' }}>{error}</p>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 18px', borderRadius: '8px',
                background: 'transparent', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t3)', fontSize: '14px', fontWeight: 510, cursor: 'pointer',
              }}
            >
              <ChevronLeft className="h-4 w-4" /> {td.resumeBack}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '12px 20px', borderRadius: '8px',
              background: canProceed ? '#5e6ad2' : 'var(--fh-surface-2)',
              border: canProceed ? '1px solid transparent' : '1px solid var(--fh-border)',
              color: canProceed ? '#fff' : 'var(--fh-t4)',
              fontSize: '14px', fontWeight: 510,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {isLast
              ? <><Sparkles className="h-4 w-4" /> {td.resumeGenBtn}</>
              : <>{td.resumeNext} <ChevronRight className="h-4 w-4" /></>
            }
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--fh-t4)' }}>
          {td.resumeTipPrefix} <kbd style={{ padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--fh-border)', fontSize: '11px' }}>⌘ Enter</kbd> {td.resumeTipSuffix}
        </p>
      </div>
    </div>
  )
}
