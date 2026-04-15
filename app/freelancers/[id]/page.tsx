import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CheckCircle, Clock, Star, Package, ArrowLeft, MessageCircle, Circle, Crown } from 'lucide-react'
import RatingStars from '@/components/shared/RatingStars'
import PriceDisplay from '@/components/shared/PriceDisplay'
import OnlineStatus from '@/components/shared/OnlineStatus'
import ReviewsSection from '@/components/shared/ReviewsSection'
import PortfolioSection from '@/components/freelancers/PortfolioSection'
import ProfileViewLogger from '@/components/shared/ProfileViewLogger'
import { CATEGORIES } from '@/lib/mock/categories'
import { createClient } from '@/lib/supabase/server'
import { Freelancer, PortfolioItem } from '@/lib/types'

const AVAILABILITY_LABELS = {
  open:     { label: 'Available',   dot: '#27a644' },
  busy:     { label: 'Busy',        dot: '#f59e0b' },
  vacation: { label: 'On vacation', dot: '#8a8f98' },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

const LEVEL_LABELS = {
  new: 'Newcomer', junior: 'Junior', middle: 'Middle', senior: 'Senior', top: 'TOP',
}

async function getFreelancerFromSupabase(userId: string): Promise<Freelancer | null> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('freelancer_profiles')
      .select(`
        id, user_id, title, category, skills, price_from, price_to,
        level, response_time, languages, is_verified, is_premium, premium_until, rating,
        reviews_count, completed_orders, created_at, availability_status,
        profiles!inner (full_name, username, avatar_url, location, bio)
      `)
      .eq('user_id', userId)
      .single()

    if (error || !data) return null

    // Load portfolio items
    const { data: portfolioData } = await db
      .from('portfolio_items')
      .select('id, title, image_url, category, project_url')
      .eq('freelancer_id', data.id)
      .order('created_at', { ascending: false })

    const portfolio: PortfolioItem[] = (portfolioData ?? []).map((p: {
      id: string; title: string; image_url: string | null; category: string | null; project_url: string | null
    }) => ({
      id: p.id,
      title: p.title,
      image: p.image_url ?? '',
      category: p.category ?? '',
      url: p.project_url ?? undefined,
    }))

    const profile = data.profiles
    const name = profile?.full_name || profile?.username || 'User'
    const avatar =
      profile?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`

    return {
      id: data.user_id,
      name,
      avatar,
      title: data.title,
      category: data.category,
      skills: data.skills ?? [],
      rating: data.rating ?? 0,
      reviewsCount: data.reviews_count ?? 0,
      completedOrders: data.completed_orders ?? 0,
      responseTime: data.response_time ?? '1 hour',
      priceFrom: data.price_from ?? 0,
      priceTo: data.price_to ?? undefined,
      location: profile?.location || 'CIS',
      isOnline: false,
      isVerified: data.is_verified ?? false,
      isPremium: (data.is_premium && (!data.premium_until || new Date(data.premium_until) > new Date())) ?? false,
      portfolio,
      description: profile?.bio || '',
      level: data.level ?? 'new',
      languages: data.languages ?? ['ru'],
      registeredAt: data.created_at,
      availability: data.availability_status ?? 'open',
    }
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  // All freelancer profile pages are rendered dynamically at request time
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const f = await getFreelancerFromSupabase(id)
  if (!f) return { title: 'Profile not found — FreelanceHub' }

  const desc = `${f.name} — ${f.title}. Rating ${f.rating}, ${f.reviewsCount} reviews. Completed ${f.completedOrders} orders on FreelanceHub.`

  return {
    title: `${f.name} — ${f.title} | FreelanceHub`,
    description: desc,
    openGraph: {
      title: `${f.name} — ${f.title}`,
      description: desc,
      type: 'profile',
      locale: 'en_US',
      siteName: 'FreelanceHub',
      images: f.avatar ? [{ url: f.avatar, width: 400, height: 400, alt: f.name }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${f.name} — ${f.title}`,
      description: desc,
      images: f.avatar ? [f.avatar] : [],
    },
    alternates: {
      canonical: `/freelancers/${id}`,
    },
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: f.name,
        jobTitle: f.title,
        description: f.description,
        image: f.avatar,
        url: `${SITE_URL}/freelancers/${id}`,
        knowsAbout: f.skills,
        aggregateRating: f.reviewsCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: f.rating,
          reviewCount: f.reviewsCount,
          bestRating: 5,
        } : undefined,
      }),
    },
  }
}

