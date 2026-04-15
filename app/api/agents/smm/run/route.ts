import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const input = await req.json()
  const { brand, audience, platform, tone, post_count = 3 } = input

  if (!brand || !audience || !platform) {
    return new Response('Missing required fields', { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Create job record
  const { data: job, error: jobErr } = await db
    .from('agent_jobs')
    .insert({ user_id: user.id, agent_type: 'smm', status: 'running', input })
    .select('id')
    .single()

  if (jobErr || !job) return new Response('Failed to create job', { status: 500 })
  const jobId: string = job.id

  async function addLog(step: string, message: string) {
    await db.from('agent_logs').insert({ job_id: jobId, step, message })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (data: object) => controller.enqueue(enc.encode(sse(data)))

      try {
        send({ type: 'job_id', jobId })
        send({ type: 'log', step: '🚀 Запуск', message: 'SMM агент инициализирован' })
        await addLog('🚀 Запуск', 'SMM агент инициализирован')

        send({ type: 'log', step: '📋 Анализ брифа', message: `${brand} → ${platform}, ${post_count} постов` })
        await addLog('📋 Анализ брифа', `${brand} → ${platform}, ${post_count} постов`)

        send({ type: 'log', step: '🤖 Claude генерирует', message: 'Создаю контент-план...' })
        await addLog('🤖 Claude генерирует', 'Создаю контент-план...')

        const { text } = await generateText({
          model: 'anthropic/claude-sonnet-4.6',
          prompt: `You are an expert SMM specialist. Generate a social media content plan.

Brand: ${brand}
Target audience: ${audience}
Platform: ${platform}
Tone: ${tone || 'professional but friendly'}
Posts to generate: ${post_count}

Return ONLY valid JSON (no markdown, no explanation):
{
  "strategy": "2-3 sentence content strategy summary",
  "posts": [
    {
      "day": "Day 1",
      "type": "reel|carousel|story|post",
      "caption": "Full caption with emojis",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "image_prompt": "Detailed visual description for image generation",
      "best_time": "Mon 11:00 AM"
    }
  ]
}`,
        })

        send({ type: 'log', step: '✍️ Парсинг', message: 'Обрабатываю ответ Claude...' })
        await addLog('✍️ Парсинг', 'Обрабатываю ответ Claude...')

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Не удалось разобрать JSON ответ')
        const output = JSON.parse(jsonMatch[0])

        const postCount = output.posts?.length ?? 0
        send({ type: 'log', step: '✅ Готово', message: `Сгенерировано ${postCount} постов` })
        await addLog('✅ Готово', `Сгенерировано ${postCount} постов`)

        await db.from('agent_jobs').update({
          status: 'awaiting_approval',
          output,
          updated_at: new Date().toISOString(),
        }).eq('id', jobId)

        send({ type: 'done', jobId, status: 'awaiting_approval' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка'
        await addLog('❌ Ошибка', msg)
        await db.from('agent_jobs').update({
          status: 'failed', error: msg, updated_at: new Date().toISOString(),
        }).eq('id', jobId)
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
