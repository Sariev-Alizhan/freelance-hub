import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle, Clock } from 'lucide-react'
import RatingStars from '@/components/shared/RatingStars'
import PriceDisplay from '@/components/shared/PriceDisplay'
import FavoriteButton from '@/components/shared/FavoriteButton'
import { Freelancer } from '@/lib/types'

const LEVEL_LABELS = {
  new:    { label: 'Новичок', color: 'rgba(255,255,255,0.06)',  text: '#8a8f98'  },
  junior: { label: 'Junior',  color: 'rgba(56,189,248,0.1)',    text: '#38bdf8'  },
  middle: { label: 'Middle',  color: 'rgba(39,166,68,0.1)',     text: '#27a644'  },
  senior: { label: 'Senior',  color: 'rgba(113,112,255,0.12)',  text: '#7170ff'  },
  top:    { label: 'TOP',     color: 'rgba(251,191,36,0.12)',   text: '#fbbf24'  },
}

interface Props {
  freelancer: Freelancer
}

export default function FreelancerCard({ freelancer: f }: Props) {
  const level = LEVEL_LABELS[f.level]

  return (
    <div className="relative group/card">
      <FavoriteButton
        type="freelancer"
        targetId={f.id}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity"
      />
      <Link href={`/freelancers/${f.id}`}>
        <div
          className="card-hover rounded-xl h-full flex flex-col gap-4 transition-all"
          style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
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
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              />
              {f.isOnline && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 pulse-green"
                  style={{ borderColor: '#08090a' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-medium truncate"
                  style={{ fontSize: '14px', fontWeight: 510, color: '#f7f8f8', letterSpacing: '-0.01em' }}
                >
                  {f.name}
                </span>
                {f.isVerified && <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#5e6ad2' }} />}
              </div>
              <p
                className="truncate mt-0.5"
                style={{ fontSize: '12px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.005em' }}
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
              <span style={{ fontSize: '12px', color: '#62666d', fontWeight: 400 }}>Новый участник</span>
            )}
            <div className="flex items-center gap-1" style={{ color: '#62666d' }}>
              <MapPin className="h-3 w-3" />
              <span style={{ fontSize: '12px', fontWeight: 400 }}>{f.location}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {f.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#8a8f98',
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
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#62666d',
                  fontSize: '11px',
                }}
              >
                +{f.skills.length - 4}
              </span>
            )}
          </div>

          {/* Footer */}
          <div
            className="mt-auto flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <PriceDisplay amountRub={f.priceFrom} prefix="от " size="sm" className="font-medium" />
              <span style={{ fontSize: '11px', color: '#62666d' }}> / час</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: '#62666d' }}>
              <Clock className="h-3 w-3" />
              <span style={{ fontSize: '11px', fontWeight: 400 }}>{f.responseTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
