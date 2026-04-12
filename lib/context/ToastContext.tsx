'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const duration = opts.duration ?? 4000
    setToasts(prev => [...prev.slice(-3), { ...opts, id }]) // max 4
    if (duration > 0) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// Convenience helpers
export function useToastHelpers() {
  const { toast } = useToast()
  return {
    success: (title: string, description?: string) => toast({ type: 'success', title, description }),
    error:   (title: string, description?: string) => toast({ type: 'error',   title, description }),
    warning: (title: string, description?: string) => toast({ type: 'warning', title, description }),
    info:    (title: string, description?: string) => toast({ type: 'info',    title, description }),
  }
}
