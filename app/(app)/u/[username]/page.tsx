import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star, Package, MessageCircle,
  Clock, Globe, ExternalLink, ArrowLeft, Briefcase,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/mock/categories'
import PriceDisplay from '@/components/shared/PriceDisplay'
import ReviewsSection from '@/components/shared/ReviewsSection'
import ShareProfileSheet from '@/components/profile/ShareProfileSheet'
import { PortfolioItem } from '@/lib/types'
import ProfileViewLogger from '@/components/shared/ProfileViewLogger'
import FollowButton from '@/components/profile/FollowButton'
import ProfilePosts from '@/components/profile/ProfilePosts'
import ProfileHero from '@/components/profile/ProfileHero'
import ProfileStats from '@/components/profile/ProfileStats'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileStickyActions from '@/components/profile/ProfileStickyActions'
import ProfileOwnerActions from '@/components/profile/ProfileOwnerActions'
import ProfileBadges from '@/components/profile/ProfileBadges'
import ProfileHighlights from '@/components/profile/ProfileHighlights'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === p.userId

  // Follower/following counts (public, no auth required)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [{ count: followersCount }, { count: followingCount }, { count: viewsWeek }] = await Promise.all([
    db.from('follows').select('follower',  { count: 'exact', head: true }).eq('following', p.userId),
    db.from('follows').select('following', { count: 'exact', head: true }).eq('follower',  p.userId),
    p.isFreelancer
      ? db.from('profile_views').select('id', { count: 'exact', head: true })
          .eq('freelancer_id', p.userId).gte('created_at', sevenDaysAgo)
      : Promise.resolve({ count: 0 }),
  ])

  const category = p.category ? CATEGORIES.find(c => c.slug === p.category) : null
  const profileUrl = `${SITE_URL}/u/${username}`

  // Completion % for own profile only — drives avatar ring
  let completionPct = 0
  if (isOwnProfile) {
    const items = [
      !!p.avatar && !p.avatar.includes('dicebear'),
      !!p.bio,
      !!p.location && p.location !== 'CIS',
      ...(p.isFreelancer ? [!!p.title, (p.skills?.length ?? 0) >= 2] : []),
    ]
    completionPct = Math.round((items.filter(Boolean).length / items.length) * 100)
  }

  const aboutPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {p.isFreelancer && (p.priceFrom ?? 0) > 0 && (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <div style={{ fontSize: 11, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <PriceDisplay amountRub={p.priceFrom!} prefix="from " size="lg" className="text-primary" />
            {p.priceTo && <>
              <span style={{ color: 'var(--fh-t4)', fontSize: 14 }}>—</span>
              <PriceDisplay amountRub={p.priceTo} prefix="" size="lg" />
            </>}
            <span style={{ fontSize: 13, color: 'var(--fh-t4)' }}>/hr</span>
          </div>
        </div>
      )}

      {(p.responseTime || (p.completedOrders ?? 0) > 0 || category) && (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {p.responseTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t3)' }}>
              <Clock className="h-4 w-4 flex-shrink-0" /> Responds in {p.responseTime}
            </div>
          )}
          {(p.completedOrders ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t3)' }}>
              <Package className="h-4 w-4 flex-shrink-0" /> {p.completedOrders} completed orders
            </div>
          )}
          {category && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t3)' }}>
              <Star className="h-4 w-4 flex-shrink-0" style={{ color: category.color }} /> {category.label}
            </div>
          )}
        </div>
      )}

      {p.skills && p.skills.length > 0 && (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 12 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {p.skills.map(s => (
              <span key={s} style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 510,
                background: 'rgba(113,112,255,0.08)', color: '#7170ff',
                border: '1px solid rgba(113,112,255,0.18)',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
        <ShareProfileSheet url={profileUrl} username={p.username} />
      </div>
    </div>
  )

  const portfolioPanel = (p.portfolio && p.portfolio.length > 0) ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
      {p.portfolio.map(item => (
        <div key={item.id} style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--fh-border)', background: 'var(--fh-surface)',
        }}>
          <div style={{ height: 110, position: 'relative', background: 'var(--fh-canvas)' }}>
            {item.image ? (
              <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe className="h-6 w-6" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
              </div>
            )}
          </div>
          <div style={{ padding: '8px 10px' }}>
            <p style={{ fontSize: 12, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </p>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 10, color: '#5e6ad2', display: 'flex', alignItems: 'center', gap: 3 }}>
                <ExternalLink className="h-2.5 w-2.5" /> View
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: 'var(--fh-t4)',
      background: 'var(--fh-surface)', borderRadius: 14, border: '1px solid var(--fh-border-2)' }}>
      No portfolio items yet.
    </div>
  )

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'about', label: 'About' },
    ...(p.isFreelancer ? [{ id: 'portfolio', label: 'Portfolio', count: p.portfolio?.length ?? 0 }] : []),
    ...(p.isFreelancer ? [{ id: 'reviews',   label: 'Reviews',   count: p.reviewsCount ?? 0 }] : []),
  ]

  const panels: Record<string, React.ReactNode> = {
    posts:     <ProfilePosts userId={p.userId} isOwner={isOwnProfile} />,
    about:     aboutPanel,
    portfolio: portfolioPanel,
    reviews:   p.isFreelancer
      ? <ReviewsSection freelancerId={p.userId} freelancerName={p.name} isLoggedIn={!!user} />
      : null,
  }

  return (
    <div className="page-shell page-shell--reading" style={{ paddingBottom: !isOwnProfile ? 80 : undefined }}>
      {p.isFreelancer && <ProfileViewLogger freelancerId={p.userId} />}

      <Link href="/freelancers"
        className="inline-flex items-center gap-2 mb-6 transition-colors"
        style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to freelancers
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ProfileHero
          username={p.username}
          name={p.name}
          avatar={p.avatar}
          bio={p.bio}
          location={p.location}
          isVerified={p.isVerified}
          isPremium={p.isPremium}
          level={p.level}
          title={p.title}
          availability={p.availability}
          rating={p.rating}
          reviewsCount={p.reviewsCount}
          isFreelancer={p.isFreelancer}
          completionPct={completionPct}
          completionHref={isOwnProfile ? '/profile/setup' : undefined}
          ownerActions={isOwnProfile ? <ProfileOwnerActions /> : undefined}
        />

        <ProfileStats
          username={p.username}
          followersCount={followersCount ?? 0}
          followingCount={followingCount ?? 0}
          completedOrders={p.completedOrders}
          rating={p.rating}
          reviewsCount={p.reviewsCount}
          viewsWeek={viewsWeek ?? 0}
          isFreelancer={p.isFreelancer}
        />

        <ProfileBadges
          isVerified={p.isVerified}
          isPremium={p.isPremium}
          rating={p.rating}
          reviewsCount={p.reviewsCount}
          completedOrders={p.completedOrders}
          responseTime={p.responseTime}
          availability={p.availability}
          isFreelancer={p.isFreelancer}
        />

        {p.portfolio && p.portfolio.length > 0 && (
          <ProfileHighlights items={p.portfolio} />
        )}

        {/* Inline desktop action bar — only for other users (own sees gear/pencil on cover) */}
        {!isOwnProfile && (
          <div className="hidden md:flex" style={{ gap: 8 }}>
            <Link href={`/messages?open=${p.userId}`} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 16px', borderRadius: 8, background: '#5e6ad2', color: '#fff',
              fontSize: 13, fontWeight: 590, textDecoration: 'none',
            }}>
              <MessageCircle className="h-4 w-4" /> Send message
            </Link>
            <div style={{ flex: 1 }}><FollowButton targetUserId={p.userId} /></div>
            <Link href="/orders/new" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 16px', borderRadius: 8,
              background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)', fontSize: 13, fontWeight: 510, textDecoration: 'none',
            }}>
              <Briefcase className="h-4 w-4" /> Hire
            </Link>
          </div>
        )}

        <ProfileTabs tabs={tabs} panels={panels} defaultTab="posts" />
      </div>

      {!isOwnProfile && <ProfileStickyActions targetUserId={p.userId} />}
    </div>
  )
}
