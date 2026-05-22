import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

// Minimal provider wrapper for component unit tests.
// AuthProvider is intentionally excluded — it fires a real HTTP refresh() on
// mount. Tests that need auth context should mock useAuth() directly.
function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Providers, ...options })
}

// Re-export RTL utilities so tests use a single import.
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
