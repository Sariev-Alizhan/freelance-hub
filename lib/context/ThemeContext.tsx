'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from DOM class set by the anti-FOUC script (default: dark)
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    // Sync with what the inline script already applied
    const isDark = document.documentElement.classList.contains('dark')
    setThemeState(isDark ? 'dark' : 'light')

    // If no explicit preference saved, follow OS theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem('fh-theme')) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      } catch {}
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem('fh-theme', t)
    } catch {}
    setThemeState(t)
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
