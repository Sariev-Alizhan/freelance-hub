'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Users, Briefcase, CheckCircle, Code2, TrendingUp } from 'lucide-react'
import { CATEGORIES } from '@/lib/mock/categories'

interface Stats {
  users: number
  freelancers: number
  openOrders: number
  completedOrders: number
  topCategories: { slug: string; count: number }[]
}

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setValue(Math.round(eased * target))
      if (elapsed < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  return <>{value.toLocaleString('ru-RU')}</>
}

export default function StatsClient({ stats }: { stats: Stats }) {
  const tiles = [
    { icon: Users,         label: 'Пользователей',     value: stats.users,           color: '#27a644' },
    { icon: Code2,         label: 'Фрилансеров',        value: stats.freelancers,     color: '#22c55e' },
    { icon: Briefcase,     label: 'Открытых заказов',   value: stats.openOrders,      color: '#f59e0b' },
    { icon: CheckCircle,   label: 'Выполнено заказов',  value: stats.completedOrders, color: '#38bdf8' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.2)' }}>
          <TrendingUp size={13} style={{ color: '#27a644' }} />
          <span style={{ fontSize: 12, color: '#27a644', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live Platform Stats</span>
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fh-t1)', marginBottom: 10 }}>
          FreelanceHub в цифрах
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fh-t4)', maxWidth: 440, margin: '0 auto' }}>
          Реальная статистика платформы — обновляется ежедневно
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 40 }}>
        {tiles.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            style={{
              padding: '24px 20px', borderRadius: 16, textAlign: 'center',
              background: 'var(--card)', border: '1px solid var(--fh-border-2)',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
              background: `${color}14`, border: `1px solid ${color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              <AnimatedNumber target={value} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--fh-t4)', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top categories */}
      {stats.topCategories.length > 0 && (
        <div style={{
          padding: '28px 28px', borderRadius: 20,
          background: 'var(--card)', border: '1px solid var(--fh-border-2)',
          marginBottom: 40,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fh-t1)', marginBottom: 20 }}>
            Топ категорий по заказам
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.topCategories.map(({ slug, count }, i) => {
              const cat = CATEGORIES.find(c => c.slug === slug)
              const max = stats.topCategories[0]?.count || 1
              const pct = Math.round((count / max) * 100)
              return (
                <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--fh-t4)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--fh-t2)', width: 130, flexShrink: 0, fontWeight: 510 }}>
                    {cat?.label ?? slug}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--fh-surface-2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3,
                      background: cat?.color ?? '#27a644',
                      transition: 'width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--fh-t4)', width: 40, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/orders"
          style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: '#27a644', color: '#fff', textDecoration: 'none',
          }}
        >
          Смотреть заказы
        </Link>
        <Link
          href="/freelancers"
          style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
            color: 'var(--fh-t2)', textDecoration: 'none',
          }}
        >
          Найти фрилансера
        </Link>
      </div>
    </div>
  )
}
