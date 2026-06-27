import { GlobalAlertsProvider } from '@/components/common/GlobalAlerts'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { act, fireEvent, render, renderHook, screen } from '@/test-utils/render-utils'
import type { ReactNode } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <GlobalAlertsProvider>{children}</GlobalAlertsProvider>
)

// Small consumer used by the close-button test to trigger showAlert from within
// the tree, without pulling in userEvent (which has known issues with fake timers).
function ShowAlertButton({ title }: { title: string }) {
  const { showAlert } = useGlobalAlerts()
  return (
    <button type="button" onClick={() => showAlert({ title, durationMs: 0 })}>
      Show Alert
    </button>
  )
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

// ── GlobalAlertsProvider ──────────────────────────────────────────────────────

describe('GlobalAlertsProvider', () => {
  it('renders no alerts on initial mount', () => {
    renderHook(() => useGlobalAlerts(), { wrapper })
    expect(screen.queryAllByRole('status')).toHaveLength(0)
  })

  it('showAlert renders an alert with the given title', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({ title: 'Profile saved', durationMs: 0 })
    })
    expect(screen.getByText('Profile saved')).toBeInTheDocument()
  })

  it('showAlert with a description renders both title and description', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({
        title: 'Success',
        description: 'Your changes were saved.',
        durationMs: 0,
      })
    })
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()
  })

  it('renders alerts for all four supported tones without errors', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({ title: 'Success alert', tone: 'success', durationMs: 0 })
      result.current.showAlert({ title: 'Error alert', tone: 'error', durationMs: 0 })
      result.current.showAlert({ title: 'Warning alert', tone: 'warning', durationMs: 0 })
      result.current.showAlert({ title: 'Info alert', tone: 'info', durationMs: 0 })
    })
    expect(screen.queryAllByRole('status')).toHaveLength(3)
    expect(screen.queryAllByRole('alert')).toHaveLength(1)
    expect(screen.getByText('Success alert')).toBeInTheDocument()
    expect(screen.getByText('Error alert')).toBeInTheDocument()
    expect(screen.getByText('Warning alert')).toBeInTheDocument()
    expect(screen.getByText('Info alert')).toBeInTheDocument()
  })

  it('dismissAlert removes the specific alert by id', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    let id = ''
    act(() => {
      id = result.current.showAlert({ title: 'To be dismissed', durationMs: 0 })
    })
    expect(screen.getByText('To be dismissed')).toBeInTheDocument()
    act(() => {
      result.current.dismissAlert(id)
    })
    expect(screen.queryByText('To be dismissed')).not.toBeInTheDocument()
  })

  it('clicking the close button dismisses the alert', () => {
    render(
      <GlobalAlertsProvider>
        <ShowAlertButton title="Alert to close" />
      </GlobalAlertsProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Alert' }))
    expect(screen.getByText('Alert to close')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar alerta' }))
    expect(screen.queryByText('Alert to close')).not.toBeInTheDocument()
  })

  it('auto-dismisses the alert after durationMs elapses', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({ title: 'Temporary', durationMs: 3000 })
    })
    expect(screen.getByText('Temporary')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
  })

  it('does not auto-dismiss when durationMs is 0', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({ title: 'Persistent', durationMs: 0 })
    })
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByText('Persistent')).toBeInTheDocument()
  })

  it('stacks multiple alerts when showAlert is called more than once', () => {
    const { result } = renderHook(() => useGlobalAlerts(), { wrapper })
    act(() => {
      result.current.showAlert({ title: 'First alert', durationMs: 0 })
      result.current.showAlert({ title: 'Second alert', durationMs: 0 })
      result.current.showAlert({ title: 'Third alert', durationMs: 0 })
    })
    expect(screen.queryAllByRole('status')).toHaveLength(3)
    expect(screen.getByText('First alert')).toBeInTheDocument()
    expect(screen.getByText('Second alert')).toBeInTheDocument()
    expect(screen.getByText('Third alert')).toBeInTheDocument()
  })
})

// ── useGlobalAlerts ───────────────────────────────────────────────────────────

describe('useGlobalAlerts', () => {
  it('throws when used outside GlobalAlertsProvider', () => {
    // React 18 logs to console.error before propagating the render error — suppress it.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => renderHook(() => useGlobalAlerts())).toThrow(
        'useGlobalAlerts must be used inside GlobalAlertsProvider',
      )
    } finally {
      consoleError.mockRestore()
    }
  })
})
