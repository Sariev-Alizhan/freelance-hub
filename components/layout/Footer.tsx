'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useLang } from '@/lib/context/LanguageContext'

const LINKS = {
  platform: [
    { href: '/orders',       ru: 'Найти заказ',       kz: 'Тапсырыс табу',  en: 'Find Order'       },
    { href: '/freelancers',  ru: 'Найти фрилансера',  kz: 'Фрилансер табу', en: 'Find Freelancer'  },
    { href: '/agents',       ru: 'AI Агенты',          kz: 'AI Агенттер',    en: 'AI Agents'        },
    { href: '/ai-assistant', ru: 'AI‑подбор',          kz: 'AI‑іздеу',       en: 'AI Match'         },
    { href: '/contracts',    ru: 'AI Контракты',       kz: 'AI Келісімшарт', en: 'AI Contracts'     },
    { href: '/dashboard',    ru: 'Личный кабинет',    kz: 'Жеке кабинет',   en: 'Dashboard'        },
  ],
  categories: [
    { href: '/freelancers?category=dev',   ru: 'Разработка',  kz: 'Бағдарламалау', en: 'Development' },
    { href: '/freelancers?category=ux-ui', ru: 'UX/UI Дизайн',kz: 'UX/UI Дизайн',  en: 'UX/UI Design' },
    { href: '/freelancers?category=smm',   ru: 'SMM',         kz: 'SMM',            en: 'SMM'         },
    { href: '/freelancers?category=ai-ml', ru: 'AI / ML',     kz: 'AI / ML',        en: 'AI / ML'     },
  ],
  company: [
    { href: '/about',  ru: 'О нас',                  kz: 'Біз туралы',     en: 'About Us',      external: false },
    { href: '#terms',  ru: 'Условия',               kz: 'Шарттар',        en: 'Terms',         external: false },
    { href: '#privacy',ru: 'Конфиденциальность',   kz: 'Құпиялылық',     en: 'Privacy',       external: false },
    { href: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru', ru: 'SITS Instagram', kz: 'SITS Instagram', en: 'SITS Instagram', external: true },
    { href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/', ru: 'LinkedIn', kz: 'LinkedIn', en: 'LinkedIn', external: true },
  ],
}

const SECTION_TITLES = {
  platform:   { ru: 'Платформа',  kz: 'Платформа', en: 'Platform'  },
  categories: { ru: 'Категории',  kz: 'Санаттар',  en: 'Categories'},
  company:    { ru: 'О проекте',  kz: 'Жоба туралы', en: 'About'   },
}

export default function Footer() {
  const { lang, t } = useLang()

  return (
    <footer
      className="mt-20"
      style={{ borderTop: '1px solid var(--fh-sep)', background: 'var(--fh-footer-bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex mb-5">
              <Logo size={28} />
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--fh-t4)', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
              {t.footer.tagline}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '6px', fontWeight: 400 }}>
              {t.footer.made}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-green" />
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 510 }}>
                {t.footer.status}
              </span>
            </div>
          </div>

          {/* Links */}
          {(Object.keys(LINKS) as Array<keyof typeof LINKS>).map((key) => (
            <div key={key}>
              <h3 style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {SECTION_TITLES[key][lang]}
              </h3>
              <ul className="space-y-2.5">
                {LINKS[key].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                      style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400, letterSpacing: '-0.01em', transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
                    >
                      {link[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Community banner */}
        <div
          className="mt-10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: 'rgba(39,166,68,0.04)', border: '1px solid rgba(39,166,68,0.15)' }}
        >
          <div className="flex-1">
            <p style={{ fontSize: '13px', fontWeight: 590, color: '#27a644', marginBottom: '3px' }}>
              {lang === 'en' ? '💬 Community & Feedback' : '💬 Сообщество и обратная связь'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
              {lang === 'en' ? 'Share your ideas, report bugs, or just say hi!'
                : 'Делитесь идеями, сообщайте о багах или просто пишите!'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="https://t.me/zhanmate"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(41,182,246,0.08)', border: '1px solid rgba(41,182,246,0.2)', fontSize: '12px', fontWeight: 590, color: '#29b6f6', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.164 13.72l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.986.839z"/></svg>
              Telegram
            </a>
            <a
              href="https://wa.me/87774961358"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', fontSize: '12px', fontWeight: 590, color: '#25d366', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Donation banner */}
        <div
          className="mt-4 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: 'rgba(94,106,210,0.05)', border: '1px solid rgba(94,106,210,0.15)' }}
        >
          <div className="flex-1">
            <p style={{ fontSize: '13px', fontWeight: 590, color: '#7170ff', marginBottom: '3px' }}>
              {t.footer.donate}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
              {t.footer.donateDesc}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <span style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '12px', fontWeight: 590, color: '#fbbf24', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
              Kaspi: 4400 4303 1167 6685
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.18)', fontSize: '12px', fontWeight: 590, color: '#27a644', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
              Freedom: 4002 8900 3407 5055
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid var(--fh-sep)' }}
        >
          <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
            {t.footer.copyright.split('SITS')[0]}
            <a href="https://www.instagram.com/sariyev.it.solutions/?hl=ru" target="_blank" rel="noopener noreferrer" style={{ color: '#7170ff', textDecoration: 'none' }}>
              SITS
            </a>
            {t.footer.copyright.split('SITS')[1]}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
            🇰🇿 🇷🇺 🇺🇦 🇧🇾 🇬🇪 · {lang === 'ru' ? 'Весь мир' : 'The World'}
          </p>
        </div>
      </div>
    </footer>
  )
}
