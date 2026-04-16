import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`
}

interface SubTask {
  title: string
  description: string
  agentId: string
  agentName: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const rl = rateLimit(`agent:orch:${user.id}`, 3, 60_000)
  if (!rl.success) return new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })

  const { task, agentIds } = await req.json()
  if (!task?.trim()) return new Response('Missing task', { status: 400 })
  if (typeof task === 'string' && task.length > 4000) return new Response('Task too long (max 4000 chars)', { status: 400 })
  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    return new Response('Select at least one agent', { status: 400 })
  }
  if (agentIds.length > 5) return new Response('Too many agents (max 5)', { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const admin = createAdminClient() as any

  // Load selected agents
  const { data: agents } = await db
    .from('custom_agents')
    .select('id, name, tagline, system_prompt, price_per_task')
    .in('id', agentIds)
    .eq('is_published', true)

  if (!agents?.length) return new Response('No valid agents found', { status: 404 })

  // Create parent orchestrator job
  const { data: parentJob } = await admin
    .from('agent_jobs')
    .insert({
      user_id: user.id,
      agent_type: 'orchestrator',
      status: 'running',
      input: { task, agentIds },
      price_usd: 0,
    })
    .select('id')
    .single()

  if (!parentJob) return new Response('Failed to create job', { status: 500 })
  const parentId: string = parentJob.id

  async function addLog(step: string, message: string) {
    await admin.from('agent_logs').insert({ job_id: parentId, step, message })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (data: object) => controller.enqueue(enc.encode(sse(data)))

      try {
        send({ type: 'job_id', jobId: parentId })
        send({ type: 'log', step: '🎯 Orchestrator', message: 'Анализирую задачу...' })
        await addLog('🎯 Orchestrator', 'Анализирую задачу...')

        // ── Step 1: Claude decomposes task into sub-tasks ─────────────────
        const agentList = agents.map((a: { id: string; name: string; tagline: string }) =>
          `- id: "${a.id}" | name: "${a.name}" | speciality: "${a.tagline}"`
        ).join('\n')

        const { text: planText } = await generateText({
          model: 'anthropic/claude-sonnet-4-6',
          prompt: `You are an AI orchestrator. Break the following task into sub-tasks and assign each to the best available agent.

TASK: ${task}

AVAILABLE AGENTS:
${agentList}

Return ONLY valid JSON, no markdown:
{
  "plan": "1-2 sentence overall plan",
  "subtasks": [
    {
      "title": "Short sub-task title",
      "description": "Specific instructions for this sub-task (2-3 sentences)",
      "agentId": "<agent id from list above>",
      "agentName": "<agent name>"
    }
  ]
}

Rules:
- Maximum 3 sub-tasks
- Each sub-task must use one agent from the list
- Sub-tasks should be sequential and build on each other`,
        })

        const planMatch = planText.match(/\{[\s\S]*\}/)
        if (!planMatch) throw new Error('Failed to parse orchestration plan')
        const plan = JSON.parse(planMatch[0])
        const subtasks: SubTask[] = plan.subtasks ?? []

        send({ type: 'log', step: '📋 План', message: plan.plan })
        await addLog('📋 План', plan.plan)
        send({ type: 'subtasks', subtasks })

        // ── Step 2: Run each sub-task sequentially ───────────────────────
        const subResults: { title: string; agentName: string; result: string }[] = []

        for (let i = 0; i < subtasks.length; i++) {
          const sub = subtasks[i]
          const agent = agents.find((a: { id: string }) => a.id === sub.agentId)
          if (!agent) continue

          send({ type: 'log', step: `🤖 [${i + 1}/${subtasks.length}] ${sub.agentName}`, message: sub.title })
          await addLog(`🤖 [${i + 1}/${subtasks.length}] ${sub.agentName}`, sub.title)

          // Create child job
          const { data: childJob } = await admin
            .from('agent_jobs')
            .insert({
              user_id: user.id,
              agent_type: 'custom',
              status: 'running',
              parent_job_id: parentId,
              input: { agentId: agent.id, agentName: agent.name, task: sub.description },
              price_usd: (agent.price_per_task ?? 10) * 100,
              creator_id: agent.creator_id ?? null,
            })
            .select('id')
            .single()

          const childId = childJob?.id

          // Build context from prior results
          const priorContext = subResults.length > 0
            ? `\n\nPrevious sub-tasks completed:\n${subResults.map(r => `[${r.agentName}] ${r.title}:\n${r.result}`).join('\n\n')}`
            : ''

          const { text: subResult } = await generateText({
            model: 'anthropic/claude-sonnet-4-6',
            maxOutputTokens: 1500,
            system: agent.system_prompt,
            prompt: sub.description + priorContext,
          })

          // Update child job
          if (childId) {
            await admin.from('agent_jobs').update({
              status: 'approved',
              output: { text: subResult, agentName: agent.name },
              updated_at: new Date().toISOString(),
            }).eq('id', childId)
            await admin.from('agent_logs').insert({ job_id: childId, step: '✅ Готово', message: `${subResult.length} символов` })
          }

          subResults.push({ title: sub.title, agentName: agent.name, result: subResult })
          send({ type: 'log', step: `✅ ${sub.agentName}`, message: `Готово (${subResult.length} символов)` })
          await addLog(`✅ ${sub.agentName}`, `Готово (${subResult.length} символов)`)
        }

        // ── Step 3: Aggregate ─────────────────────────────────────────────
        send({ type: 'log', step: '📊 Агрегация', message: 'Собираю финальный отчёт...' })
        await addLog('📊 Агрегация', 'Собираю финальный отчёт...')

        const { text: aggregate } = await generateText({
          model: 'anthropic/claude-sonnet-4-6',
          maxOutputTokens: 2000,
          prompt: `You are a senior analyst. Synthesize the following sub-task results into a cohesive final report.

ORIGINAL TASK: ${task}

SUB-TASK RESULTS:
${subResults.map((r, i) => `## ${i + 1}. [${r.agentName}] ${r.title}\n${r.result}`).join('\n\n---\n\n')}

Write a comprehensive synthesis that:
1. Summarizes key findings from each sub-task
2. Highlights how the pieces fit together
3. Provides actionable next steps
4. Is formatted in clear markdown with headers`,
        })

        await admin.from('agent_jobs').update({
          status: 'awaiting_approval',
          output: {
            plan: plan.plan,
            subtasks: subResults,
            aggregate,
          },
          updated_at: new Date().toISOString(),
        }).eq('id', parentId)

        send({ type: 'log', step: '✅ Готово', message: 'Оркестровка завершена' })
        await addLog('✅ Готово', 'Оркестровка завершена')
        send({ type: 'done', jobId: parentId, status: 'awaiting_approval' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка'
        await addLog('❌ Ошибка', msg)
        await admin.from('agent_jobs').update({
          status: 'failed', error: msg, updated_at: new Date().toISOString(),
        }).eq('id', parentId)
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