export default async function FreelancerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [freelancer, { data: { user } }] = await Promise.all([
    getFreelancerFromSupabase(id),
    supabase.auth.getUser(),
  ])
  const f = freelancer
  if (!f) notFound()
  const category = CATEGORIES.find((c) => c.slug === f.category)
  const isLoggedIn = !!user

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <ProfileViewLogger freelancerId={f.id} />
      {/* Back */}
      <Link href="/freelancers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to freelancers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border border-subtle bg-card p-6">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <Image src={f.avatar} alt={f.name} width={80} height={80} className="rounded-2xl" unoptimized />
                {f.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card pulse-green" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{f.name}</h1>
                  {f.isVerified && <CheckCircle className="h-5 w-5 text-primary" />}
                  {f.isPremium && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(94,106,210,0.12)', color: '#5e6ad2', border: '1px solid rgba(94,106,210,0.25)' }}>
                      <Crown className="h-3 w-3" /> Premium
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    {LEVEL_LABELS[f.level]}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">{f.title}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {f.reviewsCount > 0 ? (
                    <RatingStars rating={f.rating} size="md" count={f.reviewsCount} />
                  ) : (
                    <span className="text-sm text-muted-foreground">New member</span>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {f.location}
                  </div>
                  <OnlineStatus isOnline={f.isOnline} />
                  {f.availability && (() => {
                    const av = AVAILABILITY_LABELS[f.availability as keyof typeof AVAILABILITY_LABELS] ?? AVAILABILITY_LABELS.open
                    return (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Circle className="h-2.5 w-2.5" style={{ fill: av.dot, color: av.dot }} />
                        <span className="text-muted-foreground">{av.label}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{f.description}</p>

            {/* Achievement badges */}
            {(() => {
              const badges: { icon: string; label: string; color: string; bg: string }[] = []
              if (f.rating >= 4.8 && f.reviewsCount >= 5)
                badges.push({ icon: '🏆', label: 'Top rated', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' })
              if (f.responseTime && (f.responseTime.includes('1 hour') || f.responseTime.includes('4 hours') || f.responseTime.includes('1 час') || f.responseTime.includes('4 часа')))
                badges.push({ icon: '⚡', label: 'Fast reply', color: '#7170ff', bg: 'rgba(113,112,255,0.08)' })
              if (f.completedOrders >= 50)
                badges.push({ icon: '🔥', label: 'Pro', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' })
              if (f.reviewsCount >= 20)
                badges.push({ icon: '💬', label: 'Trusted', color: '#27a644', bg: 'rgba(39,166,68,0.08)' })
              if (!badges.length) return null
              return (
                <div className="mt-4 flex flex-wrap gap-2">
                  {badges.map(b => (
                    <span key={b.label} className="flex items-center gap-1.5"
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        fontWeight: 590, background: b.bg, color: b.color, letterSpacing: '0.01em',
                      }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                </div>
              )
            })()}

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-subtle">
              <div className="text-center">
                <div className="text-xl font-bold">{f.completedOrders}</div>
                <div className="text-xs text-muted-foreground">orders</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{f.reviewsCount > 0 ? f.rating : '—'}</div>
                <div className="text-xs text-muted-foreground">rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{f.reviewsCount}</div>
                <div className="text-xs text-muted-foreground">reviews</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-subtle bg-card p-6">
            <h2 className="font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {f.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio with lightbox */}
          <PortfolioSection portfolio={f.portfolio} />

          {/* Reviews — real Supabase + mock combined */}
          <ReviewsSection
            freelancerId={f.id}
            freelancerName={f.name}
            mockReviews={f.reviews}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Right: Hire */}
        <div className="space-y-4">
          <div className="sticky top-20 rounded-2xl border border-subtle bg-card p-6">
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-1">Rate</div>
              <div className="flex items-baseline gap-1">
                <PriceDisplay amountRub={f.priceFrom} prefix="from " size="lg" className="text-primary" />
                {f.priceTo && (
                  <>
                    <span className="text-muted-foreground text-sm">—</span>
                    <PriceDisplay amountRub={f.priceTo} prefix="" size="lg" />
                  </>
                )}
                <span className="text-muted-foreground text-sm"> / hr</span>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                Responds in {f.responseTime}
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 shrink-0" />
                {f.completedOrders} completed orders
              </div>
              {category && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 text-center text-xs">📂</span>
                  {category.label}
                </div>
              )}
            </div>

            <Link href={`/messages?open=${f.id}`} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors mb-3 flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" /> Message freelancer
            </Link>
            <Link href="/orders/new" className="w-full py-3 rounded-xl border border-subtle bg-subtle font-semibold hover:bg-surface transition-colors text-sm flex items-center justify-center">
              Post a job
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
