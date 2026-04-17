'use client'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Edit3, Eye, Loader2, MapPin, Share2, Tag, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { LEVEL_LABELS, type FreelancerProfile, type Profile } from './types'

/**
 * Top of the dashboard: avatar (click to upload a new one), name + title +
 * location, and Share / View / Edit buttons. Also renders the bio block
 * and skills+price row underneath.
 */
export default function ProfileHeader({
  profile, fp, user, avatarUploading, onUploadAvatar,
}: {
  profile: Profile | null
  fp: FreelancerProfile | null
  user: SupabaseUser
  avatarUploading: boolean
  onUploadAvatar: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null

  return (
    <>
      <div className="flex items-start gap-4 mb-6" style={{ minWidth: 0, maxWidth: '100%' }}>
        <div className="flex-shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUploadAvatar(f); e.target.value = '' }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={avatarUploading}
            className="relative group h-16 w-16 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Change photo"
          >
            {avatarUploading ? (
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-2xl object-cover w-16 h-16" unoptimized />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            {!avatarUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Camera className="h-5 w-5 text-white" />
              </div>
            )}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground">Welcome,</div>
          <h1 className="text-xl font-bold truncate">{displayName}</h1>
          {fp?.title ? (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-muted-foreground">{fp.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {LEVEL_LABELS[fp.level] ?? fp.level}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{user.email}</span>
          )}
          {profile?.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" /> {profile.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {profile?.username && (
            <button
              onClick={() => navigator.clipboard?.writeText(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'}/u/${profile.username}`).catch(() => {})}
              title={`/u/${profile.username}`}
              className="narrow-hide flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
          {profile?.username && (
            <Link href={`/u/${profile.username}`} className="narrow-hide flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Link>
          )}
          <Link href="/profile/setup" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground">
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </div>

      {profile?.bio && (
        <div className="mb-5 p-4 rounded-xl bg-subtle border border-subtle text-sm text-muted-foreground leading-relaxed"
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            hyphens: 'auto',
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
          }}>
          {profile.bio}
        </div>
      )}

      {(fp?.skills?.length ?? 0) > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            {fp!.skills.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">{s}</span>
            ))}
          </div>
          {fp?.price_from ? (
            <div className="mt-1.5 text-sm font-semibold" style={{ color: '#27a644' }}>
              from {fp.price_from.toLocaleString()} ₸{fp.price_to ? ` — ${fp.price_to.toLocaleString()} ₸` : ''}
            </div>
          ) : null}
        </div>
      )}
    </>
  )
}
