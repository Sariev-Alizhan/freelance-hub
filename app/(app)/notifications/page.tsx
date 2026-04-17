'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, MessageSquare, UserCheck, Briefcase,
  CheckCheck, X, Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
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

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string; filter: string }> = {
  new_response:    { icon: UserCheck,     color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)',  label: 'New response',  filter: 'orders'   },
  new_message:     { icon: MessageSquare, color: 'var(--fh-primary)', bgColor: 'var(--fh-primary-muted)', label: 'Message', filter: 'messages' },
  order_accepted:  { icon: CheckCheck,    color: '#27a644', bgColor: 'rgba(39,166,68,0.1)',   label: 'Order accepted', filter: 'orders'  },
  order_completed: { icon: Briefcase,     color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)',  label: 'Order done',    filter: 'orders'   },
}

type FilterTab = 'all' | 'orders' | 'messages'

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'только что'
  if (s < 3600) return `${Math.floor(s / 60)} мин`
  if (s < 86400) return `${Math.floor(s / 3600)} ч`
  if (s < 604800) return `${Math.floor(s / 86400)} д`
  return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

function NotifRow({ notif, onRead, onDelete }: {
  notif: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.new_message
  const Icon = cfg.icon

  const inner = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.18 }}
      onClick={() => onRead(notif.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: !notif.is_read ? 'rgba(94,106,210,0.04)' : 'transparent',
        borderBottom: '0.5px solid var(--fh-sep)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Left: unread bar */}
      {!notif.is_read && (
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, borderRadius: '0 2px 2px 0',
          background: 'var(--fh-primary)',
        }} />
      )}

      {/* Icon circle */}
      <div style={{
        width: 46, height: 46,
        borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: cfg.bgColor,
      }}>
        <Icon style={{ width: 20, height: 20, color: cfg.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontSize: 14,
            fontWeight: notif.is_read ? 400 : 600,
            color: 'var(--fh-t1)',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
          }}>
            {notif.title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--fh-t4)', flexShrink: 0, marginTop: 2 }}>
            {timeAgo(notif.created_at)}
          </span>
        </div>
        {notif.body && (
          <p style={{
            fontSize: 13, color: 'var(--fh-t3)',
            marginTop: 2, lineHeight: 1.5,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {notif.body}
          </p>
        )}
        <span style={{ fontSize: 11, color: cfg.color, marginTop: 3, display: 'block', fontWeight: 500 }}>
          {cfg.label}
        </span>
      </div>

      {/* Delete btn */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(notif.id) }}
        style={{
          position: 'absolute', right: 12, top: 12,
          width: 26, height: 26, borderRadius: 8,
          background: 'rgba(229,72,77,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
          opacity: 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
        }}
        className="notif-delete-btn"
      >
        <X style={{ width: 13, height: 13, color: '#e5484d' }} />
      </button>
    </motion.div>
  )

  return notif.link ? (
    <Link href={notif.link} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  )
}

