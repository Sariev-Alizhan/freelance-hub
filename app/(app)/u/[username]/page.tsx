import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star, Package, MessageCircle,
  Clock, Globe, ExternalLink, ArrowLeft, Briefcase,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n/server'
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
import ProfileStoryHighlights, { type Highlight as HighlightRow } from '@/components/profile/ProfileStoryHighlights'
import ProfileActivityHeatmap from '@/components/profile/ProfileActivityHeatmap'
import SkillsWithEndorsements from '@/components/profile/SkillsWithEndorsements'
import ProfileProSection from '@/components/freelancers/ProfileProSection'
import FounderCard from '@/components/freelancers/FounderCard'
import ProfileExperienceTimeline, { type WorkEntry } from '@/components/profile/ProfileExperienceTimeline'
import ProfileServices, { type Service as ServiceCard } from '@/components/profile/ProfileServices'
import ProfileRecommendations, { type Recommendation } from '@/components/profile/ProfileRecommendations'
import ProfileReels from '@/components/profile/ProfileReels'
import type { Reel } from '@/components/reels/ReelPlayer'
import ProfileFeaturedWork, { type FeaturedItem } from '@/components/profile/ProfileFeaturedWork'

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
  featured?: FeaturedItem[]
  // Pro section fields (freelancer_profiles v6/v7)
  headline?: string
  portfolioWebsite?: string
  githubUrl?: string
  linkedinUrl?: string
  resumeUrl?: string
  resumeFilename?: string
  telegramUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
}

