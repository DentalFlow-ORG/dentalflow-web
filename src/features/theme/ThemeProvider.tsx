import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'dentalflow.theme'

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    // 'system' was a valid value in earlier versions — treat it as 'light'
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage unavailable (SSR or private browsing restriction)
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useLayoutEffect(() => {
    const isAppRoute = pathname.startsWith('/app')
    // queueMicrotask fires after ALL child useLayoutEffects (including useForceLightTheme),
    // making this the authoritative final rule on the dark class before each browser paint.
    // Public routes always get light; /app routes respect the user's saved preference.
    queueMicrotask(() => {
      if (isAppRoute) {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })
  }, [theme, pathname])

  function setTheme(mode: ThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore
    }
    setThemeState(mode)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
