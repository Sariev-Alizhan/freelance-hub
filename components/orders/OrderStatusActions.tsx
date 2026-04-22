'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle, XCircle, Clock, Star, ChevronRight,
  Users, Loader2, CheckCheck, AlertCircle, Shield,
} from 'lucide-react'

interface Response {
  id: string
  message: string
  proposed_price: number | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  profiles: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
  freelancer_profiles: { title: string | null; level: string | null; rating: number | null; completed_orders: number | null } | null
}

const LEVEL_LABELS: Record<string, string> = {
  new: 'Newcomer', junior: 'Junior', middle: 'Middle', senior: 'Senior', top: 'TOP',
}
const LEVEL_COLOR: Record<string, string> = {
  new: '#62666d', junior: '#27a644', middle: '#27a644', senior: '#27a644', top: '#fbbf24',
}

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 3600) return `${Math.floor(d / 60)} min ago`
  if (d < 86400) return `${Math.floor(d / 3600)} hr ago`
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

interface Props {
  orderId: string
  orderStatus: string
  isOwner: boolean
}

export default function OrderStatusActions({ orderId, orderStatus, isOwner }: Props) {
  const [responses, setResponses] = useState<Response[]>([])
  const [loading,   setLoading]   = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [status,    setStatus]    = useState(orderStatus)

  useEffect(() => {
    if (!isOwner) return
    fetch(`/api/orders/${orderId}/responses`)
      .then(r => r.json())
      .then(d => setResponses(d.responses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId, isOwner])

  async function act(responseId: string, action: 'accept' | 'reject') {
    setActioning(responseId)
    try {
      const r = await fetch(`/api/orders/${orderId}/responses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, action }),
      })
      if (r.ok) {
        setResponses(prev =>
          prev.map(res =>
            res.id === responseId
              ? { ...res, status: action === 'accept' ? 'accepted' : 'rejected' }
              : res
          )
        )
        if (action === 'accept') setStatus('in_progress')
      }
    } finally {
      setActioning(null)
    }
  }

  async function markComplete() {
    const r = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    if (r.ok) setStatus('completed')
  }

  if (!isOwner) return null

  const pending  = responses.filter(r => r.status === 'pending')
  const accepted = responses.filter(r => r.status === 'accepted')
  const rejected = responses.filter(r => r.status === 'rejected')

  return (
    <div className="space-y-4">
      {/* Order status banner */}
      {status !== 'open' && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: status === 'completed'
              ? 'rgba(39,166,68,0.06)'
              : status === 'in_progress'
              ? 'rgba(39,166,68,0.06)'
              : 'rgba(229,72,77,0.06)',
            border: `1px solid ${
              status === 'completed'
                ? 'rgba(39,166,68,0.2)'
                : status === 'in_progress'
                ? 'rgba(39,166,68,0.2)'
                : 'rgba(229,72,77,0.2)'
            }`,
          }}
        >
          {status === 'completed' ? (
            <CheckCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#27a644' }} />
          ) : status === 'in_progress' ? (
            <Clock className="h-4 w-4 flex-shrink-0" style={{ color: '#27a644' }} />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#e5484d' }} />
          )}
          <span style={{
            fontSize: '13px',
            fontWeight: 510,
            color: status === 'completed' ? '#27a644' : status === 'in_progress' ? '#27a644' : '#e5484d',
          }}>
            {status === 'completed' ? 'Order completed' : status === 'in_progress' ? 'In progress' : 'Order cancelled'}
          </span>
          {status === 'in_progress' && (
            <button
              onClick={markComplete}
              className="ml-auto flex items-center gap-1.5 transition-all"
              style={{
                padding: '4px 12px',
                borderRadius: '5px',
                background: '#27a644',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 590,
              }}
            >
              <CheckCircle className="h-3.5 w-3.5" /> Complete
            </button>
          )}
        </div>
      )}

      {/* Responses panel */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: '#62666d' }} />
            <span style={{ fontSize: '13px', fontWeight: 590, color: '#f7f8f8', letterSpacing: '-0.01em' }}>
              Applications
            </span>
          </div>
          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <span
                className="rounded-full"
                style={{
                  padding: '1px 8px',
                  background: 'rgba(39,166,68,0.12)',
                  border: '1px solid rgba(39,166,68,0.25)',
                  fontSize: '11px',
                  fontWeight: 590,
                  color: '#27a644',
                }}
              >
                {pending.length} new
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2" style={{ color: '#62666d' }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span style={{ fontSize: '13px' }}>Loading applications…</span>
          </div>
        ) : responses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Users className="h-8 w-8" style={{ color: '#4a4f57' }} />
            <p style={{ fontSize: '13px', color: '#62666d', fontWeight: 400 }}>No applications yet</p>
            <p style={{ fontSize: '12px', color: '#4a4f57' }}>They will appear here once freelancers start applying</p>
          </div>
        ) : (
          <div>
            {[...pending, ...accepted, ...rejected].map((resp, idx) => {
              const name   = resp.profiles?.full_name || resp.profiles?.username || 'Freelancer'
              const avatar = resp.profiles?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`
              const fp     = resp.freelancer_profiles
              const level  = fp?.level ?? 'new'
              const isPending  = resp.status === 'pending'
              const isAccepted = resp.status === 'accepted'

              return (
                <div
                  key={resp.id}
                  className="px-4 py-4"
                  style={{
                    borderBottom: idx < responses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: isAccepted ? 'rgba(39,166,68,0.03)' : 'transparent',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={avatar}
                      alt={name}
                      width={36}
                      height={36}
                      className="rounded-lg flex-shrink-0 mt-0.5"
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={
                            resp.profiles?.username
                              ? `/u/${resp.profiles.username}`
                              : `/freelancers/${resp.profiles?.id ?? resp.id}`
                          }
                          style={{ fontSize: '13px', fontWeight: 590, color: '#f7f8f8', letterSpacing: '-0.01em' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#27a644' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#f7f8f8' }}
                        >
                          {name}
                        </Link>
                        {fp?.level && (
                          <span
                            style={{
                              padding: '1px 7px',
                              borderRadius: '4px',
                              background: `${LEVEL_COLOR[level]}14`,
                              border: `1px solid ${LEVEL_COLOR[level]}30`,
                              fontSize: '10px',
                              fontWeight: 590,
                              color: LEVEL_COLOR[level],
                            }}
                          >
                            {LEVEL_LABELS[level]}
                          </span>
                        )}
                        {isAccepted && (
                          <span style={{ fontSize: '10px', color: '#27a644', fontWeight: 590, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle className="h-3 w-3" /> Accepted
                          </span>
                        )}
                        {resp.status === 'rejected' && (
                          <span style={{ fontSize: '10px', color: '#62666d', fontWeight: 510 }}>Rejected</span>
                        )}
                        <span className="ml-auto" style={{ fontSize: '11px', color: '#4a4f57' }}>{timeAgo(resp.created_at)}</span>
                      </div>

                      {fp && (
                        <p style={{ fontSize: '12px', color: '#62666d', marginBottom: '6px' }}>
                          {fp.title}{fp.rating ? ` · ★ ${fp.rating}` : ''}{fp.completed_orders ? ` · ${fp.completed_orders} orders` : ''}
                        </p>
                      )}

                      {resp.proposed_price && (
                        <p style={{ fontSize: '13px', fontWeight: 590, color: '#27a644', marginBottom: '6px' }}>
                          ${resp.proposed_price.toLocaleString()}
                        </p>
                      )}

                      <p
                        className="leading-relaxed"
                        style={{
                          fontSize: '13px',
                          color: '#8a8f98',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {resp.message}
                      </p>

                      {isPending && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => act(resp.id, 'accept')}
                            disabled={actioning === resp.id}
                            className="flex items-center gap-1.5 transition-all disabled:opacity-60"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '5px',
                              background: '#27a644',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 590,
                            }}
                          >
                            {actioning === resp.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            Accept
                          </button>
                          <button
                            onClick={() => act(resp.id, 'reject')}
                            disabled={actioning === resp.id}
                            className="flex items-center gap-1.5 transition-all disabled:opacity-60"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '5px',
                              background: 'rgba(229,72,77,0.08)',
                              border: '1px solid rgba(229,72,77,0.2)',
                              color: '#e5484d',
                              fontSize: '12px',
                              fontWeight: 590,
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </button>
                          <Link
                            href={`/messages?open=${resp.profiles.id}`}
                            className="flex items-center gap-1.5 transition-all"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '5px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#8a8f98',
                              fontSize: '12px',
                              fontWeight: 510,
                            }}
                          >
                            <ChevronRight className="h-3.5 w-3.5" /> Message
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Escrow safety badge */}
      <div
        className="rounded-xl px-4 py-4 flex items-start gap-3"
        style={{ background: 'rgba(39,166,68,0.04)', border: '1px solid rgba(39,166,68,0.12)' }}
      >
        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#27a644' }} />
        <div>
          <p style={{ fontSize: '12px', fontWeight: 590, color: '#27a644', marginBottom: '3px' }}>
            Safe payment
          </p>
          <p style={{ fontSize: '12px', color: '#62666d', lineHeight: 1.6, fontWeight: 400 }}>
            Agree directly with the freelancer. We recommend milestone payments: 30–50% upfront, the rest after delivery.
          </p>
        </div>
      </div>
    </div>
  )
}
