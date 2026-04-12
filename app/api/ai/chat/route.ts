import Anthropic from '@anthropic-ai/sdk'
import { MOCK_FREELANCERS } from '@/lib/mock'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FREELANCERS_CONTEXT = MOCK_FREELANCERS.map((f) => ({
  id: f.id,
  name: f.name,
  title: f.title,
  category: f.category,
  skills: f.skills,
  rating: f.rating,
  priceFrom: f.priceFrom,
  location: f.location,
  level: f.level,
}))

const SYSTEM_PROMPT = `Ты — умный AI-ассистент фриланс-платформы FreelanceHub для СНГ рынка.
Твоя задача — помочь заказчику найти идеального фрилансера.

Список доступных фрилансеров (JSON):
${JSON.stringify(FREELANCERS_CONTEXT, null, 2)}

Алгоритм работы:
1. Поздоровайся и спроси, что нужно сделать
2. Задай уточняющие вопросы: тип задачи, бюджет, сроки, требования
3. Когда получишь достаточно информации — подбери 2-3 подходящих фрилансера из списка
4. Объясни почему выбрал именно их

Правила:
- Отвечай только на русском языке
- Будь дружелюбным и профессиональным
- Цены в рублях
- Когда предлагаешь фрилансеров — ОБЯЗАТЕЛЬНО верни в конце JSON-блок такого формата:
<matches>{"ids": ["f1", "f3"]}</matches>
- Объясняй свой выбор просто и понятно`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return getMockResponse(messages)
    }

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return getMockResponse([])
  }
}

function getMockResponse(messages: unknown[]) {
  const responses = [
    'Привет! Я AI-ассистент FreelanceHub. Расскажите, какую задачу вам нужно решить? Например: разработка сайта, дизайн, SMM, реклама — я подберу лучших специалистов.',
    'Отлично! Уточните, пожалуйста:\n1. Какой у вас бюджет (примерно)?\n2. В какие сроки нужно выполнить?\n3. Есть ли особые требования к фрилансеру?',
    'Понял вас! Анализирую подходящих специалистов...\n\nДля вашей задачи я рекомендую следующих фрилансеров:\n\n**Александр Петров** — Senior React разработчик, рейтинг 4.9, опыт 7 лет\n**Никита Соколов** — Full-stack Python+React, рейтинг 4.7\n\n<matches>{"ids": ["f1", "f2"]}</matches>',
  ]
  const lastMessages = Array.isArray(messages) ? messages : []
  const idx = Math.min(lastMessages.length, responses.length - 1)
  const text = responses[idx]

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
