import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/agents/balance — текущий баланс и транзакции пользователя
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Auto-create balance row if missing
  const { data: balance } = await db
    .from('agent_balances')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!balance) {
    const admin = createAdminClient() as any
    await admin.from('agent_balances').insert({ user_id: user.id })
    const { data: fresh } = await admin.from('agent_balances').select('*').eq('user_id', user.id).single()
    const { data: txs } = await db.from('agent_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
    return Response.json({ balance: fresh, transactions: txs ?? [] })
  }

  const { data: transactions } = await db
    .from('agent_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return Response.json({ balance, transactions: transactions ?? [] })
}

// POST /api/agents/balance — пополнение (демо top-up)
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient() as any
  const TOPUP = 5000 // $50 demo credit in cents

  // Ensure balance row exists
  await admin.from('agent_balances').upsert({ user_id: user.id }, { onConflict: 'user_id' })

  // Read current balance then add TOPUP
  const { data: cur } = await admin.from('agent_balances').select('balance').eq('user_id', user.id).single()
  await admin.from('agent_balances').update({
    balance: (cur?.balance ?? 0) + TOPUP,
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id)

  await admin.from('agent_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount: TOPUP,
    note: 'Demo top-up +$50',
  })

  return Response.json({ ok: true, added: TOPUP })
}
