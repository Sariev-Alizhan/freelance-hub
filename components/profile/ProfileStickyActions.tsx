import Link from 'next/link'
import { MessageCircle, Briefcase } from 'lucide-react'
import FollowButton from '@/components/profile/FollowButton'

/** Mobile-only sticky action bar. Hidden on desktop via CSS. */
export default function ProfileStickyActions({ targetUserId }: { targetUserId: string }) {
  return (
    <div className="profile-sticky-actions" style={{
      position: 'fixed', left: 0, right: 0,
      bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
      padding: '10px 12px',
      background: 'var(--fh-surface)',
      borderTop: '1px solid var(--fh-border-2)',
      backdropFilter: 'blur(12px)',
      display: 'flex', gap: 8,
      zIndex: 40,
    }}>
      <Link href={`/messages?open=${targetUserId}`} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '11px 10px', borderRadius: 8,
        background: '#27a644', color: '#fff',
        fontSize: 13, fontWeight: 590, textDecoration: 'none',
      }}>
        <MessageCircle className="h-4 w-4" /> Message
      </Link>
      <div style={{ flex: 1 }}>
        <FollowButton targetUserId={targetUserId} />
      </div>
      <Link href="/orders/new" aria-label="Post a job" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '11px 14px', borderRadius: 8,
        background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
        color: 'var(--fh-t2)', textDecoration: 'none',
      }}>
        <Briefcase className="h-4 w-4" />
      </Link>
    </div>
  )
}
