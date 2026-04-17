'use client'
import { motion } from 'framer-motion'
import { User, MapPin, Image as ImageIcon } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { CATEGORIES, LEVELS, slide, type FormData } from './types'

export default function StepReview({ form, user, submitError }: {
  form: FormData
  user: SupabaseUser | null
  submitError: string | null
}) {
  return (
    <motion.div key="s4" {...slide} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-1">Looks good?</h2>
        <p className="text-sm text-muted-foreground">Review your details before publishing your profile</p>
      </div>

      <div className="rounded-xl border border-subtle bg-background divide-y divide-white/6">
        <div className="p-4 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0">
            {form.avatarPreview
              ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
              : <User className="h-7 w-7 text-primary m-auto mt-3.5" />
            }
          </div>
          <div>
            <div className="font-semibold">{form.fullName || '—'}</div>
            {form.location && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{form.location}</div>}
            {form.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.bio}</p>}
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1.5">Specialization</div>
          <div className="font-medium text-sm">{form.title || '—'}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {form.category && (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{
                background: `${CATEGORIES.find(c => c.slug === form.category)?.color}15`,
                color: CATEGORIES.find(c => c.slug === form.category)?.color,
              }}>
                {CATEGORIES.find(c => c.slug === form.category)?.label}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-subtle text-muted-foreground">
              {LEVELS.find(l => l.value === form.level)?.icon} {LEVELS.find(l => l.value === form.level)?.label}
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-2">Skills ({form.skills.length})</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.skills.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
            ))}
          </div>
          {form.priceFrom && (
            <div className="text-sm font-semibold text-green-400">
              from ${parseInt(form.priceFrom).toLocaleString()}
              {form.priceTo ? ` – $${parseInt(form.priceTo).toLocaleString()}` : ''}
            </div>
          )}
        </div>

        {form.portfolio.length > 0 && (
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground mb-1">Portfolio: {form.portfolio.length} projects</div>
            <div className="flex gap-2 overflow-x-auto py-1">
              {form.portfolio.map((p, i) => (
                <div key={i} className="h-14 w-20 rounded-lg bg-subtle flex-shrink-0 overflow-hidden border border-subtle">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <p className="font-semibold mb-1">Save error</p>
          <p className="text-xs opacity-80">{submitError}</p>
          <p className="text-xs mt-2 opacity-60">Make sure you are signed in and try again</p>
        </div>
      )}

      {!user && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
          To save your profile you need to{' '}
          <a href="/auth/login" className="underline font-medium">sign in</a>
        </div>
      )}
    </motion.div>
  )
}
