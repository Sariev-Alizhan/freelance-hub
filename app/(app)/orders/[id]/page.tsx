import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Zap, FileText, Shield } from 'lucide-react'
import { CATEGORIES } from '@/lib/mock/categories'
import PriceDisplay from '@/components/shared/PriceDisplay'
import RatingStars from '@/components/shared/RatingStars'
import RespondButton from '@/components/orders/RespondButton'
import OrderStatusActions from '@/components/orders/OrderStatusActions'
import MilestoneTracker from '@/components/orders/MilestoneTracker'
import OrderReviewPrompt from '@/components/orders/OrderReviewPrompt'
import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'
import { getServerT } from '@/lib/i18n/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

async function getOrder(id: string, clientFallback: string): Promise<Order | null> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('orders')
      .select(`
        id, title, description, category,
        budget_min, budget_max, budget_type,
        deadline, skills, status, is_urgent,
        responses_count, created_at, client_id,
        profiles!inner (full_name, username, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null

    const profile    = data.profiles
    const clientName = profile?.full_name || profile?.username || clientFallback
    const clientAvatar =
      profile?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientName)}&backgroundColor=4338CA&textColor=ffffff`

    return {
      id:             data.id,
      title:          data.title,
      description:    data.description,
      category:       data.category,
      budget:         { min: data.budget_min ?? 0, max: data.budget_max ?? 0, type: data.budget_type ?? 'fixed' },
      deadline:       data.deadline,
      skills:         data.skills ?? [],
      client:         { name: clientName, avatar: clientAvatar, ordersPosted: 1, rating: 0, id: data.client_id },
      postedAt:        data.created_at,
      responsesCount:  data.responses_count ?? 0,
      status:          data.status ?? 'open',
      isUrgent:        data.is_urgent ?? false,
      progressStatus:  'not_started',
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const t = await getServerT()
  const order = await getOrder(id, t.ordersPage.clientFallback)
  if (!order) return { title: t.ordersPage.orderNotFound }

  const category = CATEGORIES.find((c) => c.slug === order.category)
  const desc = order.description.slice(0, 155)

  return {
    title: `${order.title} — FreelanceHub`,
    description: desc,
    openGraph: { title: order.title, description: desc, type: 'website', siteName: 'FreelanceHub' },
    twitter: { card: 'summary', title: order.title, description: desc },
    alternates: { canonical: `/orders/${id}` },
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: order.title,
        description: order.description,
        datePosted: new Date().toISOString().split('T')[0],
        employmentType: 'CONTRACTOR',
        jobLocationType: 'TELECOMMUTE',
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'KZT',
          value: { '@type': 'QuantitativeValue', minValue: order.budget.min, maxValue: order.budget.max, unitText: 'FIXED' },
        },
        occupationalCategory: category?.label ?? '',
        skills: order.skills.join(', '),
        url: `${SITE_URL}/orders/${id}`,
      }),
    },
  }
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const t = await getServerT()
  const to = t.ordersPage
  const [order, { data: { user } }] = await Promise.all([
    getOrder(id, to.clientFallback),
    supabase.auth.getUser(),
  ])
  if (!order) notFound()

  const category = CATEGORIES.find((c) => c.slug === order.category)
  const isOwner  = !!user && user.id === order.client.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Check if the current user already applied to this order
  let myResponseStatus: 'pending' | 'accepted' | 'rejected' | null = null
  let isAcceptedFreelancer = false
  if (user && !isOwner) {
    const { data: myResp } = await db
      .from('order_responses')
      .select('status')
      .eq('order_id', id)
      .eq('freelancer_id', user.id)
      .maybeSingle()
    myResponseStatus = myResp?.status ?? null
    isAcceptedFreelancer = myResp?.status === 'accepted'
  }

  const statusStyle = {
    open:        { bg: 'rgba(39,166,68,0.08)',           color: '#27a644',        border: '1px solid rgba(39,166,68,0.2)',  label: to.statusOpen       },
    in_progress: { bg: 'rgba(59,130,246,0.08)',          color: '#3b82f6',        border: '1px solid rgba(59,130,246,0.2)', label: to.statusInProgress },
    completed:   { bg: 'var(--fh-surface-2)',            color: 'var(--fh-t3)',   border: '1px solid var(--fh-border)',     label: to.statusCompleted  },
    cancelled:   { bg: 'rgba(229,72,77,0.08)',           color: '#e5484d',        border: '1px solid rgba(229,72,77,0.2)', label: to.statusCancelled  },
  }
  const st = statusStyle[order.status] ?? statusStyle.open

  return (
    <div className="page-shell page-shell--reading" style={{ minHeight: 'calc(100vh - 52px)' }}>
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 mb-8 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}
        onMouseEnter={undefined}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {to.backToOrders}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order card */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {category && (
                <span
                  className="rounded-full"
                  style={{
                    padding: '3px 12px',
                    fontSize: '12px',
                    fontWeight: 590,
                    background: `${category.color}14`,
                    color: category.color,
                  }}
                >
                  {category.label}
                </span>
              )}
              {order.isUrgent && (
                <span
                  className="flex items-center gap-1 rounded-full"
                  style={{ padding: '3px 12px', fontSize: '12px', fontWeight: 590, background: 'rgba(229,72,77,0.1)', color: '#e5484d' }}
                >
                  <Zap className="h-3 w-3" /> {to.urgentBadge}
                </span>
              )}
              <span
                className="ml-auto rounded-full"
                style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 510, background: st.bg, color: st.color, border: st.border }}
              >
                {st.label}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(18px, 3vw, 24px)',
                fontWeight: 510,
                letterSpacing: '-0.04em',
                color: 'var(--fh-t1)',
                marginBottom: '14px',
                fontFeatureSettings: '"cv01", "ss03"',
                lineHeight: 1.2,
              }}
            >
              {order.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.75, whiteSpace: 'pre-line', fontWeight: 400, letterSpacing: '-0.005em' }}>
              {order.description}
            </p>

            <div
              className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5"
              style={{ borderTop: '1px solid var(--fh-sep)' }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 510 }}>
                  {to.budget}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-primary)', letterSpacing: '-0.02em' }}>
                  {order.budget.min > 0 ? (
                    <>
                      <PriceDisplay amountRub={order.budget.min} prefix="" size="md" />
                      {' — '}
                      <PriceDisplay amountRub={order.budget.max} prefix="" size="md" />
                    </>
                  ) : to.negotiable}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 510 }}>
                  {to.timeline}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>{order.deadline}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 510 }}>
                  {to.responses}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)' }}>{order.responsesCount}</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {order.skills.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
            >
              <h2 style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                {to.requiredSkills}
              </h2>
              <div className="flex flex-wrap gap-2">
                {order.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '5px',
                      background: 'var(--fh-primary-muted)',
                      border: '1px solid rgba(113,112,255,0.18)',
                      color: 'var(--fh-primary)',
                      fontSize: '12px',
                      fontWeight: 510,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review prompt — shown to both parties when completed */}
          {order.status === 'completed' && user && (
            <OrderReviewPrompt
              orderId={order.id}
              orderTitle={order.title}
              isClient={isOwner}
            />
          )}

          {/* Milestone tracker — visible to both parties when in progress */}
          {order.status === 'in_progress' && (
            <MilestoneTracker
              orderId={order.id}
              initialStatus={order.progressStatus ?? 'not_started'}
              canEdit={isOwner || isAcceptedFreelancer}
            />
          )}

          {/* Owner: responses + status workflow */}
          {isOwner && (
            <OrderStatusActions
              orderId={order.id}
              orderStatus={order.status}
              isOwner={true}
            />
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div
            className="sticky top-20 rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            {!isOwner && (
              <>
                <RespondButton
                  orderId={order.id}
                  orderTitle={order.title}
                  orderDescription={order.description}
                  category={order.category}
                  budgetMin={order.budget.min}
                  budgetMax={order.budget.max}
                  myResponseStatus={myResponseStatus}
                />
                <Link
                  href={user ? `/messages?open=${order.client.id}` : `/auth/login?next=/orders/${order.id}`}
                  className="w-full mt-2.5 flex items-center justify-center gap-2 transition-all"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: 'var(--fh-surface-2)',
                    border: '1px solid var(--fh-border-2)',
                    color: 'var(--fh-t2)',
                    fontSize: '13px',
                    fontWeight: 510,
                  }}
                >
                  {to.messageClient}
                </Link>
                <Link
                  href={`/contracts?description=${encodeURIComponent(order.description.slice(0, 300))}&deadline=${encodeURIComponent(order.deadline)}&budget=${order.budget.max}`}
                  className="w-full mt-2 flex items-center justify-center gap-2 transition-all"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: 'rgba(94,106,210,0.06)',
                    border: '1px solid rgba(94,106,210,0.2)',
                    color: 'var(--fh-primary)',
                    fontSize: '13px',
                    fontWeight: 510,
                  }}
                >
                  <FileText className="h-4 w-4" />
                  {to.createContract}
                </Link>

                <div
                  className="mt-4 rounded-lg px-3.5 py-3 flex items-start gap-2.5"
                  style={{ background: 'rgba(39,166,68,0.04)', border: '1px solid rgba(39,166,68,0.12)' }}
                >
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#27a644' }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 590, color: '#27a644', marginBottom: '3px' }}>{to.safeDeal}</p>
                    <p style={{ fontSize: '11px', color: 'var(--fh-t4)', lineHeight: 1.5, fontWeight: 400 }}>
                      {to.safeDealDesc}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div
              className="mt-4 pt-4 space-y-2.5"
              style={{ borderTop: '1px solid var(--fh-sep)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--fh-t4)' }}>
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span style={{ fontSize: '12px', fontWeight: 400 }}>{order.deadline}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--fh-t4)' }}>
                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                <span style={{ fontSize: '12px', fontWeight: 400 }}>{order.responsesCount} {to.responsesCount}</span>
              </div>
            </div>
          </div>

          {/* Client card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            <h3 style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              {to.aboutClient}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Image src={order.client.avatar} alt={order.client.name} width={38} height={38} className="rounded-lg" unoptimized />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>{order.client.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 400 }}>{order.client.ordersPosted} {to.clientOrders}</div>
              </div>
            </div>
            {order.client.rating > 0 && <RatingStars rating={order.client.rating} />}
          </div>
        </div>
      </div>
    </div>
  )
}
