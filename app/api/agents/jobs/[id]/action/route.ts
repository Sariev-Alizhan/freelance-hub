import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

const PLATFORM_FEE = 0.15 // 15% платформы

async function sendToTelegram(botToken: string, channelId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: 'Markdown' }),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  if (!['approve', 'reject'].includes(action)) {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const admin = createAdminClient() as any

  // Load full job details
  const { data: job } = await db
    .from('agent_jobs')
    .select('id, status, agent_type, creator_id, price_usd, payment_status, output, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!job) return Response.json({ error: 'Not found' }, { status: 404 })
  if (job.status !== 'awaiting_approval') {
    return Response.json({ error: 'Job is not awaiting approval' }, { status: 409 })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  // ── Update job status ───────────────────────────────────────
  const { error } = await admin
    .from('agent_jobs')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // ── Escrow logic ────────────────────────────────────────────
  const price = job.price_usd ?? 0  // cents

  if (price > 0) {
    if (action === 'approve' && job.creator_id) {
      // Payout to creator (minus platform fee)
      const creatorPayout = Math.floor(price * (1 - PLATFORM_FEE))

      // Ensure creator balance row exists
      await admin.from('agent_balances')
        .upsert({ user_id: job.creator_id }, { onConflict: 'user_id' })

      const { data: creatorBal } = await admin.from('agent_balances')
        .select('balance, total_earned').eq('user_id', job.creator_id).single()

      await admin.from('agent_balances').update({
        balance: (creatorBal?.balance ?? 0) + creatorPayout,
        total_earned: (creatorBal?.total_earned ?? 0) + creatorPayout,
        updated_at: new Date().toISOString(),
      }).eq('user_id', job.creator_id)

      await admin.from('agent_transactions').insert({
        user_id: job.creator_id,
        type: 'payout',
        amount: creatorPayout,
        job_id: id,
        note: `Выплата за задачу (за вычетом ${PLATFORM_FEE * 100}% комиссии)`,
      })
    }

    if (action === 'reject') {
      // Refund to client
      await admin.from('agent_balances')
        .upsert({ user_id: job.user_id }, { onConflict: 'user_id' })

      const { data: clientBal } = await admin.from('agent_balances')
        .select('balance').eq('user_id', job.user_id).single()

      await admin.from('agent_balances').update({
        balance: (clientBal?.balance ?? 0) + price,
        updated_at: new Date().toISOString(),
      }).eq('user_id', job.user_id)

      await admin.from('agent_transactions').insert({
        user_id: job.user_id,
        type: 'refund',
        amount: price,
        job_id: id,
        note: 'Возврат за отклонённую задачу',
      })
    }
  }

  // ── Telegram publish (SMM approve only) ────────────────────
  if (action === 'approve' && job.agent_type === 'smm' && job.creator_id) {
    try {
      const { data: tg } = await admin
        .from('telegram_settings')
        .select('bot_token, channel_id, is_active')
        .eq('user_id', job.creator_id)
        .maybeSingle()

      if (tg?.is_active && tg.bot_token && tg.channel_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output = job.output as any
        const posts = output?.posts ?? []

        for (const post of posts.slice(0, 3)) {  // max 3 posts to avoid spam
          const text = [
            `*${post.day}* — ${post.type?.toUpperCase()}`,
            '',
            post.caption,
            '',
            post.hashtags?.join(' ') ?? '',
            post.best_time ? `📅 Best time: ${post.best_time}` : '',
          ].filter(Boolean).join('\n')

          await sendToTelegram(tg.bot_token, tg.channel_id, text)
        }
      }
    } catch {
      // Telegram errors are non-blocking
    }
  }

  return Response.json({ ok: true, status: newStatus })
}
