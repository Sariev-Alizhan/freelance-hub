'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import RespondModal from './RespondModal'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

interface Props {
  orderId: string
  orderTitle: string
  orderDescription: string
  category: string
  budgetMin: number
  budgetMax: number
  myResponseStatus?: 'pending' | 'accepted' | 'rejected' | null
}

export default function RespondButton({
  orderId, orderTitle, orderDescription, category, budgetMin, budgetMax, myResponseStatus = null
}: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useLang()
  const tr = t.respond

  if (myResponseStatus === 'accepted') {
    return (
      <div
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.25)', color: '#27a644' }}
      >
        <CheckCircle className="h-4 w-4" />
        {tr.statusAccepted}
      </div>
    )
  }

  if (myResponseStatus === 'rejected') {
    return (
      <div
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', color: 'var(--fh-t4)' }}
      >
        <XCircle className="h-4 w-4" />
        {tr.statusRejected}
      </div>
    )
  }

  if (myResponseStatus === 'pending') {
    return (
      <div
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: 'var(--fh-primary-muted)', border: '1px solid rgba(39,166,68,0.25)', color: 'var(--fh-primary)' }}
      >
        <Clock className="h-4 w-4" />
        {tr.statusPending}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
      >
        {tr.apply}
      </button>

      <AnimatePresence>
        {open && (
          <RespondModal
            orderId={orderId}
            orderTitle={orderTitle}
            orderDescription={orderDescription}
            category={category}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
