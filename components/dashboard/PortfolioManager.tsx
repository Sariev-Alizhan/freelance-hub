'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus, Trash2, ExternalLink, Upload, Loader2, ImageIcon, X, Link as LinkIcon, Star, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PortfolioItem {
  id: string
  title: string
  image_url: string | null
  project_url: string | null
  category: string | null
  description: string | null
  is_featured: boolean
  featured_position: number | null
}

const MAX_FEATURED = 4

interface AddForm {
  title: string
  project_url: string
  category: string
  description: string
}

const CATEGORIES = [
  'Web Development', 'Mobile', 'Design', 'AI / ML', 'Copywriting',
  'SMM', 'Video', 'Animation', 'Data', 'Other',
]

export default function PortfolioManager({ freelancerId }: { freelancerId: string }) {
  const [items, setItems]       = useState<PortfolioItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [form, setForm]         = useState<AddForm>({ title: '', project_url: '', category: 'Other', description: '' })
  const [error, setError]       = useState<string | null>(null)
  const fileRef                 = useRef<HTMLInputElement>(null)
  const supabase                = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db                      = supabase as any

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancerId])

  async function load() {
    setLoading(true)
    const { data } = await db
      .from('portfolio_items')
      .select('id, title, image_url, project_url, category, description, is_featured, featured_position')
      .eq('freelancer_id', freelancerId)
      .order('is_featured', { ascending: false })
      .order('featured_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  const featuredCount = items.filter(i => i.is_featured).length

  async function toggleFeatured(item: PortfolioItem) {
    if (!item.is_featured && featuredCount >= MAX_FEATURED) {
      setError(`You can feature at most ${MAX_FEATURED} items. Unfeature one first.`)
      return
    }
    setError(null)
    // Optimistic — flip instantly, revert on failure
    setItems(prev => prev.map(p => p.id === item.id
      ? { ...p, is_featured: !p.is_featured, featured_position: !p.is_featured ? featuredCount : null }
      : p))
    const r = await fetch(`/api/portfolio/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_featured: !item.is_featured }),
    }).catch(() => null)
    if (!r || !r.ok) {
      setItems(prev => prev.map(p => p.id === item.id ? item : p))
      const msg = r ? (await r.json()).error : 'Network error'
      setError(msg)
      return
    }
    await load()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File too large (max 5 MB)'); return }
    if (!file.type.startsWith('image/')) { setError('Only images allowed'); return }
    setError(null)
    setUploading(true)

    const ext  = file.name.split('.').pop()
    const path = `${freelancerId}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage.from('portfolio').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (upErr) {
      setError(upErr.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
    setPreviewUrl(publicUrl)
    setUploadedPath(path)
    setUploading(false)
  }

  function resetForm() {
    setForm({ title: '', project_url: '', category: 'Other', description: '' })
    setPreviewUrl(null)
    setUploadedPath(null)
    setError(null)
    setShowForm(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)

    const { error: insErr } = await db.from('portfolio_items').insert({
      freelancer_id: freelancerId,
      title:         form.title.trim(),
      image_url:     previewUrl ?? null,
      project_url:   form.project_url.trim() || null,
      category:      form.category,
      description:   form.description.trim() || null,
    })

    if (insErr) { setError(insErr.message); setSaving(false); return }
    await load()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(item: PortfolioItem) {
    setDeleting(item.id)
    // Delete from storage if it's our bucket
    if (item.image_url?.includes('/storage/v1/object/public/portfolio/')) {
      const path = item.image_url.split('/portfolio/')[1]
      if (path) await supabase.storage.from('portfolio').remove([path])
    }
    await db.from('portfolio_items').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--fh-t1)' }}>Portfolio</h2>
          <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles className="h-3 w-3" style={{ color: '#7170ff' }} />
            Tap the star to pin up to {MAX_FEATURED} featured projects — they appear at the top of your profile.
            <span style={{ fontWeight: 600, color: featuredCount > 0 ? '#7170ff' : 'var(--fh-t4)' }}>
              {featuredCount}/{MAX_FEATURED}
            </span>
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            background: '#5e6ad2', color: '#fff',
            fontSize: '13px', fontWeight: 590, border: 'none', cursor: 'pointer',
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add work
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            marginBottom: '20px', padding: '16px', borderRadius: '12px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>New portfolio item</span>
            <button onClick={resetForm} style={{ color: 'var(--fh-t4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Image upload */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t3)', display: 'block', marginBottom: '6px' }}>
                Image (optional, max 5 MB)
              </label>
              {previewUrl ? (
                <div className="relative" style={{ width: '100%', maxWidth: '260px' }}>
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={260}
                    height={160}
                    className="rounded-lg object-cover"
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    unoptimized
                  />
                  <button
                    onClick={() => { setPreviewUrl(null); setUploadedPath(null); if (fileRef.current) fileRef.current.value = '' }}
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                      width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width: '100%', maxWidth: '260px', height: '120px',
                    borderRadius: '10px', border: '2px dashed var(--fh-border-2)',
                    background: 'var(--fh-canvas)', cursor: uploading ? 'wait' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', color: 'var(--fh-t4)', fontSize: '12px',
                  }}
                >
                  {uploading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <><Upload className="h-5 w-5" /> Click to upload</>
                  }
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t3)', display: 'block', marginBottom: '5px' }}>
                Title *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. E-commerce website for a clothing brand"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)', fontSize: '13px', outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t3)', display: 'block', marginBottom: '5px' }}>
                Short impact line <span style={{ color: 'var(--fh-t4)', fontWeight: 400 }}>({form.description.length}/400)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 400) }))}
                placeholder="e.g. Rebuilt their checkout — conversion went from 2.1% → 4.8% in 6 weeks."
                rows={2}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)', fontSize: '13px', outline: 'none',
                  resize: 'none', fontFamily: 'inherit', lineHeight: 1.4,
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t3)', display: 'block', marginBottom: '5px' }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)', fontSize: '13px', outline: 'none',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* URL */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t3)', display: 'block', marginBottom: '5px' }}>
                Project link (optional)
              </label>
              <div style={{ position: 'relative' }}>
                <LinkIcon className="h-3.5 w-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fh-t4)' }} />
                <input
                  value={form.project_url}
                  onChange={e => setForm(f => ({ ...f, project_url: e.target.value }))}
                  placeholder="https://example.com"
                  style={{
                    width: '100%', padding: '9px 12px 9px 30px', borderRadius: '8px',
                    background: 'var(--fh-canvas)', border: '1px solid var(--fh-border-2)',
                    color: 'var(--fh-t1)', fontSize: '13px', outline: 'none',
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: '#e5484d' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={resetForm}
                style={{
                  padding: '8px 16px', borderRadius: '7px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t3)', fontSize: '13px', fontWeight: 510, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading || !form.title.trim()}
                style={{
                  padding: '8px 16px', borderRadius: '7px',
                  background: saving || !form.title.trim() ? '#3d4494' : '#5e6ad2',
                  color: '#fff', fontSize: '13px', fontWeight: 590,
                  border: 'none', cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[0,1,2].map(i => (
            <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--fh-border)', background: 'var(--fh-surface)' }}>
              <div style={{ height: '120px', background: 'var(--fh-surface-2)', animation: 'pulse 2s infinite' }} />
              <div style={{ padding: '10px' }}>
                <div style={{ height: '12px', borderRadius: '4px', background: 'var(--fh-surface-2)', animation: 'pulse 2s infinite', marginBottom: '6px' }} />
                <div style={{ height: '10px', width: '60%', borderRadius: '4px', background: 'var(--fh-surface-2)', animation: 'pulse 2s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fh-t4)' }}>
          <ImageIcon className="h-10 w-10 mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t2)', marginBottom: '6px' }}>No portfolio items yet</p>
          <p style={{ fontSize: '12px' }}>Add your best work to attract more clients</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(item => (
            <div
              key={item.id}
              style={{
                borderRadius: '10px', overflow: 'hidden',
                border: item.is_featured ? '1.5px solid #7170ff' : '1px solid var(--fh-border)',
                background: 'var(--fh-surface)', position: 'relative',
              }}
            >
              {/* Image */}
              <div style={{ height: '120px', background: 'var(--fh-surface-2)', position: 'relative', overflow: 'hidden' }}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon className="h-8 w-8" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
                  </div>
                )}

                {/* Feature toggle — always visible */}
                <button
                  onClick={() => toggleFeatured(item)}
                  aria-label={item.is_featured ? 'Unpin from featured' : 'Pin as featured'}
                  title={item.is_featured ? 'Unpin from featured' : 'Pin as featured'}
                  style={{
                    position: 'absolute', top: '6px', left: '6px',
                    background: item.is_featured ? '#7170ff' : 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(6px)',
                    border: 'none', borderRadius: '6px',
                    padding: '5px', cursor: 'pointer',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', gap: 3,
                    transition: 'background 0.15s',
                  }}
                >
                  <Star
                    className="h-3 w-3"
                    fill={item.is_featured ? '#fff' : 'none'}
                  />
                  {item.is_featured && item.featured_position !== null && (
                    <span style={{ fontSize: 10, fontWeight: 700 }}>
                      #{item.featured_position + 1}
                    </span>
                  )}
                </button>

                {/* Delete button overlay */}
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deleting === item.id}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(229,72,77,0.85)', border: 'none', borderRadius: '6px',
                    padding: '4px', cursor: 'pointer', color: '#fff',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                  className="portfolio-delete-btn"
                >
                  {deleting === item.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />
                  }
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </p>
                {item.description && (
                  <p style={{
                    fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '4px',
                    lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {item.category && (
                    <span style={{ fontSize: '10px', color: 'var(--fh-t4)', fontWeight: 400 }}>{item.category}</span>
                  )}
                  {item.project_url && (
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#5e6ad2', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .portfolio-delete-btn { opacity: 0 !important; }
        div:hover > div > .portfolio-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
