import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'FreelanceHub Order'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: order } = await db()
    .from('orders')
    .select('title, category, budget_min, budget_max, is_urgent')
    .eq('id', id)
    .single()

  const title = (order?.title as string | undefined) || 'Заказ на FreelanceHub'
  const category = (order?.category as string | undefined) || ''
  const min = (order?.budget_min as number | null) ?? null
  const max = (order?.budget_max as number | null) ?? null
  const isUrgent = !!order?.is_urgent
  const budget = min && max
    ? `${min.toLocaleString('ru-RU')} – ${max.toLocaleString('ru-RU')} ₸`
    : min ? `от ${min.toLocaleString('ru-RU')} ₸` : 'По договорённости'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: '#0d0e11',
          padding: '72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle radial accent */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(39,166,68,0.18) 0%, transparent 70%)',
        }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'auto' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px', background: '#27a644',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#f7f8f8', letterSpacing: '-0.02em' }}>
            FreelanceHub
          </span>
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {category && (
            <div style={{
              padding: '6px 14px', borderRadius: '6px',
              background: 'rgba(39,166,68,0.12)', border: '1px solid rgba(39,166,68,0.3)',
              fontSize: '16px', fontWeight: 600, color: '#27a644', letterSpacing: '0.02em',
            }}>{category.toUpperCase()}</div>
          )}
          {isUrgent && (
            <div style={{
              padding: '6px 14px', borderRadius: '6px',
              background: 'rgba(229,72,77,0.12)', border: '1px solid rgba(229,72,77,0.3)',
              fontSize: '16px', fontWeight: 600, color: '#e5484d', letterSpacing: '0.02em',
            }}>СРОЧНО</div>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: '60px', fontWeight: 700, color: '#f7f8f8',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          marginBottom: '32px', maxWidth: '1000px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </div>

        {/* Budget */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '14px',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '20px', color: '#62666d', fontWeight: 500 }}>Бюджет</span>
          <span style={{ fontSize: '40px', fontWeight: 700, color: '#27a644', letterSpacing: '-0.02em' }}>
            {budget}
          </span>
        </div>

        {/* Domain */}
        <div style={{
          fontSize: '18px', color: '#4a4f57', fontWeight: 400,
          borderTop: '1px solid #1f2126', paddingTop: '20px',
        }}>
          freelance-hub.kz · откликнуться без комиссии
        </div>
      </div>
    ),
    { ...size }
  )
}
