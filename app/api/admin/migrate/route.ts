import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const MIGRATIONS = [
  `CREATE INDEX IF NOT EXISTS idx_orders_cat_created ON orders (category, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_fp_cat_rating ON freelancer_profiles (category, rating DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_msg_conv_created ON messages (conversation_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_order_responses_order ON order_responses (order_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username)`,
]

export async function POST() {
  // Auth — admin only
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || (adminEmail && user.email !== adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const results: { sql: string; ok: boolean; error?: string }[] = []

  for (const sql of MIGRATIONS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db as any).rpc('exec_sql', { sql }).catch(() => ({ error: { message: 'rpc not available' } }))
    if (error) {
      // Try via postgres extension
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      )
      results.push({ sql: sql.slice(0, 60) + '…', ok: res.ok, error: res.ok ? undefined : await res.text() })
    } else {
      results.push({ sql: sql.slice(0, 60) + '…', ok: true })
    }
  }

  return NextResponse.json({ results })
}
