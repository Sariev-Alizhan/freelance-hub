import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import StatsClient from './StatsClient'

export const metadata: Metadata = {
  title: 'Platform Stats — FreelanceHub',
  description: 'Live statistics: users, orders, freelancers and top categories on FreelanceHub Kazakhstan.',
}

export const revalidate = 86400 // refresh once per day (ISR)

async function fetchStats() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = db as any

  const [
    { count: users },
    { count: freelancers },
    { count: openOrders },
    { count: completedOrders },
    { data: catRows },
  ] = await Promise.all([
    d.from('profiles').select('*', { count: 'exact', head: true }),
    d.from('freelancer_profiles').select('*', { count: 'exact', head: true }),
    d.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    d.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    d.from('orders').select('category').neq('category', null),
  ])

  // Top categories by order count
  const catCounts: Record<string, number> = {}
  for (const row of catRows ?? []) {
    if (row.category) catCounts[row.category] = (catCounts[row.category] ?? 0) + 1
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, count]) => ({ slug, count }))

  return {
    users:           users           ?? 0,
    freelancers:     freelancers     ?? 0,
    openOrders:      openOrders      ?? 0,
    completedOrders: completedOrders ?? 0,
    topCategories,
  }
}

export default async function StatsPage() {
  const stats = await fetchStats()
  return <StatsClient stats={stats} />
}
