import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM = `Ты помогаешь фрилансерам составить краткое профессиональное «О себе» для профиля.
По специализации, категории и навыкам напиши 2-3 предложения в первом лице.
Стиль: уверенный, профессиональный, без шаблонных фраз («Я опытный специалист»).
Конкретика, цифры (если уместно), сильные стороны.
Отвечай только на русском. Без вступлений — сразу текст.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:bio:${user.id}`, 10, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { title, category, skills, level } = await request.json()

    const levelMap: Record<string, string> = {
      new: 'начинающий', junior: 'junior', middle: 'middle', senior: 'senior', top: 'топ-специалист'
    }

    const { text: bio } = await generateText({
      model: 'anthropic/claude-sonnet-4-6',
      maxOutputTokens: 200,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Специализация: ${title}\nКатегория: ${category}\nУровень: ${levelMap[level] || level}\nНавыки: ${skills?.join(', ') || '—'}`,
      }],
    })

    return Response.json({ bio })
  } catch (e) {
    console.error(e)
    return Response.json({ bio: '' })
  }
}

function getMockBio(title: string, category: string): string {
  return `Специализируюсь на ${title} уже несколько лет — за это время реализовал десятки проектов в сфере ${category}. Работаю чётко по ТЗ, всегда на связи и соблюдаю дедлайны. Готов взяться за сложные задачи и довести их до результата.`
}
