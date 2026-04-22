'use client'
import { useState } from 'react'
import { Wallet, Loader2, Check, AlertTriangle } from 'lucide-react'

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  isMetaMask?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

type Status =
  | { phase: 'idle' }
  | { phase: 'connecting' }
  | { phase: 'signing', address: string }
  | { phase: 'verifying' }
  | { phase: 'success', did: string }
  | { phase: 'error', message: string }

export default function ConnectWallet({ currentDid }: { currentDid: string | null }) {
  const [status, setStatus] = useState<Status>({ phase: 'idle' })

  async function connect() {
    const eth = window.ethereum
    if (!eth) {
      setStatus({ phase: 'error', message: 'No wallet found. Install MetaMask, Rabby, or Coinbase Wallet.' })
      return
    }

    try {
      setStatus({ phase: 'connecting' })
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts?.[0]
      if (!address) throw new Error('No account returned')

      // Get a signed challenge from the server.
      const chalRes = await fetch('/api/identity/challenge', { method: 'POST' })
      if (!chalRes.ok) throw new Error('Failed to get challenge')
      const { token, message } = await chalRes.json() as { token: string; nonce: string; message: string }

      // Ask wallet to sign the human-readable message.
      setStatus({ phase: 'signing', address })
      const signature = await eth.request({
        method: 'personal_sign',
        params: [message, address],
      }) as string

      // Submit to the server for verification + DID binding.
      setStatus({ phase: 'verifying' })
      const verifyRes = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, address, signature }),
      })
      const result = await verifyRes.json() as { ok?: boolean; did?: string; error?: string }

      if (!verifyRes.ok || !result.ok || !result.did) {
        throw new Error(result.error ?? 'Verification failed')
      }

      setStatus({ phase: 'success', did: result.did })
      setTimeout(() => window.location.reload(), 1200)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setStatus({ phase: 'error', message: msg })
    }
  }

  const busy = status.phase === 'connecting' || status.phase === 'signing' || status.phase === 'verifying'

  return (
    <div style={{
      border: '1px solid var(--fh-border)', borderRadius: 14,
      background: 'var(--fh-surface)', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#27a644,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Wallet style={{ width: 18, height: 18, color: '#fff' }} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fh-t1)' }}>
            Decentralized identity
          </div>
          <div style={{ fontSize: 12, color: 'var(--fh-t4)', marginTop: 1 }}>
            Bind an Ethereum wallet to earn a DID and portable credentials.
          </div>
        </div>
      </div>

      {currentDid ? (
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: '#34d399',
        }}>
          <Check style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', color: 'var(--fh-t2)' }}>
            {currentDid}
          </span>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={busy}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 10,
            background: busy ? 'var(--fh-surface-2)' : 'var(--fh-primary)',
            color: '#fff', border: 'none', cursor: busy ? 'default' : 'pointer',
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {busy ? (
            <>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              {status.phase === 'connecting' && 'Connecting wallet…'}
              {status.phase === 'signing'    && 'Sign the message in your wallet…'}
              {status.phase === 'verifying'  && 'Verifying signature…'}
            </>
          ) : (
            <>
              <Wallet style={{ width: 16, height: 16 }} />
              Connect Wallet
            </>
          )}
        </button>
      )}

      {status.phase === 'error' && (
        <div style={{
          marginTop: 10, padding: '9px 11px', borderRadius: 10,
          background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.22)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
          fontSize: 12, color: '#e5484d',
        }}>
          <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
          {status.message}
        </div>
      )}

      {status.phase === 'success' && (
        <div style={{
          marginTop: 10, fontSize: 12, color: '#34d399',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Check style={{ width: 14, height: 14 }} />
          DID bound — reloading…
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--fh-t4)', lineHeight: 1.5 }}>
        Your DID is <code style={{ fontSize: 10.5 }}>did:ethr:base:0x…</code> — works across
        ActivityPub-federated instances and Web3 apps. Your private key never leaves your wallet.
      </div>
    </div>
  )
}
