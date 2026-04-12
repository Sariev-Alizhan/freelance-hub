import Anthropic from '@anthropic-ai/sdk'
import { MOCK_FREELANCERS } from '@/lib/mock/freelancers'
import { MOCK_ORDERS } from '@/lib/mock/orders'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ты — AI-поисковик фриланс-платформы FreelanceHub.
Пользователь описал что ему нужно на естественном языке.
Твоя задача: найти подходящих фрилансеров или заказы из предоставленного списка и оценить каждого.

Отвечай СТРОГО в формате JSON без markdown:
{
  "interpretation": "краткий пересказ запроса (1 предложение)",
  "results": [
    { "id": "f1", "score": 95, "reason": "Точное совпадение по навыкам и опыту" }
  ]
}

Правила:
- score от 0 до 100, включай только score > 25
- Сортируй по убыванию score
- reason — короткий (до 8 слов), конкретный
- Если ничего не подходит — results: []`

function buildFreelancerList() {
  return MOCK_FREELANCERS.map((f) =>
    `[${f.id}] ${f.name} | ${f.title} | Навыки: ${f.skills.join(', ')} | ${f.priceFrom}${f.priceTo ? `-${f.priceTo}` : ''}₽/ч | ${f.level} | ${f.location} | ${f.description.slice(0, 100)}`
  ).join('\n')
}

function buildOrderList() {
  return MOCK_ORDERS.map((o) =>
    `[${o.id}] ${o.title} | Бюджет: ${o.budget.min}-${o.budget.max}₽ | Срок: ${o.deadline} | Навыки: ${o.skills.join(', ')} | ${o.description.slice(0, 100)}`
  ).join('\n')
}

export async function POST(request: Request) {
  const { query, type = 'freelancers' } = await request.json()

  if (!query?.trim()) {
    return Response.json({ interpretation: '', results: [] })
  }

  const list = type === 'orders' ? buildOrderList() : buildFreelancerList()
  const noun = type === 'orders' ? 'заказы' : 'фрилансеры'

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(getMockResults(type))
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Запрос: ${query}\n\nДоступные ${noun}:\n${list}`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ interpretation: query, results: [] })

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json(parsed)
  } catch {
    return Response.json(getMockResults(type))
  }
}

function getMockResults(type: string) {
  const ids = type === 'orders'
    ? MOCK_ORDERS.slice(0, 3).map((o, i) => ({ id: o.id, score: 90 - i * 10, reason: 'Подходит по тематике' }))
    : MOCK_FREELANCERS.slice(0, 3).map((f, i) => ({ id: f.id, score: 90 - i * 10, reason: 'Релевантные навыки' }))
  return { interpretation: 'AI-поиск (демо)', results: ids }
}
