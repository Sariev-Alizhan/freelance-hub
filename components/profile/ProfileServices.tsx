'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Clock, RefreshCw, Package, Loader2, Plus, PencilLine, ShoppingBag } from 'lucide-react'

export interface ServiceTier {
  id:            string
  tier:          'basic' | 'standard' | 'premium'
  title:         string
  price:         number
  delivery_days: number
  revisions:     number
  description:   string | null
  features:      string[]
}

export interface Service {
  id:              string
  title:           string
  description:     string
  category:        string
  cover_image:     string | null
  skills:          string[]
  purchases_count: number
  tiers:           ServiceTier[]
}

const TIER_ORDER = { basic: 0, standard: 1, premium: 2 } as const

export default function ProfileServices({
  services, isOwnProfile, viewerLoggedIn,
}: {
  services: Service[]
  isOwnProfile: boolean
  viewerLoggedIn: boolean
}) {
  if (services.length === 0) {
    if (!isOwnProfile) return null
    return (
      <div style={{
        padding: 16, borderRadius: 12,
        background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--fh-primary-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShoppingBag size={16} style={{ color: 'var(--fh-primary)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)' }}>Publish a service</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>
            Fixed-price packages get ~2× the conversion of open orders
          </p>
        </div>
        <Link href="/dashboard/services" style={{
          padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 590,
          background: 'var(--fh-primary)', color: '#fff', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Plus size={13} /> Create
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', margin: 0 }}>
          Services
          <span style={{ fontSize: 11, color: 'var(--fh-t4)', marginLeft: 8, fontWeight: 500 }}>
            {services.length}
          </span>
        </h2>
        {isOwnProfile && (
          <Link href="/dashboard/services" style={{
            fontSize: 12, color: 'var(--fh-primary)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <PencilLine size={12} /> Manage
          </Link>
        )}
      </div>

      {services.map(svc => (
        <ServiceCard
          key={svc.id}
          service={svc}
          isOwnProfile={isOwnProfile}
          viewerLoggedIn={viewerLoggedIn}
        />
      ))}
    </div>
  )
}

function ServiceCard({
  service, isOwnProfile, viewerLoggedIn,
}: {
  service: Service
  isOwnProfile: boolean
  viewerLoggedIn: boolean
}) {
  const sortedTiers = [...service.tiers].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])
  const [activeTier, setActiveTier] = useState(sortedTiers[0]?.id)
  const selected = sortedTiers.find(t => t.id === activeTier) ?? sortedTiers[0]
  const router = useRouter()
  const [buying, setBuying] = useState(false)
  const [error, setError]   = useState('')

  async function buy() {
    setError('')
    if (!viewerLoggedIn) {
      router.push('/login')
      return
    }
    if (!selected) return
    setBuying(true)
    try {
      const r = await fetch(`/api/services/${service.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tier: selected.tier }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      router.push(`/orders/${j.order_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
      setBuying(false)
    }
  }

  if (!selected) return null

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px' }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)',
          letterSpacing: '-0.01em',
        }}>
          {service.title}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t3)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {service.description}
        </p>
        {service.purchases_count > 0 && (
          <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>
            <Package size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
            {service.purchases_count} {service.purchases_count === 1 ? 'order' : 'orders'} placed
          </p>
        )}
      </div>

      {/* Tier tabs */}
      {sortedTiers.length > 1 && (
        <div style={{
          display: 'flex', borderTop: '1px solid var(--fh-border)',
          borderBottom: '1px solid var(--fh-border)',
        }}>
          {sortedTiers.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTier(t.id)}
              style={{
                flex: 1, padding: '10px 6px', border: 'none',
                background: t.id === activeTier ? 'var(--fh-surface-2)' : 'transparent',
                color: t.id === activeTier ? 'var(--fh-t1)' : 'var(--fh-t4)',
                fontSize: 12, fontWeight: t.id === activeTier ? 600 : 500,
                cursor: 'pointer', textTransform: 'capitalize',
                borderBottom: t.id === activeTier ? '2px solid var(--fh-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t.tier}
            </button>
          ))}
        </div>
      )}

      {/* Selected tier details */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)' }}>
              {selected.title}
            </p>
            {selected.description && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fh-t3)', lineHeight: 1.5 }}>
                {selected.description}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
              ₽{selected.price.toLocaleString('ru-RU')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--fh-t3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} style={{ color: 'var(--fh-t4)' }} />
            {selected.delivery_days} day{selected.delivery_days === 1 ? '' : 's'} delivery
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={13} style={{ color: 'var(--fh-t4)' }} />
            {selected.revisions === -1 ? 'Unlimited' : selected.revisions} revision{selected.revisions === 1 ? '' : 's'}
          </span>
        </div>

        {selected.features.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selected.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--fh-t2)' }}>
                <Check size={13} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                {f}
              </li>
            ))}
          </ul>
        )}

        {error && <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>}

        {!isOwnProfile && (
          <button
            onClick={buy}
            disabled={buying}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 10, border: 'none',
              background: 'var(--fh-primary)', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: buying ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {buying
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Placing order…</>
              : <>Continue (₽{selected.price.toLocaleString('ru-RU')})</>}
          </button>
        )}
      </div>
    </div>
  )
}
