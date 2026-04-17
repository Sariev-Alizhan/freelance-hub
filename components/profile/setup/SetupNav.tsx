'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

export default function SetupNav({
  step, canNext, submitting, onStep, onSubmit,
}: {
  step: number
  canNext: boolean
  submitting: boolean
  onStep: (next: number) => void
  onSubmit: () => void
}) {
  const router = useRouter()
  return (
    <div className="px-6 pb-6 flex items-center justify-between gap-3">
      <button
        onClick={() => step > 0 ? onStep(step - 1) : router.back()}
        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 0 ? 'Back' : 'Prev'}
      </button>

      {step < 4 ? (
        <button
          onClick={() => onStep(step + 1)}
          disabled={!canNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {submitting ? 'Saving...' : 'Publish profile'}
        </button>
      )}
    </div>
  )
}
