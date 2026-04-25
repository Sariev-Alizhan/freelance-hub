import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Logo from '@/components/ui/Logo'
import { getServerT } from '@/lib/i18n/server'

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const t = await getServerT()
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--fh-canvas)', color: 'var(--fh-t1)' }}
    >
      {/* Desktop nav — visible only on md+, hidden on mobile */}
      <nav
        className="hidden md:flex items-center justify-between px-8 h-[60px] sticky top-0 z-50"
        style={{
          background: 'var(--fh-canvas)',
          borderBottom: '1px solid var(--fh-sep)',
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
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 510,
              color: 'var(--fh-t2)',
              background: 'transparent',
              border: '1px solid var(--fh-border-2)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {t.mobileNav.signIn}
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 590,
              color: 'var(--fh-canvas)',
              background: 'var(--fh-t1)',
              border: '1px solid var(--fh-t1)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {t.mobileNav.getStarted}
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
