import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import FreelancersClient from '@/app/freelancers/FreelancersClient'
import { CATEGORIES } from '@/lib/mock/categories'
import { Freelancer } from '@/lib/types'

interface Props {
  params: Promise<{ category: string }>
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'dev':         'Hire top web and mobile developers. React, Next.js, Node.js, Python, iOS, Android and more.',
  'ux-ui':       'Find experienced UX/UI designers. Figma, web interfaces, mobile apps, prototypes and wireframes.',
  'smm':         'Social media marketing specialists. Instagram, TikTok, VK — content, growth and engagement.',
  'targeting':   'Paid ads professionals. Google Ads, Meta Ads, targeted campaigns with proven ROI.',
  'copywriting': 'Professional copywriters for landing pages, ads, SEO articles and email campaigns.',
  'video':       'Video editors and motion designers. YouTube, Reels, corporate videos and animations.',
  'tg-bots':     'Telegram bot developers. Automation, shop bots, notification systems and custom integrations.',
  'ai-ml':       'AI and machine learning engineers. Model training, data pipelines, LLM integrations.',
  'nocode':      'No-code and low-code specialists. Webflow, Bubble, Make, Zapier and automation workflows.',
  '3d-art':      '3D artists and AI art creators. Product visualization, concept art, renders and illustrations.',
}

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) return { title: 'Not Found' }

  const title = `${cat.label} Freelancers — FreelanceHub`
  const description = CATEGORY_DESCRIPTIONS[category] ?? `Find the best ${cat.label} freelancers on FreelanceHub.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `/freelancers/category/${category}` },
  }
}

async function fetchFreelancers(category: string): Promise<Freelancer[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('freelancer_profiles')
      .select(`
        user_id, title, category, skills, price_from, price_to,
        level, response_time, languages, is_verified, is_premium,
        rating, reviews_count, completed_orders, availability_status,
        profiles!inner(full_name, username, avatar_url, location)
      `)
      .eq('category', category)
      .order('rating', { ascending: false })
      .limit(60)

    if (error || !data) return []

    return data.map((fp: any): Freelancer => {
      const prof = fp.profiles
      const name = prof?.full_name || prof?.username || 'Freelancer'
      return {
        id: fp.user_id,
        name,
        avatar: prof?.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`,
        title: fp.title,
        category: fp.category,
        skills: fp.skills ?? [],
        rating: fp.rating ?? 0,
        reviewsCount: fp.reviews_count ?? 0,
        completedOrders: fp.completed_orders ?? 0,
        responseTime: fp.response_time ?? '1 day',
        priceFrom: fp.price_from ?? 0,
        priceTo: fp.price_to ?? undefined,
        location: prof?.location ?? 'Remote',
        isOnline: false,
        isVerified: fp.is_verified ?? false,
        isPremium: fp.is_premium ?? false,
        portfolio: [],
        description: '',
        level: fp.level ?? 'middle',
        languages: fp.languages ?? [],
        registeredAt: '',
        availability: fp.availability_status ?? 'open',
      }
    })
  } catch {
    return []
  }
}

export default async function FreelancersCategoryPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) notFound()

  const freelancers = await fetchFreelancers(category)
  const desc = CATEGORY_DESCRIPTIONS[category] ?? `Find the best ${cat.label} freelancers.`

  return (
    <>
      {/* Category hero */}
      <div className="border-b border-subtle" style={{ background: `${cat.color}08` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
              <span style={{ fontSize: '18px' }}>
                {cat.slug === 'dev' ? '💻' : cat.slug === 'ux-ui' ? '🎨' : cat.slug === 'smm' ? '📱' :
                 cat.slug === 'targeting' ? '🎯' : cat.slug === 'copywriting' ? '✍️' :
                 cat.slug === 'video' ? '🎬' : cat.slug === 'tg-bots' ? '🤖' :
                 cat.slug === 'ai-ml' ? '🧠' : cat.slug === 'nocode' ? '⚡' : '🎭'}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
              {cat.label} Freelancers
            </h1>
            {freelancers.length > 0 && (
              <span className="text-sm px-2 py-0.5 rounded-full"
                style={{ background: `${cat.color}12`, color: cat.color, fontWeight: 590 }}>
                {freelancers.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)', maxWidth: '540px' }}>{desc}</p>
        </div>
      </div>

      <Suspense>
        <FreelancersClient realFreelancers={freelancers} defaultCategory={category as any} />
      </Suspense>
    </>
  )
}
