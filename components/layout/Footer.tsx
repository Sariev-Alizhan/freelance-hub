'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useLang } from '@/lib/context/LanguageContext'

type LangKey = 'ru' | 'kz' | 'en'

const PLATFORM = [
  { href: '/orders',      ru: 'Найти заказ',   kz: 'Тапсырыс',       en: 'Browse Orders'  },
  { href: '/freelancers', ru: 'Фрилансеры',    kz: 'Фрилансерлер',   en: 'Freelancers'    },
  { href: '/dashboard',   ru: 'Операции',      kz: 'Операциялар',    en: 'Operations'     },
  { href: '/premium',     ru: 'Premium',        kz: 'Premium',         en: 'Premium'        },
  { href: '/updates',     ru: 'Обновления',    kz: 'Жаңартулар',     en: 'Updates'        },
  { href: '/vote',        ru: 'Голосование',   kz: 'Дауыс',          en: 'Vote'           },
]

const AI_TOOLS = [
  { href: '/agents',       ru: 'AI Агенты',    kz: 'AI Агенттер',    en: 'AI Agents'      },
  { href: '/ai-search',    ru: 'AI Поиск',      kz: 'AI Іздеу',       en: 'AI Search'      },
  { href: '/ai-assistant', ru: 'AI Подбор',     kz: 'AI Таңдау',      en: 'AI Match'       },
  { href: '/contracts',    ru: 'AI Контракты',  kz: 'AI Келісім',     en: 'AI Contracts'   },
  { href: '/news',         ru: 'AI Новости',    kz: 'AI Жаңалықтар',  en: 'AI News'        },
  { href: '/play',         ru: 'Игра',             kz: 'Ойын',            en: 'Game'            },
]

const COMPANY = [
  { href: '/about',   ru: 'О нас',             kz: 'Біз туралы',    en: 'About'    },
  { href: '/terms',   ru: 'Условия',           kz: 'Шарттар',       en: 'Terms'    },
  { href: '/privacy', ru: 'Конфиденциальность',kz: 'Құпиялылық',   en: 'Privacy'  },
]

