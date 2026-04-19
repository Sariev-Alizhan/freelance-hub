'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, Code2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/context/LanguageContext'
import { UserRole } from '@/lib/supabase/types'
import OAuthButton, { type OAuthProvider } from '@/components/auth/OAuthButton'
import { track } from '@vercel/analytics'

type Provider = OAuthProvider

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const { t } = useLang()
  const tr = t.registerPage
  const [loading, setLoading]     = useState<string | null>(null)
  const [role, setRole]           = useState<UserRole>('client')
  const [authError, setAuthError] = useState<string | null>(null)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const supabase = createClient()

  async function signUp(provider: Provider) {
    if (!ageConfirmed) {
      setAuthError(tr.mustBe18)
      return
    }
    setAuthError(null)
    setLoading(provider)
    track('signup_attempt', { provider, role })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setAuthError(error.message)
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px 48px',
      background: 'var(--fh-canvas)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '14px' }}>
            <Logo size={40} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--fh-t1)', margin: 0 }}>
            {tr.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '6px' }}>
            {tr.hasAccount}{' '}
            <Link href="/auth/login" style={{ color: '#7170ff', fontWeight: 510 }}>
              {tr.signInLink}
            </Link>
          </p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: '14px',
          padding: '20px',
          background: 'var(--fh-surface)',
          border: '1px solid var(--fh-border-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>

          {/* Error */}
          {authError && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '13px', color: '#ef4444', lineHeight: 1.4,
            }}>
              {authError}
            </div>
          )}

          {/* Role selector */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fh-t3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tr.iRegisterAs}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {([
                { value: 'client' as UserRole, Icon: Briefcase, label: tr.roleClient, sub: tr.roleClientSub },
                { value: 'freelancer' as UserRole, Icon: Code2,     label: tr.roleFreelancer, sub: tr.roleFreelancerSub },
              ]).map(({ value, Icon, label, sub }) => {
                const active = role === value
                return (
                  <button key={value} onClick={() => setRole(value)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '14px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: active ? 'rgba(113,112,255,0.45)' : 'var(--fh-border)',
                    background: active ? 'rgba(113,112,255,0.09)' : 'var(--fh-surface-2)',
                    transition: 'all 0.15s',
                  }}>
                    <Icon size={16} style={{ color: active ? '#7170ff' : 'var(--fh-t4)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--fh-t1)' : 'var(--fh-t3)' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 18+ age gate */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: ageConfirmed ? 'rgba(113,112,255,0.08)' : 'var(--fh-surface-2)',
            border: ageConfirmed ? '1px solid rgba(113,112,255,0.35)' : '1px solid var(--fh-border)',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={e => setAgeConfirmed(e.target.checked)}
              style={{
                marginTop: '2px',
                width: '16px', height: '16px',
                accentColor: '#7170ff',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--fh-t2)', lineHeight: 1.5 }}>
              {tr.age18} <strong style={{ color: 'var(--fh-t1)' }}>{tr.age18Bold}</strong>{tr.age18Suffix}
            </span>
          </label>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--fh-sep)' }} />
            <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 500, letterSpacing: '0.04em' }}>{tr.signUpVia}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--fh-sep)' }} />
          </div>

          {/* OAuth buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: ageConfirmed ? 1 : 0.5, pointerEvents: ageConfirmed ? 'auto' : 'none' }}>
            <OAuthButton provider="google" label={t.loginPage.continueGoogle} loading={loading} onClick={signUp} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <OAuthButton provider="github" label="GitHub" loading={loading} onClick={signUp} />
              <OAuthButton provider="apple"  label="Apple"  loading={loading} onClick={signUp} />
            </div>

            <OAuthButton provider="discord" label={t.loginPage.continueDiscord} loading={loading} onClick={signUp} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--fh-t3)', margin: 0 }}>
            {tr.commissionLabel} <span style={{ color: '#27a644', fontWeight: 600 }}>{tr.commissionValue}</span> {tr.commissionSuffix}
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--fh-t3)' }}>
          {tr.termsPrefix}{' '}
          <Link href="/terms" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>{tr.termsLink}</Link>
          {' '}{tr.termsAnd}{' '}
          <Link href="/privacy" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>{tr.privacyLink}</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
