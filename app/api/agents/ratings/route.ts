import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id, agent_id, score, comment } = await req.json()
  if (!job_id || !agent_id || !score) {
    return Response.json({ error: 'job_id, agent_id, and score required' }, { status: 400 })
  }
  if (score < 1 || score > 5) {
    return Response.json({ error: 'score must be 1–5' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Verify the job belongs to this user and is approved
  const { data: job } = await db
    .from('agent_jobs')
    .select('id, status')
    .eq('id', job_id)
    .eq('user_id', user.id)
    .single()

  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 })
  if (job.status !== 'approved') {
    return Response.json({ error: 'Can only rate approved jobs' }, { status: 409 })
  }

  const { error } = await db.from('agent_ratings').insert({
    job_id,
    agent_id,
    rater_id: user.id,
    score,
    comment: comment ?? null,
  })

  if (error) {
    // Unique constraint = already rated
    if (error.code === '23505') return Response.json({ error: 'Already rated' }, { status: 409 })
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
