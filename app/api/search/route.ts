// Global search across orders, freelancers, services.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface OrderRow {
  id: string; title: string; category: string | null
  budget_min: number | null; budget_max: number | null
  status: string | null; created_at: string
}
interface FreelancerRow {
  user_id: string; title: string | null; category: string | null
  price_from: number | null; price_to: number | null; rating: number | null
}
interface ServiceRow {
  id: string; freelancer_id: string; title: string; category: string | null
  cover_image: string | null
}
interface ProfileRow {
  id: string; username: string | null; full_name: string | null
  avatar_url: string | null; bio: string | null; role: string | null
  is_verified: boolean | null
}

// GET /api/search?q=<query>&type=<all|orders|people|services>&limit=<n>
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  const type = req.nextUrl.searchParams.get('type') ?? 'all'
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '10'), 25)

  if (!q || q.length < 2) {
    return NextResponse.json({
      orders: [], people: [], services: [],
    })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // PostgREST 'ilike' with % wildcards. Escape user input % and _ to prevent ReDoS-like patterns.
  const pat = `%${q.replace(/[%_]/g, m => `\\${m}`)}%`

  const tasks: Promise<unknown>[] = []

  const want = (k: string) => type === 'all' || type === k

  if (want('orders')) {
    tasks.push(
      db.from('orders')
        .select('id, title, category, budget_min, budget_max, status, created_at')
        .or(`title.ilike.${pat},description.ilike.${pat}`)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit)
    )
  } else tasks.push(Promise.resolve({ data: [] }))

  if (want('people')) {
    tasks.push(
      db.from('freelancer_profiles')
        .select('user_id, title, category, price_from, price_to, rating')
        .or(`title.ilike.${pat},category.ilike.${pat}`)
        .limit(limit)
    )
  } else tasks.push(Promise.resolve({ data: [] }))

  if (want('services')) {
    tasks.push(
      db.from('services')
        .select('id, freelancer_id, title, category, cover_image')
        .or(`title.ilike.${pat},description.ilike.${pat}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)
    )
  } else tasks.push(Promise.resolve({ data: [] }))

  const [ordersR, fpR, servicesR] = await Promise.all(tasks) as [
    { data: OrderRow[] | null },
    { data: FreelancerRow[] | null },
    { data: ServiceRow[] | null },
  ]

  const orders = ordersR.data ?? []
  const fps = fpR.data ?? []
  const services = servicesR.data ?? []

  let nameHits: FreelancerRow[] = []
  if (want('people')) {
    const { data } = await db
      .from('profiles')
      .select('id, username, full_name')
      .or(`full_name.ilike.${pat},username.ilike.${pat}`)
      .limit(limit)

    const existingIds = new Set(fps.map(f => f.user_id))
    const nameRows = (data ?? []) as { id: string }[]
    const extraIds = nameRows.map(r => r.id).filter(id => !existingIds.has(id))

    if (extraIds.length) {
      const { data: extraFps } = await db
        .from('freelancer_profiles')
        .select('user_id, title, category, price_from, price_to, rating')
        .in('user_id', extraIds)

      nameHits = (extraFps ?? []) as FreelancerRow[]
    }
  }

  const allFps = [...fps, ...nameHits]

  const authorIds = new Set<string>()
  allFps.forEach(f => authorIds.add(f.user_id))
  services.forEach(s => authorIds.add(s.freelancer_id))

  let profMap: Record<string, ProfileRow> = {}
  if (authorIds.size) {
    const { data: profs } = await db
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, role, is_verified')
      .in('id', [...authorIds])

    profMap = Object.fromEntries(((profs ?? []) as ProfileRow[]).map(p => [p.id, p]))
  }

  const people = allFps.map(f => ({
    user_id: f.user_id,
    title: f.title,
    category: f.category,
    price_from: f.price_from,
    price_to: f.price_to,
    rating: f.rating,
    profile: profMap[f.user_id] ?? null,
  })).slice(0, limit)

  const servicesOut = services.map(s => ({
    ...s,
    profile: profMap[s.freelancer_id] ?? null,
  }))

  return NextResponse.json({
    orders,
    people,
    services: servicesOut,
  })
}
