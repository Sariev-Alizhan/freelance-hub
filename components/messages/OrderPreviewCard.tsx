'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

interface Order {
  id: string
  title: string
  status: string | null
  category: string | null
  budget_min: number | null
  budget_max: number | null
}

// In-memory cache so re-renders of a chat don't re-fetch the same order.
const cache = new Map<string, Order | null>()
const inflight = new Map<string, Promise<Order | null>>()

// Match /orders/<uuid> in absolute or relative form.
// UUID v4 pattern, permissive: 8-4-4-4-12 hex groups.
const ORDER_URL_RE = /(?:^|\s|[(\[{])(?:https?:\/\/[^\s]+)?\/orders\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i

export function extractOrderId(text: string | null | undefined): string | null {
  if (!text) return null
  const m = text.match(ORDER_URL_RE)
  return m ? m[1].toLowerCase() : null
}

async function loadOrder(id: string): Promise<Order | null> {
  if (cache.has(id)) return cache.get(id) ?? null
  const existing = inflight.get(id)
  if (existing) return existing

  const p = (async () => {
    try {
      const r = await fetch(`/api/orders/${id}/preview`)
      if (!r.ok) {
        cache.set(id, null)
        return null
      }
      const j = await r.json()
      const o: Order | null = j?.order ?? null
      cache.set(id, o)
      return o
    } catch {
      cache.set(id, null)
      return null
    } finally {
      inflight.delete(id)
    }
  })()
  inflight.set(id, p)
  return p
}

export default function OrderPreviewCard({ orderId, isMine }: {
  orderId: string
  isMine: boolean
}) {
  const cached = cache.get(orderId)
  const hasCached = cache.has(orderId)
  const [fetched, setFetched] = useState<{ id: string; order: Order | null } | null>(null)

  useEffect(() => {
    if (hasCached) return
    let live = true
    loadOrder(orderId).then(o => {
      if (!live) return
      setFetched({ id: orderId, order: o })
    })
    return () => { live = false }
  }, [orderId, hasCached])

  const order = hasCached
    ? (cached ?? null)
    : (fetched && fetched.id === orderId ? fetched.order : null)
  const loading = !hasCached && !(fetched && fetched.id === orderId)

  if (loading) {
    return (
      <div
        style={{
          marginTop: 6, padding: '10px 12px', borderRadius: 12,
          background: isMine ? 'rgba(255,255,255,0.12)' : 'var(--fh-surface-2)',
          border: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : 'var(--fh-sep)'}`,
          fontSize: 12,
          color: isMine ? 'rgba(255,255,255,0.8)' : 'var(--fh-t3)',
          minWidth: 180,
        }}
      >
        Загрузка заказа…
      </div>
    )
  }
  if (!order) return null

  const budget = order.budget_min && order.budget_max
    ? `${order.budget_min.toLocaleString()}–${order.budget_max.toLocaleString()} ₸`
    : order.budget_min ? `от ${order.budget_min.toLocaleString()} ₸` : null

  return (
    <Link
      href={`/orders/${order.id}`}
      style={{
        display: 'block', textDecoration: 'none',
        marginTop: 6, padding: '10px 12px', borderRadius: 12,
        background: isMine ? 'rgba(255,255,255,0.12)' : 'var(--fh-surface-2)',
        border: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : 'var(--fh-sep)'}`,
        minWidth: 220,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Briefcase
          style={{ width: 12, height: 12, color: isMine ? 'rgba(255,255,255,0.8)' : 'var(--fh-primary)' }}
        />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: isMine ? 'rgba(255,255,255,0.8)' : 'var(--fh-primary)',
        }}>
          Заказ
        </span>
        {order.status && (
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--fh-primary-muted)',
            color: isMine ? '#fff' : 'var(--fh-primary)',
            fontWeight: 600,
          }}>
            {order.status}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 13, fontWeight: 600, lineHeight: 1.35,
          color: isMine ? '#fff' : 'var(--fh-t1)',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}
      >
        {order.title}
      </div>
      {(budget || order.category) && (
        <div style={{
          marginTop: 4, fontSize: 11,
          color: isMine ? 'rgba(255,255,255,0.75)' : 'var(--fh-t3)',
          display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {budget && (
            <span style={{
              fontWeight: 600,
              color: isMine ? 'rgba(255,255,255,0.9)' : 'var(--fh-primary)',
            }}>
              {budget}
            </span>
          )}
          {budget && order.category && <span>·</span>}
          {order.category && <span>{order.category}</span>}
        </div>
      )}
    </Link>
  )
}
