'use client'
import { useState } from 'react'
import { X, TrendingUp, Copy, Check, MessageCircle } from 'lucide-react'

interface Props {
  type: 'order' | 'freelancer'
  title: string
  onClose: () => void
}

const DONATE_CARDS = [
  { label: 'Kaspi',        number: '4400 4303 1167 6685', raw: '4400430311676685', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
  { label: 'Freedom Bank', number: '4002 8900 3407 5055', raw: '4002890034075055', color: '#27a644', bg: 'rgba(39,166,68,0.06)',   border: 'rgba(39,166,68,0.18)' },
]

export default function PromoteModal({ type, title, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(raw: string, label: string) {
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--popover)', border: '1px solid var(--fh-border-2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--fh-sep)' }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)' }}>
              <TrendingUp className="h-4 w-4" style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                Продвижение в ленте
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
                {type === 'order' ? 'Заказ' : 'Профиль'}: {title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
            style={{ color: 'var(--fh-t4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* How it works */}
          <div className="rounded-xl p-4" style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px' }}>
              Как работает продвижение?
            </p>
            <ul className="space-y-1.5">
              {[
                'Ваш профиль/заказ показывается первым в ленте',
                'Золотой бейдж «TOP» привлекает внимание',
                'Срок продвижения — 7 дней с момента оплаты',
                'Продление — повторная оплата',
              ].map(item => (
                <li key={item} className="flex items-start gap-2" style={{ fontSize: '13px', color: 'var(--fh-t3)', fontWeight: 400 }}>
                  <span style={{ color: '#fbbf24', marginTop: '1px' }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Стоимость / 7 дней</p>
              <p style={{ fontSize: '22px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                2 000 ₸ <span style={{ fontSize: '14px', color: 'var(--fh-t3)', fontWeight: 400 }}>/ ~400 ₽ / $4.5</span>
              </p>
            </div>
            <TrendingUp className="h-8 w-8" style={{ color: '#fbbf24', opacity: 0.4 }} />
          </div>

          {/* Pay instructions */}
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)', fontWeight: 400 }}>
            Оплатите на карту ниже и напишите в Telegram{' '}
            <a href="https://t.me/zhanmate_zhan" target="_blank" rel="noopener noreferrer" style={{ color: '#7170ff', fontWeight: 510 }}>
              @zhanmate_zhan
            </a>{' '}
            с подтверждением — активируем в течение часа.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-2.5">
            {DONATE_CARDS.map(card => (
              <div
                key={card.label}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
              >
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 590, color: card.color, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 590, color: card.color, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                    {card.number}
                  </p>
                </div>
                <button
                  onClick={() => copy(card.raw, card.label)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg transition-all"
                  style={{ background: `${card.color}20`, color: card.color }}
                  title="Скопировать"
                >
                  {copied === card.label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>

          {/* Telegram CTA */}
          <a
            href="https://t.me/zhanmate_zhan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl transition-all"
            style={{
              padding: '11px',
              background: 'rgba(113,112,255,0.08)',
              border: '1px solid rgba(113,112,255,0.2)',
              color: '#7170ff',
              fontSize: '14px',
              fontWeight: 510,
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.08)' }}
          >
            <MessageCircle className="h-4 w-4" />
            Написать в Telegram после оплаты
          </a>
        </div>
      </div>
    </div>
  )
}
