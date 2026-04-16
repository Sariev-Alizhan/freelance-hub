import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

// GET — fetch thread messages
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
  const { data: messages } = await db
    .from('job_messages')
    .select('id, role, content, created_at')
    .eq('job_id', id)
    .order('created_at', { ascending: true })

  return Response.json({ messages: messages ?? [] })
}

// POST — user sends a message, agent replies
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()
  if (!message?.trim()) return Response.json({ error: 'message required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const admin = createAdminClient() as any

  // Load job + verify ownership
  const { data: job } = await db
    .from('agent_jobs')
    .select('id, agent_type, input, output, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!job) return Response.json({ error: 'Not found' }, { status: 404 })

  // Load agent system prompt if custom
  let systemPrompt = `You are a helpful AI assistant. The user is refining results from a previous task.
Reply concisely and helpfully. If asked to revise content, provide the revised version directly.`

  if (job.agent_type === 'custom' && job.input?.agentId) {
    const { data: agent } = await db
      .from('custom_agents')
      .select('system_prompt, name')
      .eq('id', job.input.agentId)
      .single()
    if (agent?.system_prompt) {
      systemPrompt = agent.system_prompt + '\n\nYou are now in refinement mode. The user may ask you to revise, expand, or improve the previous output.'
    }
  }

  // Load prior messages for context
  const { data: history } = await db
    .from('job_messages')
    .select('role, content')
    .eq('job_id', id)
    .order('created_at', { ascending: true })
    .limit(20)

  // Build prior output summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = job.output as any
  let outputContext = ''
  if (output) {
    if (job.agent_type === 'custom' || job.agent_type === 'orchestrator') {
      outputContext = `\n\nPrevious output:\n${output.text ?? output.aggregate ?? JSON.stringify(output).slice(0, 500)}`
    } else if (job.agent_type === 'smm') {
      outputContext = `\n\nPrevious output: SMM content plan with strategy: "${output.strategy}" and ${output.posts?.length ?? 0} posts.`
    } else if (job.agent_type === 'landing') {
      outputContext = `\n\nPrevious output: Landing page with headline "${output.copy?.hero_headline}" for ${job.input?.product}.`
    }
  }

  // Save user message
  await admin.from('job_messages').insert({ job_id: id, role: 'user', content: message })

  // Build messages array for Claude
  const messages = [
    ...(history ?? []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  // Generate agent reply
  const { text: reply } = await generateText({
    model: 'anthropic/claude-sonnet-4-6',
    system: systemPrompt + outputContext,
    messages,
    providerOptions: {
      gateway: {
        user: user.id,
        tags: ['feature:team-mode', `job:${id}`],
      },
    },
  })

  // Save agent reply
  await admin.from('job_messages').insert({ job_id: id, role: 'agent', content: reply })

  return Response.json({ reply })
}
