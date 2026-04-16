'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  User, Crown, ExternalLink, Trash2, ChevronRight,
  Calendar, Mail, Sliders, Bell, Eye, Shield,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTIONS = [
  {
    href: '/settings/preferences',
    icon: Sliders,
    label: 'Appearance & Region',
    sub: 'Language, currency and theme',
  },
  {
    href: '/settings/notifications',
    icon: Bell,
    label: 'Notifications',
    sub: 'Control which alerts you receive and where',
  },
  {
    href: '/settings/privacy',
    icon: Eye,
    label: 'Privacy & Visibility',
    sub: 'Who can see your profile and message you',
  },
  {
    href: '/settings/security',
    icon: Shield,
    label: 'Password & Security',
    sub: 'Change password and enable two-factor auth',
  },
]

export default function AccountSettings() {
  const { user } = useUser()
  const { profile } = useProfile()
  const router = useRouter()
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    supabase
      .from('freelancer_profiles')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => setIsPremium(!!(data as any)?.is_premium))
  }, [user?.id])

  if (!user) return null

  const avatarUrl   = profile?.avatar_url
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]
  const joinedDate  = new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
          Account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '2px' }}>
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Profile card */}
      <div style={{
        background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
        borderRadius: '16px', padding: '20px', marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              src={avatarUrl} alt={displayName || ''} width={56} height={56}
              style={{ borderRadius: '12px', flexShrink: 0 }} unoptimized
            />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '12px', flexShrink: 0,
              background: 'rgba(113,112,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User style={{ width: 24, height: 24, color: '#7170ff' }} />
            </div>
          )}

          {/* Name + email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                {displayName}
              </span>
              {isPremium && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: '#7170ff',
                  background: 'rgba(113,112,255,0.1)', border: '1px solid rgba(113,112,255,0.2)',
                  padding: '1px 7px', borderRadius: '4px', letterSpacing: '0.04em',
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                }}>
                  <Crown style={{ width: 8, height: 8 }} /> PREMIUM
                </span>
              )}
            </div>
            <span style={{
              fontSize: '13px', color: 'var(--fh-t4)',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <Mail style={{ width: 11, height: 11, flexShrink: 0 }} />
              {user.email}
            </span>
          </div>

          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '13px', color: '#7170ff', textDecoration: 'none',
              fontWeight: 510, flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            Edit profile <ExternalLink style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {/* Meta */}
        <div style={{
          display: 'flex', gap: '24px', paddingTop: '16px', marginTop: '16px',
          borderTop: '1px solid var(--fh-sep)', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '2px' }}>Joined</p>
            <p style={{ fontSize: '13px', color: 'var(--fh-t2)', fontWeight: 510, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar style={{ width: 11, height: 11 }} /> {joinedDate}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '2px' }}>Plan</p>
            <p style={{ fontSize: '13px', fontWeight: 590, color: isPremium ? '#7170ff' : 'var(--fh-t3)' }}>
              {isPremium === null ? '—' : isPremium ? 'Premium' : 'Free'}
              {isPremium === false && (
                <Link href="/premium" style={{ color: '#7170ff', textDecoration: 'none', marginLeft: '8px', fontSize: '12px', fontWeight: 400 }}>
                  Upgrade →
                </Link>
              )}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '2px' }}>User ID</p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontFamily: 'monospace' }}>
              {user.id.slice(0, 8)}…
            </p>
          </div>
        </div>
      </div>

      {/* Settings links */}
      <div style={{
        background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
        borderRadius: '16px', overflow: 'hidden', marginBottom: '12px',
      }}>
        {SECTIONS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--fh-sep)' : 'none',
              color: 'inherit', textDecoration: 'none', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon style={{ width: 15, height: 15, color: 'var(--fh-t3)' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '1px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{item.sub}</p>
              </div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--fh-t4)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{
        background: 'var(--fh-surface)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', padding: '18px',
      }}>
        <p style={{ fontSize: '13px', fontWeight: 590, color: '#ef4444', marginBottom: '3px' }}>
          Danger Zone
        </p>
        {!confirmDelete ? (
          <>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '12px' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', fontSize: '13px', fontWeight: 510, cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: 13, height: 13 }} /> Delete my account
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--fh-t2)', marginBottom: '12px', lineHeight: 1.6 }}>
              This will permanently erase your profile, orders, proposals, messages and all data.
              To proceed, write to{' '}
              <a href="mailto:support@freelance-hub.kz" style={{ color: '#ef4444', textDecoration: 'underline' }}>
                support@freelance-hub.kz
              </a>{' '}
              from your registered email address.
            </p>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                padding: '7px 14px', borderRadius: '7px',
                border: '1px solid var(--fh-border)', background: 'var(--fh-surface-2)',
                color: 'var(--fh-t2)', fontSize: '13px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
