import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian', en: 'English', kz: 'Kazakh', ar: 'Arabic',
  zh: 'Chinese', de: 'German', fr: 'French', es: 'Spanish',
  tr: 'Turkish', uk: 'Ukrainian',
}

export async function POST(req: NextRequest) {
  // Auth — this route spends Anthropic credits per call.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`ai:translate:${user.id}`, 30, 60_000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  let body: { text?: string; targetLang?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }

  const text       = String(body.text || '').trim().slice(0, 2000)
  const targetLang = String(body.targetLang || 'en').slice(0, 5)
  const langName   = LANG_NAMES[targetLang] || 'English'

  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Translate the following text to ${langName}. Return ONLY the translation, no explanations or quotes:\n\n${text}`,
      }],
    })

    const translated = (msg.content[0] as { text: string }).text.trim()
    return NextResponse.json({ translated })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
