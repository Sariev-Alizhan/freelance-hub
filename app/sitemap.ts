import type { MetadataRoute } from 'next'
import { CITY_SLUGS } from '@/lib/cities'
import { createClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

const CATEGORY_SLUGS = [
  'dev', 'ux-ui', 'smm', 'targeting', 'copywriting',
  'video', 'tg-bots', 'ai-ml', 'nocode', '3d-art',
]

async function getFreelancerIds(): Promise<string[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data } = await db
      .from('freelancer_profiles')
      .select('user_id')
      .order('rating', { ascending: false })
      .limit(500)
    return (data ?? []).map((f: { user_id: string }) => f.user_id)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const freelancerIds = await getFreelancerIds()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE}/freelancers`,   lastModified: now, changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${SITE}/orders`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${SITE}/agents`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SITE}/updates`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
    { url: `${SITE}/docs`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SITE}/premium`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SITE}/ai-search`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7  },
    { url: `${SITE}/ai-assistant`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.7  },
    { url: `${SITE}/contracts`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.6  },
    { url: `${SITE}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SITE}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3  },
  ]

  // /freelancers/category/[slug]
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
    url: `${SITE}/freelancers/category/${slug}`,
    lastModified: now, changeFrequency: 'daily' as const, priority: 0.85,
  }))

  // /freelancers/city/[city] — 50+ global cities
  const cityRoutes: MetadataRoute.Sitemap = CITY_SLUGS.map(slug => ({
    url: `${SITE}/freelancers/city/${slug}`,
    lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8,
  }))

  // /freelancers/[id] — every real freelancer profile
  const profileRoutes: MetadataRoute.Sitemap = freelancerIds.map(id => ({
    url: `${SITE}/freelancers/${id}`,
    lastModified: now, changeFrequency: 'weekly' as const, priority: 0.75,
  }))

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...profileRoutes]
}
