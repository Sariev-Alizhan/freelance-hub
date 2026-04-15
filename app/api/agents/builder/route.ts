import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// GET — список агентов создателя
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('custom_agents')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ agents: data ?? [] })
}

// POST — создать нового агента
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, tagline, description, category, skills, system_prompt, price_per_task } = body

  if (!name?.trim() || !tagline?.trim() || !system_prompt?.trim()) {
    return Response.json({ error: 'name, tagline and system_prompt are required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('custom_agents')
    .insert({
      creator_id: user.id,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description?.trim() ?? '',
      category: category ?? 'custom',
      skills: Array.isArray(skills) ? skills : [],
      system_prompt: system_prompt.trim(),
      price_per_task: Math.max(1, parseInt(price_per_task) || 10),
      model: 'claude-sonnet-4.6',
      is_published: true,
    })
    .select('*')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ agent: data }, { status: 201 })
}

// PATCH — обновить агента
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('custom_agents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('creator_id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

// DELETE — удалить агента
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('custom_agents')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
