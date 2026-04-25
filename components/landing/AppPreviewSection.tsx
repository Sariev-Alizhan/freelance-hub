'use client'
import { motion } from 'framer-motion'
import { MessageCircle, Star, Zap, BadgeCheck } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

// ── Fake phone screen content (unchanged content, lightly polished) ──────────
function PhoneScreen({ labelFeed }: { labelFeed: string }) {
  const posts = [
    {
      name: 'Alizhan S.',
      role: 'Full-stack developer',
      time: '2m',
      text: 'Finished CRM AI integration. Conversion jumped 34% 🚀',
      likes: 24,
      verified: true,
    },
    {
      name: 'Dana K.',
      role: 'UX/UI Designer',
      time: '15m',
      text: 'Shipped a new landing for a client. 2 days instead of 5 — AI handled wireframes ✅',
      likes: 41,
      verified: true,
    },
  ]
  return (
    <div
      style={{
        background: '#0a0a12',
        height: '100%',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 6px',
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 600,
        }}
      >
        <span>9:41</span>
        <div
          style={{
            width: 80,
            height: 18,
            borderRadius: 99,
            background: '#111',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <span>●●●</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 14px 10px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
            }}
          >
            FreelanceHub
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
            {labelFeed}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={12} color="rgba(255,255,255,0.5)" />
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={12} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          padding: '0 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {posts.map((p, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `hsl(0, 0%, ${22 + i * 8}%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {p.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  {p.verified && <BadgeCheck size={10} color="#27a644" />}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                  {p.role} · {p.time}
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            >
              {p.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                <Star size={9} /> {p.likes}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                <MessageCircle size={9} /> 5
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '10px 0 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
        }}
      >
        {['🏠', '💼', '＋', '💬', '👤'].map((icon, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                background: i === 0 ? 'rgba(39,166,68,0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: i === 2 ? 22 : 16,
              }}
            >
              {icon}
            </div>
            <div
              style={{
                width: i === 0 ? 4 : 0,
                height: 4,
                borderRadius: 2,
                background: '#27a644',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Copy keyed by language
const CONTENT = {
  en: {
    eyebrow: 'The app',
    pre: 'Everything you need,',
    accent: 'one app.',
    sub: 'A freelance platform with messaging, AI matching, and direct payments. Built for getting hired and paid.',
    feed: 'Feed · Kazakhstan',
    features: [
      { kv: '01', title: '0% commission', sub: 'No hidden fees. Ever.' },
      { kv: '02', title: 'Messenger', sub: 'Reactions, real-time, typing indicator.' },
      { kv: '03', title: 'Ratings & reviews', sub: 'Real clients only.' },
      { kv: '04', title: 'Direct payments', sub: 'Kaspi, USDT, IBAN, cash — your call.' },
      { kv: '05', title: 'AI matchmaking', sub: 'Right freelancer in 3 seconds.' },
      { kv: '06', title: 'Verified profiles', sub: 'Badge for proven freelancers.' },
    ],
  },
  ru: {
    eyebrow: 'Приложение',
    pre: 'Всё что нужно —',
    accent: 'одно приложение.',
    sub: 'Фриланс-платформа с мессенджером, AI-подбором и прямыми выплатами. Сделано чтобы находить работу и получать оплату.',
    feed: 'Лента · Казахстан',
    features: [
      { kv: '01', title: '0% комиссий', sub: 'Никаких скрытых платежей. Никогда.' },
      { kv: '02', title: 'Мессенджер', sub: 'Реакции, реалтайм, typing-индикатор.' },
      { kv: '03', title: 'Рейтинг и отзывы', sub: 'Только реальные клиенты.' },
      { kv: '04', title: 'Прямые выплаты', sub: 'Kaspi, USDT, IBAN, наличка — на ваш выбор.' },
      { kv: '05', title: 'AI-подбор', sub: 'Нужный специалист за 3 секунды.' },
      { kv: '06', title: 'Верификация', sub: 'Бейдж для проверенных.' },
    ],
  },
  kz: {
    eyebrow: 'Қосымша',
    pre: 'Керек нәрсенің бәрі —',
    accent: 'бір қосымшада.',
    sub: 'Мессенджер, AI-сұрыптау және тікелей төлемдері бар фриланс-платформа. Жұмыс табу және ақы алу үшін жасалған.',
    feed: 'Лента · Қазақстан',
    features: [
      { kv: '01', title: '0% комиссия', sub: 'Жасырын төлем жоқ. Ешқашан.' },
      { kv: '02', title: 'Мессенджер', sub: 'Реакция, реалтайм, typing көрсеткіш.' },
      { kv: '03', title: 'Рейтинг және пікірлер', sub: 'Тек нақты клиенттер.' },
      { kv: '04', title: 'Тікелей төлемдер', sub: 'Kaspi, USDT, IBAN, қолма-қол — өзіңіз шешесіз.' },
      { kv: '05', title: 'AI-сұрыптау', sub: '3 секундта сізге қажет маман.' },
      { kv: '06', title: 'Верификация', sub: 'Тексерілген мамандарға бейдж.' },
    ],
  },
}

export default function AppPreviewSection() {
  const { lang } = useLang()
  const c = (CONTENT as Record<string, typeof CONTENT.en>)[lang] ?? CONTENT.en

  return (
    <SectionShell>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(40px, 6vw, 72px)',
        }}
      >
        <EditorialHeading
          eyebrow={c.eyebrow}
          pre={c.pre}
          accent={c.accent}
          sub={c.sub}
          align="left"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)',
            gap: 'clamp(32px, 5vw, 72px)',
            alignItems: 'center',
          }}
          className="fh-apppreview-grid"
        >
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, ease: EASE }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <style>{`
              @keyframes fh-floatPhone {
                0%,100% { transform: translateY(0) rotate(-1deg); }
                50%     { transform: translateY(-10px) rotate(1deg); }
              }
              @media (prefers-reduced-motion: reduce) {
                .fh-phone-wrap { animation: none !important; }
              }
              @media (max-width: 720px) {
                .fh-apppreview-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>

            <div
              className="fh-phone-wrap"
              style={{
                position: 'relative',
                width: 'min(260px, 80vw)',
                animation: 'fh-floatPhone 5s ease-in-out infinite',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: -30,
                  background:
                    'radial-gradient(ellipse, rgba(39,166,68,0.15) 0%, transparent 65%)',
                  filter: 'blur(30px)',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  background: '#111118',
                  borderRadius: 38,
                  padding: '10px 8px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow:
                    '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                  aspectRatio: '9/19',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 90,
                    height: 22,
                    borderRadius: 99,
                    background: '#000',
                    zIndex: 10,
                  }}
                />
                <div style={{ height: '100%', borderRadius: 30, overflow: 'hidden' }}>
                  <PhoneScreen labelFeed={c.feed} />
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  top: '25%',
                  width: 3,
                  height: 50,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.15)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: -4,
                  top: '20%',
                  width: 3,
                  height: 32,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.12)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: -4,
                  top: 'calc(20% + 40px)',
                  width: 3,
                  height: 32,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.12)',
                }}
              />
            </div>
          </motion.div>

          {/* Numbered feature list */}
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'var(--fh-sep)',
              border: '1px solid var(--fh-sep)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {c.features.map((f, i) => (
              <motion.li
                key={f.kv}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                style={{
                  background: 'var(--card)',
                  padding: '22px 22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 140,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    color: 'var(--fh-t4)',
                  }}
                >
                  {f.kv}
                </span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 590,
                    letterSpacing: '-0.015em',
                    color: 'var(--fh-t1)',
                  }}
                >
                  {f.title}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: 'var(--fh-t3)',
                  }}
                >
                  {f.sub}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}
