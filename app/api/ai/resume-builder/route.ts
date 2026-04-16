import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

const SYSTEM = `You are an expert career coach for freelancers. Given a questionnaire, generate a professional freelancer profile.

Return ONLY valid JSON (no markdown, no explanation):
{
  "bio": "2-3 sentences in first person, confident and specific",
  "title": "concise job title (e.g. 'Full-Stack Developer', 'UI/UX Designer')",
  "skills": ["skill1", "skill2", ...],
  "rateMin": number,
  "rateMax": number,
  "level": "new" | "junior" | "middle" | "senior" | "top"
}

Rules:
- Bio: no clichés ("experienced specialist"), use concrete achievements/numbers if provided
- Title: 2-5 words, specific (not just "Developer")
- Skills: 4-8 relevant technical/professional skills extracted from answers
- Rate: in USD/hour, realistic for the level and specialization
- Level: based on years of experience (0-1: new/junior, 2-3: junior/middle, 4-6: middle/senior, 7+: senior/top)`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { specialization, experience, projects, achievements, strengths, goals } = body

  if (!specialization || !experience) {
    return Response.json({ error: 'specialization and experience are required' }, { status: 400 })
  }

  const prompt = `Specialization: ${specialization}
Years of experience: ${experience}
Notable projects: ${projects || 'not specified'}
Key achievements: ${achievements || 'not specified'}
Strengths / soft skills: ${strengths || 'not specified'}
Goals / what I want to work on: ${goals || 'not specified'}`

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-4-5-20251001',
      maxOutputTokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const result = JSON.parse(clean)

    return Response.json({ ok: true, result })
  } catch (e) {
    console.error('resume-builder error:', e)
    return Response.json({ error: 'Generation failed' }, { status: 500 })
  }
}
