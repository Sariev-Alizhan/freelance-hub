'use client'
import { motion } from 'framer-motion'
import { MessageCircle, Star, Zap, BadgeCheck, Users, TrendingUp } from 'lucide-react'

// ── Fake phone screen content ─────────────────────────────────────────────────
function PhoneScreen() {
  const posts = [
    { name: 'Алижан С.', role: 'Full-stack разработчик', time: '2м', text: 'Завершил проект по интеграции AI в CRM. Результат — конверсия выросла на 34% 🚀', likes: 24, verified: true },
    { name: 'Дана К.',   role: 'UX/UI Designer',         time: '15м', text: 'Запустила новый лендинг для клиента. Сделала за 2 дня вместо 5 — AI помог с wireframes ✅', likes: 41, verified: true },
  ]
  const stories = ['А', 'Д', 'М', 'Е', 'С', 'Р']

  return (
    <div style={{
      background: '#0a0a12',
      height: '100%',
      overflowY: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 6px', fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
        <span>9:41</span>
        <div style={{ width: 80, height: 18, borderRadius: 99, background: '#111', border: '1px solid rgba(255,255,255,0.08)' }} />
        <span>●●●</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px 10px' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>FreelanceHub</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Лента · Казахстан</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={12} color="rgba(255,255,255,0.5)" />
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={12} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </div>

      {/* Stories bar */}
      <div style={{ display: 'flex', gap: 10, padding: '6px 14px 12px', overflowX: 'hidden' }}>
        {/* Add story */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(113,112,255,0.15)', border: '1.5px dashed rgba(113,112,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'rgba(113,112,255,0.8)' }}>+</div>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Добавить</span>
        </div>
        {/* Story bubbles */}
        {stories.map((s, i) => (
          <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `hsl(${(i * 60) % 360}, 60%, 35%)`,
              border: `2px solid ${i < 2 ? '#7170ff' : 'rgba(255,255,255,0.12)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff',
            }}>
              {s}
            </div>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>User {i + 1}</span>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div style={{ flex: 1, overflowY: 'hidden', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.map((p, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 120}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  {p.verified && <BadgeCheck size={10} color="#7170ff" />}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{p.role} · {p.time}</div>
              </div>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 8 }}>{p.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                <Star size={9} /> {p.likes}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                <MessageCircle size={9} /> 5
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '10px 0 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {['🏠', '🔍', '＋', '💬', '👤'].map((icon, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: i === 0 ? 'rgba(113,112,255,0.15)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: i === 2 ? 22 : 16,
            }}>{icon}</div>
            <div style={{ width: i === 0 ? 4 : 0, height: 4, borderRadius: 2, background: '#7170ff' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feature chips ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Zap      size={18} color="#7170ff" />, bg: 'rgba(113,112,255,0.1)', border: 'rgba(113,112,255,0.2)', title: '0% комиссий', sub: 'Никаких скрытых платежей — никогда' },
  { icon: <MessageCircle size={18} color="#27a644" />, bg: 'rgba(39,166,68,0.08)', border: 'rgba(39,166,68,0.2)', title: 'Мессенджер', sub: 'Реакции, истории, typing indicator' },
  { icon: <Star     size={18} color="#fbbf24" />, bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', title: 'Рейтинг и отзывы', sub: 'Только реальные клиенты' },
  { icon: <Users    size={18} color="#06b6d4" />, bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)',  title: 'Социальная сеть', sub: 'Лента, сторис, друзья' },
  { icon: <TrendingUp size={18} color="#ec4899" />, bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)', title: 'AI-помощник', sub: 'Подбор специалиста за 3 секунды' },
  { icon: <BadgeCheck size={18} color="#a855f7" />, bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', title: 'Верификация', sub: 'Проверенные фрилансеры с бейджем' },
]

// ── Main export ───────────────────────────────────────────────────────────────
export default function AppPreviewSection() {
  return (
    <section style={{
      background: '#060612',
      padding: 'clamp(60px, 10vw, 100px) 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top gradient from hero */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to bottom, rgba(6,6,18,1) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 72px)' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99, marginBottom: 20,
            background: 'rgba(113,112,255,0.1)',
            border: '1px solid rgba(113,112,255,0.25)',
          }}>
            <Zap size={13} color="#7170ff" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7170ff', letterSpacing: '0.02em' }}>
              Платформа нового поколения
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 16,
          }}>
            Всё что нужно<br />
            <span style={{
              background: 'linear-gradient(90deg, #7170ff, #a855f7, #7170ff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              в одном приложении
            </span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 420, margin: '0 auto' }}>
            Фриланс-платформа с лентой, сторисами, мессенджером и AI — как соцсеть, только для работы
          </p>
        </motion.div>

        {/* Phone + features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'center',
        }}>
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              position: 'relative',
              width: 'min(260px, 75vw)',
              animation: 'floatPhone 4s ease-in-out infinite',
            }}>
              <style>{`
                @keyframes floatPhone {
                  0%,100% { transform: translateY(0px) rotate(-1deg); }
                  50%      { transform: translateY(-12px) rotate(1deg); }
                }
              `}</style>

              {/* Glow behind phone */}
              <div style={{
                position: 'absolute', inset: -20,
                background: 'radial-gradient(ellipse, rgba(113,112,255,0.25) 0%, transparent 65%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }} />

              {/* Phone frame */}
              <div style={{
                position: 'relative', zIndex: 1,
                background: '#111118',
                borderRadius: 38,
                padding: '10px 8px',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                aspectRatio: '9/19',
                overflow: 'hidden',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                  width: 90, height: 22, borderRadius: 99,
                  background: '#000',
                  zIndex: 10,
                }} />
                <div style={{ height: '100%', borderRadius: 30, overflow: 'hidden' }}>
                  <PhoneScreen />
                </div>
              </div>

              {/* Side buttons */}
              <div style={{ position: 'absolute', right: -4, top: '25%', width: 3, height: 50, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', left: -4, top: '20%', width: 3, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ position: 'absolute', left: -4, top: 'calc(20% + 40px)', width: 3, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
            </div>
          </motion.div>

          {/* Feature chips grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                style={{
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  borderRadius: 16,
                  padding: '16px 14px',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 10,
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>{f.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{f.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
        background: 'linear-gradient(to bottom, transparent, rgba(6,6,18,0.7))',
        pointerEvents: 'none',
      }} />
    </section>
  )
}
