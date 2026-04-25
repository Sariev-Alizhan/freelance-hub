'use client'

import { useState } from 'react'
import { Wallet, Copy, Check } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

export type PaymentMethod = { type: string; value: string; note?: string }

const TYPE_LABEL: Record<string, string> = {
  usdt_trc20: 'USDT (TRC-20)',
  usdt_erc20: 'USDT (ERC-20)',
  btc:        'Bitcoin',
  ton:        'TON',
  wise:       'Wise',
  revolut:    'Revolut',
  paypal:     'PayPal',
  payoneer:   'Payoneer',
  iban:       'IBAN / bank',
  card:       'Card',
  kaspi:      'Kaspi',
  halyk:      'Halyk',
  other:      'Other',
}

export default function ProfilePaymentMethods({
  methods,
  viewerLoggedIn,
}: {
  methods: PaymentMethod[]
  viewerLoggedIn: boolean
}) {
  const { t } = useLang()
  const tp = t.paymentsPage
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const visible = methods.filter(m => m && m.type && m.value)

  async function copy(idx: number, value: string) {
    try { await navigator.clipboard.writeText(value) } catch { return }
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1400)
  }

  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Wallet style={{ width: 14, height: 14, color: '#27a644' }} />
        <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>{tp.profileCardTitle}</h2>
      </div>
      <p style={{ fontSize: 12, color: 'var(--fh-t4)', marginBottom: 12 }}>{tp.profileCardSub}</p>

      {!viewerLoggedIn ? (
        <p style={{ fontSize: 12.5, color: 'var(--fh-t3)', padding: '12px 0' }}>{tp.signinPrompt}</p>
      ) : visible.length === 0 ? (
        <p style={{ fontSize: 12.5, color: 'var(--fh-t4)', padding: '12px 0' }}>{tp.profileEmpty}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((m, idx) => {
            const label = TYPE_LABEL[m.type] ?? m.type
            const copied = copiedIdx === idx
            return (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10,
                alignItems: 'center', padding: '10px 12px', borderRadius: 9,
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 590, padding: '3px 8px',
                  borderRadius: 6, background: 'var(--fh-surface)',
                  border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t2)', whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: 12.5,
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    color: 'var(--fh-t1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{m.value}</p>
                  {m.note && (
                    <p style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 2 }}>{m.note}</p>
                  )}
                </div>
                <button
                  onClick={() => copy(idx, m.value)}
                  aria-label={tp.copyBtn}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px', borderRadius: 6,
                    background: copied ? 'rgba(39,166,68,0.1)' : 'var(--fh-surface)',
                    border: `1px solid ${copied ? 'rgba(39,166,68,0.3)' : 'var(--fh-border)'}`,
                    color: copied ? '#27a644' : 'var(--fh-t3)',
                    fontSize: 11, fontWeight: 510, cursor: 'pointer',
                  }}
                >
                  {copied
                    ? <><Check style={{ width: 12, height: 12 }} /> {tp.copied}</>
                    : <><Copy style={{ width: 12, height: 12 }} /> {tp.copyBtn}</>}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
