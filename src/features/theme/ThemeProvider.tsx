import { useRouterState } from '@tanstack/react-router'
import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import { ThemeContext, type ThemeMode } from './ThemeContext'
import { subscribeBillingAccess } from './billing-theme-override'
import { shouldForceLightTheme } from './force-light-routes'

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
  // billingVersion increments when billing access resolves, causing the
  // useLayoutEffect below to re-evaluate shouldForceLightTheme mid-session.
  const [billingVersion, setBillingVersion] = useState(0)

  useEffect(() => {
    return subscribeBillingAccess(() => setBillingVersion((v) => v + 1))
  }, [])

  useLayoutEffect(() => {
    const shouldUseSavedTheme =
      billingVersion >= 0 && pathname.startsWith('/app') && !shouldForceLightTheme(pathname)
    // queueMicrotask fires after ALL child useLayoutEffects (including useForceLightTheme),
    // making this the authoritative final rule on the dark class before each browser paint.
    // Public/onboarding routes always get light; operational /app routes respect the saved preference.
    queueMicrotask(() => {
      if (shouldUseSavedTheme) {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })
  }, [theme, pathname, billingVersion])

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
