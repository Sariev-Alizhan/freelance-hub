'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase, MapPin, Calendar, Plus, Pencil, Trash2,
  ArrowLeft, X, Loader2, Check,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface WorkEntry {
  id:          string
  company:     string
  position:    string
  description: string | null
  start_date:  string
  end_date:    string | null
  is_current:  boolean
  location:    string | null
}

interface FormState {
  id?:         string
  company:     string
  position:    string
  description: string
  start_date:  string
  end_date:    string
  is_current:  boolean
  location:    string
}

const EMPTY: FormState = {
  company: '', position: '', description: '',
  start_date: '', end_date: '', is_current: false, location: '',
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
  catch { return dateStr }
}

export default function ExperienceEditorPage() {
  const { user, loading: userLoading } = useUser()
  const [items, setItems]       = useState<WorkEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState<FormState | null>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError]       = useState('')

  async function reload() {
    const r = await fetch('/api/profile/experience', { cache: 'no-store' })
    const d = await r.json()
    setItems(d.experience ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!userLoading && user) reload()
    if (!userLoading && !user) setLoading(false)
  }, [user, userLoading])

  async function save() {
    if (!form) return
    setError('')
    if (!form.company.trim() || !form.position.trim() || !form.start_date) {
      setError('Company, position and start date are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        company:     form.company.trim(),
        position:    form.position.trim(),
        description: form.description.trim() || null,
        start_date:  form.start_date,
        end_date:    form.is_current ? null : (form.end_date || null),
        is_current:  form.is_current,
        location:    form.location.trim() || null,
      }

      if (form.id) {
        // Edit = delete + add (no PATCH in current API)
        await fetch('/api/profile/experience', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id: form.id }),
        })
      }
      const r = await fetch('/api/profile/experience', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save')
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
    if (!confirm('Delete this entry?')) return
    setDeleting(id)
    try {
      await fetch('/api/profile/experience', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      await reload()
    } finally {
      setDeleting(null)
    }
  }

  function startEdit(entry: WorkEntry) {
    setForm({
      id:          entry.id,
      company:     entry.company,
      position:    entry.position,
      description: entry.description ?? '',
      start_date:  entry.start_date,
      end_date:    entry.end_date ?? '',
      is_current:  entry.is_current,
      location:    entry.location ?? '',
    })
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
        Please <Link href="/login" style={{ color: 'var(--fh-primary)' }}>log in</Link> to edit your experience.
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: 680, margin: '0 auto' }}>
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
            Experience
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: '2px 0 0' }}>
            Your career timeline. Shown on your public profile.
          </p>
        </div>
        {!form && items.length < 20 && (
          <button
            onClick={() => setForm({ ...EMPTY })}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: 'var(--fh-primary)', color: '#fff',
              fontSize: 13, fontWeight: 590, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* Form (shown when adding / editing) */}
      {form && (
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 16,
          background: 'var(--fh-surface)', border: '1px solid var(--fh-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>
              {form.id ? 'Edit entry' : 'New entry'}
            </p>
            <button
              onClick={() => setForm(null)}
              style={{ background: 'none', border: 'none', color: 'var(--fh-t4)', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Position *" value={form.position}
              onChange={v => setForm({ ...form, position: v })}
              placeholder="Senior Frontend Developer" />
            <Field label="Company *" value={form.company}
              onChange={v => setForm({ ...form, company: v })}
              placeholder="Acme Corp" />
            <Field label="Location" value={form.location}
              onChange={v => setForm({ ...form, location: v })}
              placeholder="Almaty, Kazakhstan · Remote" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Start *" type="month" value={form.start_date.slice(0, 7)}
                onChange={v => setForm({ ...form, start_date: v ? `${v}-01` : '' })} />
              <Field label="End"   type="month" value={form.end_date.slice(0, 7)}
                disabled={form.is_current}
                onChange={v => setForm({ ...form, end_date: v ? `${v}-01` : '' })} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t2)' }}>
              <input type="checkbox" checked={form.is_current}
                onChange={e => setForm({ ...form, is_current: e.target.checked, end_date: e.target.checked ? '' : form.end_date })}
                style={{ margin: 0 }} />
              I currently work here
            </label>

            <div>
              <label style={{ fontSize: 11, color: 'var(--fh-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What you did, outcomes, tech you used…"
                rows={4}
                style={{
                  width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t1)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                }}
              />
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
                {form.id ? 'Update' : 'Add'}
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
      {items.length === 0 && !form && (
        <div style={{
          padding: 24, borderRadius: 12, textAlign: 'center',
          background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        }}>
          <Briefcase size={24} style={{ color: 'var(--fh-t4)', marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>No experience yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
            Add your jobs, projects, and education to build trust with clients.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((entry) => (
            <div key={entry.id} style={{
              padding: 14, borderRadius: 12,
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: entry.is_current ? 'var(--fh-primary-muted)' : 'var(--fh-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase size={16} style={{ color: entry.is_current ? 'var(--fh-primary)' : 'var(--fh-t4)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>{entry.position}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fh-t3)' }}>{entry.company}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fh-t4)' }}>
                    <Calendar size={10} />
                    {formatDate(entry.start_date)} — {entry.is_current ? 'Present' : (entry.end_date ? formatDate(entry.end_date) : '?')}
                  </span>
                  {entry.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fh-t4)' }}>
                      <MapPin size={10} /> {entry.location}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => startEdit(entry)}
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
                  onClick={() => remove(entry.id)}
                  disabled={deleting === entry.id}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none',
                    background: 'var(--fh-surface-2)', color: '#f87171',
                    cursor: deleting === entry.id ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Delete"
                >
                  {deleting === entry.id
                    ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--fh-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
          background: disabled ? 'var(--fh-surface-2)' : 'var(--fh-canvas)',
          border: '1px solid var(--fh-border)',
          color: disabled ? 'var(--fh-t4)' : 'var(--fh-t1)',
          fontSize: 13, fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
