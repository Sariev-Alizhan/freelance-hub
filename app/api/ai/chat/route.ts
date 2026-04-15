import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM_BASE = `You are a smart AI assistant for FreelanceHub — a global freelance platform.
Your goal is to help clients find the perfect freelancer for their project.

How to work:
1. Greet the user and ask what they need done
2. Ask clarifying questions: type of task, budget, timeline, requirements
3. When you have enough information — suggest 2-3 matching freelancers from the list
4. Explain why you chose them

Rules:
- Respond in the same language the user writes in
- Be friendly and professional
- Prices in USD unless the client specifies otherwise
- When suggesting freelancers — ALWAYS include at the end a JSON block in this format:
<matches>{"ids": ["uuid1", "uuid2"]}</matches>
- Keep explanations clear and concise`

async function getFreelancersContext() {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('freelancer_profiles')
      .select('user_id, title, category, skills, rating, price_from, level, profiles!inner(full_name, location)')
      .order('rating', { ascending: false })
      .limit(40)

    if (!data || data.length === 0) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((fp: any) => ({
      id:       fp.user_id,
      name:     fp.profiles?.full_name || 'User',
      title:    fp.title,
      category: fp.category,
      skills:   fp.skills ?? [],
      rating:   fp.rating ?? 0,
      priceFrom: fp.price_from ?? 0,
      location: fp.profiles?.location || 'CIS',
      level:    fp.level ?? 'new',
    }))
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`ai:chat:${user.id}`, 20, 60_000)
    if (!rl.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const { messages } = await request.json()

    // Validate messages array
    if (!Array.isArray(messages) || messages.length > 40) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const freelancers = await getFreelancersContext()
    const systemPrompt = freelancers.length > 0
      ? `${SYSTEM_BASE}\n\nAvailable freelancers (JSON):\n${JSON.stringify(freelancers, null, 2)}`
      : `${SYSTEM_BASE}\n\nNo freelancers are registered yet. Let the user know the platform is growing and invite them to check back soon.`

    const result = streamText({
      model: 'anthropic/claude-sonnet-4.6',
      maxOutputTokens: 1024,
      system: systemPrompt,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('AI Chat error:', error)
    const fallback = 'Привет! Я AI-ассистент FreelanceHub. Расскажите, какую задачу вам нужно решить?'
    return new Response(fallback, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
