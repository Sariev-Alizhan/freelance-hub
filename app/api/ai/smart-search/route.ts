import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const SYSTEM = `Ты — AI-поисковик фриланс-платформы FreelanceHub.
Пользователь описал что ему нужно на естественном языке.
Твоя задача: найти подходящих фрилансеров или заказы из предоставленного списка и оценить каждого.

Отвечай СТРОГО в формате JSON без markdown:
{
  "interpretation": "краткий пересказ запроса (1 предложение)",
  "results": [
    { "id": "uuid", "score": 95, "reason": "Точное совпадение по навыкам и опыту" }
  ]
}

Правила:
- score от 0 до 100, включай только score > 25
- Сортируй по убыванию score
- reason — короткий (до 8 слов), конкретный
- Если ничего не подходит — results: []`

async function buildFreelancerList() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('freelancer_profiles')
    .select('user_id, title, category, skills, price_from, price_to, level, rating, profiles!inner(full_name, location, bio)')
    .order('rating', { ascending: false })
    .limit(60)

  if (!data || data.length === 0) return 'No freelancers registered yet.'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((fp: any) => {
    const name = fp.profiles?.full_name || 'User'
    const loc  = fp.profiles?.location  || 'CIS'
    const bio  = fp.profiles?.bio?.slice(0, 80) || ''
    const price = fp.price_to ? `${fp.price_from}-${fp.price_to}$` : `${fp.price_from}$`
    return `[${fp.user_id}] ${name} | ${fp.title} | ${fp.category} | ${(fp.skills ?? []).join(', ')} | ${price} | ${fp.level} | ${loc} | ${bio}`
  }).join('\n')
}

async function buildOrderList() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('orders')
    .select('id, title, category, budget_min, budget_max, deadline, skills, description')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(60)

  if (!data || data.length === 0) return 'No open orders yet.'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((o: any) =>
    `[${o.id}] ${o.title} | ${o.category} | ${o.budget_min}-${o.budget_max}$ | ${o.deadline} | ${(o.skills ?? []).join(', ')} | ${o.description?.slice(0, 80)}`
  ).join('\n')
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rl = rateLimit(`ai:search:${ip}`, 20, 60_000)
  if (!rl.success) {
    return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  const { query, type = 'freelancers' } = await request.json()

  if (!query?.trim()) {
    return Response.json({ interpretation: '', results: [] })
  }

  const noun = type === 'orders' ? 'заказы' : 'фрилансеры'
  const list = type === 'orders' ? await buildOrderList() : await buildFreelancerList()

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-4.5',
      maxOutputTokens: 512,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Запрос: ${query}\n\nДоступные ${noun}:\n${list}`,
      }],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ interpretation: query, results: [] })

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json(parsed)
  } catch {
    return Response.json({ interpretation: query, results: [] })
  }
}
