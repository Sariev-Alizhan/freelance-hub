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
import { useLang } from '@/lib/context/LanguageContext'
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
import ProfileViewersWidget from '@/components/dashboard/ProfileViewersWidget'

type DashboardTab = 'freelancer' | 'client' | 'favorites' | 'portfolio' | 'analytics'

const TABS = ['freelancer', 'client', 'favorites', 'portfolio', 'analytics'] as const

export default function DashboardPage() {
  const { user, loading } = useUser()
  const { favorites } = useFavorites()
  const searchParams = useSearchParams()
  const { t } = useLang()
  const td = t.dashboardPage
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
          <h1 className="text-2xl font-bold mb-2">{td.authRequired}</h1>
          <p className="text-muted-foreground">{td.authBody}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            {td.signIn}
          </Link>
          <Link href="/auth/register" className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors">
            {td.register}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--wide">
      {/* Editorial header */}
      <div className="mb-6 sm:mb-8">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--fh-t3)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 24, height: 2, borderRadius: 2,
              background: '#27a644',
              boxShadow: '0 0 12px rgba(39,166,68,0.55)',
            }}
          />
          <span>{td.heading}</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4.5vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color: 'var(--fh-t1)',
            margin: 0,
            lineHeight: 1.0,
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          {td.subtitle.split(' ').slice(0, -1).join(' ')}{' '}
          <span
            style={{
              fontFamily: 'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {td.subtitle.split(' ').slice(-1)[0]}
          </span>
        </h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-subtle overflow-x-auto">
        {(['freelancer', 'client', 'portfolio', 'favorites', ...(fp && analytics ? ['analytics'] : [])] as const).map((tk) => (
          <button key={tk} onClick={() => setTab(tk as DashboardTab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === tk ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tk === 'favorites' && <Heart className="h-3.5 w-3.5" />}
            {tk === 'analytics' && <TrendingUp className="h-3.5 w-3.5" />}
            {tk === 'freelancer' ? td.tabFreelancer : tk === 'client' ? td.tabClient : tk === 'portfolio' ? td.tabPortfolio : tk === 'favorites' ? td.tabFavorites : td.tabAnalytics}
            {tk === 'favorites' && favorites.length > 0 && (
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
                {tab === 'freelancer' ? td.myResponses : td.myOrders}
              </h2>
              <Link href={tab === 'freelancer' ? '/orders' : '/orders/new'}
                className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
                {tab === 'freelancer' ? td.findOrders : td.postJob} <ArrowRight className="h-4 w-4" />
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
              <span className="text-xs font-medium">{td.messages}</span>
            </Link>
            <Link href="/orders/new" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">{td.newOrder}</span>
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
              <span className="text-sm font-semibold text-primary">{td.aiAssistantTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {td.aiAssistantDesc}
            </p>
            <Link href="/ai-assistant" className="block w-full py-2 text-center rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              {td.openAiAssistant}
            </Link>
          </div>

          {fp && <ProfileViewersWidget />}

          {profile?.username && <ReferralWidget username={profile.username} />}
          {fp && <TelegramWidget />}
        </div>
      </div>
    </div>
  )
}
