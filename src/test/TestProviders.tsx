import type { ReactNode } from 'react'

// Minimal provider wrapper for component unit tests.
// AuthProvider is intentionally excluded — it fires a real HTTP refresh() on
// mount. Tests that need auth context should mock useAuth() directly.
export function TestProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}
