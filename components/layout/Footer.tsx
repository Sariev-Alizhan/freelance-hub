'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const LINKS = {
  'Платформа': [
    { href: '/orders',       label: 'Найти заказ' },
    { href: '/freelancers',  label: 'Найти фрилансера' },
    { href: '/ai-assistant', label: 'AI-подбор' },
    { href: '/contracts',    label: 'AI Контракты' },
    { href: '/dashboard',    label: 'Личный кабинет' },
  ],
  'Категории': [
    { href: '/freelancers?category=dev',   label: 'Разработка' },
    { href: '/freelancers?category=ux-ui', label: 'UX/UI Дизайн' },
    { href: '/freelancers?category=smm',   label: 'SMM' },
    { href: '/freelancers?category=ai-ml', label: 'AI / ML' },
  ],
  'Компания': [
    { href: '/about',   label: 'О создателе' },
    { href: '#terms',   label: 'Условия использования' },
    { href: '#privacy', label: 'Конфиденциальность' },
  ],
}

export default function Footer() {
  return (
    <footer
      className="mt-20"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#08090a' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex mb-5">
              <Logo size={28} />
            </Link>
            <p style={{ fontSize: '13px', color: '#62666d', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
              Бесплатная фриланс-платформа для специалистов СНГ. С планами на международное расширение.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-green" />
              <span style={{ fontSize: '12px', color: '#62666d', fontWeight: 510 }}>
                Платформа запущена
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 style={{ fontSize: '12px', fontWeight: 590, color: '#f7f8f8', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{ fontSize: '13px', color: '#62666d', fontWeight: 400, letterSpacing: '-0.01em', transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#d0d6e0' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#62666d' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ fontSize: '12px', color: '#62666d', fontWeight: 400 }}>
            © 2025 FreelanceHub — 0% комиссия навсегда
          </p>
          <p style={{ fontSize: '12px', color: '#62666d', fontWeight: 400 }}>
            🇰🇿 Казахстан · 🇷🇺 Россия · 🇺🇦 Украина · и весь мир
          </p>
        </div>
      </div>
    </footer>
  )
}
