'use client'
import { Circle } from 'lucide-react'
import { AVAILABILITY_CONFIG, type AvailabilityStatus } from './types'

export default function AvailabilityToggle({ value, saving, onChange }: {
  value: AvailabilityStatus
  saving: boolean
  onChange: (status: AvailabilityStatus) => void
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Circle className="h-3 w-3 flex-shrink-0" style={{ color: AVAILABILITY_CONFIG[value].dot, fill: AVAILABILITY_CONFIG[value].dot }} />
        <span className="text-xs text-muted-foreground font-medium">Status</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {(Object.entries(AVAILABILITY_CONFIG) as [AvailabilityStatus, typeof AVAILABILITY_CONFIG['open']][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            disabled={saving}
            className="transition-all disabled:opacity-50 flex-shrink-0"
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 510,
              background: value === key ? cfg.bg : 'transparent',
              border: value === key ? `1px solid ${cfg.border}` : '1px solid var(--fh-border-2)',
              color: value === key ? cfg.dot : 'var(--fh-t4)',
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  )
}
