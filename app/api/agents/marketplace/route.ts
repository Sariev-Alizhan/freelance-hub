import { createClient } from '@/lib/supabase/server'

// GET — public list of published custom agents
export async function GET() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('custom_agents')
    .select('id, name, tagline, description, category, skills, model, price_per_task, tasks_completed, creator_id')
    .eq('is_published', true)
    .order('tasks_completed', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ agents: data ?? [] })
}
