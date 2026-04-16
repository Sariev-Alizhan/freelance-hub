import { NextRequest, NextResponse } from 'next/server'

// GET /r/[code]
// Sets a referral cookie and redirects to /auth/register
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

  const response = NextResponse.redirect(`${siteUrl}/auth/register`)

  // Store referral code in cookie for 7 days
  response.cookies.set('ref', code, {
    httpOnly: false,   // readable by JS so register page can pick it up
    maxAge: 7 * 24 * 3600,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
