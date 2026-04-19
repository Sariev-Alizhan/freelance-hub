'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Clock, Users, Zap, TrendingUp } from 'lucide-react'
import PriceDisplay from '@/components/shared/PriceDisplay'
import FavoriteButton from '@/components/shared/FavoriteButton'
import PromoteModal from '@/components/shared/PromoteModal'
import { Order } from '@/lib/types'
import { CATEGORIES } from '@/lib/mock/categories'
import { useLang } from '@/lib/context/LanguageContext'

interface Props { order: Order; currentUserId?: string }

export default function OrderCard({ order: o, currentUserId }: Props) {
  const { t } = useLang()
  const to = t.ordersPage
  const category = CATEGORIES.find((c) => c.slug === o.category)
  const [showPromote, setShowPromote] = useState(false)
  const isOwner = !!currentUserId && currentUserId === o.client.id

  return (
    <>
      <div className="relative group/card">
        <FavoriteButton
          type="order"
          targetId={o.id}
          className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity"
        />

        <Link href={`/orders/${o.id}`}>
          <div
            className="card-hover h-full flex flex-col gap-4 transition-all"
            style={{
              padding: '20px',
              background: 'var(--fh-surface)',
              border: o.isPromoted
                ? '1px solid rgba(251,191,36,0.25)'
                : '1px solid var(--fh-border)',
              borderRadius: '10px',
            }}
          >
            {/* Badges row */}
            <div>
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {category && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ fontWeight: 590, background: `${category.color}14`, color: category.color, letterSpacing: '0.01em' }}
                  >
                    {category.label}
                  </span>
                )}
                {o.isUrgent && (
                  <span
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                    style={{ fontWeight: 590, background: 'rgba(229,72,77,0.1)', color: '#e5484d' }}
                  >
                    <Zap className="h-3 w-3" /> {to.urgentBadge}
                  </span>
                )}
                {o.isPromoted && (
                  <span
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                    style={{ fontWeight: 590, background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
                  >
                    <TrendingUp className="h-3 w-3" /> TOP
                  </span>
                )}
              </div>
              <h3
                className="line-clamp-2 leading-snug"
                style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', letterSpacing: '-0.02em', overflowWrap: 'break-word', wordBreak: 'break-word' }}
              >
                {o.title}
              </h3>
            </div>

            {/* Description */}
            <p
              className="line-clamp-2 leading-relaxed"
              style={{ fontSize: '12px', color: 'var(--fh-t3)', fontWeight: 400, letterSpacing: '-0.005em', overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
              {o.description}
            </p>

            {/* Skills */}
            {o.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {o.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-skill-bd)', color: 'var(--fh-t3)', fontWeight: 510 }}
                  >
                    {skill}
                  </span>
                ))}
                {o.skills.length > 3 && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-skill-bd)', color: 'var(--fh-t4)' }}
                  >
                    +{o.skills.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--fh-sep)' }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-primary)', letterSpacing: '-0.02em' }}>
                  {o.budget.min > 0 ? (
                    <>
                      <PriceDisplay amountRub={o.budget.min} prefix="" size="sm" />
                      <span style={{ color: 'var(--fh-t4)', fontWeight: 400 }}>{' — '}</span>
                      <PriceDisplay amountRub={o.budget.max} prefix="" size="sm" />
                    </>
                  ) : (
                    <span style={{ color: 'var(--fh-t3)', fontWeight: 400, fontSize: '12px' }}>{to.negotiable}</span>
                  )}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--fh-t4)' }}>
                  <Clock className="h-3 w-3" />
                  <span style={{ fontSize: '11px', fontWeight: 400 }}>{o.deadline}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src={o.client.avatar}
                    alt={o.client.name}
                    width={18}
                    height={18}
                    className="rounded-full"
                    unoptimized
                    style={{ border: '1px solid var(--fh-border-2)' }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>{o.client.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1" style={{ color: 'var(--fh-t4)' }}>
                    <Users className="h-3 w-3" />
                    <span style={{ fontSize: '11px', fontWeight: 400 }}>{o.responsesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Promote button — outside Link to avoid nested anchor, owner only */}
        {isOwner && !o.isPromoted && (
          <button
            onClick={e => { e.stopPropagation(); setShowPromote(true) }}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all"
            style={{
              padding: '4px 8px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.22)',
              color: '#fbbf24',
              fontSize: '11px',
              fontWeight: 590,
            }}
            aria-label="Promote order in feed"
          >
            <TrendingUp className="h-3 w-3" />
            Boost
          </button>
        )}
      </div>

      {showPromote && (
        <PromoteModal
          type="order"
          title={o.title}
          onClose={() => setShowPromote(false)}
        />
      )}
    </>
  )
}
