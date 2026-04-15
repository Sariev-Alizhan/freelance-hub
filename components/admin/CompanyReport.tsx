import { CURRENT_RELEASE, RELEASE_HISTORY } from '@/lib/company-report'
import { CheckCircle2, Clock, Map, ChevronRight } from 'lucide-react'

export default function CompanyReport() {
  const rel = CURRENT_RELEASE

  return (
    <div className="space-y-6">

      {/* Release header */}
      <div className="rounded-2xl border border-subtle bg-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(113,112,255,0.12)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.25)' }}
              >
                v{rel.version}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(rel.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-lg font-bold mb-1">{rel.title}</h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{rel.summary}</p>
          </div>

          {/* History pill */}
          <div className="flex flex-col gap-1.5 text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1">Release history</p>
            {RELEASE_HISTORY.map(r => (
              <div key={r.version} className="flex items-center gap-2 justify-end">
                <span className="text-[11px] text-muted-foreground">{r.title}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: r.version === rel.version ? 'rgba(113,112,255,0.12)' : 'rgba(255,255,255,0.04)', color: r.version === rel.version ? '#7170ff' : '#62666d' }}
                >
                  v{r.version}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rel.reports.map(dept => (
          <div
            key={dept.id}
            className="rounded-2xl border border-subtle bg-card overflow-hidden"
          >
            {/* Dept header */}
            <div
              className="px-5 py-3.5 flex items-center gap-2.5"
              style={{ background: `${dept.color}0d`, borderBottom: `1px solid ${dept.color}20` }}
            >
              <span className="text-lg">{dept.emoji}</span>
              <span className="text-sm font-bold" style={{ color: dept.color }}>{dept.department}</span>
              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${dept.color}18`, color: dept.color }}>
                {dept.done.length} shipped
              </span>
            </div>

            <div className="p-5 space-y-5">

              {/* Done */}
              {dept.done.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Shipped</span>
                  </div>
                  <ul className="space-y-1.5">
                    {dept.done.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-400/60" />
                        <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* In Progress */}
              {dept.inProgress.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">In Progress</span>
                  </div>
                  <ul className="space-y-1.5">
                    {dept.inProgress.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-400/60" />
                        <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Roadmap */}
              {dept.roadmap.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Map className="h-3.5 w-3.5" style={{ color: dept.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: dept.color }}>Roadmap</span>
                  </div>
                  <ul className="space-y-1.5">
                    {dept.roadmap.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-40" style={{ color: dept.color }} />
                        <span className="text-xs text-muted-foreground/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
