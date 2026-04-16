'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Sliders, Bell, Eye, Shield } from 'lucide-react'

const NAV = [
  { href: '/settings',               label: 'Account',       icon: User    },
  { href: '/settings/preferences',   label: 'Preferences',   icon: Sliders },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell    },
  { href: '/settings/privacy',       label: 'Privacy',       icon: Eye     },
  { href: '/settings/security',      label: 'Security',      icon: Shield  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  return (
    <aside style={{ width: '196px', flexShrink: 0 }} className="hidden md:block">
      <p style={{
        fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '10px', paddingLeft: '10px',
      }}>
        Settings
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '8px 10px', borderRadius: '8px',
                fontSize: '13px', fontWeight: active ? 590 : 400,
                color: active ? 'var(--fh-t1)' : 'var(--fh-t3)',
                background: active ? 'var(--fh-surface-2)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--fh-surface-2)'
                  e.currentTarget.style.color = 'var(--fh-t2)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--fh-t3)'
                }
              }}
            >
              <item.icon style={{
                width: '14px', height: '14px',
                color: active ? '#7170ff' : 'var(--fh-t4)',
                flexShrink: 0,
              }} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function SettingsMobileNav() {
  const pathname = usePathname()
  return (
    <div
      className="md:hidden"
      style={{
        display: 'flex', gap: '6px', overflowX: 'auto',
        marginBottom: '20px', paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}
    >
      {NAV.map(item => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: '100px', whiteSpace: 'nowrap',
              fontSize: '13px', fontWeight: active ? 590 : 400,
              color: active ? '#fff' : 'var(--fh-t3)',
              background: active ? '#5e6ad2' : 'var(--fh-surface-2)',
              border: `1px solid ${active ? 'transparent' : 'var(--fh-border)'}`,
              textDecoration: 'none', flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            <item.icon style={{ width: '12px', height: '12px' }} />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
