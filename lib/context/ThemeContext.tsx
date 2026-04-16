'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

export type ThemeMode = 'auto' | 'dark' | 'light'
export type Theme     = 'dark' | 'light'

interface ThemeContextValue {
  theme:        Theme      // resolved: what's actually applied
  themeMode:    ThemeMode  // user preference: auto | dark | light
  setThemeMode: (m: ThemeMode) => void
  // legacy compat
  setTheme:     (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:        'dark',
  themeMode:    'auto',
  setThemeMode: () => {},
  setTheme:     () => {},
})

function getAutoTheme(): Theme {
  const h = new Date().getHours()
  return h >= 6 && h < 20 ? 'light' : 'dark'
}

function applyToDOM(resolved: Theme) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto')
  const [theme,     setThemeState]     = useState<Theme>('dark')
  const modeRef = useRef<ThemeMode>('auto')

  // Initialize from localStorage + sync with DOM (anti-FOUC already applied class)
  useEffect(() => {
    let saved = localStorage.getItem('fh-theme-mode') as ThemeMode | null
    // Migrate old key
    if (!saved) {
      const old = localStorage.getItem('fh-theme')
      if (old === 'light' || old === 'dark') saved = old
    }
    const mode: ThemeMode = (saved === 'auto' || saved === 'dark' || saved === 'light') ? saved : 'auto'
    modeRef.current = mode
    setThemeModeState(mode)
    const resolved = mode === 'auto' ? getAutoTheme() : mode
    setThemeState(resolved)
    applyToDOM(resolved)

    // Re-check every minute for auto mode
    const iv = setInterval(() => {
      if (modeRef.current === 'auto') {
        const r = getAutoTheme()
        setThemeState(r)
        applyToDOM(r)
      }
    }, 60_000)
    return () => clearInterval(iv)
  }, [])

  function setThemeMode(mode: ThemeMode) {
    modeRef.current = mode
    setThemeModeState(mode)
    try { localStorage.setItem('fh-theme-mode', mode) } catch {}
    const resolved = mode === 'auto' ? getAutoTheme() : mode
    setThemeState(resolved)
    applyToDOM(resolved)
  }

  // Legacy: components still calling setTheme(dark|light) directly
  function setTheme(t: Theme) {
    setThemeMode(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
