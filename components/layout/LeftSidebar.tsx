'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Briefcase, Users, MessageSquare, Sparkles, Zap, Bot,
  FileText, Tag, BarChart3, Target, Calculator, Settings,
  LogOut, User, Bell, ChevronRight, Plus, Shield,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import NotificationBell from '@/components/layout/NotificationBell'
import { useLang } from '@/lib/context/LanguageContext'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages'
import { createClient } from '@/lib/supabase/client'

const SIDEBAR_W_COLLAPSED = 72
const SIDEBAR_W_EXPANDED = 244

export default function LeftSidebar() {
  const { t } = useLang()
  const { user } = useUser()
  const { profile } = useProfile()
  const unreadMsgs = useUnreadMessages()
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isAdmin = adminEmail && user?.email === adminEmail

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Close more popover on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const mainNav = [
    { href: '/',            icon: Home,         label: 'Home'        },
    { href: '/orders',      icon: Briefcase,    label: t.nav.orders  },
    { href: '/freelancers', icon: Users,         label: t.nav.freelancers },
    { href: '/messages',    icon: MessageSquare, label: t.auth.messages },
    { href: '/ai-search',   icon: Sparkles,      label: 'AI Search'  },
  ]

  const moreNav = [
    { href: '/dashboard',             icon: User,       label: t.auth.dashboard  },
    { href: '/dashboard/analytics',   icon: BarChart3,  label: t.auth.analytics  },
    { href: '/dashboard/goals',       icon: Target,     label: t.auth.goals      },
    { href: '/dashboard/calculator',  icon: Calculator, label: t.auth.calculator },
    { href: '/ai-assistant',          icon: Bot,        label: t.nav.ai          },
    { href: '/ai-tools',              icon: Zap,        label: 'AI Tools'        },
    { href: '/agents',                icon: Bot,        label: t.nav.agents      },
    { href: '/contracts',             icon: FileText,   label: t.nav.contracts   },
    { href: '/pricing',               icon: Tag,        label: t.nav.pricing ?? 'Pricing' },
    { href: '/settings',              icon: Settings,   label: t.auth.settings ?? 'Settings' },
  ]

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 510,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'opacity 0.18s, transform 0.18s',
    opacity: expanded ? 1 : 0,
    transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
    color: 'var(--fh-t2)',
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setMoreOpen(false) }}
      className="hidden md:flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        width: expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        background: 'var(--fh-header-bg)',
        borderRight: '1px solid var(--fh-sep)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 60,
          paddingLeft: 18,
          paddingRight: 12,
          flexShrink: 0,
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <Logo size={28} showWordmark={false} />
        <span
          style={{
            ...labelStyle,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--fh-t1)',
          }}
        >
          Freelance<span style={{ color: '#7170ff' }}>Hub</span>
        </span>
      </Link>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', paddingTop: 4 }}>
        {/* Main nav */}
        {mainNav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 44,
                paddingLeft: 22,
                paddingRight: 12,
                margin: '2px 8px',
                borderRadius: 10,
                textDecoration: 'none',
                background: active ? 'var(--fh-surface-2)' : 'transparent',
                color: active ? 'var(--fh-t1)' : 'var(--fh-t3)',
                transition: 'background 0.15s, color 0.15s',
                position: 'relative',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--fh-surface-2)'
                  e.currentTarget.style.color = 'var(--fh-t1)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--fh-t3)'
                }
              }}
            >
              <span style={{
                position: 'relative', flexShrink: 0,
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon style={{ width: 18, height: 18 }} strokeWidth={active ? 2.2 : 1.8} />
                {(item.badge ?? 0) > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -6,
                    minWidth: 14, height: 14, borderRadius: 7,
                    background: '#e5484d', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>
                    {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span style={labelStyle}>{item.label}</span>
            </Link>
          )
        })}

        {/* Create button */}
        <Link
          href="/orders/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 44,
            paddingLeft: 22,
            paddingRight: 12,
            margin: '2px 8px',
            borderRadius: 10,
            textDecoration: 'none',
            color: 'var(--fh-t3)',
            transition: 'background 0.15s, color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--fh-surface-2)'
            e.currentTarget.style.color = 'var(--fh-t1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--fh-t3)'
          }}
        >
          <span style={{
            width: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 6,
              background: '#5e6ad2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus style={{ width: 11, height: 11, color: '#fff' }} />
            </span>
          </span>
          <span style={labelStyle}>Post a Job</span>
        </Link>
      </div>

      {/* Bottom section */}
      <div style={{ flexShrink: 0, paddingBottom: 12 }}>
        <div style={{ height: 1, margin: '4px 16px 8px', background: 'var(--fh-sep)' }} />

        {/* Notifications */}
        {user && (
          <div style={{ margin: '2px 8px', borderRadius: 10, overflow: 'visible' }}>
            <NotificationBell sidebarMode={expanded} />
          </div>
        )}

        {/* More (logged-in items) */}
        {user && (
          <div ref={moreRef} style={{ position: 'relative', margin: '2px 8px' }}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 44,
                paddingLeft: 22,
                paddingRight: 12,
                width: '100%',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: moreOpen ? 'var(--fh-surface-2)' : 'transparent',
                color: moreOpen ? 'var(--fh-t1)' : 'var(--fh-t3)',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (!moreOpen) {
                  e.currentTarget.style.background = 'var(--fh-surface-2)'
                  e.currentTarget.style.color = 'var(--fh-t1)'
                }
              }}
              onMouseLeave={e => {
                if (!moreOpen) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--fh-t3)'
                }
              }}
            >
              <ChevronRight style={{ width: 18, height: 18, flexShrink: 0, transition: 'transform 0.18s', transform: moreOpen ? 'rotate(90deg)' : 'none' }} />
              <span style={labelStyle}>More</span>
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'fixed',
                    left: expanded ? SIDEBAR_W_EXPANDED + 8 : SIDEBAR_W_COLLAPSED + 8,
                    bottom: 16,
                    width: 220,
                    borderRadius: 14,
                    background: 'var(--popover)',
                    border: '1px solid var(--fh-border-2)',
                    boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 100,
                    overflow: 'hidden',
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  {moreNav.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                      style={{ color: 'var(--fh-t2)', fontWeight: 510, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)'; e.currentTarget.style.color = 'var(--fh-t1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fh-t2)' }}
                      onClick={() => setMoreOpen(false)}
                    >
                      <item.icon style={{ width: 14, height: 14, color: 'var(--fh-t4)', flexShrink: 0 }} />
                      {item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                      style={{ color: '#7170ff', fontWeight: 510, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.06)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Shield style={{ width: 14, height: 14, flexShrink: 0 }} />
                      Admin
                    </Link>
                  )}
                  <div style={{ height: 1, margin: '4px 12px', background: 'var(--fh-sep)' }} />
                  <button
                    onClick={() => { signOut(); setMoreOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                    style={{ color: '#e5484d', fontWeight: 510, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,72,77,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {t.auth.logout}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile / Auth */}
        {user ? (
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 52,
              paddingLeft: 18,
              paddingRight: 12,
              margin: '2px 8px',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'var(--fh-t3)',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--fh-surface-2)'
              e.currentTarget.style.color = 'var(--fh-t1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--fh-t3)'
            }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={28}
                height={28}
                className="rounded-full"
                style={{ flexShrink: 0, border: '2px solid var(--fh-sep)' }}
                unoptimized
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(113,112,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User style={{ width: 14, height: 14, color: '#7170ff' }} />
              </div>
            )}
            <div style={{ overflow: 'hidden', transition: 'opacity 0.18s, transform 0.18s', opacity: expanded ? 1 : 0, transform: expanded ? 'translateX(0)' : 'translateX(-6px)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fh-t4)', whiteSpace: 'nowrap' }}>View profile</div>
            </div>
          </Link>
        ) : (
          <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link
              href="/auth/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 36,
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 510,
                color: 'var(--fh-t2)',
                border: '1px solid var(--fh-border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {expanded ? t.auth.login : <User style={{ width: 16, height: 16 }} />}
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
