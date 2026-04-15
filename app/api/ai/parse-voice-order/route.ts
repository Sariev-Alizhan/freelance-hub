import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 5) {
    return NextResponse.json({ error: 'No transcript' }, { status: 400 })
  }

  const CATEGORIES = ['dev', 'ux-ui', 'smm', 'targeting', 'copywriting', 'video', 'tg-bots', 'ai-ml', 'nocode', '3d-art']

  const systemPrompt = `You are a helpful assistant that extracts freelance order details from voice input.
Given a voice transcript, extract: title, description, category, budgetMin, budgetMax, skills (array).
Return ONLY valid JSON with these exact keys. If you cannot determine a field, use null or [].
Categories available: ${CATEGORIES.join(', ')}
Budget values should be in KZT (Kazakhstani Tenge), integers only.
Keep title under 120 chars and description concise but useful.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Extract order details from this voice input (may be in Russian, Kazakh, or English):\n\n"${transcript.slice(0, 1000)}"`,
        },
      ],
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'

    // Extract JSON from the response (Claude may wrap it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json({
      title: typeof parsed.title === 'string' ? parsed.title.slice(0, 120) : '',
      description: typeof parsed.description === 'string' ? parsed.description.slice(0, 2000) : '',
      category: CATEGORIES.includes(parsed.category) ? parsed.category : '',
      budgetMin: typeof parsed.budgetMin === 'number' ? String(Math.max(0, parsed.budgetMin)) : '',
      budgetMax: typeof parsed.budgetMax === 'number' ? String(Math.max(0, parsed.budgetMax)) : '',
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 10).map(String) : [],
    })
  } catch (e) {
    console.error('[parse-voice-order]', e)
    return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 })
  }
}
