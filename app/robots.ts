import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/messages', '/onboarding', '/api/', '/auth/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
