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

  const rl = rateLimit(`agent:landing:${user.id}`, 5, 60_000)
  if (!rl.success) return new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })

  const input = await req.json()
  const { product, description, audience, cta } = input

  if (!product || !description || !audience) {
    return new Response('Missing required fields', { status: 400 })
  }
  if (
    (typeof product === 'string' && product.length > 200) ||
    (typeof description === 'string' && description.length > 2000) ||
    (typeof audience === 'string' && audience.length > 500)
  ) {
    return new Response('Input too long', { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: job, error: jobErr } = await db
    .from('agent_jobs')
    .insert({ user_id: user.id, agent_type: 'landing', status: 'running', input })
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
        send({ type: 'log', step: '🚀 Запуск', message: 'Landing агент инициализирован' })
        await addLog('🚀 Запуск', 'Landing агент инициализирован')

        send({ type: 'log', step: '📋 Анализ', message: `Продукт: ${product}` })
        await addLog('📋 Анализ', `Продукт: ${product}`)

        send({ type: 'log', step: '🏗️ Структура', message: 'Планирую секции лендинга...' })
        await addLog('🏗️ Структура', 'Планирую секции лендинга...')

        send({ type: 'log', step: '🤖 Claude генерирует', message: 'Создаю HTML/Tailwind лендинг...' })
        await addLog('🤖 Claude генерирует', 'Создаю HTML/Tailwind лендинг...')

        const { text } = await generateText({
          model: 'anthropic/claude-sonnet-4.6',
          prompt: `You are an expert landing page copywriter and front-end developer.
Create a complete, conversion-optimized landing page.

Product: ${product}
Description: ${description}
Target audience: ${audience}
Primary CTA: ${cta || 'Get Started'}

Return ONLY valid JSON (no markdown fences):
{
  "sections": ["hero", "problem", "solution", "features", "testimonials", "faq", "cta"],
  "copy": {
    "hero_headline": "Bold, benefit-driven headline (max 10 words)",
    "hero_sub": "One sentence expanding on the headline",
    "problem_title": "Section title",
    "problem_points": ["pain point 1", "pain point 2", "pain point 3"],
    "solution_title": "How ${product} solves this",
    "solution_text": "2-3 sentence solution description",
    "features": [
      { "icon": "⚡", "title": "Feature name", "desc": "Short description" },
      { "icon": "🎯", "title": "Feature name", "desc": "Short description" },
      { "icon": "🔒", "title": "Feature name", "desc": "Short description" },
      { "icon": "📊", "title": "Feature name", "desc": "Short description" }
    ],
    "testimonials": [
      { "name": "Sarah K.", "role": "Founder", "text": "Testimonial text", "rating": 5 },
      { "name": "Mike R.", "role": "CEO", "text": "Testimonial text", "rating": 5 }
    ],
    "faq": [
      { "q": "Question?", "a": "Answer." },
      { "q": "Question?", "a": "Answer." },
      { "q": "Question?", "a": "Answer." }
    ],
    "cta_headline": "Strong closing CTA headline",
    "cta_sub": "Remove final objection here",
    "cta_button": "${cta || 'Get Started'}"
  },
  "seo": {
    "title": "Page title (60 chars max)",
    "description": "Meta description (155 chars max)"
  },
  "notes": "2-3 sentence conversion optimization notes"
}`,
        })

        send({ type: 'log', step: '✍️ Парсинг', message: 'Обрабатываю структуру лендинга...' })
        await addLog('✍️ Парсинг', 'Обрабатываю структуру лендинга...')

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Не удалось разобрать JSON ответ')
        const output = JSON.parse(jsonMatch[0])

        const sectionCount = output.sections?.length ?? 0
        send({ type: 'log', step: '✅ Готово', message: `Лендинг готов: ${sectionCount} секций` })
        await addLog('✅ Готово', `Лендинг готов: ${sectionCount} секций`)

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
