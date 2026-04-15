'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useLang } from '@/lib/context/LanguageContext'

// ── Platform: core actions ────────────────────────────────────────────────────
const PLATFORM = [
  { href: '/orders',       ru: 'Найти заказ',      kz: 'Тапсырыс табу',  en: 'Browse Orders'    },
  { href: '/freelancers',  ru: 'Найти фрилансера', kz: 'Фрилансер табу', en: 'Find Freelancers'  },
  { href: '/dashboard',    ru: 'Личный кабинет',   kz: 'Жеке кабинет',   en: 'Dashboard'         },
  { href: '/premium',      ru: 'Premium',          kz: 'Premium',         en: 'Premium'           },
  { href: '/updates',      ru: 'Обновления',       kz: 'Жаңартулар',     en: 'Updates'           },
  { href: '/vote',         ru: 'Голосование',      kz: 'Дауыс беру',     en: 'Vote'              },
]

// ── AI Tools ─────────────────────────────────────────────────────────────────
const AI_TOOLS = [
  { href: '/agents',       ru: 'AI Агенты',        kz: 'AI Агенттер',    en: 'AI Agents'         },
  { href: '/ai-search',    ru: 'AI Поиск',          kz: 'AI Іздеу',       en: 'AI Search'         },
  { href: '/ai-assistant', ru: 'AI Подбор',         kz: 'AI Іздеу',       en: 'AI Match'          },
  { href: '/contracts',    ru: 'AI Контракты',      kz: 'AI Келісімшарт', en: 'AI Contracts'      },
  { href: '/news',         ru: '🧠 AI Новости',     kz: '🧠 AI Жаңалықтар', en: '🧠 AI News'      },
  { href: '/play',         ru: '🎮 Block Blast',    kz: '🎮 Block Blast',  en: '🎮 Block Blast'    },
]

