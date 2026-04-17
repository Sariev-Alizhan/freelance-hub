'use client'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useProfile } from '@/lib/context/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import type {
  AvailabilityStatus, DashboardAnalytics, FreelancerProfile,
  MyOrder, MyResponse, Profile,
} from '@/components/dashboard/types'

type DashboardTab = 'freelancer' | 'client' | 'favorites' | 'portfolio' | 'analytics'

/**
 * Owns every piece of data the dashboard page needs: the user's
 * `profiles` row, their freelancer record, availability, tab-scoped
 * order/response lists, analytics, plus handlers for avatar upload,
 * availability change, and withdrawing a response. Extracted so the
 * page itself is pure layout.
 */
export function useDashboardData({ user, tab }: {
  user: SupabaseUser | null
  tab: DashboardTab
}) {
  const { refreshProfile } = useProfile()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fp, setFp] = useState<FreelancerProfile | null>(null)
  const [availability, setAvailability] = useState<AvailabilityStatus>('open')
  const [availSaving, setAvailSaving] = useState(false)
  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [myResponses, setMyResponses] = useState<MyResponse[]>([])
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    async function load() {
      setProfileLoading(true)
      const [profRes, fpRes] = await Promise.all([
        db.from('profiles').select('full_name,avatar_url,bio,location,role,username').eq('id', user!.id).single(),
        db.from('freelancer_profiles').select('title,category,skills,price_from,price_to,level,rating,reviews_count,completed_orders,availability_status').eq('user_id', user!.id).single(),
      ])
      if (profRes.data) setProfile(profRes.data)
      if (fpRes.data) {
        setFp(fpRes.data)
        if (fpRes.data.availability_status) setAvailability(fpRes.data.availability_status)
      }
      setProfileLoading(false)

      if (fpRes.data) {
        fetch('/api/profile/analytics')
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setAnalytics(d) })
          .catch(() => {})
      }
    }
    load()
  }, [user])

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    setOrdersLoading(true)

    async function loadTab() {
      if (tab === 'client') {
        const { data } = await db
          .from('orders')
          .select('id,title,status,budget_min,budget_max,responses_count,created_at,category')
          .eq('client_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setMyOrders(data || [])
      } else {
        const { data } = await db
          .from('order_responses')
          .select('id,proposed_price,created_at,status,message,order:orders(id,title,status,budget_min,budget_max)')
          .eq('freelancer_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setMyResponses(data || [])
      }
      setOrdersLoading(false)
    }
    loadTab()
  }, [user, tab])

  async function withdrawResponse(responseId: string) {
    setWithdrawing(responseId)
    try {
      const res = await fetch('/api/orders/withdraw', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId }),
      })
      if (res.ok) setMyResponses(prev => prev.filter(r => r.id !== responseId))
    } finally {
      setWithdrawing(null)
    }
  }

  async function uploadAvatar(file: File) {
    setAvatarUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.url) {
        setProfile(prev => prev ? { ...prev, avatar_url: data.url } : prev)
        refreshProfile()
      }
    } finally {
      setAvatarUploading(false)
    }
  }

  async function saveAvailability(status: AvailabilityStatus) {
    setAvailSaving(true)
    setAvailability(status)
    try {
      await fetch('/api/profile/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } finally {
      setAvailSaving(false)
    }
  }

  return {
    profile, fp, availability,
    myOrders, myResponses, analytics,
    profileLoading, ordersLoading, avatarUploading, availSaving, withdrawing,
    uploadAvatar, saveAvailability, withdrawResponse,
  }
}
