'use client'

import { useState } from 'react'
import { Plus, Trash2, ShieldAlert } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

export type PaymentMethod = { type: string; value: string; note?: string }

const TYPE_OPTIONS: { value: string; label: string; placeholder: string }[] = [
  { value: 'usdt_trc20', label: 'USDT (TRC-20)', placeholder: 'TRx…' },
  { value: 'usdt_erc20', label: 'USDT (ERC-20)', placeholder: '0x…' },
  { value: 'btc',        label: 'Bitcoin',        placeholder: 'bc1…' },
  { value: 'ton',        label: 'TON',            placeholder: 'EQ…' },
  { value: 'wise',       label: 'Wise',           placeholder: '@handle or email' },
  { value: 'revolut',    label: 'Revolut',        placeholder: '@handle' },
  { value: 'paypal',     label: 'PayPal',         placeholder: 'email@example.com' },
  { value: 'payoneer',   label: 'Payoneer',       placeholder: 'email@example.com' },
  { value: 'iban',       label: 'IBAN / bank',    placeholder: 'KZxxxxxxxxxxxxxxxxxxxx' },
  { value: 'card',       label: 'Card',           placeholder: '4400 4400 0000 0000' },
  { value: 'kaspi',      label: 'Kaspi',          placeholder: '+7 ___' },
  { value: 'halyk',      label: 'Halyk',          placeholder: 'IBAN / phone' },
  { value: 'other',      label: 'Other',          placeholder: 'Describe in note below' },
]

const MAX_METHODS = 10

export default function PaymentMethodsForm({ initial }: { initial: PaymentMethod[] }) {
  const { t } = useLang()
  const tp = t.paymentsPage
  const [methods, setMethods] = useState<PaymentMethod[]>(initial)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [dirty, setDirty]     = useState(false)

  function update(idx: number, patch: Partial<PaymentMethod>) {
    setMethods(m => m.map((x, i) => i === idx ? { ...x, ...patch } : x))
    setDirty(true)
  }
  function add() {
    if (methods.length >= MAX_METHODS) return
    setMethods(m => [...m, { type: 'usdt_trc20', value: '', note: '' }])
    setDirty(true)
  }
  function remove(idx: number) {
    setMethods(m => m.filter((_, i) => i !== idx))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const cleaned = methods
        .map(m => ({
          type: m.type,
          value: (m.value || '').trim(),
          note:  (m.note  || '').trim() || undefined,
        }))
        .filter(m => m.value.length > 0)

      const res = await fetch('/api/profile/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methods: cleaned }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || tp.saveError)
        return
      }
      const data = await res.json()
      setMethods(data.methods ?? cleaned)
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 1800)
    } catch {
      setError(tp.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
          {tp.title}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '4px', maxWidth: 540, lineHeight: 1.55 }}>
          {tp.subtitle}
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <ShieldAlert style={{ width: 18, height: 18, color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '3px' }}>
            {tp.disclaimerTitle}
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--fh-t3)', lineHeight: 1.55 }}>
            {tp.disclaimerBody}
          </p>
        </div>
      </div>

      {/* List */}
      {methods.length === 0 ? (
        <div style={{
          background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
          borderRadius: '14px', padding: '28px 20px', textAlign: 'center', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px' }}>{tp.emptyTitle}</p>
          <p style={{ fontSize: '12.5px', color: 'var(--fh-t4)', lineHeight: 1.55 }}>{tp.emptySub}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {methods.map((m, idx) => (
            <MethodRow
              key={idx}
              method={m}
              onChange={patch => update(idx, patch)}
              onRemove={() => remove(idx)}
              removeLabel={tp.removeBtn}
              typeLabel={tp.typeLabel}
              valueLabel={tp.valueLabel}
              noteLabel={tp.noteLabel}
              notePlaceholder={tp.notePlaceholder}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={add}
          disabled={methods.length >= MAX_METHODS}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 14px', borderRadius: '8px',
            background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
            color: 'var(--fh-t2)', fontSize: '13px', fontWeight: 510,
            cursor: methods.length >= MAX_METHODS ? 'not-allowed' : 'pointer',
            opacity: methods.length >= MAX_METHODS ? 0.5 : 1,
          }}
        >
          <Plus style={{ width: 14, height: 14 }} /> {tp.addBtn}
        </button>

        <button
          onClick={save}
          disabled={saving || !dirty}
          style={{
            padding: '9px 18px', borderRadius: '8px',
            background: dirty ? '#27a644' : 'var(--fh-surface-3)',
            border: 'none',
            color: dirty ? '#fff' : 'var(--fh-t4)',
            fontSize: '13px', fontWeight: 590,
            cursor: saving || !dirty ? 'default' : 'pointer',
          }}
        >
          {saving ? '…' : tp.saveBtn}
        </button>

        {saved && (
          <span style={{ fontSize: '12px', color: '#27a644', fontWeight: 510 }}>{tp.saved}</span>
        )}
        {error && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 510 }}>{error}</span>
        )}
      </div>
    </div>
  )
}

function MethodRow({
  method, onChange, onRemove,
  removeLabel, typeLabel, valueLabel, noteLabel, notePlaceholder,
}: {
  method: PaymentMethod
  onChange: (patch: Partial<PaymentMethod>) => void
  onRemove: () => void
  removeLabel: string
  typeLabel: string
  valueLabel: string
  noteLabel: string
  notePlaceholder: string
}) {
  const opt = TYPE_OPTIONS.find(o => o.value === method.type) ?? TYPE_OPTIONS[0]

  return (
    <div style={{
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      borderRadius: '12px', padding: '14px',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '10px', alignItems: 'flex-start',
      }} className="fh-pm-grid">
        <style>{`
          @media (max-width: 640px) {
            .fh-pm-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Type */}
        <div>
          <label style={labelStyle}>{typeLabel}</label>
          <select
            value={method.type}
            onChange={e => onChange({ type: e.target.value })}
            style={inputStyle}
          >
            {TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div>
          <label style={labelStyle}>{valueLabel}</label>
          <input
            type="text"
            value={method.value}
            placeholder={opt.placeholder}
            onChange={e => onChange({ value: e.target.value })}
            style={{ ...inputStyle, fontFamily: 'ui-monospace, Menlo, monospace' }}
            maxLength={200}
          />
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          aria-label={removeLabel}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '8px 10px', borderRadius: '7px',
            background: 'transparent', border: '1px solid var(--fh-border-2)',
            color: '#ef4444', fontSize: '12px', cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Note */}
      <div style={{ marginTop: '8px' }}>
        <label style={labelStyle}>{noteLabel}</label>
        <input
          type="text"
          value={method.note ?? ''}
          placeholder={notePlaceholder}
          onChange={e => onChange({ note: e.target.value })}
          style={inputStyle}
          maxLength={120}
        />
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', color: 'var(--fh-t4)',
  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 590,
  marginBottom: '5px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '7px',
  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
  color: 'var(--fh-t1)', fontSize: '13px', outline: 'none',
}
