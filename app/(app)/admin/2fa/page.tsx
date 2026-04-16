'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type SetupState = 'idle' | 'loading' | 'scan' | 'verify' | 'done' | 'error'

export default function AdminTwoFactorPage() {
  const [state, setState]           = useState<SetupState>('idle')
  const [secret, setSecret]         = useState('')
  const [qrDataUrl, setQrDataUrl]   = useState('')
  const [otpauth, setOtpauth]       = useState('')
  const [token, setToken]           = useState('')
  const [errorMsg, setErrorMsg]     = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null)
  const [copied, setCopied]         = useState(false)

  // Check if 2FA is currently configured
  useEffect(() => {
    fetch('/api/admin/2fa/verify', { method: 'POST', body: JSON.stringify({ token: '000000' }), headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(d => {
        // If error is "Invalid token" it means 2FA IS configured; configured:false means it's not
        setIs2FAEnabled(d.error === 'Invalid token' || d.configured === true)
      })
      .catch(() => setIs2FAEnabled(false))
  }, [])

  async function startSetup() {
    setState('loading')
    setErrorMsg('')
    const res = await fetch('/api/admin/2fa/setup')
    if (!res.ok) { setState('error'); setErrorMsg('Failed to generate QR code'); return }
    const data = await res.json()
    setSecret(data.secret)
    setQrDataUrl(data.qrDataUrl)
    setOtpauth(data.otpauth)
    setState('scan')
  }

  async function verifyAndSave() {
    if (token.length !== 6) { setErrorMsg('Enter a 6-digit code'); return }
    setState('loading')
    setErrorMsg('')
    const res = await fetch('/api/admin/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, token }),
    })
    const data = await res.json()
    if (!res.ok) { setState('scan'); setErrorMsg(data.error ?? 'Invalid code, try again'); return }
    setState('done')
    setIs2FAEnabled(true)
  }

  async function disable2FA() {
    if (!confirm('Disable 2FA? Your admin account will be less secure.')) return
    const res = await fetch('/api/admin/2fa/verify', { method: 'DELETE' })
    if (res.ok) setIs2FAEnabled(false)
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-shell page-shell--narrow">

      {/* Back link */}
      <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-8">
        ← Admin dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">TOTP via Google Authenticator / Authy</p>
        </div>
      </div>

      {/* Status banner */}
      {is2FAEnabled !== null && (
        <div className={`rounded-xl border p-4 mb-6 flex items-center gap-3 ${
          is2FAEnabled
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        }`}>
          {is2FAEnabled
            ? <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
            : <ShieldOff  className="h-5 w-5 text-amber-400 flex-shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${is2FAEnabled ? 'text-green-400' : 'text-amber-400'}`}>
              {is2FAEnabled ? '2FA enabled' : '2FA not configured'}
            </p>
            <p className="text-xs text-muted-foreground">
              {is2FAEnabled
                ? 'Your admin account is protected with TOTP.'
                : 'Enable 2FA to protect your admin panel.'}
            </p>
          </div>
        </div>
      )}

      {/* ── IDLE / NOT CONFIGURED ── */}
      {state === 'idle' && !is2FAEnabled && (
        <button
          onClick={startSetup}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Set up 2FA
        </button>
      )}

      {/* ── LOADING ── */}
      {state === 'loading' && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* ── SCAN QR ── */}
      {state === 'scan' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-subtle bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with your authenticator app
            </p>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <Image
                  src={qrDataUrl}
                  alt="TOTP QR code"
                  width={200}
                  height={200}
                  className="rounded-xl"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-2">
              Or enter the key manually:
            </p>
            <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2">
              <code className="text-xs font-mono flex-1 tracking-widest break-all">{secret}</code>
              <button
                onClick={copySecret}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Copy secret key"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Enter the 6-digit code from your app
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setErrorMsg('') }}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border border-subtle bg-surface text-center text-2xl font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verify & enable 2FA
            </button>
            <button
              onClick={() => { setState('idle'); setToken(''); setErrorMsg('') }}
              className="w-full py-2.5 rounded-xl border border-subtle text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {state === 'done' && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-green-400 mx-auto" />
          <div>
            <p className="font-semibold text-green-400 text-lg">2FA enabled!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your admin account is now protected. You will need your authenticator app to access the admin panel.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* ── ALREADY ENABLED — manage ── */}
      {is2FAEnabled && state === 'idle' && (
        <div className="space-y-3 mt-4">
          <button
            onClick={startSetup}
            className="w-full py-3 rounded-xl border border-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            Re-configure authenticator
          </button>
          <button
            onClick={disable2FA}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/5 transition-colors"
          >
            Disable 2FA
          </button>
        </div>
      )}

    </div>
  )
}
