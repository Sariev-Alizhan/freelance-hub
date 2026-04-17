import { Check } from 'lucide-react'
import { STEPS } from './types'

export default function StepProgress({ step }: { step: number }) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-white/6">
      <div className="flex items-center gap-1 mb-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-primary text-white'
                : i === step ? 'bg-primary/20 text-primary border-2 border-primary'
                : 'bg-subtle text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-[10px] font-medium text-center leading-tight ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mb-4 transition-all ${i < step ? 'bg-primary' : 'bg-surface'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="h-1 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
