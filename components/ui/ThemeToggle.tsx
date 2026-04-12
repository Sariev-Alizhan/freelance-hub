'use client'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-subtle bg-subtle hover:bg-surface transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  30, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate:  30, opacity: 0, scale: 0.5 }}
            animate={{ rotate:  0,  opacity: 1, scale: 1   }}
            exit={{    rotate: -30, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-amber-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
