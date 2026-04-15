import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'FreelanceHubKZBot'

// POST /api/telegram/connect — generate a one-time link code
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Short unique code: first 8 chars of uid + base36 timestamp
    const code = `${user.id.replace(/-/g, '').slice(0, 8)}${Date.now().toString(36)}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any
    await db.from('profiles').update({ telegram_link_code: code }).eq('id', user.id)

    return Response.json({
      url:  `https://t.me/${BOT_USERNAME}?start=${code}`,
      code,
    })
  } catch (e) {
    console.error('[telegram/connect]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/telegram/connect — disconnect Telegram
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any
    await db
      .from('profiles')
      .update({ telegram_chat_id: null, telegram_link_code: null })
      .eq('id', user.id)

    return Response.json({ success: true })
  } catch (e) {
    console.error('[telegram/disconnect]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET /api/telegram/connect — check connection status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any
    const { data } = await db
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', user.id)
      .single()

    return Response.json({ connected: !!data?.telegram_chat_id })
  } catch (e) {
    console.error('[telegram/status]', e)
    return Response.json({ connected: false })
  }
}
