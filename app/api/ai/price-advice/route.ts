import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM = `You are a CIS freelance market expert specializing in Kazakhstan.
Analyze the task description and provide a budget recommendation in KZT (Kazakhstani Tenge).
Consider: complexity, deadline, type of work, and current 2025 Kazakhstan market rates.
Typical rates in KZT: junior dev 5000-15000/hr, middle 15000-40000/hr, senior 40000-100000/hr.
Respond STRICTLY in JSON format:
{"min": number, "max": number, "explanation": "short explanation in 2-3 sentences in English"}`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:price:${user.id}`, 10, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { description, category, deadline } = await request.json()
    if (typeof description === 'string' && description.length > 2000) {
      return Response.json({ error: 'Description too long' }, { status: 400 })
    }

    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      maxOutputTokens: 256,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Category: ${category}\nDeadline: ${deadline}\nDescription: ${description}`,
      }],
    })

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
    dev: { min: 50000, max: 300000, explanation: 'Website or app development in the Kazakhstan market. Junior starts at ₸50K, senior reaches ₸300K+. Price depends on stack complexity and deadlines.' },
    'ux-ui': { min: 30000, max: 200000, explanation: 'UI/UX design in Figma. Price depends on number of screens and whether a design system is included.' },
    smm: { min: 20000, max: 100000, explanation: 'Social media management per month. Includes content plan, posts and Stories. Reels and ads are priced separately.' },
    targeting: { min: 20000, max: 80000, explanation: 'Paid ads setup. Does not include ad budget. Price varies by number of platforms and campaign complexity.' },
    'tg-bots': { min: 15000, max: 150000, explanation: 'Telegram bot — price depends on features. Simple bot from ₸15K, bots with payments and CRM integration up to ₸150K.' },
    'ai-ml': { min: 80000, max: 500000, explanation: 'AI/ML development is a high-demand specialization in Kazakhstan. RAG systems and LLM chatbots command premium rates.' },
    copywriting: { min: 8000, max: 60000, explanation: 'Copy: SEO articles, landing pages, email. Priced per package. Fintech and legal niches cost more.' },
    video: { min: 10000, max: 60000, explanation: 'Video editing per piece of content. YouTube videos, ads, Reels — each has a different price range.' },
    nocode: { min: 30000, max: 200000, explanation: 'No-code development. Bubble/Webflow/Make — faster and often cheaper than traditional dev for the same functionality.' },
    '3d-art': { min: 15000, max: 150000, explanation: 'AI art and 3D — depends on quantity and complexity. Midjourney + post-processing is cheaper than pure 3D modeling.' },
  }
  return ranges[category] || ranges['dev']
}
