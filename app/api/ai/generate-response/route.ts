import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM = `Ты помогаешь фрилансерам писать убедительные отклики на заказы.
По заголовку и описанию заказа, категории и предложенной цене составь профессиональное сопроводительное письмо.
Структура: 1) Краткое приветствие и понимание задачи, 2) Почему именно я — опыт и подход, 3) Что конкретно предлагаю и почему мой бюджет обоснован, 4) Призыв к действию.
Стиль: дружелюбный, профессиональный, конкретный. Без шаблонных фраз вроде «Я подхожу идеально». 4-5 предложений.
Отвечай только на русском языке. Без вступлений — сразу текст отклика.`

const ADVICE_SYSTEM = `Ты эксперт по фрилансу и помогаешь фрилансерам улучшить отклики на заказы.
Оцени отклик по шкале 1-10 и дай 2-3 конкретных совета по улучшению.
Формат ответа — строго JSON: {"score": 8, "tips": ["совет 1", "совет 2", "совет 3"]}
Только JSON, без пояснений.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:respond:${user.id}`, 15, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { orderTitle, orderDescription, category, proposedPrice } = await request.json()

    const priceText = proposedPrice ? `Предлагаемая цена: ${Number(proposedPrice).toLocaleString('ru')} ₸` : 'Цена: обсудим'

    const { text: message } = await generateText({
      model: 'anthropic/claude-sonnet-4-6',
      maxOutputTokens: 400,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Категория: ${category}\nЗаказ: ${orderTitle}\nОписание: ${orderDescription?.slice(0, 300) || ''}\n${priceText}`,
      }],
    })

    return Response.json({ message })
  } catch (e) {
    console.error('[generate-response POST]', e)
    return Response.json({ error: 'AI generation failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:respond-critique:${user.id}`, 15, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { message, orderTitle, proposedPrice } = await request.json()

    if (!message?.trim()) {
      return Response.json({ score: 7, tips: ['Укажите конкретный опыт в данной области', 'Объясните ваш подход к задаче', 'Добавьте срок выполнения работы'] })
    }

    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4-6',
      maxOutputTokens: 256,
      system: ADVICE_SYSTEM,
      messages: [{
        role: 'user',
        content: `Заказ: ${orderTitle}\nЦена: ${proposedPrice || 'не указана'}\nОтклик:\n${message}`,
      }],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 7, tips: ['Укажите конкретный опыт', 'Обоснуйте цену', 'Добавьте сроки'] }
    return Response.json(parsed)
  } catch (e) {
    console.error(e)
    return Response.json({ score: 7, tips: ['Укажите конкретный опыт', 'Обоснуйте цену', 'Добавьте сроки'] })
  }
}
