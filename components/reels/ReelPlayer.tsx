'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Volume2, VolumeX, Heart, MessageCircle, Share2, Eye, Play, Pause, CheckCircle2 } from 'lucide-react'

export interface ReelAuthor {
  id:          string
  full_name:   string | null
  username:    string | null
  avatar_url:  string | null
  is_verified: boolean
}

export interface Reel {
  id:               string
  user_id:          string
  video_url:        string
  thumbnail_url:    string | null
  caption:          string | null
  duration_seconds: number | null
  aspect_ratio:     number | null
  views:            number
  created_at:       string
  author:           ReelAuthor | null
}

interface Props {
  reel:        Reel
  active:      boolean    // only the visible reel plays — saves bandwidth & battery
  muted:       boolean
  onToggleMute: () => void
  viewerLoggedIn: boolean
}

export default function ReelPlayer({ reel, active, muted, onToggleMute, viewerLoggedIn }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [viewLogged, setViewLogged] = useState(false)
  const [liked, setLiked]     = useState(false)
  const [likeCount, setLikes] = useState<number | null>(null)

  // Load reactions once visible
  useEffect(() => {
    if (!active || likeCount !== null) return
    fetch(`/api/feed/react?item_ids=reel:${reel.id}`)
      .then(r => r.json())
      .then(d => {
        const row = d[`reel:${reel.id}`]
        if (row) {
          setLikes(row.likes)
          setLiked(row.mine.includes('like'))
        }
      })
      .catch(() => {})
  }, [active, reel.id, likeCount])

  // Play/pause based on visibility
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active) {
      v.currentTime = 0
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))

      if (!viewLogged) {
        setViewLogged(true)
        fetch(`/api/reels/${reel.id}/view`, { method: 'POST' }).catch(() => {})
      }
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [active, reel.id, viewLogged])

  async function toggleLike() {
    if (!viewerLoggedIn) {
      window.location.href = '/login'
      return
    }
    // Optimistic
    setLiked(prev => !prev)
    setLikes(prev => (prev ?? 0) + (liked ? -1 : 1))
    await fetch('/api/feed/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ item_id: `reel:${reel.id}`, action: 'like' }),
    }).catch(() => {})
  }

  async function share() {
    const url = `${window.location.origin}/reels/${reel.id}`
    if (navigator.share) {
      try { await navigator.share({ url, title: reel.caption ?? 'Reel' }) } catch {}
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {})
    }
  }

  function togglePlayPause() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const name = reel.author?.full_name ?? 'Creator'

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      background: '#000',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url ?? undefined}
        playsInline
        loop
        muted={muted}
        onClick={togglePlayPause}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
      />

      {/* Pause overlay */}
      {!playing && (
        <div
          onClick={togglePlayPause}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Play size={28} style={{ color: '#fff', marginLeft: 3 }} fill="#fff" />
          </div>
        </div>
      )}

      {/* Top bar: mute toggle */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', gap: 8, zIndex: 3,
      }}>
        <button
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          style={iconCircleBtn}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Bottom gradient overlay */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 260, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
      }} />

      {/* Left: author + caption */}
      <div style={{
        position: 'absolute', left: 14, right: 72, bottom: 20,
        color: '#fff', zIndex: 2,
      }}>
        <Link
          href={reel.author?.username ? `/u/${reel.author.username}` : '#'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: '#fff',
            marginBottom: 10,
          }}
        >
          {reel.author?.avatar_url ? (
            <Image src={reel.author.avatar_url} alt={name}
              width={36} height={36} unoptimized
              style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, color: '#fff',
              border: '2px solid rgba(255,255,255,0.3)',
            }}>{name[0]?.toUpperCase()}</div>
          )}
          <span style={{ fontSize: 14, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {name}
          </span>
          {reel.author?.is_verified && (
            <CheckCircle2 size={14} style={{ color: 'var(--fh-primary)', fill: 'var(--fh-primary)' }} />
          )}
        </Link>

        {reel.caption && (
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.45,
            whiteSpace: 'pre-wrap', color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            maxHeight: 90, overflow: 'hidden',
          }}>
            {reel.caption}
          </p>
        )}
      </div>

      {/* Right: action rail */}
      <div style={{
        position: 'absolute', right: 10, bottom: 26,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        zIndex: 2,
      }}>
        <ActionBtn
          onClick={toggleLike}
          label={likeCount !== null ? likeCount.toLocaleString() : ''}
          icon={<Heart size={26} fill={liked ? '#f43f5e' : 'none'} style={{ color: liked ? '#f43f5e' : '#fff' }} />}
        />
        <ActionBtn
          onClick={() => {/* future: open comments sheet */}}
          label=""
          icon={<MessageCircle size={26} style={{ color: '#fff' }} />}
        />
        <ActionBtn
          onClick={share}
          label=""
          icon={<Share2 size={24} style={{ color: '#fff' }} />}
        />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: '#fff', fontSize: 10, fontWeight: 600,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          <Eye size={16} />
          {reel.views.toLocaleString()}
        </div>
      </div>

      {/* Play/pause indicator */}
      {playing && (
        <button
          onClick={togglePlayPause}
          aria-label="Pause"
          style={{
            position: 'absolute', top: 12, right: 56, zIndex: 3,
            ...iconCircleBtn,
          }}
        >
          <Pause size={16} />
        </button>
      )}
    </div>
  )
}

function ActionBtn({ onClick, label, icon }: {
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        color: '#fff', fontSize: 11, fontWeight: 600,
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        padding: 0,
      }}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}

const iconCircleBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
  border: 'none', cursor: 'pointer', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
