import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// GET — list user's saved searches with new-order counts
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: searches } = await db
    .from('saved_searches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!searches || searches.length === 0) return Response.json({ searches: [] })

  // For each search, count new orders since last_checked_at
  const enriched = await Promise.all(
    searches.map(async (s: {
      id: string; label: string; keyword: string | null; category: string | null
      urgent_only: boolean; last_checked_at: string; created_at: string
    }) => {
      let query = db
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .gt('created_at', s.last_checked_at)

      if (s.category && s.category !== 'all') query = query.eq('category', s.category)
      if (s.urgent_only) query = query.eq('is_urgent', true)

      const { count } = await query
      return { ...s, new_count: count ?? 0 }
    })
  )

  return Response.json({ searches: enriched })
}

// POST — save a new search
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, keyword, category, urgent_only } = await req.json()
  if (!label?.trim()) return Response.json({ error: 'Label required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Limit to 10 saved searches per user
  const { count } = await db
    .from('saved_searches')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 10) {
    return Response.json({ error: 'Maximum 10 saved searches' }, { status: 429 })
  }

  const { data, error } = await db
    .from('saved_searches')
    .insert({
      user_id:     user.id,
      label:       label.trim(),
      keyword:     keyword?.trim() || null,
      category:    category && category !== 'all' ? category : null,
      urgent_only: urgent_only ?? false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ search: data })
}

// DELETE — remove a saved search
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('saved_searches').delete().eq('id', id).eq('user_id', user.id)
  return Response.json({ ok: true })
}

// PATCH — mark search as checked (reset new_count)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db
    .from('saved_searches')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  return Response.json({ ok: true })
}
