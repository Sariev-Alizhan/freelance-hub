import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export interface UserListItem {
  id:          string
  full_name:   string | null
  username:    string | null
  avatar_url:  string | null
  is_verified: boolean | null
  bio:         string | null
}

export default function UserList({ users, emptyLabel }: { users: UserListItem[]; emptyLabel: string }) {
  if (!users.length) {
    return (
      <div style={{
        padding: '40px 24px', textAlign: 'center',
        fontSize: 13, color: 'var(--fh-t4)',
        background: 'var(--fh-surface)', borderRadius: 14, border: '1px solid var(--fh-border-2)',
      }}>
        {emptyLabel}
      </div>
    )
  }
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      {users.map((u, i) => {
        const name = u.full_name || u.username || 'User'
        const avatar = u.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`
        return (
          <Link
            key={u.id}
            href={u.username ? `/u/${u.username}` : '#'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', textDecoration: 'none',
              borderTop: i === 0 ? 'none' : '1px solid var(--fh-sep)',
            }}
          >
            <Image src={avatar} alt={name} width={44} height={44}
              style={{ borderRadius: 10, flexShrink: 0 }} unoptimized />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
                {u.is_verified && <CheckCircle className="h-3.5 w-3.5" style={{ color: '#5e6ad2', flexShrink: 0 }} />}
              </div>
              {u.username && (
                <div style={{ fontSize: 12, color: 'var(--fh-t4)' }}>@{u.username}</div>
              )}
              {u.bio && (
                <div style={{
                  fontSize: 12, color: 'var(--fh-t3)', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {u.bio}
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
