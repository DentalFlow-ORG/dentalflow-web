import { renderHook } from '@/test-utils/render-utils'
import { useBlocker } from '@tanstack/react-router'

import { useUnsavedChangesGuard } from '@/features/clinical-records/hooks/useUnsavedChangesGuard'

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock the entire @tanstack/react-router module so useBlocker can be called
// without a router provider context in unit tests.
vi.mock('@tanstack/react-router', () => ({
  useBlocker: vi.fn(),
}))

const mockUseBlocker = vi.mocked(useBlocker)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    mockUseBlocker.mockClear()
  })

  // T1 ─────────────────────────────────────────────────────────────────────────

  it('does not add a beforeunload listener when isDirty is false', () => {
    const spy = vi.spyOn(window, 'addEventListener')

    renderHook(() => useUnsavedChangesGuard({ isDirty: false }))

    expect(spy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function))

    spy.mockRestore()
  })

  // T2 ─────────────────────────────────────────────────────────────────────────

  it('adds a beforeunload listener when isDirty is true', () => {
    const spy = vi.spyOn(window, 'addEventListener')

    renderHook(() => useUnsavedChangesGuard({ isDirty: true }))

    expect(spy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    spy.mockRestore()
  })

  // T3 ─────────────────────────────────────────────────────────────────────────

  it('removes the beforeunload listener when isDirty changes from true to false', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { rerender } = renderHook(
      ({ isDirty }: { isDirty: boolean }) => useUnsavedChangesGuard({ isDirty }),
      { initialProps: { isDirty: true } },
    )

    rerender({ isDirty: false })

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    removeSpy.mockRestore()
  })

  // T4 ─────────────────────────────────────────────────────────────────────────

  it('removes the beforeunload listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useUnsavedChangesGuard({ isDirty: true }))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    removeSpy.mockRestore()
  })

  // T5 ─────────────────────────────────────────────────────────────────────────

  it('beforeunload handler calls preventDefault and sets returnValue to empty string', () => {
    renderHook(() => useUnsavedChangesGuard({ isDirty: true }))

    // Dispatch a cancellable beforeunload event; the handler should prevent it
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  // T6 ─────────────────────────────────────────────────────────────────────────

  it('calls useBlocker with disabled=true when isDirty is false', () => {
    renderHook(() => useUnsavedChangesGuard({ isDirty: false }))

    expect(mockUseBlocker).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }))
  })

  // T7 ─────────────────────────────────────────────────────────────────────────

  it('calls useBlocker with disabled=false when isDirty is true', () => {
    renderHook(() => useUnsavedChangesGuard({ isDirty: true }))

    expect(mockUseBlocker).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }))
  })
})