export default function NotificationsPage() {
  const { user } = useUser()
  const userId = user?.id
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const { state: pushState, subscribe, unsubscribe } = usePushNotifications()
  const supabase = useMemo(() => createClient(), [])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const unreadCount = notifications.filter(n => !n.is_read).length

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications
    return notifications.filter(n => {
      const cfg = TYPE_CONFIG[n.type]
      return cfg?.filter === activeFilter
    })
  }, [notifications, activeFilter])

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(60)
    setNotifications(data ?? [])
    setLoading(false)
  }, [userId, db])

  useEffect(() => { load() }, [load])

  // Auto-mark everything as read the moment the user views this page.
  // Keep local `is_read: false` styling during the session so the user can still
  // glance at what's new; the DB flip makes next-visit state correct and clears
  // the header bell badge.
  useEffect(() => {
    if (!userId) return
    if (loading) return
    if (unreadCount === 0) return
    // Supabase query builder is lazy — must terminate with .then() to fire.
    db.from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(() => {})
  }, [userId, loading, unreadCount, db])

  // Realtime: append new notifications live
  useEffect(() => {
    if (!userId) return
    let channel: RealtimeChannel | null = null
    channel = supabase
      .channel(`notifs-page:${userId}:${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: { new: Notification }) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [userId, supabase])

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    db.from('notifications').update({ is_read: true }).eq('id', id).then(() => {})
  }

  function deleteNotif(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    db.from('notifications').delete().eq('id', id).then(() => {})
  }

  async function clearAll() {
    setNotifications([])
    await db.from('notifications').delete().eq('user_id', user?.id)
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
        <Bell style={{ width: 40, height: 40, color: 'var(--fh-t4)', opacity: 0.3 }} />
        <p style={{ fontSize: 16, color: 'var(--fh-t2)', fontWeight: 500 }}>Войдите, чтобы видеть уведомления</p>
        <Link href="/auth/login" style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--fh-primary)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          Войти
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* CSS for delete button hover */}
      <style>{`
        .notif-row:hover .notif-delete-btn,
        .notif-row:active .notif-delete-btn { opacity: 1 !important; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* ── Header row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em', margin: 0 }}>
            Notifications
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--fh-t4)', padding: 0,
              }}>
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>

        {/* ── LinkedIn-style filter chips ── */}
        <div style={{
          display: 'flex', gap: 8, padding: '0 16px 12px',
          overflowX: 'auto', scrollbarWidth: 'none',
          borderBottom: '0.5px solid var(--fh-sep)',
        }}>
          {([
            { id: 'all',      label: 'All' },
            { id: 'orders',   label: 'Orders' },
            { id: 'messages', label: 'Messages' },
          ] as { id: FilterTab; label: string }[]).map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: activeFilter === f.id ? 'none' : '1px solid var(--fh-border)',
                background: activeFilter === f.id ? 'var(--fh-t1)' : 'transparent',
                color: activeFilter === f.id ? 'var(--fh-canvas)' : 'var(--fh-t2)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Push notifications toggle ─────────────────────────────────────── */}
        {pushState !== 'unsupported' && pushState !== 'loading' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '0.5px solid var(--fh-sep)',
            background: 'var(--fh-surface-2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell style={{ width: 16, height: 16, color: 'var(--fh-t3)' }} />
              <span style={{ fontSize: 14, color: 'var(--fh-t2)' }}>Push-уведомления</span>
            </div>
            {pushState === 'granted' ? (
              <button onClick={unsubscribe} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 13, color: 'var(--fh-t4)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                <BellOff style={{ width: 14, height: 14 }} />
                Отключить
              </button>
            ) : pushState === 'denied' ? (
              <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>Заблокированы</span>
            ) : (
              <button onClick={subscribe} style={{
                fontSize: 13, color: 'var(--fh-primary)', fontWeight: 600,
                background: 'rgba(113,112,255,0.1)', border: 'none',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              }}>
                Включить
              </button>
            )}
          </div>
        )}

        {/* ── List ──────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 16px',
                borderBottom: '0.5px solid var(--fh-sep)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--fh-surface-2)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, borderRadius: 7, background: 'var(--fh-surface-2)', width: '60%', marginBottom: 8 }} />
                  <div style={{ height: 11, borderRadius: 5, background: 'var(--fh-surface-2)', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 24px', gap: 14, textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'var(--fh-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell style={{ width: 28, height: 28, color: 'var(--fh-t4)', opacity: 0.5 }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                No notifications
              </p>
              <p style={{ fontSize: 14, color: 'var(--fh-t4)', marginTop: 6, lineHeight: 1.5 }}>
                New responses, messages and<br />order updates will appear here
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredNotifications.map(notif => (
              <div key={notif.id} className="notif-row">
                <NotifRow notif={notif} onRead={markRead} onDelete={deleteNotif} />
              </div>
            ))}
          </AnimatePresence>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 32 }} />
      </div>
    </>
  )
}
