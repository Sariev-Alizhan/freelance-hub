'use client'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import EmptyState from './EmptyState'
import JobMatchWidget from './JobMatchWidget'
import type { MyResponse } from './types'

const RESP_STATUS = {
  pending:  { label: 'Pending',  color: '#8a8f98', bg: 'rgba(138,143,152,0.08)', border: 'rgba(138,143,152,0.2)' },
  accepted: { label: 'Accepted', color: '#27a644', bg: 'rgba(39,166,68,0.08)',   border: 'rgba(39,166,68,0.25)'  },
  rejected: { label: 'Declined', color: '#e5484d', bg: 'rgba(229,72,77,0.06)',   border: 'rgba(229,72,77,0.2)'   },
}

/**
 * Freelancer tab content: JobMatchWidget on top, then the list of
 * responses the user has sent with a Withdraw button on pending ones.
 */
export default function ResponsesList({ responses, withdrawing, onWithdraw }: {
  responses: MyResponse[]
  withdrawing: string | null
  onWithdraw: (id: string) => void
}) {
  return (
    <>
      <JobMatchWidget />
      {responses.length === 0 ? (
        <EmptyState
          emoji="📭" title="No responses yet"
          sub="Find a suitable project and apply"
          href="/orders" cta="Browse orders"
        />
      ) : (
        <div className="space-y-3">
          {responses.map(resp => {
            const order = Array.isArray(resp.order) ? resp.order[0] : resp.order
            if (!order) return null
            const rs = RESP_STATUS[resp.status ?? 'pending']

            return (
              <div
                key={resp.id}
                style={{
                  borderRadius: '12px', border: `1px solid ${rs.border}`,
                  background: rs.bg, overflow: 'hidden',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', display: 'block', padding: '14px 16px' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                          {order.budget_min.toLocaleString()}–{order.budget_max.toLocaleString()} ₸
                        </span>
                        {resp.proposed_price && (
                          <>
                            <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>·</span>
                            <span style={{ fontSize: '12px', color: '#27a644', fontWeight: 510 }}>
                              My bid: {resp.proposed_price.toLocaleString()} ₸
                            </span>
                          </>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>·</span>
                        <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>
                          {new Date(resp.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {resp.message && (
                        <p style={{ fontSize: '12px', color: 'var(--fh-t3)', marginTop: '6px', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {resp.message}
                        </p>
                      )}
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '6px', letterSpacing: '0.02em',
                      background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                    }}>
                      {rs.label}
                    </span>
                  </div>
                </Link>

                {(resp.status ?? 'pending') === 'pending' && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '8px 16px',
                    display: 'flex', justifyContent: 'flex-end',
                  }}>
                    <button
                      onClick={() => onWithdraw(resp.id)}
                      disabled={withdrawing === resp.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '12px', color: 'var(--fh-t4)',
                        opacity: withdrawing === resp.id ? 0.5 : 1,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e5484d' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
                    >
                      {withdrawing === resp.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <X className="h-3 w-3" />
                      }
                      Withdraw application
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
