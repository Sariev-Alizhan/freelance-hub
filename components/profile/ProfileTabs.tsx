'use client'
import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface Tab {
  id:     string
  label:  string
  count?: number
}

export default function ProfileTabs({
  tabs, panels, defaultTab,
}: {
  tabs:        Tab[]
  panels:      Record<string, ReactNode>
  defaultTab:  string
}) {
  const pathname     = usePathname()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const urlTab       = searchParams.get('tab') ?? ''
  const valid        = tabs.some(t => t.id === urlTab) ? urlTab : defaultTab
  const [active, setActive] = useState<string>(valid)

  useEffect(() => { setActive(valid) }, [valid])

  function switchTo(id: string) {
    setActive(id)
    const sp = new URLSearchParams(searchParams.toString())
    if (id === defaultTab) sp.delete('tab')
    else sp.set('tab', id)
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div>
      <div style={{
        display: 'flex', gap: 4,
        borderBottom: '1px solid var(--fh-border-2)',
        overflowX: 'auto', scrollbarWidth: 'none',
        marginBottom: 16,
      }}>
        {tabs.map(t => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              onClick={() => switchTo(t.id)}
              style={{
                padding: '11px 14px',
                fontSize: 13, fontWeight: isActive ? 590 : 510,
                color: isActive ? 'var(--fh-t1)' : 'var(--fh-t4)',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${isActive ? '#27a644' : 'transparent'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
                marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span style={{
                  marginLeft: 6, fontSize: 11, color: 'var(--fh-t4)',
                  fontWeight: 510,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div>{panels[active] ?? null}</div>
    </div>
  )
}
