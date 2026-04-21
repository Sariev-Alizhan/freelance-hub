'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

const CONTENT = {
  en: {
    eyebrow: 'Why FreelanceHub',
    pre: 'A fair platform —',
    accent: 'no middlemen.',
    sub: 'No middlemen, no hidden fees. Work directly. Keep 100%.',
    perks: [
      {
        kv: '0%',
        title: 'Commission',
        text: 'You keep 100% of what the client pays. Not now, not ever.',
      },
      {
        kv: '∞',
        title: 'Global',
        text: 'Work from anywhere, with anyone. No regional restrictions.',
      },
      {
        kv: '1:1',
        title: 'Direct deals',
        text: 'Client and freelancer work directly — no middlemen in between.',
      },
    ],
    ctaBadge: 'Just launched',
    ctaTitle: 'Be among the first',
    ctaSub:
      'Early members get priority in search results and a "Pioneer" badge on their profile.',
    ctaBtn1: 'Join now',
    ctaBtn2: 'Browse freelancers',
  },
  ru: {
    eyebrow: 'Почему FreelanceHub',
    pre: 'Честная платформа —',
    accent: 'без посредников.',
    sub: 'Никаких посредников и скрытых комиссий. Работайте напрямую. Забирайте 100%.',
    perks: [
      {
        kv: '0%',
        title: 'Комиссия',
        text: 'Вам достаётся 100% оплаты клиента. Сейчас и в будущем.',
      },
      {
        kv: '∞',
        title: 'Глобально',
        text: 'Работайте откуда угодно, с кем угодно. Никаких региональных барьеров.',
      },
      {
        kv: '1:1',
        title: 'Прямые сделки',
        text: 'Клиент и фрилансер общаются напрямую — посредников нет.',
      },
    ],
    ctaBadge: 'Только запустились',
    ctaTitle: 'Будь среди первых',
    ctaSub:
      'Ранние участники получают приоритет в поиске и значок «Первопроходец» в профиле.',
    ctaBtn1: 'Присоединиться',
    ctaBtn2: 'Смотреть фрилансеров',
  },
  kz: {
    eyebrow: 'Неге FreelanceHub',
    pre: 'Әділ платформа —',
    accent: 'делдалсыз.',
    sub: 'Делдалсыз, жасырын комиссиясыз. Тікелей жұмыс. 100% сізде.',
    perks: [
      {
        kv: '0%',
        title: 'Комиссия',
        text: 'Клиенттің төлемі — 100% сізге. Қазір де, болашақта да.',
      },
      {
        kv: '∞',
        title: 'Ғаламдық',
        text: 'Қалаған жерден, қалаған адаммен жұмыс. Аймақтық шектеусіз.',
      },
      {
        kv: '1:1',
        title: 'Тікелей мәмілелер',
        text: 'Клиент пен фрилансер тікелей сөйлеседі — делдал жоқ.',
      },
    ],
    ctaBadge: 'Жаңа іске қосылды',
    ctaTitle: 'Бірінші болыңыз',
    ctaSub: 'Алғашқы қатысушылар іздеуде басымдыққа ие және профильге «Pioneer» бейджі беріледі.',
    ctaBtn1: 'Қосылу',
    ctaBtn2: 'Фрилансерлер',
  },
} as const

export default function TopFreelancers() {
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
        />

        {/* Perks — big-type stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {c.perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.06, duration: 0.55, ease: EASE }}
              style={{
                background: 'var(--fh-canvas)',
                padding: 'clamp(26px, 2.5vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 200,
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(48px, 5.5vw, 72px)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  fontWeight: 700,
                  color: 'var(--fh-t1)',
                }}
              >
                {perk.kv}
              </span>
              <span
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--fh-t4)',
                }}
              >
                {perk.title}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--fh-t3)',
                }}
              >
                {perk.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Pioneer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 28,
            padding: 'clamp(24px, 3vw, 40px)',
            borderRadius: 18,
            border: '1px solid var(--fh-border)',
            background: 'var(--fh-surface)',
          }}
          className="fh-pioneer"
        >
          <style>{`
            @media (max-width: 720px) {
              .fh-pioneer { grid-template-columns: 1fr !important; }
            }
          `}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#27a644',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#27a644',
                  boxShadow: '0 0 10px rgba(39,166,68,0.6)',
                }}
              />
              {c.ctaBadge}
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: 'clamp(22px, 2.6vw, 32px)',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                fontWeight: 590,
                color: 'var(--fh-t1)',
              }}
            >
              {c.ctaTitle}
            </h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: 'var(--fh-t3)', maxWidth: 540 }}>
              {c.ctaSub}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 22px',
                borderRadius: 999,
                background: 'var(--fh-t1)',
                color: 'var(--fh-canvas)',
                fontSize: 14,
                fontWeight: 590,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {c.ctaBtn1}
              <ArrowUpRight style={{ width: 15, height: 15 }} />
            </Link>
            <Link
              href="/freelancers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 18px',
                borderRadius: 999,
                background: 'transparent',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t2)',
                fontSize: 14,
                fontWeight: 510,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {c.ctaBtn2}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  )
}
