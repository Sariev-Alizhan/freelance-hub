'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, UserCheck, Briefcase, CheckCheck, X, BellOff, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { SkeletonNotification } from '@/components/ui/Skeleton'
import { RealtimeChannel } from '@supabase/supabase-js'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

interface Notification {
  id: string
  type: 'new_response' | 'new_message' | 'order_accepted' | 'order_completed' | 'new_follower'
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_CONFIG = {
  new_response:    { icon: UserCheck,     color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  new_message:     { icon: MessageSquare, color: 'text-primary',    bg: 'bg-primary/10'    },
  order_accepted:  { icon: CheckCheck,    color: 'text-green-400',  bg: 'bg-green-500/10'  },
  order_completed: { icon: Briefcase,     color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
  new_follower:    { icon: UserPlus,      color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} d ago`
}

export default function NotificationBell({ sidebarMode }: { sidebarMode?: boolean }) {
  const { user } = useUser()
  const userId = user?.id
  const [open, setOpen] = useState(false)
  const { state: pushState, subscribe, unsubscribe } = usePushNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Stable supabase client — never recreated
  const supabase = useMemo(() => createClient(), [])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const unreadCount = notifications.filter(n => !n.is_read).length

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data)
    setLoading(false)
  }, [userId, db])

  // Load on mount
  useEffect(() => { loadNotifications() }, [loadNotifications])

  // Realtime subscription — unique name per mount avoids "callbacks after subscribe()" error
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifs:${userId}:${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function markAllRead() {
    if (!userId || unreadCount === 0) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await db.from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
  }

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await db.from('notifications').update({ is_read: true }).eq('id', id)
  }

  async function deleteNotification(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
    await db.from('notifications').delete().eq('id', id)
  }

  if (!userId) return null

  const bellButtonStyle = sidebarMode ? {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 44,
    paddingLeft: 18,
    paddingRight: 12,
    width: '100%',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: open ? 'var(--fh-surface-2)' : 'transparent',
    color: open ? 'var(--fh-t1)' : 'var(--fh-t3)',
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties : undefined

  return (
    <div className={sidebarMode ? undefined : 'relative'} ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className={sidebarMode ? undefined : 'relative flex items-center justify-center h-9 w-9 rounded-xl border border-subtle text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors'}
        style={bellButtonStyle}
        onMouseEnter={sidebarMode ? (e => { if (!open) { e.currentTarget.style.background = 'var(--fh-surface-2)'; e.currentTarget.style.color = 'var(--fh-t1)' } }) : undefined}
        onMouseLeave={sidebarMode ? (e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fh-t3)' } }) : undefined}
      >
        {sidebarMode ? (
          <>
            <span style={{ position: 'relative', flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell style={{ width: 18, height: 18 }} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -6,
                  minWidth: 14, height: 14, borderRadius: 7,
                  background: '#e5484d', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 510, whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'opacity 0.18s, transform 0.18s',
              opacity: 1,
              color: 'var(--fh-t2)',
            }}>
              Notifications
            </span>
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={sidebarMode ? 'w-80 rounded-2xl border border-subtle bg-card shadow-2xl overflow-hidden z-[100]' : 'absolute right-0 top-full mt-2 w-80 rounded-2xl border border-subtle bg-card shadow-2xl overflow-hidden z-50'}
            style={sidebarMode ? { position: 'fixed', left: 260, bottom: 80 } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-2">
                  {[0,1,2].map(i => <SkeletonNotification key={i} />)}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.new_message
                  const Icon = cfg.icon
                  const content = (
                    <div
                      className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-subtle ${!notif.is_read ? 'bg-primary/4' : ''}`}
                      onClick={() => markRead(notif.id)}
                    >
                      <div className={`h-8 w-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-tight ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {notif.body && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  )

                  return notif.link ? (
                    <Link key={notif.id} href={notif.link} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notif.id}>{content}</div>
                  )
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-subtle">
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Push notifications toggle */}
            {pushState !== 'unsupported' && pushState !== 'denied' && (
              <div className="px-4 py-2.5 border-t border-subtle flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Browser notifications</span>
                {pushState === 'loading' ? (
                  <span className="text-xs text-muted-foreground">...</span>
                ) : pushState === 'granted' ? (
                  <button onClick={unsubscribe}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <BellOff className="h-3 w-3" /> Turn off
                  </button>
                ) : (
                  <button onClick={subscribe}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: 'var(--fh-primary)' }}>
                    <Bell className="h-3 w-3" /> Enable
                  </button>
                )}
              </div>
            )}
            {pushState === 'denied' && (
              <div className="px-4 py-2 border-t border-subtle">
                <p className="text-[11px] text-muted-foreground">Notifications blocked — enable in browser settings</p>
              </div>
            )}
            {pushState === 'unsupported' && (
              <div className="px-4 py-2 border-t border-subtle">
                <p className="text-[11px] text-muted-foreground">Push not supported — use in-app notifications above</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
