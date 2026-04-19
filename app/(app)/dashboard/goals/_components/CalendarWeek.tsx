'use client'
import { Plus, Trash2 } from 'lucide-react'
import { isoToday, weekDates, type ScheduleBlock } from './types'
import { useLang } from '@/lib/context/LanguageContext'

export default function CalendarWeek({
  weekOffset, blocks, onAddBlock, onDeleteBlock,
}: {
  weekOffset: number
  blocks: ScheduleBlock[]
  onAddBlock: (date: string) => void
  onDeleteBlock: (id: string) => void
}) {
  const { t } = useLang()
  const td = t.dashboardPage
  const DAY_LABELS = [td.dayMon, td.dayTue, td.dayWed, td.dayThu, td.dayFri, td.daySat, td.daySun]
  const dates  = weekDates(weekOffset)
  const today  = isoToday()

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAY_LABELS.map((d: string, i: number) => (
        <div key={d} className={`text-center pb-2 ${dates[i] === today ? 'text-primary' : 'text-muted-foreground'}`}>
          <p className="text-[10px] font-semibold uppercase">{d}</p>
          <p className={`text-sm font-bold ${dates[i] === today ? 'text-primary' : ''}`}>
            {new Date(dates[i]).getDate()}
          </p>
        </div>
      ))}
      {dates.map(date => {
        const dayBlocks = blocks.filter(b => b.date === date)
        const isToday   = date === today
        return (
          <div
            key={date}
            className={`rounded-xl min-h-[80px] p-1.5 border transition-colors cursor-pointer hover:border-primary/30 ${
              isToday ? 'border-primary/40 bg-primary/5' : 'border-subtle bg-surface/50'
            }`}
            onClick={() => onAddBlock(date)}
          >
            {dayBlocks.map(b => (
              <div
                key={b.id}
                className="rounded-lg px-1.5 py-1 mb-1 text-[10px] font-medium text-white relative group"
                style={{ background: b.color }}
                onClick={e => { e.stopPropagation(); onDeleteBlock(b.id) }}
              >
                <span className="truncate block">{b.label}</span>
                {b.start_time && (
                  <span className="opacity-70">{b.start_time.slice(0,5)}</span>
                )}
                <div className="absolute inset-0 bg-black/30 rounded-lg items-center justify-center hidden group-hover:flex">
                  <Trash2 className="h-3 w-3 text-white" />
                </div>
              </div>
            ))}
            {dayBlocks.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-40 transition-opacity">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
