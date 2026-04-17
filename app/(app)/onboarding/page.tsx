'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase, Code2, User, MapPin, Sparkles,
  ArrowRight, CheckCircle, Loader2,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

type Role = 'client' | 'freelancer'

const STEPS_CLIENT   = ['role', 'name', 'done'] as const
const STEPS_FREELANCER = ['role', 'name', 'goal', 'done'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole]       = useState<Role>('client')
  const [step, setStep]       = useState(0)
  const [name, setName]       = useState('')
  const [location, setLocation] = useState('')
  const [goal, setGoal]       = useState('')
  const [saving, setSaving]   = useState(false)

  const steps = role === 'freelancer' ? STEPS_FREELANCER : STEPS_CLIENT
  const currentStep = steps[step]

  async function finish() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      await fetch('/api/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, fullName: name.trim(), location: location.trim() || null }),
      })

      router.push('/feed?onboarding=1')
    } finally {
      setSaving(false)
    }
  }

  function next() {
    if (step < steps.length - 1) setStep(s => s + 1)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--fh-canvas)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={36} />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className="transition-all"
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i <= step ? '#7170ff' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
        >
          {/* Step: role */}
          {currentStep === 'role' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                Welcome to FreelanceHub
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--fh-t4)', marginBottom: '24px' }}>
                How are you planning to use the platform?
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {([
                  { value: 'client' as Role, icon: Briefcase, label: 'I need talent', sub: 'Post orders, hire freelancers' },
                  { value: 'freelancer' as Role, icon: Code2, label: 'I am a freelancer', sub: 'Find work, get paid' },
                ]).map(({ value, icon: Icon, label, sub }) => {
                  const active = role === value
                  return (
                    <button
                      key={value}
                      onClick={() => setRole(value)}
                      className="flex flex-col gap-2 p-4 rounded-xl transition-all text-left"
                      style={{
                        border: active ? '1.5px solid rgba(113,112,255,0.5)' : '1px solid var(--fh-border)',
                        background: active ? 'rgba(113,112,255,0.08)' : 'var(--fh-surface-2)',
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: active ? '#7170ff' : 'var(--fh-t4)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 650, color: active ? 'var(--fh-t1)' : 'var(--fh-t2)', letterSpacing: '-0.01em' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 400 }}>{sub}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={next}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{ padding: '11px', borderRadius: '8px', background: '#5e6ad2', color: '#fff', fontSize: '14px', fontWeight: 590, letterSpacing: '-0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step: name */}
          {currentStep === 'name' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                How should we call you?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginBottom: '20px' }}>
                This will appear on your public profile.
              </p>
              <div className="space-y-3 mb-6">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--fh-t4)' }} />
                  <input
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && name.trim().length >= 2) next() }}
                    placeholder="Your full name"
                    style={{
                      width: '100%',
                      paddingLeft: '36px',
                      paddingRight: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      borderRadius: '8px',
                      background: 'var(--fh-surface-2)',
                      border: '1px solid var(--fh-border)',
                      color: 'var(--fh-t1)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(113,112,255,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--fh-border)' }}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--fh-t4)' }} />
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && name.trim().length >= 2) next() }}
                    placeholder="City (optional)"
                    style={{
                      width: '100%',
                      paddingLeft: '36px',
                      paddingRight: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      borderRadius: '8px',
                      background: 'var(--fh-surface-2)',
                      border: '1px solid var(--fh-border)',
                      color: 'var(--fh-t1)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(113,112,255,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--fh-border)' }}
                  />
                </div>
              </div>
              <button
                onClick={next}
                disabled={name.trim().length < 2}
                className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ padding: '11px', borderRadius: '8px', background: '#5e6ad2', color: '#fff', fontSize: '14px', fontWeight: 590, letterSpacing: '-0.01em' }}
                onMouseEnter={e => { if (name.trim().length >= 2) e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step: goal (freelancer only) */}
          {currentStep === 'goal' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                What are you looking to do?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginBottom: '20px' }}>
                This helps us recommend the right orders for you.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  'Find freelance projects part-time',
                  'Work as a full-time freelancer',
                  'Build a portfolio and gain experience',
                  'Run a small agency / team',
                ].map(option => (
                  <button
                    key={option}
                    onClick={() => setGoal(option)}
                    className="w-full text-left p-3 rounded-lg transition-all flex items-center gap-3"
                    style={{
                      border: goal === option ? '1.5px solid rgba(113,112,255,0.5)' : '1px solid var(--fh-border)',
                      background: goal === option ? 'rgba(113,112,255,0.06)' : 'var(--fh-surface-2)',
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: goal === option ? '#7170ff' : 'var(--fh-border)',
                        background: goal === option ? '#7170ff' : 'transparent',
                      }}
                    >
                      {goal === option && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span style={{ fontSize: '13px', color: goal === option ? 'var(--fh-t1)' : 'var(--fh-t3)', fontWeight: goal === option ? 510 : 400 }}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={next}
                disabled={!goal}
                className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ padding: '11px', borderRadius: '8px', background: '#5e6ad2', color: '#fff', fontSize: '14px', fontWeight: 590, letterSpacing: '-0.01em' }}
                onMouseEnter={e => { if (goal) e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step: done */}
          {currentStep === 'done' && (
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(113,112,255,0.1)', border: '2px solid rgba(113,112,255,0.3)' }}
                >
                  <Sparkles className="h-7 w-7" style={{ color: '#7170ff' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                You're all set, {name.split(' ')[0]}!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--fh-t4)', lineHeight: 1.65, marginBottom: '24px' }}>
                {role === 'freelancer'
                  ? 'Your profile is ready. Complete it to get discovered faster and unlock AI-powered job matching.'
                  : 'Your account is ready. Post your first order and get proposals from vetted freelancers.'}
              </p>

              {/* Next steps preview */}
              <div className="space-y-2.5 text-left mb-6">
                {(role === 'freelancer'
                  ? [
                      'Complete your freelancer profile',
                      'Try the AI Resume Builder',
                      'Browse open orders',
                    ]
                  : [
                      'Post your first order',
                      'Browse freelancer profiles',
                      'Use AI Smart Search to find talent',
                    ]
                ).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#27a644' }} />
                    <span style={{ fontSize: '13px', color: 'var(--fh-t3)', fontWeight: 400 }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={finish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ padding: '11px', borderRadius: '8px', background: '#5e6ad2', color: '#fff', fontSize: '14px', fontWeight: 590, letterSpacing: '-0.01em' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {role === 'freelancer' ? 'Go to Dashboard' : 'Start Hiring'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-5" style={{ fontSize: '12px', color: 'var(--fh-t2)' }}>
          You can always update these settings in your profile
        </p>
      </div>
    </div>
  )
}
