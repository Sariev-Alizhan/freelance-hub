import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// GET /api/agents/jobs/[id] — детали задачи + логи
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: job }, { data: logs }, { data: subJobs }, { data: messages }] = await Promise.all([
    db.from('agent_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    db.from('agent_logs')
      .select('id, step, message, created_at')
      .eq('job_id', id)
      .order('created_at', { ascending: true }),
    db.from('agent_jobs')
      .select('id, agent_type, status, input, output, created_at')
      .eq('parent_job_id', id)
      .order('created_at', { ascending: true }),
    db.from('job_messages')
      .select('id, role, content, created_at')
      .eq('job_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!job) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ job, logs: logs ?? [], subJobs: subJobs ?? [], messages: messages ?? [] })
}
