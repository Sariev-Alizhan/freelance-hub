import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Logo from '@/components/ui/Logo'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop nav — visible only on md+, hidden on mobile */}
      <nav className="hidden md:flex items-center justify-between px-8 h-[60px] sticky top-0 z-50" style={{
        background: 'rgba(6,6,18,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={24} showWordmark={false} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            FreelanceHub
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/auth/login" style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            textDecoration: 'none',
          }}>
            Sign In
          </Link>
          <Link href="/auth/register" style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            color: '#fff', background: '#5e6ad2', textDecoration: 'none',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Mobile header */}
      <Header />

      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
