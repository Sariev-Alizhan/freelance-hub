'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/context/LanguageContext'
import OAuthButton, { type OAuthProvider } from '@/components/auth/OAuthButton'
import { track } from '@vercel/analytics'
import { posthog } from '@/components/providers/PostHogProvider'

type Provider = OAuthProvider

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { t } = useLang()
  const tl = t.loginPage
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  async function signIn(provider: Provider) {
    setAuthError(null)
    setLoading(provider)
    track('auth_attempt', { provider, flow: 'login' })
    posthog.capture?.('auth_attempt', { provider, flow: 'login' })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setAuthError(error.message)
      setLoading(null)
    }
    // On success Supabase calls window.location.assign → browser navigates away
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setAuthError(null)
    setLoading('email')
    track('auth_attempt', { provider: 'email', flow: 'login' })
    posthog.capture?.('auth_attempt', { provider: 'email', flow: 'login' })
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(null)
    if (error) { setAuthError(error.message) }
    else {
      setSent(true)
      track('auth_otp_sent', { email_domain: email.trim().split('@')[1] })
      posthog.capture?.('auth_otp_sent', { email_domain: email.trim().split('@')[1] })
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
            {tl.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '6px' }}>
            {tl.noAccount}{' '}
            <Link href="/auth/register" style={{ color: '#7170ff', fontWeight: 510 }}>
              {tl.signUpLink}
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
          gap: '10px',
        }}>

          {/* Error banner */}
          {authError && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '13px',
              color: '#ef4444',
              lineHeight: 1.4,
            }}>
              {authError}
            </div>
          )}

          {/* Google — primary (full width) */}
          <OAuthButton provider="google" label={tl.continueGoogle} loading={loading} onClick={signIn} />

          {/* GitHub + Apple — 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <OAuthButton provider="github" label="GitHub" loading={loading} onClick={signIn} />
            <OAuthButton provider="apple"  label="Apple"  loading={loading} onClick={signIn} />
          </div>

          {/* Discord — full width */}
          <OAuthButton provider="discord" label={tl.continueDiscord} loading={loading} onClick={signIn} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '2px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--fh-sep)' }} />
            <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 500, letterSpacing: '0.04em' }}>{tl.or}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--fh-sep)' }} />
          </div>

          {/* Email magic link */}
          {sent ? (
            <div style={{
              borderRadius: '9px',
              padding: '14px',
              textAlign: 'center',
              background: 'rgba(39,166,68,0.06)',
              border: '1px solid rgba(39,166,68,0.2)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#27a644', margin: '0 0 4px' }}>
                {tl.checkEmail}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', margin: 0 }}>
                {tl.linkSentTo} <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={signInWithEmail} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  padding: '11px 13px',
                  borderRadius: '8px',
                  background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  minHeight: '44px',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(113,112,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--fh-border-2)' }}
              />
              <button
                type="submit"
                disabled={loading !== null || !email.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: 'rgba(113,112,255,0.12)',
                  color: '#7170ff',
                  border: '1px solid rgba(113,112,255,0.25)',
                  fontSize: '14px',
                  fontWeight: 510,
                  minHeight: '44px',
                  cursor: loading !== null || !email.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading !== null || !email.trim() ? 0.5 : 1,
                  transition: 'opacity 0.15s, filter 0.15s',
                  width: '100%',
                }}
              >
                {loading === 'email' ? (
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                )}
                {tl.sendEmailLink}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--fh-t3)' }}>
          {tl.termsPrefix}{' '}
          <Link href="/terms" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>{tl.termsLink}</Link>
          {' '}{tl.termsAnd}{' '}
          <Link href="/privacy" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>{tl.privacyLink}</Link>
        </p>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
