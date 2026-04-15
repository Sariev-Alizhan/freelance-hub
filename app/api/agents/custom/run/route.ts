import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const rl = rateLimit(`agent:run:${user.id}`, 5, 60_000)
  if (!rl.success) return new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })

  const { agentId, task } = await req.json()
  if (!agentId || !task?.trim()) return new Response('Missing agentId or task', { status: 400 })
  if (typeof task === 'string' && task.length > 4000) return new Response('Task too long (max 4000 chars)', { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const admin = createAdminClient() as any

  // Load custom agent
  const { data: agent } = await db
    .from('custom_agents')
    .select('*')
    .eq('id', agentId)
    .eq('is_published', true)
    .single()

  if (!agent) return new Response('Agent not found', { status: 404 })

  // Create job
  const { data: job } = await admin
    .from('agent_jobs')
    .insert({
      user_id: user.id,
      creator_id: agent.creator_id,
      agent_type: 'custom',
      status: 'running',
      input: { agentId, agentName: agent.name, task },
      price_usd: (agent.price_per_task ?? 10) * 100,  // convert USD → cents
    })
    .select('id')
    .single()

  if (!job) return new Response('Failed to create job', { status: 500 })
  const jobId: string = job.id

  async function addLog(step: string, message: string) {
    await admin.from('agent_logs').insert({ job_id: jobId, step, message })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (data: object) => controller.enqueue(enc.encode(sse(data)))

      try {
        send({ type: 'job_id', jobId })
        send({ type: 'log', step: '🚀 Запуск', message: `Агент «${agent.name}» инициализирован` })
        await addLog('🚀 Запуск', `Агент «${agent.name}» инициализирован`)

        send({ type: 'log', step: '📋 Задача', message: task.slice(0, 80) })
        await addLog('📋 Задача', task.slice(0, 80))

        send({ type: 'log', step: '🤖 Claude генерирует', message: 'Обрабатываю запрос...' })
        await addLog('🤖 Claude генерирует', 'Обрабатываю запрос...')

        const { text } = await generateText({
          model: `anthropic/${agent.model ?? 'claude-sonnet-4.6'}`,
          system: agent.system_prompt,
          prompt: task,
        })

        send({ type: 'log', step: '✅ Готово', message: `Ответ сгенерирован (${text.length} символов)` })
        await addLog('✅ Готово', `Ответ сгенерирован (${text.length} символов)`)

        await admin.from('agent_jobs').update({
          status: 'awaiting_approval',
          output: { text, agentName: agent.name },
          updated_at: new Date().toISOString(),
        }).eq('id', jobId)

        // Increment task counter on agent
        await admin.from('custom_agents')
          .update({ tasks_completed: (agent.tasks_completed ?? 0) + 1 })
          .eq('id', agentId)

        send({ type: 'done', jobId, status: 'awaiting_approval' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка'
        await addLog('❌ Ошибка', msg)
        await admin.from('agent_jobs').update({
          status: 'failed', error: msg, updated_at: new Date().toISOString(),
        }).eq('id', jobId)
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
