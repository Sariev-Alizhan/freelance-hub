'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/about',   label: 'About'   },
  { href: '/terms',   label: 'Terms'   },
  { href: '/privacy', label: 'Privacy' },
  { href: '/updates', label: 'Updates' },
]

export default function AppFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/messages')) return null

  return (
    <footer className="hidden md:block" style={{
      borderTop: '1px solid var(--fh-sep)',
      background: 'var(--fh-canvas)',
    }}>
      <div style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#27a644', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>
            © 2026{' '}
            <span style={{ color: 'var(--fh-t3)', fontWeight: 600 }}>FreelanceHub</span>
            {' '}· SITS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: 12, color: 'var(--fh-t4)', textDecoration: 'none' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
