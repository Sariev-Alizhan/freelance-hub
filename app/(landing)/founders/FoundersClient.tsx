'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Crown, Sparkles, MessageSquare, Trophy, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE, SECONDARY_LINK_STYLE } from '@/components/landing/_section-atoms'

const TOTAL_SPOTS = 100
const SPOTS_TAKEN = 1

const CONTENT = {
  en: {
    eyebrow: 'Founders 100',
    pre: 'Be one of the',
    accent: 'first 100.',
    sub: 'The platform just launched. The first 100 freelancers shape what FreelanceHub becomes — and lock in benefits that no one after will ever get.',
    counterPrefix: 'Spots taken',
    counterOf: 'of',
    counterSuffix: 'open',
    perksHeading: 'What you lock in — forever',
    perks: [
      { icon: Crown, title: 'Free Pro for life', text: 'All Pro features ($36/year, paid by everyone after) — yours, no expiry, no string attached.' },
      { icon: Trophy, title: '"Founder" badge', text: 'A permanent visible mark on your profile. The next 1,000,000 freelancers can never get it.' },
      { icon: Sparkles, title: 'Top placement in search', text: 'Founders rank above non-Founders in category and city pages. Real visibility while we grow.' },
      { icon: MessageSquare, title: 'Direct line to the founder', text: 'Telegram DM with Alizhan. Your feature requests get priority. You shape the roadmap.' },
      { icon: ShieldCheck, title: '0% commission, locked in writing', text: 'Future versions of FreelanceHub may add fees. Founders are exempt — for life.' },
    ],
    fitHeading: 'Who this is for',
    fitItems: [
      'You\'re a freelancer or solo agency in CIS / Eastern Europe / MENA.',
      'You already work — portfolio, deals closed, real clients.',
      'You want to be early on a fair platform and get paid for it.',
    ],
    ctaTitle: 'Apply now — manual review, 24h response',
    ctaSub: 'Register, fill your freelancer profile, and we\'ll verify. Founders status assigned manually.',
    ctaBtn1: 'Register & apply',
    ctaBtn2: 'See pricing →',
    ctaTag: 'Limited to first 100 — no extensions',
    metaTitle: 'Founders 100',
    metaDesc: 'The first 100 freelancers on FreelanceHub get free Pro for life, a "Founder" badge, top placement, and a direct line to the founder. 0% commission locked in writing.',
  },
  ru: {
    eyebrow: 'Founders 100',
    pre: 'Стань одним из',
    accent: 'первых 100.',
    sub: 'Платформа только запустилась. Первые 100 фрилансеров формируют то, чем станет FreelanceHub — и закрепляют за собой бонусы, которых ни у кого после не будет.',
    counterPrefix: 'Занято',
    counterOf: 'из',
    counterSuffix: 'открыто',
    perksHeading: 'Что ты закрепишь за собой — навсегда',
    perks: [
      { icon: Crown, title: 'Pro бесплатно навсегда', text: 'Все функции Pro ($36/год для остальных) — твои, без срока, без условий.' },
      { icon: Trophy, title: 'Бейдж «Founder»', text: 'Постоянная пометка на профиле. Следующий миллион фрилансеров никогда такой не получит.' },
      { icon: Sparkles, title: 'Топ-позиция в поиске', text: 'Founders выше остальных в категориях и городах. Реальная видимость, пока мы растём.' },
      { icon: MessageSquare, title: 'Прямой контакт с фаундером', text: 'Telegram-DM с Алижаном. Твои фичи в приоритете. Ты формируешь roadmap.' },
      { icon: ShieldCheck, title: '0% комиссии, закреплено письменно', text: 'Будущие версии FreelanceHub могут ввести fee. Founders — освобождены пожизненно.' },
    ],
    fitHeading: 'Кому это подходит',
    fitItems: [
      'Ты фрилансер или соло-агентство в СНГ / Восточной Европе / MENA.',
      'Ты уже работаешь — есть портфолио, закрытые сделки, реальные клиенты.',
      'Ты хочешь быть ранним на честной платформе и получить за это.',
    ],
    ctaTitle: 'Подай заявку — ручная проверка, ответ за 24ч',
    ctaSub: 'Зарегистрируйся, заполни профиль фрилансера — мы верифицируем. Статус Founder выдаётся вручную.',
    ctaBtn1: 'Регистрация и заявка',
    ctaBtn2: 'Тарифы →',
    ctaTag: 'Только первые 100 — продлений не будет',
    metaTitle: 'Founders 100',
    metaDesc: 'Первые 100 фрилансеров на FreelanceHub получают бесплатный Pro навсегда, бейдж «Founder», топ в поиске и прямой контакт с фаундером. 0% комиссии закреплено письменно.',
  },
  kz: {
    eyebrow: 'Founders 100',
    pre: 'Алғашқы',
    accent: '100-дің бірі бол.',
    sub: 'Платформа жаңа ғана іске қосылды. Алғашқы 100 фрилансер FreelanceHub нені қалыптастыратынын анықтайды — және ешкімде болмайтын бонустарды бекітеді.',
    counterPrefix: 'Алынды',
    counterOf: '/',
    counterSuffix: 'ашық',
    perksHeading: 'Сен мәңгілік бекітетін нәрсе',
    perks: [
      { icon: Crown, title: 'Pro мәңгі тегін', text: 'Барлық Pro мүмкіндіктері ($36/жыл басқалар үшін) — мерзімсіз, шартсыз сенікі.' },
      { icon: Trophy, title: '«Founder» бейджі', text: 'Профильдегі тұрақты белгі. Кейінгі миллион фрилансер мұны алмайды.' },
      { icon: Sparkles, title: 'Іздеуде жоғарғы орын', text: 'Founders санаттарда және қалаларда басқалардан жоғары. Біз өсіп жатқанда нақты көрінім.' },
      { icon: MessageSquare, title: 'Фаундермен тікелей байланыс', text: 'Алижанмен Telegram-DM. Сенің сұраныстарың — басымдықта. Сен roadmap қалыптастырасың.' },
      { icon: ShieldCheck, title: '0% комиссия, жазбаша бекітілген', text: 'Болашақта FreelanceHub комиссия енгізуі мүмкін. Founders — өмір бойы босатылған.' },
    ],
    fitHeading: 'Бұл кімге арналған',
    fitItems: [
      'Сен фрилансер немесе ТМД / Шығыс Еуропа / MENA-да жалғыз агенттіксің.',
      'Сен жұмыс істеп жатырсың — портфолио, жабылған мәмілелер, нақты клиенттер бар.',
      'Сен әділ платформада ерте болғың келеді — оны үшін қайтым алғың келеді.',
    ],
    ctaTitle: 'Өтінім жасау — қолмен тексеру, 24 сағат ішінде жауап',
    ctaSub: 'Тіркел, фрилансер профилін толтыр — біз тексереміз. Founder мәртебесі қолмен беріледі.',
    ctaBtn1: 'Тіркеу және өтінім',
    ctaBtn2: 'Тарифтер →',
    ctaTag: 'Тек алғашқы 100 — ұзартусыз',
    metaTitle: 'Founders 100',
    metaDesc: 'FreelanceHub-тағы алғашқы 100 фрилансер тегін Pro, «Founder» бейджі, іздеуде жоғарғы орын және фаундермен тікелей байланыс алады. 0% комиссия жазбаша бекітілген.',
  },
}

