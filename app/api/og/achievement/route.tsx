import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || ''

  // Fetch user stats from Supabase
  let name = 'FreelanceHub Pro'
  let completedOrders = 0
  let rating = 0
  let avatarUrl = ''
  let level = 'new'

  if (userId) {
    try {
      const db = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const [profRes, fpRes] = await Promise.all([
        db.from('profiles').select('full_name,avatar_url').eq('id', userId).single(),
        db.from('freelancer_profiles').select('completed_orders,rating,level').eq('user_id', userId).single(),
      ])
      if (profRes.data) {
        name = profRes.data.full_name || name
        avatarUrl = profRes.data.avatar_url || ''
      }
      if (fpRes.data) {
        completedOrders = fpRes.data.completed_orders || 0
        rating = fpRes.data.rating || 0
        level = fpRes.data.level || 'new'
      }
    } catch {}
  }

  const LEVEL_LABELS: Record<string, string> = {
    new: 'Newcomer', junior: 'Junior', middle: 'Middle', senior: 'Senior', top: 'TOP',
  }
  const levelLabel = LEVEL_LABELS[level] || level

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1230 50%, #0a0a1a 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(39,166,68,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(39,166,68,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          display: 'flex',
        }} />

        {/* Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          padding: '60px 80px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '32px',
          backdropFilter: 'blur(20px)',
          width: '900px',
        }}>
          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#27a644', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>F</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 500 }}>FreelanceHub</span>
          </div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                width={100} height={100}
                style={{ borderRadius: '50%', border: '3px solid rgba(39,166,68,0.5)', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'rgba(39,166,68,0.2)',
                border: '3px solid rgba(39,166,68,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '40px', color: '#27a644' }}>👤</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'white', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                {name}
              </span>
              <span style={{
                color: '#27a644', fontSize: '16px', fontWeight: 600,
                background: 'rgba(39,166,68,0.15)', border: '1px solid rgba(39,166,68,0.3)',
                padding: '4px 14px', borderRadius: '100px',
              }}>
                {levelLabel} Freelancer
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'white', fontSize: '42px', fontWeight: 800 }}>
                {completedOrders}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Orders completed</span>
            </div>
            <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)', display: 'flex' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'white', fontSize: '42px', fontWeight: 800 }}>
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>⭐ Rating</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              freelance-hub.kz · 0% commission · Built in Kazakhstan
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
