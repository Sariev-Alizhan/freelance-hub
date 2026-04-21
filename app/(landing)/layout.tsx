import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Logo from '@/components/ui/Logo'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--fh-canvas)', color: 'var(--fh-t1)' }}
    >
      {/* Desktop nav — visible only on md+, hidden on mobile */}
      <nav
        className="hidden md:flex items-center justify-between px-8 h-[60px] sticky top-0 z-50"
        style={{
          background: 'var(--fh-header-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--fh-border)',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Logo size={24} showWordmark={false} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--fh-t1)',
              letterSpacing: '-0.02em',
            }}
          >
            FreelanceHub
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/auth/login"
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fh-t2)',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fh-canvas)',
              background: 'var(--fh-t1)',
              textDecoration: 'none',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Mobile header */}
      <Header />

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
