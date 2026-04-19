'use client'
import Link from 'next/link'
import { Film, Play, Eye } from 'lucide-react'
import type { Reel } from '@/components/reels/ReelPlayer'

interface Props {
  reels:   Reel[]
  isOwner: boolean
}

export default function ProfileReels({ reels, isOwner }: Props) {
  if (reels.length === 0 && !isOwner) return null

  return (
    <div style={{
      borderRadius: 14, padding: '20px',
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14,
      }}>
        <Film size={15} style={{ color: 'var(--fh-t3)' }} />
        <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>
          Reels
        </h2>
        {reels.length > 0 && (
          <span style={{
            fontSize: 12, color: 'var(--fh-t4)',
            marginLeft: 'auto',
          }}>
            {reels.length}
          </span>
        )}
      </div>

      {reels.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '24px 12px',
          gap: 10, textAlign: 'center',
        }}>
          <Film style={{ width: 28, height: 28, color: 'var(--fh-t4)', opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
            Поделитесь коротким видео на Reels
          </p>
          <Link
            href="/reels"
            style={{
              fontSize: 13, color: '#7170ff', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Создать Reel →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}>
          {reels.slice(0, 9).map(reel => (
            <Link
              key={reel.id}
              href={`/reels/${reel.id}`}
              style={{
                position: 'relative',
                aspectRatio: '9 / 16',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#000',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {reel.thumbnail_url ? (
                // Use plain img — grid thumbnails, avoid Next optimization for public video stills
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reel.thumbnail_url}
                  alt={reel.caption ?? 'Reel'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <video
                  src={reel.video_url}
                  muted playsInline preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* gradient + play icon */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%)',
              }} />
              <Play
                size={20}
                fill="#fff"
                style={{
                  position: 'absolute', top: 6, right: 6,
                  color: '#fff', opacity: 0.9,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                }}
              />
              <div style={{
                position: 'absolute', bottom: 4, left: 6,
                display: 'flex', alignItems: 'center', gap: 3,
                color: '#fff', fontSize: 11, fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>
                <Eye size={12} />
                {reel.views.toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      {reels.length > 9 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link
            href={`/reels`}
            style={{
              fontSize: 13, color: '#7170ff', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Смотреть все →
          </Link>
        </div>
      )}
    </div>
  )
}
