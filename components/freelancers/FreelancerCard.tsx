import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle, Clock, TrendingUp, Crown } from 'lucide-react'
import RatingStars from '@/components/shared/RatingStars'
import PriceDisplay from '@/components/shared/PriceDisplay'
import FavoriteButton from '@/components/shared/FavoriteButton'
import { Freelancer } from '@/lib/types'

const LEVEL_LABELS = {
  new:    { label: 'Newcomer', color: 'var(--fh-skill-bg)',         text: 'var(--fh-t3)'  },
  junior: { label: 'Junior',  color: 'rgba(56,189,248,0.1)',        text: '#38bdf8'       },
  middle: { label: 'Middle',  color: 'rgba(39,166,68,0.1)',         text: '#27a644'       },
  senior: { label: 'Senior',  color: 'rgba(113,112,255,0.12)',      text: '#7170ff'       },
  top:    { label: 'TOP',     color: 'rgba(251,191,36,0.12)',       text: '#fbbf24'       },
}

const AVAILABILITY_LABELS = {
  open:     { label: 'Available',   dot: '#27a644' },
  busy:     { label: 'Busy',        dot: '#f59e0b' },
  vacation: { label: 'On vacation', dot: '#8a8f98' },
}

interface Props { freelancer: Freelancer }

export default function FreelancerCard({ freelancer: f }: Props) {
  const level = LEVEL_LABELS[f.level]

  return (
    <div className="relative group/card">
      <FavoriteButton
        type="freelancer"
        targetId={f.id}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity"
      />

      {/* Premium badge */}
      {f.isPremium && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full"
          style={{ padding: '2px 8px', background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.3)' }}
        >
          <Crown className="h-2.5 w-2.5" style={{ color: '#5e6ad2' }} />
          <span style={{ fontSize: '10px', fontWeight: 590, color: '#5e6ad2', letterSpacing: '0.04em' }}>Premium</span>
        </div>
      )}

      {/* Promoted badge */}
      {f.isPromoted && !f.isPremium && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full"
          style={{ padding: '2px 8px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}
        >
          <TrendingUp className="h-2.5 w-2.5" style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: '10px', fontWeight: 590, color: '#fbbf24', letterSpacing: '0.04em' }}>TOP</span>
        </div>
      )}

      <Link href={`/freelancers/${f.id}`}>
        <div
          className="card-hover rounded-xl h-full flex flex-col gap-4 transition-all"
          style={{
            padding: '20px',
            background: 'var(--fh-surface)',
            border: f.isPromoted
              ? '1px solid rgba(251,191,36,0.25)'
              : '1px solid var(--fh-border)',
            borderRadius: '10px',
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <Image
                src={f.avatar}
                alt={f.name}
                width={44}
                height={44}
                className="rounded-lg"
                unoptimized
                style={{ border: '1px solid var(--fh-border-2)' }}
              />
              {f.isOnline && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 pulse-green"
                  style={{ borderColor: 'var(--fh-online-bd)' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-medium truncate"
                  style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}
                >
                  {f.name}
                </span>
                {f.isVerified && <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#5e6ad2' }} />}
              </div>
              <p
                className="truncate mt-0.5"
                style={{ fontSize: '12px', color: 'var(--fh-t3)', fontWeight: 400, letterSpacing: '-0.005em' }}
              >
                {f.title}
              </p>
            </div>
            {/* Level badge */}
            <span
              className="shrink-0 text-[11px] px-2 py-0.5 rounded"
              style={{ fontWeight: 590, background: level.color, color: level.text, letterSpacing: '0.02em' }}
            >
              {level.label}
            </span>
          </div>

          {/* Rating & location */}
          <div className="flex items-center justify-between">
            {f.reviewsCount > 0 ? (
              <RatingStars rating={f.rating} count={f.reviewsCount} />
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>New member</span>
            )}
            <div className="flex items-center gap-1" style={{ color: 'var(--fh-t4)' }}>
              <MapPin className="h-3 w-3" />
              <span style={{ fontSize: '12px', fontWeight: 400 }}>{f.location}</span>
            </div>
          </div>

          {/* Availability badge */}
          {f.availability && f.availability !== 'open' && (() => {
            const av = AVAILABILITY_LABELS[f.availability]
            return (
              <div className="flex items-center gap-1.5" style={{ marginTop: '-4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: av.dot, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 400 }}>{av.label}</span>
              </div>
            )
          })()}

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {f.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: 'var(--fh-skill-bg)',
                  border: '1px solid var(--fh-skill-bd)',
                  color: 'var(--fh-t3)',
                  fontWeight: 510,
                  fontSize: '11px',
                  letterSpacing: '-0.01em',
                }}
              >
                {skill}
              </span>
            ))}
            {f.skills.length > 4 && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-skill-bd)', color: 'var(--fh-t4)', fontSize: '11px' }}
              >
                +{f.skills.length - 4}
              </span>
            )}
          </div>

          {/* Footer */}
          <div
            className="mt-auto flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--fh-sep)' }}
          >
            <div>
              <PriceDisplay amountRub={f.priceFrom} prefix="from " size="sm" className="font-medium" />
              <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}> / hr</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: 'var(--fh-t4)' }}>
              <Clock className="h-3 w-3" />
              <span style={{ fontSize: '11px', fontWeight: 400 }}>{f.responseTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
