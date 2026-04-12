'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useToast, ToastType } from '@/lib/context/ToastContext'

const CONFIG: Record<ToastType, {
  icon: React.ComponentType<{ className?: string }>
  bg: string
  border: string
  iconColor: string
  bar: string
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#0d1f15]',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    bar: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#1f0d0d]',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#1f180d]',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-[#0d1220]',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    bar: 'bg-blue-500',
  },
}

export default function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map(t => {
          const cfg = CONFIG[t.type]
          const Icon = cfg.icon
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`
                pointer-events-auto relative overflow-hidden
                rounded-2xl border ${cfg.bg} ${cfg.border}
                shadow-2xl backdrop-blur-sm
              `}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (t.duration ?? 4000) / 1000, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
                className={`absolute bottom-0 left-0 h-0.5 w-full ${cfg.bar} opacity-60`}
              />

              <div className="flex items-start gap-3 px-4 py-3.5">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-surface"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
