import { useLayoutEffect } from 'react'

const STORAGE_KEY = 'dentalflow.theme'

/**
 * Forces light theme while the calling component is mounted.
 *
 * Uses queueMicrotask so the `dark` class removal fires after ALL useLayoutEffect
 * callbacks in the current React commit phase — including ThemeProvider's — which
 * runs later (parent after child) on initial mount. This prevents any dark flash on
 * both SPA navigation and direct URL access to public pages.
 *
 * On unmount (navigating back to /app), re-applies the saved preference directly so
 * ThemeProvider doesn't need to re-run its own effect.
 */
export function useForceLightTheme(): void {
  useLayoutEffect(() => {
    // Microtasks run after all synchronous layout effects but before browser paint.
    queueMicrotask(() => {
      document.documentElement.classList.remove('dark')
    })

    return () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        document.documentElement.classList.toggle('dark', saved === 'dark')
      } catch {
        // ignore
      }
    }
  }, [])
}
