'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, Plus, Pencil, Trash2, ArrowLeft, X,
  Loader2, Check, Package,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { CATEGORIES } from '@/lib/mock/categories'

type TierKey = 'basic' | 'standard' | 'premium'

interface TierForm {
  tier:          TierKey
  title:         string
  price:         string
  delivery_days: string
  revisions:     string
  description:   string
  features:      string
}

interface Service {
  id:              string
  title:           string
  description:     string
  category:        string
  skills:          string[]
  is_active:       boolean
  purchases_count: number
  tiers: Array<{
    id:            string
    tier:          TierKey
    title:         string
    price:         number
    delivery_days: number
    revisions:     number
    description:   string | null
    features:      string[]
  }>
}

interface ServiceForm {
  id?:         string
  title:       string
  description: string
  category:    string
  skills:      string
  tiers:       TierForm[]
}

const TIER_ORDER: Record<TierKey, number> = { basic: 0, standard: 1, premium: 2 }

function emptyTier(tier: TierKey): TierForm {
  return { tier, title: '', price: '', delivery_days: '', revisions: '1', description: '', features: '' }
}

const EMPTY_SERVICE: ServiceForm = {
  title: '', description: '', category: 'dev', skills: '',
  tiers: [emptyTier('basic')],
}

export default function ServicesEditorPage() {
  const { user, loading: userLoading } = useUser()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState<ServiceForm | null>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError]       = useState('')

  async function reload() {
    if (!user) return
    const r = await fetch(`/api/services?freelancer_id=${user.id}`, { cache: 'no-store' })
    const d = await r.json()
    setServices(d.services ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!userLoading && user) reload()
    if (!userLoading && !user) setLoading(false)
  }, [user, userLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(s: Service) {
    setForm({
      id:          s.id,
      title:       s.title,
      description: s.description,
      category:    s.category,
      skills:      (s.skills ?? []).join(', '),
      tiers: [...s.tiers]
        .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])
        .map(t => ({
          tier:          t.tier,
          title:         t.title,
          price:         String(t.price),
          delivery_days: String(t.delivery_days),
          revisions:     String(t.revisions),
          description:   t.description ?? '',
          features:      (t.features ?? []).join('\n'),
        })),
    })
  }

  function addTier() {
    if (!form || form.tiers.length >= 3) return
    const used = new Set(form.tiers.map(t => t.tier))
    const next: TierKey = (['basic', 'standard', 'premium'] as TierKey[]).find(k => !used.has(k)) ?? 'premium'
    setForm({ ...form, tiers: [...form.tiers, emptyTier(next)] })
  }

  function removeTier(i: number) {
    if (!form || form.tiers.length <= 1) return
    setForm({ ...form, tiers: form.tiers.filter((_, idx) => idx !== i) })
  }

  function updateTier(i: number, patch: Partial<TierForm>) {
    if (!form) return
    setForm({ ...form, tiers: form.tiers.map((t, idx) => idx === i ? { ...t, ...patch } : t) })
  }

  async function save() {
    if (!form) return
    setError('')

    if (form.title.trim().length < 10 || form.title.trim().length > 200) {
      setError('Title must be 10–200 characters'); return
    }
    if (form.description.trim().length < 40 || form.description.trim().length > 5000) {
      setError('Description must be 40–5000 characters'); return
    }
    const tierKeys = new Set(form.tiers.map(t => t.tier))
    if (tierKeys.size !== form.tiers.length) { setError('Duplicate tier'); return }

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      category:    form.category,
      skills:      form.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10),
      tiers: form.tiers.map(t => ({
        tier:          t.tier,
        title:         t.title.trim(),
        price:         Number(t.price),
        delivery_days: Number(t.delivery_days),
        revisions:     Number(t.revisions || 1),
        description:   t.description.trim() || undefined,
        features:      t.features.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 10),
      })),
    }

    for (const t of payload.tiers) {
      if (!t.title || t.title.length > 60) { setError(`Tier "${t.tier}" title required (≤60)`); return }
      if (!Number.isFinite(t.price) || t.price < 1) { setError(`Tier "${t.tier}" price required`); return }
      if (!Number.isFinite(t.delivery_days) || t.delivery_days < 1) { setError(`Tier "${t.tier}" delivery days required`); return }
    }

    setSaving(true)
    try {
      if (form.id) {
        // Edit = delete old + create new (simplifies tier changes; keeps counters=0 fresh is fine)
        // But purchases_count would reset — keep as DELETE+POST for now, we can rework if it matters.
        const delRes = await fetch(`/api/services/${form.id}`, { method: 'DELETE' })
        if (!delRes.ok) {
          const j = await delRes.json().catch(() => ({}))
          throw new Error(j.error || 'Delete failed')
        }
      }
      const r = await fetch('/api/services', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || 'Save failed')
      }
      setForm(null)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service? Open orders stay but new buys are blocked.')) return
    setDeleting(id)
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' })
      await reload()
    } finally {
      setDeleting(null)
    }
  }

  if (userLoading || loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite', color: 'var(--fh-t4)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--fh-t3)' }}>
        Please <Link href="/login" style={{ color: 'var(--fh-primary)' }}>log in</Link> to manage services.
      </div>
    )
  }

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Link href="/dashboard" style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
          color: 'var(--fh-t2)', textDecoration: 'none',
        }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.02em', margin: 0 }}>
            Services
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: '2px 0 0' }}>
            Fixed-price packages clients can buy instantly.
          </p>
        </div>
        {!form && (
          <button
            onClick={() => setForm({ ...EMPTY_SERVICE })}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: 'var(--fh-primary)', color: '#fff',
              fontSize: 13, fontWeight: 590, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <Plus size={14} /> New
          </button>
        )}
      </div>

      {/* Form */}
      {form && (
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 16,
          background: 'var(--fh-surface)', border: '1px solid var(--fh-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>
              {form.id ? 'Edit service' : 'New service'}
            </p>
            <button onClick={() => setForm(null)}
              style={{ background: 'none', border: 'none', color: 'var(--fh-t4)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Title *" value={form.title}
              onChange={v => setForm({ ...form, title: v })}
              placeholder="I will build you a landing page in 7 days" />

            <div>
              <FieldLabel>Category *</FieldLabel>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t1)', fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>Description * (40–5000)</FieldLabel>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What clients get, your approach, who it's for…"
                rows={4}
                style={{
                  width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t1)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </div>

            <Field label="Skills (comma-separated, max 10)" value={form.skills}
              onChange={v => setForm({ ...form, skills: v })}
              placeholder="React, Next.js, TypeScript" />

            {/* Tier editors */}
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <FieldLabel>Packages ({form.tiers.length}/3) *</FieldLabel>
                {form.tiers.length < 3 && (
                  <button onClick={addTier}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: 'var(--fh-surface-2)', color: 'var(--fh-t2)',
                      fontSize: 11, fontWeight: 590, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                    <Plus size={11} /> Add tier
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {form.tiers.map((t, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 10,
                    background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <select
                        value={t.tier}
                        onChange={e => updateTier(i, { tier: e.target.value as TierKey })}
                        style={{
                          padding: '5px 8px', borderRadius: 6,
                          background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                          color: 'var(--fh-t1)', fontSize: 12, fontWeight: 590, textTransform: 'capitalize',
                        }}
                      >
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                      <div style={{ flex: 1 }} />
                      {form.tiers.length > 1 && (
                        <button onClick={() => removeTier(i)}
                          style={{
                            width: 26, height: 26, borderRadius: 6, border: 'none',
                            background: 'var(--fh-surface)', color: '#f87171',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <Field small label="Tier title *" value={t.title}
                      onChange={v => updateTier(i, { title: v })}
                      placeholder="Basic landing" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                      <Field small label="Price ₽ *" type="number" value={t.price}
                        onChange={v => updateTier(i, { price: v })} placeholder="15000" />
                      <Field small label="Days *" type="number" value={t.delivery_days}
                        onChange={v => updateTier(i, { delivery_days: v })} placeholder="7" />
                      <Field small label="Revisions" type="number" value={t.revisions}
                        onChange={v => updateTier(i, { revisions: v })} placeholder="1 · -1 = ∞" />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <FieldLabel>Short description</FieldLabel>
                      <input
                        type="text" value={t.description}
                        onChange={e => updateTier(i, { description: e.target.value })}
                        placeholder="One-line pitch for this tier"
                        style={{
                          width: '100%', marginTop: 4, padding: '7px 9px', borderRadius: 6,
                          background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                          color: 'var(--fh-t1)', fontSize: 12, fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <FieldLabel>Features (one per line, max 10)</FieldLabel>
                      <textarea
                        value={t.features}
                        onChange={e => updateTier(i, { features: e.target.value })}
                        placeholder="Responsive design&#10;SEO meta tags&#10;Contact form"
                        rows={3}
                        style={{
                          width: '100%', marginTop: 4, padding: '7px 9px', borderRadius: 6,
                          background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                          color: 'var(--fh-t1)', fontSize: 12, fontFamily: 'inherit', resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
                  background: 'var(--fh-primary)', color: '#fff',
                  fontSize: 13, fontWeight: 590, cursor: saving ? 'wait' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                {form.id ? 'Update' : 'Publish'}
              </button>
              <button
                onClick={() => setForm(null)}
                disabled={saving}
                style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--fh-surface-2)', color: 'var(--fh-t2)',
                  border: '1px solid var(--fh-border)', fontSize: 13, fontWeight: 510, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {services.length === 0 && !form && (
        <div style={{
          padding: 24, borderRadius: 12, textAlign: 'center',
          background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        }}>
          <ShoppingBag size={24} style={{ color: 'var(--fh-t4)', marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>No services yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
            Publish a fixed-price package. Clients can buy instantly.
          </p>
        </div>
      )}

      {services.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map(s => {
            const cheapest = [...s.tiers].sort((a, b) => a.price - b.price)[0]
            return (
              <div key={s.id} style={{
                padding: 14, borderRadius: 12,
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'var(--fh-primary-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingBag size={16} style={{ color: 'var(--fh-primary)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
                      From ₽{cheapest?.price.toLocaleString('ru-RU')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
                      {s.tiers.length} tier{s.tiers.length === 1 ? '' : 's'}
                    </span>
                    {s.purchases_count > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fh-t4)' }}>
                        <Package size={10} /> {s.purchases_count} sold
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => startEdit(s)}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: 'none',
                      background: 'var(--fh-surface-2)', color: 'var(--fh-t3)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    disabled={deleting === s.id}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: 'none',
                      background: 'var(--fh-surface-2)', color: '#f87171',
                      cursor: deleting === s.id ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Delete"
                  >
                    {deleting === s.id
                      ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, color: 'var(--fh-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', small,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  small?: boolean
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', marginTop: 4,
          padding: small ? '7px 9px' : '8px 10px',
          borderRadius: small ? 6 : 8,
          background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
          color: 'var(--fh-t1)', fontSize: small ? 12 : 13, fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
