'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Briefcase, ArrowRight, Sparkles, LogIn,
  Heart, MessageSquare, TrendingUp,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { SkeletonDashboardOrder } from '@/components/ui/Skeleton'
import PortfolioManager from '@/components/dashboard/PortfolioManager'
import SavedSearchesWidget from '@/components/dashboard/SavedSearchesWidget'
import ReferralWidget from '@/components/dashboard/ReferralWidget'
import TelegramWidget from '@/components/dashboard/TelegramWidget'
import AnalyticsTab from '@/components/dashboard/AnalyticsTab'
import FavoritesTab from '@/components/dashboard/FavoritesTab'
import ResponsesList from '@/components/dashboard/ResponsesList'
import OrdersList from '@/components/dashboard/OrdersList'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'

type DashboardTab = 'freelancer' | 'client' | 'favorites' | 'portfolio' | 'analytics'

const TABS = ['freelancer', 'client', 'favorites', 'portfolio', 'analytics'] as const

export default function DashboardPage() {
  const { user, loading } = useUser()
  const { favorites } = useFavorites()
  const searchParams = useSearchParams()
  const initial = searchParams.get('tab')
  const [tab, setTab] = useState<DashboardTab>(
    (TABS as readonly string[]).includes(initial ?? '') ? (initial as DashboardTab) : 'freelancer'
  )

  const {
    profile, fp,
    myOrders, myResponses, analytics,
    ordersLoading, withdrawing,
    withdrawResponse,
  } = useDashboardData({ user, tab })

  if (loading) {
    return (
      <div className="page-shell page-shell--wide">
        <div className="space-y-3">
          {[0,1,2].map(i => <SkeletonDashboardOrder key={i} />)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <LogIn className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
          <p className="text-muted-foreground">You need to be signed in to access your operations</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register" className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors">
            Register
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--wide">
      <div className="mb-5 sm:mb-6">
        <h1 style={{
          fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 510,
          letterSpacing: '-0.03em', color: 'var(--fh-t1)', marginBottom: 2,
        }}>
          Operations
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fh-t3)' }}>
          Responses, orders, portfolio and analytics — all for your account.
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-subtle overflow-x-auto">
        {(['freelancer', 'client', 'portfolio', 'favorites', ...(fp && analytics ? ['analytics'] : [])] as const).map((t) => (
          <button key={t} onClick={() => setTab(t as DashboardTab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'favorites' && <Heart className="h-3.5 w-3.5" />}
            {t === 'analytics' && <TrendingUp className="h-3.5 w-3.5" />}
            {t === 'freelancer' ? 'As freelancer' : t === 'client' ? 'As client' : t === 'portfolio' ? 'Portfolio' : t === 'favorites' ? 'Saved' : 'Analytics'}
            {t === 'favorites' && favorites.length > 0 && (
              <span className="ml-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {tab !== 'favorites' && tab !== 'portfolio' && tab !== 'analytics' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                {tab === 'freelancer' ? 'My responses' : 'My orders'}
              </h2>
              <Link href={tab === 'freelancer' ? '/orders' : '/orders/new'}
                className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
                {tab === 'freelancer' ? 'Find orders' : 'Post a job'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {tab === 'analytics' ? (
            <AnalyticsTab analytics={analytics} />
          ) : tab === 'portfolio' ? (
            <PortfolioManager freelancerId={user.id} />
          ) : tab === 'favorites' ? (
            <FavoritesTab favorites={favorites} />
          ) : ordersLoading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <SkeletonDashboardOrder key={i} />)}
            </div>
          ) : tab === 'freelancer' ? (
            <ResponsesList responses={myResponses} withdrawing={withdrawing} onWithdraw={withdrawResponse} />
          ) : tab === 'client' ? (
            <OrdersList orders={myOrders} />
          ) : null}
        </div>

        <div className="space-y-6">
          <OnboardingChecklist />

          <div className="grid grid-cols-2 gap-3">
            <Link href="/messages" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Messages</span>
            </Link>
            <Link href="/orders/new" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">New order</span>
            </Link>
          </div>

          {tab === 'freelancer' && (
            <div className="rounded-2xl border border-subtle bg-card p-5">
              <SavedSearchesWidget />
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI assistant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Use AI matching to quickly find the right specialist or a suitable order
            </p>
            <Link href="/ai-assistant" className="block w-full py-2 text-center rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Open AI assistant
            </Link>
          </div>

          {profile?.username && <ReferralWidget username={profile.username} />}
          {fp && <TelegramWidget />}
        </div>
      </div>
    </div>
  )
}
