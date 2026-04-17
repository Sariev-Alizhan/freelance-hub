import { Loader2, MessageSquare, Search } from 'lucide-react'
import type { Conversation } from './types'
import Avatar from './Avatar'
import { formatTime } from './utils'

/**
 * Left-side messenger sidebar: "Messages" header, search pill, and the
 * scrollable conversation list. On mobile it's the full screen; on desktop
 * it sits next to the chat pane. `showList` gates the mobile hide/show.
 * Filtering by `search` happens locally against `other_user.full_name`.
 */
export default function ConversationList(props: {
  showList: boolean
  search: string
  setSearch: (v: string) => void
  convsLoading: boolean
  conversations: Conversation[]
  activeId: string | null
  onlineUserIds: Set<string>
  onSelectConversation: (id: string) => void
}) {
  const {
    showList, search, setSearch,
    convsLoading, conversations, activeId, onlineUserIds,
    onSelectConversation,
  } = props

  const filteredConvs = conversations.filter(c =>
    !search || (c.other_user.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className={`messenger-sidebar flex flex-col flex-shrink-0 ${showList ? 'flex' : 'hidden md:flex'}`}
      style={{
        borderRight: '1px solid var(--fh-sep)',
        background: 'var(--fh-surface)',
      }}
    >
      {/* Header — Instagram DM style */}
      <div className="flex-shrink-0" style={{ borderBottom: '0.5px solid var(--fh-sep)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 16px 10px', position: 'relative' }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em', margin: 0 }}>
            Messages
          </h1>
        </div>
        {/* Search pill */}
        <div
          className="flex items-center gap-2 mx-4 mb-3"
          style={{
            height: 36, borderRadius: 10,
            background: 'var(--fh-surface-2)',
            border: '1px solid var(--fh-border)',
            padding: '0 12px',
          }}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--fh-t1)', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto messenger-convs-scroll">
        {convsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-t4)' }} />
          </div>
        ) : filteredConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
            <MessageSquare className="h-9 w-9" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
            <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
              {search ? 'No results' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConvs.map(conv => {
            const isActive = activeId === conv.id
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', textAlign: 'left',
                  background: isActive ? 'var(--fh-surface-2)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Avatar with online/unread indicator */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar user={conv.other_user} size={48} />
                  {onlineUserIds.has(conv.other_user.id) && (
                    <span style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 11, height: 11, borderRadius: '50%',
                      background: '#27a644',
                      border: '2px solid var(--fh-surface)',
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: conv.unread > 0 ? 700 : 600,
                      color: 'var(--fh-t1)',
                      letterSpacing: '-0.01em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.other_user.full_name || 'User'}
                    </span>
                    {conv.last_message_at && (
                      <span style={{
                        fontSize: 12,
                        color: conv.unread > 0 ? 'var(--fh-primary)' : 'var(--fh-t4)',
                        fontWeight: conv.unread > 0 ? 600 : 400,
                        flexShrink: 0,
                      }}>
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <p style={{
                      fontSize: 13,
                      color: conv.unread > 0 ? 'var(--fh-t2)' : 'var(--fh-t4)',
                      fontWeight: conv.unread > 0 ? 500 : 400,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {conv.last_message || 'No messages'}
                    </p>
                    {conv.unread > 0 && (
                      <span style={{
                        minWidth: 18, height: 18, borderRadius: 9,
                        background: 'var(--fh-primary)', color: '#fff',
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', flexShrink: 0,
                      }}>
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
