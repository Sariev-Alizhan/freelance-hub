import type { Metadata } from 'next'
import { Suspense } from 'react'
import OrdersClient from './OrdersClient'
import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'
import { getServerT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT()
  const to = t.ordersPage
  return {
    title: to.metaTitle,
    description: to.metaDesc,
    openGraph: {
      title: to.metaTitle,
      description: to.metaShortDesc,
      type: 'website',
      siteName: 'FreelanceHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: to.metaTitle,
      description: to.metaShortDesc,
    },
    alternates: { canonical: '/orders' },
  }
}

async function fetchRealOrders(clientFallback: string): Promise<Order[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('orders')
      .select(`
        id,
        title,
        description,
        category,
        budget_min,
        budget_max,
        budget_type,
        deadline,
        skills,
        status,
        is_urgent,
        is_promoted,
        promoted_until,
        responses_count,
        created_at,
        client_id,
        profiles!inner (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return []

    return data.map((o: any): Order => {
      const profile = o.profiles
      const clientName = profile?.full_name || profile?.username || clientFallback
      const clientAvatar =
        profile?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientName)}&backgroundColor=4338CA&textColor=ffffff`

      return {
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        budget: {
          min: o.budget_min ?? 0,
          max: o.budget_max ?? 0,
          type: o.budget_type ?? 'fixed',
        },
        deadline: o.deadline,
        skills: o.skills ?? [],
        client: {
          id: o.client_id,
          name: clientName,
          avatar: clientAvatar,
          ordersPosted: 1,
          rating: 5,
        },
        postedAt: o.created_at,
        responsesCount: o.responses_count ?? 0,
        status: o.status ?? 'open',
        isUrgent: o.is_urgent ?? false,
        isPromoted: !!(o.is_promoted && (!o.promoted_until || new Date(o.promoted_until) > new Date())),
      }
    })
  } catch {
    return []
  }
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const t = await getServerT()
  const [realOrders, { data: { user } }] = await Promise.all([
    fetchRealOrders(t.ordersPage.clientFallback),
    supabase.auth.getUser(),
  ])
  return (
    <Suspense fallback={<div className="page-shell page-shell--wide text-center" style={{ color: '#62666d', fontSize: '14px' }}>{t.ordersPage.loading}</div>}>
      <OrdersClient realOrders={realOrders} currentUserId={user?.id} />
    </Suspense>
  )
}
