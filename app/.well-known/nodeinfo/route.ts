// NodeInfo discovery — points at /nodeinfo/2.1 per the spec.
// Mastodon + misskey + pleroma use this to identify the software behind a host.
import { NextResponse } from 'next/server'
import { INSTANCE_ORIGIN } from '@/lib/federation'

export const runtime = 'nodejs'

export function GET() {
  return NextResponse.json({
    links: [
      { rel:  'http://nodeinfo.diaspora.software/ns/schema/2.1',
        href: `${INSTANCE_ORIGIN}/nodeinfo/2.1` },
    ],
  })
}
