'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Briefcase, Users, Plus, MessageSquare, LayoutDashboard } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

const ITEMS = [
  { href: '/orders',      label: 'Orders',  icon: Briefcase       },
  { href: '/freelancers', label: 'People',  icon: Users           },
  { href: '/orders/new',  label: '',        icon: Plus, isCenter: true },
  { href: '/messages',    label: 'Chat',    icon: MessageSquare   },
  { href: '/dashboard',   label: 'Profile', icon: LayoutDashboard },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useUser()

  const hidden = pathname.startsWith('/auth') || pathname.startsWith('/messages')
  if (hidden) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl"
      style={{
        background: 'var(--fh-header-bg)',
        borderTop: '1px solid var(--fh-sep)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = item.href !== '/orders/new' && (
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          )

          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href} className="flex items-center justify-center -mt-5">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    background: '#5e6ad2',
                    boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 4px 16px rgba(94,106,210,0.35)',
                  }}
                >
                  <Plus className="h-5 w-5" style={{ color: '#ffffff' }} />
                </motion.div>
              </Link>
            )
          }

          const needsAuth = item.href === '/messages' || item.href === '/dashboard'
          const href = needsAuth && !user ? '/auth/login' : item.href

          return (
            <Link
              key={item.href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: isActive ? '#7170ff' : 'var(--fh-t4)' }}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                      style={{ background: '#7170ff' }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? '#7170ff' : 'var(--fh-t4)' }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
