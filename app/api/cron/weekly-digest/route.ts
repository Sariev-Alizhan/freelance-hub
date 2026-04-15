import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Vercel Cron: every Monday 06:00 UTC (09:00 Almaty, UTC+3)
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/weekly-digest", "schedule": "0 6 * * 1" }] }
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'
const FROM = process.env.EMAIL_FROM || 'FreelanceHub <noreply@freelance-hub.kz>'

function emailHtml(params: {
  name: string
  newOrders: { title: string; id: string; budget_min: number; category: string }[]
  topFreelancers: { full_name: string; title: string; rating: number; user_id: string }[]
  weekStats: { newUsers: number; completedOrders: number }
}) {
  const { name, newOrders, topFreelancers, weekStats } = params
  const ordersHtml = newOrders.slice(0, 5).map(o => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #30363D">
        <a href="${SITE_URL}/orders/${o.id}" style="color:#818CF8;text-decoration:none;font-weight:600">${o.title}</a>
        <div style="color:#8B949E;font-size:12px;margin-top:2px">${o.category} · from ${Math.round(o.budget_min).toLocaleString('ru-RU')} ₽</div>
      </td>
    </tr>`).join('')

  const freelancersHtml = topFreelancers.slice(0, 3).map(f => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #30363D">
        <a href="${SITE_URL}/freelancers/${f.user_id}" style="color:#E6EDF3;text-decoration:none;font-weight:600">${f.full_name}</a>
        <div style="color:#8B949E;font-size:12px;margin-top:2px">${f.title} · ⭐ ${f.rating.toFixed(1)}</div>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#E6EDF3}
  a{color:#818CF8}
  .wrap{max-width:580px;margin:40px auto;background:#161B27;border-radius:16px;border:1px solid #30363D;overflow:hidden}
  .head{background:linear-gradient(135deg,#4F46E5,#6D28D9);padding:32px;text-align:center}
  .body{padding:32px}
  .section{margin-bottom:28px}
  .section h2{font-size:16px;font-weight:700;color:#E6EDF3;margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid #30363D}
  .stat{display:inline-block;text-align:center;background:#0D1117;border-radius:12px;padding:16px 24px;margin:0 8px 8px 0}
  .stat-num{font-size:28px;font-weight:800;color:#818CF8}
  .stat-label{font-size:12px;color:#8B949E;margin-top:4px}
  .footer{padding:20px 32px;text-align:center;color:#8B949E;font-size:12px;border-top:1px solid #30363D}
  table{width:100%;border-collapse:collapse}
</style></head>
<body>
<div class="wrap">
  <div class="head">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">FreelanceHub</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px">Weekly digest · ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
  </div>
  <div class="body">
    <p style="color:#8B949E;margin:0 0 24px">Привет, ${name || 'фрилансер'}! Вот что произошло на платформе за неделю.</p>

    <div class="section">
      <h2>Статистика недели</h2>
      <div>
        <div class="stat">
          <div class="stat-num">${weekStats.newUsers}</div>
          <div class="stat-label">новых участников</div>
        </div>
        <div class="stat">
          <div class="stat-num">${weekStats.completedOrders}</div>
          <div class="stat-label">выполнено заказов</div>
        </div>
      </div>
    </div>

    ${newOrders.length > 0 ? `
    <div class="section">
      <h2>Новые заказы для вас</h2>
      <table>${ordersHtml}</table>
      <p style="margin:16px 0 0"><a href="${SITE_URL}/orders" style="display:inline-block;background:#4F46E5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Смотреть все заказы</a></p>
    </div>` : ''}

    ${topFreelancers.length > 0 ? `
    <div class="section">
      <h2>Топ фрилансеры недели</h2>
      <table>${freelancersHtml}</table>
    </div>` : ''}
  </div>
  <div class="footer">
    <p>Вы получаете этот email, потому что зарегистрированы на FreelanceHub.</p>
    <p><a href="${SITE_URL}/settings?unsubscribe=digest">Отписаться от дайджеста</a></p>
  </div>
</div>
</body></html>`
}

export async function GET(req: NextRequest) {
  // Validate cron secret to prevent unauthorized triggers
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const resend = new Resend(resendKey)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch weekly stats
  const [usersRes, completedRes, newOrdersRes, topFpRes] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
    db.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('updated_at', oneWeekAgo),
    db.from('orders').select('id,title,budget_min,category').eq('status', 'open').order('created_at', { ascending: false }).limit(10),
    db.from('freelancer_profiles')
      .select('user_id,title,rating,profiles!inner(full_name)')
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .limit(5),
  ])

  const weekStats = {
    newUsers: usersRes.count ?? 0,
    completedOrders: completedRes.count ?? 0,
  }
  const newOrders = (newOrdersRes.data || []) as { id: string; title: string; budget_min: number; category: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topFreelancers = (topFpRes.data || []).map((f: any) => ({
    user_id: f.user_id,
    title: f.title,
    rating: f.rating,
    full_name: f.profiles?.full_name || 'Freelancer',
  }))

  // Fetch subscribers — users who opted in (or all active users, limited to 500 to stay within Resend free tier)
  const { data: subscribers } = await db
    .from('profiles')
    .select('id,full_name,email:id')
    .eq('email_digest', true)
    .limit(500)

  // If no email_digest column yet, fall back to fetching auth users
  let emailList: { id: string; name: string; email: string }[] = []
  if (!subscribers || subscribers.length === 0) {
    // Use admin API to get user emails (service role only)
    const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 500 })
    emailList = (authUsers?.users || [])
      .filter(u => u.email)
      .map(u => ({ id: u.id, name: u.user_metadata?.full_name || u.email!.split('@')[0], email: u.email! }))
  } else {
    emailList = subscribers.map(s => ({ id: s.id, name: s.full_name || 'User', email: s.id }))
  }

  let sent = 0
  let failed = 0

  for (const user of emailList.slice(0, 100)) { // cap at 100 per run to avoid timeouts
    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: `FreelanceHub — дайджест недели`,
        html: emailHtml({ name: user.name, newOrders, topFreelancers, weekStats }),
      })
      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: emailList.length })
}
