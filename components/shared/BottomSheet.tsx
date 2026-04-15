'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom on mobile, invisible on desktop (children rendered normally) */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 sm:hidden rounded-t-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--fh-border-2)', maxHeight: '85vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--fh-border-2)' }} />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--fh-sep)' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fh-t1)' }}>{title}</span>
                <button
                  onClick={onClose}
                  aria-label="Close filters"
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t4)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
