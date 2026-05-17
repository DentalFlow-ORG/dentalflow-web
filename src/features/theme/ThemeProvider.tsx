import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { ThemeContext, type ThemeMode } from './ThemeContext'

const STORAGE_KEY = 'dentalflow.theme'

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
