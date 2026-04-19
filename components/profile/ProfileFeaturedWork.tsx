'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ExternalLink, Pin } from 'lucide-react'

export interface FeaturedItem {
  id:          string
  title:       string
  description: string | null
  image_url:   string | null
  project_url: string | null
  category:    string | null
}

interface Props {
  items:   FeaturedItem[]
  isOwner: boolean
}

export default function ProfileFeaturedWork({ items, isOwner }: Props) {
  if (items.length === 0) {
    if (!isOwner) return null
    return (
      <div style={{
        borderRadius: 14, padding: '20px',
        background: 'var(--fh-surface)',
        border: '1px dashed var(--fh-border-2)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(94,106,210,0.18), rgba(168,85,247,0.18))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={15} style={{ color: '#7170ff' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>
            Featured work
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fh-t4)', lineHeight: 1.5, marginBottom: 10 }}>
          Pin 3–4 of your best projects to the top of your profile — clients decide in seconds.
        </p>
        <Link
          href="/dashboard?tab=portfolio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#7170ff',
            textDecoration: 'none',
          }}
        >
          <Pin size={13} /> Pick featured work
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: 14, padding: '18px 20px 20px',
      background: 'linear-gradient(180deg, rgba(94,106,210,0.06) 0%, transparent 60%), var(--fh-surface)',
      border: '1px solid var(--fh-border-2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #5e6ad2, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(94,106,210,0.35)',
        }}>
          <Sparkles size={14} style={{ color: '#fff' }} />
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)',
          letterSpacing: '-0.01em',
        }}>
          Featured work
        </div>
        {isOwner && (
          <Link
            href="/dashboard?tab=portfolio"
            style={{
              marginLeft: 'auto', fontSize: 12, color: 'var(--fh-t4)',
              textDecoration: 'none',
            }}
          >
            Manage →
          </Link>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: items.length === 1 ? '1fr' : 'repeat(2, 1fr)',
        gap: 10,
      }}>
        {items.map((item, i) => {
          const Card = (
            <div style={{
              position: 'relative',
              borderRadius: 12, overflow: 'hidden',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
              transition: 'transform 0.15s, border-color 0.15s',
              cursor: item.project_url ? 'pointer' : 'default',
              height: '100%',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Image */}
              <div style={{
                position: 'relative',
                height: items.length === 1 ? 200 : 130,
                background: 'var(--fh-canvas)',
              }}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, opacity: 0.3,
                  }}>
                    ✨
                  </div>
                )}
                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  minWidth: 22, height: 22, padding: '0 7px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  #{i + 1}
                </div>
                {item.project_url && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <ExternalLink size={12} />
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{
                padding: '10px 12px 12px',
                display: 'flex', flexDirection: 'column', gap: 4,
                flex: 1,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 650, color: 'var(--fh-t1)',
                  lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{
                    fontSize: 12, color: 'var(--fh-t4)', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {item.description}
                  </div>
                )}
                {item.category && (
                  <div style={{
                    marginTop: 'auto', paddingTop: 4,
                    fontSize: 10, fontWeight: 600, color: '#7170ff',
                    letterSpacing: '0.03em', textTransform: 'uppercase',
                  }}>
                    {item.category}
                  </div>
                )}
              </div>
            </div>
          )

          return item.project_url ? (
            <a
              key={item.id}
              href={item.project_url}
              target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {Card}
            </a>
          ) : (
            <div key={item.id}>{Card}</div>
          )
        })}
      </div>
    </div>
  )
}
