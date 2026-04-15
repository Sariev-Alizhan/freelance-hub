import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types'
import { applyRateLimit, sanitize, sanitizeText } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const rl = applyRateLimit(request, 'profile:save', { limit: 15, windowMs: 60_000 })
    if (rl) return rl

    const body = await request.json()

    // Читаем сессию пользователя из cookies
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Используем service_role — обходит RLS полностью
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const fullName          = sanitize(body?.fullName, 100)
    const location          = sanitize(body?.location, 100)
    const bio               = sanitizeText(body?.bio, 2000)
    const avatarUrl         = sanitize(body?.avatarUrl, 500)
    const title             = sanitize(body?.title, 120)
    const category          = sanitize(body?.category, 50)
    const skills            = Array.isArray(body?.skills) ? body.skills.map((s: unknown) => sanitize(s, 60)).slice(0, 30) : []
    const priceFrom         = body?.priceFrom
    const priceTo           = body?.priceTo
    const level             = sanitize(body?.level, 20)
    const responseTime      = sanitize(body?.responseTime, 100)
    const languages         = Array.isArray(body?.languages) ? body.languages.map((l: unknown) => sanitize(l, 40)).slice(0, 10) : []
    const portfolio         = body?.portfolio
    // Pro profile fields
    const portfolioWebsite  = sanitize(body?.portfolioWebsite, 300)
    const githubUrl         = sanitize(body?.githubUrl, 200)
    const linkedinUrl       = sanitize(body?.linkedinUrl, 200)
    const headline          = sanitize(body?.headline, 120)
    const resumeUrl         = sanitize(body?.resumeUrl, 500)
    const resumeFilename    = sanitize(body?.resumeFilename, 200)
    // Social links
    const telegramUrl       = sanitize(body?.telegramUrl, 200)
    const instagramUrl      = sanitize(body?.instagramUrl, 200)
    const twitterUrl        = sanitize(body?.twitterUrl, 200)
    const youtubeUrl        = sanitize(body?.youtubeUrl, 200)
    const tiktokUrl         = sanitize(body?.tiktokUrl, 200)

    // ── Input validation ─────────────────────────────────────────────────────
    if (bio.length > 2000) {
      return NextResponse.json({ error: 'Bio too long (max 2000 chars)' }, { status: 400 })
    }
    if (title.length > 120) {
      return NextResponse.json({ error: 'Title too long (max 120 chars)' }, { status: 400 })
    }
    if (Array.isArray(portfolio) && portfolio.length > 10) {
      return NextResponse.json({ error: 'Too many portfolio items (max 10)' }, { status: 400 })
    }
    const parsedFrom = priceFrom != null ? parseInt(priceFrom) : 0
    const parsedTo   = priceTo   != null ? parseInt(priceTo)   : null
    if (isNaN(parsedFrom) || parsedFrom < 0 || parsedFrom > 100_000_000) {
      return NextResponse.json({ error: 'Invalid priceFrom' }, { status: 400 })
    }
    if (parsedTo !== null && (isNaN(parsedTo) || parsedTo < 0 || parsedTo > 100_000_000)) {
      return NextResponse.json({ error: 'Invalid priceTo' }, { status: 400 })
    }

    // 1. Upsert profile
    const { error: profErr } = await admin.from('profiles').upsert({
      id: user.id,
      full_name: fullName || null,
      location: location || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      role: 'freelancer',
    })

    if (profErr) {
      console.error('profiles upsert error:', profErr)
      return NextResponse.json({ error: `Профиль: ${profErr.message}` }, { status: 500 })
    }

    // 2. Upsert freelancer_profiles
    const { data: fp, error: fpErr } = await admin
      .from('freelancer_profiles')
      .upsert({
        user_id: user.id,
        title,
        category,
        skills: skills || [],
        ...(portfolioWebsite && { portfolio_website: portfolioWebsite }),
        ...(githubUrl        && { github_url: githubUrl }),
        ...(linkedinUrl      && { linkedin_url: linkedinUrl }),
        ...(headline         && { headline }),
        ...(resumeUrl        && { resume_url: resumeUrl }),
        ...(resumeFilename   && { resume_filename: resumeFilename }),
        ...(telegramUrl      && { telegram_url: telegramUrl }),
        ...(instagramUrl     && { instagram_url: instagramUrl }),
        ...(twitterUrl       && { twitter_url: twitterUrl }),
        ...(youtubeUrl       && { youtube_url: youtubeUrl }),
        ...(tiktokUrl        && { tiktok_url: tiktokUrl }),
        price_from: parsedFrom,
        price_to: parsedTo,
        level: level || 'middle',
        response_time: responseTime || 'в течение суток',
        languages: languages || ['Русский'],
      }, { onConflict: 'user_id' })
      .select('id')
      .single()

    if (fpErr) {
      console.error('freelancer_profiles upsert error:', fpErr)
      return NextResponse.json({ error: `Специализация: ${fpErr.message}` }, { status: 500 })
    }

    // 3. Portfolio items
    if (portfolio?.length > 0 && fp?.id) {
      const { error: portErr } = await admin.from('portfolio_items').insert(
        portfolio.map((p: { title: string; imageUrl: string; category: string; url?: string }) => ({
          freelancer_id: fp.id,
          title: p.title,
          image_url: p.imageUrl || null,
          category: p.category || category,
          project_url: p.url || null,
        }))
      )
      if (portErr) console.warn('portfolio insert error:', portErr.message)
    }

    return NextResponse.json({ ok: true, freelancerProfileId: fp?.id })
  } catch (e) {
    console.error('Unexpected error in /api/profile/save:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
