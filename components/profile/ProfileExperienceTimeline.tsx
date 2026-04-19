'use client'
import { useState } from 'react'
import { Briefcase, MapPin, Calendar, ChevronDown, ChevronUp, PencilLine, Plus } from 'lucide-react'
import Link from 'next/link'

export interface WorkEntry {
  id:          string
  company:     string
  position:    string
  description: string | null
  start_date:  string
  end_date:    string | null
  is_current:  boolean
  location:    string | null
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function ProfileExperienceTimeline({
  items, isOwnProfile,
}: {
  items: WorkEntry[]
  isOwnProfile: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Owner sees an empty-state prompt; visitors see nothing when there's no data.
  if (items.length === 0) {
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
          <Briefcase size={16} style={{ color: 'var(--fh-primary)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)' }}>Add your experience</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fh-t4)' }}>Clients look at career history before messaging</p>
        </div>
        <Link href="/dashboard/experience" style={{
          padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 590,
          background: 'var(--fh-primary)', color: '#fff', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Plus size={13} /> Add
        </Link>
      </div>
    )
  }

  const visible = showAll ? items : items.slice(0, 3)

  return (
    <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', margin: 0 }}>Experience</h2>
          <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{items.length} {items.length === 1 ? 'position' : 'positions'}</span>
        </div>
        {isOwnProfile && (
          <Link href="/dashboard/experience" style={{
            fontSize: 12, color: 'var(--fh-primary)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <PencilLine size={12} /> Edit
          </Link>
        )}
      </div>

      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div style={{
          position: 'absolute', left: 6, top: 8, bottom: 8,
          width: 1, background: 'var(--fh-border)',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visible.map((entry) => (
            <div key={entry.id} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: -17, top: 6, width: 8, height: 8,
                borderRadius: '50%', border: '2px solid',
                borderColor: entry.is_current ? 'var(--fh-primary)' : 'var(--fh-border)',
                background: entry.is_current ? 'var(--fh-primary)' : 'var(--fh-surface)',
              }} />
              <button
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  cursor: entry.description ? 'pointer' : 'default', padding: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)' }}>{entry.position}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                      <Briefcase size={11} style={{ color: 'var(--fh-t4)' }} />
                      <span style={{ fontSize: 12, color: 'var(--fh-t3)' }}>{entry.company}</span>
                      {entry.location && (
                        <>
                          <span style={{ color: 'var(--fh-t4)', fontSize: 10 }}>·</span>
                          <MapPin size={10} style={{ color: 'var(--fh-t4)' }} />
                          <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{entry.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Calendar size={10} style={{ color: 'var(--fh-t4)' }} />
                      <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
                        {formatDate(entry.start_date)} — {entry.is_current ? 'Present' : (entry.end_date ? formatDate(entry.end_date) : '?')}
                      </span>
                    </div>
                    {entry.is_current && (
                      <span style={{ fontSize: 10, color: 'var(--fh-primary)', fontWeight: 600 }}>Current</span>
                    )}
                  </div>
                </div>
              </button>
              {expanded === entry.id && entry.description && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--fh-t3)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {entry.description}
                </p>
              )}
            </div>
          ))}
        </div>
        {items.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: 'var(--fh-primary)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            {showAll
              ? <><ChevronUp size={13} /> Show less</>
              : <><ChevronDown size={13} /> Show all {items.length} positions</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
