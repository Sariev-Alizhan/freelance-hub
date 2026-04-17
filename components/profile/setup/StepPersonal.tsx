'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Image as ImageIcon } from 'lucide-react'
import { slide, type FormData } from './types'

export default function StepPersonal({ form, onSet }: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onSet('avatarFile', file)
    const reader = new FileReader()
    reader.onload = (ev) => onSet('avatarPreview', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <motion.div key="s0" {...slide} className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Personal information</h2>
        <p className="text-sm text-muted-foreground">How clients will see you</p>
      </div>

      <div className="flex items-center gap-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="relative h-20 w-20 rounded-2xl bg-subtle border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden flex-shrink-0 group"
        >
          {form.avatarPreview ? (
            <>
              <img src={form.avatarPreview} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
            </>
          ) : (
            <div className="text-center">
              <User className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">Photo</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Profile photo</p>
          <p className="text-xs text-muted-foreground mb-2">JPG, PNG up to 5 MB. A square photo looks best</p>
          <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg bg-subtle border border-subtle hover:bg-surface transition-colors">
            Upload photo
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Full name *</label>
        <input
          value={form.fullName}
          onChange={e => onSet('fullName', e.target.value)}
          placeholder="John Smith"
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          City
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          value={form.location}
          onChange={e => onSet('location', e.target.value)}
          placeholder="New York, London, Berlin..."
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">About me</label>
          <span className="text-xs text-muted-foreground">optional — you can fill it in step 2</span>
        </div>
        <textarea
          value={form.bio}
          onChange={e => onSet('bio', e.target.value)}
          placeholder="Briefly describe yourself, your experience and approach..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
      </div>
    </motion.div>
  )
}
