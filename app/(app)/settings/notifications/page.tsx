'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, ShoppingBag, Megaphone, Smartphone } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

type NotifPrefs = {
  msg_new:          boolean
  order_proposal:   boolean
  order_status:     boolean
  contract_update:  boolean
  platform_news:    boolean
  email_enabled:    boolean
  push_enabled:     boolean
  email_digest:     'never' | 'daily' | 'weekly'
}

const DEFAULT: NotifPrefs = {
  msg_new:         true,
  order_proposal:  true,
  order_status:    true,
  contract_update: true,
  platform_news:   false,
  email_enabled:   true,
  push_enabled:    false,
  email_digest:    'weekly',
}

const LS_KEY = 'fh-notif-prefs'

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT)
  const [saved, setSaved]   = useState(false)
  const { t } = useLang()
  const td = t.settingsPage

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) })
    } catch {}
  }, [])

  function update<K extends keyof NotifPrefs>(key: K, val: NotifPrefs[K]) {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  async function requestPush(enabled: boolean) {
    if (enabled && 'Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }
    update('push_enabled', enabled)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
            {td.notifTitle}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '2px' }}>
            {td.notifSubtitle}
          </p>
        </div>
        {saved && (
          <span style={{ fontSize: '12px', color: '#27a644', fontWeight: 510, transition: 'opacity 0.3s' }}>
            {td.savedBadge}
          </span>
        )}
      </div>

      {/* Messages */}
      <Section icon={MessageSquare} label={td.secMessages}>
        <Toggle
          label={td.newMsgLabel}
          sub={td.newMsgSub}
          value={prefs.msg_new}
          onChange={v => update('msg_new', v)}
        />
      </Section>

      {/* Orders */}
      <Section icon={ShoppingBag} label={td.secOrders}>
        <Toggle
          label={td.proposalLabel}
          sub={td.proposalSub}
          value={prefs.order_proposal}
          onChange={v => update('order_proposal', v)}
        />
        <Toggle
          label={td.orderStatusLabel}
          sub={td.orderStatusSub}
          value={prefs.order_status}
          onChange={v => update('order_status', v)}
        />
        <Toggle
          label={td.contractLabel}
          sub={td.contractSub}
          value={prefs.contract_update}
          onChange={v => update('contract_update', v)}
          last
        />
      </Section>

      {/* Platform */}
      <Section icon={Megaphone} label={td.secPlatform}>
        <Toggle
          label={td.platformNewsLabel}
          sub={td.platformNewsSub}
          value={prefs.platform_news}
          onChange={v => update('platform_news', v)}
          last
        />
      </Section>

      {/* Channels */}
      <Section icon={Smartphone} label={td.secDelivery}>
        <Toggle
          label={td.emailLabel}
          sub={td.emailSub}
          value={prefs.email_enabled}
          onChange={v => update('email_enabled', v)}
        />

        {/* Email digest — only when email is on */}
        {prefs.email_enabled && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 0', borderBottom: '1px solid var(--fh-sep)',
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '1px' }}>
                {td.digestLabel}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                {td.digestSub}
              </p>
            </div>
            <select
              value={prefs.email_digest}
              onChange={e => update('email_digest', e.target.value as NotifPrefs['email_digest'])}
              style={{
                padding: '6px 10px', borderRadius: '8px',
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t2)', fontSize: '13px', cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="never">{td.digestNever}</option>
              <option value="daily">{td.digestDaily}</option>
              <option value="weekly">{td.digestWeekly}</option>
            </select>
          </div>
        )}

        <Toggle
          label={td.pushLabel}
          sub={td.pushSub}
          value={prefs.push_enabled}
          onChange={requestPush}
        />

        {/* Telegram — coming soon */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 0',
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '1px' }}>
              {td.telegramLabel}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
              {td.telegramSub}
            </p>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)',
            background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
            padding: '4px 9px', borderRadius: '6px', letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            {td.comingSoon}
          </span>
        </div>
      </Section>
    </div>
  )
}

// ── Shared components ────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '12px',
    }}>
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid var(--fh-sep)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Icon style={{ width: 13, height: 13, color: 'var(--fh-t4)' }} />
        <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ padding: '0 18px' }}>{children}</div>
    </div>
  )
}

function Toggle({
  label,
  sub,
  value,
  onChange,
  last,
}: {
  label: string
  sub: string
  value: boolean
  onChange: (v: boolean) => void | Promise<void>
  last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid var(--fh-sep)',
    }}>
      <div style={{ paddingRight: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '1px' }}>
          {label}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          position: 'relative', width: '40px', height: '22px', borderRadius: '11px',
          background: value ? '#5e6ad2' : 'var(--fh-surface-3)',
          border: value ? 'none' : '1px solid var(--fh-border-2)',
          cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, padding: 0,
          outline: 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: value ? '3px' : '2px',
          left: value ? '20px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }} />
      </button>
    </div>
  )
}
