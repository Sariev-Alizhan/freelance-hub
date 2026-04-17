import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, CheckCircle, Star, Package, MessageCircle,
  Clock, Globe, Crown, Circle, ExternalLink, ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/mock/categories'
import RatingStars from '@/components/shared/RatingStars'
import PriceDisplay from '@/components/shared/PriceDisplay'
import ReviewsSection from '@/components/shared/ReviewsSection'
import ShareProfileButton from '@/components/shared/ShareProfileButton'
import { PortfolioItem } from '@/lib/types'
import ProfileViewLogger from '@/components/shared/ProfileViewLogger'
import FriendButton from '@/components/profile/FriendButton'
import ProfilePosts from '@/components/profile/ProfilePosts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

const AVAILABILITY = {
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

interface PageProfile {
  userId: string
  username: string
  name: string
  avatar: string
  bio: string
  location: string
  isFreelancer: boolean
  // freelancer fields (optional)
  title?: string
  category?: string
  skills?: string[]
  level?: string
  rating?: number
  reviewsCount?: number
  completedOrders?: number
  priceFrom?: number
  priceTo?: number
  responseTime?: string
  isVerified?: boolean
  isPremium?: boolean
  availability?: string
  languages?: string[]
  portfolio?: PortfolioItem[]
}

async function getProfile(username: string): Promise<PageProfile | null> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // 1. Find profile by username
    const { data: profile, error: pErr } = await db
      .from('profiles')
      .select('id, full_name, username, avatar_url, location, bio, role, is_verified')
      .eq('username', username)
      .single()

    if (pErr || !profile) return null

    const name   = profile.full_name || profile.username || 'User'
    const avatar = profile.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`

    const base: PageProfile = {
      userId:      profile.id,
      username:    profile.username,
      name,
      avatar,
      bio:         profile.bio || '',
      location:    profile.location || 'CIS',
      isFreelancer: false,
      isVerified:   profile.is_verified ?? false,
    }

    // 2. Check if they have a freelancer profile
    const { data: fp } = await db
      .from('freelancer_profiles')
      .select(`
        id, title, category, skills, level, rating, reviews_count,
        completed_orders, price_from, price_to, response_time,
        is_verified, is_premium, premium_until, availability_status, languages
      `)
      .eq('user_id', profile.id)
      .single()

    if (!fp) return base

    // 3. Load portfolio
    const { data: portfolioData } = await db
      .from('portfolio_items')
      .select('id, title, image_url, category, project_url')
      .eq('freelancer_id', profile.id)
      .order('created_at', { ascending: false })

    const portfolio: PortfolioItem[] = (portfolioData ?? []).map((p: {
      id: string; title: string; image_url: string | null
      category: string | null; project_url: string | null
    }) => ({
      id:       p.id,
      title:    p.title,
      image:    p.image_url ?? '',
      category: p.category ?? '',
      url:      p.project_url ?? undefined,
    }))

    return {
      ...base,
      isFreelancer:    true,
      title:           fp.title,
      category:        fp.category,
      skills:          fp.skills ?? [],
      level:           fp.level ?? 'new',
      rating:          fp.rating ?? 0,
      reviewsCount:    fp.reviews_count ?? 0,
      completedOrders: fp.completed_orders ?? 0,
      priceFrom:       fp.price_from ?? 0,
      priceTo:         fp.price_to ?? undefined,
      responseTime:    fp.response_time ?? '1 hr',
      isVerified:      fp.is_verified ?? false,
      isPremium:       fp.is_premium && (!fp.premium_until || new Date(fp.premium_until) > new Date()),
      availability:    fp.availability_status ?? 'open',
      languages:       fp.languages ?? [],
      portfolio,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const p = await getProfile(username)
  if (!p) return { title: 'Profile not found — FreelanceHub' }

  const desc = p.isFreelancer
    ? `${p.name} — ${p.title}. ${p.reviewsCount} reviews, rating ${p.rating} on FreelanceHub.`
    : `${p.name}'s profile on FreelanceHub.`

  return {
    title: `${p.name} (@${p.username}) — FreelanceHub`,
    description: desc,
    openGraph: {
      title: `${p.name} (@${p.username})`,
      description: desc,
      type: 'profile',
      locale: 'en_US',
      siteName: 'FreelanceHub',
      images: [{ url: p.avatar, width: 400, height: 400, alt: p.name }],
    },
    twitter: { card: 'summary', title: `${p.name} (@${p.username})`, description: desc, images: [p.avatar] },
    alternates: { canonical: `${SITE_URL}/u/${username}` },
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const p = await getProfile(username)
  if (!p) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === p.userId

  const category = p.category ? CATEGORIES.find(c => c.slug === p.category) : null
  const av = AVAILABILITY[(p.availability as keyof typeof AVAILABILITY) ?? 'open']
  const profileUrl = `${SITE_URL}/u/${username}`

  return (
    <div className="page-shell page-shell--reading">
      {p.isFreelancer && <ProfileViewLogger freelancerId={p.userId} />}
      {/* Back */}
      <Link
        href="/freelancers"
        className="inline-flex items-center gap-2 mb-8 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to freelancers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile header card */}
          <div style={{
            borderRadius: '16px', padding: '24px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Image
                  src={p.avatar} alt={p.name}
                  width={80} height={80}
                  style={{ borderRadius: '16px' }}
                  unoptimized
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                    {p.name}
                  </h1>
                  {p.isVerified && <CheckCircle className="h-5 w-5" style={{ color: '#5e6ad2', flexShrink: 0 }} />}
                  {p.isPremium && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 590, padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(94,106,210,0.1)', color: '#5e6ad2', border: '1px solid rgba(94,106,210,0.25)',
                    }}>
                      <Crown className="h-3 w-3" /> Premium
                    </span>
                  )}
                  {p.level && (
                    <span style={{
                      fontSize: '11px', fontWeight: 590, padding: '2px 8px', borderRadius: '20px',
                      background: `${LEVEL_COLORS[p.level]}14`,
                      color: LEVEL_COLORS[p.level],
                      border: `1px solid ${LEVEL_COLORS[p.level]}30`,
                    }}>
                      {LEVEL_LABELS[p.level]}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: 'var(--fh-t3)', marginBottom: '8px' }}>
                  @{p.username}
                  {p.title && <> · {p.title}</>}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {p.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--fh-t4)' }}>
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </span>
                  )}
                  {p.availability && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--fh-t4)' }}>
                      <Circle className="h-2.5 w-2.5" style={{ fill: av.dot, color: av.dot }} />
                      {av.label}
                    </span>
                  )}
                  {p.reviewsCount && p.reviewsCount > 0 ? (
                    <RatingStars rating={p.rating ?? 0} size="sm" count={p.reviewsCount} />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Bio */}
            {p.bio && (
              <p style={{ fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.7, marginBottom: '16px' }}>
                {p.bio}
              </p>
            )}

            {/* Stats */}
            {p.isFreelancer && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                paddingTop: '16px', borderTop: '1px solid var(--fh-sep)',
              }}>
                {[
                  { value: p.completedOrders ?? 0, label: 'orders done' },
                  { value: (p.reviewsCount ?? 0) > 0 ? p.rating?.toFixed(1) ?? '—' : '—', label: 'rating' },
                  { value: p.reviewsCount ?? 0, label: 'reviews' },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          {p.skills && p.skills.length > 0 && (
            <div style={{
              borderRadius: '14px', padding: '20px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '12px' }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {p.skills.map(s => (
                  <span key={s} style={{
                    padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 510,
                    background: 'rgba(113,112,255,0.08)', color: '#7170ff',
                    border: '1px solid rgba(113,112,255,0.18)',
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {p.portfolio && p.portfolio.length > 0 && (
            <div style={{
              borderRadius: '14px', padding: '20px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '12px' }}>Portfolio</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {p.portfolio.map(item => (
                  <div key={item.id} style={{
                    borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid var(--fh-border)', background: 'var(--fh-surface-2)',
                  }}>
                    <div style={{ height: '100px', position: 'relative', background: 'var(--fh-canvas)' }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Globe className="h-6 w-6" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '10px', color: '#5e6ad2', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink className="h-2.5 w-2.5" /> View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {p.isFreelancer && (
            <ReviewsSection
              freelancerId={p.userId}
              freelancerName={p.name}
              isLoggedIn={!!user}
            />
          )}

          {/* User posts */}
          <ProfilePosts userId={p.userId} isOwner={isOwnProfile} />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div style={{
            position: 'sticky', top: '80px', borderRadius: '14px', padding: '20px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
          }}>
            {/* Rate */}
            {p.priceFrom && p.priceFrom > 0 ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rate
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <PriceDisplay amountRub={p.priceFrom} prefix="from " size="lg" className="text-primary" />
                  {p.priceTo && (
                    <>
                      <span style={{ color: 'var(--fh-t4)', fontSize: '14px' }}>—</span>
                      <PriceDisplay amountRub={p.priceTo} prefix="" size="lg" />
                    </>
                  )}
                  <span style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>/hr</span>
                </div>
              </div>
            ) : null}

            {/* Quick info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {p.responseTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fh-t3)' }}>
                  <Clock className="h-4 w-4 flex-shrink-0" /> Responds in {p.responseTime}
                </div>
              )}
              {(p.completedOrders ?? 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fh-t3)' }}>
                  <Package className="h-4 w-4 flex-shrink-0" /> {p.completedOrders} completed orders
                </div>
              )}
              {category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fh-t3)' }}>
                  <Star className="h-4 w-4 flex-shrink-0" style={{ color: category.color }} />
                  {category.label}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isOwnProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href={`/messages?open=${p.userId}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px 16px', borderRadius: '8px',
                    background: '#5e6ad2', color: '#fff',
                    fontSize: '13px', fontWeight: 590, textDecoration: 'none',
                  }}
                >
                  <MessageCircle className="h-4 w-4" /> Send message
                </Link>
                <FriendButton targetUserId={p.userId} />
                <Link
                  href="/orders/new"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '11px 16px', borderRadius: '8px',
                    background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                    color: 'var(--fh-t2)', fontSize: '13px', fontWeight: 510, textDecoration: 'none',
                  }}
                >
                  Post a job
                </Link>
              </div>
            ) : (
              <Link
                href="/profile/setup"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 16px', borderRadius: '8px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t2)', fontSize: '13px', fontWeight: 510, textDecoration: 'none',
                }}
              >
                Edit profile
              </Link>
            )}

            {/* Share */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--fh-sep)' }}>
              <ShareProfileButton url={profileUrl} username={p.username} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
