'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield, ShieldCheck, ShieldOff, Copy, CheckCircle,
  AlertCircle, Loader2, Lock, Smartphone, ArrowLeft,
  Key, Eye, EyeOff,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/context/LanguageContext'

type SetupState = 'idle' | 'loading' | 'scan' | 'verify' | 'done' | 'error'

// ── 2FA section ───────────────────────────────────────────────────────────
function TwoFactorSection() {
  const [state, setState]           = useState<SetupState>('idle')
  const [secret, setSecret]         = useState('')
  const [qrDataUrl, setQrDataUrl]   = useState('')
  const [token, setToken]           = useState('')
  const [errorMsg, setErrorMsg]     = useState('')
  const [enabled, setEnabled]       = useState<boolean | null>(null)
  const [copied, setCopied]         = useState(false)
  const [disabling, setDisabling]   = useState(false)
  const { t } = useLang()
  const td = t.settingsPage

  // Load current status
  useEffect(() => {
    fetch('/api/profile/2fa/status')
      .then(r => r.json())
      .then(d => setEnabled(!!d.enabled))
      .catch(() => setEnabled(false))
  }, [])

  async function startSetup() {
    setState('loading')
    setErrorMsg('')
    const res = await fetch('/api/profile/2fa/setup')
    if (!res.ok) { setState('error'); setErrorMsg(td.errQrGen); return }
    const data = await res.json()
    setSecret(data.secret)
    setQrDataUrl(data.qrDataUrl)
    setState('scan')
  }

  async function verifyAndSave() {
    if (token.length !== 6) { setErrorMsg(td.errEnterCode); return }
    setState('loading')
    setErrorMsg('')
    const res = await fetch('/api/profile/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, token }),
    })
    const data = await res.json()
    if (!res.ok) { setState('scan'); setErrorMsg(data.error ?? td.errInvalid); return }
    setState('done')
    setEnabled(true)
  }

  async function disable2FA() {
    if (!confirm(td.disableConfirm)) return
    setDisabling(true)
    const res = await fetch('/api/profile/2fa/setup', { method: 'DELETE' })
    setDisabling(false)
    if (res.ok) { setEnabled(false); setState('idle') }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(113,112,255,0.1)' }}>
          <Smartphone className="h-5 w-5" style={{ color: '#7170ff' }} />
        </div>
        <div>
          <h2 className="font-semibold text-sm">{td.twoFaTitle}</h2>
          <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>
            {td.twoFaSub}
          </p>
        </div>
      </div>

      {/* Status banner */}
      {enabled !== null && (
        <div className={`rounded-xl border p-3.5 mb-5 flex items-center gap-3 ${
          enabled
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        }`}>
          {enabled
            ? <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
            : <ShieldOff   className="h-5 w-5 text-amber-400 flex-shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${enabled ? 'text-green-400' : 'text-amber-400'}`}>
              {enabled ? td.twoFaOn : td.twoFaOff}
            </p>
            <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>
              {enabled ? td.twoFaOnDesc : td.twoFaOffDesc}
            </p>
          </div>
        </div>
      )}

      {/* ── Idle / not configured ── */}
      {state === 'idle' && !enabled && (
        <button
          onClick={startSetup}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors"
          style={{ background: '#7170ff' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#8280ff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#7170ff' }}
        >
          {td.setupBtn}
        </button>
      )}

      {/* ── Loading ── */}
      {state === 'loading' && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* ── Scan QR ── */}
      {state === 'scan' && (
        <div className="space-y-5">
          <div className="rounded-xl border p-5 text-center"
            style={{ background: 'var(--fh-surface-2)', borderColor: 'var(--fh-border)' }}>
            <p className="text-sm font-medium mb-1">{td.step1Title}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--fh-t4)' }}>
              {td.step1Sub}
            </p>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <Image
                  src={qrDataUrl}
                  alt={td.twoFaTitle}
                  width={180}
                  height={180}
                  className="rounded-xl"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs mb-2" style={{ color: 'var(--fh-t4)' }}>
              {td.orEnterKey}
            </p>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <code className="text-xs font-mono flex-1 tracking-wider break-all" style={{ color: 'var(--fh-t2)' }}>
                {secret}
              </code>
              <button
                onClick={copySecret}
                className="flex-shrink-0 transition-colors"
                style={{ color: 'var(--fh-t4)' }}
                aria-label={td.copyKeyAria}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
              >
                {copied
                  ? <CheckCircle className="h-4 w-4 text-green-400" />
                  : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              {td.step2Label}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setErrorMsg('') }}
              autoFocus
              placeholder={td.codePlaceholder}
              className="w-full px-4 py-3 rounded-xl border bg-surface text-center text-2xl font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ borderColor: 'var(--fh-border)' }}
            />
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}
            <button
              onClick={verifyAndSave}
              disabled={token.length !== 6}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#7170ff' }}
              onMouseEnter={e => { if (token.length === 6) e.currentTarget.style.background = '#8280ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#7170ff' }}
            >
              {td.confirmBtn}
            </button>
            <button
              onClick={() => { setState('idle'); setToken(''); setErrorMsg('') }}
              className="w-full py-2.5 rounded-xl border text-sm transition-colors"
              style={{ borderColor: 'var(--fh-border)', color: 'var(--fh-t3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {td.cancelBtn}
            </button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {state === 'done' && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center space-y-3">
          <ShieldCheck className="h-12 w-12 text-green-400 mx-auto" />
          <div>
            <p className="font-semibold text-green-400 text-base">{td.doneTitle}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--fh-t4)' }}>
              {td.doneDesc}
            </p>
          </div>
          <button
            onClick={() => setState('idle')}
            className="text-xs px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--fh-border)', color: 'var(--fh-t3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {td.doneBtn}
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* ── Enabled — manage ── */}
      {enabled && state === 'idle' && (
        <div className="space-y-3 mt-2">
          <button
            onClick={startSetup}
            className="w-full py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--fh-border)', color: 'var(--fh-t2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {td.reconnectBtn}
          </button>
          <button
            onClick={disable2FA}
            disabled={disabling}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {disabling ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : td.disableBtn}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Password change section ───────────────────────────────────────────────
function PasswordSection() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const { t } = useLang()
  const td = t.settingsPage

  async function changePassword() {
    if (!newPw || newPw.length < 8) { setMsg({ type: 'err', text: td.pwTooShort }); return }
    if (newPw !== confirmPw) { setMsg({ type: 'err', text: td.pwMismatch }); return }
    setSaving(true)
    setMsg(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setMsg({ type: 'ok', text: td.pwChanged })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e: unknown) {
      const err = e as { message?: string }
      setMsg({ type: 'err', text: err.message ?? td.pwError })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.1)' }}>
          <Key className="h-5 w-5" style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h2 className="font-semibold text-sm">{td.pwTitle}</h2>
          <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>
            {td.pwSub}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: td.pwNewLabel, value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(v => !v) },
          { label: td.pwConfirmLabel, value: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew(v => !v) },
        ].map(({ label, value, set, show, toggle }) => (
          <div key={label}>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--fh-t3)' }}>{label}</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={e => set(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ background: 'var(--fh-surface-2)', borderColor: 'var(--fh-border)', color: 'var(--fh-t1)' }}
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--fh-t4)' }}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}

        {msg && (
          <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
            msg.type === 'ok'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {msg.type === 'ok'
              ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
              : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
            {msg.text}
          </div>
        )}

        <button
          onClick={changePassword}
          disabled={saving || !newPw || !confirmPw}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ background: '#22c55e' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : td.changePwBtn}
        </button>
        <p className="text-[11px]" style={{ color: 'var(--fh-t4)' }}>
          {td.pwNote}
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function SecuritySettingsPage() {
  const { user, loading } = useUser()
  const { t } = useLang()
  const td = t.settingsPage

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <Lock className="h-12 w-12 text-muted-foreground/30" />
        <p className="font-medium">{td.signinHint}</p>
        <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
          {td.signinBtn}
        </Link>
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--narrow">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'var(--fh-t4)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {td.secBackOps}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(113,112,255,0.1)' }}>
          <Shield className="h-6 w-6" style={{ color: '#7170ff' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold">{td.secPageTitle}</h1>
          <p className="text-sm" style={{ color: 'var(--fh-t4)' }}>
            {td.secPageSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <TwoFactorSection />
        <PasswordSection />

        {/* Info block */}
        <div className="rounded-xl p-4 flex gap-3"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
          <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--fh-t4)' }} />
          <div className="text-xs" style={{ color: 'var(--fh-t4)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--fh-t3)' }}>{td.infoRec}</strong>{' '}
            {td.infoText} <strong style={{ color: 'var(--fh-t3)' }}>Google Authenticator</strong>,{' '}
            <strong style={{ color: 'var(--fh-t3)' }}>Authy</strong>{' / '}
            <strong style={{ color: 'var(--fh-t3)' }}>1Password</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
