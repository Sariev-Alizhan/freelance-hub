import type { Metadata } from 'next'
import { Suspense } from 'react'
import FreelancersClient from './FreelancersClient'
import { createClient } from '@/lib/supabase/server'
import { Freelancer } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Freelancers — FreelanceHub',
  description:
    'Find the best specialist for your project. Developers, designers, marketers and other freelancers from Kazakhstan, Russia, Ukraine and worldwide.',
  openGraph: {
    title: 'Freelancers — FreelanceHub',
    description: 'Top freelancers worldwide: developers, designers, marketers',
    type: 'website',
    locale: 'en_US',
    siteName: 'FreelanceHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelancers — FreelanceHub',
    description: 'Top freelancers worldwide: developers, designers, marketers',
  },
  alternates: { canonical: '/freelancers' },
}

async function fetchRealFreelancers(): Promise<Freelancer[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('freelancer_profiles')
      .select(`
        id,
        user_id,
        title,
        category,
        skills,
        price_from,
        price_to,
        level,
        response_time,
        languages,
        is_verified,
        is_premium,
        premium_until,
        availability_status,
        rating,
        reviews_count,
        completed_orders,
        created_at,
        profiles!inner (
          full_name,
          username,
          avatar_url,
          location,
          bio
        )
      `)
      .order('rating', { ascending: false })
      .limit(100)

    if (error || !data) return []

    return data.map((fp: any): Freelancer => {
      const profile = fp.profiles
      const name = profile?.full_name || profile?.username || 'User'
      const avatar =
        profile?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`

      return {
        id: fp.user_id,
        name,
        avatar,
        title: fp.title,
        category: fp.category,
        skills: fp.skills ?? [],
        rating: fp.rating ?? 0,
        reviewsCount: fp.reviews_count ?? 0,
        completedOrders: fp.completed_orders ?? 0,
        responseTime: fp.response_time ?? '1 hour',
        priceFrom: fp.price_from ?? 0,
        priceTo: fp.price_to ?? undefined,
        location: profile?.location || 'CIS',
        isOnline: false,
        isVerified: fp.is_verified ?? false,
        isPremium: (fp.is_premium && (!fp.premium_until || new Date(fp.premium_until) > new Date())) ?? false,
        availability: fp.availability_status ?? 'open',
        portfolio: [],
        description: profile?.bio || '',
        level: fp.level ?? 'new',
        languages: fp.languages ?? ['ru'],
        registeredAt: fp.created_at,
      }
    })
    // Premium → Verified → rest (within each group, rating order preserved)
    .sort((a: Freelancer, b: Freelancer) => {
      const scoreA = (a.isPremium ? 2 : 0) + (a.isVerified ? 1 : 0)
      const scoreB = (b.isPremium ? 2 : 0) + (b.isVerified ? 1 : 0)
      return scoreB - scoreA
    })
  } catch {
    return []
  }
}

export default async function FreelancersPage() {
  const realFreelancers = await fetchRealFreelancers()
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-center" style={{ color: '#62666d', fontSize: '14px' }}>Loading…</div>}>
      <FreelancersClient realFreelancers={realFreelancers} />
    </Suspense>
  )
}