const SOCIALS = [
  {
    href: 'https://t.me/zhanmate', label: 'Telegram', color: '#29b6f6',
    icon: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.164 13.72l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.986.839z"/></svg>,
  },
  {
    href: 'https://www.instagram.com/freelancehubkz/?hl=ru', label: 'Instagram', color: '#e1306c',
    icon: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    href: 'https://www.tiktok.com/@freelancehubkz', label: 'TikTok', color: '#010101',
    icon: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>,
  },
  {
    href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/', label: 'LinkedIn', color: '#0a66c2',
    icon: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
]

export default function Footer() {
  const { lang, t } = useLang()

  return (
    <footer className="hidden md:block" style={{ borderTop: '1px solid var(--fh-sep)', background: 'var(--fh-footer-bg)', marginTop: 60 }}>
      {/* Accent gradient line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--fh-primary) 35%, transparent) 40%, color-mix(in srgb, var(--fh-primary) 35%, transparent) 60%, transparent 100%)' }} />

      {/* ── MOBILE footer — compact and clean ─────────────────── */}
      <div className="md:hidden" style={{ padding: 'clamp(14px, 5vw, 20px) clamp(12px, 5vw, 20px) 16px' }}>
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={20} showWordmark={false} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
              Freelance<span style={{ color: 'var(--fh-primary)' }}>Hub</span>
            </span>
          </div>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fh-surface-2)', color: 'var(--fh-t4)', textDecoration: 'none' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Key links row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 0', marginBottom: 16 }}>
          {[
            { href: '/about',   label: lang === 'en' ? 'About' : 'О нас'     },
            { href: '/terms',   label: lang === 'en' ? 'Terms' : 'Условия'   },
            { href: '/privacy', label: lang === 'en' ? 'Privacy' : 'Privacy' },
            { href: '/updates', label: lang === 'en' ? 'Updates' : 'Новости' },
          ].map((l, i, arr) => (
            <span key={l.href} style={{ display: 'flex', alignItems: 'center' }}>
              <Link href={l.href} className="footer-link" style={{ fontSize: 12, textDecoration: 'none', padding: '0 10px' }}>
                {l.label}
              </Link>
              {i < arr.length - 1 && <span style={{ color: 'var(--fh-sep)', fontSize: 12 }}>·</span>}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-green" style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#27a644', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>© 2025 FreelanceHub · SITS</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{t.footer.made}</span>
        </div>
      </div>

      {/* ── DESKTOP footer — full 4-column ─────────────────────── */}
      <div className="hidden md:block" style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 20px 20px' }}>

        {/* Brand + socials */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Logo size={22} showWordmark={false} />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                Freelance<span style={{ color: 'var(--fh-primary)' }}>Hub</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fh-t4)', lineHeight: 1.6, maxWidth: 210 }}>{t.footer.tagline}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', color: 'var(--fh-t4)', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = s.color; el.style.borderColor = s.color + '50'; el.style.background = s.color + '12' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--fh-t4)'; el.style.borderColor = 'var(--fh-border)'; el.style.background = 'var(--fh-surface-2)' }}
              >{s.icon}</a>
            ))}
          </div>
        </div>

        {/* Nav grid */}
        <div className="grid grid-cols-4 gap-x-5 gap-y-7 mb-7">
          <NavCol label="Platform" labelColor="var(--fh-t4)" links={PLATFORM} lang={lang} />
          <NavCol label="AI Tools" labelColor="var(--fh-primary)" links={AI_TOOLS} lang={lang} />
          <NavCol label={lang === 'en' ? 'Company' : 'Компания'} labelColor="var(--fh-t4)" links={COMPANY} lang={lang} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fh-t4)', marginBottom: 10 }}>
              {lang === 'en' ? 'Contact' : 'Контакты'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { href: 'https://t.me/zhanmate', label: 'Telegram' },
                { href: 'https://wa.me/87774961358', label: 'WhatsApp' },
                { href: 'https://www.instagram.com/freelancehubkz/?hl=ru', label: 'Instagram' },
                { href: 'https://www.tiktok.com/@freelancehubkz', label: 'TikTok' },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 13, textDecoration: 'none' }}>{c.label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Donate strip */}
        <div style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 20, background: 'var(--fh-primary-muted)', border: '1px solid color-mix(in srgb, var(--fh-primary) 20%, transparent)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fh-primary)', flexShrink: 0 }}>{t.footer.donate}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 11, color: '#fbbf24', fontFamily: 'monospace', letterSpacing: '0.02em' }}>Kaspi: 4400 4303 1167 6685</span>
            <span style={{ padding: '3px 9px', borderRadius: 5, background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.18)', fontSize: 11, color: '#27a644', fontFamily: 'monospace', letterSpacing: '0.02em' }}>Freedom: 4002 8900 3407 5055</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--fh-sep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="pulse-green" style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#27a644', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
              © 2025 FreelanceHub by{' '}
              <a href="https://www.instagram.com/sariyev.it.solutions/?hl=ru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fh-primary)', textDecoration: 'none' }}>SITS</a>
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--fh-t4)', display: 'flex', alignItems: 'center', gap: 4 }}>{t.footer.made}</span>
        </div>
      </div>
    </footer>
  )
}

// ── Column component ──────────────────────────────────────────────────────────
function NavCol({ label, labelColor, links, lang }: {
  label: string
  labelColor: string
  links: Array<{ href: string; ru: string; kz: string; en: string }>
  lang: LangKey
}) {
  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: labelColor, marginBottom: 10,
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="footer-link"
            style={{ fontSize: 13, textDecoration: 'none', fontWeight: 400 }}
          >
            {l[lang]}
          </Link>
        ))}
      </div>
    </div>
  )
}
