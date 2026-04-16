'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

type Provider = 'google' | 'github' | 'apple' | 'discord' | 'twitter'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)
const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)
const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.33.07 2.26.72 3.02.76 1.15-.23 2.25-.9 3.48-.77 1.47.17 2.57.82 3.28 2.03-2.99 1.8-2.28 5.75.52 6.86-.61 1.64-1.42 3.26-2.3 4zm-3.27-16.1c.06 1.97-1.44 3.6-3.25 3.47-.24-1.85 1.32-3.63 3.25-3.47z"/>
  </svg>
)
const DiscordIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

function OAuthButton({
  provider, label, icon, bg, color = '#ffffff', border, full = false,
  loading, onClick,
}: {
  provider: Provider; label: string; icon: React.ReactNode
  bg: string; color?: string; border?: string; full?: boolean
  loading: string | null; onClick: (p: Provider) => void
}) {
  const isLoading = loading === provider
  return (
    <button
      onClick={() => onClick(provider)}
      disabled={loading !== null}
      className={`${full ? 'w-full' : ''} flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 hover:brightness-110 active:scale-[0.98]`}
      style={{
        padding: full ? '10px 16px' : '9px 12px',
        borderRadius: '8px',
        background: bg,
        color,
        border: border ?? '1px solid rgba(255,255,255,0.1)',
        fontSize: full ? '14px' : '13px',
        fontWeight: 510,
        letterSpacing: '-0.01em',
      }}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  )
}

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  async function signIn(provider: Provider) {
    setAuthError(null)
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      console.error(error)
      setAuthError(error.message)
      setLoading(null)
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setAuthError(null)
    setLoading('email')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(null)
    if (!error) setSent(true)
  }

  return (
    <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-12" style={{ background: 'var(--fh-canvas)' }}>
      <div className="w-full max-w-sm">

        {/* Logo + heading */}
        <div className="text-center mb-7">
          <div className="inline-flex justify-center mb-4"><Logo size={40} /></div>
          <h1 style={{ fontSize: '22px', fontWeight: 510, letterSpacing: '-0.03em', color: 'var(--fh-t1)', marginBottom: '6px' }}>
            Sign In
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
            No account?{' '}
            <Link href="/auth/register" style={{ color: '#7170ff', fontWeight: 510 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#928fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7170ff' }}>
              Register free
            </Link>
          </p>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>

          {authError && (
            <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p style={{ fontSize: '13px', color: '#ef4444' }}>{authError}</p>
            </div>
          )}

          {/* Google — primary */}
          <OAuthButton provider="google" label="Continue with Google" icon={<GoogleIcon />}
            bg="#ffffff" color="#1f1f1f" border="1px solid #dadce0" full
            loading={loading} onClick={signIn} />

          {/* GitHub + Apple */}
          <div className="grid grid-cols-2 gap-2">
            <OAuthButton provider="github"  label="GitHub" icon={<GitHubIcon />} bg="#24292e" loading={loading} onClick={signIn} />
            <OAuthButton provider="apple"   label="Apple"  icon={<AppleIcon />}  bg="#000000" loading={loading} onClick={signIn} />
          </div>

          {/* Discord + X */}
          <div className="grid grid-cols-2 gap-2">
            <OAuthButton provider="discord" label="Discord" icon={<DiscordIcon />} bg="#5865F2" loading={loading} onClick={signIn} />
            <OAuthButton provider="twitter" label="Twitter" icon={<XIcon />} bg="#000000" loading={loading} onClick={signIn} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ paddingTop: '2px', paddingBottom: '2px' }}>
            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
            <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 500, letterSpacing: '0.02em' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
          </div>

          {/* Email magic link */}
          {sent ? (
            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.2)' }}>
              <p style={{ fontSize: '14px', fontWeight: 590, color: '#27a644', marginBottom: '4px' }}>Check your inbox</p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>Magic link sent to <strong>{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={signInWithEmail} className="space-y-2">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full outline-none transition-all"
                style={{ padding: '9px 13px', borderRadius: '7px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)', fontSize: '14px' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
              />
              <button type="submit" disabled={loading !== null || !email.trim()}
                className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:brightness-110"
                style={{ padding: '9px 16px', borderRadius: '7px', background: 'rgba(113,112,255,0.12)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.25)', fontSize: '13px', fontWeight: 510 }}>
                {loading === 'email' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                )}
                Send magic link
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-4" style={{ fontSize: '11px', color: 'var(--fh-t3)' }}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
