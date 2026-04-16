'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Bell, Sun, Moon, Search } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { usePathname } from 'next/navigation'
import { useUnreadNotifications } from '@/lib/hooks/useUnreadNotifications'
import { useTheme } from '@/lib/context/ThemeContext'

export default function Header() {
  const { user } = useUser()
  const { profile } = useProfile()
  const pathname = usePathname()

  const isLanding = pathname === '/' && !user
  const [scrolled, setScrolled] = useState(false)
  const onScroll = useCallback(() => { setScrolled(window.scrollY > 60) }, [])
  useEffect(() => {
    if (!isLanding) return
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding, onScroll])

  const isApp = !!user && !isLanding
  const unreadNotifs = useUnreadNotifications()
  const { theme, setTheme } = useTheme()

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = (profile?.full_name || user?.email || 'U')[0].toUpperCase()

  // ── Landing header ─────────────────────────────────────────────────────────
  if (isLanding) {
    return (
      <header
        className="sticky top-0 z-50 md:hidden"
        style={{
          borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
          background: scrolled ? 'rgba(6,6,18,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'background 0.3s, border-color 0.3s',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Logo size={26} showWordmark={false} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FreelanceHub</span>
          </Link>
          <Link href="/auth/login" style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            color: '#fff', background: 'var(--fh-primary)', textDecoration: 'none',
          }}>
            Sign In
          </Link>
        </div>
      </header>
    )
  }

  // ── App header — LinkedIn-style ─────────────────────────────────────────────
  if (isApp) {
    return (
      <header
        className="sticky top-0 z-50 md:hidden"
        style={{
          background: 'var(--fh-header-bg)',
          borderBottom: '0.5px solid var(--fh-sep)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'env(safe-area-inset-top)',
          contain: 'layout style',
          transform: 'translateZ(0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 12px', gap: 10 }}>

          {/* Left: small avatar → dashboard */}
          <Link href="/dashboard" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {avatarUrl ? (
              <Image
                src={avatarUrl} alt="" width={34} height={34}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                unoptimized
              />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--fh-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{initials}</span>
              </div>
            )}
          </Link>

          {/* Center: search bar — tappable, goes to /orders */}
          <Link href="/orders" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
            <div style={{
              height: 36, borderRadius: 18,
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
              minWidth: 0,
            }}>
              <Search style={{ width: 15, height: 15, color: 'var(--fh-t4)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: 'var(--fh-t4)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                Search orders, people…
              </span>
            </div>
          </Link>

          {/* Right: notifications bell with badge */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            style={{
              position: 'relative', flexShrink: 0,
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fh-t2)', textDecoration: 'none',
              borderRadius: 12,
            }}
          >
            <Bell style={{ width: 22, height: 22 }} />
            {unreadNotifs > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                minWidth: 14, height: 14, borderRadius: 7,
                background: '#e5484d', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 0 2px var(--fh-header-bg)',
              }}>
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </Link>
        </div>
      </header>
    )
  }

  // ── Guest / non-auth mobile header ─────────────────────────────────────────
  return (
    <header
      className="sticky top-0 z-50 md:hidden"
      style={{
        background: 'var(--fh-header-bg)',
        borderBottom: '0.5px solid var(--fh-sep)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', gap: 8, minWidth: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', minWidth: 0, flexShrink: 1 }}>
          <Logo size={22} showWordmark={false} />
          <span className="narrow-hide" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>FreelanceHub</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Переключить тему"
            className="narrow-hide"
            style={{
              width: 36, height: 36, flexShrink: 0,
              background: 'none', border: 'none', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--fh-t3)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/auth/login" style={{
            padding: '8px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            color: 'var(--fh-t2)', background: 'var(--fh-surface-2)',
            border: '1px solid var(--fh-border)', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Sign In
          </Link>
          <Link href="/auth/register" style={{
            padding: '8px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            color: '#fff', background: 'var(--fh-primary)', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