// ── Company ───────────────────────────────────────────────────────────────────
const COMPANY = [
  { href: '/about',   ru: 'О нас',               kz: 'Біз туралы',     en: 'About Us',    external: false },
  { href: '/terms',   ru: 'Условия',             kz: 'Шарттар',        en: 'Terms',       external: false },
  { href: '/privacy', ru: 'Конфиденциальность',  kz: 'Құпиялылық',    en: 'Privacy',     external: false },
  { href: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru', ru: 'SITS Instagram', kz: 'SITS Instagram', en: 'SITS Instagram', external: true },
  { href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/', ru: 'LinkedIn', kz: 'LinkedIn', en: 'LinkedIn', external: true },
  { href: 'https://t.me/zhanmate', ru: 'Telegram',    kz: 'Telegram',       en: 'Telegram',    external: true },
]

type LangKey = 'ru' | 'kz' | 'en'

function NavCol({
  title, links, lang,
}: {
  title: string
  links: Array<{ href: string; ru: string; kz: string; en: string; external?: boolean }>
  lang: LangKey
}) {
  return (
    <div>
      <h3 style={{
        fontSize: 11, fontWeight: 700, color: 'var(--fh-t1)',
        marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {title}
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="footer-link"
              style={{ fontSize: 13, fontWeight: 400, letterSpacing: '-0.01em', textDecoration: 'none' }}
            >
              {link[lang]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SECTION_TITLES: Record<string, Record<LangKey, string>> = {
  platform: { ru: 'Платформа', kz: 'Платформа',  en: 'Platform'  },
  ai:       { ru: 'AI Инструменты', kz: 'AI Құралдар', en: 'AI Tools'  },
  company:  { ru: 'Компания',  kz: 'Компания',    en: 'Company'   },
}

export default function Footer() {
  const { lang, t } = useLang()

  return (
    <footer
      className="mt-20"
      style={{ borderTop: '1px solid var(--fh-sep)', background: 'var(--fh-footer-bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9">
          {/* Brand column */}
          <div className="sm:col-span-1">
            <Link href="/" style={{ display: 'inline-flex', marginBottom: 16 }}>
              <Logo size={28} />
            </Link>
            <p style={{ fontSize: 13, color: 'var(--fh-t4)', lineHeight: 1.65, fontWeight: 400, maxWidth: 220 }}>
              {t.footer.tagline}
            </p>
            <p style={{ fontSize: 12, color: 'var(--fh-t4)', marginTop: 6, fontWeight: 400 }}>
              {t.footer.made}
            </p>

            {/* Status */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pulse-green" style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#27a644', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--fh-t4)', fontWeight: 510 }}>
                {t.footer.status}
              </span>
            </div>

            {/* Social icons row */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { href: 'https://t.me/zhanmate', title: 'Telegram', color: '#29b6f6', icon: (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.164 13.72l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.986.839z"/></svg>
                ) },
                { href: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru', title: 'Instagram', color: '#e1306c', icon: (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                ) },
                { href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/', title: 'LinkedIn', color: '#0a66c2', icon: (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                ) },
              ].map(s => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.title}
                  title={s.title}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                    color: 'var(--fh-t4)', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = s.color; (e.currentTarget as HTMLElement).style.borderColor = s.color + '40' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t4)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--fh-border)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <NavCol title={SECTION_TITLES.platform[lang]} links={PLATFORM} lang={lang} />
          <NavCol title={SECTION_TITLES.ai[lang]}       links={AI_TOOLS} lang={lang} />
          <NavCol title={SECTION_TITLES.company[lang]}  links={COMPANY}  lang={lang} />
        </div>

        {/* ── Community + Donate banners ─────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Community */}
          <div
            style={{
              borderRadius: 12, padding: '16px 18px',
              background: 'rgba(39,166,68,0.04)', border: '1px solid rgba(39,166,68,0.15)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 590, color: '#27a644', marginBottom: 3 }}>
                💬 {lang === 'en' ? 'Community & Feedback' : 'Сообщество'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', fontWeight: 400 }}>
                {lang === 'en' ? 'Share ideas, report bugs, or just say hi!' : 'Делитесь идеями и сообщайте о багах!'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href="https://t.me/zhanmate" target="_blank" rel="noopener noreferrer"
                style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(41,182,246,0.08)', border: '1px solid rgba(41,182,246,0.2)', fontSize: 12, fontWeight: 590, color: '#29b6f6', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.164 13.72l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.986.839z"/></svg>
                Telegram
              </a>
              <a
                href="https://wa.me/87774961358" target="_blank" rel="noopener noreferrer"
                style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', fontSize: 12, fontWeight: 590, color: '#25d366', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Donate */}
          <div
            style={{
              borderRadius: 12, padding: '16px 18px',
              background: 'rgba(94,106,210,0.05)', border: '1px solid rgba(94,106,210,0.15)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 590, color: '#7170ff', marginBottom: 3 }}>
                {t.footer.donate}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', fontWeight: 400 }}>
                {t.footer.donateDesc}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 11, fontWeight: 590, color: '#fbbf24', fontFamily: 'monospace' }}>
                Kaspi: 4400 4303 1167 6685
              </span>
              <span style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.18)', fontSize: 11, fontWeight: 590, color: '#27a644', fontFamily: 'monospace' }}>
                Freedom: 4002 8900 3407 5055
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 28, paddingTop: 20,
            borderTop: '1px solid var(--fh-sep)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', fontWeight: 400 }}>
            {t.footer.copyright.split('SITS')[0]}
            <a href="https://www.instagram.com/sariyev.it.solutions/?hl=ru" target="_blank" rel="noopener noreferrer" style={{ color: '#7170ff', textDecoration: 'none' }}>
              SITS
            </a>
            {t.footer.copyright.split('SITS')[1]}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/terms"   className="footer-link" style={{ fontSize: 12, textDecoration: 'none' }}>Terms</Link>
            <Link href="/privacy" className="footer-link" style={{ fontSize: 12, textDecoration: 'none' }}>Privacy</Link>
            <Link href="/about"   className="footer-link" style={{ fontSize: 12, textDecoration: 'none' }}>About</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
