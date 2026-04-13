'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import RespondModal from './RespondModal'

interface Props {
  orderId: string
  orderTitle: string
  orderDescription: string
  category: string
  budgetMin: number
  budgetMax: number
}

export default function RespondButton({ orderId, orderTitle, orderDescription, category, budgetMin, budgetMax }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
      >
        Apply
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
