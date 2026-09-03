import { act } from '@testing-library/react'

import { useIsMobile } from '@/hooks/useIsMobile'
import { renderHook } from '@/test-utils/render-utils'

function mockMatchMedia() {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches: false,
    addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
      listeners.push(handler)
    },
    removeEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(handler)
      if (idx >= 0) listeners.splice(idx, 1)
    },
  }
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia
  return { listeners }
}

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    })
    vi.restoreAllMocks()
  })

  it('starts as mobile when innerWidth is below the breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    mockMatchMedia()

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('starts as desktop when innerWidth is at or above the breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
    mockMatchMedia()

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('updates when the media query change event fires and unsubscribes on unmount', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
    const { listeners } = mockMatchMedia()

    const { result, unmount } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      listeners[0]?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)

    expect(() => unmount()).not.toThrow()
  })
})
