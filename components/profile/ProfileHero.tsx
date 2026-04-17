import Image from 'next/image'
import { MapPin, CheckCircle, Crown, Circle } from 'lucide-react'
import RatingStars from '@/components/shared/RatingStars'

const AVAILABILITY: Record<string, { label: string; dot: string }> = {
  open:     { label: 'Available for work', dot: '#27a644' },
  busy:     { label: 'Currently busy',     dot: '#f59e0b' },
  vacation: { label: 'On vacation',        dot: '#8a8f98' },
}

const LEVEL_LABELS: Record<string, string> = {
  new: 'Newcomer', junior: 'Junior', middle: 'Middle', senior: 'Senior', top: 'TOP',
}
const LEVEL_COLORS: Record<string, string> = {
  new: '#62666d', junior: '#27a644', middle: '#5e6ad2', senior: '#7170ff', top: '#fbbf24',
}

/** Deterministic gradient from username for the cover banner. */
function coverGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const h1 = Math.abs(h) % 360
  const h2 = (h1 + 60) % 360
  return `linear-gradient(135deg, hsl(${h1} 65% 42%) 0%, hsl(${h2} 70% 32%) 100%)`
}

export interface ProfileHeroProps {
  username:      string
  name:          string
  avatar:        string
  bio:           string
  location:      string
  isVerified?:   boolean
  isPremium?:    boolean
  level?:        string
  title?:        string
  availability?: string
  rating?:       number
  reviewsCount?: number
  isFreelancer:  boolean
}

export default function ProfileHero(p: ProfileHeroProps) {
  const av = AVAILABILITY[p.availability ?? 'open']
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      {/* Cover banner */}
      <div style={{
        height: 140, background: coverGradient(p.username),
        position: 'relative',
      }} />

      {/* Avatar overlapping + meta */}
      <div style={{ padding: '0 20px 20px', marginTop: -56, position: 'relative' }}>
        <div style={{
          width: 112, height: 112, borderRadius: 22,
          border: '4px solid var(--fh-surface)',
          overflow: 'hidden', position: 'relative', marginBottom: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}>
          <Image src={p.avatar} alt={p.name} width={112} height={112} style={{ objectFit: 'cover' }} unoptimized />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
            {p.name}
          </h1>
          {p.isVerified && <CheckCircle className="h-5 w-5" style={{ color: '#5e6ad2', flexShrink: 0 }} />}
          {p.isPremium && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 590, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(94,106,210,0.1)', color: '#5e6ad2', border: '1px solid rgba(94,106,210,0.25)',
            }}>
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
          {p.level && p.isFreelancer && (
            <span style={{
              fontSize: 11, fontWeight: 590, padding: '2px 8px', borderRadius: 20,
              background: `${LEVEL_COLORS[p.level]}14`,
              color: LEVEL_COLORS[p.level],
              border: `1px solid ${LEVEL_COLORS[p.level]}30`,
            }}>
              {LEVEL_LABELS[p.level]}
            </span>
          )}
        </div>

        <p style={{ fontSize: 14, color: 'var(--fh-t3)', marginBottom: 10 }}>
          @{p.username}{p.title && <> · {p.title}</>}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: p.bio ? 14 : 0 }}>
          {p.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--fh-t4)' }}>
              <MapPin className="h-3.5 w-3.5" /> {p.location}
            </span>
          )}
          {p.availability && p.isFreelancer && av && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--fh-t4)' }}>
              <Circle className="h-2.5 w-2.5" style={{ fill: av.dot, color: av.dot }} />
              {av.label}
            </span>
          )}
          {p.reviewsCount && p.reviewsCount > 0 ? (
            <RatingStars rating={p.rating ?? 0} size="sm" count={p.reviewsCount} />
          ) : null}
        </div>

        {p.bio && (
          <p style={{ fontSize: 14, color: 'var(--fh-t2)', lineHeight: 1.6 }}>
            {p.bio}
          </p>
        )}
      </div>
    </div>
  )
}
