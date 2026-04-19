'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { BLOCK_COLORS, type ScheduleBlock } from './types'
import { useLang } from '@/lib/context/LanguageContext'

export default function AddBlockModal({ date, onClose, onSave }: {
  date: string
  onClose: () => void
  onSave: (b: Omit<ScheduleBlock, 'id'>) => void
}) {
  const { t, lang } = useLang()
  const td = t.dashboardPage
  const dateLocale = lang === 'en' ? 'en' : lang === 'kz' ? 'kk' : 'ru'
  const [label, setLabel] = useState(td.workDefault)
  const [start, setStart] = useState('09:00')
  const [end, setEnd]     = useState('18:00')
  const [color, setColor] = useState(BLOCK_COLORS[0])
  const [note]            = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-subtle bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{td.blockOn} {new Date(date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long' })}</h3>
          <button onClick={onClose} aria-label={td.closeAria}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={td.blockNamePlaceholder}
          className="w-full px-3 py-2.5 rounded-xl border border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{td.timeStart}</label>
            <input type="time" value={start} onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-subtle bg-surface text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{td.timeEnd}</label>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-subtle bg-surface text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {BLOCK_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-card' : ''}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
        <button
          onClick={() => onSave({ date, label, start_time: start, end_time: end, color, note: note || null })}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {td.addBlockBtn}
        </button>
      </div>
    </div>
  )
}
