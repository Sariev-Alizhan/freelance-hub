'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useLang } from '@/lib/context/LanguageContext'

const LINKS = {
  platform: [
    { href: '/orders',       ru: 'Найти заказ',       kz: 'Тапсырыс табу',  en: 'Find Order'       },
    { href: '/freelancers',  ru: 'Найти фрилансера',  kz: 'Фрилансер табу', en: 'Find Freelancer'  },
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
    { href: '/about',  ru: 'О создателе',           kz: 'Жасаушы туралы', en: 'About Creator', external: false },
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

        {/* Donation banner */}
        <div
          className="mt-10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
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
            🇰🇿 🇷🇺 🇺🇦 🇧🇾 🇬🇪 · {lang === 'ru' ? 'Весь мир' : lang === 'kz' ? 'Бүкіл әлем' : 'The World'}
          </p>
        </div>
      </div>
    </footer>
  )
}
