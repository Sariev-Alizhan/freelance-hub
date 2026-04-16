'use client'
import { useState, useEffect } from 'react'
import { Globe, Users, Lock, Eye, EyeOff, Search, MessageSquare } from 'lucide-react'

type ProfileVisibility = 'public' | 'registered' | 'private'
type DmPermission      = 'everyone' | 'registered' | 'nobody'

type PrivacyPrefs = {
  profile_visibility: ProfileVisibility
  show_online:        boolean
  show_last_seen:     boolean
  searchable:         boolean
  show_in_listings:   boolean
  allow_dms:          DmPermission
}

const DEFAULT: PrivacyPrefs = {
  profile_visibility: 'public',
  show_online:        true,
  show_last_seen:     true,
  searchable:         true,
  show_in_listings:   true,
  allow_dms:          'everyone',
}

const LS_KEY = 'fh-privacy-prefs'

export default function PrivacyPage() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) })
    } catch {}
  }, [])

  function update<K extends keyof PrivacyPrefs>(key: K, val: PrivacyPrefs[K]) {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
            Privacy & Visibility
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '2px' }}>
            Control who can see you and how you appear on the platform.
          </p>
        </div>
        {saved && (
          <span style={{ fontSize: '12px', color: '#27a644', fontWeight: 510 }}>
            Saved ✓
          </span>
        )}
      </div>

      {/* Profile visibility */}
      <div style={{
        background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
        borderRadius: '16px', padding: '20px', marginBottom: '12px',
      }}>
        <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '2px' }}>
          Profile Visibility
        </p>
        <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '14px' }}>
          Who can view your public profile page
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {([
            {
              value: 'public' as const,
              icon: Globe,
              label: 'Public',
              sub: 'Anyone, including visitors who are not signed in, can view your profile',
            },
            {
              value: 'registered' as const,
              icon: Users,
              label: 'Registered users only',
              sub: 'Only signed-in platform members can view your profile',
            },
            {
              value: 'private' as const,
              icon: Lock,
              label: 'Private',
              sub: 'Your profile is hidden from everyone — only you can see it',
            },
          ]).map(opt => {
            const active = prefs.profile_visibility === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => update('profile_visibility', opt.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(94,106,210,0.06)' : 'var(--fh-surface-2)',
                  border: `1.5px solid ${active ? 'rgba(94,106,210,0.35)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s',
                }}
              >
                {/* Radio dot */}
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                  border: active ? '5px solid #5e6ad2' : '2px solid var(--fh-border-2)',
                  transition: 'all 0.15s', background: active ? 'transparent' : 'transparent',
                }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <opt.icon style={{ width: 13, height: 13, color: active ? '#7170ff' : 'var(--fh-t4)', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', fontWeight: 510, color: 'var(--fh-t1)' }}>{opt.label}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{opt.sub}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Activity status */}
      <SectionCard label="Activity Status" icon={Eye}>
        <ToggleRow
          label="Show online status"
          sub="Let others see a green dot when you're active"
          value={prefs.show_online}
          onChange={v => update('show_online', v)}
        />
        <ToggleRow
          label="Show last seen time"
          sub="Display how long ago you were last active"
          value={prefs.show_last_seen}
          onChange={v => update('show_last_seen', v)}
          last
        />
      </SectionCard>

      {/* Discovery */}
      <SectionCard label="Search & Discovery" icon={Search}>
        <ToggleRow
          label="Appear in search results"
          sub="Show up when clients search for freelancers using AI or filters"
          value={prefs.searchable}
          onChange={v => update('searchable', v)}
        />
        <ToggleRow
          label="Show in Freelancers listing"
          sub="Your card appears on the public /freelancers page"
          value={prefs.show_in_listings}
          onChange={v => update('show_in_listings', v)}
          last
        />
      </SectionCard>

      {/* Messaging permissions */}
      <div style={{
        background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
        borderRadius: '16px', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
          <MessageSquare style={{ width: 13, height: 13, color: 'var(--fh-t4)' }} />
          <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)' }}>Direct Messages</p>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '14px' }}>
          Who is allowed to send you direct messages
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {([
            {
              value: 'everyone' as const,
              label: 'Everyone',
              sub: 'Any visitor, even without an account, can start a conversation',
            },
            {
              value: 'registered' as const,
              label: 'Registered users only',
              sub: 'Only signed-in platform members can message you',
            },
            {
              value: 'nobody' as const,
              label: 'Nobody',
              sub: 'Your inbox is closed — no new DMs from anyone',
            },
          ]).map(opt => {
            const active = prefs.allow_dms === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => update('allow_dms', opt.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(94,106,210,0.06)' : 'var(--fh-surface-2)',
                  border: `1.5px solid ${active ? 'rgba(94,106,210,0.35)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                  border: active ? '5px solid #5e6ad2' : '2px solid var(--fh-border-2)',
                  transition: 'all 0.15s',
                }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '2px' }}>
                    {opt.label}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{opt.sub}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Shared components ────────────────────────────────────────────────────────

function SectionCard({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '12px',
    }}>
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid var(--fh-sep)',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <Icon style={{ width: 13, height: 13, color: 'var(--fh-t4)' }} />
        <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ padding: '0 18px' }}>{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  last,
}: {
  label: string
  sub: string
  value: boolean
  onChange: (v: boolean) => void
  last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid var(--fh-sep)',
    }}>
      <div style={{ paddingRight: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '1px' }}>{label}</p>
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
