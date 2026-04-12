import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
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

    const { fullName, location, bio, avatarUrl, title, category, skills, priceFrom, priceTo, level, responseTime, languages, portfolio } = body

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
        price_from: parseInt(priceFrom) || 0,
        price_to: priceTo ? parseInt(priceTo) : null,
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
        portfolio.map((p: { title: string; imageUrl: string; category: string }) => ({
          freelancer_id: fp.id,
          title: p.title,
          image_url: p.imageUrl || null,
          category: p.category || category,
        }))
      )
      if (portErr) console.warn('portfolio insert error:', portErr.message)
    }

    return NextResponse.json({ ok: true, freelancerProfileId: fp?.id })
  } catch (e) {
    console.error('Unexpected error in /api/profile/save:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
