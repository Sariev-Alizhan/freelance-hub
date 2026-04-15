import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// GET — получить Telegram настройки
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data } = await db
    .from('telegram_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return Response.json({ settings: data ?? null })
}

// POST — сохранить / обновить Telegram настройки
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bot_token, channel_id, is_active } = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('telegram_settings')
    .upsert({ user_id: user.id, bot_token, channel_id, is_active: !!is_active }, { onConflict: 'user_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

// POST /api/agents/telegram/test — отправить тестовое сообщение
export async function PUT(req: NextRequest) {
  const { bot_token, channel_id } = await req.json()
  if (!bot_token || !channel_id) return Response.json({ error: 'bot_token and channel_id required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel_id,
        text: '✅ FreelanceHub Agent подключён успешно! Ваши посты будут появляться здесь.',
        parse_mode: 'Markdown',
      }),
    })
    const data = await res.json()
    if (!data.ok) return Response.json({ error: data.description }, { status: 400 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Не удалось подключиться к Telegram' }, { status: 500 })
  }
}
