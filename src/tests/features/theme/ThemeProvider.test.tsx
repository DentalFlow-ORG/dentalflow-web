import { act } from '@testing-library/react'

import { render, renderHook, screen } from '@/test-utils/render-utils'

let mockPathname = '/app/pacientes'

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: mockPathname } }),
}))

import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { setBillingAccess } from '@/features/theme/billing-theme-override'
import { useTheme } from '@/features/theme/useTheme'

function Consumer() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        set-dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        set-light
      </button>
    </div>
  )
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockPathname = '/app/pacientes'
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setBillingAccess(null)
  })

  it('defaults to light theme when nothing is stored', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('reads a previously stored theme preference', () => {
    localStorage.setItem('dentalflow.theme', 'dark')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
  })

  it('treats a legacy "system" stored value as light', () => {
    localStorage.setItem('dentalflow.theme', 'system')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
  })

  it('applies the dark class on an /app route when theme is dark', async () => {
    localStorage.setItem('dentalflow.theme', 'dark')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    await flushMicrotasks()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not apply the dark class on a force-light public route', async () => {
    mockPathname = '/planos'
    localStorage.setItem('dentalflow.theme', 'dark')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    await flushMicrotasks()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists the theme to localStorage and updates the DOM when setTheme is called', async () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    await act(async () => {
      screen.getByRole('button', { name: 'set-dark' }).click()
      await Promise.resolve()
    })
    expect(localStorage.getItem('dentalflow.theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await act(async () => {
      screen.getByRole('button', { name: 'set-light' }).click()
      await Promise.resolve()
    })
    expect(localStorage.getItem('dentalflow.theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('does not crash when localStorage.getItem throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    expect(() =>
      render(
        <ThemeProvider>
          <Consumer />
        </ThemeProvider>,
      ),
    ).not.toThrow()
    Storage.prototype.getItem = original
  })

  it('does not crash when localStorage.setItem throws', async () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    await act(async () => {
      screen.getByRole('button', { name: 'set-dark' }).click()
      await Promise.resolve()
    })
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    Storage.prototype.setItem = original
  })

  it('re-evaluates the forced-light state when billing access resolves', async () => {
    mockPathname = '/app/assinatura'
    localStorage.setItem('dentalflow.theme', 'dark')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    await flushMicrotasks()
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await act(async () => {
      setBillingAccess(true)
      await Promise.resolve()
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

describe('useTheme via renderHook inside ThemeProvider', () => {
  it('exposes theme and setTheme through the provider', () => {
    mockPathname = '/app/pacientes'
    localStorage.clear()
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(result.current.theme).toBe('light')
    expect(typeof result.current.setTheme).toBe('function')
  })
})