export default function FoundersClient() {
  const { lang } = useLang()
  const c = (CONTENT as Record<string, typeof CONTENT.en>)[lang] ?? CONTENT.en
  const remaining = TOTAL_SPOTS - SPOTS_TAKEN

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <SectionShell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'clamp(40px, 5vw, 60px)' }}>
          <EditorialHeading
            eyebrow={c.eyebrow}
            pre={c.pre}
            accent={c.accent}
            sub={c.sub}
          />

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 14,
              padding: '20px 24px',
              borderRadius: 14,
              border: '1px solid var(--fh-border)',
              background: 'var(--card)',
              alignSelf: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fh-t4)' }}>
              {c.counterPrefix}
            </span>
            <span style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fh-t1)', lineHeight: 1 }}>
              {SPOTS_TAKEN}
            </span>
            <span style={{ fontSize: 14, color: 'var(--fh-t4)' }}>{c.counterOf}</span>
            <span style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fh-t3)', lineHeight: 1 }}>
              {TOTAL_SPOTS}
            </span>
            <span style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#27a644',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: '#27a644', boxShadow: '0 0 10px rgba(39,166,68,0.6)' }} />
              {remaining} {c.counterSuffix}
            </span>
          </motion.div>
        </div>
      </SectionShell>

      {/* ── Perks ─────────────────────────────────────────────── */}
      <SectionShell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'clamp(32px, 4vw, 56px)' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 590, letterSpacing: '-0.025em', color: 'var(--fh-t1)' }}>
            {c.perksHeading}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {c.perks.map((perk, i) => {
              const Icon = perk.icon
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                  style={{
                    background: 'var(--card)',
                    padding: 'clamp(22px, 2.4vw, 32px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    minHeight: 200,
                  }}
                >
                  <Icon style={{ width: 22, height: 22, color: '#27a644' }} />
                  <span style={{ fontSize: 17, fontWeight: 590, letterSpacing: '-0.015em', color: 'var(--fh-t1)' }}>
                    {perk.title}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--fh-t3)' }}>
                    {perk.text}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </SectionShell>

      {/* ── Fit ─────────────────────────────────────────────── */}
      <SectionShell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24, maxWidth: 720 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 590, letterSpacing: '-0.025em', color: 'var(--fh-t1)' }}>
            {c.fitHeading}
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {c.fitItems.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, fontSize: 15.5, lineHeight: 1.6, color: 'var(--fh-t2)' }}>
                <span aria-hidden style={{
                  flexShrink: 0, marginTop: 10,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#27a644', boxShadow: '0 0 8px rgba(39,166,68,0.5)',
                }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(64px, 10vw, 128px) clamp(20px, 4vw, 48px)',
        background: 'var(--fh-canvas)',
        borderTop: '1px solid var(--fh-sep)',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 50% 120%, rgba(39,166,68,0.12) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{
            position: 'relative',
            maxWidth: 880,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 24,
            padding: 'clamp(28px, 4vw, 48px) 0',
            borderTop: '1px solid var(--fh-sep)',
            borderBottom: '1px solid var(--fh-sep)',
          }}
        >
          <span aria-hidden style={{ width: 40, height: 2, background: '#27a644', boxShadow: '0 0 18px rgba(39,166,68,0.55)', borderRadius: 2 }} />

          <h2 style={{
            margin: 0,
            fontSize: 'clamp(26px, 3.6vw, 44px)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            fontWeight: 700,
            color: 'var(--fh-t1)',
            maxWidth: 700,
          }}>
            {c.ctaTitle}
          </h2>

          <p style={{ margin: 0, fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.55, color: 'var(--fh-t3)', maxWidth: 580 }}>
            {c.ctaSub}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 4 }}>
            <Link
              href="/auth/register?ref=founders"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 24px', borderRadius: 999,
                background: 'var(--fh-t1)', color: 'var(--fh-canvas)',
                fontSize: 15, fontWeight: 590, letterSpacing: '-0.01em',
                textDecoration: 'none',
                transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {c.ctaBtn1}
              <ArrowUpRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/pricing" style={{ ...SECONDARY_LINK_STYLE, paddingLeft: 12 }}>
              {c.ctaBtn2}
            </Link>
          </div>

          <p style={{
            margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--fh-t4)',
          }}>
            {c.ctaTag}
          </p>
        </motion.div>
      </section>
    </>
  )
}
