'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, ChevronRight, Star, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import EmptyState from './EmptyState'
import type { FavFreelancer, FavOrder, FavoriteItem } from './types'

/**
 * Content for the "Saved" tab — loads the orders + freelancers the user
 * has favorited and renders them as two sections. The list of favorite
 * IDs comes from `useFavorites` in the parent; this tab only hydrates
 * them to full records via Supabase.
 */
export default function FavoritesTab({ favorites }: { favorites: FavoriteItem[] }) {
  const [favOrders,      setFavOrders]      = useState<FavOrder[]>([])
  const [favFreelancers, setFavFreelancers] = useState<FavFreelancer[]>([])
  const [loading,        setLoading]        = useState(false)

  useEffect(() => {
    const orderIds      = favorites.filter((f) => f.target_type === 'order').map((f) => f.target_id)
    const freelancerIds = favorites.filter((f) => f.target_type === 'freelancer').map((f) => f.target_id)
    if (orderIds.length === 0 && freelancerIds.length === 0) return

    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    const queries: Promise<void>[] = []

    if (orderIds.length > 0) {
      queries.push(
        db.from('orders')
          .select('id,title,budget_min,budget_max')
          .in('id', orderIds)
          .then(({ data }: { data: FavOrder[] | null }) => { if (data) setFavOrders(data) })
      )
    }

    if (freelancerIds.length > 0) {
      queries.push(
        db.from('freelancer_profiles')
          .select('user_id,title,rating,profiles!inner(full_name,avatar_url)')
          .in('user_id', freelancerIds)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then(({ data }: { data: any[] | null }) => {
            if (!data) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setFavFreelancers(data.map((fp: any) => {
              const name   = fp.profiles?.full_name || 'User'
              const avatar = fp.profiles?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`
              return { id: fp.user_id, name, avatar, title: fp.title, rating: fp.rating ?? 0 }
            }))
          })
      )
    }

    Promise.all(queries).finally(() => setLoading(false))
  }, [favorites])

  if (favorites.length === 0) {
    return (
      <EmptyState
        emoji="❤️"
        title="Saved list is empty"
        sub="Click ❤️ on an order or freelancer card to save it"
        href="/orders"
        cta="Browse orders"
      />
    )
  }

  if (loading) {
    return <div className="py-8 text-center text-sm" style={{ color: '#8a8f98' }}>Loading saved items…</div>
  }

  return (
    <div className="space-y-6">
      {favOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" /> Orders ({favOrders.length})
          </h3>
          <div className="space-y-2">
            {favOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{order.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${order.budget_min.toLocaleString()}–${order.budget_max.toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {favFreelancers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Freelancers ({favFreelancers.length})
          </h3>
          <div className="space-y-2">
            {favFreelancers.map((fl) => (
              <Link
                key={fl.id}
                href={`/freelancers/${fl.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
              >
                <Image src={fl.avatar} alt={fl.name} width={36} height={36} className="rounded-xl object-cover flex-shrink-0" unoptimized />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{fl.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{fl.title}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  {fl.rating}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
