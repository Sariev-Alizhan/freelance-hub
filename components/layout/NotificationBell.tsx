'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, UserCheck, Briefcase, CheckCheck, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { SkeletonNotification } from '@/components/ui/Skeleton'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Notification {
  id: string
  type: 'new_response' | 'new_message' | 'order_accepted' | 'order_completed'
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_CONFIG = {
  new_response: { icon: UserCheck,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  new_message:  { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10'    },
  order_accepted:{ icon: CheckCheck, color: 'text-green-400', bg: 'bg-green-500/10'  },
  order_completed:{ icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10'  },
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return `${Math.floor(diff / 86400)} дн назад`
}

export default function NotificationBell() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const unreadCount = notifications.filter(n => !n.is_read).length

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data)
    setLoading(false)
  }, [user])

  // Load on mount
  useEffect(() => { loadNotifications() }, [loadNotifications])

  // Realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifs:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [user])

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
    if (!user || unreadCount === 0) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await db.from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
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

  if (!user) return null

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-subtle text-muted-foreground hover:text-foreground hover:bg-subtle transition-colors"
      >
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
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-subtle bg-card shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
              <span className="text-sm font-semibold">Уведомления</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Прочитать все
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
                  <p className="text-sm text-muted-foreground">Нет уведомлений</p>
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
                  Очистить все
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