async function getProfile(username: string, fallbacks: { user: string; cis: string }): Promise<PageProfile | null> {
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

    const name   = profile.full_name || profile.username || fallbacks.user
    const avatar = profile.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`

    const base: PageProfile = {
      userId:      profile.id,
      username:    profile.username,
      name,
      avatar,
      bio:         profile.bio || '',
      location:    profile.location || fallbacks.cis,
      isFreelancer: false,
      isVerified:   profile.is_verified ?? false,
    }

    // 2. Check if they have a freelancer profile
    const { data: fp } = await db
      .from('freelancer_profiles')
      .select(`
        id, title, category, skills, level, rating, reviews_count,
        completed_orders, price_from, price_to, response_time,
        is_verified, is_premium, premium_until, availability_status, languages,
        headline, portfolio_website, github_url, linkedin_url,
        resume_url, resume_filename,
        telegram_url, instagram_url, twitter_url, youtube_url, tiktok_url
      `)
      .eq('user_id', profile.id)
      .single()

    if (!fp) return base

    // 3. Load portfolio — featured first
    const { data: portfolioData } = await db
      .from('portfolio_items')
      .select('id, title, image_url, category, project_url, description, is_featured, featured_position')
      .eq('freelancer_id', profile.id)
      .order('is_featured',       { ascending: false })
      .order('featured_position', { ascending: true, nullsFirst: false })
      .order('created_at',        { ascending: false })

    type PortfolioRow = {
      id: string; title: string; image_url: string | null
      category: string | null; project_url: string | null
      description: string | null; is_featured: boolean
      featured_position: number | null
    }
    const portfolio: PortfolioItem[] = (portfolioData ?? []).map((p: PortfolioRow) => ({
      id:       p.id,
      title:    p.title,
      image:    p.image_url ?? '',
      category: p.category ?? '',
      url:      p.project_url ?? undefined,
    }))
    const featured: FeaturedItem[] = ((portfolioData ?? []) as PortfolioRow[])
      .filter(p => p.is_featured)
      .slice(0, 4)
      .map(p => ({
        id:          p.id,
        title:       p.title,
        description: p.description,
        image_url:   p.image_url,
        project_url: p.project_url,
        category:    p.category,
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
      featured,
      headline:         fp.headline ?? undefined,
      portfolioWebsite: fp.portfolio_website ?? undefined,
      githubUrl:        fp.github_url ?? undefined,
      linkedinUrl:      fp.linkedin_url ?? undefined,
      resumeUrl:        fp.resume_url ?? undefined,
      resumeFilename:   fp.resume_filename ?? undefined,
      telegramUrl:      fp.telegram_url ?? undefined,
      instagramUrl:     fp.instagram_url ?? undefined,
      twitterUrl:       fp.twitter_url ?? undefined,
      youtubeUrl:       fp.youtube_url ?? undefined,
      tiktokUrl:        fp.tiktok_url ?? undefined,
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
  const t = await getServerT()
  const tp = t.profilePage
  const p = await getProfile(username, { user: tp.userFallback, cis: tp.locationFallback })
  if (!p) return { title: tp.notFound }

  const desc = p.isFreelancer
    ? `${p.name} — ${p.title}. ${p.reviewsCount} ${tp.metaDescFreelancer} ${p.rating}.`
    : `${p.name} — ${tp.metaDescBase}`

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
  const t = await getServerT()
  const tp = t.profilePage
  const p = await getProfile(username, { user: tp.userFallback, cis: tp.locationFallback })
  if (!p) notFound()

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === p.userId

  // Follower/following counts (public, no auth required)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const oneYearAgo   = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  const [
    { count: followersCount },
    { count: followingCount },
    { count: viewsWeek },
    { data: postRows },
    { data: experienceRows },
    { data: serviceRows },
    { data: highlightRows },
    { data: recRows },
    { data: reelRows },
  ] = await Promise.all([
    db.from('follows').select('follower',  { count: 'exact', head: true }).eq('following', p.userId),
    db.from('follows').select('following', { count: 'exact', head: true }).eq('follower',  p.userId),
    p.isFreelancer
      ? db.from('profile_views').select('id', { count: 'exact', head: true })
          .eq('freelancer_id', p.userId).gte('created_at', sevenDaysAgo)
      : Promise.resolve({ count: 0 }),
    db.from('feed_posts').select('created_at').eq('user_id', p.userId).gte('created_at', oneYearAgo),
    db.from('work_experience')
      .select('id, company, position, description, start_date, end_date, is_current, location')
      .eq('user_id', p.userId).order('start_date', { ascending: false }),
    p.isFreelancer
      ? db.from('services').select(`
          id, title, description, category, cover_image, skills, purchases_count,
          tiers:service_tiers(id, tier, title, price, delivery_days, revisions, description, features)
        `).eq('freelancer_id', p.userId).eq('is_active', true).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    db.from('story_highlights').select(`
      id, title, cover_url, position,
      items:story_highlight_items(id, type, content, bg_color, media_url, position)
    `).eq('user_id', p.userId).order('position', { ascending: true }),
    db.from('recommendations').select(`
      id, author_id, author_title, relationship, body, created_at,
      author:author_id ( full_name, username, avatar_url, is_verified )
    `).eq('recipient_id', p.userId).eq('status', 'approved')
      .order('created_at', { ascending: false }),
    db.from('reels').select('id, user_id, video_url, thumbnail_url, caption, duration_seconds, aspect_ratio, views, created_at')
      .eq('user_id', p.userId).order('created_at', { ascending: false }).limit(12),
  ])

  const experience: WorkEntry[] = (experienceRows ?? []) as WorkEntry[]
  const services:   ServiceCard[] = (serviceRows ?? []) as ServiceCard[]
  const highlights: HighlightRow[] = ((highlightRows ?? []) as HighlightRow[]).map(h => ({
    ...h,
    items: [...(h.items ?? [])].sort((a, b) => a.position - b.position),
  }))
  const recommendations: Recommendation[] = (recRows ?? []) as Recommendation[]
  const reels: Reel[] = ((reelRows ?? []) as Omit<Reel, 'author'>[]).map(r => ({ ...r, author: null }))

  // Bucket posts by day for activity heatmap
  const activityCounts: Record<string, number> = {}
  for (const r of (postRows ?? []) as Array<{ created_at: string }>) {
    const key = r.created_at.slice(0, 10) // YYYY-MM-DD
    activityCounts[key] = (activityCounts[key] ?? 0) + 1
  }
  const totalActivity = (postRows ?? []).length

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
            {tp.rate}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <PriceDisplay amountRub={p.priceFrom!} prefix={tp.from} size="lg" className="text-primary" />
            {p.priceTo && <>
              <span style={{ color: 'var(--fh-t4)', fontSize: 14 }}>—</span>
              <PriceDisplay amountRub={p.priceTo} prefix="" size="lg" />
            </>}
            <span style={{ fontSize: 13, color: 'var(--fh-t4)' }}>{tp.perHour}</span>
          </div>
        </div>
      )}

      {(p.responseTime || (p.completedOrders ?? 0) > 0 || category) && (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {p.responseTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t3)' }}>
              <Clock className="h-4 w-4 flex-shrink-0" /> {tp.respondsIn} {p.responseTime}
            </div>
          )}
          {(p.completedOrders ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fh-t3)' }}>
              <Package className="h-4 w-4 flex-shrink-0" /> {p.completedOrders} {tp.completedOrders}
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>{tp.skills}</h2>
            {!isOwnProfile && (
              <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{tp.tapToEndorse}</span>
            )}
          </div>
          <SkillsWithEndorsements
            skills={p.skills}
            targetUserId={p.userId}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}

      <ProfileActivityHeatmap counts={activityCounts} totalCount={totalActivity} />

      {p.isFreelancer && (
        <ProfileServices
          services={services}
          isOwnProfile={isOwnProfile}
          viewerLoggedIn={!!user}
        />
      )}

      <ProfileReels reels={reels} isOwner={isOwnProfile} />

      <ProfileRecommendations
        recipientId={p.userId}
        recipientName={p.name}
        recommendations={recommendations}
        isOwnProfile={isOwnProfile}
        viewerLoggedIn={!!user}
      />

      <ProfileExperienceTimeline items={experience} isOwnProfile={isOwnProfile} />

      {p.isFreelancer && (
        p.headline || p.portfolioWebsite || p.githubUrl || p.linkedinUrl ||
        p.resumeUrl || p.telegramUrl || p.instagramUrl ||
        p.twitterUrl || p.youtubeUrl || p.tiktokUrl
      ) && (
        <ProfileProSection
          userId={p.userId}
          headline={p.headline}
          portfolioWebsite={p.portfolioWebsite}
          githubUrl={p.githubUrl}
          linkedinUrl={p.linkedinUrl}
          resumeUrl={p.resumeUrl}
          resumeFilename={p.resumeFilename}
          telegramUrl={p.telegramUrl}
          instagramUrl={p.instagramUrl}
          twitterUrl={p.twitterUrl}
          youtubeUrl={p.youtubeUrl}
          tiktokUrl={p.tiktokUrl}
        />
      )}

      {process.env.FOUNDER_USER_ID === p.userId && <FounderCard />}

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
                <ExternalLink className="h-2.5 w-2.5" /> {tp.view}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: 'var(--fh-t4)',
      background: 'var(--fh-surface)', borderRadius: 14, border: '1px solid var(--fh-border-2)' }}>
      {tp.noPortfolio}
    </div>
  )

  const tabs = [
    { id: 'posts', label: tp.tabPosts },
    { id: 'about', label: tp.tabAbout },
    ...(p.isFreelancer ? [{ id: 'portfolio', label: tp.tabPortfolio, count: p.portfolio?.length ?? 0 }] : []),
    ...(p.isFreelancer ? [{ id: 'reviews',   label: tp.tabReviews,   count: p.reviewsCount ?? 0 }] : []),
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
        <ArrowLeft className="h-3.5 w-3.5" /> {tp.backToFreelancers}
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
          ownerActions={isOwnProfile
            ? <ProfileOwnerActions
                isFreelancer={p.isFreelancer}
                initialAvailability={p.availability as 'open' | 'busy' | 'vacation' | undefined}
              />
            : undefined}
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

        {p.isFreelancer && ((p.featured?.length ?? 0) > 0 || isOwnProfile) && (
          <ProfileFeaturedWork
            items={p.featured ?? []}
            isOwner={isOwnProfile}
          />
        )}

        {(highlights.length > 0 || isOwnProfile) && (
          <ProfileStoryHighlights highlights={highlights} isOwnProfile={isOwnProfile} />
        )}

        {/* Inline desktop action bar — only for other users (own sees gear/pencil on cover) */}
        {!isOwnProfile && (
          <div className="hidden md:flex" style={{ gap: 8 }}>
            <Link href={`/messages?open=${p.userId}`} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 16px', borderRadius: 8, background: '#5e6ad2', color: '#fff',
              fontSize: 13, fontWeight: 590, textDecoration: 'none',
            }}>
              <MessageCircle className="h-4 w-4" /> {tp.sendMessage}
            </Link>
            <div style={{ flex: 1 }}><FollowButton targetUserId={p.userId} /></div>
            <Link href="/orders/new" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 16px', borderRadius: 8,
              background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)', fontSize: 13, fontWeight: 510, textDecoration: 'none',
            }}>
              <Briefcase className="h-4 w-4" /> {tp.hire}
            </Link>
          </div>
        )}

        <ProfileTabs tabs={tabs} panels={panels} defaultTab="posts" />
      </div>

      {!isOwnProfile && <ProfileStickyActions targetUserId={p.userId} />}
    </div>
  )
}
