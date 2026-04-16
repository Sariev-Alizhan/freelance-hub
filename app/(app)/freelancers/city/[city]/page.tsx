import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { getCityBySlug, CITY_SLUGS } from '@/lib/cities'
import { CATEGORIES } from '@/lib/mock/categories'
import { createClient } from '@/lib/supabase/server'

export async function generateStaticParams() {
  return CITY_SLUGS.map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return { title: 'Not found' }

  const title = `Freelancers in ${city.name}, ${city.country} — FreelanceHub`
  const desc  = `Hire top freelancers in ${city.name}. Developers, designers, marketers and more. Verified profiles, real reviews, safe payments.`

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'website', locale: 'en_US', siteName: 'FreelanceHub' },
    alternates: { canonical: `/freelancers/city/${slug}` },
  }
}

async function getFreelancersInCity(cityName: string, countryName: string) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data } = await db
      .from('freelancer_profiles')
      .select(`
        user_id, title, category, skills, price_from, rating, reviews_count,
        completed_orders, is_verified, is_premium, level,
        profiles!inner(full_name, avatar_url, location)
      `)
      .or(`profiles.location.ilike.%${cityName}%,profiles.location.ilike.%${countryName}%`)
      .order('rating', { ascending: false })
      .limit(24)

    return data ?? []
  } catch {
    return []
  }
}

export default async function CityFreelancersPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) notFound()

  const freelancers = await getFreelancersInCity(city.name, city.country)

  const REGION_LABEL: Record<string, string> = {
    cis: 'CIS & Central Asia', asia: 'Asia Pacific', 'middle-east': 'Middle East',
    africa: 'Africa', europe: 'Europe', americas: 'Americas',
  }

  return (
    <div className="page-shell page-shell--wide">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-xs" style={{ color: 'var(--fh-t4)' }}>
        <Link href="/freelancers" style={{ color: 'var(--fh-t4)' }}>Freelancers</Link>
        <span>/</span>
        <span style={{ color: 'var(--fh-t3)' }}>{REGION_LABEL[city.region]}</span>
        <span>/</span>
        <span style={{ color: 'var(--fh-t1)', fontWeight: 510 }}>{city.name}</span>
      </div>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '12px', color: '#7170ff', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {city.country}
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 510,
            letterSpacing: '-0.04em', color: 'var(--fh-t1)', marginBottom: '10px',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          Freelancers in {city.name}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--fh-t3)', maxWidth: '560px', lineHeight: 1.7 }}>
          Hire vetted freelancers based in {city.name}, {city.country}.
          Developers, designers, marketers and more — with real reviews and safe payment.
        </p>

        {/* Category shortcuts */}
        <div className="flex flex-wrap gap-2 mt-6">
          {CATEGORIES.slice(0, 6).map(cat => (
            <Link
              key={cat.slug}
              href={`/freelancers?category=${cat.slug}&location=${encodeURIComponent(city.name)}`}
              className="transition-all"
              style={{
                padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 510,
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t3)',
              }}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Freelancers grid */}
      {freelancers.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>
            No freelancers yet in {city.name}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)', marginBottom: '20px' }}>
            Be the first to register from {city.name} and get found by global clients.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2"
            style={{ padding: '10px 24px', borderRadius: '8px', background: '#5e6ad2', color: '#fff', fontSize: '14px', fontWeight: 590 }}
          >
            Join as freelancer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {freelancers.map((f: any) => {
            const profile = f.profiles
            const name    = profile?.full_name || 'Freelancer'
            const avatar  = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`
            const cat     = CATEGORIES.find(c => c.slug === f.category)

            return (
              <Link key={f.user_id} href={`/freelancers/${f.user_id}`} className="block">
                <div
                  className="rounded-xl p-4 h-full transition-all card-hover"
                  style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image src={avatar} alt={name} width={40} height={40} className="rounded-lg flex-shrink-0" unoptimized />
                    <div className="min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }} className="truncate">{name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--fh-t4)' }} className="truncate">{f.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {cat && (
                      <span style={{ fontSize: '10px', fontWeight: 590, padding: '1px 6px', borderRadius: '4px', background: `${cat.color}14`, color: cat.color }}>
                        {cat.label}
                      </span>
                    )}
                    {f.is_verified && <CheckCircle className="h-3 w-3" style={{ color: '#27a644' }} />}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" fill="#fbbf24" stroke="#fbbf24" />
                      <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t1)' }}>{f.rating?.toFixed(1) || '—'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>({f.reviews_count || 0})</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff' }}>
                      from {f.price_from?.toLocaleString()} ₸
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Other cities in region */}
      <div className="mt-16">
        <h2 style={{ fontSize: '16px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Other cities
        </h2>
        <div className="flex flex-wrap gap-2">
          {CITY_SLUGS.filter(s => s !== slug).slice(0, 20).map(s => {
            const c = getCityBySlug(s)!
            return (
              <Link
                key={s}
                href={`/freelancers/city/${s}`}
                className="transition-all"
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t4)',
                }}
              >
                {c.name}
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
