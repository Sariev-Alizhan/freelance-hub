'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, UserCircle2, Briefcase, Star, Package, Film, X } from 'lucide-react'

type Steps = {
  profile: boolean
  experience: boolean
  featured: boolean
  service: boolean
  reel: boolean
}

type Data = {
  steps: Steps
  done: number
  total: number
  percent: number
}

type Item = {
  key: keyof Steps
  icon: typeof Check
  title: string
  hint: string
  href: string
}

const ITEMS: Item[] = [
  {
    key: 'profile',
    icon: UserCircle2,
    title: 'Заполните профиль',
    hint: 'Аватар + короткое описание (20+ символов)',
    href: '/profile/setup',
  },
  {
    key: 'experience',
    icon: Briefcase,
    title: 'Добавьте опыт работы',
    hint: 'Хотя бы одно место работы или проект',
    href: '/dashboard/experience',
  },
  {
    key: 'featured',
    icon: Star,
    title: 'Закрепите лучшую работу',
    hint: 'Выделите топ-проект в портфолио',
    href: '/dashboard?tab=portfolio',
  },
  {
    key: 'service',
    icon: Package,
    title: 'Создайте услугу',
    hint: 'Фикс-прайс пакет для клиентов',
    href: '/dashboard/services',
  },
  {
    key: 'reel',
    icon: Film,
    title: 'Загрузите Reel',
    hint: 'Короткое видео про вашу работу',
    href: '/reels',
  },
]

const DISMISS_KEY = 'fh.onboarding.dismissed'

export default function OnboardingChecklist() {
  const [data, setData] = useState<Data | null>(null)
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  useEffect(() => {
    fetch('/api/profile/onboarding')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [])

  if (!data || dismissed) return null
  if (data.percent === 100) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    setDismissed(true)
  }

  return (
    <div
      className="rounded-2xl border border-subtle bg-card p-5"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in oklab, var(--fh-primary) 6%, transparent), transparent 60%)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Настройка профиля</div>
          <div className="text-xs text-muted-foreground">
            {data.done} из {data.total} шагов · {data.percent}% готово
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Скрыть"
          className="p-1 rounded-lg text-muted-foreground hover:bg-subtle transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${data.percent}%`,
            background: 'var(--fh-primary)',
          }}
        />
      </div>

      <div className="space-y-1.5">
        {ITEMS.map(item => {
          const done = data.steps[item.key]
          const Icon = item.icon
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-subtle transition-colors"
            >
              <div
                className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                  done ? '' : 'border border-subtle'
                }`}
                style={done ? { background: 'var(--fh-primary)' } : undefined}
              >
                {done ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <Icon className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm ${
                    done ? 'text-muted-foreground line-through' : 'font-medium'
                  }`}
                >
                  {item.title}
                </div>
                {!done && (
                  <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {item.hint}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
