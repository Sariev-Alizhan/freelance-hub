import Image from 'next/image'
import type { OtherUser } from './types'

export default function Avatar({ user, size = 40 }: { user: OtherUser; size?: number }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.full_name || 'User'}
        width={size} height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }
  const initials = (user.full_name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: 'var(--fh-primary)' }}
    >
      {initials}
    </div>
  )
}
