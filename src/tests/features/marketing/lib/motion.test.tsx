import { act } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { staggerContainer, usePrefersReducedMotion } from '@/features/marketing/lib/motion'

describe('staggerContainer', () => {
  it('returns default stagger/delay values', () => {
    const variants = staggerContainer()
    expect(variants.hidden).toEqual({})
    expect(variants.show).toEqual({ transition: { staggerChildren: 0.08, delayChildren: 0 } })
  })

  it('accepts custom stagger and delay', () => {
    const variants = staggerContainer(0.2, 0.5)
    expect(variants.show).toEqual({ transition: { staggerChildren: 0.2, delayChildren: 0.5 } })
  })
})

describe('usePrefersReducedMotion', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns false when matchMedia is unavailable', () => {
    // @ts-expect-error - simulating an environment without matchMedia
    window.matchMedia = undefined
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('reflects the initial matches value', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the media query change event fires and unsubscribes on unmount', () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    const { result, unmount } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)

    act(() => {
      listeners[0]?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)

    expect(() => unmount()).not.toThrow()
  })
})
