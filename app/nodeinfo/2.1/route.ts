// NodeInfo 2.1 — public metadata about this instance.
import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET() {
  const db = admin()

  const [{ count: totalUsers }, { count: totalPosts }] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('feed_posts').select('id', { count: 'exact', head: true })
      .eq('origin_instance', 'freelance-hub.kz'),
  ])

  return NextResponse.json({
    version: '2.1',
    software: {
      name: 'freelancehub',
      version: '1.1.0',
      repository: 'https://github.com/alizhan/freelancehub',
    },
    protocols: ['activitypub'],
    services: { inbound: [], outbound: [] },
    openRegistrations: true,
    usage: {
      users: { total: totalUsers ?? 0 },
      localPosts: totalPosts ?? 0,
    },
    metadata: {
      nodeName: 'FreelanceHub',
      nodeDescription: 'Freelance marketplace for CIS with federation + Web3 identity.',
    },
  })
}
