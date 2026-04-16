import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'FreelanceHub Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const LEVEL_COLORS: Record<string, string> = {
  new: '#62666d', junior: '#27a644', middle: '#5e6ad2', senior: '#7170ff', top: '#fbbf24',
}
const LEVEL_LABELS: Record<string, string> = {
  new: 'Newcomer', junior: 'Junior', middle: 'Middle', senior: 'Senior', top: 'TOP',
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  ) as any

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('username', username)
    .single()

  const { data: fp } = await db
    .from('freelancer_profiles')
    .select('title, category, level, rating, completed_orders')
    .eq('user_id', (
      await db.from('profiles').select('id').eq('username', username).single()
    ).data?.id)
    .single()

  const name = profile?.full_name || username
  const title = fp?.title || 'Freelancer'
  const level = fp?.level || 'new'
  const levelColor = LEVEL_COLORS[level] || '#62666d'
  const levelLabel = LEVEL_LABELS[level] || 'Newcomer'
  const rating = fp?.rating ? `★ ${fp.rating}` : ''
  const orders = fp?.completed_orders ? `${fp.completed_orders} orders` : ''
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0e11',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-150px', right: '-150px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(113,112,255,0.12) 0%, transparent 70%)',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#62666d' }}>FreelanceHub</span>
        </div>

        {/* Profile card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', flex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: '140px', height: '140px', borderRadius: '24px', flexShrink: 0,
            background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '52px', fontWeight: 700, color: '#fff',
          }}>
            {profile?.avatar_url ? initials : initials}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '56px', fontWeight: 700, color: '#f7f8f8', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {name}
            </div>
            <div style={{ fontSize: '26px', color: '#8a8f98', fontWeight: 400 }}>
              {title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '6px 16px', borderRadius: '6px',
                background: `${levelColor}18`, border: `1px solid ${levelColor}40`,
                fontSize: '16px', fontWeight: 600, color: levelColor,
              }}>
                {levelLabel}
              </div>
              {rating && (
                <div style={{ fontSize: '20px', color: '#fbbf24', fontWeight: 600 }}>{rating}</div>
              )}
              {orders && (
                <div style={{ fontSize: '18px', color: '#62666d' }}>{orders}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', color: '#4a4f57' }}>freelance-hub.kz/u/{username}</div>
          <div style={{
            padding: '8px 20px', borderRadius: '8px',
            background: 'rgba(113,112,255,0.1)', border: '1px solid rgba(113,112,255,0.2)',
            fontSize: '15px', fontWeight: 600, color: '#7170ff',
          }}>
            Hire on FreelanceHub
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
