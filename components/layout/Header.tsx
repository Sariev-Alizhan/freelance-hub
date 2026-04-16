'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MessageSquare, Bell, Search } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useUser } from '@/lib/hooks/useUser'
import { usePathname } from 'next/navigation'
import { useUnreadNotifications } from '@/lib/hooks/useUnreadNotifications'
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages'

// ── Page title map ─────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/feed':          'Лента',
  '/orders':        'Заказы',
  '/freelancers':   'Люди',
  '/messages':      'Сообщения',
  '/notifications': 'Уведомления',
  '/dashboard':     'Профиль',
  '/settings':      'Настройки',
  '/ai-assistant':  'AI Чат',
  '/ai-search':     'AI Поиск',
  '/agents':        'Агенты',
  '/pricing':       'Тарифы',
  '/contracts':     'Контракты',
}

function getPageTitle(pathname: string): string | null {
  for (const [prefix, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return label
  }
  return null
}

export default function Header() {
  const { user } = useUser()
  const pathname = usePathname()

  // Landing page: transparent floating header
  const isLanding = pathname === '/' && !user
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!isLanding) return
    function onScroll() { setScrolled(window.scrollY > 60) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding])

  // Is this an "app" page (authenticated user experience)?
  const isApp = !!user && !isLanding

  const pageTitle = getPageTitle(pathname)
  const unreadNotifs = useUnreadNotifications()
  const unreadMsgs   = useUnreadMessages()

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
            <Logo size={26} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FreelanceHub</span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/auth/login" style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none',
            }}>
              Войти
            </Link>
          </div>
        </div>
      </header>
    )
  }

  // ── App header (authenticated, mobile) ────────────────────────────────────
  if (isApp) {
    const isFeed = pathname === '/feed'

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
        <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 4px 0 16px' }}>

          {/* Left: logo or back — on feed show brand name */}
          {isFeed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <Logo size={22} />
              <span style={{
                fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em',
                color: 'var(--fh-t1)',
                fontFeatureSettings: '"cv01"',
              }}>
                FreelanceHub
              </span>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              {pageTitle ? (
                <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                  {pageTitle}
                </span>
              ) : (
                <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  <Logo size={22} />
                </Link>
              )}
            </div>
          )}

          {/* Right: action icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {/* Search */}
            <HeaderIconBtn href="/orders" aria-label="Поиск">
              <Search style={{ width: 22, height: 22 }} />
            </HeaderIconBtn>

            {/* Notifications */}
            <HeaderIconBtn href="/notifications" aria-label="Уведомления" badge={unreadNotifs}>
              <Bell style={{ width: 22, height: 22 }} />
            </HeaderIconBtn>

            {/* Messages */}
            <HeaderIconBtn href="/messages" aria-label="Сообщения" badge={unreadMsgs}>
              <MessageSquare style={{ width: 22, height: 22 }} />
            </HeaderIconBtn>
          </div>
        </div>
      </header>
    )
  }

  // ── Guest / non-auth mobile header ────────────────────────────────────────
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <Logo size={22} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>FreelanceHub</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/login" style={{
            padding: '8px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            color: 'var(--fh-t2)', background: 'var(--fh-surface-2)',
            border: '1px solid var(--fh-border)', textDecoration: 'none',
          }}>
            Войти
          </Link>
          <Link href="/auth/register" style={{
            padding: '8px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            color: '#fff', background: '#5e6ad2', textDecoration: 'none',
          }}>
            Начать
          </Link>
        </div>
      </div>
    </header>
  )

  // Note: desktop nav is handled by LeftSidebar on md+ screens
}

// ── Small icon button for header ─────────────────────────────────────────────
function HeaderIconBtn({ href, children, 'aria-label': label, badge = 0 }: {
  href: string; children: React.ReactNode; 'aria-label': string; badge?: number
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      style={{
        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 12, color: 'var(--fh-t2)', textDecoration: 'none',
        position: 'relative',
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          minWidth: 14, height: 14, borderRadius: 7,
          background: '#e5484d', color: '#fff',
          fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 3px',
          boxShadow: '0 0 0 2px var(--fh-header-bg)',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}
