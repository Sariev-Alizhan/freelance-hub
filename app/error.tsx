'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[FreelanceHub error]', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--fh-canvas)',
      }}
    >
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <AlertTriangle className="h-7 w-7" style={{ color: '#ef4444' }} />
        </div>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 590,
            color: 'var(--fh-t1)',
            letterSpacing: '-0.03em',
            marginBottom: '8px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--fh-t3)',
            lineHeight: 1.6,
            marginBottom: '8px',
          }}
        >
          An unexpected error occurred. Try refreshing the page or go back to the home page.
        </p>

        {error.digest && (
          <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '24px', fontFamily: 'monospace' }}>
            Error ID: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => unstable_retry()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#5e6ad2',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 590,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--fh-surface)',
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)',
              fontSize: '13px',
              fontWeight: 590,
              textDecoration: 'none',
            }}
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
