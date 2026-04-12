import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ты — эксперт по рынку фриланса в СНГ (Россия, Украина, Казахстан, Беларусь).
Анализируй описание задачи и давай рекомендацию по бюджету.
Учитывай: сложность, сроки, тип работы, рыночные ставки 2025 года.
Цены всегда в рублях.
Отвечай СТРОГО в формате JSON:
{"min": число, "max": число, "explanation": "короткое объяснение 2-3 предложения"}`

export async function POST(request: Request) {
  try {
    const { description, category, deadline } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(getMockAdvice(category))
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Категория: ${category}\nСроки: ${deadline}\nОписание: ${description}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockAdvice(category)

    return Response.json(result)
  } catch (e) {
    console.error(e)
    return Response.json(getMockAdvice('dev'))
  }
}

function getMockAdvice(category: string) {
  const ranges: Record<string, { min: number; max: number; explanation: string }> = {
    dev: { min: 30000, max: 80000, explanation: 'Разработка сайта — стандартный диапазон для СНГ рынка. Зависит от сложности и технологий. Junior возьмёт минимум, Senior — максимум.' },
    'ux-ui': { min: 20000, max: 60000, explanation: 'Дизайн интерфейса в Figma. Цена зависит от количества экранов и наличия дизайн-системы.' },
    smm: { min: 15000, max: 40000, explanation: 'Ведение соцсетей в месяц. Включает контент-план, посты и Stories. Reels и таргет — доп. оплата.' },
    targeting: { min: 15000, max: 35000, explanation: 'Настройка таргетированной рекламы. Не включает рекламный бюджет. Зависит от количества площадок.' },
    'tg-bots': { min: 10000, max: 50000, explanation: 'Telegram-бот — цена зависит от функционала. Простой бот — от 10К, с оплатой и CRM интеграцией — до 50К.' },
    'ai-ml': { min: 50000, max: 200000, explanation: 'AI/ML разработка — дорогостоящая специализация. RAG-системы, чат-боты на LLM — высокий спрос и ставки.' },
    copywriting: { min: 5000, max: 20000, explanation: 'Тексты: SEO-статьи, лендинги, email. Цена за пакет. Финтех и юридическая тематика — дороже.' },
    video: { min: 5000, max: 15000, explanation: 'Монтаж видео за единицу контента. YouTube-ролики, рекламные ролики, Reels — разные ценовые диапазоны.' },
    nocode: { min: 20000, max: 70000, explanation: 'No-code разработка. Bubble/Webflow/Make — быстро и дешевле классической разработки при схожем функционале.' },
    '3d-art': { min: 10000, max: 50000, explanation: 'AI-арт и 3D — зависит от количества и сложности иллюстраций. Midjourney + доработка — дешевле чистого 3D.' },
  }
  return ranges[category] || ranges['dev']
}
