/** GitHub-style contribution heatmap: 52 weeks × 7 days.
 *  Server component — accepts pre-aggregated `counts` (keyed by YYYY-MM-DD). */

export interface HeatmapProps {
  /** Map of YYYY-MM-DD → activity count */
  counts: Record<string, number>
  totalCount: number
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }
function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function intensity(n: number): { bg: string; ring: string } {
  if (n === 0) return { bg: 'var(--fh-surface-2)', ring: 'transparent' }
  if (n === 1) return { bg: 'rgba(94,106,210,0.35)', ring: 'rgba(94,106,210,0.15)' }
  if (n === 2) return { bg: 'rgba(94,106,210,0.6)',  ring: 'rgba(94,106,210,0.2)'  }
  if (n <= 4)  return { bg: 'rgba(94,106,210,0.85)', ring: 'rgba(94,106,210,0.3)'  }
  return { bg: '#5e6ad2', ring: 'rgba(94,106,210,0.4)' }
}

export default function ProfileActivityHeatmap({ counts, totalCount }: HeatmapProps) {
  // Build 53 weeks × 7 days grid ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Shift so last column ends on today's weekday (Sunday=0)
  const endDow = today.getDay()
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() + (6 - endDow)) // end of this week (Saturday)
  const totalDays = 53 * 7
  const startDay = new Date(endDay)
  startDay.setDate(startDay.getDate() - (totalDays - 1))

  const weeks: Array<Array<{ date: Date; key: string; n: number }>> = []
  const cursor = new Date(startDay)
  for (let w = 0; w < 53; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const key = ymd(cursor)
      week.push({ date: new Date(cursor), key, n: counts[key] ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // Month labels: first week where the date is in this month, show label
  const seenMonths = new Set<number>()
  const monthLabels: Array<{ colIndex: number; label: string }> = []
  weeks.forEach((week, i) => {
    const firstOfMonth = week.find(c => c.date.getDate() <= 7)
    if (firstOfMonth) {
      const m = firstOfMonth.date.getMonth()
      if (!seenMonths.has(m)) {
        seenMonths.add(m)
        monthLabels.push({ colIndex: i, label: MONTH_LABELS[m] })
      }
    }
  })

  const CELL = 11
  const GAP = 3

  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>Activity</h2>
        <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>
          {totalCount} posts in the last year
        </span>
      </div>

      {/* Scrollable wrapper — fits 53 weeks which is wider than narrow phones */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          {/* Month labels row */}
          <div style={{
            position: 'relative',
            height: 14, marginLeft: 18, marginBottom: 4,
            width: 53 * (CELL + GAP) - GAP,
          }}>
            {monthLabels.map(m => (
              <span key={m.label} style={{
                position: 'absolute',
                left: m.colIndex * (CELL + GAP),
                fontSize: 10, color: 'var(--fh-t4)',
              }}>
                {m.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* Day-of-week labels on the left */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: GAP, paddingTop: 0,
              fontSize: 10, color: 'var(--fh-t4)', width: 14,
            }}>
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <div key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>{d}</div>
              ))}
            </div>

            {/* 53 week columns */}
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map(cell => {
                    const c = intensity(cell.n)
                    const title = `${cell.key} — ${cell.n} post${cell.n === 1 ? '' : 's'}`
                    return (
                      <div
                        key={cell.key}
                        title={title}
                        style={{
                          width: CELL, height: CELL, borderRadius: 2,
                          background: c.bg,
                          boxShadow: `inset 0 0 0 1px ${c.ring}`,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end',
        marginTop: 12, fontSize: 10, color: 'var(--fh-t4)',
      }}>
        <span>Less</span>
        {[0, 1, 2, 3, 5].map(n => {
          const c = intensity(n)
          return <div key={n} style={{
            width: 10, height: 10, borderRadius: 2,
            background: c.bg, boxShadow: `inset 0 0 0 1px ${c.ring}`,
          }} />
        })}
        <span>More</span>
      </div>
    </div>
  )
}
