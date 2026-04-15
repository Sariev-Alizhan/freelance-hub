import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

const VARIANT_MAP: Record<string, string | undefined> = {
  monthly:   process.env.LS_VARIANT_MONTHLY,
  quarterly: process.env.LS_VARIANT_QUARTERLY,
  annual:    process.env.LS_VARIANT_ANNUAL,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const variantId = VARIANT_MAP[plan]

  if (!variantId || variantId === '000000') {
    return NextResponse.json({ error: 'Invalid plan or payment not configured' }, { status: 400 })
  }

  const storeId = process.env.LS_STORE_ID
  const apiKey  = process.env.LS_API_KEY

  if (!storeId || !apiKey || apiKey === 'your_api_key_here') {
    console.error('[ls/checkout] LemonSqueezy env vars not set')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
  }

  lemonSqueezySetup({ apiKey })

  const email = user.email ?? ''
  const name  = (user.user_metadata as any)?.full_name ?? email.split('@')[0]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email,
      name,
      // custom_data → доступно в webhook через meta.custom_data
      custom: {
        user_id: user.id,
        plan,
      },
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    productOptions: {
      name: `FreelanceHub Premium — ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      description: 'Безлимитные отклики, топ в поиске, Premium значок',
      redirectUrl:        `${siteUrl}/premium/success`,
      receiptButtonText:  'Перейти в кабинет',
      receiptThankYouNote: 'Спасибо! Ваш Premium активирован.',
    },
  })

  if (error || !data?.data?.attributes?.url) {
    console.error('[ls/checkout] API error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }

  return NextResponse.json({ url: data.data.attributes.url })
}
