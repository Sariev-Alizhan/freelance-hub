import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

const CATEGORY_SLUGS = [
  'dev', 'ux-ui', 'smm', 'targeting', 'copywriting',
  'video', 'tg-bots', 'ai-ml', 'nocode', '3d-art',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE}/freelancers`,   lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE}/orders`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE}/agents`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE}/ai-search`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE}/ai-assistant`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE}/contracts`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE}/premium`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Category-specific freelancer pages for SEO
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
    url: `${SITE}/freelancers/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  return [...staticRoutes, ...categoryRoutes]
}
