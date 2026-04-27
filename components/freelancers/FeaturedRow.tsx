'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Crown, CheckCircle } from 'lucide-react'
import { Freelancer } from '@/lib/types'

/** Horizontal scroll row of top picks — shown above the grid on the
 *  default view. Hidden once the user is searching/filtering. */
export default function FeaturedRow({ freelancers }: { freelancers: Freelancer[] }) {
  // Premium & verified, rated 4.7+, take top 8 by rating
  const picks = [...freelancers]
    .filter(f => (f.isPremium || f.isVerified) && f.rating >= 4.7 && f.reviewsCount >= 3)
    .sort((a, b) => {
      const pa = (a.isPremium ? 2 : 0) + (a.isVerified ? 1 : 0)
      const pb = (b.isPremium ? 2 : 0) + (b.isVerified ? 1 : 0)
      if (pb !== pa) return pb - pa
      return b.rating - a.rating
    })
    .slice(0, 8)

  if (picks.length < 3) return null

  return (
    <div className="mb-5 sm:mb-6">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 style={{
          fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)',
          letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Crown className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} />
          Featured
        </h2>
        <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
          {picks.length} top picks
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2.5" style={{ width: 'max-content', paddingBottom: 4 }}>
          {picks.map(f => (
            <Link key={f.id} href={f.username ? `/u/${f.username}` : `/freelancers/${f.id}`} className="flex-shrink-0 active:scale-[0.97] transition-transform">
              <div style={{
                width: 156, padding: 12, borderRadius: 12,
                background: 'var(--fh-surface)',
                border: f.isPremium ? '1px solid rgba(251,191,36,0.28)' : '1px solid var(--fh-border-2)',
                boxShadow: f.isPremium ? '0 0 0 1px rgba(251,191,36,0.08) inset' : 'none',
              }}>
                <div style={{
                  position: 'relative',
                  width: 56, height: 56,
                  margin: '0 auto 8px',
                  borderRadius: '50%',
                  padding: f.isPremium ? 2 : 0,
                  background: f.isPremium
                    ? 'conic-gradient(from 45deg, #fbbf24, #f59e0b, #fbbf24, #d97706, #fbbf24)'
                    : 'transparent',
                }}>
                  <Image
                    src={f.avatar} alt={f.name}
                    width={52} height={52}
                    unoptimized
                    className="rounded-full"
                    style={{
                      display: 'block', width: '100%', height: '100%',
                      objectFit: 'cover',
                      border: f.isPremium ? '2px solid var(--fh-surface)' : '1px solid var(--fh-border-2)',
                    }}
                  />
                  {f.isVerified && (
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'var(--fh-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle style={{ width: 14, height: 14, color: 'var(--fh-primary)' }} />
                    </div>
                  )}
                </div>

                <div style={{
                  fontSize: 12, fontWeight: 590, color: 'var(--fh-t1)',
                  textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em',
                }}>
                  {f.name}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--fh-t4)', textAlign: 'center',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: 1,
                }}>
                  {f.title}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  marginTop: 7, padding: '3px 8px', borderRadius: 999,
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  width: 'fit-content', margin: '7px auto 0',
                }}>
                  <Star style={{ width: 10, height: 10, fill: '#fbbf24', color: '#fbbf24' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
                    {f.rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--fh-t4)' }}>
                    · {f.reviewsCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
