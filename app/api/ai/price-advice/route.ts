import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a global freelance market expert.
Analyze the task description and provide a budget recommendation in USD.
Consider: complexity, deadline, type of work, and current 2025 market rates.
Always return prices in USD.
Respond STRICTLY in JSON format:
{"min": number, "max": number, "explanation": "short explanation in 2-3 sentences"}`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

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
          content: `Category: ${category}\nDeadline: ${deadline}\nDescription: ${description}`,
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
    dev: { min: 300, max: 2000, explanation: 'Website development — typical range on the global market. Depends on complexity and tech stack. Junior takes the minimum, Senior takes the maximum.' },
    'ux-ui': { min: 200, max: 1500, explanation: 'UI/UX design in Figma. Price depends on the number of screens and whether a design system is required.' },
    smm: { min: 150, max: 800, explanation: 'Social media management per month. Includes content plan, posts and Stories. Reels and ads are priced separately.' },
    targeting: { min: 150, max: 700, explanation: 'Paid ads setup. Does not include ad budget. Price varies by number of platforms.' },
    'tg-bots': { min: 100, max: 1200, explanation: 'Telegram bot — price depends on features. Simple bot starts at $100, bots with payments and CRM integration up to $1200.' },
    'ai-ml': { min: 500, max: 5000, explanation: 'AI/ML development is a high-demand specialization. RAG systems and LLM chatbots command premium rates.' },
    copywriting: { min: 50, max: 500, explanation: 'Copy: SEO articles, landing pages, email. Priced per package. Fintech and legal niches cost more.' },
    video: { min: 50, max: 400, explanation: 'Video editing per piece of content. YouTube videos, ads, Reels — different price ranges.' },
    nocode: { min: 200, max: 1800, explanation: 'No-code development. Bubble/Webflow/Make — faster and cheaper than traditional dev for similar functionality.' },
    '3d-art': { min: 100, max: 1200, explanation: 'AI art and 3D — depends on quantity and complexity. Midjourney + post-processing is cheaper than pure 3D.' },
  }
  return ranges[category] || ranges['dev']
}
