import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM = `Ты помогаешь заказчикам составлять качественные ТЗ для фрилансеров.
По названию задачи и категории напиши профессиональное описание заказа.
Структура: 1) Что нужно сделать, 2) Требования, 3) Что получит исполнитель в итоге.
Стиль: деловой, чёткий, конкретный. Без воды. 3-4 абзаца.
Отвечай только на русском языке. Без вступлений и пояснений — сразу текст описания.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:desc:${user.id}`, 10, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { title, category } = await request.json()
    if (!title || typeof title !== 'string' || title.length > 200) {
      return Response.json({ error: 'Invalid title' }, { status: 400 })
    }

    const { text: description } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      maxOutputTokens: 512,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Категория: ${category}\nНазвание заказа: ${title}`,
      }],
    })

    return Response.json({ description })
  } catch (e) {
    console.error(e)
    return Response.json({ description: '' })
  }
}
