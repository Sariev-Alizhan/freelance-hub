import Link from 'next/link'
import { Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        {/* 404 big number */}
        <div
          style={{
            fontSize: 'clamp(80px, 15vw, 120px)',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--fh-t1) 0%, var(--fh-t4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: 590,
            color: 'var(--fh-t1)',
            letterSpacing: '-0.03em',
            marginBottom: '10px',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--fh-t3)',
            lineHeight: 1.65,
            marginBottom: '32px',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Quick links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          {[
            { href: '/freelancers', label: 'Browse freelancers' },
            { href: '/orders',      label: 'Browse orders' },
            { href: '/agents',      label: 'AI Agents' },
            { href: '/ai-assistant',label: 'AI Search' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--fh-surface)',
                border: '1px solid var(--fh-border)',
                color: 'var(--fh-t2)',
                fontSize: '13px',
                fontWeight: 510,
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#27a644',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 590,
              textDecoration: 'none',
            }}
          >
            <Home className="h-3.5 w-3.5" />
            Go home
          </Link>
          <Link
            href="/ai-assistant"
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
            <Search className="h-3.5 w-3.5" />
            AI Search
          </Link>
        </div>
      </div>
    </div>
  )
}
