import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ты помогаешь фрилансерам составить краткое профессиональное «О себе» для профиля.
По специализации, категории и навыкам напиши 2-3 предложения в первом лице.
Стиль: уверенный, профессиональный, без шаблонных фраз («Я опытный специалист»).
Конкретика, цифры (если уместно), сильные стороны.
Отвечай только на русском. Без вступлений — сразу текст.`

export async function POST(request: Request) {
  try {
    const { title, category, skills, level } = await request.json()

    const levelMap: Record<string, string> = {
      new: 'начинающий', junior: 'junior', middle: 'middle', senior: 'senior', top: 'топ-специалист'
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ bio: getMockBio(title, category) })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Специализация: ${title}\nКатегория: ${category}\nУровень: ${levelMap[level] || level}\nНавыки: ${skills?.join(', ') || '—'}`,
      }],
    })

    const bio = response.content[0].type === 'text' ? response.content[0].text : ''
    return Response.json({ bio })
  } catch (e) {
    console.error(e)
    return Response.json({ bio: '' })
  }
}

function getMockBio(title: string, category: string): string {
  return `Специализируюсь на ${title} уже несколько лет — за это время реализовал десятки проектов в сфере ${category}. Работаю чётко по ТЗ, всегда на связи и соблюдаю дедлайны. Готов взяться за сложные задачи и довести их до результата.`
}
