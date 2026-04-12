import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ты помогаешь заказчикам составлять качественные ТЗ для фрилансеров.
По названию задачи и категории напиши профессиональное описание заказа.
Структура: 1) Что нужно сделать, 2) Требования, 3) Что получит исполнитель в итоге.
Стиль: деловой, чёткий, конкретный. Без воды. 3-4 абзаца.
Отвечай только на русском языке. Без вступлений и пояснений — сразу текст описания.`

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ description: getMockDescription(title, category) })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Категория: ${category}\nНазвание заказа: ${title}`,
      }],
    })

    const description = response.content[0].type === 'text' ? response.content[0].text : ''
    return Response.json({ description })
  } catch (e) {
    console.error(e)
    return Response.json({ description: '' })
  }
}

function getMockDescription(title: string, category: string): string {
  return `Требуется выполнить задачу: «${title}».

Необходимо реализовать полный цикл работ в рамках данного проекта. Исполнитель должен иметь подтверждённый опыт в области ${category} и уметь работать самостоятельно.

Требования к исполнителю: опыт от 2 лет, портфолио с аналогичными проектами, готовность к оперативной коммуникации и соблюдению дедлайнов.

По итогу работы заказчик получает готовый результат, исходные файлы и краткую инструкцию по использованию. Возможна доработка в течение 3 дней после сдачи.`
}
